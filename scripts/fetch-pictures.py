"""
Fetches the 3D pictures named in src/data/pictures.ts from Microsoft's Fluent Emoji (MIT licence,
github.com/microsoft/fluentui-emoji) and saves each as a small WebP in public/pictures/<slug>.webp,
next to a copy of the licence. Pictures already saved are skipped, so the script can be run again
after new phrases get pictures.

Usage: python scripts/fetch-pictures.py   (needs Pillow with WebP support)
"""

import io
import json
import re
import sys
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'pictures'
REPO = 'microsoft/fluentui-emoji'
RAW = f'https://raw.githubusercontent.com/{REPO}/main/'
SIZE = 256
QUALITY = 80


def slug(name: str) -> str:
    """Same rule as pictureSlug() in src/data/pictures.ts."""
    return re.sub(r'^-|-$', '', re.sub(r'[^a-z0-9]+', '-', name.lower()))


def get(url: str) -> bytes:
    req = urllib.request.Request(url, headers={'User-Agent': 'learn-app-picture-fetch'})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def main() -> int:
    source = (ROOT / 'src' / 'data' / 'pictures.ts').read_text(encoding='utf-8')
    names = sorted(set(re.findall(r"'[a-z]\d-\d\d': '([^']+)'", source)))
    OUT.mkdir(parents=True, exist_ok=True)

    # One listing of the whole repository finds each picture's 3D file. Pictures with skin tones keep
    # the neutral one under "Default/" (name_3d_default.png); the others have a single name_3d.png.
    tree = json.loads(get(f'https://api.github.com/repos/{REPO}/git/trees/main?recursive=1'))
    by_folder: dict[str, str] = {}
    for t in tree['tree']:
        path = t['path']
        parts = path.split('/')
        if parts[0] == 'assets' and len(parts) >= 4 and (path.endswith('_3d.png') or path.endswith('_3d_default.png')):
            by_folder[parts[1]] = path

    license_file = OUT / 'LICENSE'
    if not license_file.exists():
        license_file.write_bytes(get(RAW + 'LICENSE'))

    missing, saved, skipped, total_bytes = [], 0, 0, 0
    for i, name in enumerate(names, 1):
        target = OUT / f'{slug(name)}.webp'
        if target.exists():
            skipped += 1
            total_bytes += target.stat().st_size
            continue
        path = by_folder.get(name)
        if not path:
            missing.append(name)
            print(f'[{i}/{len(names)}] MISSING {name}', flush=True)
            continue
        png = Image.open(io.BytesIO(get(RAW + urllib.request.quote(path))))
        png = png.convert('RGBA')
        if png.width != SIZE:
            png = png.resize((SIZE, SIZE), Image.LANCZOS)
        png.save(target, 'WEBP', quality=QUALITY, method=6)
        saved += 1
        total_bytes += target.stat().st_size
        print(f'[{i}/{len(names)}] {name} -> {target.name} ({target.stat().st_size // 1024} KB)', flush=True)

    print(f'Done: {saved} saved, {skipped} already there, {len(missing)} missing, {total_bytes / 1024 / 1024:.1f} MB in total.', flush=True)
    if missing:
        print('Missing:', ', '.join(missing), flush=True)
    return 1 if missing else 0


if __name__ == '__main__':
    sys.exit(main())
