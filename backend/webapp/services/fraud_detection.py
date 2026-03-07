import random


mock_transactions = [
    {"step": 1,  "customer_id": 1, "merchant": "Walmart",     "merchant_freq": 0.12,  "category": "es_grocery",        "amount": 135.10,  "amount_log": 4.9134, "customer_avg_amount": 85.0, "amount_deviation": 50.10,   "fraud": 0},
    {"step": 2,  "customer_id": 1, "merchant": "Amazon",      "merchant_freq": 0.15,  "category": "es_health",         "amount": 24.50,   "amount_log": 3.2387, "customer_avg_amount": 85.0, "amount_deviation": -60.50,  "fraud": 0},
    {"step": 3,  "customer_id": 1, "merchant": "Amazon",      "merchant_freq": 0.15,  "category": "es_leisure",        "amount": 69.51,   "amount_log": 4.2558, "customer_avg_amount": 85.0, "amount_deviation": -15.49,  "fraud": 0},
    {"step": 4,  "customer_id": 1, "merchant": "Walmart",     "merchant_freq": 0.12,  "category": "es_leisure",        "amount": 60.18,   "amount_log": 4.1138, "customer_avg_amount": 85.0, "amount_deviation": -24.82,  "fraud": 0},
    {"step": 5,  "customer_id": 1, "merchant": "Amazon",      "merchant_freq": 0.15,  "category": "es_health",         "amount": 152.56,  "amount_log": 5.0341, "customer_avg_amount": 85.0, "amount_deviation": 67.56,   "fraud": 0},
    {"step": 6,  "customer_id": 1, "merchant": "Uber",        "merchant_freq": 0.09,  "category": "es_grocery",        "amount": 141.81,  "amount_log": 4.9615, "customer_avg_amount": 85.0, "amount_deviation": 56.81,   "fraud": 0},
    {"step": 7,  "customer_id": 1, "merchant": "Netflix",     "merchant_freq": 0.08,  "category": "es_grocery",        "amount": 180.59,  "amount_log": 5.2018, "customer_avg_amount": 85.0, "amount_deviation": 95.59,   "fraud": 0},
    {"step": 8,  "customer_id": 1, "merchant": "Uber",        "merchant_freq": 0.09,  "category": "es_leisure",        "amount": 35.65,   "amount_log": 3.6014, "customer_avg_amount": 85.0, "amount_deviation": -49.35,  "fraud": 0},
    {"step": 9,  "customer_id": 1, "merchant": "Uber",        "merchant_freq": 0.09,  "category": "es_leisure",        "amount": 95.95,   "amount_log": 4.5742, "customer_avg_amount": 85.0, "amount_deviation": 10.95,   "fraud": 0},
    {"step": 10, "customer_id": 1, "merchant": "Uber",        "merchant_freq": 0.09,  "category": "es_transportation", "amount": 25.36,   "amount_log": 3.2718, "customer_avg_amount": 85.0, "amount_deviation": -59.64,  "fraud": 0},
    {"step": 11, "customer_id": 1, "merchant": "Amazon",      "merchant_freq": 0.15,  "category": "es_grocery",        "amount": 59.35,   "amount_log": 4.1002, "customer_avg_amount": 85.0, "amount_deviation": -25.65,  "fraud": 0},
    {"step": 12, "customer_id": 1, "merchant": "Shell",       "merchant_freq": 0.10,  "category": "es_leisure",        "amount": 110.96,  "amount_log": 4.7181, "customer_avg_amount": 85.0, "amount_deviation": 25.96,   "fraud": 0},
    {"step": 13, "customer_id": 1, "merchant": "Amazon",      "merchant_freq": 0.15,  "category": "es_transportation", "amount": 24.78,   "amount_log": 3.2496, "customer_avg_amount": 85.0, "amount_deviation": -60.22,  "fraud": 0},
    {"step": 14, "customer_id": 1, "merchant": "Amazon",      "merchant_freq": 0.15,  "category": "es_health",         "amount": 55.79,   "amount_log": 4.0394, "customer_avg_amount": 85.0, "amount_deviation": -29.21,  "fraud": 0},
    {"step": 15, "customer_id": 1, "merchant": "Walmart",     "merchant_freq": 0.12,  "category": "es_health",         "amount": 136.98,  "amount_log": 4.9271, "customer_avg_amount": 85.0, "amount_deviation": 51.98,   "fraud": 0},
    {"step": 16, "customer_id": 1, "merchant": "Walmart",     "merchant_freq": 0.12,  "category": "es_transportation", "amount": 118.09,  "amount_log": 4.7799, "customer_avg_amount": 85.0, "amount_deviation": 33.09,   "fraud": 0},
    {"step": 17, "customer_id": 1, "merchant": "Walmart",     "merchant_freq": 0.12,  "category": "es_leisure",        "amount": 59.68,   "amount_log": 4.1056, "customer_avg_amount": 85.0, "amount_deviation": -25.32,  "fraud": 0},
    {"step": 18, "customer_id": 1, "merchant": "Shell",       "merchant_freq": 0.10,  "category": "es_leisure",        "amount": 126.07,  "amount_log": 4.8447, "customer_avg_amount": 85.0, "amount_deviation": 41.07,   "fraud": 0},
    {"step": 19, "customer_id": 1, "merchant": "Amazon",      "merchant_freq": 0.15,  "category": "es_transportation", "amount": 165.70,  "amount_log": 5.1162, "customer_avg_amount": 85.0, "amount_deviation": 80.70,   "fraud": 0},
    {"step": 20, "customer_id": 1, "merchant": "Uber",        "merchant_freq": 0.09,  "category": "es_transportation", "amount": 21.17,   "amount_log": 3.0987, "customer_avg_amount": 85.0, "amount_deviation": -63.83,  "fraud": 0},
    {"step": 21, "customer_id": 1, "merchant": "Shell",       "merchant_freq": 0.10,  "category": "es_health",         "amount": 165.05,  "amount_log": 5.1123, "customer_avg_amount": 85.0, "amount_deviation": 80.05,   "fraud": 0},
    {"step": 22, "customer_id": 1, "merchant": "Netflix",     "merchant_freq": 0.08,  "category": "es_leisure",        "amount": 145.67,  "amount_log": 4.9882, "customer_avg_amount": 85.0, "amount_deviation": 60.67,   "fraud": 0},
    {"step": 23, "customer_id": 1, "merchant": "Uber",        "merchant_freq": 0.09,  "category": "es_transportation", "amount": 81.25,   "amount_log": 4.4098, "customer_avg_amount": 85.0, "amount_deviation": -3.75,   "fraud": 0},
    {"step": 24, "customer_id": 1, "merchant": "Walmart",     "merchant_freq": 0.12,  "category": "es_grocery",        "amount": 47.99,   "amount_log": 3.8916, "customer_avg_amount": 85.0, "amount_deviation": -37.01,  "fraud": 0},

    # --- Fraudulent transactions (steps 25-28) ---
    # Signals: obscure merchants, unusual categories, amounts 10-17x customer avg
    {"step": 25, "customer_id": 1, "merchant": "XYZ_Shop",    "merchant_freq": 0.002, "category": "es_sportsandtoys",  "amount": 1303.91, "amount_log": 7.1739, "customer_avg_amount": 85.0, "amount_deviation": 1218.91, "fraud": 1},
    {"step": 26, "customer_id": 1, "merchant": "XYZ_Shop",    "merchant_freq": 0.002, "category": "es_sportsandtoys",  "amount": 870.62,  "amount_log": 6.7704, "customer_avg_amount": 85.0, "amount_deviation": 785.62,  "fraud": 1},
    {"step": 27, "customer_id": 1, "merchant": "QuickCash99", "merchant_freq": 0.001, "category": "es_sportsandtoys",  "amount": 1494.00, "amount_log": 7.3099, "customer_avg_amount": 85.0, "amount_deviation": 1409.00, "fraud": 1},
    {"step": 28, "customer_id": 1, "merchant": "XYZ_Shop",    "merchant_freq": 0.002, "category": "es_sportsandtoys",  "amount": 1389.03, "amount_log": 7.2371, "customer_avg_amount": 85.0, "amount_deviation": 1304.03, "fraud": 1},
]


AVG_MERCHANT_FREQ = sum(t["merchant_freq"] for t in mock_transactions) / len(mock_transactions)
AVG_AMOUNT_LOG = sum(t["amount_log"] for t in mock_transactions) / len(mock_transactions)
AVG_AMOUNT_DEVIATION = sum(abs(t["amount_deviation"]) for t in mock_transactions) / len(mock_transactions)

def detect_fraud(transaction: dict) -> dict:
    score = 0.0

    if transaction["amount_log"] > AVG_AMOUNT_LOG:
        score += 0.4

    if transaction["merchant_freq"] < AVG_MERCHANT_FREQ:
        score += 0.3
    
    if abs(transaction["amount_deviation"]) > AVG_AMOUNT_DEVIATION:
        score += 0.2

    if transaction["category"] in ["es_sportsandtoys", "es_electronics"]:
        score += 0.1

    return {
        "fraud_score": min(round(score, 2), 1.0),
        "confidence_score": round(random.uniform(0.5, 1.0), 2)
    }



