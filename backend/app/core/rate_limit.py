"""app/core/rate_limit.py — IP-based rate limiting (slowapi). Limits ek jagah, routes me sirf naam."""

from slowapi import Limiter
from slowapi.util import get_remote_address

# Key = client IP. Render jaise proxy ke peeche server ko `FORWARDED_ALLOW_IPS=*` env ke saath chalao,
# warna sabke liye IP proxy ka dikhega aur saare users ek hi limit share karenge.
# In-memory storage: single worker pe sahi, multi-worker/multi-instance pe limit per-process hogi
# (tab Redis storage_uri lagao).
limiter = Limiter(key_func=get_remote_address)

LIMIT_SIGNUP = "5/minute"
LIMIT_LOGIN = "10/minute"
LIMIT_OTP_SEND = "3/minute"  # forgot-password, resend: email bombing roko
LIMIT_OTP_VERIFY = "10/minute"  # verify-email, verify-reset-otp, reset-password