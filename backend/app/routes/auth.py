# from fastapi import APIRouter, Request, Response, HTTPException
# from datetime import timezone, datetime
# from random import randint
# from app.schemas.auth import (
#     SignUpRequest,
#     LoginRequest,
#     UpdateProfileRequest,
#     MessageResponse,
#     ForgotPasswordRequest,
#     ResetPasswordRequest,
#     VerifyEmailRequest,
#     UserResponse,
#     VerifyResetOtpRequest,
# )


# from app.core.security import (
#     hash_password,
#     verify_password,
#     create_access_token,
#     generate_refresh_token,
#     generate_otp,
#     hash_otp,
#     otp_expiry,
#     generate_refresh_token_data,
#     hash_refresh_token,
#     refresh_token_expiry,
# )
# from app.models.user import (
#     User,
#     EmailVerificationToken,
#     RefreshToken,
# )
# import logging
# from app.core.exceptions import (
#     ValidationAppError,
#     ServiceUnavailableError,
#     UnauthorizedError,
# )
# from app.utils.cookie_utils import set_auth_cookies
# from app.utils.email import send_mail
# from fastapi import status, Depends, Cookie
# from app.dependencies.auth_deps import get_current_user
# from app.core.config import settings
# from app.services.account.otp_service import (
#     send_password_reset_otp,
#     verify_password_reset_otp,
#     get_verified_reset_token,
# )
# from app.routes.quota import get_usage_summary

# router = APIRouter()

# logger = logging.getLogger("uvicorn.error")


# async def _issue_refresh_token(user: User) -> str:
#     raw_token, token_hash, expires_at = generate_refresh_token_data()

#     refresh_doc = RefreshToken(
#         user_id=user.id,
#         token_hash=token_hash,
#         expires_at=expires_at,
#     )
#     await refresh_doc.insert()

#     return raw_token


# async def _issue_token_and_set_cookies(response: Response, user: User) -> None:

#     access_token = create_access_token(str(user.id))

#     raw_refresh_token = generate_refresh_token()
#     refresh_doc = RefreshToken(
#         user_id=user.id,
#         token_hash=hash_refresh_token(raw_refresh_token),
#         expires_at=refresh_token_expiry(),
#     )
#     await refresh_doc.insert()

#     set_auth_cookies(response, access_token, raw_refresh_token)


# def _user_to_response(user: User) -> UserResponse: 

#     providers = [p.provider for p in user.linked_providers]
#     if user.password:
#         providers.insert(0, "local")

#     return UserResponse(
#         id=str(user.id),
#         email=user.email,
#         username=user.username,
#         avatar=user.avatar,
#         is_verified=user.is_verified,
#         auth_providers=providers,
#         created_at=user.created_at,
#     )



# async def send_verification_otp(user: User) -> None:
#     # Purane, abhi bhi valid OTPs invalidate karo — sirf latest OTP hi valid rahe
#     await EmailVerificationToken.find( 
#         EmailVerificationToken.user_id == user.id
#     ).delete()

#     raw_otp = generate_otp()

#     otp_doc = EmailVerificationToken(
#         user_id=user.id,
#         otp_hash=hash_otp(raw_otp),
#         expires_at=otp_expiry(),
#     )
#     await otp_doc.insert() 

#     try:
#         await send_mail(user.email, raw_otp) 
#     except Exception:
#         # Email provider hiccup ho to bhi account create/update block mat karo,
#         # lekin ab isko properly log karo taaki silently na chhupe.
#         logger.exception(f"Failed to send verification OTP email to {user.email}")


# @router.post("/signup")
# async def signup(data: SignUpRequest, response: Response):
#     try:
#         existing_user = await User.find_one(User.email == data.email)
#     except Exception:
#         logger.exception("DB error while checking existing email")
#         raise ServiceUnavailableError(message="Unable to process request right now.")

#     if existing_user:
#         if existing_user.is_verified:
#             raise ValidationAppError(
#                 message="Please fix the highlighted fields",
#                 fields={"email": "Email already registered. Please try another."},
#             )

#         # Account exists but was never verified — treat this as a fresh
#         # signup attempt instead of blocking the user forever.
#         try:
#             existing_user.username = data.username
#             existing_user.password = hash_password(data.password)
#             existing_user.updated_at = datetime.now(timezone.utc)
#             await existing_user.save()
#         except Exception:
#             logger.exception("DB error while updating unverified user")
#             raise ServiceUnavailableError(message="Could not process signup right now.")

#         await send_verification_otp(existing_user)

#         return MessageResponse(
#             message="Account created. We sent a verification code to your email."
#         )

#     try:
#         user = User(
#             username=data.username,
#             email=data.email,
#             password=hash_password(data.password),
#             auth_provider="local",
#             is_verified=False,
#         )
#         await user.insert()
#     except Exception:
#         logger.exception("DB error while creating user")
#         raise ServiceUnavailableError(message="Could not create account right now.")

#     await send_verification_otp(user)

#     return MessageResponse(
#         message="Account created. We sent a verification code to your email."
#     )


# @router.post("/verify-email", response_model=UserResponse)
# async def verify_email(data: VerifyEmailRequest, response: Response) -> UserResponse:
#     user = await User.find_one(User.email == data.email)

#     invalid_otp_error = HTTPException(
#         status_code=status.HTTP_400_BAD_REQUEST,
#         detail="Invalid or expired code. Please request a new one.",
#     )

#     if not user:
#         raise invalid_otp_error

#     if user.is_verified:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="This email is already verified. Please log in.",
#         )

#     stored_otp = await EmailVerificationToken.find_one( 
#         EmailVerificationToken.user_id == user.id,
#         EmailVerificationToken.otp_hash == hash_otp(data.otp),
#     )

#     if not stored_otp:
#         raise invalid_otp_error

#     if stored_otp.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
#         raise invalid_otp_error

