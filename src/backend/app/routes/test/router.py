from fastapi import APIRouter

testRouter = APIRouter(prefix="/test", tags=["test"])

@testRouter.get("/")
def testEndpoint():
    return {"message": "Test endpoint"}
