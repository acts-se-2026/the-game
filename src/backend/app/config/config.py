import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    #JWT / Auth
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "default_secret_key")
    JWT_ALGORITHM = "HS256"
    SESSION_DURATION_HOURS = 24
    JWT_COOKIE_NAME = "user_session"
    JWT_COOKIE_HTTP_ONLY = os.environ.get(
        "COOKIE_HTTP_ONLY",
        "true"
    ).lower() == "true"
    JWT_COOKIE_SECURE = os.environ.get(
        "COOKIE_SECURE",
        "false"
    ).lower() == "true"

    FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")


config = Config()