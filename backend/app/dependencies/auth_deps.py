from fastapi import Request, HTTPException, status
from jose import JWTError
from app.core.security import decode_access_token
from app.models.User import User
from beanie import PydanticObjectId


async def get_current_user(request: Request) -> User:

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, 
        detail="Invalid Credential, Please Try Again.", 
    )

    token = request.cookies.get("access_token")
    if not token:
        raise credentials_exception

    try:
        payload = decode_access_token(token) 
    except JWTError:
        raise credentials_exception

    user_id = payload.get("sub")
    if not user_id:
        raise credentials_exception

    try:
        user = await User.get(PydanticObjectId(user_id))
    except Exception:
        raise credentials_exception

    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated",
        )

    return user
