from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect

from app.auth.auth import getCurrentUser
from app.auth.types import SessionPayload
from game.backendConnections import connectionManager
from game.backendConnections.room import Room
from game.vector import Vec2

wsRouter = APIRouter(prefix="/api/ws", tags=["ws"])

@wsRouter.websocket("/{roomId}")
async def websocket_endpoint(websocket: WebSocket, user: SessionPayload = Depends(getCurrentUser), roomId: str = None):
    if not connectionManager.checkIfRoomExists(roomId) or len(connectionManager.rooms[roomId].activeConnections) >= connectionManager.rooms[roomId].maxPlayers:
        await websocket.close(code=1000)
        return

    room: Room = connectionManager.getOrCreateRoom(roomId)
    room.connect(websocket, user)

    await websocket.accept()
    await room.broadcast({"type": "user_list", "data": room.getAllPlayers()})
    
    try:
        while True:
            data = await websocket.receive_json() 
            dataType = data.get("type")

            match dataType:
                case "game_start":
                    room.startGame()
                case "player_move":
                    if not room.isRunning:
                        continue
                    playerId = user.session_id
                    data = data.get("data")
                    movementX = data.get("x")
                    movementY = data.get("y")
                    movementVector = Vec2(movementX, movementY)
                    
                    gameState = room.gameState
                    if gameState is None:
                        continue
                    gameState.set_player_movement_dir(playerId, movementVector)
                case "player_aim":
                    if not room.isRunning:
                        continue
                    playerId = user.session_id
                    data = data.get("data")
                    heading = data.get("heading")
                    
                    gameState = room.gameState
                    if gameState is None:
                        continue
                    gameState.set_player_rotation(playerId, heading)

            
    except WebSocketDisconnect:
        room.disconnect(websocket)
        if len(room.activeConnections) == 0:
            connectionManager.removeRoom(roomId)
