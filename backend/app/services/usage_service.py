# from beanie import PydanticObjectId
# from app.models.usage_logs import UsageCounter, UsageLogs, ActionType
# from datetime import datetime, timezone
# from fastapi import HTTPException
# from app.core.db import get_client
# from app.core.config import settings
# from app.core.exceptions import RateLimitError

# DAILY_DOCUMENT_LIMIT = 100
# DAILY_QUESTION_LIMIT = 1000


# def today_date() -> datetime:
#     now = datetime.now(timezone.utc)
#     return now.replace(hour=0, minute=0, second=0, microsecond=0)


# def _usage_counters_collection():
#     return get_client()[settings.DB_NAME]["usage_counters"]


# async def _ensure_counter_doc_exists(
#     user_id: PydanticObjectId, date: datetime, session=None
# ) -> None:

#     await UsageCounter.get_pymongo_collection().update_one(
#         {
#             "user_id": user_id,
#             "date": date,
#         },
#         {
#             "$setOnInsert": {
#                 "user_id": user_id,
#                 "date": date,
#                 "questions_count": 0,
#                 "document_upload_count": 0,
#             }
#         },
#         upsert=True,
#         session=session,
#     )


# async def try_consume_question_quota(user_id: PydanticObjectId, session=None) -> None:

#     date = today_date()

#     await _ensure_counter_doc_exists(user_id, date, session=session)

#     result = await UsageCounter.get_pymongo_collection().find_one_and_update(
#         {
#             "user_id": user_id,
#             "date": date,
#             "questions_count": {"$lt": DAILY_QUESTION_LIMIT},
#         },
#         {"$inc": {"questions_count": 1}},
#         return_document=True,
#         session=session,
#     )

#     if result is None:
#         raise RateLimitError(
#             f"Daily question limit ({DAILY_QUESTION_LIMIT}) reached. Try again tomorrow.",
#             fields={"used": DAILY_QUESTION_LIMIT, "total": DAILY_QUESTION_LIMIT},
#         )


# async def try_consume_document_quota(user_id: PydanticObjectId, session=None) -> None:

#     date = today_date()

#     await _ensure_counter_doc_exists(user_id, date, session)

#     result = await UsageCounter.get_pymongo_collection().find_one_and_update(
#         {
#             "user_id": user_id,
#             "date": date,
#             "document_upload_count": {"$lt": DAILY_DOCUMENT_LIMIT},
#         },
#         {
#             "$inc": {"document_upload_count": 1},
#         },
#         return_document=True,
#         session=session,
#     )

#     if result is None:
#         raise RateLimitError(
#             f"Daily notebook limit (3) reached. Try again tomorrow.",
#             fields={"used": DAILY_DOCUMENT_LIMIT, "total": DAILY_DOCUMENT_LIMIT},
#         )


# async def rollback_document_quota(user_id: PydanticObjectId) -> None:

#     date = today_date()

#     await UsageCounter.get_pymongo_collection().update_one(
#         {
#             "user_id": user_id,
#             "date": date,
#             "document_upload_count": {"$gt": 0},
#         },
#         {
#             "$inc": {"document_upload_count": -1},
#         },
#     )


# async def rollback_question_quota(user_id: PydanticObjectId) -> None:

#     date = today_date()

#     await UsageCounter.get_pymongo_collection().update_one(
#         {
#             "user_id": user_id,
#             "date": date,
#             "questions_count": {"$gt": 0},
#         },
#         {
#             "$inc": {"questions_count": -1},
#         },
#     )


# async def log_question_asked(user_id: PydanticObjectId) -> None:
#     """Fire-and-forget history log — call via asyncio.create_task()."""
#     await UsageLogs(user_id=user_id, action_type=ActionType.QUESTION_ASKED).insert()


# async def log_document_uploaded(
#     user_id: PydanticObjectId, document_id: PydanticObjectId
# ) -> None:
#     """Fire-and-forget history log — call via background_tasks.add_task().
#     NOTE: no notebook_id here — the actual UsageLogs model only has
#     user_id, action_type, document_id, created_at. document_id alone is
#     enough to look up the notebook later if ever needed (via DocumentFile)."""
#     await UsageLogs(
#         user_id=user_id,
#         action_type=ActionType.DOCUMENT_UPLOADED,
#         document_id=document_id,
#     ).insert()


# async def get_usage_summary(user_id: PydanticObjectId) -> dict:
#     date = today_date()
#     await _ensure_counter_doc_exists(user_id, date)

