import pandas as pd
import numpy as np
from fastapi import FastAPI
from models import TransactionInput, TransactionSummary, Customer, CustomerCategory, CustomerDevice
from utils.statistics import *


def generate_data(app : FastAPI,  txn_data: TransactionInput, txn_summary: TransactionSummary):

    transaction_data = {
        'step': [get_step(txn_data.time)],
        'amount': [txn_data.amount],
        'age': [get_age_category(txn_data.time,txn_data.customer_dob)],
        'gender': [f"'{txn_data.customer_gender.value}'"],
        'category': [f"'{txn_data.category.value}'"],
    }
    df = pd.DataFrame(transaction_data)

    df_encoded = pd.get_dummies(df, columns=['age', 'gender', 'category'], prefix=['age', 'gender', 'category'])

    df_encoded['amount_log'] = np.log1p(df_encoded['amount'])
    df_encoded['transaction_count'] = txn_summary.txn_count
    df_encoded['customer_avg_amount'] = txn_summary.avg_amount or app.state.constants['global_customer_avg_amount_fallback'] #not resolved
    df_encoded['amount_deviation'] = df_encoded['amount'] - df_encoded['customer_avg_amount']
    df_encoded['rolling_mean_5'] = get_rolling_mean_5(txn_summary.last_5_txn)
    df_encoded['rolling_std_5'] = get_rolling_std_5(txn_summary.last_5_txn)
    df_encoded['amount_zscore'] = np.where( df_encoded['rolling_std_5'] != 0, df_encoded['amount_deviation'] / df_encoded['rolling_std_5'], 0)
    df_encoded['new_merchant'] = int(txn_summary.txn_count == 1)
    df_encoded['merchant_freq'] = txn_summary.merchant_freq
    df_encoded['recent_txn_count'] = txn_summary.recent_txn_count
    df_encoded['high_amount_flag'] = 1 if df_encoded['amount'].iloc[0] > app.state.constants['high_amount_threshold_p95'] else 0

    df_encoded = df_encoded.reindex(columns=app.state.feature_columns, fill_value=0)
    df_encoded = df_encoded.astype(float)

    return df_encoded


def get_conf_score(app: FastAPI, txn_data: TransactionInput, txn_summary: TransactionSummary):

    df = generate_data(app=app,txn_data=txn_data,txn_summary=txn_summary)
    chosen_model = app.state.models[txn_data.model_key]

    conf_score = chosen_model.predict_proba(df)

    return round(float(conf_score[0][1]), 2)

Z_CAP = 5.0

def get_risk_score(
                z_scores: dict[str,float], 
                txn_data: TransactionInput, 
                customer: Customer, 
                c_d_data: CustomerDevice, 
                c_c_data: CustomerCategory):
    w_amount = 0.4
    w_device = 0.3
    w_time = 0.3
    penalties = 0.0

    if txn_data.customer_dob != customer.dob:
        penalties += 0.5

    if txn_data.customer_gender != customer.gender:
        penalties += 0.4
    
    if c_d_data and txn_data.device_name != c_d_data.device.name:
        penalties += 0.15

    if c_c_data and txn_data.category != c_c_data.category:
        penalties += 0.05

    risk_score = (
    w_amount * get_z_cap(z_scores["amount"], Z_CAP) #amount_anomaly
    + w_device * get_z_cap(z_scores["device"], Z_CAP) #device_anomaly
    + w_time * get_z_cap(z_scores["time"], Z_CAP) #time_anomaly
    )


    return round(min( risk_score + penalties , 1.0), 2)