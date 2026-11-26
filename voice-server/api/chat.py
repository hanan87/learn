"""
Conversation partner for the app's "Free conversation": the learner talks with a character (a waiter,
a pharmacist, a new acquaintance…) in the language they learn. Runs as a Vercel serverless function
next to the voice (free Hobby plan) and asks Google Gemini through its free tier.

The Gemini key lives only in the Vercel project's environment (GEMINI_API_KEY); it never reaches the
browser. GEMINI_MODEL may name a model; otherwise the free Flash-Lite model is used, then Flash.

POST /api/chat
  {"course": "pl", "ui": "he", "topic": "cafe", "gender": "f", "name": "Yael",
   "known": ["Dzień dobry", "Poproszę kawę", …],
   "history": [{"role": "partner", "text": "Dzień dobry! Co podać?"}, {"role": "learner", "text": "…"}]}
  → 200 {"reply", "translation", "correction"?: {"better", "note"}, "suggestions": [{"text", "translation"}],
         "words": [{"text", "translation"}], "end": bool}
  → 429 {"error": "quota"}          the free daily allowance is used up
  → 503 {"error": "not_configured"} no key in the Vercel project yet
  → 502 {"error": "upstream"}       Gemini failed or answered in an unexpected shape

Guard rails, as for the voice: requests must come from the app's origin, every field is checked and
size-limited, and the learner's words go in the body (never the URL), so they stay out of access logs.
"""

import json
import os
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler

ALLOWED_ORIGINS = {
    "https://hanan87.github.io",
    "http://localhost:5173",
    "http://localhost:4173",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:4173",
}
MAX_BODY = 24_000
MAX_TURNS = 30
MAX_TEXT = 400
MAX_KNOWN = 150
API = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
MODELS = ["gemini-flash-lite-latest", "gemini-flash-latest"]

LANGUAGE = {
    "pl": "Polish",
    "cnr": "Montenegrin as spoken in Montenegro (ijekavian, Latin script; spell like sjutra, gdje, lijepo, mlijeko)",
    "en": "American English",
    "he": "Modern Hebrew, written with full niqqud (vowel points) on every word",
}
UI_LANGUAGE = {"he": "Hebrew", "en": "English", "pl": "Polish", "cnr": "Montenegrin (Latin script)"}
PLACE = {"pl": "Kraków", "cnr": "Kotor", "en": "New York", "he": "Tel Aviv"}
PARTNER = {"pl": "Ola", "cnr": "Milica", "en": "Emma", "he": "Noa"}
# Service roles speak politely to the learner (Pan/Pani, Vi); new acquaintances may be informal.
POLITE = {"cafe", "travel", "pharmacy", "holiday"}
TOPIC = {
    "cafe": "a waitress at a café; the learner is a customer ordering drinks and something to eat",
    "meet": "a friendly local the learner has just met; small talk about names, where you are from, work and free time",
    "travel": "a helpful local at a bus and train station; the learner asks about tickets, directions and times",
    "holiday": "another guest at the hotel by the beach; you chat about the weather, the sea and plans for the day",
    "pharmacy": "a pharmacist; the learner describes a simple health problem and buys medicine",
    "free": "a friendly local who is happy to chat about whatever the learner wants",
}

PAIR = {
    "type": "OBJECT",
    "properties": {"text": {"type": "STRING"}, "translation": {"type": "STRING"}},
    "required": ["text", "translation"],
}
SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "reply": {"type": "STRING"},
        "translation": {"type": "STRING"},
        "correction": {
            "type": "OBJECT",
            "properties": {"better": {"type": "STRING"}, "note": {"type": "STRING"}},
            "required": ["better", "note"],
        },
        "suggestions": {"type": "ARRAY", "items": PAIR},
        "words": {"type": "ARRAY", "items": PAIR},
        "end": {"type": "BOOLEAN"},
    },
    "required": ["reply", "translation", "suggestions", "words", "end"],
}


