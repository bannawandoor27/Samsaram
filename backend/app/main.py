import io
import struct
import wave

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydub import AudioSegment

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.websocket("/ws/audio")
async def websocket_audio_endpoint(websocket: WebSocket):
    await websocket.accept()
    audio_data = io.BytesIO()

    try:
        while True:
            data = await websocket.receive_bytes()
            audio_data.write(data)

    except WebSocketDisconnect:
        print("Client disconnected")
        audio_data.seek(0)
        wav_data = io.BytesIO()
        with wave.open(wav_data, "wb") as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            wav_file.setframerate(44100)
            audio_data.seek(0)
            raw_audio = audio_data.read()
            wav_file.writeframesraw(raw_audio)

        wav_data.seek(0)
        with open("output.wav", "wb") as output_file:
            output_file.write(wav_data.read())
