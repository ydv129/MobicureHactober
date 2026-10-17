#!/bin/bash
set -e
echo "1. Python deps..."
pip install fastapi uvicorn androguard python-multipart -q

echo "2. Node deps..."
pnpm add adm-zip -w
pnpm add -D @types/adm-zip -w

echo "3. Starting Python service..."
pkill -f apk_analyzer_service || true
rm -f /tmp/apk-service.log
mkdir -p temp
nohup python3 apk_analyzer_service.py > /tmp/apk-service.log 2>&1 &
sleep 3
echo "Log:"
cat /tmp/apk-service.log | tail -30 || echo "No log yet"

echo "4. Next dev..."
./kill.sh
pnpm dev
