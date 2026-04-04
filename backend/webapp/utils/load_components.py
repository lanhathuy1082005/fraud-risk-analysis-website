import joblib, json

def load_model(file_name : str):
    model_path = f'saved_models/{file_name}.joblib'
    return joblib.load(model_path)
# Load the saved models and preprocessing files

def load_features(file_name: str):
    file_path = f'saved_models/{file_name}.json'
    with open(file_path, 'r') as f:
        return json.load(f)