#     user.is_verified = True
#     user.updated_at = datetime.now(timezone.utc)
#     await user.save()

#     await stored_otp.delete()

#     access_token = create_access_token(str(user.id))
#     refresh_token = await _issue_refresh_token(user)
#     set_auth_cookies(response, access_token, refresh_token)

#     print(user.email)

#     return _user_to_response(user)



# @router.post("/login")
# async def login(data: LoginRequest, response: Response):
#     try:
#         user = await User.find_one(User.email == data.email)
#         print(user)
#     except Exception:
#         logger.exception("DB error during login lookup")
#         raise ServiceUnavailableError(message="Unable to process request right now.")

#     if not user:
#         raise UnauthorizedError(message="Invalid email or password")

#     # if user.auth_provider == "google" and not user.password: 
#     #     raise PermissionDeniedError(
#     #         message="This account uses Google Sign-In. Please log in with Google."
#     #     )
#     if not user.password:
#         raise UnauthorizedError(message="Invalid email or password")

#     if not verify_password(data.password, user.password):
#         raise UnauthorizedError(message="Invalid email or password")

#     if not user.is_verified:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Please verify your email before logging in.",
#         )

#     if not user.is_active:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="This account has been deactivated",
#         )

#     # access_token = create_access_token(str(user.id))
#     # refresh_token = await _issue_refresh_token(user)
#     # set_auth_cookies(response, access_token, refresh_token) 

#     # return UserResponse(
#     #     id=str(user.id),
#     #     email=user.email,
#     #     username=user.username,
#     #     is_verified=user.is_verified,
#     #     auth_provider=user.auth_provider,
#     #     created_at=user.created_at,
#     # )

#     await _issue_token_and_set_cookies(response, user)

#     return _user_to_response(user)



# @router.post("/logout", response_model=MessageResponse)
# async def logout( 
#     response: Response,
#     refresh_token: str | None = Cookie( 
#         default=None, alias=settings.REFRESH_COOKIE_NAME 
#     ),
# ):
#     if refresh_token:
#         token_hash = hash_refresh_token(refresh_token)
#         stored_token = await RefreshToken.find_one(
#             RefreshToken.token_hash == token_hash
#         )
#         if stored_token:
#             stored_token.revoked = True
#             await stored_token.save() 

#     response.delete_cookie(key=settings.ACCESS_COOKIE_NAME, path="/")
#     response.delete_cookie(key=settings.REFRESH_COOKIE_NAME, path="/")

#     return MessageResponse(message="Logged out successfully")


# @router.post("/forgot-password", response_model=MessageResponse)
# async def forgot_password(payload: ForgotPasswordRequest):

#     # message="If an account with that email exists, we sent a reset code to it."
#     generic_response = MessageResponse(
#         message="A reset code has been sent to your registered email."
#     )

#     try:
#         user = await User.find_one(User.email == payload.email)
#     except Exception:
#         logger.exception("DB error while looking up user for forgot-password")
#         raise ServiceUnavailableError(message="Unable to process request right now.")

#     if not user:
#         return generic_response

#     try:
#         await send_password_reset_otp(user)
#     except Exception as e:
#         logger.exception("Failed to send password reset OTP")
#         raise ServiceUnavailableError(message="Could not send reset code right now.")

#     return generic_response


# @router.post("/verify-reset-otp", response_model=MessageResponse)
# async def verify_reset_otp(payload: VerifyResetOtpRequest):

#     try:
#         user = await User.find_one(User.email == payload.email)
#     except Exception:
#         logger.exception("DB error while verifying reset OTP")
#         raise ServiceUnavailableError(message="Unable to process request right now.")

#     invalid_otp_error = ValidationAppError(
#         message="Please fix the highlighted fields",
#         fields={"otp": "Invalid or expired code."},
#     )

#     if not user:
#         raise invalid_otp_error

#     token = await verify_password_reset_otp(user.id, payload.otp)

#     if not token:
#         raise invalid_otp_error

#     return MessageResponse(message="Code verified. You can now reset your password.")


# @router.post("/reset-password", response_model=MessageResponse)
# async def reset_password(payload: ResetPasswordRequest):
#     try:
#         user = await User.find_one(User.email == payload.email)
#     except Exception:
#         logger.exception("DB error while resetting password")
#         raise ServiceUnavailableError(message="Unable to process request right now.")

#     session_error = ValidationAppError(
#         message="Please fix the highlighted fields",
#         fields={"otp": "Verification expired. Please request a new code."},
#     )

#     if not user:
#         print("User error")
#         raise session_error

#     token = await get_verified_reset_token(user.id) 

#     if not token:
#         print("token error")
#         raise session_error 

#     try:
#         user.password = hash_password(payload.new_password)
#         user.updated_at = datetime.now(timezone.utc)
#         await user.save()

#         token.used = True
#         await token.save()

#         await RefreshToken.find(RefreshToken.user_id == user.id).delete()

#     except Exception:
#         logger.exception("DB error while finalizing password reset")
#         raise ServiceUnavailableError(message="Could not reset password right now.")

#     return MessageResponse(
#         message="Password reset successful. Please sign in with your new password."
#     )


# @router.post("/refresh", response_model=UserResponse)
# async def refresh_access_token(
#     response: Response,
#     refresh_token: str | None = Cookie(
#         default=None, alias=settings.REFRESH_COOKIE_NAME
#     ),
# ):
#     if not refresh_token:
#         raise UnauthorizedError(message="Not authenticated")

#     token_hash = hash_refresh_token(refresh_token)
#     stored_token = await RefreshToken.find_one(RefreshToken.token_hash == token_hash)

#     if not stored_token or stored_token.revoked:
#         raise UnauthorizedError(message="Session expired. Please log in again.")

