from app.core.config import settings
from google import genai  

gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)   