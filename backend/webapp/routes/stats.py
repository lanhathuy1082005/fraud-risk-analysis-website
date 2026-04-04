from fastapi import APIRouter, Depends
from core.deps import SessionDep,get_current_user
from models import Transaction
from sqlmodel import select
from sqlalchemy import func
from datetime import datetime,timedelta,timezone

router = APIRouter(prefix="/stats", dependencies=[Depends(get_current_user)])
@router.get("/dashboard")
def get_dashboard_stats(session: SessionDep):
    twenty_four_hours_ago = datetime.now(timezone.utc) - timedelta(hours=24)
    avg_amount_24h, txn_count_24h = session.exec(
    select(
        func.avg(Transaction.amount),
        func.count(Transaction.id),
    ).where(Transaction.time >= twenty_four_hours_ago)
    ).one()
    
    high_conf_high_risk_txn_count = session.exec(
    select(
        func.count(Transaction.id),
    ).where(Transaction.risk_score >= 0.8).where(Transaction.confidence_score >= 0.8).where(Transaction.review_id == None)
    ).one()
    

    return {"avg_amount_24h": avg_amount_24h, "txn_count_24h": txn_count_24h,"high_conf_high_risk_txn_count":high_conf_high_risk_txn_count}

@router.get("/charts")
def get_chart_stats(session: SessionDep):
    twenty_four_hours_ago = datetime.now(timezone.utc) - timedelta(hours=24)
    avg_risk_score_24h, avg_conf_score_24h = session.exec(
    select(
        func.avg(Transaction.risk_score),
        func.avg(Transaction.confidence_score),
    ).where(Transaction.time >= twenty_four_hours_ago)
    ).one()   

    return {"avg_risk_score_24h": avg_risk_score_24h, "avg_conf_score_24h": avg_conf_score_24h}
    
