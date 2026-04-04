from fastapi import APIRouter
from core.deps import SessionDep,get_current_user
from models import 
from sqlmodel import select

router = APIRouter(prefix="/graphs", dependencies=get_current_user)

@router.get("/x")
def get_graph_x(session: SessionDep):
    pass
@router.get("/y")
def get_graph_y(session: SessionDep):
    pass
@router.get("/z")
def get_graph_z(session: SessionDep):
    pass