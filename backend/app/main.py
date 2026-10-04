
# import logging
# import time
# import uuid

# from fastapi import FastAPI, Request
# from fastapi.responses import JSONResponse
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.middleware.gzip import GZipMiddleware
# from fastapi.exceptions import RequestValidationError
# from starlette.middleware.sessions import SessionMiddleware
# from starlette.middleware.trustedhost import TrustedHostMiddleware
# from contextlib import asynccontextmanager

# from app.routes import auth, google_auth, github_auth, notebooks, documents, chat
# from app.core.db import connect_to_mongo, close_mongo_connection
# from app.core.exceptions import AppException
# from app.core.config import settings
# from app.core import cloudinary_config
# from app.services.logger import setup_logging

# setup_logging()
# logger = logging.getLogger(__name__)

# IS_PROD = settings.ENV == "production"

# # Retry connect_to_mongo with backoff — cold-start / transient network issues
# # on the DB side shouldn't take the whole app down on a single failed attempt.
# MONGO_CONNECT_RETRIES = 3
# MONGO_CONNECT_BACKOFF_SECONDS = 2


# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     last_error = None
#     for attempt in range(1, MONGO_CONNECT_RETRIES + 1):
#         try:
#             await connect_to_mongo()
#             last_error = None
#             break
#         except Exception as e:
#             last_error = e
#             logger.warning(
#                 "Mongo connection attempt %s/%s failed: %s",
#                 attempt, MONGO_CONNECT_RETRIES, e,
#             )
#             if attempt < MONGO_CONNECT_RETRIES:
#                 time.sleep(MONGO_CONNECT_BACKOFF_SECONDS * attempt)

#     if last_error is not None:
#         logger.error("Could not connect to Mongo after %s attempts", MONGO_CONNECT_RETRIES)
#         raise last_error

#     yield
#     await close_mongo_connection()


# app = FastAPI(
#     title="Document Q&A API",
#     version="1.0.0",
#     lifespan=lifespan,
#     # Swagger/OpenAPI shouldn't be publicly discoverable in production —
#     # it exposes the entire route/schema surface to anyone.
#     docs_url=None if IS_PROD else "/docs",
#     redoc_url=None if IS_PROD else "/redoc",
#     openapi_url=None if IS_PROD else "/openapi.json",
# )

# # ── Request ID middleware ───────────────────────────────────────────────
# # Every request gets a correlation id, attached to request.state and echoed
# # back in the response header, so a single log line can be traced across
# # the whole request lifecycle when debugging production issues.
# @app.middleware("http")
# async def request_id_middleware(request: Request, call_next):
#     request_id = str(uuid.uuid4())
#     request.state.request_id = request_id
#     response = await call_next(request)
#     response.headers["X-Request-ID"] = request_id
#     return response


# # ── Security / infra middleware ─────────────────────────────────────────
# # ALLOWED_HOSTS / ALLOWED_ORIGINS must be added to app/core/config.py's
# # settings object — see notes at the bottom of this file.
# app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.ALLOWED_HOSTS)

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=settings.ALLOWED_ORIGINS,
#     allow_credentials=True,
#     allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
#     allow_headers=["Authorization", "Content-Type"],
# )

# app.add_middleware(GZipMiddleware, minimum_size=1000)

# # Session secret must be independent from JWT_SECRET_KEY — reusing one
# # secret for two different signing purposes widens the blast radius if
# # either is ever leaked.
# app.add_middleware(
#     SessionMiddleware,
#     secret_key=settings.SESSION_SECRET_KEY,
#     https_only=IS_PROD,
#     same_site="none" if IS_PROD else "lax",
# )


# # ── Exception handlers ───────────────────────────────────────────────────
# @app.exception_handler(RequestValidationError)
# async def validation_exception_handler(request: Request, exc: RequestValidationError):
#     """Pydantic's automatic validation errors (missing field, bad email, etc.)"""
#     fields = {}
#     for err in exc.errors():
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
#     """Our own business-logic exceptions (AppException and its children)."""
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
#     """Fallback — any unexpected crash still returns a consistent shape.
#     IMPORTANT: the actual exception is never sent to the frontend (security
#     risk), only logged server-side, tagged with the request id."""
#     request_id = getattr(request.state, "request_id", None)
#     logger.exception("Unhandled server error [request_id=%s]", request_id)
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


