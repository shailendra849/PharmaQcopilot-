"""
Centralized app configuration.
Reads from environment variables / .env file.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # --- Database ---
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/aivoa_complaints"

    # --- Groq LLM ---
    groq_api_key: str = ""
    groq_model_extraction: str = "openai/gpt-oss-20b"
    groq_model_context: str = "openai/gpt-oss-120b"

    # --- App ---
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    max_upload_mb: int = 10

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
