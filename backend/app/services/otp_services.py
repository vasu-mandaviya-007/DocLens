import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional
from app.core.config import settings
from beanie import PydanticObjectId

from app.models.User import User, EmailVerificationToken, PasswordResetOtp
from app.services.email_service import (
    send_verification_otp_email,
    send_password_reset_otp_email, 
)


# ---------- Low-level utils (tumhare forgot_password route mein already use ho rahe naam) ----------


def generate_otp(length: int = settings.OTP_LENGTH ) -> str:
    return "".join(secrets.choice("0123456789") for _ in range(length))


def hash_otp(row_otp: str) -> str:
    return hashlib.sha256(row_otp.encode("utf-8")).hexdigest()


def otp_expiry() -> datetime:
    return datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)  


# ---------- Email Verification ----------


async def send_verification_otp(user: User) -> None:
    """Signup route isko call karta hai — naam match hai, seedha wire ho jayega."""
    raw_otp = generate_otp()

    # purane pending OTPs invalidate — resend flow ke liye bhi yehi function reuse hoga
    await EmailVerificationToken.find(
        EmailVerificationToken.user_id == user.id
    ).delete()

    await EmailVerificationToken(
        user_id=user.id,
        otp_hash=hash_otp(raw_otp),
        expires_at=otp_expiry(),
    ).insert()

    await send_verification_otp_email(
        email=user.email,
        username=user.username,
        otp=raw_otp,
        expires_minutes=settings.OTP_EXPIRE_MINUTES,
    )


async def verify_email_otp(user_id: PydanticObjectId, otp: str) -> bool:
    token = await EmailVerificationToken.find_one(
        EmailVerificationToken.user_id == user_id,
        EmailVerificationToken.otp_hash == hash_otp(otp),
    )

    if not token:
        return False

    if token.expires_at < datetime.now(timezone.utc):
        await token.delete()
        return False

    await token.delete()
    return True


# ---------- Password Reset ----------


async def send_password_reset_otp(user: User) -> None:
    raw_otp = generate_otp()

    await PasswordResetOtp.find(
        PasswordResetOtp.user_id == user.id,
        PasswordResetOtp.used == False,
    ).delete()

    await PasswordResetOtp(
        user_id=user.id,
        otp_hash=hash_otp(raw_otp),
        expires_at=otp_expiry(),
    ).insert()

    await send_password_reset_otp_email(
        email=user.email,
        username=user.username,
        otp=raw_otp,
        expires_minutes=settings.OTP_EXPIRE_MINUTES,
    )


async def verify_password_reset_otp(
    user_id: PydanticObjectId, otp: str
) -> Optional[PasswordResetOtp]:
    token = await PasswordResetOtp.find_one(
        PasswordResetOtp.user_id == user_id,
        PasswordResetOtp.otp_hash == hash_otp(otp),
        PasswordResetOtp.used == False,
    )

    if not token:
        return None

    if token.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        await token.delete()
        return None

    token.verified = True
    await token.save()
    return token


async def get_verified_reset_token(
    user_id: PydanticObjectId,
) -> Optional[PasswordResetOtp]:

    token = await PasswordResetOtp.find_one(
        PasswordResetOtp.user_id == user_id,
        PasswordResetOtp.verified == True,
        PasswordResetOtp.used == False,
    )

    if not token:
        return None

    if token.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        await token.delete()
        return None

    return token
