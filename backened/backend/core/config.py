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

    ccors_origins: str = (
        "http://localhost:5173,"
        "http://127.0.0.1:5173,"
        "http://localhost:5174,"
        "http://127.0.0.1:5174,"
        "https://mc-kinsey-ai-market-research-strate.vercel.app"
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
            origin.strip()
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()