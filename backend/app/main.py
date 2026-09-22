
# from fastapi import FastAPI, Request
# from fastapi.responses import JSONResponse
# from app.routes import auth
# from app.routes import google_auth
# from app.routes import github_auth
# from app.routes import notebooks
# from app.routes import documents
# from app.routes import chat
# from fastapi.middleware.cors import CORSMiddleware
# from contextlib import asynccontextmanager 
# from app.core.db import connect_to_mongo, close_mongo_connection
# from fastapi.exceptions import RequestValidationError
# from app.core.exceptions import (
#     AppException,
# )
# from starlette.middleware.sessions import SessionMiddleware
# from app.core.config import settings
# from app.core  import cloudinary_config
# from app.services.logger import setup_logging 
# import logging

# # logger = logging.getLogger("uvicorn.error")


# # 1. App start hone se pehle logging setup call karein
# setup_logging()

# # 2. Is file ka apna logger instance banayein
# logger = logging.getLogger(__name__)


# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     await connect_to_mongo()
#     yield
#     await close_mongo_connection()


# app = FastAPI(title="Document Q&A API", lifespan=lifespan)

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173","https://doc-lens-beta.vercel.app"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# app.add_middleware(SessionMiddleware, secret_key=settings.JWT_SECRET_KEY)
 
# @app.exception_handler(RequestValidationError)
# async def validation_exception_handler(request: Request, exc: RequestValidationError):
#     """Pydantic ki automatic validation errors (missing field, bad email, etc.)"""
#     fields = {}
#     for err in exc.errors():
#         # loc example: ('body', 'password') ya ('body', 'file') for form data
#         loc = err["loc"]
#         field = loc[-1] if len(loc) > 0 else "unknown"
#         msg = err["msg"]
#         if msg.startswith("Value error, "):
#             msg = msg.replace("Value error, ", "")
#         fields[str(field)] = msg
 
#     return JSONResponse(
#         status_code=422,
#         content={
#             "success": False, 
#             "error": {
#                 "code": "VALIDATION_ERROR",
#                 "message": "Please fix the highlighted fields",
#                 "fields": fields,
#             },
#         },
#     )
 
 
# @app.exception_handler(AppException)
# async def app_exception_handler(request: Request, exc: AppException):
#     """Hamari khud ki business-logic exceptions (AppException aur uske children)"""
#     return JSONResponse(
#         status_code=exc.status_code,
#         content={
#             "success": False,
#             "error": {
#                 "code": exc.code,
#                 "message": exc.message,
#                 "fields": exc.fields,
#             },
#         },
#     )
 
 
# @app.exception_handler(Exception)
# async def generic_exception_handler(request: Request, exc: Exception):
#     """Fallback — kuch bhi unexpected crash ho jaye to bhi consistent shape mile.
#     IMPORTANT: actual exception kabhi bhi frontend ko mat bhejo (security risk),
#     sirf server logs me daalo."""
#     logger.exception("Unhandled server error")
#     return JSONResponse(
#         status_code=500,
#         content={
#             "success": False,
#             "error": {
#                 "code": "INTERNAL_ERROR",
#                 "message": "Something went wrong. Please try again.",
#                 "fields": None,
#             },
#         },
#     )
 

# # app.include_router(auth.router)
# # app.include_router(upload.router)
# app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
# app.include_router(google_auth.router, prefix="/api/auth", tags=["auth"]) 
# app.include_router(github_auth.router, prefix="/api/auth", tags=["auth"]) 
# app.include_router(notebooks.router, prefix="/api", tags=["notebooks"])
# app.include_router(documents.router, prefix="/api", tags=["documents"])
# app.include_router(chat.router, prefix="/api", tags=["chat"])
























import logging
import time
import uuid

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.middleware.sessions import SessionMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager

from app.routes import auth, google_auth, github_auth, notebooks, documents, chat
from app.core.db import connect_to_mongo, close_mongo_connection
from app.core.exceptions import AppException
from app.core.config import settings
from app.core import cloudinary_config
from app.services.logger import setup_logging

setup_logging()
logger = logging.getLogger(__name__)

IS_PROD = settings.ENV == "production"

# Retry connect_to_mongo with backoff — cold-start / transient network issues
# on the DB side shouldn't take the whole app down on a single failed attempt.
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
                "Mongo connection attempt %s/%s failed: %s",
                attempt, MONGO_CONNECT_RETRIES, e,
            )
            if attempt < MONGO_CONNECT_RETRIES:
                time.sleep(MONGO_CONNECT_BACKOFF_SECONDS * attempt)

    if last_error is not None:
        logger.error("Could not connect to Mongo after %s attempts", MONGO_CONNECT_RETRIES)
        raise last_error

    yield
    await close_mongo_connection()


app = FastAPI(
    title="Document Q&A API",
    version="1.0.0",
    lifespan=lifespan,
    # Swagger/OpenAPI shouldn't be publicly discoverable in production —
    # it exposes the entire route/schema surface to anyone.
    docs_url=None if IS_PROD else "/docs",
    redoc_url=None if IS_PROD else "/redoc",
    openapi_url=None if IS_PROD else "/openapi.json",
)

# ── Request ID middleware ───────────────────────────────────────────────
# Every request gets a correlation id, attached to request.state and echoed
# back in the response header, so a single log line can be traced across
# the whole request lifecycle when debugging production issues.
@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response


# ── Security / infra middleware ─────────────────────────────────────────
# ALLOWED_HOSTS / ALLOWED_ORIGINS must be added to app/core/config.py's
# settings object — see notes at the bottom of this file.
app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.ALLOWED_HOSTS)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# Session secret must be independent from JWT_SECRET_KEY — reusing one
# secret for two different signing purposes widens the blast radius if
# either is ever leaked.
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SESSION_SECRET_KEY,
    https_only=IS_PROD,
    same_site="none" if IS_PROD else "lax",
)


# ── Exception handlers ───────────────────────────────────────────────────
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Pydantic's automatic validation errors (missing field, bad email, etc.)"""
    fields = {}
    for err in exc.errors():
        loc = err["loc"]
        field = loc[-1] if len(loc) > 0 else "unknown"
        msg = err["msg"]
        if msg.startswith("Value error, "):
            msg = msg.replace("Value error, ", "")
        fields[str(field)] = msg

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
    """Our own business-logic exceptions (AppException and its children)."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.code,
                "message": exc.message,
                "fields": exc.fields,
            },
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """Fallback — any unexpected crash still returns a consistent shape.
    IMPORTANT: the actual exception is never sent to the frontend (security
    risk), only logged server-side, tagged with the request id."""
    request_id = getattr(request.state, "request_id", None)
    logger.exception("Unhandled server error [request_id=%s]", request_id)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "Something went wrong. Please try again.",
                "fields": None,
            },
        },
    )


# ── Health check ─────────────────────────────────────────────────────────
@app.get("/health", tags=["health"])
async def health_check():
    """Used by the deploy platform's load balancer / readiness probe."""
    return {"status": "ok"}


# ── Routers ───────────────────────────────────────────────────────────────
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(google_auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(github_auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(notebooks.router, prefix="/api", tags=["notebooks"])
app.include_router(documents.router, prefix="/api", tags=["documents"])
app.include_router(chat.router, prefix="/api", tags=["chat"])