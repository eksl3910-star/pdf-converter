#!/bin/bash
set -e

python3 -m uvicorn main:app --host 127.0.0.1 --port 8000 --app-dir /app/services/pdf2docx &
PDF2DOCX_PID=$!

cleanup() {
  kill "$PDF2DOCX_PID" 2>/dev/null || true
}
trap cleanup EXIT

export PDF2DOCX_URL=http://127.0.0.1:8000
export GOTENBERG_URL=
export MAX_FILE_SIZE=0
export TEMP_DIR=/tmp/conversions
export PORT="${PORT:-7860}"
export HOSTNAME=0.0.0.0
export NODE_ENV=production

mkdir -p /tmp/conversions

cd /app
exec node server.js