def clean(value, limit: int) -> str:
    return " ".join(str(value or "").split())[:limit]


def validate(origin: str, body: bytes):
    """Returns the checked request as a dict, or (status, error) for a rejected one."""
    if origin not in ALLOWED_ORIGINS:
        return 403, "origin not allowed"
    try:
        req = json.loads(body.decode("utf-8"))
    except (ValueError, UnicodeDecodeError):
        return 400, "invalid JSON"
    if not isinstance(req, dict):
        return 400, "invalid request"
    course, ui, topic = req.get("course"), req.get("ui"), req.get("topic")
    if course not in LANGUAGE or ui not in UI_LANGUAGE or topic not in TOPIC:
        return 400, "unknown course, language or topic"
    history = req.get("history") or []
    known = req.get("known") or []
    if not isinstance(history, list) or not isinstance(known, list) or len(history) > MAX_TURNS:
        return 400, "invalid history"
    turns = []
    for turn in history:
        if not isinstance(turn, dict) or turn.get("role") not in ("partner", "learner"):
            return 400, "invalid turn"
        text = clean(turn.get("text"), MAX_TEXT)
        if text:
            turns.append({"role": turn["role"], "text": text})
    return {
        "course": course,
        "ui": ui,
        "topic": topic,
        "gender": req.get("gender") if req.get("gender") in ("m", "f") else None,
        "name": clean(req.get("name"), 30),
        "known": [k for k in (clean(k, 80) for k in known[:MAX_KNOWN]) if k],
        "history": turns,
    }


def instructions(r: dict) -> str:
    lang, ui = LANGUAGE[r["course"]], UI_LANGUAGE[r["ui"]]
    name = PARTNER[r["course"]]
    learner = []
    if r["gender"]:
        learner.append(f"The learner is a {'man' if r['gender'] == 'm' else 'woman'}: address them and correct them with the matching gendered forms.")
    if r["name"]:
        learner.append(f"The learner's name is {r['name']}.")
    known = " | ".join(r["known"]) or "(nothing yet: use the very simplest words)"
    register = (
        "Speak politely, as you would to a customer or a stranger (the formal you where the language has one)."
        if r["topic"] in POLITE
        else "You may speak informally, as to a new friend."
    )
    return f"""You are {name}, {TOPIC[r['topic']]}, in {PLACE[r['course']]}. You are having a spoken conversation with someone learning {lang}; their own language is {ui}. {' '.join(learner)}

Answer with JSON only:
- "reply": your next turn, only in {lang}. One or two short sentences, at most 14 words in total. Simple everyday words, present tense where you can, and prefer the words of the learner's phrases below. End with one easy question that keeps the conversation going, unless it has come to a close. Stay in your role and in the setting; never mention being an AI and never switch languages. If the learner goes off topic or says something rude, gently steer back. If the learner writes in {ui} or mixes languages, still answer in {lang}.
- "translation": your reply translated into {ui}.
- "correction": look ONLY at the learner's last message. If it has a real mistake (a wrong word, ending, gender or word order, or words that are not {lang}), give "better": the natural corrected sentence in {lang}, and "note": one short, friendly explanation in {ui}, at most 12 words, in plain words without grammar terms (say "after poproszę the word changes to kawę", not the name of a case). Ignore punctuation, capital letters and missing accent marks. Leave "correction" out when the message is fine or there is no learner message yet.
- "suggestions": three different short answers (2 to 6 words) the learner could say next, in {lang}, very simple, each with its "translation" in {ui}. Prefer phrases from the learner's list.
- "words": up to three words or expressions from your reply that are not in the learner's phrases, each with its "translation" in {ui}.
- "end": true only when the conversation has come to a natural close; after 8 to 12 exchanges, wrap up politely and say goodbye.

The learner copies every {lang} sentence you write (the reply, "better" and the suggestions), so each one must be perfectly correct: check every word ending, gender and spelling before you answer. {register}

The learner's phrases: {known}"""


