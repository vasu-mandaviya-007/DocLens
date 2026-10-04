# from pydantic import BaseModel, EmailStr, field_validator, Field
# from app.core.validators import validate_password_strength
# from datetime import datetime
# from typing import List 

# class SignUpRequest(BaseModel): 
#     username: str
#     email: EmailStr 
#     password: str   
 
#     @field_validator("username")
#     @classmethod
#     def check_username(cls, value: str) -> str:
#         value = value.strip()
#         if len(value) < 3:
#             raise ValueError("must be at least 3 characters")
#         return value
 
#     @field_validator("password")
#     @classmethod
#     def check_password(cls, value: str) -> str:
#         return validate_password_strength(value)


# class LoginRequest(BaseModel) :
#     email : EmailStr
#     password : str


# class GoogleAuthRequest(BaseModel) : 
#     id_token : str


# class UserResponse(BaseModel):
#     id: str 
#     email: EmailStr
#     username: str 
#     is_verified: bool
#     # auth_provider: str 
#     auth_providers: List[str]
#     created_at: datetime  


# class TokenResponse(BaseModel):
#     access_token: str
#     token_type: str = "bearer" 
#     user: UserResponse


# class MessageResponse(BaseModel): 
#     message: str


# class ForgotPasswordRequest(BaseModel):  
#     email : EmailStr


# class VerifyResetOtpRequest(BaseModel):
#     email: EmailStr
#     otp: str

#     @field_validator("otp")
#     @classmethod
#     def validate_otp(cls, v: str) -> str:
#         if not v.isdigit() or len(v) != 6:
#             raise ValueError("OTP must be a 6-digit number")
#         return v

    
# class ResetPasswordRequest(BaseModel):
#     email: EmailStr
#     # otp: str = Field(min_length=6, max_length=6)
#     new_password: str = Field(min_length=8, max_length=128)
 
#     @field_validator("new_password")
#     @classmethod
#     def password_strength(cls, v: str) -> str: 
#         if not any(c.isdigit() for c in v):
#             raise ValueError("Password must contain at least one digit")
#         if not any(c.isalpha() for c in v):
#             raise ValueError("Password must contain at least one letter")
#         return v


# class VerifyEmailRequest(BaseModel) : 
#     email : EmailStr
#     otp : str = Field(min_length=6, max_length=6)


# class ResendOtpRequest(BaseModel) : 
#     email : EmailStr


# class UpdateProfileRequest(BaseModel):
#     username: str














"""app/schemas/auth.py"""

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

# OTP ki length backend ke OTP_LENGTH se aati hai, 6 hardcode nahi.
Otp = Annotated[
    str,
    StringConstraints(strip_whitespace=True, pattern=rf"^\d{{{settings.OTP_LENGTH}}}$"),
]

# Signup aur reset-password dono me same strength rule
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
    avatar: str | None = None  # auth.py ye bhejta hai, pehle schema me nahi tha to chup-chaap hat jata tha
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
    retry_after: int  # 0 = abhi naya code maang sakte ho


class VerifyResetOtpResponse(BaseModel):
    message: str
    reset_token: str  # /reset-password me ye bhejna zaroori hai

