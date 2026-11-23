# Free natural voice server

A Vercel serverless function (`api/tts.py`, free Hobby plan) that speaks any short phrase with the
app's neural voices (Vesna / Goran, Zofia / Marek, Jenny / Guy, Hila) through the edge-tts package –
no account, key or payment for the voices. The app uses it only for phrases without a recorded clip,
above all the free text typed into "How do I say…?" (`src/lib/cloudVoice.ts`).

- Deploy: import the repository in Vercel with **Root Directory = `voice-server`**; pushes to main
  redeploy it.
- Only the app's origins, voices and short texts are accepted (see the top of `api/tts.py`).
- Local test: `python voice-server/dev_server.py`, then POST to `http://localhost:8787/api/tts`.

It relies on Edge's unofficial "Read aloud" service; if that ever stops working, the app falls back to
the device voice for unrecorded phrases (recorded clips are unaffected).
