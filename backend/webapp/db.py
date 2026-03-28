from sqlmodel import SQLModel, create_engine
from core.config import settings

engine = create_engine(settings.DB_URL)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)