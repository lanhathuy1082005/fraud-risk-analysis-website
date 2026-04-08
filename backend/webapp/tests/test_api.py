import uuid


def make_unique_email() -> str:
    return f"user+{uuid.uuid4().hex[:8]}@example.com"


def auth_header(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def register_user(client, email: str | None = None, password: str = "secret123", name: str = "Test User"):
    email = email or make_unique_email()
    response = client.post(
        "/auth/register",
        json={"email": email, "name": name, "password": password},
    )
    return email, password, response


def login_user(client, email: str, password: str = "secret123"):
    return client.post(
        "/auth/token",
        json={"email": email, "password": password},
    )


def test_register_user_success(client):
    email, _, response = register_user(client)
    assert response.status_code == 200
    assert response.json() == {"message": "user_created"}


def test_register_duplicate_returns_400(client):
    email, _, response = register_user(client)
    assert response.status_code == 200

    duplicate = client.post(
        "/auth/register",
        json={"email": email, "name": "Test User", "password": "secret123"},
    )
    assert duplicate.status_code == 400
    assert duplicate.json()["detail"] == "Account already existed"


def test_login_success_returns_token(client):
    email, password, _ = register_user(client)
    response = login_user(client, email, password)

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_credentials_returns_400(client):
    response = client.post(
        "/auth/token",
        json={"email": "no-such-user@example.com", "password": "wrong"},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid credentials"


def test_auth_me_requires_authorization(client):
    response = client.get("/auth/me")
    assert response.status_code == 401
    assert "detail" in response.json()


def test_auth_me_returns_current_user(client):
    email, password, _ = register_user(client)
    token = login_user(client, email, password).json()["access_token"]

    response = client.get("/auth/me", headers=auth_header(token))
    assert response.status_code == 200
    payload = response.json()
    assert payload["email"] == email
    assert payload["name"] == "Test User"
    assert "uuid" in payload


def test_transactions_requires_authorization(client):
    response = client.get("/transactions/")
    assert response.status_code == 401


def test_transactions_returns_list_for_authenticated_user(client):
    email, password, _ = register_user(client)
    token = login_user(client, email, password).json()["access_token"]

    response = client.get("/transactions/?page=1&limit=5", headers=auth_header(token))
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_transactions_page_query_accepts_page_and_limit(client):
    email, password, _ = register_user(client)
    token = login_user(client, email, password).json()["access_token"]

    response = client.get("/transactions/?page=1&limit=1", headers=auth_header(token))
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_transaction_invalid_amount_returns_400(client):
    email, password, _ = register_user(client)
    token = login_user(client, email, password).json()["access_token"]

    payload = {
        "amount": -10.0,
        "time": "2025-06-01T12:00:00Z",
        "category": "es_food",
        "merchant_name": "Test Merchant",
        "customer_id": 1,
        "device_name": "Phone",
        "customer_dob": "1990-01-01",
        "customer_gender": "F",
        "model_key": "gb",
    }

    response = client.post("/transactions/", json=payload, headers=auth_header(token))
    assert response.status_code == 400
    assert "amount can't be lower than or equal to 0" in response.json()["detail"]
