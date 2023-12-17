import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [webSocket, setWebSocket] = useState(null);
  const [audioStream, setAudioStream] = useState(null);

  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  }, [isRecording]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const ws = new WebSocket("ws://127.0.0.1:8000/ws/audio");
    ws.onopen = () => {
      console.log("Connected to WebSocket");
    };
    
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    setWebSocket(ws);
    setAudioStream(stream);

    const audioContext = new AudioContext();
    const audioInput = audioContext.createMediaStreamSource(stream);
    const bufferSize = 2048;
    const recorder = audioContext.createScriptProcessor(bufferSize, 1, 1);

    recorder.onaudioprocess = e => {
      const data = e.inputBuffer.getChannelData(0);
      const audioData = floatTo16BitPCM(data);
      ws.send(audioData);
    };

    audioInput.connect(recorder);
    recorder.connect(audioContext.destination);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (webSocket) {
      webSocket.close();
    }
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
    }
  };

  const floatTo16BitPCM = input => {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return output;
  };

  const handleRecordToggle = () => {
    setIsRecording(prev => !prev);
  };

  return (
    <div className="app-container">
      <main className="main-content">
        <h1>Real-Time Audio Streamer</h1>
        <div className="audio-controls">
          <button 
            className={`record-btn ${isRecording ? 'recording' : ''}`}
            onClick={handleRecordToggle}>
            {isRecording ? 'Stop' : 'Start'}
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
