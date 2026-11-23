"""
Free natural voice for phrases that have no pre-recorded clip (above all the free text typed into
"How do I say…?"). Runs as a Vercel serverless function (free Hobby plan) and synthesizes with
Microsoft Edge's online neural voices through the edge-tts package – the same voices as the
recorded clips, with no account, key or payment.

POST /api/tts   {"text": "Gdje je stari most?", "voice": "bs-BA-VesnaNeural", "rate": "-6%"}
  → 200 audio/mpeg

Guard rails, so the endpoint serves only the learning app: requests must come from the app's
origin, only the app's voices are accepted, the rate must look like "-6%", and the text is short.
The text travels in the body (not the URL), so it does not end up in access logs.
"""

import asyncio
import json
import re
from http.server import BaseHTTPRequestHandler

import edge_tts

ALLOWED_ORIGINS = {
    "https://hanan87.github.io",
    "http://localhost:5173",
    "http://localhost:4173",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:4173",
}
VOICES = {
    "pl-PL-ZofiaNeural",
    "pl-PL-MarekNeural",
    "bs-BA-VesnaNeural",
    "bs-BA-GoranNeural",
    "en-US-JennyNeural",
    "en-US-GuyNeural",
    "he-IL-HilaNeural",
}
RATE = re.compile(r"^[+-]\d{1,2}%$")
MAX_TEXT = 300
MAX_BODY = 4096


async def synthesize(text: str, voice: str, rate: str) -> bytes:
    audio = bytearray()
    async for chunk in edge_tts.Communicate(text, voice, rate=rate).stream():
        if chunk["type"] == "audio":
            audio.extend(chunk["data"])
    return bytes(audio)


def validate(origin: str, body: bytes):
    """Returns (text, voice, rate) or (status, message) for a rejected request."""
    if origin not in ALLOWED_ORIGINS:
        return 403, "origin not allowed"
    try:
        req = json.loads(body.decode("utf-8"))
    except (ValueError, UnicodeDecodeError):
        return 400, "invalid JSON"
    text = str(req.get("text", "")).strip()
    voice = str(req.get("voice", ""))
    rate = str(req.get("rate", "+0%"))
    if not text or len(text) > MAX_TEXT:
        return 400, "text must be 1-300 characters"
    if voice not in VOICES:
        return 400, "unknown voice"
    if not RATE.match(rate):
        return 400, "invalid rate"
    return text, voice, rate


class handler(BaseHTTPRequestHandler):
    def _cors(self, origin: str) -> None:
        if origin in ALLOWED_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
            self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.send_header("Access-Control-Max-Age", "86400")

    def _reply(self, status: int, origin: str, body: bytes, content_type: str) -> None:
        self.send_response(status)
        self._cors(origin)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self) -> None:
        origin = self.headers.get("Origin", "")
        self.send_response(204 if origin in ALLOWED_ORIGINS else 403)
        self._cors(origin)
        self.end_headers()

    def do_POST(self) -> None:
        origin = self.headers.get("Origin", "")
        length = int(self.headers.get("Content-Length") or 0)
        if length <= 0 or length > MAX_BODY:
            self._reply(400, origin, b"request too large or empty", "text/plain")
            return
        checked = validate(origin, self.rfile.read(length))
        if isinstance(checked[0], int):
            status, message = checked
            self._reply(status, origin, message.encode(), "text/plain")
            return
        text, voice, rate = checked
        try:
            audio = asyncio.run(synthesize(text, voice, rate))
        except Exception as err:  # the voice service is unreachable or refused: the app falls back
            self._reply(502, origin, f"voice service error: {type(err).__name__}".encode(), "text/plain")
            return
        if not audio:
            self._reply(502, origin, b"no audio", "text/plain")
            return
        self._reply(200, origin, audio, "audio/mpeg")

    def do_GET(self) -> None:
        self._reply(200, self.headers.get("Origin", ""), b"voice server is running", "text/plain")
