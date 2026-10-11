#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if ! command -v python3.12 >/dev/null 2>&1; then
  echo "Python 3.12 is recommended. Install it with: brew install python@3.12"
  exit 1
fi
if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "FFmpeg is required for browser recordings. Install it with: brew install ffmpeg"
  exit 1
fi

if [ ! -d .venv ]; then
  python3.12 -m venv .venv
fi
# shellcheck disable=SC1091
source .venv/bin/activate
if ! python -c "import fastapi, birdnet, pandas" >/dev/null 2>&1; then
  python -m pip install --upgrade pip
  pip install -r requirements.txt
fi
# Photo AI is enabled by default. Set PANKHIPATH_INSTALL_PHOTO_AI=0 to skip
# its optional PyTorch/Transformers dependencies and use sound ID only.
if [ "${PANKHIPATH_INSTALL_PHOTO_AI:-1}" = "1" ]; then
  if ! python -c "import torch, transformers, PIL" >/dev/null 2>&1; then
    python -m pip install --upgrade pip
    pip install -r requirements-photo.txt
  fi
else
  echo "Photo AI dependency install skipped (PANKHIPATH_INSTALL_PHOTO_AI=0)."
fi
if [ ! -d node_modules ]; then
  npm install
fi

uvicorn backend.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!
cleanup() {
  kill "$BACKEND_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "PankhiPath API: http://127.0.0.1:8000/api/health"
echo "Starting website; use the local URL printed by Vite."
npm run dev
