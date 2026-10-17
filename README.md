# MobiCure Forensics

> Lightweight image authenticity analysis for the Hacktoberfest Hack Day Mumbai 2026 community.

MobiCure Forensics is a small hybrid web application that helps users inspect suspicious images. It combines local metadata and pixel analysis with an optional Hugging Face image detector. If the remote model is unavailable, the application continues with local NumPy heuristics instead of requiring a large machine-learning runtime.

This project is designed for approachable contributions: the backend stays below 200 lines, avoids heavyweight ML dependencies, and targets less than 400 MB of RAM during normal development.

## Highlights

- Drag-and-drop image intake with an immediate preview
- Metadata, texture, and AI-signal analysis in one scan
- Legitimacy score from 0 to 100 with clear classifications
- Terminal-style analysis trace and review warnings
- Hybrid remote/local operation with no required API key
- Next.js 14 frontend and lightweight FastAPI engine

## Stack

| Layer | Technology |
| --- | --- |
| Web app | Next.js 14, React 18, TypeScript |
| API adapter | Next.js Route Handler at `/api/scan` |
| Forensics engine | FastAPI, Uvicorn, Pillow, NumPy, Requests |
| Remote signal | Hugging Face `umm-maybe/AI-image-detector` |

The engine deliberately does not use `torch`, `transformers`, `clip`, or `facenet`.

## Project Structure

```text
app/
├── app/
│   ├── api/scan/route.ts       # Browser-to-engine adapter
│   ├── globals.css             # Dark forensic lab interface
│   ├── layout.tsx
│   └── page.tsx
components/forensics/
│   ├── DropZone.tsx
│   ├── ForensicsTerminal.tsx
│   └── VerdictRing.tsx
lib/forensics/engine/
    ├── main.py                 # FastAPI service on port 8004
    └── requirements.txt
services/
├── apk-analyzer/               # Androguard service on port 8003
└── url_threat_scanner_service.py
mcp-server/                     # Service-aware MCP entrypoint
```

## Requirements

- Node.js 20 or newer
- pnpm 9 or newer
- Python 3.10 or newer

## Getting Started

Install the frontend dependencies:

```bash
pnpm install
```

Install the lightweight Python engine dependencies:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r lib/forensics/engine/requirements.txt
```

Start both services from one terminal:

```bash
pnpm run dev
```

The web interface is available at [http://localhost:3000](http://localhost:3000). The image engine listens on `8004`, and the APK service listens on `8003`. `pnpm run dev` starts both services and the web app. `./kill.sh` stops application ports without stopping Ollama.

APK analysis is service-backed and requires the optional `androguard` dependency. If it is unavailable, the API returns a service error instead of a fabricated security report.

## How Analysis Works

Each scan produces a score using the existing weighted model:

```text
Final score = metadata (20%) + pixel forensics (50%) + AI signal (30%)
```

The engine classifies results as `LIKELY_REAL`, `UNCERTAIN`, `SUSPICIOUS`, or `LIKELY_FAKE`. The remote AI signal is best-effort. A failed request falls back to a neutral local signal so the rest of the analysis remains available.

### API

Check the engine:

```bash
curl http://localhost:8004/health
```

Scan an image directly:

```bash
curl -X POST http://localhost:8004/scan \
	-F "file=@/path/to/image.jpg"
```

The response includes `legitimacy_score`, `classification`, `warnings`, EXIF data, and a `forensics` object containing `metadata_score`, `pixel_score`, `ai_score`, and `pixel_stats`.

## Contributing

Contributions are welcome, especially improvements that keep the application lightweight and easy to run in a Codespace.

1. Fork the repository and create a focused branch.
2. Install the Node and Python dependencies locally.
3. Make a small, clearly scoped change.
4. Run `pnpm exec next build` and verify `curl http://localhost:8004/health`.
5. Open a pull request with a clear description and screenshots for UI changes.

Please avoid introducing heavyweight model runtimes or committing generated files, dependency directories, credentials, or local environment files.

## Event

Built for Hacktoberfest Hack Day Mumbai 2026. Explore open-source AI, collaborate openly, and help make practical forensic tooling more accessible.

#Hacktoberfest #HF26Mumbai #Oct26MTP #mumtechup