#     if stored_token.expires_at.replace(tzinfo=timezone.utc) < datetime.now( 
#         timezone.utc
#     ):
#         raise UnauthorizedError(message="Session expired. Please log in again.")

#     user = await User.get(stored_token.user_id)
#     if not user or not user.is_active:
#         raise UnauthorizedError(message="User not found or inactive")

#     stored_token.revoked = True
#     await stored_token.save()

#     await _issue_token_and_set_cookies(response, user)

#     return _user_to_response(user)


# @router.post("/me", response_model=UserResponse)
# async def get_me(current_user: User = Depends(get_current_user)):
#     return _user_to_response(current_user)





# @router.patch("/me", response_model=UserResponse)
# async def update_me(
#     payload: UpdateProfileRequest,
#     current_user: User = Depends(get_current_user),
# ):
#     trimmed = payload.username.strip()
#     if not trimmed:
#         raise ValidationAppError(
#             message="Please fix the highlighted fields",
#             fields={"username": "Name can't be empty."},
#         )
 
#     current_user.username = trimmed
#     current_user.updated_at = datetime.now(timezone.utc)
#     await current_user.save()
 
#     return _user_to_response(current_user)
 
 
# @router.get("/usage")
# async def get_usage(current_user: User = Depends(get_current_user)):
#     return await get_usage_summary(current_user.id)























# """app/routes/auth.py"""

# import logging

# from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status

# from app.core.config import settings
# from app.core.exceptions import (
#     ServiceUnavailableError,
#     UnauthorizedError, 
#     ValidationAppError,
# )
# from app.core.security import hash_password, hash_refresh_token, verify_password
# from app.dependencies.auth_deps import get_current_user
# from app.models.user import RefreshToken, User
# from app.routes.quota import get_usage_summary
# from app.schemas.auth import (
#     ForgotPasswordRequest,
#     LoginRequest,
#     MessageResponse,
#     ResetPasswordRequest,
#     SignUpRequest,
#     UpdateProfileRequest,
#     UserResponse,
#     VerifyEmailRequest,
#     VerifyResetOtpRequest,
# )
# from app.services.account.session_service import start_session
# from app.services.account.otp_service import ( 
#     get_verified_reset_token,
#     send_password_reset_otp,
#     send_verification_otp,
#     verify_email_otp,
#     verify_password_reset_otp,
# )
# from app.utils.time_utils import is_expired, utcnow

# router = APIRouter()
# logger = logging.getLogger("uvicorn.error")

# SIGNUP_MESSAGE = "Account created. We sent a verification code to your email."
# DB_BUSY = "Unable to process request right now."


# # ---------- helpers ----------

# async def _send_verification_otp_safe(user: User) -> None:
#     # Email provider hiccup se signup block nahi hona chahiye, par log zaroor ho.
#     try:
#         await send_verification_otp(user)
#     except Exception:
#         logger.exception("Failed to send verification OTP email to %s", user.email)


# def _user_to_response(user: User) -> UserResponse:
#     providers = [p.provider for p in user.linked_providers]
#     if user.password:
#         providers.insert(0, "local")

#     return UserResponse(
#         id=str(user.id),
#         email=user.email,
#         username=user.username,
#         avatar=user.avatar,
#         is_verified=user.is_verified,
#         auth_providers=providers,
#         created_at=user.created_at,
#     )


# # ---------- signup / verify / login ----------

# @router.post("/signup", response_model=MessageResponse)
# async def signup(data: SignUpRequest):
#     try:
#         user = await User.find_one(User.email == data.email)
#     except Exception:
#         logger.exception("DB error while checking existing email")
#         raise ServiceUnavailableError(message=DB_BUSY)

#     if user and user.is_verified:
#         raise ValidationAppError(
#             message="Please fix the highlighted fields",
#             fields={"email": "Email already registered. Please try another."},
#         )

#     try:
#         if user:  # account hai par kabhi verify nahi hua: ise fresh signup maano
#             user.username = data.username
#             user.password = hash_password(data.password)
#             user.updated_at = utcnow()
#             await user.save()
#         else:
#             user = User(
#                 username=data.username,
#                 email=data.email,
#                 password=hash_password(data.password),
#                 auth_provider="local",
#                 is_verified=False,
#             )
#             await user.insert()
#     except Exception:
#         logger.exception("DB error while saving signup")
#         raise ServiceUnavailableError(message="Could not create account right now.")

#     await _send_verification_otp_safe(user)
#     return MessageResponse(message=SIGNUP_MESSAGE)


# @router.post("/verify-email", response_model=UserResponse)
# async def verify_email(data: VerifyEmailRequest, response: Response) -> UserResponse:
#     invalid_otp_error = HTTPException(
#         status_code=status.HTTP_400_BAD_REQUEST,
#         detail="Invalid or expired code. Please request a new one.",
#     )

#     user = await User.find_one(User.email == data.email)
#     if not user:
#         raise invalid_otp_error

#     if user.is_verified:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="This email is already verified. Please log in.",
#         )

#     if not await verify_email_otp(user.id, data.otp):
#         raise invalid_otp_error

#     user.is_verified = True
#     user.updated_at = utcnow()
#     await user.save()

#     await start_session(response, user)
#     return _user_to_response(user)


# @router.post("/login", response_model=UserResponse)
# async def login(data: LoginRequest, response: Response):
#     try:
#         user = await User.find_one(User.email == data.email)
#     except Exception:
#         logger.exception("DB error during login lookup")
#         raise ServiceUnavailableError(message=DB_BUSY)

#     # Teeno case me same message: attacker ko pata na chale email exist karta hai ya nahi
#     if not user or not user.password or not verify_password(data.password, user.password):
#         raise UnauthorizedError(message="Invalid email or password")

#     if not user.is_verified:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Please verify your email before logging in.",
#         )

#     if not user.is_active:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="This account has been deactivated",
#         )

#     await start_session(response, user)
#     return _user_to_response(user)


