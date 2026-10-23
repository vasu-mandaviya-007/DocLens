
import asyncio
import logging
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from starlette.middleware.sessions import SessionMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

from app.core.config import settings
from app.core.db import close_mongo_connection, connect_to_mongo
from app.core.exceptions import AppException
from app.core.rate_limit import limiter
from app.routes import auth, chat, documents, github_auth, google_auth, notebooks
from app.services.logger import setup_logging

setup_logging()
logger = logging.getLogger(__name__)

IS_PROD = settings.ENV == "production"

MONGO_CONNECT_RETRIES = 3
MONGO_CONNECT_BACKOFF_SECONDS = 2


@asynccontextmanager
async def lifespan(app: FastAPI):
    last_error = None
    for attempt in range(1, MONGO_CONNECT_RETRIES + 1):
        try:
            await connect_to_mongo()
            last_error = None
            break
        except Exception as e:
            last_error = e
            logger.warning(
                "Mongo connection attempt %s/%s failed: %s", attempt, MONGO_CONNECT_RETRIES, e
            )
            if attempt < MONGO_CONNECT_RETRIES:
                await asyncio.sleep(MONGO_CONNECT_BACKOFF_SECONDS * attempt)

    if last_error is not None:
        logger.error("Could not connect to Mongo after %s attempts", MONGO_CONNECT_RETRIES)
        raise last_error

    yield
    await close_mongo_connection()


app = FastAPI(
    title="Document Q&A API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url=None if IS_PROD else "/docs",
    redoc_url=None if IS_PROD else "/redoc",
    openapi_url=None if IS_PROD else "/openapi.json",
)


app.state.limiter = limiter  


def _internal_error_response(request_id: str | None) -> JSONResponse:

    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "Something went wrong. Please try again.",
                "fields": None,
                "request_id": request_id,
            },
        },
    )



@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    try:
        response = await call_next(request)
    except Exception:
        logger.exception("Unhandled server error [request_id=%s]", request_id)
        response = _internal_error_response(request_id)
    response.headers["X-Request-ID"] = request_id
    return response


app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.ALLOWED_HOSTS)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
    expose_headers=["X-Request-ID"],  
)

app.add_middleware(GZipMiddleware, minimum_size=1000)


app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SESSION_SECRET_KEY,
    https_only=IS_PROD,
    same_site="none" if IS_PROD else "lax",
)


# ── Exception handlers ───────────────────────────────────────────────────
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    fields = {}
    for err in exc.errors():
        loc = err["loc"]
        field = loc[-1] if loc else "unknown"
        fields[str(field)] = err["msg"].removeprefix("Value error, ")

    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Please fix the highlighted fields",
                "fields": fields,
            },
        },
    )


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {"code": exc.code, "message": exc.message, "fields": exc.fields},
        },
    )


@app.exception_handler(RateLimitExceeded)
async def rate_limit_exception_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={
            "success": False,
            "error": {
                "code": "RATE_LIMIT_EXCEEDED",
                "message": "Too many requests. Please wait a moment and try again.",
                "fields": None,
            },
        },
        headers={"Retry-After": "60"},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, "request_id", None)
    logger.exception("Unhandled server error [request_id=%s]", request_id)
    return _internal_error_response(request_id)


# ── Health check ─────────────────────────────────────────────────────────
@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok"}


# ── Routers ───────────────────────────────────────────────────────────────
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(google_auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(github_auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(notebooks.router, prefix="/api", tags=["notebooks"])
app.include_router(documents.router, prefix="/api", tags=["documents"])
app.include_router(chat.router, prefix="/api", tags=["chat"])