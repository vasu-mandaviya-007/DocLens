from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

LIMIT_SIGNUP = "5/minute"
LIMIT_LOGIN = "10/minute"
LIMIT_OTP_SEND = "3/minute"  
LIMIT_OTP_VERIFY = "10/minute"  