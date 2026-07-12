from fastapi import APIRouter

testRouter = APIRouter(prefix="/api/test", tags=["test"])

@testRouter.get("/")
def testEndpoint():
    return {"message": "Test endpoint"}
