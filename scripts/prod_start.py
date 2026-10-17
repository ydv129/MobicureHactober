#!/usr/bin/env python3
"""Prod start"""

import os
import sys
import time
import signal
import subprocess
from pathlib import Path

processes = []
is_shutting_down = False

def cleanup(sig=None, frame=None):
    global is_shutting_down
    if is_shutting_down:
        return
    is_shutting_down = True
    print("\n[Container] Terminating all services...", flush=True)
    for p in processes:
        try:
            if p.poll() is None:
                p.terminate()
        except Exception:
            pass
    time.sleep(1)
    for p in processes:
        try:
            if p.poll() is None:
                p.kill()
        except Exception:
            pass
    sys.exit(0)

signal.signal(signal.SIGINT, cleanup)
signal.signal(signal.SIGTERM, cleanup)

def main():
    root_dir = Path(__file__).resolve().parent.parent
    os.chdir(root_dir)

    port = os.environ.get("PORT", "3000")
    print(f"[Container] Initializing MOBICURE production deployment on port {port}...", flush=True)

    services = [
        ("Bridge", "services/bridge_server.py"),
        ("Image", "services/image_metadata_scanner_service.py"),
        ("APK", "services/apk_analyzer_service.py"),
        ("URL", "services/url_threat_scanner_service.py"),
        ("Network", "services/network_scanner_service.py"),
        ("Email", "services/email_phishing_service.py"),
    ]
    for name, service in services:
        service_path = root_dir / service
        if service_path.exists():
            print(f"[Container] Launching {name} Microservice...", flush=True)
            processes.append(subprocess.Popen([sys.executable, str(service_path)], cwd=str(root_dir)))

    time.sleep(5)

    # 7. Start Next.js Production Server on public $PORT
    print(f"[Container] Starting Next.js Production Server on 0.0.0.0:{port}...", flush=True)
    next_cmd = ["npx", "next", "start", "-p", str(port), "-H", "0.0.0.0"]
    p_next = subprocess.Popen(next_cmd, cwd=str(root_dir))
    processes.append(p_next)

    p_next.wait()
    cleanup()

if __name__ == "__main__":
    main()
