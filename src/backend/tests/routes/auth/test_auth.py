from app.config.config import config


def test_login_sets_session_cookie(client):
    response = client.post("/api/auth/login", json={"username": "alice"})

    assert response.status_code == 200
    assert response.json() == {"message": "Login successful"}
    assert config.JWT_COOKIE_NAME in response.cookies


def test_login_requires_username(client):
    response = client.post("/api/auth/login", json={})

    assert response.status_code == 422


def test_me_requires_authentication(client):
    client.cookies.clear()

    response = client.get("/api/auth/me")

    assert response.status_code == 401


def test_me_returns_current_user_after_login(client):
    client.cookies.clear()
    client.post("/api/auth/login", json={"username": "bob"})

    response = client.get("/api/auth/me")

    assert response.status_code == 200
    assert response.json()["username"] == "bob"


def test_logout_clears_session(client):
    client.post("/api/auth/login", json={"username": "carol"})

    response = client.post("/api/auth/logout")
    assert response.status_code == 200
    assert response.json() == {"message": "Logout successful"}

    assert client.get("/api/auth/me").status_code == 401
