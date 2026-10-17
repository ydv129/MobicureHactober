#!/bin/bash
echo ""
echo "╔════════════════════════════════════════════════════╗"
echo "║ 🔐 MobiCure - Gemma 2B Local Proof (Offline) ║"
echo "║ Track: Best Use of Google Gemma ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""
echo "📦 STEP 1: Ollama Models (Local - No Cloud)"
ollama list
echo ""
echo "🌐 STEP 2: Ollama URL - localhost only"
grep -n "OLLAMA_URL\|DEFAULT_MODEL" lib/gemma.ts
echo " → Proof: http://localhost:11434 = Local, NOT cloud"
echo ""
echo "🧠 STEP 3: lib/gemma.ts"
head -25 lib/gemma.ts
echo ""
echo "🤖 STEP 4: Live Gemma Test - APK"
echo " Prompt: whatsapp-gb-mod.apk safe hai?"
curl -s -X POST http://localhost:11434/api/generate -H "Content-Type: application/json" -d '{"model":"gemma2:2b","prompt":"APK whatsapp-gb-mod.apk safe hai? 1 line Hinglish me batao risk HIGH/MED/LOW","stream":false}' | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('response','ERROR'))"
echo ""
echo "🔍 STEP 5: Phishing URL Test"
curl -s -X POST http://localhost:11434/api/generate -H "Content-Type: application/json" -d '{"model":"gemma2:2b","prompt":"URL faceb00k-login-verify.tk safe hai? Hinglish 1 line","stream":false}' | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('response','ERROR'))"
echo ""
echo "✅ STEP 6: MCP Server"
ls -lh mcp-server/dist/index.js
echo ""
echo "🎯 CONCLUSION: Gemma 2B LOCAL, PRIVACY-FIRST, OFFLINE"
echo ""
