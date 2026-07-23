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
def loginEndpoint(body: LoginRequest, response: Response):
    """Issue a session cookie for the provided username.

    Sets the signed JWT in a cookie named by `config.JWT_COOKIE_NAME` with attributes
    controlled by environment configuration. The response body contains a simple
    message; subsequent requests should include the cookie automatically.
    """
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
def logoutEndpoint(response: Response):
    """Clear the session cookie and end the authenticated session."""
    response.delete_cookie(
        key=config.JWT_COOKIE_NAME,
        secure=config.JWT_COOKIE_SECURE,
        httponly=config.JWT_COOKIE_HTTP_ONLY,
        samesite="lax",
    )

    return {"message": "Logout successful"}

@authRouter.get("/me")
def whoamiEndpoint(user: SessionPayload = Depends(getCurrentUser)):
    """Return basic information about the current authenticated user."""
    return {"username": user.username, "session_id": user.session_id, "exp": user.exp}
