from app.config.config import config
from app.routes.auth import authRouter
from app.routes.rooms import roomsRouter
from app.routes.ws import wsRouter

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

ShowDocs = True

app = FastAPI(
    docs_url="/api/docs" if ShowDocs else None,
    openapi_url="/api/openapi.json" if ShowDocs else None,
    redoc_url="/api/redoc" if ShowDocs else None
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[config.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(wsRouter)
app.include_router(authRouter)
app.include_router(roomsRouter)