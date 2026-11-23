"""
Free natural-voice clips from Microsoft Edge's online "Read aloud" neural voices (the edge-tts
package) - the same voices as Azure (Vesna, Goran, Zofia, Marek, Hila, Jenny), with no account,
key or payment. Called by scripts/gen-voice.ts (`npm run voice:free`) with a JSON job list:

    [{"text": "...", "voice": "bs-BA-VesnaNeural", "rate": "-6%", "out": "public/audio/x.mp3"}, ...]

Each clip is written to a temporary file and renamed when complete, so an interrupted run never
leaves half a clip behind; re-running only synthesizes what is still missing.

Setup (once):  pip install edge-tts
"""

import asyncio
import json
import os
import sys

try:
    import edge_tts
except ImportError:
    print("Missing the edge-tts package. Install it once with:  pip install edge-tts", file=sys.stderr)
    sys.exit(2)

CONCURRENCY = 4
ATTEMPTS = 5


async def synthesize(job, sem, state, total):
    async with sem:
        tmp = job["out"] + ".part"
        for attempt in range(ATTEMPTS):
            try:
                await edge_tts.Communicate(job["text"], job["voice"], rate=job["rate"]).save(tmp)
                if os.path.getsize(tmp) == 0:
                    raise RuntimeError("empty audio")
                os.replace(tmp, job["out"])
                break
            except Exception as err:  # network hiccups and throttling: back off and retry
                if os.path.exists(tmp):
                    os.remove(tmp)
                if attempt == ATTEMPTS - 1:
                    state["failed"] += 1
                    print(f"\nfailed: {job['text'][:50]!r} ({job['voice']}): {err}", file=sys.stderr)
                    return
                await asyncio.sleep(1.5 * 2**attempt)
        state["done"] += 1
        if state["done"] % 20 == 0 or state["done"] == total:
            print(f"\r{state['done']}/{total}", end="", flush=True)


async def main(path):
    with open(path, encoding="utf-8") as f:
        jobs = json.load(f)
    state = {"done": 0, "failed": 0}
    sem = asyncio.Semaphore(CONCURRENCY)
    await asyncio.gather(*(synthesize(j, sem, state, len(jobs)) for j in jobs))
    print()
    return state["failed"]


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
    failed = asyncio.run(main(sys.argv[1]))
    sys.exit(1 if failed else 0)
