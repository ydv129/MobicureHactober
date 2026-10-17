import hashlib
import io
import uuid
from typing import Dict

import numpy as np
import requests
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from PIL.ExifTags import TAGS

MAX_UPLOAD_BYTES = 50 * 1024 * 1024
EDITING_SIGS = {
    "photoshop",
    "gimp",
    "lightroom",
    "faceapp",
    "dall-e",
    "midjourney",
    "stable diffusion",
}
CLIP_URL = "https://api-inference.huggingface.co/models/openai/clip-vit-base-patch32"

app = FastAPI(title="MobiCure Light Image Scanner")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def extract_exif(image: Image.Image) -> Dict[str, object]:
    exif = image.getexif()
    values: Dict[str, object] = {}
    for key, value in exif.items():
        values[TAGS.get(key, str(key))] = value
    return values


def ela_simple(image: Image.Image) -> Dict[str, float]:
    source = image.convert("RGB").resize((16, 16))
    buffer = io.BytesIO()
    source.save(buffer, format="JPEG", quality=90)
    buffer.seek(0)
    recompressed = Image.open(buffer).convert("RGB")
    difference = np.abs(np.asarray(source, dtype=np.float32) - np.asarray(recompressed, dtype=np.float32))
    return {
        "quality": 90,
        "grid_size": 16,
        "mean_error": float(difference.mean()),
        "variance": float(difference.var()),
    }


def color_check(image: Image.Image) -> Dict[str, object]:
    histogram = np.asarray(image.convert("RGB").histogram())
    empty_bins = int(np.count_nonzero(histogram == 0))
    return {
        "empty_bins": empty_bins,
        "histogram_bins": int(histogram.size),
        "suspicious": empty_bins > histogram.size * 0.4,
    }


def clip_hf_api(image_bytes: bytes) -> Dict[str, object]:
    try:
        response = requests.post(
            CLIP_URL,
            data=image_bytes,
            headers={"Content-Type": "image/jpeg"},
            timeout=10,
        )
        response.raise_for_status()
        classifications = response.json()
        if not isinstance(classifications, list):
            classifications = []
        classifications = sorted(
            [item for item in classifications if isinstance(item, dict)],
            key=lambda item: float(item.get("score", 0)),
            reverse=True,
        )[:5]
        ai_generated = any(
            "ai-generated" in str(item.get("label", "")).lower()
            or "synthetic" in str(item.get("label", "")).lower()
            for item in classifications
        )
        confidence = max(
            [float(item.get("score", 0)) for item in classifications if isinstance(item, dict)],
            default=0.0,
        )
        return {
            "enabled": True,
            "verdict": "ai_generated" if ai_generated and confidence > 0.5 else "unknown",
            "confidence": confidence,
            "classifications": classifications,
        }
    except Exception:
        return {
            "enabled": False,
            "verdict": "unavailable",
            "confidence": 0.0,
            "classifications": [],
        }


def scan_image(filename: str, image_bytes: bytes) -> Dict[str, object]:
    try:
        image = Image.open(io.BytesIO(image_bytes))
        image.load()
    except Exception as error:
        raise HTTPException(status_code=400, detail=f"Invalid image: {error}") from error

    exif = extract_exif(image)
    software = str(exif.get("Software", "")).lower()
    software_match = next((signature for signature in EDITING_SIGS if signature in software), None)
    ela = ela_simple(image)
    color = color_check(image)
    clip = clip_hf_api(image_bytes)
    score = 100
    findings = []

    if software_match:
        score -= 20
        findings.append({
            "category": "metadata",
            "severity": "medium",
            "description": f"Editing software detected: {software_match}",
            "confidence": 0.9,
        })
    if ela["variance"] > 5:
        score -= 25
        findings.append({
            "category": "ela",
            "severity": "medium",
            "description": "Error level analysis found compression variation",
            "confidence": min(1.0, ela["variance"] / 50),
        })
    if color["suspicious"]:
        score -= 10
        findings.append({
            "category": "color",
            "severity": "low",
            "description": "Color histogram contains unusually empty bins",
            "confidence": 0.6,
        })
    if clip["verdict"] == "ai_generated":
        score -= 15
        findings.append({
            "category": "clip",
            "severity": "high",
            "description": "CLIP classification suggests synthetic content",
            "confidence": clip["confidence"],
        })

    score = max(0, min(100, score))
    if clip["verdict"] == "ai_generated":
        classification = "ai_generated"
    elif score > 75:
        classification = "authentic"
    elif score > 50:
        classification = "suspicious"
    else:
        classification = "manipulated"

    return {
        "scan_id": str(uuid.uuid4()),
        "created_at": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
        "file_hash": hashlib.sha256(image_bytes).hexdigest(),
        "filename": filename,
        "file_size": len(image_bytes),
        "file_info": {
            "format": image.format or "",
            "width": image.width,
            "height": image.height,
            "mode": image.mode,
        },
        "analysis": {
            "metadata": {"exif": exif, "software": software},
            "image_stats": {"width": image.width, "height": image.height, "mode": image.mode},
            "error_level_analysis": ela,
            "noise_analysis": {},
            "edge_analysis": {},
            "color_analysis": color,
            "compression_analysis": {},
            "clone_detection": {},
            "ai_detection": {"verdict": classification, "confidence": clip["confidence"]},
            "clip_forensics": clip,
            "face_forensics": {},
        },
        "legitimacy_score": score,
        "classification": classification,
        "findings": findings,
        "is_likely_real": classification == "authentic",
    }


@app.post("/api/scan")
async def scan(file: UploadFile = File(...)):
    image_bytes = await file.read()
    if len(image_bytes) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File too large")
    return {"results": scan_image(file.filename or "unknown", image_bytes)}


@app.get("/health")
async def health():
    return {"ok": True, "mode": "light"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8004)
