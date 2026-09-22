from fastapi import APIRouter, Request, Response, HTTPException
from datetime import timezone, datetime
from random import randint
from app.schemas.auth import (
    SignUpRequest,
    LoginRequest,
    ResendOtpRequest,
    MessageResponse,
    TokenResponse,
    VerifyEmailRequest,
    UserResponse,
)
from app.services.user_service import find_user_by_email
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    generate_otp,
    hash_otp,
    otp_expiry,
    generate_refresh_token_data,
)
from app.models.User import (
    User,
    user_to_public_dict,
    EmailVerificationToken,
    RefreshToken,
)
import logging
from app.core.exceptions import (
    ValidationAppError,
    ServiceUnavailableError,
    UnauthorizedError,
)
from app.utils.cookie_utils import set_auth_cookies
from app.utils.email import send_mail
from fastapi import status

router = APIRouter()

logger = logging.getLogger("uvicorn.error")


async def send_verification_otp(user: User) -> None:
    raw_otp = generate_otp()

    otp_doc = EmailVerificationToken(
        user_id=user.id,
        otp_hash=hash_otp(raw_otp),
        expires_at=otp_expiry(),
    )

    await otp_doc.insert()

    try:
        await send_mail(user.email, raw_otp)
    except Exception:
        # Don't let an email-provider hiccup break registration - log and move on.
        # (Swap `pass` for real logging once you have a logger configured.)
        pass


@router.post("/signup")
async def signup(data: SignUpRequest, response: Response):

    try:
        existing_user = await User.find_one(User.email == data.email) 
    except Exception:
        logger.exception("DB error while checking existing email")
        raise ServiceUnavailableError(message="Unable to process request right now.")

    if existing_user:
        # raise HTTPException(status_code=400, detail="Email already exists")
        raise ValidationAppError(
            message="Please fix the highlighted fields",
            fields={"email": "Email already registered. Please try another."},
        )

    try:
        user = User(
            username=data.username,
            email=data.email,
            password=hash_password(data.password),
            auth_provider="local",
            is_verified=False,
        )
        await user.insert()
    except Exception:
        logger.exception("DB error while creating user")
        raise ServiceUnavailableError(message="Could not create account right now.")

    await send_verification_otp(user)

    # return {
    #     "success": True,
    #     "data": {"id": str(user.id), "username": user.username, "email": user.email},
    # }

    return MessageResponse(
        message="Account created. We sent a verification code to your email."
    )


# @router.post("/register")
# async def register_user(user: SignUpRequest):
#     # Pydantic (SignUpRequest) automatically validates format.
#     # Agar email format galat he ya password validator fail hota he,
#     # to code yaha tak pahuchega hi nahi, FastAPI direct 422 error return kar dega.

#     # Custom Validation: Database me check karna ki email exist karti he ya nahi
#     # (Yaha ek dummy check laga raha hu)
#     if user.email == "test@gmail.com":
#         # Hum response me specifically bata rahe he ki error 'email' field ki he
#         raise HTTPException(
#             status_code=400,
#             detail={"field": "email", "message": "This email is already registered."}
#         )

#     return {"message": "User registered successfully!"}


@router.post("/login")
async def login(data: LoginRequest, response: Response):

    try:
        user = await User.find_one(User.email == data.email)
    except Exception:
        logger.exception("DB error during login lookup")
        raise ServiceUnavailableError(message="Unable to process request right now.")

    if not user or not verify_password(data.password, user.password):
        raise UnauthorizedError(message="Invalid email or password")

    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))
    set_auth_cookies(response, access_token, refresh_token)

    return {
        "success": True,
        "data": {"id": str(user.id), "username": user.username, "email": user.email},
    }


async def _issue_refresh_token(user: User, response: Response) -> None:
    raw_token, token_hash, expires_at = generate_refresh_token_data()

    refresh_doc = RefreshToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
    )

    await refresh_doc.insert()

    return raw_token


# @router.post("/verify-email",response_model=TokenResponse)
# async def verify_email(data: VerifyEmailRequest, response: Response) :
#     user = await User.find_one(User.email == data.email)

#     invalid_otp_error = HTTPException(
#         status_code=status.HTTP_400_BAD_REQUEST,
#         detail="Invalid or expired code. Please request a new one.",
#     )

#     if not user :
#         raise invalid_otp_error

#     if user.is_verified :
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="This email is already verified. Please log in.",
#         )

#     stored_otp = await EmailVerificationToken.find_one(
#         EmailVerificationToken.user_id == user.id,
#         EmailVerificationToken.otp_hash == hash_otp(data.otp)
#     )

#     if not stored_otp :
#         raise invalid_otp_error

#     if stored_otp.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc) :
#         raise invalid_otp_error

#     user.is_verified = True
#     user.updated_at=datetime.now(timezone.utc)
#     await user.save()

#     await stored_otp.delete()

#     access_token = create_access_token(str(user.id))
#     refresh_token = _issue_refresh_token(user, response)

#     set_auth_cookies(access_token, refresh_token)


@router.post("/verify-email", response_model=UserResponse)
async def verify_email(data: VerifyEmailRequest, response: Response) -> UserResponse:
    user = await User.find_one(User.email == data.email)

    invalid_otp_error = HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Invalid or expired code. Please request a new one.",
    )

    if not user:
        raise invalid_otp_error

    if user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email is already verified. Please log in.",
        )

    stored_otp = await EmailVerificationToken.find_one(
        EmailVerificationToken.user_id == user.id,
        EmailVerificationToken.otp_hash == hash_otp(data.otp),
    )

    if not stored_otp:
        raise invalid_otp_error

    if stored_otp.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise invalid_otp_error

    user.is_verified = True
    user.updated_at = datetime.now(timezone.utc)
    await user.save()

    await stored_otp.delete()

    access_token = create_access_token(str(user.id))
    refresh_token = await _issue_refresh_token(user, response)

    set_auth_cookies(response, access_token, refresh_token)

    return UserResponse(
        id=str(user.id),
        email=user.email,
        username=user.username,
        is_verified=user.is_verified,
        auth_provider=user.auth_provider,
        created_at=user.created_at,
    )
