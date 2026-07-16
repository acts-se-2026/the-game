
from .room import Room


class ConnectionManager:
    def __init__(self):
        self.rooms: dict[str, Room] = {}
    
    def checkIfRoomExists(self, room_id: str) -> bool:
        return room_id in self.rooms
    
    def getOrCreateRoom(self, room_id: str):
        if room_id not in self.rooms:
            self.rooms[room_id] = Room(room_id)
        
        return self.rooms[room_id]
    
    def removeRoom(self, room_id: str):
        if room_id in self.rooms and len(self.rooms[room_id].activeConnections) == 0:
            del self.rooms[room_id]

connectionManager = ConnectionManager()