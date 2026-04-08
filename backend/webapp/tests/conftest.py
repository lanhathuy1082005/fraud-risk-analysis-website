import os
import sys
from pathlib import Path
from dotenv import load_dotenv

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

load_dotenv(Path(__file__).resolve().parents[1] / ".env.test.local")

import pytest
from fastapi.testclient import TestClient
from main import app
from sqlmodel import SQLModel, create_engine
import models

test_engine = create_engine(os.environ["DB_URL"])

@pytest.fixture(scope="session")
def client():
    SQLModel.metadata.drop_all(test_engine)
    SQLModel.metadata.create_all(test_engine)
    with TestClient(app) as client:
        yield client