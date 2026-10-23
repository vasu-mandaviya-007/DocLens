
from datetime import datetime
from typing import Annotated, List, Literal

from pydantic import (
    AfterValidator,
    BaseModel,
    EmailStr,
    Field,
    StringConstraints,
    field_validator,
)

from app.core.config import settings
from app.core.validators import validate_password_strength

# ---------- shared field types: rule ek jagah, har schema me reuse ----------

Otp = Annotated[
    str,
    StringConstraints(strip_whitespace=True, pattern=rf"^\d{{{settings.OTP_LENGTH}}}$"),
]

StrongPassword = Annotated[
    str,
    Field(min_length=8, max_length=128),
    AfterValidator(validate_password_strength),
]


# ---------- requests ----------

class SignUpRequest(BaseModel):
    username: str
    email: EmailStr
    password: StrongPassword

    @field_validator("username")
    @classmethod
    def check_username(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 3:
            raise ValueError("must be at least 3 characters")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleAuthRequest(BaseModel):
    id_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class VerifyResetOtpRequest(BaseModel):
    email: EmailStr
    otp: Otp


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    reset_token: str = Field(min_length=20, max_length=200)
    new_password: StrongPassword


class VerifyEmailRequest(BaseModel):
    email: EmailStr
    otp: Otp


class ResendOtpRequest(BaseModel):
    email: EmailStr


class UpdateProfileRequest(BaseModel):
    username: str


class OtpCooldownRequest(BaseModel):
    email: EmailStr
    purpose: Literal["verify", "reset"]  # verify = email verification, reset = password reset


# ---------- responses ----------

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    username: str
    avatar: str | None = None 
    is_verified: bool
    auth_providers: List[str]
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class MessageResponse(BaseModel):
    message: str


class OtpCooldownResponse(BaseModel):
    retry_after: int  


class VerifyResetOtpResponse(BaseModel):
    message: str
    reset_token: str

