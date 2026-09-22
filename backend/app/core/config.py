
# from pydantic_settings import BaseSettings, SettingsConfigDict


# class Settings(BaseSettings):
#     MONGO_URI: str
#     DB_NAME: str = "doclens"

#     EMAIL_USER: str
#     EMAIL_PASS: str

#     OTP_LENGTH: int = 6
#     OTP_EXPIRE_MINUTES: int = 10

#     GEMINI_API_KEY: str
#     GROQ_API_KEY: str
#     NVIDIA_API_KEY: str

#     JWT_SECRET_KEY: str
#     JWT_ALGORITHM: str = "HS256"
#     ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
#     REFRESH_TOKEN_EXPIRE_DAYS: int = 7
#     ACCESS_COOKIE_NAME: str = "access_token"
#     REFRESH_COOKIE_NAME: str = "refresh_token"

#     # Google OAuth
#     GOOGLE_CLIENT_ID: str
#     GOOGLE_CLIENT_SECRET: str
#     GOOGLE_REDIRECT_URI: str 

#     GITHUB_CLIENT_ID: str
#     GITHUB_CLIENT_SECRET: str
#     GITHUB_REDIRECT_URI: str

#     # Cookies / CORS
#     FRONTEND_URL: str = "http://localhost:5173"
#     COOKIE_SECURE: bool = False

#     CHUNK_SIZE: int = 500
#     CHUNK_OVERLAP: int = 50

#     CHROMA_DB_PATH: str = "chroma_store"

#     CLOUDINARY_CLOUD_NAME: str
#     CLOUDINARY_API_KEY: str
#     CLOUDINARY_API_SECRET: str

#     model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


# settings = Settings()







from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    MONGO_URI: str
    DB_NAME: str = "doclens"

    EMAIL_USER: str
    EMAIL_PASS: str

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

    # Independent from JWT_SECRET_KEY on purpose — session cookie signing and
    # JWT signing should never share a secret (one leaking shouldn't compromise
    # the other).
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
    FRONTEND_URL: str = "http://localhost:5173"

    # Stored as plain str (not list[str]) on purpose: pydantic-settings tries
    # to JSON-decode any list-typed field read from an env var, so a plain
    # comma-separated value like "http://localhost:5173,https://x.com" would
    # crash at startup before any validator gets to run. Keeping the raw
    # field a str sidesteps that entirely; the list form is exposed below
    # via a property, so `settings.ALLOWED_ORIGINS` is still used the same
    # way everywhere else (main.py included).
    # Comma-separated, e.g.: ALLOWED_ORIGINS=http://localhost:5173,https://doc-lens-beta.vercel.app
    ALLOWED_ORIGINS_RAW: str = Field(default="", validation_alias="ALLOWED_ORIGINS")
    # Comma-separated, e.g.: ALLOWED_HOSTS=doclens-api.onrender.com
    ALLOWED_HOSTS_RAW: str = Field(default="*", validation_alias="ALLOWED_HOSTS")

    @property
    def ALLOWED_ORIGINS(self) -> list[str]:
        return [item.strip() for item in self.ALLOWED_ORIGINS_RAW.split(",") if item.strip()]

    @property
    def ALLOWED_HOSTS(self) -> list[str]:
        return [item.strip() for item in self.ALLOWED_HOSTS_RAW.split(",") if item.strip()]

    @property
    def IS_PROD(self) -> bool:
        return self.ENV == "production"

    @property
    def COOKIE_SECURE(self) -> bool:
        # Derived from ENV instead of a separate manually-set flag, so a
        # deploy can't end up with session cookies secure but auth cookies
        # not (or vice versa) just because one env var was forgotten.
        return self.IS_PROD

    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 50

    # NOTE: local disk path — fine for a single persistent instance. If the
    # deploy target has an ephemeral filesystem (common on free tiers / with
    # auto-scaling), this store is wiped on every restart/redeploy and every
    # document has to be re-processed. Confirm the deploy target gives you a
    # persistent volume before relying on this in production; otherwise a
    # managed vector store (Chroma Cloud, Qdrant Cloud, Pinecone, etc.) is
    # the safer choice.
    CHROMA_DB_PATH: str = "chroma_store"

    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()