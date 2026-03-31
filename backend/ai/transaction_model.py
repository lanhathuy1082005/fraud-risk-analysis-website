from pydantic import BaseModel
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

class TransactionInput(BaseModel):
    amount: float
    step: int #calculated from webapp
    category: Category
    age: str   #age group, also categorized in the webapp 
    gender: Gender

    #metadata
    transaction_count: int
    customer_avg_amount: float
    rolling_mean_5: float
    rolling_std_5: float
    new_merchant: bool
    merchant_freq: int
    recent_txn_count: int
