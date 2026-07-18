def test_get_all_rooms_returns_list(client):
    response = client.get("/api/rooms")

    assert response.status_code == 200
    assert "rooms" in response.json()
    assert isinstance(response.json()["rooms"], list)


def test_create_room_requires_authentication(client):
    client.cookies.clear()

    response = client.post("/api/rooms/create")

    assert response.status_code == 401


def test_create_room_when_authenticated(client):
    client.cookies.clear()
    client.post("/api/auth/login", json={"username": "alice"})

    response = client.post("/api/rooms/create")

    assert response.status_code == 200
    room_id = response.json()["room_id"]
    assert room_id.startswith("room-")


def test_created_room_appears_in_list(client):
    client.cookies.clear()
    client.post("/api/auth/login", json={"username": "alice"})

    created_id = client.post("/api/rooms/create").json()["room_id"]

    rooms = client.get("/api/rooms").json()["rooms"]
    listed_ids = [room["room_id"] for room in rooms]
    assert created_id in listed_ids

    created_room = next(room for room in rooms if room["room_id"] == created_id)
    assert created_room["players"] == []
