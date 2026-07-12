from fastapi import APIRouter, WebSocket, WebSocketDisconnect

wsRouter = APIRouter(prefix="/api/ws", tags=["ws"])

@wsRouter.websocket("/")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    await websocket.send_json({
        "type": "connection_established",
        "message": "You are connected to the WebSocket server."
    })
    
    try:
        while True:
            data = await websocket.receive_json() 
            
            response_payload = {
                "type": "message",
                "message": f"Received message: {data}"
            }
            
            await websocket.send_json(response_payload)
            
    except WebSocketDisconnect:
        pass
