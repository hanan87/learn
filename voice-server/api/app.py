"""
The functions' single entry point for Vercel's Python runtime (pyproject.toml): /api/chat goes to the
conversation partner (chat.py), every other path to the voice (tts.py).
"""

try:  # imported as the package module api.app on Vercel
    from .chat import handler as ChatHandler
    from .tts import handler as TtsHandler
except ImportError:  # imported directly (dev_server.py, or a function file of its own)
    from chat import handler as ChatHandler
    from tts import handler as TtsHandler


class handler(ChatHandler, TtsHandler):
    def _target(self):
        return ChatHandler if self.path.split("?")[0].rstrip("/").endswith("/api/chat") else TtsHandler

    def do_POST(self) -> None:
        self._target().do_POST(self)

    def do_GET(self) -> None:
        self._target().do_GET(self)

    def do_OPTIONS(self) -> None:
        self._target().do_OPTIONS(self)
