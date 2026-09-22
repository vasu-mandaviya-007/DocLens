from fastapi import APIRouter, Request, Response
from authlib.integrations.starlette_client import OAuth
from app.core.config import settings
from app.core.exceptions import ServiceUnavailableError
from fastapi.responses import RedirectResponse
from app.models.User import User, LinkedProvider
from app.routes.auth import _issue_token_and_set_cookies

router = APIRouter()

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
    redirect_uri = settings.GOOGLE_REDIRECT_URI
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback")
async def google_callback(request: Request):
    try:

        token = await oauth.google.authorize_access_token(request)
        user_info = token.get("userinfo")

        if not user_info:
            return RedirectResponse(
                f"{settings.FRONTEND_URL}/login?error=google_auth_failed"
            )

        email = user_info["email"]
        name = user_info.get("name", email.split("@")[0])
        google_id = user_info["sub"]
        avatar = user_info["picture"]

        user = await User.find_one(User.email == email)

        if not user:
            user = User(
                username=name,
                email=email,
                linked_providers=[
                    LinkedProvider(provider="google", provider_id=google_id)
                ],
                avatar=avatar,
                is_verified=True,
            )
            await user.insert()
        else:

            already_linked = any(p.provider == "google" for p in user.linked_providers)

            if not already_linked:

                if avatar and user.avatar is None:
                    user.avatar = avatar

                user.linked_providers.append(
                    LinkedProvider(provider="google", provider_id=google_id)
                )
                user.is_verified = True
                await user.save()

        redirect_response = RedirectResponse(url=settings.FRONTEND_URL)
        await _issue_token_and_set_cookies(redirect_response, user)

        return redirect_response

    except Exception as e:
        print(e)
        raise ServiceUnavailableError(message="Service not available")
