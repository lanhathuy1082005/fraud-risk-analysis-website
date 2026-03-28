from sqlmodel import Field, SQLModel, Relationship
from uuid import UUID, uuid4
from pydantic import EmailStr
from datetime import date, datetime, timezone
from enum import Enum


class Gender(str, Enum):
    F = "F"
    M = "M"
    U = "U"

class Category(str, Enum):
    contents = "es_contents"
    fashion = "es_fashion"
    food = "es_food"
    health = "es_health"
    home = "es_home"
    hotel_services = "es_hotelservices"
    hyper = "es_hyper"
    leisure = "es_leisure"
    other_services = "es_otherservices"
    sports_and_toys = "es_sportsandtoys"
    tech = "es_tech"
    transportation = "es_transportation"
    travel = "es_travel"
    wellness_and_beauty = "es_wellnessandbeauty"

class Status(str, Enum):
    FLAGGED = "FLAGGED"
    APPROVED = "APPROVED"
    PENDING = "PENDING"
    


def get_current_time():
    return datetime.now(timezone.utc)

"""users data model"""
class UserBase(SQLModel):
    email: EmailStr = Field(index=True, unique=True)
    name: str


class User(UserBase, table=True):
    __tablename__ = "users"

    id: int | None = Field(default=None, primary_key=True)
    uuid: UUID = Field(default_factory=uuid4,index=True, unique=True)
    password_hash: str

class UserPublic(UserBase):
    uuid: UUID 

class UserRegister(UserBase):
    password: str

class UserLogin(SQLModel):
    email: EmailStr 
    password: str


"""transactions"""
class Customer(SQLModel,table=True):
    __tablename__ = "customers"

    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)
    dob: date
    gender: Gender

class Merchant(SQLModel, table=True):
    __tablename__ = "merchants"
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)

class TransactionBase(SQLModel):
    amount: float
    time: datetime = Field(default_factory=get_current_time)
    category: Category

class Transaction(TransactionBase, table=True):
    __tablename__ = "transactions"
    id: int | None = Field(default=None, primary_key=True)
    merchant_id: int = Field(foreign_key="merchants.id")
    customer_id: int = Field(foreign_key="customers.id")
    uuid: UUID = Field(default_factory=uuid4,index=True, unique=True)
    risk: float | None = None
    confidence: float | None = None
    merchant: Merchant | None= Relationship()
    customer: Customer | None = Relationship()

class TransactionInput(TransactionBase):
    merchant_name: str
    customer_name: str
    customer_dob: date
    customer_gender: Gender

class TransactionPublic(TransactionBase):
    uuid: UUID
    merchant_name: str  
    customer_name: str  
    risk: float | None = None
    confidence: float | None = None



class TransactionReview(SQLModel, table=True):
    __tablename__ = "transaction_reviews"
    id: int | None = Field(default=None, primary_key=True)
    transaction_id: int = Field(foreign_key="transactions.id")
    status: Status 
    reviewed_by_user: int | None = None 
    reviewed_at: datetime | None = None

"""others"""

class Token(SQLModel):
    access_token: str
    token_type: str