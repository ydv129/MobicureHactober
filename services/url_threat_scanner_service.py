import ipaddress
import os
from urllib.parse import urlparse
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="MobiCure URL Threat Scanner")
SUSPICIOUS_TLDS = (".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".work")

class URLRequest(BaseModel):
    url: str

def analyze(value: str):
    normalized = value if value.startswith(("http://", "https://")) else f"https://{value}"
    parsed = urlparse(normalized)
    score = 100
    warnings = []
    if parsed.scheme != "https": score -= 20; warnings.append("HTTPS is not enabled")
    if parsed.hostname and parsed.hostname.endswith(SUSPICIOUS_TLDS): score -= 25; warnings.append("Suspicious top-level domain")
    try: ipaddress.ip_address(parsed.hostname or "") ; score -= 25; warnings.append("IP address used as host")
    except ValueError: pass
    if parsed.hostname and len(parsed.hostname.split(".")) > 4: score -= 10; warnings.append("Many subdomains")
    return normalized, max(0, score), warnings

@app.get("/health")
def health(): return {"status": "ok", "analysis_mode": "heuristic"}

@app.post("/scan")
def scan(request: URLRequest):
    normalized, score, warnings = analyze(request.url)
    return {"legitimacy_score": score, "classification": "LOW_RISK" if score >= 80 else "MEDIUM_RISK" if score >= 60 else "HIGH_RISK", "analysis_mode": "heuristic", "external_intelligence": {"virustotal": "unavailable", "urlscan": "unavailable", "abusech": "unavailable"}, "warnings": warnings, "details": {"url": normalized}}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8005")))