# # ── Health check ─────────────────────────────────────────────────────────
# @app.get("/health", tags=["health"])
# async def health_check():
#     """Used by the deploy platform's load balancer / readiness probe."""
#     return {"status": "ok"}
 

# # ── Routers ───────────────────────────────────────────────────────────────
# app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
# app.include_router(google_auth.router, prefix="/api/auth", tags=["auth"])
# app.include_router(github_auth.router, prefix="/api/auth", tags=["auth"])
# app.include_router(notebooks.router, prefix="/api", tags=["notebooks"])
# app.include_router(documents.router, prefix="/api", tags=["documents"])
# app.include_router(chat.router, prefix="/api", tags=["chat"])




























"""app/main.py"""

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

from app.core import cloudinary_config  # noqa: F401  (import hote hi cloudinary configure hota hai)
from app.core.config import settings
from app.core.db import close_mongo_connection, connect_to_mongo
from app.core.exceptions import AppException
from app.core.rate_limit import limiter
from app.routes import auth, chat, documents, github_auth, google_auth, notebooks
from app.services.logger import setup_logging

setup_logging()
logger = logging.getLogger(__name__)

IS_PROD = settings.ENV == "production"

# Cold-start / transient network issue pe ek failed attempt se poori app band na ho
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
                # time.sleep event loop ko block karta tha, asyncio.sleep nahi
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
    # Production me Swagger/OpenAPI public nahi hona chahiye: poori route/schema surface dikhti hai
    docs_url=None if IS_PROD else "/docs",
    redoc_url=None if IS_PROD else "/redoc",
    openapi_url=None if IS_PROD else "/openapi.json",
)


app.state.limiter = limiter  # slowapi limiter ko app.state se hi dhoondhta hai


def _internal_error_response(request_id: str | None) -> JSONResponse:
    """Ek hi jagah 500 ka shape. Asli exception frontend ko kabhi nahi jati (security),
    sirf request_id jati hai taaki logs me dhoondha ja sake."""
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


# ── Request ID middleware ───────────────────────────────────────────────
# Har request ko ek correlation id milti hai (request.state + response header).
# Unhandled exception yahin pakadte hain: ye middleware CORS ke *andar* hai, to 500 response
# pe bhi CORS headers lagte hain. Warna browser asli error ki jagah sirf "CORS blocked" dikhata hai.
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


# ── Security / infra middleware ─────────────────────────────────────────
# Order maayne rakhta hai: baad me add hua middleware bahar rehta hai.
app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.ALLOWED_HOSTS)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
    expose_headers=["X-Request-ID"],  # frontend request id padh sake (support/debug ke liye)
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# Session secret JWT secret se alag hona chahiye: ek leak ho to dono signing purpose na khulein
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SESSION_SECRET_KEY,
    https_only=IS_PROD,
    same_site="none" if IS_PROD else "lax",
)


# ── Exception handlers ───────────────────────────────────────────────────
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Pydantic ke automatic validation errors (missing field, bad email, ...)."""
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
    """Hamare apne business-logic exceptions (AppException aur uske children)."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {"code": exc.code, "message": exc.message, "fields": exc.fields},
        },
    )


@app.exception_handler(RateLimitExceeded)
async def rate_limit_exception_handler(request: Request, exc: RateLimitExceeded):
    """IP-based rate limit (slowapi): baaki errors jaisa hi shape, taaki frontend ek hi tarah parse kare."""
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
    """Last-resort fallback (middleware ke bahar jo crash ho). Normal case me upar wala
    request_id_middleware pehle hi pakad leta hai."""
    request_id = getattr(request.state, "request_id", None)
    logger.exception("Unhandled server error [request_id=%s]", request_id)
    return _internal_error_response(request_id)


# ── Health check ─────────────────────────────────────────────────────────
@app.get("/health", tags=["health"])
async def health_check():
    """Deploy platform ke load balancer / readiness probe ke liye."""
    return {"status": "ok"}


# ── Routers ───────────────────────────────────────────────────────────────
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(google_auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(github_auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(notebooks.router, prefix="/api", tags=["notebooks"])
app.include_router(documents.router, prefix="/api", tags=["documents"])
app.include_router(chat.router, prefix="/api", tags=["chat"])