def transcript(r: dict) -> str:
    name = PARTNER[r["course"]]
    if not r["history"]:
        return "The conversation starts now. Greet the learner in one short sentence and ask a first easy question that fits the setting."
    lines = [f"{name if t['role'] == 'partner' else 'Learner'}: {t['text']}" for t in r["history"]]
    return "The conversation so far:\n" + "\n".join(lines) + "\n\nWrite your next turn."


def pairs(value, limit: int):
    out = []
    for p in value if isinstance(value, list) else []:
        if isinstance(p, dict) and clean(p.get("text"), 120):
            out.append({"text": clean(p.get("text"), 120), "translation": clean(p.get("translation"), 160)})
    return out[:limit]


def shape(data: dict) -> dict:
    """Keeps only the expected fields, trimmed, so the app can trust the answer's shape."""
    reply = clean(data.get("reply"), MAX_TEXT)
    if not reply:
        raise ValueError("empty reply")
    out = {
        "reply": reply,
        "translation": clean(data.get("translation"), MAX_TEXT),
        "suggestions": pairs(data.get("suggestions"), 3),
        "words": pairs(data.get("words"), 3),
        "end": bool(data.get("end")),
    }
    corr = data.get("correction")
    if isinstance(corr, dict) and clean(corr.get("better"), MAX_TEXT):
        out["correction"] = {"better": clean(corr.get("better"), MAX_TEXT), "note": clean(corr.get("note"), 200)}
    return out


class Upstream(Exception):
    def __init__(self, status: int, error: str):
        super().__init__(error)
        self.status, self.error = status, error


def ask_gemini(r: dict, key: str) -> dict:
    body = json.dumps({
        "systemInstruction": {"parts": [{"text": instructions(r)}]},
        "contents": [{"role": "user", "parts": [{"text": transcript(r)}]}],
        "generationConfig": {
            "temperature": 0.5,
            "maxOutputTokens": 900,
            "responseMimeType": "application/json",
            "responseSchema": SCHEMA,
        },
    }).encode("utf-8")
    configured = os.environ.get("GEMINI_MODEL", "").strip()
    for model in [configured] if configured else MODELS:
        request = urllib.request.Request(
            API.format(model=model),
            data=body,
            headers={"Content-Type": "application/json", "x-goog-api-key": key},
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=25) as res:
                answer = json.loads(res.read().decode("utf-8"))
        except urllib.error.HTTPError as err:
            if err.code == 429:
                raise Upstream(429, "quota")
            if err.code == 404:
                continue  # this model name is not available: try the next one
            raise Upstream(502, "upstream")
        except (urllib.error.URLError, TimeoutError, ValueError):
            raise Upstream(502, "upstream")
        try:
            text = answer["candidates"][0]["content"]["parts"][0]["text"]
            return shape(json.loads(text))
        except (KeyError, IndexError, TypeError, ValueError):
            raise Upstream(502, "upstream")
    raise Upstream(502, "upstream")


class handler(BaseHTTPRequestHandler):
    def _cors(self, origin: str) -> None:
        if origin in ALLOWED_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
            self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.send_header("Access-Control-Max-Age", "86400")

    def _json(self, status: int, origin: str, payload: dict) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self._cors(origin)
        self.send_header("Content-Type", "application/json; charset=utf-8")
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
            self._json(400, origin, {"error": "size"})
            return
        checked = validate(origin, self.rfile.read(length))
        if isinstance(checked, tuple):
            status, message = checked
            self._json(status, origin, {"error": message})
            return
        key = os.environ.get("GEMINI_API_KEY", "").strip()
        if not key:
            self._json(503, origin, {"error": "not_configured"})
            return
        try:
            self._json(200, origin, ask_gemini(checked, key))
        except Upstream as err:
            self._json(err.status, origin, {"error": err.error})

    def do_GET(self) -> None:
        configured = bool(os.environ.get("GEMINI_API_KEY", "").strip())
        self._json(200, self.headers.get("Origin", ""), {"chat": "running", "configured": configured})
