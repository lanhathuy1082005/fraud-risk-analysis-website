from fastapi import APIRouter, Depends
from core.deps import SessionDep,get_current_user
from models import Transaction, GraphPoint
from sqlmodel import select

router = APIRouter(prefix="/graphs", dependencies=[Depends(get_current_user)])

@router.get("/conf-over-time")
def get_graph_conf_over_time(session: SessionDep):
    resource = session.exec(select(Transaction.time,Transaction.confidence_score).order_by(Transaction.time.desc())).all()
    
    r = [GraphPoint(x=t,y=cs) for t,cs  in resource]

    return r

@router.get("/risk-over-time")
def get_graph_risk_over_time(session: SessionDep):
    resource = session.exec(select(Transaction.time,Transaction.risk_score).order_by(Transaction.time.desc())).all()

    r = [GraphPoint(x=t,y=cs) for t,cs  in resource]

    return r
    
@router.get("/conf-over-risk")
def get_graph_z(session: SessionDep):
    resource = session.exec(select(Transaction.risk_score,Transaction.confidence_score).order_by(Transaction.time.desc())).all()

    r = [GraphPoint(x=rs,y=cs) for rs, cs  in resource]

    return r