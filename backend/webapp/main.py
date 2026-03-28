from contextlib import asynccontextmanager
from db import create_db_and_tables
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, transactions

@asynccontextmanager
async def lifespan(app : FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan)

origins = ["http://localhost:5173"]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(transactions.router)


