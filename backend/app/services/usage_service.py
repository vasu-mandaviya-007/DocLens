
from datetime import datetime, timezone

from beanie import PydanticObjectId
from pymongo import ReturnDocument

from app.core.exceptions import RateLimitError
from app.models.usage_logs import ActionType, UsageCounter, UsageLogs

from app.core.config import settings


DOCUMENTS_FIELD = "document_upload_count"
QUESTIONS_FIELD = "questions_count"


def today_date() -> datetime:
    return datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)


def _counters():
    return UsageCounter.get_pymongo_collection()


async def _ensure_counter_doc_exists(
    user_id: PydanticObjectId, date: datetime, session=None
) -> None:
    
    await _counters().update_one(
        {"user_id": user_id, "date": date},
        {"$setOnInsert": {QUESTIONS_FIELD: 0, DOCUMENTS_FIELD: 0}},
        upsert=True,
        session=session,
    )


async def _consume(
    user_id: PydanticObjectId, field: str, limit: int, label: str, session=None
) -> None:
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
    await UsageLogs(user_id=user_id, action_type=ActionType.QUESTION_ASKED).insert()


async def log_document_uploaded(
    user_id: PydanticObjectId, document_id: PydanticObjectId
) -> None:
    
    await UsageLogs(
        user_id=user_id,
        action_type=ActionType.DOCUMENT_UPLOADED,
        document_id=document_id,
    ).insert()


async def get_usage_summary(user_id: PydanticObjectId) -> dict:
    
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