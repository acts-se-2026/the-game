from datetime import UTC, datetime, timedelta
from uuid import uuid4

import jwt

from app.auth.types import SessionPayload
from app.config.config import config


def createSessionToken(username: str) -> str:
    expires_at = datetime.now(UTC) + timedelta(
        hours=config.SESSION_DURATION_HOURS
    )

    payload = {
        "username": username,
        "session_id": str(uuid4()),
        "exp": expires_at,
    }

    return jwt.encode(
        payload,
        config.JWT_SECRET_KEY,
        algorithm=config.JWT_ALGORITHM,
    )


def decodeSessionToken(token: str) -> SessionPayload:
    payload = jwt.decode(
        token,
        config.JWT_SECRET_KEY,
        algorithms=[config.JWT_ALGORITHM],
    )

    return SessionPayload(
        **payload
    )