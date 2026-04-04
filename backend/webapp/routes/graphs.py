from fastapi import APIRouter, Depends
from core.deps import SessionDep,get_current_user
from sqlmodel import select

router = APIRouter(prefix="/graphs", dependencies=[Depends(get_current_user)])

@router.get("/fraud-conf-over-time")
def get_graph_fraud_conf_over_time(session: SessionDep):
    pass
@router.get("/risk-over-time")
def get_graph_risk_over_time(session: SessionDep):
    pass
@router.get("/")
def get_graph_z(session: SessionDep):
    pass