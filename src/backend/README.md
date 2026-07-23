### Backend — FastAPI Service

This service exposes HTTP APIs and WebSocket endpoints for the game. It uses FastAPI, Uvicorn, and JWT‑based session cookies.

#### Requirements
- Python 3.14
- uv (https://docs.astral.sh/uv/)

#### Configuration
Copy `.env.example` to `.env` and adjust values:
```
JWT_SECRET_KEY=...                 # generate with: python -c "import secrets; print(secrets.token_hex(32))"
COOKIE_HTTP_ONLY=false             # true in production
COOKIE_SECURE=false                # true in production
FRONTEND_URL=http://localhost:5173
```

Key settings are loaded in `app/config/config.py`.

#### Install dependencies
```
uv sync
```

#### Run (development)
```
uv run uvicorn app.main:app --reload
```
Alternative:
```
uv run python -m uvicorn app.main:app --reload
```

The API docs are served at `/api/docs` when running locally.

#### Run (production)
```
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2
```

#### Tests
```
uv run pytest
```

#### Linting
```
uv run ruff check .
uv run ruff check . --fix
```