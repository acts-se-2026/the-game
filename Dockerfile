FROM python:3.11-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /build

# Install dependencies
COPY pyproject.toml uv.lock .

RUN pip install --no-cache-dir uv \
    && uv sync

#Install backend
COPY src/backend/ .

EXPOSE 8000

# Start your Python app (it automatically uses the venv's uvicorn/python)
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]