#!/usr/bin/env bash
set -euo pipefail
exec python "$(dirname "$0")/apk_analyzer_service.py"
