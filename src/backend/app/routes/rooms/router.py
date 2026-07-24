import uuid

from fastapi import APIRouter, Depends

from app.auth.auth import getCurrentUser
from game.backendConnections.connection_manager import connection_manager

roomsRouter = APIRouter(prefix="/api/rooms", tags=["rooms"])

@roomsRouter.get("")
def getAllRooms():
    returnRooms = []

    for room in connection_manager.rooms.values():
        if(room.isRunning):
            continue
        returnRooms.append({
            "room_id": room.room_id,
            "player_count": len(room.activeConnections),
            "max_players": room.maxPlayers
        })
    
    return {"rooms": returnRooms}

@roomsRouter.post("/create", dependencies=[Depends(getCurrentUser)])
def createRoom():
    while True:
        room_id = f"room-{uuid.uuid4().hex[:8]}"

        if not connection_manager.checkIfRoomExists(room_id):
            break
    
    newRoom = connection_manager.getOrCreateRoom(room_id)

    return {
        "room_id": newRoom.room_id,
    }
