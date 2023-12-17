from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI()

# Include router from the routers module

@app.websocket("/ws/audio")
async def websocket_audio_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_bytes()
            print(data)
    except WebSocketDisconnect:
        print("Client disconnected")

