# """app/utils/time_utils.py — Mongo naive datetime deta hai, isliye expiry check ek jagah safe tarike se."""

# from datetime import datetime, timezone


# def utcnow() -> datetime:
#     return datetime.now(timezone.utc)


# def is_expired(dt: datetime) -> bool:
#     if dt.tzinfo is None:
#         dt = dt.replace(tzinfo=timezone.utc)
#     return dt < utcnow()









# v2




"""app/utils/time_utils.py — Mongo naive datetime deta hai, isliye saare time checks yahin se."""

from datetime import datetime, timezone


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def as_utc(dt: datetime) -> datetime:
    return dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt


def is_expired(dt: datetime) -> bool:
    return as_utc(dt) < utcnow()


def seconds_since(dt: datetime) -> float:
    return (utcnow() - as_utc(dt)).total_seconds()