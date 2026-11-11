from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=("../.env", ".env"), extra="ignore")
    database_url: str
    allowed_origins: list[str] = [
        "http://localhost:7777",
        "http://127.0.0.1:7777",
        "http://localhost:7778",
        "http://localhost:7779",
    ]
    session_hours: int = 12
