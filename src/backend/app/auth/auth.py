import jwt
from fastapi import Cookie, HTTPException

from app.config.config import config

from .jwt import decodeSessionToken
from .types import SessionPayload


async def getCurrentUser(session: str | None = Cookie(None, alias=config.JWT_COOKIE_NAME)) -> SessionPayload:
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