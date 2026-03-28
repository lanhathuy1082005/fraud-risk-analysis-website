from sqlmodel import Field, SQLModel
from uuid import UUID, uuid4
from pydantic import EmailStr
from datetime import date, datetime

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
    name: str
    dob: date
    gender: str

class Merchant(SQLModel, table=True):
    __tablename__ = "merchants"
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(unique=True)

class Category(SQLModel, table=True):
    __tablename__ = "categories"
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(unique=True)  

class TransactionBase(SQLModel):
    merchant_id: int = Field(foreign_key="merchants.id")
    customer_id: int = Field(foreign_key="customers.id")
    category_id: int = Field(foreign_key="categories.id")
    amount: float
    time: datetime
    


class Transaction(TransactionBase, table=True):
    __tablename__ = "transactions"
    id: int | None = Field(default=None, primary_key=True)
    uuid: UUID = Field(default_factory=uuid4,index=True, unique=True)
    risk: float | None = None
    confidence: float | None = None


class TransactionReview(SQLModel, table=True):
    __tablename__ = "transaction_reviews"
    id: int | None = Field(default=None, primary_key=True)
    transaction_id: int = Field(foreign_key="transactions.id")
    status: str  # APPROVED | FLAGGED | PENDING
    reviewed_by_user: int | None = None 
    reviewed_at: datetime | None = None

"""others"""

class Token(SQLModel):
    access_token: str
    token_type: str