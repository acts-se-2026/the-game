from datetime import datetime, timedelta, timezone
from uuid import uuid4

import jwt

from app.auth.types import SessionPayload
from app.config.config import config


def createSessionToken(username: str) -> str:
    """Create a signed JWT session token for a given username.

    The token payload includes `username`, a generated `session_id`, and `exp` set
    to now + `config.SESSION_DURATION_HOURS`. It is signed with `config.JWT_SECRET_KEY`.

    Args:
        username: Display name provided by the client at login.

    Returns:
        A JWT string suitable to be set as the session cookie value.
    """
    expires_at = datetime.now(timezone.utc) + timedelta(
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
    """Decode and validate a session token.

    Args:
        token: The JWT value read from the session cookie.

    Returns:
        `SessionPayload` parsed from the token claims.

    Raises:
        jwt.ExpiredSignatureError: When the token `exp` has passed.
        jwt.InvalidTokenError: When signature/format is invalid.
    """
    payload = jwt.decode(
        token,
        config.JWT_SECRET_KEY,
        algorithms=[config.JWT_ALGORITHM],
    )

    return SessionPayload(
        **payload
    )