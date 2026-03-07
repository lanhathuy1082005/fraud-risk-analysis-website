from fastapi import FastAPI
from .routes import user_routes,transaction_routes

app = FastAPI()

app.include_router(user_routes.router)
app.include_router(transaction_routes.router)


