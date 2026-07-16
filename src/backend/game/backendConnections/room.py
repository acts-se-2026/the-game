from fastapi import WebSocket
from typing import Dict
import asyncio

from app.auth.types import SessionPayload

class Room:
    def __init__(self, room_id: str):
        self.room_id: str = room_id
        self.activeConnections: Dict[WebSocket, SessionPayload] = {}
        self.gameLoopTask: asyncio.Task | None = None
        self.isRunning: bool = False
        self.maxPlayers: int = 4
    
    def getAllPlayers(self):
        players = []
        for user in self.activeConnections.values():
            players.append({
                "userId": user.session_id,
                "username": user.username
            })
        return {"players": players}

    def connect(self, websocket: WebSocket, user: SessionPayload):
        if len(self.activeConnections) >= self.maxPlayers:
            raise Exception("Room is full")
        
        self.activeConnections[websocket] = user
        return True
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.activeConnections:
            del self.activeConnections[websocket]
        
        asyncio.create_task(self.broadcast({"type": "user_list", "data": self.getAllPlayers()}))
        
        if len(self.activeConnections) == 0:
            self.isRunning = False
            if(self.gameLoopTask is not None):
                self.gameLoopTask.cancel()
            self.gameLoopTask = None
    
    async def broadcast(self, message: dict):
        if not self.activeConnections:
            return
        
        # Fires all connection sends at the same time in parallel
        await asyncio.gather(
            *[connection.send_json(message) for connection in self.activeConnections],
            return_exceptions=True
        )