# @router.post("/logout", response_model=MessageResponse)
# async def logout(
#     response: Response,
#     refresh_token: str | None = Cookie(default=None, alias=settings.REFRESH_COOKIE_NAME),
# ):
#     if refresh_token:
#         stored_token = await RefreshToken.find_one(
#             RefreshToken.token_hash == hash_refresh_token(refresh_token)
#         )
#         if stored_token:
#             stored_token.revoked = True
#             await stored_token.save()

#     response.delete_cookie(key=settings.ACCESS_COOKIE_NAME, path="/")
#     response.delete_cookie(key=settings.REFRESH_COOKIE_NAME, path="/")
#     return MessageResponse(message="Logged out successfully")


# # ---------- password reset ----------

# @router.post("/forgot-password", response_model=MessageResponse)
# async def forgot_password(payload: ForgotPasswordRequest):
#     generic_response = MessageResponse(
#         message="A reset code has been sent to your registered email."
#     )

#     try:
#         user = await User.find_one(User.email == payload.email)
#     except Exception:
#         logger.exception("DB error while looking up user for forgot-password")
#         raise ServiceUnavailableError(message=DB_BUSY)

#     if not user:
#         return generic_response

#     try:
#         await send_password_reset_otp(user)
#     except Exception:
#         logger.exception("Failed to send password reset OTP")
#         raise ServiceUnavailableError(message="Could not send reset code right now.")

#     return generic_response


# @router.post("/verify-reset-otp", response_model=MessageResponse)
# async def verify_reset_otp(payload: VerifyResetOtpRequest):
#     try:
#         user = await User.find_one(User.email == payload.email)
#     except Exception:
#         logger.exception("DB error while verifying reset OTP")
#         raise ServiceUnavailableError(message=DB_BUSY)

#     invalid_otp_error = ValidationAppError( 
#         message="Please fix the highlighted fields", 
#         fields={"otp": "Invalid or expired code."},
#     )
#     print(payload)

#     if not user or not await verify_password_reset_otp(user.id, payload.otp): 
#         raise invalid_otp_error

#     return MessageResponse(message="Code verified. You can now reset your password.")


# @router.post("/reset-password", response_model=MessageResponse)
# async def reset_password(payload: ResetPasswordRequest):
#     try:
#         user = await User.find_one(User.email == payload.email)
#     except Exception:
#         logger.exception("DB error while resetting password")
#         raise ServiceUnavailableError(message=DB_BUSY)

#     session_error = ValidationAppError(
#         message="Please fix the highlighted fields",
#         fields={"otp": "Verification expired. Please request a new code."},
#     )

#     if not user:
#         raise session_error

#     token = await get_verified_reset_token(user.id)
#     if not token:
#         raise session_error

#     try:
#         user.password = hash_password(payload.new_password)
#         user.updated_at = utcnow()
#         await user.save()

#         token.used = True
#         await token.save()

#         # Password badla to saare purane sessions band
#         await RefreshToken.find(RefreshToken.user_id == user.id).delete()
#     except Exception:
#         logger.exception("DB error while finalizing password reset")
#         raise ServiceUnavailableError(message="Could not reset password right now.")

#     return MessageResponse(
#         message="Password reset successful. Please sign in with your new password."
#     )


# # ---------- session / profile ----------

# @router.post("/refresh", response_model=UserResponse)
# async def refresh_access_token(
#     response: Response,
#     refresh_token: str | None = Cookie(default=None, alias=settings.REFRESH_COOKIE_NAME),
# ):
#     if not refresh_token:
#         raise UnauthorizedError(message="Not authenticated")

#     expired_error = UnauthorizedError(message="Session expired. Please log in again.")

#     stored_token = await RefreshToken.find_one(
#         RefreshToken.token_hash == hash_refresh_token(refresh_token)
#     )
#     if not stored_token or stored_token.revoked or is_expired(stored_token.expires_at):
#         raise expired_error

#     user = await User.get(stored_token.user_id)
#     if not user or not user.is_active:
#         raise UnauthorizedError(message="User not found or inactive")

#     # Rotation: purana refresh token ek hi baar chalta hai
#     stored_token.revoked = True
#     await stored_token.save()

#     await start_session(response, user)
#     return _user_to_response(user)


# @router.post("/me", response_model=UserResponse)
# async def get_me(current_user: User = Depends(get_current_user)):
#     return _user_to_response(current_user)


# @router.patch("/me", response_model=UserResponse)
# async def update_me(
#     payload: UpdateProfileRequest,
#     current_user: User = Depends(get_current_user),
# ):
#     trimmed = payload.username.strip()
#     if not trimmed:
#         raise ValidationAppError(
#             message="Please fix the highlighted fields",
#             fields={"username": "Name can't be empty."},
#         )

#     current_user.username = trimmed
#     current_user.updated_at = utcnow()
#     await current_user.save()
#     return _user_to_response(current_user)


# @router.get("/usage")
# async def get_usage(current_user: User = Depends(get_current_user)):
#     return await get_usage_summary(current_user.id)




















# """app/routes/auth.py"""

# import logging

# from fastapi import APIRouter, Cookie, Depends, Request, Response

