
from fastapi import Response

from app.core.config import settings


_COOKIE_SAMESITE = "none" if settings.IS_PROD else "lax"


_COOKIE_ATTRS = {
    "httponly": True,
    "secure": settings.COOKIE_SECURE,
    "samesite": _COOKIE_SAMESITE,
    "path": "/",
}


def set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    response.set_cookie(
        key=settings.ACCESS_COOKIE_NAME,
        value=access_token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        **_COOKIE_ATTRS,
    )
    response.set_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        value=refresh_token,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        **_COOKIE_ATTRS,
    )


def clear_auth_cookies(response: Response) -> None:
    for name in (settings.ACCESS_COOKIE_NAME, settings.REFRESH_COOKIE_NAME):
        response.delete_cookie(key=name, **_COOKIE_ATTRS)