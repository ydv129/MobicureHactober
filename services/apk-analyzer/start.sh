#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
pip install -q -r requirements.txt
exec python3 apk_analyzer_service.py