# from app.core.config import settings
# from app.core.exceptions import (
#     BadRequestError,
#     PermissionDeniedError,
#     RateLimitError,
#     ServiceUnavailableError,
#     UnauthorizedError,
#     ValidationAppError,
# )
# from app.core.security import hash_password, hash_refresh_token, verify_password
# from app.dependencies.auth_deps import get_current_user
# from app.models.user import RefreshToken, User
# from app.core.rate_limit import (
#     LIMIT_LOGIN,
#     LIMIT_OTP_SEND,
#     LIMIT_OTP_VERIFY, 
#     LIMIT_SIGNUP,
#     limiter,
# )
# from app.schemas.auth import (
#     ForgotPasswordRequest,
#     LoginRequest,
#     MessageResponse,
#     ResendOtpRequest,
#     ResetPasswordRequest,
#     SignUpRequest,
#     UpdateProfileRequest,
#     UserResponse,
#     VerifyEmailRequest,
#     VerifyResetOtpRequest,
#     VerifyResetOtpResponse,
# )
# from app.services.account.session_service import start_session
# from app.services.usage_service import get_usage_summary
# from app.services.account.otp_service import (
#     get_verified_reset_token,
#     send_password_reset_otp,
#     send_verification_otp,
#     verify_email_otp,
#     verify_password_reset_otp,
# )
# from app.utils.cookie_utils import clear_auth_cookies
# from app.utils.time_utils import is_expired, utcnow

# router = APIRouter()
# logger = logging.getLogger("uvicorn.error")

# SIGNUP_MESSAGE = "Account created. We sent a verification code to your email."
# DB_BUSY = "Unable to process request right now."


# # ---------- helpers ----------

# async def _send_verification_otp_safe(user: User) -> None:
#     # Email provider hiccup se signup block nahi hona chahiye, par log zaroor ho.
#     try:
#         await send_verification_otp(user)
#     except RateLimitError:
#         logger.info("Verification OTP resend throttled for %s", user.email)
#     except Exception:
#         logger.exception("Failed to send verification OTP email to %s", user.email)


# def _user_to_response(user: User) -> UserResponse:
#     providers = [p.provider for p in user.linked_providers]
#     if user.password:
#         providers.insert(0, "local")

#     return UserResponse(
#         id=str(user.id),
#         email=user.email,
#         username=user.username,
#         avatar=user.avatar,
#         is_verified=user.is_verified,
#         auth_providers=providers,
#         created_at=user.created_at,
#     )


# # ---------- signup / verify / login ----------

# @router.post("/signup", response_model=MessageResponse)
# @limiter.limit(LIMIT_SIGNUP)
# async def signup(request: Request, data: SignUpRequest):
#     try:
#         user = await User.find_one(User.email == data.email)
#     except Exception:
#         logger.exception("DB error while checking existing email")
#         raise ServiceUnavailableError(message=DB_BUSY)

#     if user and user.is_verified:
#         raise ValidationAppError(
#             message="Please fix the highlighted fields",
#             fields={"email": "Email already registered. Please try another."},
#         )

#     try:
#         if user:  # account hai par kabhi verify nahi hua: ise fresh signup maano
#             user.username = data.username
#             user.password = hash_password(data.password)
#             user.updated_at = utcnow()
#             await user.save()
#         else:
#             user = User(
#                 username=data.username,
#                 email=data.email,
#                 password=hash_password(data.password),
#                 auth_provider="local",
#                 is_verified=False,
#             )
#             await user.insert()
#     except Exception:
#         logger.exception("DB error while saving signup")
#         raise ServiceUnavailableError(message="Could not create account right now.")

#     await _send_verification_otp_safe(user)
#     return MessageResponse(message=SIGNUP_MESSAGE)


# @router.post("/verify-email", response_model=UserResponse)
# @limiter.limit(LIMIT_OTP_VERIFY)
# async def verify_email(
#     request: Request, data: VerifyEmailRequest, response: Response
# ) -> UserResponse:
#     invalid_otp_error = BadRequestError(message="Invalid or expired code. Please request a new one.")

#     user = await User.find_one(User.email == data.email)
#     if not user:
#         raise invalid_otp_error

#     if user.is_verified:
#         raise BadRequestError(message="This email is already verified. Please log in.")

#     if not await verify_email_otp(user.id, data.otp):
#         raise invalid_otp_error

#     user.is_verified = True
#     user.updated_at = utcnow()
#     await user.save()

#     await start_session(response, user)
#     return _user_to_response(user)


# @router.post("/resend-verification-otp", response_model=MessageResponse)
# @limiter.limit(LIMIT_OTP_SEND)
# async def resend_verification_otp(request: Request, payload: ResendOtpRequest):
#     # Hamesha same jawab: pata na chale ki email registered hai ya pehle se verified hai
#     generic_response = MessageResponse(
#         message="If this account is awaiting verification, a new code has been sent."
#     )

#     try:
#         user = await User.find_one(User.email == payload.email)
#     except Exception:
#         logger.exception("DB error while looking up user for resend OTP")
#         raise ServiceUnavailableError(message=DB_BUSY)

#     if not user or user.is_verified:
#         return generic_response

#     try:
#         await send_verification_otp(user)
#     except RateLimitError:
#         pass  # cooldown me hai: pichla code abhi valid hai
#     except Exception:
#         logger.exception("Failed to resend verification OTP")
#         raise ServiceUnavailableError(message="Could not send verification code right now.")

#     return generic_response


# @router.post("/login", response_model=UserResponse)
# @limiter.limit(LIMIT_LOGIN)
# async def login(request: Request, data: LoginRequest, response: Response):
#     try:
#         user = await User.find_one(User.email == data.email)
#     except Exception:
#         logger.exception("DB error during login lookup")
#         raise ServiceUnavailableError(message=DB_BUSY) 

#     # Teeno case me same message: attacker ko pata na chale email exist karta hai ya nahi
#     if not user or not user.password or not verify_password(data.password, user.password):
#         raise UnauthorizedError(message="Invalid email or password")

#     if not user.is_verified:
#         raise PermissionDeniedError(message="Please verify your email before logging in.")

#     if not user.is_active:
#         raise PermissionDeniedError(message="This account has been deactivated")

#     await start_session(response, user)
#     return _user_to_response(user)


