
from .room import Room


class ConnectionManager:
    """In-memory registry responsible for creating and tracking game rooms."""

    def __init__(self):
        self.rooms: dict[str, Room] = {}
    
    def checkIfRoomExists(self, room_id: str) -> bool:
        """Return True if a room with `room_id` exists."""
        return room_id in self.rooms
    
    def getOrCreateRoom(self, room_id: str):
        """Return an existing room or create a new one if missing."""
        if room_id not in self.rooms:
            self.rooms[room_id] = Room(room_id)
        
        return self.rooms[room_id]
    
    def removeRoom(self, room_id: str):
        """Remove an empty room from the registry (no connections)."""
        if room_id in self.rooms and len(self.rooms[room_id].activeConnections) == 0:
            del self.rooms[room_id]

connectionManager = ConnectionManager()