#     counter = await UsageCounter.find_one(
#         UsageCounter.user_id == user_id, UsageCounter.date == date
#     )

#     return {
#         "documents": {
#             "used": counter.document_upload_count if counter else 0,
#             "total": DAILY_DOCUMENT_LIMIT,
#         },
#         "questions": {
#             "used": counter.questions_count if counter else 0,
#             "total": DAILY_QUESTION_LIMIT,
#         },
#     }

















"""app/services/usage_service.py — daily quota counters aur usage history."""

from datetime import datetime, timezone

from beanie import PydanticObjectId
from pymongo import ReturnDocument

from app.core.exceptions import RateLimitError
from app.models.usage_logs import ActionType, UsageCounter, UsageLogs

from app.core.config import settings

# Counter ke field ke naam: ek jagah, taaki consume/rollback/summary me typo na ho
DOCUMENTS_FIELD = "document_upload_count"
QUESTIONS_FIELD = "questions_count"


def today_date() -> datetime:
    """Quota ka din UTC midnight pe badalta hai."""
    return datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)


def _counters():
    return UsageCounter.get_pymongo_collection()


async def _ensure_counter_doc_exists(
    user_id: PydanticObjectId, date: datetime, session=None
) -> None:
    # user_id aur date upsert me filter se hi aa jate hain, $setOnInsert me sirf counters chahiye
    await _counters().update_one(
        {"user_id": user_id, "date": date},
        {"$setOnInsert": {QUESTIONS_FIELD: 0, DOCUMENTS_FIELD: 0}},
        upsert=True,
        session=session,
    )


async def _consume(
    user_id: PydanticObjectId, field: str, limit: int, label: str, session=None
) -> None:
    """Atomic: counter limit se kam ho tabhi badhta hai, warna RateLimitError."""
    date = today_date()
    await _ensure_counter_doc_exists(user_id, date, session)

    result = await _counters().find_one_and_update(
        {"user_id": user_id, "date": date, field: {"$lt": limit}},
        {"$inc": {field: 1}},
        return_document=ReturnDocument.AFTER,
        session=session,
    )
    if result is None:
        raise RateLimitError(
            f"Daily {label} limit ({limit}) reached. Try again tomorrow.",
            fields={"used": limit, "total": limit},
        )


async def _rollback(user_id: PydanticObjectId, field: str) -> None:
    await _counters().update_one(
        {"user_id": user_id, "date": today_date(), field: {"$gt": 0}},
        {"$inc": {field: -1}},
    )


async def try_consume_question_quota(user_id: PydanticObjectId, session=None) -> None:
    await _consume(user_id, QUESTIONS_FIELD, settings.DAILY_QUESTION_LIMIT, "question", session)


async def try_consume_document_quota(user_id: PydanticObjectId, session=None) -> None:
    await _consume(user_id, DOCUMENTS_FIELD, settings.DAILY_DOCUMENT_LIMIT, "document upload", session)


async def rollback_question_quota(user_id: PydanticObjectId) -> None:
    await _rollback(user_id, QUESTIONS_FIELD)


async def rollback_document_quota(user_id: PydanticObjectId) -> None:
    await _rollback(user_id, DOCUMENTS_FIELD)


async def log_question_asked(user_id: PydanticObjectId) -> None:
    """Fire-and-forget history log: asyncio.create_task() se call karo."""
    await UsageLogs(user_id=user_id, action_type=ActionType.QUESTION_ASKED).insert()


async def log_document_uploaded(
    user_id: PydanticObjectId, document_id: PydanticObjectId
) -> None:
    """Fire-and-forget history log: background_tasks.add_task() se call karo.
    UsageLogs me notebook_id nahi hai (user_id, action_type, document_id, created_at).
    Notebook chahiye ho to document_id se DocumentFile ke through nikal sakte hain."""
    await UsageLogs(
        user_id=user_id,
        action_type=ActionType.DOCUMENT_UPLOADED,
        document_id=document_id,
    ).insert()


async def get_usage_summary(user_id: PydanticObjectId) -> dict:
    # Sirf padhna: GET pe DB me write nahi, counter na ho to 0 maan lo
    counter = await UsageCounter.find_one(
        UsageCounter.user_id == user_id, UsageCounter.date == today_date()
    )
    return {
        "documents": {
            "used": counter.document_upload_count if counter else 0,
            "total": settings.DAILY_DOCUMENT_LIMIT,
        },
        "questions": {
            "used": counter.questions_count if counter else 0,
            "total": settings.DAILY_QUESTION_LIMIT,
        },
    }