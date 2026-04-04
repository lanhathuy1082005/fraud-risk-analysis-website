from sqlmodel import Field, SQLModel, Relationship
from uuid import UUID, uuid4
from pydantic import EmailStr
from datetime import date, datetime, timezone
from collections.abc import Sequence
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

"""return functions"""

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


"""customers"""
class Customer(SQLModel,table=True):
    __tablename__ = "customers"

    id: int = Field(unique=True,primary_key=True)
    dob: date
    gender: Gender

    avg_amount: float 
    amount_M2: float
    txn_count: int

    avg_time_between_txn: float
    last_txn_time: datetime 
    time_M2: float

    avg_device_freq: float
    device_M2: float
    device_count: int



class CustomerInput(SQLModel):
    id: int
    dob: date
    gender: Gender
    amount: float
    time: datetime

"""merchants"""
class Merchant(SQLModel, table=True):
    __tablename__ = "merchants"
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)
    frequency: int 

class MerchantInput(SQLModel):
    name: str 

"""devices"""
class Device(SQLModel,table=True):
    __tablename__= "devices"
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)
    frequency: int

class DeviceInput(SQLModel):
    name: str 

"""review"""
class Review(SQLModel, table=True):
    __tablename__ = "reviews"
    id: int | None = Field(default=None, primary_key=True)
    status: Status 
    user_id: int = Field(foreign_key="users.id", index=True)
    reviewed_at: datetime = Field(default_factory=get_current_time)

class ReviewInput(SQLModel):
    status: Status 
    transaction_id: int 
    user_id: int 

"""transactions"""
class TransactionBase(SQLModel):
    amount: float
    time: datetime | None
    category: Category  

class Transaction(TransactionBase, table=True):
    __tablename__ = "transactions"
    id: int | None = Field(default=None, primary_key=True)
    merchant_id: int = Field(foreign_key="merchants.id", index=True)
    customer_id: int = Field(foreign_key="customers.id", index=True)
    device_id: int = Field(foreign_key="devices.id", index=True)
    review_id: int = Field(foreign_key="reviews.id", index=True)
    uuid: UUID = Field(default_factory=uuid4,index=True, unique=True)
    risk_score: float
    confidence_score: float

    merchant: Merchant | None = Relationship()
    customer: Customer | None = Relationship()
    device: Device | None = Relationship()
    review: Review | None = Relationship()

class TransactionInput(TransactionBase):
    merchant_name: str
    customer_id: int
    device_name: str
    customer_dob: date
    customer_gender: Gender
    model_key : str

class TransactionPublic(TransactionBase):
    id: int
    uuid: UUID
    merchant_name: str  
    customer_id: int
    device_type: str
    transaction_status: Status  
    risk_score: float 
    confidence_score: float

class TransactionSummary(SQLModel):
    last_5_txn: Sequence[Transaction]
    avg_amount: float
    txn_count: int
    recent_txn_count: int
    merchant_freq: int

"""others"""

class Token(SQLModel):
    access_token: str
    token_type: str