# @router.post("/logout", response_model=MessageResponse)
# async def logout(
#     response: Response,
#     refresh_token: str | None = Cookie(default=None, alias=settings.REFRESH_COOKIE_NAME),
# ):
#     if refresh_token:
#         stored_token = await RefreshToken.find_one(
#             RefreshToken.token_hash == hash_refresh_token(refresh_token)
#         )
#         if stored_token:
#             stored_token.revoked = True
#             await stored_token.save()

#     clear_auth_cookies(response)
#     return MessageResponse(message="Logged out successfully")


# # ---------- password reset ----------

# @router.post("/forgot-password", response_model=MessageResponse)
# @limiter.limit(LIMIT_OTP_SEND)
# async def forgot_password(request: Request, payload: ForgotPasswordRequest):
#     generic_response = MessageResponse(
#         message="A reset code has been sent to your registered email."
#     )

#     try:
#         user = await User.find_one(User.email == payload.email)
#     except Exception:
#         logger.exception("DB error while looking up user for forgot-password")
#         raise ServiceUnavailableError(message=DB_BUSY)

#     if not user:
#         return generic_response

#     try:
#         await send_password_reset_otp(user)
#     except RateLimitError:
#         return generic_response  # cooldown ka error dene se pata chal jata ki account exist karta hai
#     except Exception:
#         logger.exception("Failed to send password reset OTP")
#         raise ServiceUnavailableError(message="Could not send reset code right now.")

#     return generic_response


# @router.post("/verify-reset-otp", response_model=VerifyResetOtpResponse)
# @limiter.limit(LIMIT_OTP_VERIFY)
# async def verify_reset_otp(request: Request, payload: VerifyResetOtpRequest):
#     try:
#         user = await User.find_one(User.email == payload.email)
#     except Exception:
#         logger.exception("DB error while verifying reset OTP")
#         raise ServiceUnavailableError(message=DB_BUSY)

#     invalid_otp_error = ValidationAppError(
#         message="Please fix the highlighted fields",
#         fields={"otp": "Invalid or expired code."},
#     )

#     reset_token = await verify_password_reset_otp(user.id, payload.otp) if user else None
#     if not reset_token:
#         raise invalid_otp_error

#     return VerifyResetOtpResponse(
#         message="Code verified. You can now reset your password.",
#         reset_token=reset_token,
#     )


# @router.post("/reset-password", response_model=MessageResponse)
# @limiter.limit(LIMIT_OTP_VERIFY)
# async def reset_password(request: Request, payload: ResetPasswordRequest):
#     try:
#         user = await User.find_one(User.email == payload.email)
#     except Exception:
#         logger.exception("DB error while resetting password")
#         raise ServiceUnavailableError(message=DB_BUSY)

#     session_error = ValidationAppError(
#         message="Please fix the highlighted fields",
#         fields={"otp": "Verification expired. Please request a new code."},
#     )

#     if not user:
#         raise session_error

#     token = await get_verified_reset_token(user.id, payload.reset_token)
#     if not token:
#         raise session_error

#     try:
#         user.password = hash_password(payload.new_password)
#         user.updated_at = utcnow()
#         await user.save()

#         token.used = True
#         await token.save()

#         # Password badla to saare purane sessions band
#         await RefreshToken.find(RefreshToken.user_id == user.id).delete()
#     except Exception:
#         logger.exception("DB error while finalizing password reset")
#         raise ServiceUnavailableError(message="Could not reset password right now.")

#     return MessageResponse(
#         message="Password reset successful. Please sign in with your new password."
#     )


# # ---------- session / profile ----------

# @router.post("/refresh", response_model=UserResponse)
# async def refresh_access_token(
#     response: Response,
#     refresh_token: str | None = Cookie(default=None, alias=settings.REFRESH_COOKIE_NAME),
# ):
#     if not refresh_token:
#         raise UnauthorizedError(message="Not authenticated")

#     expired_error = UnauthorizedError(message="Session expired. Please log in again.")

#     stored_token = await RefreshToken.find_one(
#         RefreshToken.token_hash == hash_refresh_token(refresh_token)
#     )
#     if not stored_token or stored_token.revoked or is_expired(stored_token.expires_at):
#         raise expired_error

#     user = await User.get(stored_token.user_id)
#     if not user or not user.is_active:
#         raise UnauthorizedError(message="User not found or inactive")

#     # Rotation: purana refresh token ek hi baar chalta hai
#     stored_token.revoked = True
#     await stored_token.save()

#     await start_session(response, user)
#     return _user_to_response(user)


# @router.get("/me", response_model=UserResponse)
# @router.post("/me", response_model=UserResponse)  # purane frontend ke liye, getMe GET pe shift hone ke baad hata dena
# async def get_me(current_user: User = Depends(get_current_user)):
#     return _user_to_response(current_user)


# @router.patch("/me", response_model=UserResponse)
# async def update_me(
#     payload: UpdateProfileRequest,
#     current_user: User = Depends(get_current_user),
# ):
#     trimmed = payload.username.strip()
#     if not trimmed:
#         raise ValidationAppError(
#             message="Please fix the highlighted fields",
#             fields={"username": "Name can't be empty."},
#         )

#     current_user.username = trimmed
#     current_user.updated_at = utcnow()
#     await current_user.save()
#     return _user_to_response(current_user)


# @router.get("/usage")
# async def get_usage(current_user: User = Depends(get_current_user)):
#     return await get_usage_summary(current_user.id)
























"""app/routes/auth.py"""

import logging

from fastapi import APIRouter, Cookie, Depends, Request, Response

