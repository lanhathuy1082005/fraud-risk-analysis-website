from pydantic_settings import BaseSettings, SettingsConfigDict
from datetime import datetime,timedelta, timezone

class Settings(BaseSettings):
    
    APP_NAME: str = "Fraud Risk"
    debug: bool = False
    DB_URL: str 
    SECRET_KEY: str 
    TOKEN_EXPIRES_IN: int
    SIMULATION_START: datetime = datetime.now(timezone.utc) - timedelta(days=7)

    model_config = SettingsConfigDict(
        env_file=".env"
    )


settings = Settings()