from load_components import *
from utils import *
from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the model
    app.state.models = {"gb": load_model("gb_model"),
                        "log": load_model("log_model"),
                        "rf": load_model("rf_model")}
    app.state.scaler = load_scaler()

    # Load feature information
    app.state.feature_columns = load_features("feature_columns")
    app.state.dummy_columns = load_features("dummy_columns")
    app.state.constants = load_features("feature_engineering_constants")
    yield

app = FastAPI(lifespan=lifespan)

origins = ["http://127.0.0.1:8000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)



@app.post("/predict")
def predict_transaction(model_key : str, data : TransactionInput):

    df = generate_data(app, data)
    chosen_model = app.state.models[model_key]

    # Scale the features (assuming the app.state.scaler was fit on the same features)
    print(df.shape)   # should be (1, 38)
    print(df.head())  # show the actual values
    scaled_features = app.state.scaler.transform(df)
    scaled_df = pd.DataFrame(scaled_features, columns=app.state.feature_columns)
    # Make prediction
    prediction = chosen_model.predict(df)
    prediction_proba = chosen_model.predict_proba(df)
    # real prediction_proba:
    """    
    w_amount = 0.4
    w_device = 0.3
    w_time = 0.3

    df_ieee_clean["confidence_score"] = (
        w_amount * df_ieee_clean["amount_anomaly"]
        + w_device * df_ieee_clean["device_anomaly"]
        + w_time * df_ieee_clean["time_anomaly"]
    )
    """

    return {
    "prediction": int(prediction[0]),
    "confidence_score": float(prediction_proba[0][1])  # probability of class 1
    }

