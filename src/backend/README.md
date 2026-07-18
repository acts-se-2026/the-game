# Setup .env
- copy .env.example to .env and fill data about it

# Sync (install all packages)
```bash
uv sync
```

# Run dev command
```bash
uv run uvicorn app.main:app --reload
```
or
```bash
uv run python -m uvicorn app.main:app --reload
``

# Run in prod (for later)
```bash
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers {number}
```

# Run Linter 
``` bash
uv run ruff check .
```

## Run with fix
``` bash
uv run ruff check . --fix
```