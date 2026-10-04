"""app/services/account/oauth_service.py — Google aur GitHub ka common logic ek jagah."""

from fastapi.responses import RedirectResponse

from app.core.config import settings
from app.models.user import LinkedProvider, User
from app.services.account.session_service import start_session


def error_redirect(code: str) -> RedirectResponse:
    return RedirectResponse(f"{settings.FRONTEND_URL}/login?error={code}")


async def get_or_create_oauth_user(
    *, provider: str, provider_id: str, email: str, name: str, avatar: str | None = None
) -> User:
    link = LinkedProvider(provider=provider, provider_id=provider_id)
    user = await User.find_one(User.email == email)

    if not user:
        user = User(
            username=name,
            email=email,
            avatar=avatar,
            is_verified=True,  # provider ne email verify kar rakha hai
            linked_providers=[link],
        )
        await user.insert()
        return user

    if any(p.provider == provider for p in user.linked_providers):
        return user

    # Pehle se bana account: provider link karo.
    # Agar wo account kabhi verify nahi hua tha, to signup karne wale ne hi (shayad kisi aur ne)
    # password set kiya ho sakta hai. Password hata do, warna wo is email ke account me ghus sakta hai.
    if not user.is_verified:
        user.password = None

    user.linked_providers.append(link)
    user.is_verified = True
    if avatar and not user.avatar:
        user.avatar = avatar
    await user.save()
    return user


async def complete_oauth_login(
    *, provider: str, provider_id: str, email: str, name: str, avatar: str | None = None
) -> RedirectResponse:
    user = await get_or_create_oauth_user(
        provider=provider, provider_id=provider_id, email=email, name=name, avatar=avatar
    )

    if not user.is_active:  # normal login me ye check hai, OAuth me bhi hona chahiye
        return error_redirect("account_deactivated")

    response = RedirectResponse(url=settings.FRONTEND_URL)
    await start_session(response, user)
    return response