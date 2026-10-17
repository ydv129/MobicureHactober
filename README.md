# MobiCure - AI-Powered Mobile Threat Intelligence Platform
## Hacktoberfest Mumbai 2025 - Best Open-Source AI Project + Best Use of Google Gemma

Tagline: Privacy-first mobile security that runs Gemma 2B locally via Ollama - No cloud, no data leak.

### 🎯 Tracks
- Best Open-Source AI Project
- Best Use of Google Gemma (Gemma 2B local via Ollama)
- Modern Developer Protocols (MCP)

### ✨ 6 Security Agents (MCP Tools)
1. `scan_apk` - APK Analyzer Agent - Detects modded APKs, malware
2. `scan_url` - URL Threat Hunter - Phishing, typosquat, live VirusTotal intel
3. `scan_email` - Phishing Email Detector
4. `scan_image_metadata` - Image Privacy Leak Scanner
5. `scan_network` - Network Scanner
6. `gemma_threat_explain` - Gemma 2B threat explainer Hinglish

### 🚀 Local AI Setup (Privacy-First)
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh
ollama serve &
ollama pull gemma2:2b  # 1.6GB only
ollama list  # Verify

# Test Gemma
curl -X POST http://localhost:11434/api/generate -H "Content-Type: application/json" -d '{"model":"gemma2:2b","prompt":"Analyze whatsapp-mod.apk risk Hinglish","stream":false}' | jq -r .response
```
