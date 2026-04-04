from core.deps import SessionDep
from sqlmodel import select
from models import Customer, CustomerCategory, CustomerDevice, CustomerInput, Merchant, MerchantInput, Device, DeviceInput, TransactionInput
from utils.statistics import update_welford, get_z_score, get_time_delta

def upsert_merchant(merchant_data: MerchantInput, session: SessionDep):

    merchant = session.exec(
        select(Merchant).where(Merchant.name == merchant_data.name)
    ).first()

    if not merchant:
        merchant = Merchant(name= merchant_data.name, frequency= 1)
    else:
        merchant.frequency += 1

    session.add(merchant)
    session.flush()
    session.refresh(merchant)

    return merchant

def upsert_device(device_data: DeviceInput, session: SessionDep):
    device = session.exec(
        select(Device).where(Device.name == device_data.name)
    ).first()

    if not device:
        device = Device(name = device_data.name, frequency=1)
    else:
        device.frequency += 1 
    
    session.add(device)
    session.flush()
    session.refresh(device)
    
    return device

def upsert_customer(device: Device, customer_data: CustomerInput, session: SessionDep):
    customer = session.exec(
        select(Customer).where(Customer.id == customer_data.id)
    ).first()

    if not customer:        
        # initialize M2 values for Welford
        customer = Customer(
            id=customer_data.id, 
            dob=customer_data.dob, 
            gender=customer_data.gender,
            avg_amount=customer_data.amount,
            txn_count=1,
            avg_time_between_txn=0.0,
            last_txn_time=customer_data.time,
            avg_device_freq=device.frequency,
            device_count=1,
            amount_M2=0.0,
            time_M2=0.0,
            device_M2=0.0
        )
        z_scores = {"amount": 0.0,
                    "time": 0.0,
                    "device": 0.0
                    }
    else:
        if customer.last_txn_time and customer_data.time <= customer.last_txn_time:
            return None, None
        # increment counts
        customer.txn_count += 1
        customer.device_count += 1
        
        # hours
        txn_time_delta = get_time_delta(customer_data.time, customer.last_txn_time)

        # update averages using previous mean & count
        customer.avg_amount, customer.amount_M2 = update_welford(
            customer_data.amount, customer.txn_count, customer.avg_amount, customer.amount_M2
        )

        #calculated using the time difference between transactions so count is 1 unit lower
        customer.avg_time_between_txn, customer.time_M2 = update_welford(
            txn_time_delta, customer.txn_count-1, customer.avg_time_between_txn, customer.time_M2
        )

        customer.avg_device_freq, customer.device_M2 = update_welford(
            device.frequency, customer.device_count, customer.avg_device_freq, customer.device_M2
        )

        z_scores = {"amount": get_z_score(customer_data.amount, customer.txn_count, customer.avg_amount, customer.amount_M2),
                    "time": get_z_score(txn_time_delta, customer.txn_count, customer.avg_time_between_txn, customer.time_M2),
                    "device": get_z_score(device.frequency, customer.device_count, customer.avg_device_freq, customer.device_M2)
                    }

        #updates last transaction time
        customer.last_txn_time = customer_data.time

    session.add(customer)
    session.flush()
    session.refresh(customer)

    return customer, z_scores

# for risk score calcution
def upsert_customer_device(device: Device, customer: Customer, session: SessionDep):
    # upsert this interaction
    record = session.exec(
        select(CustomerDevice)
        .where(CustomerDevice.customer_id == customer.id)
        .where(CustomerDevice.device_id == device.id)
    ).first()

    if not record:
        record = CustomerDevice(customer_id=customer.id, device_id=device.id, frequency=1)
    else:
        record.frequency += 1

    session.add(record)
    session.flush()

    # get top device
    top = session.exec(
        select(CustomerDevice)
        .where(CustomerDevice.customer_id == customer.id)
        .order_by(CustomerDevice.frequency.desc())
    ).first()

    return top
def upsert_customer_category(txn_data: TransactionInput, customer:Customer, session: SessionDep):
    record = session.exec(
        select(CustomerCategory)
        .where(CustomerCategory.customer_id == customer.id)
        .where(CustomerCategory.category == txn_data.category)
    ).first()
    
    if not record:
        record = CustomerCategory(customer_id=customer.id,category=txn_data.category, frequency=1)
    else:
        record.frequency +=1

    session.add(record)
    session.flush()


    top = session.exec(
        select(CustomerCategory)
        .where(CustomerCategory.customer_id == customer.id)
        .where(CustomerCategory.category == txn_data.category)
        .order_by(CustomerCategory.frequency.desc())
        ).first()

    return top