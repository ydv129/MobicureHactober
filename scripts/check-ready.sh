#!/usr/bin/env bash
set -euo pipefail
curl -fsS http://127.0.0.1:3000/ >/dev/null
curl -fsS http://127.0.0.1:8004/health >/dev/null
curl -fsS http://127.0.0.1:11434/api/tags >/dev/null
printf 'web, image engine, and Ollama are ready\n'
