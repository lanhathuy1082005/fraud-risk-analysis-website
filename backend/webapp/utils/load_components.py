import joblib, json, os

def load_model(file_name : str):
    model_path = f'saved_models/{file_name}.joblib'
    return joblib.load(model_path)
# Load the saved models and preprocessing files

def load_scaler():
    scaler_path = 'saved_models/scaler.joblib'
    return joblib.load(scaler_path)

def load_features(file_name: str):
    file_path = f'saved_models/{file_name}.json'
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"{file_path} not found")
    with open(file_path, 'r') as f:
        return json.load(f)