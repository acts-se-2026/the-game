### HTTP API

Base URL: by default `http://localhost:8000` during local development. All endpoints are prefixed with `/api`.

Authentication uses a signed session cookie (`user_session`). Obtain it via `POST /api/auth/login` 
#### Auth
- `POST /api/auth/login`
  - Body: `{ "username": string }`
  - Sets session cookie. Response: `{ "message": "Login successful" }`
- `POST /api/auth/logout`
  - Clears session cookie. Response: `{ "message": "Logout successful" }`
- `GET /api/auth/me`
  - Requires auth cookie. Response: `{ username, session_id, exp }`

#### Rooms
- `GET /api/rooms`
  - Returns `{ rooms: Array<{ room_id, player_count, max_players, players: string[] }> }`
- `POST /api/rooms/create`
  - Requires auth. Creates a new room. Response: `{ room_id }`

OpenAPI docs are available in development at `/api/docs` and `/api/redoc`.
