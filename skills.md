# MobiCure Skills - 6 Open-Source AI Security Agents

Built for Hacktoberfest Mumbai x Paytm, targeting the Best Open-Source AI Project and Best Use of Gemma tracks. MobiCure is privacy-first, runs locally with Ollama and Gemma 2B, and supports VirusTotal live intelligence through [lib/threatIntel.ts](./lib/threatIntel.ts).

## 1. APK Analyzer

**MCP tool:** `scan_apk`

**Description:** Analyzes Android APK filenames and package indicators for modded, cracked, premium, unlocked, or suspicious applications.

**When to use:** Use before installing APKs from outside official app stores or reviewing modified Android packages.

**Example queries:**

- Analyze `premium-unlocked.apk` for security risks.
- Is this modded APK safe to install?
- Identify suspicious indicators in this Android package.

## 2. URL Threat Hunter

**MCP tool:** `scan_url`

**Description:** Detects phishing, obfuscation, IP-based hosts, suspicious shortened links, and other URL threat indicators. Results can be enriched with VirusTotal and URLhaus live intelligence.

**When to use:** Use before opening links from messages, emails, QR codes, shortened URLs, or unexpected login pages.

**Example queries:**

- Scan `https://example.com/login` for phishing indicators.
- Is this shortened URL safe to open?
- Check this URL with live threat intelligence.

## 3. Phishing Email Detector

**MCP tool:** `scan_email`

**Description:** Identifies urgent language, account verification requests, suspension claims, suspicious senders, and phishing links in email content.

**When to use:** Use when an email requests credentials, payment, downloads, account recovery, or immediate action.

**Example queries:**

- Check this email for phishing indicators.
- Does this message use social engineering?
- Explain the safest next steps for this suspicious email.

## 4. Image Metadata Scanner

**MCP tool:** `scan_image_metadata`

**Description:** Assesses image metadata privacy risks, including GPS location, device information, timestamps, and other details that may expose sensitive context.

**When to use:** Use before sharing photos publicly, uploading images, or sending media from location-sensitive environments.

**Example queries:**

- Check this image for location privacy risks.
- What private information could this image metadata expose?
- How should I remove GPS metadata before sharing this photo?

## 5. Network Scanner

**MCP tool:** `scan_network`

**Description:** Reviews authorized network targets and port ranges to identify exposed services and prioritize defensive investigation.

**When to use:** Use only against systems and networks you own or are explicitly authorized to test.

**Example queries:**

- Scan my authorized lab host on ports 1-1024.
- Which exposed services should I investigate first?
- Explain why an open SSH port matters.

## 6. Gemma Threat Explainer

**MCP tool:** `gemma_threat_explain`

**Description:** Uses local Gemma 2B to turn technical security findings into concise, actionable explanations in English, Hindi, or Hinglish.

**When to use:** Use after any security scan when you need a clear explanation, risk summary, or practical remediation steps.

**Example queries:**

- Explain this threat in simple Hinglish.
- Summarize this scan and tell me what to do next.
- Explain the risk to a non-technical user in two lines.

## Local Model

Install Ollama and run the local Gemma model:

```bash
ollama run gemma2:2b
ollama list
```

MobiCure sends Gemma prompts to the local Ollama service at `localhost:11434`. Threat data stays local when using Gemma.

## MCP Usage

Build the MCP server:

```bash
cd /workspaces/mobicure/mcp-server
npm install
npm run build
```

Add MobiCure to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mobicure": {
      "command": "node",
      "args": ["/workspaces/mobicure/mcp-server/dist/index.js"]
    }
  }
}
```

Restart Claude Desktop after saving the configuration. The six MobiCure tools will then be available through MCP.

## Demo

To demonstrate offline working for judges:

1. Start Ollama locally with `ollama run gemma2:2b`.
2. Run the MobiCure app or connect the MCP server in Claude Desktop.
3. Use `scan_apk` with `premium-unlocked.apk` to show deterministic local APK risk detection.
4. Use `gemma_threat_explain` with the scan result to show a local Gemma explanation.
5. Stop Ollama and repeat the scan to show that the core heuristic tools continue working without cloud AI.
6. Show URL results with and without `VIRUSTOTAL_API_KEY` to demonstrate local fallback and optional VirusTotal live intelligence.

VirusTotal live URL analysis is implemented in [lib/threatIntel.ts](./lib/threatIntel.ts).
