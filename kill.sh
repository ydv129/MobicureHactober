#!/bin/bash
echo "🔴 Killing dev servers (NOT ollama)..."
lsof -ti:8004 | xargs kill -9 2>/dev/null; fuser -k 8004/tcp 2>/dev/null; pkill -9 -f "engine/main.py" 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null; fuser -k 3000/tcp 2>/dev/null; pkill -9 -f "next dev" 2>/dev/null
pkill -9 -f concurrently 2>/dev/null; sleep 1
jobs -p | xargs kill -9 2>/dev/null; true
echo "✅ Ports:"; lsof -i:3000 && echo "❌3000 busy" || echo "✅3000 free"; lsof -i:8004 && echo "❌8004 busy" || echo "✅8004 free"
echo "✅ Ollama:"; curl -s http://localhost:11434/api/tags | head -20 || echo "Ollama not running"
