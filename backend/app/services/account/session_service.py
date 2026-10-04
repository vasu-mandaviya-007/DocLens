"""app/services/account/session_service.py"""

from fastapi import Response

from app.core.security import (
    create_access_token,
    generate_refresh_token,
    hash_refresh_token,
    refresh_token_expiry,
)
from app.models.user import RefreshToken, User
from app.utils.cookie_utils import set_auth_cookies


async def start_session(response: Response, user: User) -> None:
    """Access + refresh token banata hai, refresh token DB me save karta hai, cookies set karta hai.
    Email login, verify-email, refresh aur OAuth sab yahi use karte hain."""
    raw_refresh = generate_refresh_token()
    await RefreshToken(
        user_id=user.id,
        token_hash=hash_refresh_token(raw_refresh),
        expires_at=refresh_token_expiry(),
    ).insert()
    set_auth_cookies(response, create_access_token(str(user.id)), raw_refresh)