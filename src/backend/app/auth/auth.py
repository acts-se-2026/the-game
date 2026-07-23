import jwt
from fastapi import Cookie, HTTPException

from app.config.config import config

from .jwt import decodeSessionToken
from .types import SessionPayload


async def getCurrentUser(session: str | None = Cookie(None, alias=config.JWT_COOKIE_NAME)) -> SessionPayload:
    """FastAPI dependency that validates the session cookie and returns the user payload.

    Reads the JWT cookie named by `config.JWT_COOKIE_NAME`, validates it and returns
    a `SessionPayload`. Raises `HTTPException(401)` when the cookie is missing,
    expired, or invalid.

    Args:
        session: JWT cookie value injected by FastAPI from the incoming request.

    Returns:
        Parsed `SessionPayload` for the authenticated user.
    """
    if session is None:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated",
        )

    try:
        return decodeSessionToken(session)

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Session expired",
        )

    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
        )