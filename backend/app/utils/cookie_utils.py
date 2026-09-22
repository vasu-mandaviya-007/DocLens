# from fastapi import Response
# from app.core.config import settings

# def set_auth_cookies(response : Response, access_token : str, refresh_token : str) : 
#     response.set_cookie(
#         key="access_token",
#         value=access_token, 
#         httponly=True,
#         secure=settings.COOKIE_SECURE,
#         samesite="lax",
#         max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60, 
#         path="/",
#     ) 
 
#     response.set_cookie(
#         key="refresh_token", 
#         value=refresh_token,
#         httponly=True,
#         secure=settings.COOKIE_SECURE,
#         samesite="lax",
#         max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
#         path="/"
#     )







from fastapi import Response
from app.core.config import settings

# SameSite=None is required for a cross-domain setup (frontend on Vercel,
# backend on Render) — otherwise the browser attaches the cookie on the
# initial OAuth redirect but drops it on every subsequent fetch/XHR call,
# which is exactly the "login succeeds, then bounces back to login" symptom.
# SameSite=None is only valid together with Secure=True, so both are tied to
# the same IS_PROD flag rather than set independently.
_COOKIE_SAMESITE = "none" if settings.IS_PROD else "lax"


def set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=_COOKIE_SAMESITE,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=_COOKIE_SAMESITE,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/",
    )