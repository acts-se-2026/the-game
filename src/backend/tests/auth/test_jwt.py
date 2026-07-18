import jwt
import pytest

from app.auth.jwt import createSessionToken, decodeSessionToken
from app.config.config import config


def test_create_and_decode():
    token = createSessionToken("alice")

    payload = decodeSessionToken(token)

    assert payload.username == "alice"
    assert payload.session_id
    assert payload.exp > 0


def test_created_tokens_have_unique_session_ids():
    first = decodeSessionToken(createSessionToken("alice"))
    second = decodeSessionToken(createSessionToken("alice"))

    assert first.session_id != second.session_id


def test_decode_rejects_tampered_token():
    token = createSessionToken("alice")
    tampered = token + "garbage"

    with pytest.raises(jwt.InvalidTokenError):
        decodeSessionToken(tampered)


def test_decode_rejects_token_signed_with_wrong_key():
    bad_token = jwt.encode(
        {"username": "mallory", "session_id": "x", "exp": 9999999999},
        "wrong_secret",
        algorithm=config.JWT_ALGORITHM,
    )

    with pytest.raises(jwt.InvalidTokenError):
        decodeSessionToken(bad_token)
