from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect

from app.auth.auth import getCurrentUser
from app.auth.types import SessionPayload
from game.backendConnections import connectionManager
from game.backendConnections.room import Room

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
            
            print(f"Received data from user {user.session_id} in room {roomId}: {data}")
            
    except WebSocketDisconnect:
        room.disconnect(websocket)
        if len(room.activeConnections) == 0:
            connectionManager.removeRoom(roomId)
