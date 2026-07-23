### WebSocket Protocol

Endpoint: `WS /api/ws/{roomId}`

Connection prerequisites:
- Valid session cookie (`user_session`) from `POST /api/auth/login`.
- `roomId` must exist and must not be full or running.

Upon connect:
- The server accepts the socket and broadcasts an initial `user_list` to the room.

#### Client → Server Messages
All messages are JSON objects with a `type` field and optional `data`.

- `{"type":"game_start"}`
  - Attempts to start the game in the room.
- `{"type":"player_move","data":{"x": number, "y": number}}`
  - Sets movement direction vector for the current player while the game is running.
- `{"type":"player_aim","data":{"heading": number}}`
  - Sets the player’s aim/rotation while the game is running.
- `{"type":"player_shoot"}`
  - Attempts to shoot a bullet while the game is running.

#### Server → Client Messages
- `{"type": "user_list", "data": Array<{ username: string }>}"
  - Broadcast whenever roster changes (on join/leave) and initially at connect.
- Additional game state updates are broadcast by the room/game loop (see backend `game/backendConnections/room.py + gameLoop()`).

#### Disconnect Behavior
- If the room does not exist, is full, or is already running, the server closes the socket.
- On client disconnect, the server removes the player from the room and deletes the room if empty.
