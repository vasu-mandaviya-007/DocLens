
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

MAX_OTP_ATTEMPTS = 5  
RESEND_COOLDOWN_SECONDS = 60  
RESET_WINDOW_MINUTES = 10 


# ---------- Low-level utils ----------

def generate_otp(length: int = settings.OTP_LENGTH) -> str:
    return "".join(secrets.choice("0123456789") for _ in range(length))


def hash_otp(raw: str) -> str:
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def otp_expiry() -> datetime:
    return utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)


# ---------- Shared helpers (verification aur reset dono) ----------

async def _latest_token(model, user_id: PydanticObjectId, *filters):
    return await model.find(model.user_id == user_id, *filters).sort("-created_at").first_or_none()


async def _discard_tokens(model, user_id: PydanticObjectId, *filters) -> None:
    await model.find(model.user_id == user_id, *filters).delete()


async def _cooldown_remaining(model, user_id: PydanticObjectId) -> int:
    latest = await _latest_token(model, user_id)
    if not latest:
        return 0
    return max(0, math.ceil(RESEND_COOLDOWN_SECONDS - seconds_since(latest.created_at)))


async def _replace_otp(model, user: User, *delete_filters) -> str:
    if await _cooldown_remaining(model, user.id) > 0:
        raise RateLimitError(message="Please wait a minute before requesting another code.")

    raw_otp = generate_otp()
    await _discard_tokens(model, user.id, *delete_filters)
    await model(user_id=user.id, otp_hash=hash_otp(raw_otp), expires_at=otp_expiry()).insert()
    return raw_otp


async def _check_otp(model, user_id: PydanticObjectId, otp: str, *filters):
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
        await _discard_tokens(EmailVerificationToken, user.id)
        raise


async def verify_email_otp(user_id: PydanticObjectId, otp: str) -> bool:
    token = await _check_otp(EmailVerificationToken, user_id, otp)
    if not token:
        return False

    await token.delete()
    return True


# ---------- Password Reset ----------

async def send_password_reset_otp(user: User) -> None:
    raw_otp = await _replace_otp(PasswordResetOtp, user, PasswordResetOtp.used == False)  
    try:
        await send_password_reset_otp_email( 
            email=user.email,
            username=user.username,
            otp=raw_otp,
            expires_minutes=settings.OTP_EXPIRE_MINUTES,
        )
    except Exception:
        await _discard_tokens(PasswordResetOtp, user.id, PasswordResetOtp.used == False) 
        raise


async def verify_password_reset_otp(user_id: PydanticObjectId, otp: str) -> Optional[str]:
    token = await _check_otp(
        PasswordResetOtp, user_id, otp, PasswordResetOtp.used == False 
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
        PasswordResetOtp.verified == True,  
        PasswordResetOtp.used == False, 
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









