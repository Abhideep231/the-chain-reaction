"""Application configuration, loaded from environment variables / .env."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict

from app.core.constants import API_VERSION, APP_DESCRIPTION, APP_NAME


class Settings(BaseSettings):
    """Centralized application settings.

    Values are read from environment variables (or a local `.env` file)
    with the defaults below acting as safe fallbacks for local
    development. Every setting a future sprint will need a real value
    for is declared here now so those sprints only fill in behavior,
    never restructure configuration.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Project metadata
    app_name: str = APP_NAME
    app_description: str = APP_DESCRIPTION
    api_version: str = API_VERSION
    environment: str = "development"

    # CORS
    allowed_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Logging
    log_level: str = "INFO"

    # External services
    claude_api_key: str | None = None  # placeholder — populated in a future sprint
    openai_api_key: str | None = None
    embedding_model: str = "text-embedding-3-large"

    # Storage (vector_db_path is a placeholder — populated in a future sprint)
    vector_db_path: str = "./data/chroma"
    upload_dir: str = "./data/uploads"
    max_upload_size_mb: int = 25

    # Chunking
    chunk_size: int = 1000
    chunk_overlap: int = 200


@lru_cache
def get_settings() -> Settings:
    """Return the cached, process-wide Settings instance."""
    return Settings()
