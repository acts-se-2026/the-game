from fastapi import FastAPI
from app.routes.test import testRouter

app = FastAPI()

app.include_router(testRouter)