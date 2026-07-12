
def test_test_endpoint(client):
    response = client.get("/test")
    assert response.status_code == 200
