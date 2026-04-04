from datetime import datetime, timedelta, date
from models import Transaction
from core.config import settings
from core.deps import SessionDep
from sqlmodel import select

AGE_RANGES = [
    (18, '0'),
    (25, '1'),
    (35, '2'),
    (45, '3'),
    (55, '4'),
    (65, '5'),
]

def get_age_category(entered_date: datetime, customer_dob: date):
    if customer_dob >= entered_date.date():
        raise ValueError("Invalid date of birth")
    age = entered_date.year - customer_dob.year
    if (entered_date.month, entered_date.day) < (customer_dob.month, customer_dob.day):
        age -= 1


    for upper, category in AGE_RANGES:
        if age < upper:
            return category
    
    if age >= 65:
        return '6'
        

    return 'unknown'

def get_step(entered_date: datetime):
    if(entered_date <= settings.SIMULATION_START):
        raise ValueError("Cannot make a transaction before simulation time")
    delta = entered_date - settings.SIMULATION_START

    step = int(delta.total_seconds()//3600)
    return step


def get_rolling_mean_5(transaction_list: list[Transaction]): 

    if not transaction_list:
        return 0
    
    return sum(t.amount for t in transaction_list) / len(transaction_list)
    

import math

def get_rolling_std_5(transaction_list: list[Transaction]):

    if not transaction_list:
        return 0
    
    values = [t.amount for t in transaction_list]
    mean = sum(values) / len(values)
    
    variance = sum((x - mean) ** 2 for x in values) / len(values)
    
    return math.sqrt(variance)

def get_recent_txn_count(entered_date: datetime, customer_id: int, session: SessionDep):
    ten_hours_ago = entered_date - timedelta(hours=10)
    recent_txn = session.exec(
    select(Transaction)
    .where(Transaction.customer_id == customer_id)
    .where(Transaction.time >= ten_hours_ago)
    ).all()

    return len(recent_txn)

def get_last_5_txn(customer_id: int, session: SessionDep):
    last_5_txn = session.exec(select(Transaction)
    .where(Transaction.customer_id == customer_id)
    .order_by(Transaction.time.desc()).limit(5)).all()

    return last_5_txn

import math

def get_time_delta(current_time: datetime, last_time: datetime):
    return (current_time - last_time).total_seconds() / 3600
# helper function to update mean & M2 (sum of squares) for Welford
def update_welford(new_value: float, count: int, mean: float, M2: float):
    if count < 2:
        return mean, M2

    delta = new_value - mean
    mean += delta / count
    delta2 = new_value - mean
    M2 += delta * delta2
    return mean, M2

def get_z_score(new_value: float, count: int, mean: float, M2: float):
    if count < 2:
        return 0.0  
    std = math.sqrt(M2 / count)  # population std; or M2/(count-1) for sample std
    if std == 0:
        return 0.0
    return (new_value - mean) / std

def get_z_cap(z_score: float, cap: float):
    return min(abs(z_score), cap)/ cap
