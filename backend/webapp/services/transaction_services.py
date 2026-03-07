from .fraud_detection import detect_fraud


mock_transactions = [
    {"id": 1,  "step": 1,  "customer_id": 1, "merchant": "Walmart",     "merchant_freq": 0.12,  "category": "es_grocery",        "amount": 135.10,  "amount_log": 4.9134, "customer_avg_amount": 85.0, "amount_deviation": 50.10,   "fraud": 0, "fraud_score": None, "confidence_score": None},
    {"id": 2,  "step": 2,  "customer_id": 1, "merchant": "Amazon",      "merchant_freq": 0.15,  "category": "es_health",         "amount": 24.50,   "amount_log": 3.2387, "customer_avg_amount": 85.0, "amount_deviation": -60.50,  "fraud": 0, "fraud_score": None, "confidence_score": None},
    {"id": 3,  "step": 3,  "customer_id": 1, "merchant": "Amazon",      "merchant_freq": 0.15,  "category": "es_leisure",        "amount": 69.51,   "amount_log": 4.2558, "customer_avg_amount": 85.0, "amount_deviation": -15.49,  "fraud": 0, "fraud_score": None, "confidence_score": None},
    {"id": 4,  "step": 4,  "customer_id": 1, "merchant": "Walmart",     "merchant_freq": 0.12,  "category": "es_leisure",        "amount": 60.18,   "amount_log": 4.1138, "customer_avg_amount": 85.0, "amount_deviation": -24.82,  "fraud": 0, "fraud_score": None, "confidence_score": None},
    {"id": 5,  "step": 5,  "customer_id": 1, "merchant": "Amazon",      "merchant_freq": 0.15,  "category": "es_health",         "amount": 152.56,  "amount_log": 5.0341, "customer_avg_amount": 85.0, "amount_deviation": 67.56,   "fraud": 0, "fraud_score": None, "confidence_score": None},
    {"id": 6,  "step": 6,  "customer_id": 1, "merchant": "Uber",        "merchant_freq": 0.09,  "category": "es_grocery",        "amount": 141.81,  "amount_log": 4.9615, "customer_avg_amount": 85.0, "amount_deviation": 56.81,   "fraud": 0, "fraud_score": None, "confidence_score": None},
    {"id": 7,  "step": 7,  "customer_id": 1, "merchant": "Netflix",     "merchant_freq": 0.08,  "category": "es_grocery",        "amount": 180.59,  "amount_log": 5.2018, "customer_avg_amount": 85.0, "amount_deviation": 95.59,   "fraud": 0, "fraud_score": None, "confidence_score": None},
    {"id": 8,  "step": 8,  "customer_id": 1, "merchant": "Uber",        "merchant_freq": 0.09,  "category": "es_leisure",        "amount": 35.65,   "amount_log": 3.6014, "customer_avg_amount": 85.0, "amount_deviation": -49.35,  "fraud": 0, "fraud_score": None, "confidence_score": None},
    {"id": 9,  "step": 9,  "customer_id": 1, "merchant": "Uber",        "merchant_freq": 0.09,  "category": "es_leisure",        "amount": 95.95,   "amount_log": 4.5742, "customer_avg_amount": 85.0, "amount_deviation": 10.95,   "fraud": 0, "fraud_score": None, "confidence_score": None},
    {"id": 10, "step": 10, "customer_id": 1, "merchant": "Uber",        "merchant_freq": 0.09,  "category": "es_transportation", "amount": 25.36,   "amount_log": 3.2718, "customer_avg_amount": 85.0, "amount_deviation": -59.64,  "fraud": 0, "fraud_score": None, "confidence_score": None},
    {"id": 11, "step": 11, "customer_id": 1, "merchant": "Amazon",      "merchant_freq": 0.15,  "category": "es_grocery",        "amount": 59.35,   "amount_log": 4.1002, "customer_avg_amount": 85.0, "amount_deviation": -25.65,  "fraud": 0, "fraud_score": None, "confidence_score": None},
    {"id": 12, "step": 12, "customer_id": 1, "merchant": "Shell",       "merchant_freq": 0.10,  "category": "es_leisure",        "amount": 110.96,  "amount_log": 4.7181, "customer_avg_amount": 85.0, "amount_deviation": 25.96,   "fraud": 0, "fraud_score": None, "confidence_score": None},
    {"id": 13, "step": 13, "customer_id": 1, "merchant": "Amazon",      "merchant_freq": 0.15,  "category": "es_transportation", "amount": 24.78,   "amount_log": 3.2496, "customer_avg_amount": 85.0, "amount_deviation": -60.22,  "fraud": 0, "fraud_score": None, "confidence_score": None},
    {"id": 14, "step": 14, "customer_id": 1, "merchant": "Amazon",      "merchant_freq": 0.15,  "category": "es_health",         "amount": 55.79,   "amount_log": 4.0394, "customer_avg_amount": 85.0, "amount_deviation": -29.21,  "fraud": 0, "fraud_score": None, "confidence_score": None},
    {"id": 15, "step": 15, "customer_id": 1, "merchant": "Walmart",     "merchant_freq": 0.12,  "category": "es_health",         "amount": 136.98,  "amount_log": 4.9271, "customer_avg_amount": 85.0, "amount_deviation": 51.98,   "fraud": 0, "fraud_score": None, "confidence_score": None},
    {"id": 16, "step": 16, "customer_id": 1, "merchant": "Walmart",     "merchant_freq": 0.12,  "category": "es_transportation", "amount": 118.09,  "amount_log": 4.7799, "customer_avg_amount": 85.0, "amount_deviation": 33.09,   "fraud": 0, "fraud_score": None, "confidence_score": None},
    {"id": 17, "step": 17, "customer_id": 1, "merchant": "Walmart",     "merchant_freq": 0.12,  "category": "es_leisure",        "amount": 59.68,   "amount_log": 4.1056, "customer_avg_amount": 85.0, "amount_deviation": -25.32,  "fraud": 0, "fraud_score": None, "confidence_score": None},
    {"id": 18, "step": 18, "customer_id": 1, "merchant": "Shell",       "merchant_freq": 0.10,  "category": "es_leisure",        "amount": 126.07,  "amount_log": 4.8447, "customer_avg_amount": 85.0, "amount_deviation": 41.07,   "fraud": 0, "fraud_score": None, "confidence_score": None},
    {"id": 19, "step": 19, "customer_id": 1, "merchant": "Amazon",      "merchant_freq": 0.15,  "category": "es_transportation", "amount": 165.70,  "amount_log": 5.1162, "customer_avg_amount": 85.0, "amount_deviation": 80.70,   "fraud": 0, "fraud_score": None, "confidence_score": None},
    {"id": 20, "step": 20, "customer_id": 1, "merchant": "Uber",        "merchant_freq": 0.09,  "category": "es_transportation", "amount": 21.17,   "amount_log": 3.0987, "customer_avg_amount": 85.0, "amount_deviation": -63.83,  "fraud": 0, "fraud_score": None, "confidence_score": None},
    {"id": 21, "step": 21, "customer_id": 1, "merchant": "Shell",       "merchant_freq": 0.10,  "category": "es_health",         "amount": 165.05,  "amount_log": 5.1123, "customer_avg_amount": 85.0, "amount_deviation": 80.05,   "fraud": 0, "fraud_score": None, "confidence_score": None},
    {"id": 22, "step": 22, "customer_id": 1, "merchant": "Netflix",     "merchant_freq": 0.08,  "category": "es_leisure",        "amount": 145.67,  "amount_log": 4.9882, "customer_avg_amount": 85.0, "amount_deviation": 60.67,   "fraud": 0, "fraud_score": None, "confidence_score": None},
    {"id": 23, "step": 23, "customer_id": 1, "merchant": "Uber",        "merchant_freq": 0.09,  "category": "es_transportation", "amount": 81.25,   "amount_log": 4.4098, "customer_avg_amount": 85.0, "amount_deviation": -3.75,   "fraud": 0, "fraud_score": None, "confidence_score": None},
    {"id": 24, "step": 24, "customer_id": 1, "merchant": "Walmart",     "merchant_freq": 0.12,  "category": "es_grocery",        "amount": 47.99,   "amount_log": 3.8916, "customer_avg_amount": 85.0, "amount_deviation": -37.01,  "fraud": 0, "fraud_score": None, "confidence_score": None},

    # --- Fraudulent transactions (steps 25-28) ---
    {"id": 25, "step": 25, "customer_id": 1, "merchant": "XYZ_Shop",    "merchant_freq": 0.002, "category": "es_sportsandtoys",  "amount": 1303.91, "amount_log": 7.1739, "customer_avg_amount": 85.0, "amount_deviation": 1218.91, "fraud": 1, "fraud_score": None, "confidence_score": None},
    {"id": 26, "step": 26, "customer_id": 1, "merchant": "XYZ_Shop",    "merchant_freq": 0.002, "category": "es_sportsandtoys",  "amount": 870.62,  "amount_log": 6.7704, "customer_avg_amount": 85.0, "amount_deviation": 785.62,  "fraud": 1, "fraud_score": None, "confidence_score": None},
    {"id": 27, "step": 27, "customer_id": 1, "merchant": "QuickCash99", "merchant_freq": 0.001, "category": "es_sportsandtoys",  "amount": 1494.00, "amount_log": 7.3099, "customer_avg_amount": 85.0, "amount_deviation": 1409.00, "fraud": 1, "fraud_score": None, "confidence_score": None},
    {"id": 28, "step": 28, "customer_id": 1, "merchant": "XYZ_Shop",    "merchant_freq": 0.002, "category": "es_sportsandtoys",  "amount": 1389.03, "amount_log": 7.2371, "customer_avg_amount": 85.0, "amount_deviation": 1304.03, "fraud": 1, "fraud_score": None, "confidence_score": None},
]





def get_all_mock_transactions():
    return mock_transactions

def detect_fraud_for_all_transactions():
    for t in mock_transactions:
        result = detect_fraud(t)
        t["fraud_score"] = result["fraud_score"]
        t["confidence_score"] = result["confidence_score"]
    return mock_transactions

def detect_fraud_for_transaction(transaction_id: int):
    transaction = mock_transactions[transaction_id - 1]  # -1 because id starts at 1, index at 0
    result = detect_fraud(transaction)
    transaction["fraud_score"] = result["fraud_score"]
    transaction["confidence_score"] = result["confidence_score"]
    return transaction