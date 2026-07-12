
def test_test_endpoint(client):
    response = client.get("/api/test")
    assert response.status_code == 200
