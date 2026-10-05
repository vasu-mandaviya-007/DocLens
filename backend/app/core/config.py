from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    MONGO_URI: str
    DB_NAME: str = "doclens"

    OTP_LENGTH: int = 6
    OTP_EXPIRE_MINUTES: int = 10

    GEMINI_API_KEY: str
    GROQ_API_KEY: str
    NVIDIA_API_KEY: str

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ACCESS_COOKIE_NAME: str = "access_token"
    REFRESH_COOKIE_NAME: str = "refresh_token"

    SESSION_SECRET_KEY: str

    # Google OAuth
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str

    GITHUB_CLIENT_ID: str
    GITHUB_CLIENT_SECRET: str
    GITHUB_REDIRECT_URI: str

    # ── Environment / cookies / CORS ────────────────────────────────────
    ENV: str = "development"  # "development" | "production"
    FRONTEND_URL: str

    ALLOWED_ORIGINS_RAW: str = Field(default="", validation_alias="ALLOWED_ORIGINS")
    ALLOWED_HOSTS_RAW: str = Field(default="*", validation_alias="ALLOWED_HOSTS")

    @property
    def ALLOWED_ORIGINS(self) -> list[str]:
        return [
            item.strip() for item in self.ALLOWED_ORIGINS_RAW.split(",") if item.strip()
        ]

    @property
    def ALLOWED_HOSTS(self) -> list[str]:
        return [
            item.strip() for item in self.ALLOWED_HOSTS_RAW.split(",") if item.strip()
        ]

    @property
    def IS_PROD(self) -> bool:
        return self.ENV == "production"

    @property
    def COOKIE_SECURE(self) -> bool:
        return self.IS_PROD

    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 50

    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 20 MB
    MAX_PAGE_COUNT: int = 100
    PROCESSING_TIMEOUT_MINUTES: int = 8

    DAILY_DOCUMENT_LIMIT: int = 30
    DAILY_QUESTION_LIMIT: int = 100

    CHROMA_API_KEY: str
    CHROMA_TENANT: str
    CHROMA_DATABASE: str

    CHROMA_DB_PATH: str = "chroma_store"

    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str

    # ── Email (Brevo) ─────────────────────────────────────────────────────
    BREVO_API_KEY: str
    SENDER_EMAIL: str
    SENDER_NAME: str = "Doc Lens"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
