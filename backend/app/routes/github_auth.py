from app.core.config import settings
from authlib.integrations.starlette_client import OAuth
from fastapi import APIRouter, Request, Response
from fastapi.responses import RedirectResponse
from app.core.exceptions import ServiceUnavailableError
from app.models.User import User, LinkedProvider
import httpx
from app.routes.auth import _issue_token_and_set_cookies

router = APIRouter()

oauth = OAuth()
oauth.register(
    name="github",
    client_id=settings.GITHUB_CLIENT_ID,
    client_secret=settings.GITHUB_CLIENT_SECRET,
    access_token_url="https://github.com/login/oauth/access_token",
    authorize_url="https://github.com/login/oauth/authorize",
    api_base_url="https://api.github.com/",
    client_kwargs={"scope": "read:user user:email"},
)


@router.get("/github")
async def github_login(request: Request):
    redirect_uri = settings.GITHUB_REDIRECT_URI
    return await oauth.github.authorize_redirect(request, redirect_uri)


@router.get("/github/callback")
async def github_callback(request: Request):
    try:
        token = await oauth.github.authorize_access_token(request)

        async with httpx.AsyncClient() as client:
            # Profile info (name, github id)
            profile_resp = await client.get(
                "https://api.github.com/user",
                headers={"Authorization": f"Bearer {token['access_token']}"},
            )
            profile = profile_resp.json()

            # Email alag call se lena padta he — GitHub profile me hamesha nahi hota
            email_resp = await client.get(
                "https://api.github.com/user/emails",
                headers={"Authorization": f"Bearer {token['access_token']}"},
            )
            emails = email_resp.json()

        # Primary aur verified email dhoondo
        primary_email = next(
            (e["email"] for e in emails if e.get("primary") and e.get("verified")),
            None,
        )

        if not primary_email:
            return RedirectResponse(
                f"{settings.FRONTEND_URL}/login?error=no_verified_email"
            )

        github_id = str(profile["id"])
        name = profile.get("name") or profile.get("login")

        user = await User.find_one(User.email == primary_email)

        if not user:
            user = User(
                username=name,
                email=primary_email,
                linked_providers=[
                    LinkedProvider(provider="github", provider_id=github_id)
                ],
            )
            await user.insert()
        else:
            already_linked = any(p.provider == "github" for p in user.linked_providers)
            if not already_linked:
                user.linked_providers.append(
                    LinkedProvider(provider="github", provider_id=github_id)
                )
                user.is_verified = True
                await user.save()

        redirect_response = RedirectResponse(url=settings.FRONTEND_URL)
        await _issue_token_and_set_cookies(redirect_response, user)

        return redirect_response

    except Exception as e:
        print(e)
        raise ServiceUnavailableError(message="Service not available")
