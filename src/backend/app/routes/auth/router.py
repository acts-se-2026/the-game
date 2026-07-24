from typing import Annotated

from fastapi import APIRouter, Depends, Response
from pydantic import BaseModel

from app.auth.auth import getCurrentUser
from app.auth.jwt import createSessionToken
from app.auth.types import SessionPayload
from app.config.config import config

authRouter = APIRouter(prefix="/api/auth", tags=["auth"])

class LoginRequest(BaseModel):
    username: str

@authRouter.post("/login")
def login_endpoint(body: LoginRequest, response: Response):
    token = createSessionToken(body.username)

    response.set_cookie(
        key=config.JWT_COOKIE_NAME,
        value=token,
        secure=config.JWT_COOKIE_SECURE,
        httponly=config.JWT_COOKIE_HTTP_ONLY,
        samesite="lax",
        max_age=config.SESSION_DURATION_HOURS * 60 * 60,
    )

    return {"message": "Login successful"}

@authRouter.post("/logout")
def logout_endpoint(response: Response):
    response.delete_cookie(
        key=config.JWT_COOKIE_NAME,
        secure=config.JWT_COOKIE_SECURE,
        httponly=config.JWT_COOKIE_HTTP_ONLY,
        samesite="lax",
    )

    return {"message": "Logout successful"}

CurrentUser = Annotated[SessionPayload, Depends(getCurrentUser)]

@authRouter.get("/me")
def whoami_endpoint(user: CurrentUser):
    return {"username": user.username, "session_id": user.session_id, "exp": user.exp}
