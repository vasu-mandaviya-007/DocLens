from beanie import PydanticObjectId
from app.models.usage_logs import UsageCounter, UsageLogs, ActionType
from datetime import datetime, timezone
from fastapi import HTTPException
from app.core.db import get_client
from app.core.config import settings
from app.core.exceptions import RateLimitError

DAILY_DOCUMENT_LIMIT = 3
DAILY_QUESTION_LIMIT = 10


def today_date() -> datetime:
    now = datetime.now(timezone.utc)
    return now.replace(hour=0, minute=0, second=0, microsecond=0)


def _usage_counters_collection():
    return get_client()[settings.DB_NAME]["usage_counters"]


async def _ensure_counter_doc_exists(
    user_id: PydanticObjectId, date: datetime, session=None
) -> None:

    await UsageCounter.get_pymongo_collection().update_one(
        {
            "user_id": user_id,
            "date": date,
        },
        {
            "$setOnInsert": {
                "user_id": user_id,
                "date": date,
                "questions_count": 0,
                "document_upload_count": 0,
            }
        },
        upsert=True,
        session=session,
    )


async def try_consume_question_quota(user_id: PydanticObjectId, session=None) -> None:

    date = today_date()

    await _ensure_counter_doc_exists(user_id, date, session=session)

    result = await UsageCounter.get_pymongo_collection().find_one_and_update(
        {
            "user_id": user_id,
            "date": date,
            "questions_count": {"$lt": DAILY_QUESTION_LIMIT},
        },
        {"$inc": {"questions_count": 1}},
        return_document=True,
        session=session,
    )

    if result is None:
        raise RateLimitError(
            f"Daily question limit ({DAILY_QUESTION_LIMIT}) reached. Try again tomorrow.",
            fields={"used": DAILY_QUESTION_LIMIT, "total": DAILY_QUESTION_LIMIT},
        )


async def try_consume_document_quota(user_id: PydanticObjectId, session=None) -> None:

    date = today_date()

    await _ensure_counter_doc_exists(user_id, date, session)

    result = await UsageCounter.get_pymongo_collection().find_one_and_update(
        {
            "user_id": user_id,
            "date": date,
            "document_upload_count": {"$lt": DAILY_DOCUMENT_LIMIT},
        },
        {
            "$inc": {"document_upload_count": 1},
        },
        return_document=True,
        session=session,
    )

    if result is None:
        raise RateLimitError(
            f"Daily notebook limit (3) reached. Try again tomorrow.",
            fields={"used": DAILY_DOCUMENT_LIMIT, "total": DAILY_DOCUMENT_LIMIT},
        )


async def rollback_document_quota(user_id: PydanticObjectId) -> None:

    date = today_date()

    await UsageCounter.get_pymongo_collection().update_one(
        {
            "user_id": user_id,
            "date": date,
            "document_upload_count": {"$gt": 0},
        },
        {
            "$inc": {"document_upload_count": -1},
        },
    )


async def rollback_question_quota(user_id: PydanticObjectId) -> None:

    date = today_date()

    await UsageCounter.get_pymongo_collection().update_one(
        {
            "user_id": user_id,
            "date": date,
            "questions_count": {"$gt": 0},
        },
        {
            "$inc": {"questions_count": -1},
        },
    )


async def log_question_asked(user_id: PydanticObjectId) -> None:
    """Fire-and-forget history log — call via asyncio.create_task()."""
    await UsageLogs(user_id=user_id, action_type=ActionType.QUESTION_ASKED).insert()


async def log_document_uploaded(
    user_id: PydanticObjectId, document_id: PydanticObjectId
) -> None:
    """Fire-and-forget history log — call via background_tasks.add_task().
    NOTE: no notebook_id here — the actual UsageLogs model only has
    user_id, action_type, document_id, created_at. document_id alone is
    enough to look up the notebook later if ever needed (via DocumentFile)."""
    await UsageLogs(
        user_id=user_id,
        action_type=ActionType.DOCUMENT_UPLOADED,
        document_id=document_id,
    ).insert()


async def get_usage_summary(user_id: PydanticObjectId) -> dict:
    date = today_date()
    await _ensure_counter_doc_exists(user_id, date)

    counter = await UsageCounter.find_one(
        UsageCounter.user_id == user_id, UsageCounter.date == date
    )

    return {
        "documents": {
            "used": counter.document_upload_count if counter else 0,
            "total": DAILY_DOCUMENT_LIMIT,
        },
        "questions": {
            "used": counter.questions_count if counter else 0,
            "total": DAILY_QUESTION_LIMIT,
        },
    }
