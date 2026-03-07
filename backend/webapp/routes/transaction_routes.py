from fastapi import APIRouter
from ..services.transaction_services import get_all_mock_transactions, detect_fraud_for_all_transactions, detect_fraud_for_transaction

router = APIRouter()

@router.get("/transactions")
def read_all_transactions():
    return get_all_mock_transactions()

@router.get("/transactions/detect_fraud")
def read_fraud_detection_results():
    return detect_fraud_for_all_transactions()

@router.get("/transactions/detect_fraud/{transaction_id}")
def read_fraud_detection_result_for_transaction(transaction_id: int):
    return detect_fraud_for_transaction(transaction_id)