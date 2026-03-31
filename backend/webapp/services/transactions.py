from core.deps import SessionDep
from sqlmodel import select
from models import Customer, Merchant, Transaction, TransactionInput

def input_transaction(data: TransactionInput, session: SessionDep):
    # upsert customer
    customer = session.exec(
        select(Customer).where(Customer.name == data.customer_name)
    ).first()
    if not customer:
        customer = Customer(name = data.customer_name, dob = data.customer_dob, gender = data.customer_gender)
        session.add(customer)
        session.flush()

    # upsert merchant
    merchant = session.exec(
        select(Merchant).where(Merchant.name == data.merchant_name)
    ).first()
    if not merchant:
        merchant = Merchant(name = data.merchant_name)
        session.add(merchant)
        session.flush()

    # create transaction
    transaction = Transaction(
        customer_id=customer.id,
        merchant_id=merchant.id,
        amount=data.amount,
        category=data.category,
    )

    return transaction