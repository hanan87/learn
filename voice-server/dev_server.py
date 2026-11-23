"""Runs the voice function locally for testing: python voice-server/dev_server.py → http://localhost:8787/api/tts"""

import sys
from http.server import ThreadingHTTPServer
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "api"))
from tts import handler  # noqa: E402

if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", 8787), handler).serve_forever()
