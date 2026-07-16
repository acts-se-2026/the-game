import uuid

from fastapi import APIRouter
from game.backendConnections.connectionManager import connectionManager
from fastapi import APIRouter, Depends
from app.auth.auth import getCurrentUser
from app.auth.types import SessionPayload

roomsRouter = APIRouter(prefix="/api/rooms", tags=["test"])

@roomsRouter.get("")
def getAllRooms():
    returnRooms = []

    for room in connectionManager.rooms.values():
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

        if not connectionManager.checkIfRoomExists(room_id):
            break
    
    newRoom = connectionManager.getOrCreateRoom(room_id)

    return {
        "room_id": newRoom.room_id,
    }
