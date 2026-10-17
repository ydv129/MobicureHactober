#!/bin/bash
echo "=== MobiCure Hackathon Ready Check ==="
echo ""
echo "[1] Git clean?"
git status --short || echo "Not git"
echo ""
echo "[2] mcp-server size?"
du -sh mcp-server
echo ""
echo "[3] Build?"
pnpm run build 2>&1 | tail -5
echo ""
echo "[4] Gemma?"
ollama list | grep gemma2 || echo "Gemma not found"
echo ""
echo "[5] MCP dist?"
ls -lh mcp-server/dist/index.js || echo "MCP not built"
echo ""
echo "=== Done ==="
