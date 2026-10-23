
import logging

from authlib.integrations.starlette_client import OAuth
from fastapi import APIRouter, Request

from app.core.config import settings
from app.services.account.oauth_service import complete_oauth_login, error_redirect

router = APIRouter()
logger = logging.getLogger("uvicorn.error")

oauth = OAuth()
oauth.register(
    name="google",
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)


@router.get("/google")
async def google_login(request: Request):
    return await oauth.google.authorize_redirect(request, settings.GOOGLE_REDIRECT_URI)


@router.get("/google/callback")
async def google_callback(request: Request):
    try:
        token = await oauth.google.authorize_access_token(request)
        info = token.get("userinfo")

        if not info or not info.get("email_verified"):
            return error_redirect("google_auth_failed")

        email = info["email"]
        return await complete_oauth_login(
            provider="google",
            provider_id=info["sub"],
            email=email,
            name=info.get("name") or email.split("@")[0],
            avatar=info.get("picture"),
        )
    except Exception:
        logger.exception("Google OAuth callback failed")
        return error_redirect("google_auth_failed")