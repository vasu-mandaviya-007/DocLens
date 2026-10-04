

# """app/services/account/otp_service.py"""

# import hashlib
# import secrets
# from datetime import datetime, timedelta
# from typing import Optional

# from beanie import PydanticObjectId

# from app.core.config import settings
# from app.models.user import EmailVerificationToken, PasswordResetOtp, User
# from app.services.account.email_service import (
#     send_password_reset_otp_email,
#     send_verification_otp_email,
# )
# from app.utils.time_utils import is_expired, utcnow


# # ---------- Low-level utils ----------

# def generate_otp(length: int = settings.OTP_LENGTH) -> str:
#     return "".join(secrets.choice("0123456789") for _ in range(length))


# def hash_otp(raw_otp: str) -> str:
#     return hashlib.sha256(raw_otp.encode("utf-8")).hexdigest()


# def otp_expiry() -> datetime:
#     return utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)


# # ---------- Email Verification ----------

# async def send_verification_otp(user: User) -> None:
#     raw_otp = generate_otp()

#     # purane pending OTPs invalidate: sirf latest valid rahe (resend ke liye bhi yahi function)
#     await EmailVerificationToken.find(EmailVerificationToken.user_id == user.id).delete()

#     await EmailVerificationToken(
#         user_id=user.id,
#         otp_hash=hash_otp(raw_otp),
#         expires_at=otp_expiry(),
#     ).insert()

#     await send_verification_otp_email(
#         email=user.email,
#         username=user.username,
#         otp=raw_otp,
#         expires_minutes=settings.OTP_EXPIRE_MINUTES,
#     )


# async def verify_email_otp(user_id: PydanticObjectId, otp: str) -> bool:
#     token = await EmailVerificationToken.find_one(
#         EmailVerificationToken.user_id == user_id,
#         EmailVerificationToken.otp_hash == hash_otp(otp),
#     )
#     if not token:
#         return False

#     await token.delete()  # valid ho ya expired, ek baar use hone ke baad token khatam
#     return not is_expired(token.expires_at)


# # ---------- Password Reset ----------

# async def send_password_reset_otp(user: User) -> None:
#     raw_otp = generate_otp()

#     await PasswordResetOtp.find(
#         PasswordResetOtp.user_id == user.id,
#         PasswordResetOtp.used == False,  # noqa: E712 (beanie query)
#     ).delete()

#     await PasswordResetOtp(
#         user_id=user.id,
#         otp_hash=hash_otp(raw_otp),
#         expires_at=otp_expiry(),
#     ).insert()

#     await send_password_reset_otp_email(
#         email=user.email,
#         username=user.username,
#         otp=raw_otp,
#         expires_minutes=settings.OTP_EXPIRE_MINUTES,
#     )


# async def verify_password_reset_otp( 
#     user_id: PydanticObjectId, otp: str
# ) -> Optional[PasswordResetOtp]: 
#     print(otp)
#     token = await PasswordResetOtp.find_one(
#         PasswordResetOtp.user_id == user_id,
#         PasswordResetOtp.otp_hash == hash_otp(otp),
#         PasswordResetOtp.used == False,  # noqa: E712
#     )
#     if not token:
#         return None

#     if is_expired(token.expires_at):
#         await token.delete()
#         return None

#     token.verified = True
#     await token.save()
#     return token


# async def get_verified_reset_token(user_id: PydanticObjectId) -> Optional[PasswordResetOtp]:
#     token = await PasswordResetOtp.find_one(
#         PasswordResetOtp.user_id == user_id,
#         PasswordResetOtp.verified == True,  # noqa: E712
#         PasswordResetOtp.used == False,  # noqa: E712
#     )
#     if not token:
#         return None

#     if is_expired(token.expires_at):
#         await token.delete()
#         return None

#     return token





















import hashlib
import hmac
import math
import secrets
from datetime import datetime, timedelta
from typing import Optional

from beanie import PydanticObjectId

from app.core.config import settings
from app.core.exceptions import RateLimitError
from app.models.user import EmailVerificationToken, PasswordResetOtp, User
from app.services.account.email_service import (
    send_password_reset_otp_email,
    send_verification_otp_email,
)
from app.utils.time_utils import is_expired, seconds_since, utcnow

MAX_OTP_ATTEMPTS = 5  # itni galat tries ke baad wo OTP khatam, nayi mangni padegi
RESEND_COOLDOWN_SECONDS = 60  # backend me enforce: frontend ka timer bypass ho sakta hai
RESET_WINDOW_MINUTES = 10  # OTP verify hone ke baad password badalne ka time


# ---------- Low-level utils ----------

def generate_otp(length: int = settings.OTP_LENGTH) -> str:
    return "".join(secrets.choice("0123456789") for _ in range(length))


def hash_otp(raw: str) -> str:
    """SHA-256 hex. OTP aur reset token dono ke liye (raw value kabhi DB me nahi jati)."""
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def otp_expiry() -> datetime:
    return utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)


