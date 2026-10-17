import os
import tempfile
from datetime import datetime, timezone
from fastapi import FastAPI, File, HTTPException, UploadFile

app = FastAPI(title="MobiCure APK Analyzer")
MAX_BYTES = 100 * 1024 * 1024


def empty_result(mode="failed"):
    return {"meta": {"timestamp": datetime.now(timezone.utc).isoformat(), "analysis_mode": mode}, "package": {}, "permissions": {"declared": [], "dangerous": [], "critical": []}, "components": {"activities": [], "services": [], "receivers": [], "providers": []}, "persistence_indicators": [], "api_indicators": [], "network_indicators": {"urls": [], "ips": []}, "code_analysis": {}, "privacy_concerns": [], "risk": {"score": 0, "verdict": "SCAN_FAILED", "findings": []}, "recommendations": []}


@app.get("/health")
def health():
    return {"status": "ok", "service": "apk-analyzer", "androguard": _androguard_available()}


def _androguard_available():
    try:
        import androguard  # noqa: F401
        return True
    except ImportError:
        return False


@app.post("/scan")
async def scan(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".apk"):
        raise HTTPException(400, "Only APK files are supported")
    data = await file.read()
    if not data or len(data) > MAX_BYTES:
        raise HTTPException(400, "APK is empty or exceeds 100 MB")
    try:
        from androguard.core.bytecodes.apk import APK
    except ImportError:
        raise HTTPException(503, "Androguard APK analyzer is unavailable")
    path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".apk", delete=False) as handle:
            handle.write(data)
            path = handle.name
        apk = APK(path)
        if not apk.is_valid_APK():
            raise HTTPException(400, "Invalid APK archive")
        permissions = sorted(apk.get_permissions() or [])
        activities = sorted(apk.get_activities() or [])
        services = sorted(apk.get_services() or [])
        receivers = sorted(apk.get_receivers() or [])
        providers = sorted(apk.get_providers() or [])
        package = {"name": apk.get_package(), "version_name": apk.get_androidversion_name(), "version_code": apk.get_androidversion_code(), "min_sdk": apk.get_min_sdk_version(), "target_sdk": apk.get_target_sdk_version()}
        return {**empty_result("full"), "meta": {"filename": file.filename, "size": len(data), "timestamp": datetime.now(timezone.utc).isoformat(), "analysis_mode": "full"}, "package": package, "permissions": {"declared": permissions, "dangerous": [], "critical": []}, "components": {"activities": activities, "services": services, "receivers": receivers, "providers": providers}, "risk": {"score": 0, "verdict": "INCOMPLETE", "findings": ["Permission and component classification requires configured policy rules"]}, "recommendations": ["Review declared permissions and exported components manually"]}
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(422, f"APK analysis failed: {type(error).__name__}")
    finally:
        if path:
            try: os.unlink(path)
            except OSError: pass


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8003")))
