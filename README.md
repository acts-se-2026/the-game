<div align="center">

<h1>Kill or Die</h1>

<p>
  <a href="https://github.com/acts-se-2026/the-game/actions/workflows/server-cd.yml">
    <img alt="Push docker images" src="https://github.com/acts-se-2026/the-game/actions/workflows/server-cd.yml/badge.svg" />
  </a>
  <a href="https://github.com/acts-se-2026/the-game/actions/workflows/frontend-ci.yml">
    <img alt="Frontend CI" src="https://github.com/acts-se-2026/the-game/actions/workflows/frontend-ci.yml/badge.svg" />
  </a>
  <a href="https://github.com/acts-se-2026/the-game/actions/workflows/backend-ci.yml">
    <img alt="Backend CI" src="https://github.com/acts-se-2026/the-game/actions/workflows/backend-ci.yml/badge.svg" />
  </a>
</p>

<p>Multiplayer browser game — React/Vite frontend and FastAPI backend</p>

</div>

Kill or Die is a fast, real‑time multiplayer game playable in the browser. The project is split into a TypeScript/React frontend and a Python/FastAPI backend with WebSocket support for low‑latency updates.

Production deployment: https://killordie.mooo.com

#### Demo

<div align="center">
  <video
    src="https://github.com/user-attachments/assets/8cdfc81e-43c4-47b6-903f-459c6aecd959"
    controls
    playsinline
    style="max-width: 100%; height: auto;"
  >
    Your browser does not support the video tag.
  </video>
</div>

#### Repository Layout
- `src/frontend` — React + Vite + TypeScript client (Pixi.js for rendering, Tailwind CSS)
- `src/backend` — FastAPI application (JWT auth, WebSocket endpoints)
- `docker-compose.yml` — images and volumes for production deployment

#### Prerequisites (local development)
- Node.js and npm
- Python 3.14
- uv (Python package/dependency manager)

#### Quick Start (local)
Backend
```
cd src/backend
cp .env.example .env    # adjust values as needed
uv sync
uv run uvicorn app.main:app --reload
```

Frontend
```
cd src/frontend
cp .env.example .env    # adjust values as needed
npm install
npm run dev
```

The backend defaults to `http://localhost:8000` and the frontend to `http://localhost:5173`. Adjust `FRONTEND_URL` in backend `.env` and `VITE_*` variables in frontend `.env` if ports/hosts differ.

#### Docker Compose (production)
This repository ships a `docker-compose.yml` referencing prebuilt images:
- `ghcr.io/acts-se-2026/the-game-frontend:latest`
- `ghcr.io/acts-se-2026/the-game-backend:latest`

Provide backend environment via a file mounted as `.env.backend` at the repository root:
```
JWT_SECRET_KEY=...
COOKIE_HTTP_ONLY=true
COOKIE_SECURE=true
FRONTEND_URL=https://your.domain
```
Then start services with your orchestration of choice.

#### Testing and Linting
Backend
```
cd src/backend
uv run pytest
uv run ruff check .           # optional lint
uv run ruff check . --fix     # optional auto‑fix
```

Frontend
```
cd src/frontend
npm run test
npm run lint
```

#### Documentation
- Backend details: `src/backend/README.md`
- Frontend details: `src/frontend/README.md`

** Keyboard and mouse are required to play. **
