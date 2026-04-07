from core.deps import SessionDep
from routes.transactions import create_transaction
from requests import Request
from models import  TransactionInput
import random

DEVICES = ["phone","pc","tablet"]
MODEL_KEY = ["log", "gb", "rf"]



def mock_transactions(n=10000):
        for _ in range(n):
            txn_data = TransactionInput()
            create_transaction(txn_data)


mock_transactions()