from app.core.config import settings
from app.core.exceptions import (
    BadRequestError,
    EmailNotVerifiedError,
    PermissionDeniedError,
    RateLimitError,
    ServiceUnavailableError,
    UnauthorizedError,
    ValidationAppError,
)
from app.core.security import hash_password, hash_refresh_token, verify_password
from app.dependencies.auth_deps import get_current_user
from app.models.user import RefreshToken, User
from app.core.rate_limit import (
    LIMIT_LOGIN,
    LIMIT_OTP_SEND,
    LIMIT_OTP_VERIFY,
    LIMIT_SIGNUP,
    limiter,
)
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    ResendOtpRequest,
    ResetPasswordRequest,
    SignUpRequest,
    UpdateProfileRequest,
    UserResponse,
    VerifyEmailRequest,
    VerifyResetOtpRequest,
    VerifyResetOtpResponse,
    OtpCooldownRequest,
    OtpCooldownResponse
)
from app.services.account.session_service import start_session
from app.services.usage_service import get_usage_summary
from app.services.account.otp_service import (
    get_verified_reset_token,
    send_password_reset_otp,
    send_verification_otp,
    verify_email_otp,
    verify_password_reset_otp,
    verification_cooldown_remaining,
    reset_cooldown_remaining
)
from app.utils.cookie_utils import clear_auth_cookies
from app.utils.time_utils import is_expired, utcnow

router = APIRouter()
logger = logging.getLogger("uvicorn.error")

SIGNUP_MESSAGE = "Account created. We sent a verification code to your email."
DB_BUSY = "Unable to process request right now."


# ---------- helpers ----------

async def _send_verification_otp_safe(user: User) -> None:
    # Email provider hiccup se signup block nahi hona chahiye, par log zaroor ho.
    try:
        await send_verification_otp(user)
    except RateLimitError:
        logger.info("Verification OTP resend throttled for %s", user.email)
    except Exception:
        logger.exception("Failed to send verification OTP email to %s", user.email)


def _user_to_response(user: User) -> UserResponse:
    providers = [p.provider for p in user.linked_providers]
    if user.password:
        providers.insert(0, "local")

    return UserResponse(
        id=str(user.id),
        email=user.email,
        username=user.username,
        avatar=user.avatar,
        is_verified=user.is_verified,
        auth_providers=providers,
        created_at=user.created_at,
    )


# ---------- signup / verify / login ----------

@router.post("/signup", response_model=MessageResponse)
@limiter.limit(LIMIT_SIGNUP)
async def signup(request: Request, data: SignUpRequest):
    try:
        user = await User.find_one(User.email == data.email)
    except Exception:
        logger.exception("DB error while checking existing email")
        raise ServiceUnavailableError(message=DB_BUSY)

    if user and user.is_verified:
        raise ValidationAppError(
            message="Please fix the highlighted fields",
            fields={"email": "Email already registered. Please try another."},
        )

    try:
        if user:  # account hai par kabhi verify nahi hua: ise fresh signup maano
            user.username = data.username
            user.password = hash_password(data.password)
            user.updated_at = utcnow()
            await user.save()
        else:
            user = User(
                username=data.username,
                email=data.email,
                password=hash_password(data.password),
                auth_provider="local",
                is_verified=False,
            )
            await user.insert()
    except Exception:
        logger.exception("DB error while saving signup")
        raise ServiceUnavailableError(message="Could not create account right now.")

    await _send_verification_otp_safe(user)
    return MessageResponse(message=SIGNUP_MESSAGE)


@router.post("/verify-email", response_model=UserResponse)
@limiter.limit(LIMIT_OTP_VERIFY)
async def verify_email(
    request: Request, data: VerifyEmailRequest, response: Response
) -> UserResponse:
    invalid_otp_error = BadRequestError(message="Invalid or expired code. Please request a new one.")

    user = await User.find_one(User.email == data.email)
    if not user:
        raise invalid_otp_error

    if user.is_verified:
        raise BadRequestError(message="This email is already verified. Please log in.")

    if not await verify_email_otp(user.id, data.otp):
        raise invalid_otp_error

    user.is_verified = True
    user.updated_at = utcnow()
    await user.save()

    await start_session(response, user)
    return _user_to_response(user)


@router.post("/resend-verification-otp", response_model=MessageResponse)
@limiter.limit(LIMIT_OTP_SEND)
async def resend_verification_otp(request: Request, payload: ResendOtpRequest):
    # Hamesha same jawab: pata na chale ki email registered hai ya pehle se verified hai
    generic_response = MessageResponse(
        message="If this account is awaiting verification, a new code has been sent."
    )

    try:
        user = await User.find_one(User.email == payload.email)
    except Exception:
        logger.exception("DB error while looking up user for resend OTP")
        raise ServiceUnavailableError(message=DB_BUSY)

    if not user or user.is_verified:
        return generic_response

    try:
        await send_verification_otp(user)
    except RateLimitError:
        pass  # cooldown me hai: pichla code abhi valid hai
    except Exception:
        logger.exception("Failed to resend verification OTP")
        raise ServiceUnavailableError(message="Could not send verification code right now.")

    return generic_response




@router.post("/otp-cooldown", response_model=OtpCooldownResponse)
@limiter.limit(LIMIT_OTP_VERIFY)
async def otp_cooldown(request: Request, payload: OtpCooldownRequest):
    """Naya OTP maangne me kitne second bache. Frontend ka resend timer page khulte hi yahan se leta hai, 
    isliye refresh karne par bhi sahi time dikhta hai. Account na ho to bhi 0 (alag jawab nahi)."""
    try:
        user = await User.find_one(User.email == payload.email)
    except Exception:
        logger.exception("DB error while reading OTP cooldown")
        raise ServiceUnavailableError(message=DB_BUSY)
 
    if not user:
        return OtpCooldownResponse(retry_after=0) 
 
    remaining_for = {"verify": verification_cooldown_remaining, "reset": reset_cooldown_remaining}
    return OtpCooldownResponse(retry_after=await remaining_for[payload.purpose](user.id))




