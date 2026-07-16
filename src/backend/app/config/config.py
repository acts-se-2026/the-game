import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    #JWT / Auth
    JWT_SECRET_KEY = os.environ["JWT_SECRET_KEY"]
    JWT_ALGORITHM = "HS256"
    SESSION_DURATION_HOURS = 24
    JWT_COOKIE_NAME = "user_session"
    JWT_COOKIE_HTTP_ONLY = os.getenv(
        "COOKIE_HTTP_ONLY",
        "true"
    ).lower() == "true"
    JWT_COOKIE_SECURE = os.getenv(
        "COOKIE_SECURE",
        "false"
    ).lower() == "true"

    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


config = Config()