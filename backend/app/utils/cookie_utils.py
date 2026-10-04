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







# from fastapi import Response
# from app.core.config import settings 

# # SameSite=None is required for a cross-domain setup (frontend on Vercel,
# # backend on Render) — otherwise the browser attaches the cookie on the
# # initial OAuth redirect but drops it on every subsequent fetch/XHR call,
# # which is exactly the "login succeeds, then bounces back to login" symptom.
# # SameSite=None is only valid together with Secure=True, so both are tied to
# # the same IS_PROD flag rather than set independently.
# _COOKIE_SAMESITE = "none" if settings.IS_PROD else "lax"


# def set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
#     response.set_cookie(
#         key="access_token",
#         value=access_token,
#         httponly=True,
#         secure=settings.COOKIE_SECURE,
#         samesite=_COOKIE_SAMESITE,
#         max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
#         path="/",
#     )

#     response.set_cookie(
#         key="refresh_token",
#         value=refresh_token,
#         httponly=True,
#         secure=settings.COOKIE_SECURE,
#         samesite=_COOKIE_SAMESITE,
#         max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
#         path="/",
#     )













"""app/utils/cookie_utils.py"""

from fastapi import Response

from app.core.config import settings

# Frontend (Vercel) aur backend (Render) alag domain pe hain, to prod me SameSite=None chahiye,
# warna browser OAuth redirect pe cookie le leta hai par agle XHR calls pe chhod deta hai
# ("login hua, phir wapas login pe bounce"). SameSite=None sirf Secure=True ke saath valid hai,
# isliye dono settings se aate hain, alag-alag nahi.
_COOKIE_SAMESITE = "none" if settings.IS_PROD else "lax"

# Set aur delete me attributes bilkul same hone chahiye. Cross-site response me
# SameSite=Lax wala Set-Cookie browser reject kar deta hai, to purane delete_cookie(...) se
# prod me logout pe cookies hat hi nahi rahi thi.
_COOKIE_ATTRS = {
    "httponly": True,
    "secure": settings.COOKIE_SECURE,
    "samesite": _COOKIE_SAMESITE,
    "path": "/",
}


def set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    response.set_cookie(
        key=settings.ACCESS_COOKIE_NAME,  # logout/refresh isi naam se padhte hain, literal string nahi
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