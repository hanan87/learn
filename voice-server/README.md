# Free natural voice server

A Vercel serverless function (`api/tts.py`, free Hobby plan) that speaks any short phrase with the
app's neural voices (Vesna / Goran, Zofia / Marek, Jenny / Guy, Hila) through the edge-tts package –
no account, key or payment for the voices. The app uses it only for phrases without a recorded clip,
above all the free text typed into "How do I say…?" (`src/lib/cloudVoice.ts`).

- Live: https://learn-voice-ten.vercel.app/api/tts (Vercel project `learn-voice`, Hobby plan).
- Deploy: the repository is imported in Vercel with **Root Directory = `voice-server`** (Python
  preset; `pyproject.toml` names the entry point); every push to main redeploys it.
- Only the app's origins, voices and short texts are accepted (see the top of `api/tts.py`).
- Local test: `python voice-server/dev_server.py`, then POST to `http://localhost:8787/api/tts`.

It relies on Edge's unofficial "Read aloud" service; if that ever stops working, the app falls back to
the device voice for unrecorded phrases (recorded clips are unaffected).

## Free conversation partner

`api/chat.py` is the partner of the app's "Free conversation" (`src/views/FreeChat.tsx`): a waitress, a
pharmacist or a new acquaintance who talks with the learner in the course language. It asks Google
Gemini through its free tier (no card); one request per turn returns the reply, its translation, a
gentle correction of the learner's last sentence, three answer ideas and the new words.

- The key lives only in the Vercel project: Settings → Environment Variables → `GEMINI_API_KEY`
  (created at aistudio.google.com/apikey). It never reaches the browser; never commit it.
  A new or changed key takes effect after the next deployment (a push to main, or Redeploy in Vercel).
- `GEMINI_MODEL` may name a model; otherwise `gemini-flash-lite-latest` is used, then
  `gemini-flash-latest`.
- Answers: 429 `quota` when the free daily allowance is used up, 503 `not_configured` without a key,
  502 `upstream` when Gemini fails. `GET /api/chat` says whether a key is configured.
- Same guard rails as the voice: the app's origins only, every field checked and size-limited.
- Local test: `python voice-server/dev_server.py` serves both endpoints on port 8787.

