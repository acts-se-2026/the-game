import asyncio
from typing import Dict

from fastapi import WebSocket

from app.auth.types import SessionPayload
from game.state import State


class Room:
    def __init__(self, room_id: str):
        self.room_id: str = room_id
        self.activeConnections: Dict[WebSocket, SessionPayload] = {}
        self.gameLoopTask: asyncio.Task | None = None
        self.isRunning: bool = False
        self.maxPlayers: int = 4

        self.gameState = None

    def startGame(self):
        if self.isRunning:
            return
        
        self.isRunning = True
        self.gameState = State.init_populated([user.session_id for user in self.activeConnections.values()])
        self.gameLoopTask = asyncio.create_task(self.gameLoop())

        obstacles_data = [{"x": obs.pos.x, "y": obs.pos.y, "size": {"x": obs.size.x, "y": obs.size.y}} for obs in self.gameState.obstacles]
        usernames = {user.session_id: user.username for user in self.activeConnections.values()}
        players_data = [{"id": player.uuid, "username": usernames[player.uuid], "x": player.pos.x, "y": player.pos.y, "heading": player.rotation} for player in self.gameState.players]

        asyncio.create_task(self.broadcast({"type": "game_start", "data": {
            "obstacles": obstacles_data,
            "players": players_data
        }}))

    def stopGame(self):
        if not self.isRunning:
            return
        
        self.isRunning = False
        if self.gameLoopTask is not None:
            self.gameLoopTask.cancel()
        self.gameLoopTask = None
        self.gameState = None
    
    async def gameLoop(self):
        tick_rate = 1 / 60  # 60 ticks per second
        while self.isRunning:
            changes = self.gameState.step_frame()
            asyncio.create_task(self.broadcast({"type": "state_diff", "data": changes.to_dict()}))
            await asyncio.sleep(tick_rate)
    
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
            user = self.activeConnections[websocket]
            if self.isRunning and self.gameState is not None:
                self.gameState.kill_player(user.session_id)
            del self.activeConnections[websocket]
        
        asyncio.create_task(self.broadcast({"type": "user_list", "data": self.getAllPlayers()}))
        
        if len(self.activeConnections) == 0:
            self.stopGame()
    
    async def broadcast(self, message: dict):
        if not self.activeConnections:
            return
        
        # Fires all connection sends at the same time in parallel
        await asyncio.gather(
            *[connection.send_json(message) for connection in self.activeConnections],
            return_exceptions=True
        )