from fastapi import APIRouter
from core.deps import SessionDep
from services.fraud_detection import detect_fraud

router = APIRouter()

@router.get("/transactions")
def get_all_transactions( session: SessionDep ):
    session.get()
    

