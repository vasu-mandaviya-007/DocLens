
import logging

import httpx
from authlib.integrations.starlette_client import OAuth
from fastapi import APIRouter, Request

from app.core.config import settings
from app.services.account.oauth_service import complete_oauth_login, error_redirect

router = APIRouter()
logger = logging.getLogger("uvicorn.error")

GITHUB_API = "https://api.github.com"

oauth = OAuth()
oauth.register(
    name="github",
    client_id=settings.GITHUB_CLIENT_ID,
    client_secret=settings.GITHUB_CLIENT_SECRET,
    access_token_url="https://github.com/login/oauth/access_token",
    authorize_url="https://github.com/login/oauth/authorize",
    api_base_url=f"{GITHUB_API}/",
    client_kwargs={"scope": "read:user user:email"},
)


async def _fetch_github_user(access_token: str) -> tuple[dict, list[dict]]:
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/vnd.github+json",
    }
    async with httpx.AsyncClient(headers=headers, timeout=10) as client:
        profile_resp = await client.get(f"{GITHUB_API}/user")
        emails_resp = await client.get(f"{GITHUB_API}/user/emails")

    profile_resp.raise_for_status()
    emails_resp.raise_for_status()
    return profile_resp.json(), emails_resp.json()


@router.get("/github")
async def github_login(request: Request):
    return await oauth.github.authorize_redirect(request, settings.GITHUB_REDIRECT_URI)


@router.get("/github/callback")
async def github_callback(request: Request):
    try:
        token = await oauth.github.authorize_access_token(request)
        profile, emails = await _fetch_github_user(token["access_token"])

        primary_email = next(
            (e["email"] for e in emails if e.get("primary") and e.get("verified")),
            None,
        )
        if not primary_email:
            return error_redirect("no_verified_email")

        return await complete_oauth_login(
            provider="github",
            provider_id=str(profile["id"]),
            email=primary_email,
            name=profile.get("name") or profile.get("login") or primary_email.split("@")[0],
            avatar=profile.get("avatar_url"),
        )
    except Exception:
        logger.exception("GitHub OAuth callback failed")
        return error_redirect("github_auth_failed")