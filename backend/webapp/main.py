from contextlib import asynccontextmanager
from sqlmodel import Session, select
from db import create_db_and_tables, engine
from models import Customer
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, transactions, reviews, graphs,stats
from utils.load_components import *

@asynccontextmanager
async def lifespan(app : FastAPI):
    create_db_and_tables()
    
        # Load the model
    app.state.models = {"log": load_model("log_model")}

    # Load feature information
    app.state.feature_columns = load_features("feature_columns")
    app.state.constants = load_features("feature_engineering_constants")

    with Session(engine) as session:
        existing = session.exec(select(Customer)).all()
        app.state.customers = {
            c.id: {"dob": c.dob, "gender": c.gender}
            for c in existing
        }
    yield


app = FastAPI(lifespan=lifespan)

origins = ['http://localhost:5173']


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(transactions.router)
app.include_router(reviews.router)
app.include_router(graphs.router)
app.include_router(stats.router)

