from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    
    APP_NAME: str = "Fraud Risk"
    debug: bool = False
    DB_URL: str 
    SECRET_KEY: str 
    TOKEN_EXPIRES_IN: int

    model_config = SettingsConfigDict(
        env_file=".env"
    )


settings = Settings()