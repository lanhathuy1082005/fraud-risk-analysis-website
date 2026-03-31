from fastapi import FastAPI
import pandas as pd
import numpy as np
from transaction_model import TransactionInput

def generate_data(app: FastAPI, data: TransactionInput):
    transaction_data = {
        'step': [data.step],
        'amount': [data.amount],
        'age': [data.age],
        'gender': [f"'{data.gender.value}'"],
        'category': [f"'{data.category.value}'"],
    }
    df = pd.DataFrame(transaction_data)
    print("=== RAW ===")
    print(df)

    df_encoded = pd.get_dummies(df, columns=['age', 'gender', 'category'], prefix=['age', 'gender', 'category'])
    print("=== AFTER GET_DUMMIES ===")
    print(df_encoded.columns.tolist())

    df_encoded['amount_log'] = np.log1p(df_encoded['amount'])
    df_encoded['transaction_count'] = data.transaction_count
    df_encoded['customer_avg_amount'] = data.customer_avg_amount or app.state.constants['global_customer_avg_amount_fallback']
    df_encoded['amount_deviation'] = df_encoded['amount'] - df_encoded['customer_avg_amount']
    df_encoded['rolling_mean_5'] = data.rolling_mean_5
    df_encoded['rolling_std_5'] = data.rolling_std_5
    df_encoded['amount_zscore'] = (
        df_encoded['amount_deviation'] / data.rolling_std_5
        if data.rolling_std_5 != 0 else 0
    )
    df_encoded['new_merchant'] = int(data.new_merchant)
    df_encoded['merchant_freq'] = data.merchant_freq
    df_encoded['recent_txn_count'] = data.recent_txn_count
    df_encoded['high_amount_flag'] = 1 if df_encoded['amount'].iloc[0] > app.state.constants['high_amount_threshold_p95'] else 0
    print("=== AFTER FEATURE ENGINEERING ===")
    print(df_encoded[['amount', 'amount_log', 'amount_zscore', 'high_amount_flag', 'new_merchant', 'recent_txn_count']].to_dict('records'))

    df_encoded = df_encoded.reindex(columns=app.state.feature_columns, fill_value=0)
    df_encoded = df_encoded.astype(float)
    print("=== FINAL SHAPE ===")
    print(df_encoded.shape)  # should be (1, 38)
    print("=== KEY FRAUD SIGNALS ===")
    print(f"high_amount_flag: {df_encoded['high_amount_flag'].values[0]}")
    print(f"amount_zscore: {df_encoded['amount_zscore'].values[0]}")
    print(f"new_merchant: {df_encoded['new_merchant'].values[0]}")
    print(f"recent_txn_count: {df_encoded['recent_txn_count'].values[0]}")

    return df_encoded