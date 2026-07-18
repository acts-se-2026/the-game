import uuid

from fastapi import APIRouter, Depends

from app.auth.auth import getCurrentUser
from game.backendConnections.connectionManager import connectionManager

roomsRouter = APIRouter(prefix="/api/rooms", tags=["rooms"])

@roomsRouter.get("")
def getAllRooms():
    returnRooms = []

    for room in connectionManager.rooms.values():
        if(room.isRunning):
            continue
        returnRooms.append({
            "room_id": room.room_id,
            "player_count": len(room.activeConnections),
            "max_players": room.maxPlayers,
            "players": [user.username for user in room.activeConnections.values()],
        })
    
    return {"rooms": returnRooms}

@roomsRouter.post("/create", dependencies=[Depends(getCurrentUser)])
def createRoom():
    while True:
        room_id = f"room-{uuid.uuid4().hex[:8]}"

        if not connectionManager.checkIfRoomExists(room_id):
            break
    
    newRoom = connectionManager.getOrCreateRoom(room_id)

    return {
        "room_id": newRoom.room_id,
    }
