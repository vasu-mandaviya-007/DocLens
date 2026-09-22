from app.core.config import settings
from groq import AsyncGroq

# groq_client = Groq(api_key=settings.GROQ_API_KEY)

groq_async_client = AsyncGroq(api_key=settings.GROQ_API_KEY)