@router.post("/login", response_model=UserResponse)
@limiter.limit(LIMIT_LOGIN)
async def login(request: Request, data: LoginRequest, response: Response):
    try:
        user = await User.find_one(User.email == data.email)
    except Exception:
        logger.exception("DB error during login lookup")
        raise ServiceUnavailableError(message=DB_BUSY)

    # Teeno case me same message: attacker ko pata na chale email exist karta hai ya nahi
    if not user or not user.password or not verify_password(data.password, user.password):
        raise UnauthorizedError(message="Invalid email or password")

    if not user.is_verified:
        # Password sahi nikla, to naya OTP bhejna safe hai: koi doosre ka inbox bomb nahi kar sakta.
        # Cooldown aur rate limit pehle se lagte hain.
        await _send_verification_otp_safe(user)
        raise EmailNotVerifiedError(message="Please verify your email before logging in.")

    if not user.is_active:
        raise PermissionDeniedError(message="This account has been deactivated")

    await start_session(response, user)
    return _user_to_response(user)


@router.post("/logout", response_model=MessageResponse)
async def logout(
    response: Response,
    refresh_token: str | None = Cookie(default=None, alias=settings.REFRESH_COOKIE_NAME),
):
    if refresh_token:
        stored_token = await RefreshToken.find_one(
            RefreshToken.token_hash == hash_refresh_token(refresh_token)
        )
        if stored_token:
            stored_token.revoked = True
            await stored_token.save()

    clear_auth_cookies(response)
    return MessageResponse(message="Logged out successfully")


# ---------- password reset ----------

@router.post("/forgot-password", response_model=MessageResponse)
@limiter.limit(LIMIT_OTP_SEND)
async def forgot_password(request: Request, payload: ForgotPasswordRequest):
    generic_response = MessageResponse(
        message="A reset code has been sent to your registered email."
    )

    try:
        user = await User.find_one(User.email == payload.email)
    except Exception:
        logger.exception("DB error while looking up user for forgot-password")
        raise ServiceUnavailableError(message=DB_BUSY)

    if not user:
        return generic_response

    try:
        await send_password_reset_otp(user)
    except RateLimitError:
        return generic_response  # cooldown ka error dene se pata chal jata ki account exist karta hai
    except Exception:
        logger.exception("Failed to send password reset OTP")
        raise ServiceUnavailableError(message="Could not send reset code right now.")

    return generic_response


@router.post("/verify-reset-otp", response_model=VerifyResetOtpResponse)
@limiter.limit(LIMIT_OTP_VERIFY)
async def verify_reset_otp(request: Request, payload: VerifyResetOtpRequest):
    try:
        user = await User.find_one(User.email == payload.email)
    except Exception:
        logger.exception("DB error while verifying reset OTP")
        raise ServiceUnavailableError(message=DB_BUSY)

    invalid_otp_error = ValidationAppError(
        message="Please fix the highlighted fields",
        fields={"otp": "Invalid or expired code."},
    )

    reset_token = await verify_password_reset_otp(user.id, payload.otp) if user else None
    if not reset_token:
        raise invalid_otp_error

    return VerifyResetOtpResponse(
        message="Code verified. You can now reset your password.",
        reset_token=reset_token,
    )


@router.post("/reset-password", response_model=MessageResponse)
@limiter.limit(LIMIT_OTP_VERIFY)
async def reset_password(request: Request, payload: ResetPasswordRequest):
    try:
        user = await User.find_one(User.email == payload.email)
    except Exception:
        logger.exception("DB error while resetting password")
        raise ServiceUnavailableError(message=DB_BUSY)

    session_error = ValidationAppError(
        message="Please fix the highlighted fields",
        fields={"otp": "Verification expired. Please request a new code."},
    )

    if not user:
        raise session_error

    token = await get_verified_reset_token(user.id, payload.reset_token)
    if not token:
        raise session_error

    try:
        user.password = hash_password(payload.new_password)
        user.updated_at = utcnow()
        await user.save()

        token.used = True
        await token.save()

        # Password badla to saare purane sessions band
        await RefreshToken.find(RefreshToken.user_id == user.id).delete()
    except Exception:
        logger.exception("DB error while finalizing password reset")
        raise ServiceUnavailableError(message="Could not reset password right now.")

    return MessageResponse(
        message="Password reset successful. Please sign in with your new password."
    )


# ---------- session / profile ----------

@router.post("/refresh", response_model=UserResponse)
async def refresh_access_token(
    response: Response,
    refresh_token: str | None = Cookie(default=None, alias=settings.REFRESH_COOKIE_NAME),
):
    if not refresh_token:
        raise UnauthorizedError(message="Not authenticated")

    expired_error = UnauthorizedError(message="Session expired. Please log in again.")

    stored_token = await RefreshToken.find_one(
        RefreshToken.token_hash == hash_refresh_token(refresh_token)
    )
    if not stored_token or stored_token.revoked or is_expired(stored_token.expires_at):
        raise expired_error

    user = await User.get(stored_token.user_id)
    if not user or not user.is_active:
        raise UnauthorizedError(message="User not found or inactive")

    # Rotation: purana refresh token ek hi baar chalta hai
    stored_token.revoked = True
    await stored_token.save()

    await start_session(response, user)
    return _user_to_response(user)


@router.get("/me", response_model=UserResponse)
@router.post("/me", response_model=UserResponse)  # purane frontend ke liye, getMe GET pe shift hone ke baad hata dena
async def get_me(current_user: User = Depends(get_current_user)):
    return _user_to_response(current_user)


@router.patch("/me", response_model=UserResponse)
async def update_me(
    payload: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
):
    trimmed = payload.username.strip()
    if not trimmed:
        raise ValidationAppError(
            message="Please fix the highlighted fields",
            fields={"username": "Name can't be empty."},
        )

    current_user.username = trimmed
    current_user.updated_at = utcnow()
    await current_user.save()
    return _user_to_response(current_user)


@router.get("/usage")
async def get_usage(current_user: User = Depends(get_current_user)):
    return await get_usage_summary(current_user.id)