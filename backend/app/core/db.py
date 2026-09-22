from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings
from app.models.User import User, EmailVerificationToken, PasswordResetOtp, RefreshToken
from app.models.notebook import Notebook
from app.models.notebook_file import DocumentFile
from app.models.conversation import Conversation  
from app.models.message import Message 
from app.models.usage_logs import UsageLogs, UsageCounter

_client: AsyncIOMotorClient | None = None


async def connect_to_mongo() -> None:   

    global _client

    try:
        _client = AsyncIOMotorClient(settings.MONGO_URI) 

        await _client.admin.command("ping")

        await init_beanie(
            database=_client[settings.DB_NAME],
            document_models=[
                User,
                RefreshToken,
                EmailVerificationToken,
                PasswordResetOtp,
                Notebook,
                DocumentFile,
                Conversation,
                Message,
                UsageLogs,
                UsageCounter
            ],
        )

        print(f"✅ Connected to MongoDB — database: '{settings.DB_NAME}'")

    except Exception as e:

        raise RuntimeError(f"Failed to connect to MongoDB: {e}") from e


async def close_mongo_connection() -> None:
    if _client is not None:
        _client.close()


def get_client() -> AsyncIOMotorClient :  
    if _client is None : 
        raise RuntimeError("MongoDB client is not initialized. Did connect_to_mongo() run?")
    return _client