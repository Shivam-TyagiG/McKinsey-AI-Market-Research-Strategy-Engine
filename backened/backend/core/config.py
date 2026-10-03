from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


# App settings are loaded from the environment
class Settings(BaseSettings):
    app_name: str = "McKinsey AI Market Research Engine"
    environment: str = "development"
    debug: bool = True

    supabase_url: str = Field(...)
    supabase_key: str = Field(...)

    # Exact origins (no trailing slashes, comma-separated)
    cors_origins: str = (
        "http://localhost:5173,"
        "http://127.0.0.1:5173,"
        "http://localhost:5174,"
        "http://127.0.0.1:5174,"
        "https://mc-kinsey-ai-market-research-strate.vercel.app,"
        "https://mc-kinsey-ai-market-research-strategy-engine-dtuna17ht.vercel.app,"
        "https://mc-kinsey-ai-market-research-strategy-engine-83fwv8gv8.vercel.app"
    )

    # Matches every Vercel preview deployment of this project
    cors_origin_regex: str | None = (
        r"https://mc-kinsey-ai-market-research-strat[a-z0-9\-]*\.vercel\.app"
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [
            origin.strip().rstrip("/")  # tolerate accidental trailing slashes
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()