# ---------- Shared helpers (verification aur reset dono) ----------

async def _latest_token(model, user_id: PydanticObjectId, *filters):
    return await model.find(model.user_id == user_id, *filters).sort("-created_at").first_or_none()


async def _discard_tokens(model, user_id: PydanticObjectId, *filters) -> None:
    await model.find(model.user_id == user_id, *filters).delete()


async def _cooldown_remaining(model, user_id: PydanticObjectId) -> int:
    """Naya OTP maangne me kitne second bache (0 = abhi maang sakte ho).
    Bhejne ka rok aur frontend ka timer dono isi ek function se chalte hain."""
    latest = await _latest_token(model, user_id)
    if not latest:
        return 0
    return max(0, math.ceil(RESEND_COOLDOWN_SECONDS - seconds_since(latest.created_at)))


async def _replace_otp(model, user: User, *delete_filters) -> str:
    """Cooldown check -> purane OTPs hatao -> naya OTP save karo. Raw OTP return karta hai."""
    if await _cooldown_remaining(model, user.id) > 0:
        raise RateLimitError(message="Please wait a minute before requesting another code.")

    raw_otp = generate_otp()
    await _discard_tokens(model, user.id, *delete_filters)
    await model(user_id=user.id, otp_hash=hash_otp(raw_otp), expires_at=otp_expiry()).insert()
    return raw_otp


async def _check_otp(model, user_id: PydanticObjectId, otp: str, *filters):
    """Latest OTP document pe check. Galat OTP pe attempts badhte hain, limit ke baad OTP delete."""
    token = await _latest_token(model, user_id, *filters)
    if not token:
        return None

    if is_expired(token.expires_at) or token.attempts >= MAX_OTP_ATTEMPTS:
        await token.delete()
        return None

    if not hmac.compare_digest(token.otp_hash, hash_otp(otp)):
        await token.inc({model.attempts: 1})
        return None

    return token


# ---------- Email Verification ----------

async def send_verification_otp(user: User) -> None:
    raw_otp = await _replace_otp(EmailVerificationToken, user)
    try:
        await send_verification_otp_email(
            email=user.email,
            username=user.username,
            otp=raw_otp,
            expires_minutes=settings.OTP_EXPIRE_MINUTES,
        )
    except Exception:
        # Email gayi hi nahi to cooldown me user atak jayega: OTP hata do
        await _discard_tokens(EmailVerificationToken, user.id)
        raise


async def verify_email_otp(user_id: PydanticObjectId, otp: str) -> bool:
    token = await _check_otp(EmailVerificationToken, user_id, otp)
    if not token:
        return False

    await token.delete()  # ek OTP ek hi baar kaam aata hai
    return True


# ---------- Password Reset ----------

async def send_password_reset_otp(user: User) -> None:
    raw_otp = await _replace_otp(PasswordResetOtp, user, PasswordResetOtp.used == False)  # noqa: E712
    try:
        await send_password_reset_otp_email( 
            email=user.email,
            username=user.username,
            otp=raw_otp,
            expires_minutes=settings.OTP_EXPIRE_MINUTES,
        )
    except Exception:
        await _discard_tokens(PasswordResetOtp, user.id, PasswordResetOtp.used == False)  # noqa: E712
        raise


async def verify_password_reset_otp(user_id: PydanticObjectId, otp: str) -> Optional[str]:
    """OTP sahi ho to single-use reset_token (raw) return karta hai, warna None.
    /reset-password me wahi token chahiye, to OTP verify karne wala hi password badal sakta hai."""
    token = await _check_otp(
        PasswordResetOtp, user_id, otp, PasswordResetOtp.used == False  # noqa: E712
    )
    if not token:
        return None

    raw_reset_token = secrets.token_urlsafe(32)
    token.verified = True
    token.reset_token_hash = hash_otp(raw_reset_token)
    token.expires_at = utcnow() + timedelta(minutes=RESET_WINDOW_MINUTES)
    await token.save()
    return raw_reset_token


async def get_verified_reset_token(
    user_id: PydanticObjectId, reset_token: str
) -> Optional[PasswordResetOtp]:
    token = await PasswordResetOtp.find_one(
        PasswordResetOtp.user_id == user_id,
        PasswordResetOtp.verified == True,  # noqa: E712
        PasswordResetOtp.used == False,  # noqa: E712
        PasswordResetOtp.reset_token_hash == hash_otp(reset_token),
    )
    if not token:
        return None

    if is_expired(token.expires_at):
        await token.delete()
        return None

    return token


# ---------- Cooldown status (frontend ka resend timer yahin se poochta hai) ----------

async def verification_cooldown_remaining(user_id: PydanticObjectId) -> int:
    return await _cooldown_remaining(EmailVerificationToken, user_id)


async def reset_cooldown_remaining(user_id: PydanticObjectId) -> int:
    return await _cooldown_remaining(PasswordResetOtp, user_id)









