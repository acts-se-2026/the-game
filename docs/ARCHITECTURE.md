### Architecture Overview

This repository contains a real-time multiplayer browser game split into a TypeScript/React client and a Python/FastAPI server.

#### Components
- Frontend (`src/frontend`): React + Vite + TypeScript, Pixi.js for rendering, Tailwind CSS for styles.
- Backend (`src/backend`): FastAPI for HTTP APIs and WebSockets, JWT session cookie for auth, in-memory room and game state management.
- Deployment: Prebuilt Docker images orchestrated with `docker-compose.yml`.

#### High-level Flow
1. A user logs in via `POST /api/auth/login` which sets a signed session cookie.
2. The client lists rooms via `GET /api/rooms` and creates a room via `POST /api/rooms/create` when needed.
3. The client connects to `WS /api/ws/{roomId}`. The server validates the cookie, joins the room, and starts relaying game state.
4. Players send movement/aim/shoot messages over WebSocket; the server runs the game loop and broadcasts updates.

#### Backend Modules
- `app/main.py`: FastAPI app, CORS, OpenAPI docs at `/api/docs` in dev, router registration.
- `app/routes/*`: HTTP and WebSocket routers (`auth`, `rooms`, `ws`).
- `app/auth/*`: JWT creation/verification and dependency for current user.
- `app/config/config.py`: configuration and environment variable parsing.
- `game/*`: in-memory game logic, rooms, connection manager, vectors, and state.

#### State & Concurrency
- Rooms and connections are kept in-memory via a connection manager.
- WebSocket handlers are `async` and broadcast state to all clients in a room.
- There is no persistent storage; restarting the server resets rooms and state.

#### Security & CORS
- Session cookie: `user_session` signed with `JWT_SECRET_KEY`.
- CORS allows the configured `FRONTEND_URL` and sends credentials.