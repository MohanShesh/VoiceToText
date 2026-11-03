import json
import os
import re
import tempfile

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from faster_whisper import WhisperModel

app = FastAPI()

model = WhisperModel(
    "small.en",
    device="cpu",
    compute_type="int8"
)

jargon_terms = [
    "synergy",
    "bandwidth",
    "circle back",
    "low-hanging fruit",
]

MIN_AUDIO_SIZE = 100000  # ~0.5 MB

def filter_jargon(text: str) -> str:
    pattern = r"\b(?:%s)\b" % "|".join(
        map(re.escape, jargon_terms)
    )

    return re.sub(
        pattern,
        "",
        text,
        flags=re.IGNORECASE
    ).strip()


@app.websocket("/ws/transcribe")
async def websocket_endpoint(websocket: WebSocket):

    print("Incoming websocket request")
    await websocket.accept()
    print("Websocket accepted")

    audio_buffer = b""
    last_text = ""

    try:
        while True:

            chunk = await websocket.receive_bytes()
            print("Received bytes:", len(chunk))

            audio_buffer += chunk

            # Wait until enough audio is accumulated
            if len(audio_buffer) < MIN_AUDIO_SIZE:
                continue

            with tempfile.NamedTemporaryFile(
                suffix=".webm",
                delete=False
            ) as tmp:
                tmp.write(audio_buffer)
                tmp_path = tmp.name

            # Clear buffer after saving current chunk
            audio_buffer = b""

            try:
                print("Starting transcription...")

                segments, info = model.transcribe(
                    tmp_path,
                    language="en",
                    beam_size=5
                )

                text = " ".join(
                    seg.text for seg in segments
                ).strip()

                print("Raw transcription:", text)

                text = filter_jargon(text)

                if text and text != last_text:
                    print("Sending to UI:", text)

                    await websocket.send_text(
                        json.dumps(
                            {
                                "clean_text": text
                            }
                        )
                    )

                    last_text = text

            finally:
                if os.path.exists(tmp_path):
                    os.remove(tmp_path)

    except WebSocketDisconnect:
        print("Client disconnected")

    except Exception as e:
        print("ERROR:", e)

        try:
            await websocket.send_text(
                json.dumps(
                    {
                        "error": str(e)
                    }
                )
            )
        except:
            pass

# @app.websocket("/ws/transcribe")
async def websocket_endpoint(websocket: WebSocket):

    print("Incoming websocket request")

    await websocket.accept()

    print("Websocket accepted")

    try:
        while True:

            data = await websocket.receive_bytes()

            print(
                "Received bytes:",
                len(data)
            )

            await websocket.send_text(
                json.dumps(
                    {
                        "clean_text":
                        f"received {len(data)} bytes"
                    }
                )
            )

    except WebSocketDisconnect:
        print("Client disconnected")

    except Exception as e:
        print("ERROR:", e)
    print("Incoming websocket request")
    await websocket.accept()
    print("Websocket accepted")

    audio_buffer = b""
    last_text = ""

    try:
        while True:

            chunk = await websocket.receive_bytes()
            print("Received bytes:", len(data))
            audio_buffer += chunk

            if len(audio_buffer) < MIN_AUDIO_SIZE:
                continue

            with tempfile.NamedTemporaryFile(
                suffix=".webm",
                delete=False
            ) as tmp:

                tmp.write(audio_buffer)
                tmp_path = tmp.name

            try:

                segments, info = model.transcribe(
                    tmp_path,
                    language="en",
                    beam_size=5
                )

                text = " ".join(
                    seg.text
                    for seg in segments
                ).strip()

                print("=" * 50)
                print("WHISPER OUTPUT:")
                print(repr(text))
                print("=" * 50)

                text = filter_jargon(text)

                if text and text != last_text:
                    

                    await websocket.send_text(
                        json.dumps(
                            {
                                "clean_text": text
                            }
                        )
                    )

                    last_text = text

            finally:
                print(last_text)
                if os.path.exists(tmp_path):
                    os.remove(tmp_path)

    except WebSocketDisconnect:

        print("Client disconnected")

    except Exception as e:

        try:
            await websocket.send_text(
                json.dumps(
                    {
                        "error": str(e)
                    }
                )
            )
        except:
            pass