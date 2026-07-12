from fastapi import FastAPI
from app.routes.test import testRouter
from app.routes.ws import wsRouter

ShowDocs = True

app = FastAPI(
    docs_url="/api/docs" if ShowDocs else None,
    openapi_url="/api/openapi.json" if ShowDocs else None,
    redoc_url="/api/redoc" if ShowDocs else None
)

app.include_router(testRouter)
app.include_router(wsRouter)