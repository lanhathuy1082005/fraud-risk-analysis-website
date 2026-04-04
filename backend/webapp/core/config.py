from pydantic_settings import BaseSettings, SettingsConfigDict
from datetime import datetime,timezone

class Settings(BaseSettings):
    
    APP_NAME: str = "Fraud Risk"
    debug: bool = False
    DB_URL: str 
    SECRET_KEY: str 
    TOKEN_EXPIRES_IN: int
    SIMULATION_START: datetime = datetime(2025,6,28,0,0,0,tzinfo=timezone.utc)

    model_config = SettingsConfigDict(
        env_file=".env"
    )


settings = Settings()