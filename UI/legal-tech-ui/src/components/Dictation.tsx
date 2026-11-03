import React, { useEffect, useRef, useState } from "react";

export default function DictationPage() {
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("Disconnected");
  const [isRecording, setIsRecording] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    console.log("Creating websocket...");

    const ws = new WebSocket(
      "ws://127.0.0.1:8000/ws/transcribe"
    );

    ws.onopen = () => {
      console.log("WS OPEN");
      setStatus("Connected");
    };

    ws.onmessage = (event) => {
      console.log("SERVER:", event.data);

      try {
        const data = JSON.parse(event.data);

        if (data.clean_text) {
          setTranscript(data.clean_text);
        }

        if (data.error) {
          setStatus(`Error: ${data.error}`);
        }
      } catch (err) {
        console.error(err);
      }
    };

    ws.onerror = (e) => {
      console.error("WS ERROR", e);
      setStatus("WebSocket Error");
    };

    ws.onclose = () => {
      console.log("WS CLOSED");
      setStatus("Disconnected");
    };

    wsRef.current = ws;

    return () => {
      console.log("Cleanup");

      recorderRef.current?.stop();

      streamRef.current?.getTracks().forEach((t) => t.stop());

      ws.close();
    };
  }, []);

  const startRecording = async () => {
    try {
      if (isRecording) return;

      console.log("Requesting microphone...");

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      console.log("Microphone granted");

      streamRef.current = stream;

      console.log(
        "Opus supported:",
        MediaRecorder.isTypeSupported(
          "audio/webm;codecs=opus"
        )
      );

      const recorder = new MediaRecorder(stream);

      recorder.onstart = () => {
        console.log("Recorder started");

        setIsRecording(true);
        setStatus("Recording...");
      };

      recorder.onstop = () => {
        console.log("Recorder stopped");

        setIsRecording(false);
        setStatus("Stopped");
      };

      recorder.onerror = (e) => {
        console.error("Recorder error", e);
      };

      recorder.ondataavailable = async (event) => {
        console.log(
          "Chunk size:",
          event.data.size
        );

        if (
          event.data.size === 0 ||
          !wsRef.current
        ) {
          return;
        }

        console.log(
          "WS state:",
          wsRef.current.readyState
        );

        if (
          wsRef.current.readyState !==
          WebSocket.OPEN
        ) {
          console.log(
            "WebSocket not open"
          );
          return;
        }

        const buffer =
          await event.data.arrayBuffer();

        console.log(
          "Sending bytes:",
          buffer.byteLength
        );

        wsRef.current.send(buffer);
      };

      recorderRef.current = recorder;

      recorder.start(1000);
    } catch (err) {
      console.error(err);
      setStatus("Microphone denied");
    }
  };

  const stopRecording = () => {
    console.log("Stopping recorder");

    recorderRef.current?.stop();

    streamRef.current?.getTracks().forEach((t) => t.stop());

    setIsRecording(false);
  };

  // return (
  //   <div
  //     style={{
  //       padding: 20,
  //       maxWidth: 900,
  //       margin: "0 auto",
  //     }}
  //   >
  //     <h1>Live Dictation</h1>

  //     <p>
  //       <strong>Status:</strong> {status}
  //     </p>

  //     <button
  //       onClick={startRecording}
  //       disabled={isRecording}
  //     >
  //       Start
  //     </button>

  //     <button
  //       onClick={stopRecording}
  //       disabled={!isRecording}
  //       style={{ marginLeft: 10 }}
  //     >
  //       Stop
  //     </button>

  //     <button
  //       onClick={() => setTranscript("")}
  //       style={{ marginLeft: 10 }}
  //     >
  //       Clear
  //     </button>

  //     <div
  //       style={{
  //         marginTop: 20,
  //         border: "1px solid #ccc",
  //         padding: 20,
  //         minHeight: 200,
  //       }}
  //     >
  //       {transcript ||
  //         "Click Start and speak"}
  //     </div>
  //   </div>
  // );

return (
  <div className="min-h-screen bg-zinc-950 text-white overflow-hidden">
    {/* Background Glow */}
    <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

    <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-white via-cyan-300 to-blue-500 bg-clip-text text-transparent">
          Live Dictation
        </h1>

        <p className="mt-3 text-zinc-400 text-lg">
          Real-time speech to text powered by Whisper.
        </p>
      </div>

      {/* Main Card */}
      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
        {/* Status */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-zinc-400 text-sm uppercase tracking-widest">
              Status
            </p>

            <div className="flex items-center gap-3 mt-2">
              <div
                className={`h-3 w-3 rounded-full ${
                  isRecording
                    ? "bg-red-500 animate-pulse"
                    : status === "Connected"
                    ? "bg-green-500"
                    : "bg-zinc-500"
                }`}
              />

              <span className="text-lg font-medium">
                {status}
              </span>
            </div>
          </div>

          {isRecording && (
            <div className="flex items-end gap-1 h-12">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="wave-bar"
                  style={{
                    animationDelay: `${i * 0.08}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Transcript Area */}
        <div className="rounded-2xl bg-black/30 border border-white/5 min-h-[320px] p-6 overflow-y-auto">
          <p className="text-zinc-300 whitespace-pre-wrap leading-8 text-lg">
            {transcript || (
              <span className="text-zinc-500">
                Press Start and begin speaking...
              </span>
            )}
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={startRecording}
            disabled={isRecording}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg"
          >
            🎙 Start Recording
          </button>

          <button
            onClick={stopRecording}
            disabled={!isRecording}
            className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition disabled:opacity-50"
          >
            ⏹ Stop
          </button>

          <button
            onClick={() => setTranscript("")}
            className="px-6 py-3 rounded-xl border border-zinc-700 hover:bg-zinc-800 transition"
          >
            🗑 Clear
          </button>
        </div>
      </div>
    </div>
  </div>
);

}