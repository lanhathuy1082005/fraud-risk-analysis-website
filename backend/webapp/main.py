from contextlib import asynccontextmanager
from db import create_db_and_tables
from fastapi import FastAPI
from routes import auth, transactions

@asynccontextmanager
async def lifespan(app : FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan)

app.include_router(auth.router)
app.include_router(transactions.router)


