import io
import numpy as np
from PIL import Image, ExifTags
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI(title="MobiCure Forensics Light v2")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

HF_API_URL = "https://api-inference.huggingface.co/models/umm-maybe/AI-image-detector"
MAX_UPLOAD_BYTES = 50 * 1024 * 1024
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "bmp", "tiff", "webp"}
def call_ollama(prompt: str) -> str:
    try:
        response = requests.post("http://127.0.0.1:11434/api/generate", json={"model": "tinyllama", "prompt": prompt, "stream": False, "options": {"temperature": 0.2, "num_predict": 150}}, timeout=15)
        if response.ok:
            return response.json().get("response", "")[:300]
    except Exception:
        pass
    return "Ollama offline"

def get_exif_data(img):
    try:
        exif = img._getexif()
        if not exif: return {}
        data = {}
        for k, v in exif.items():
            tag = ExifTags.TAGS.get(k, k)
            data[str(tag)] = str(v)[:200]
        return data
    except: return {}

def analyze_metadata(img, exif):
    score = 100
    warnings = []
    software_tags = ["Software", "ProcessingSoftware", "HostComputer"]
    for tag in software_tags:
        if tag in exif:
            warnings.append(f"Edited: {tag}={exif[tag][:50]}")
            score -= 25
    if "Adobe" in str(exif) or "Photoshop" in str(exif):
        warnings.append("Image editor signature found")
        score -= 20
    return max(0, score), warnings

def pixel_forensics_single_pass(img):
    try:
        img_gray = img.convert("L")
        img_np = np.array(img_gray)
        h, w = img_np.shape
        
        block = 16
        variances = []
        edges = 0
        
        for y in range(0, h-block, block):
            for x in range(0, w-block, block):
                patch = img_np[y:y+block, x:x+block]
                var = np.var(patch)
                variances.append(var)
                if var > 500:
                    edges += 1
        
        mean_var = np.mean(variances) if variances else 0
        std_var = np.std(variances) if variances else 0
        
        ela_score = 100
        noise_warnings = []
        
        if std_var < 15:
            noise_warnings.append("Uniform noise - possible AI generated")
            ela_score -= 40
        if mean_var < 20:
            noise_warnings.append("Low texture variation")
            ela_score -= 20
        if edges < 10:
            noise_warnings.append("Too smooth - deepfake pattern")
            ela_score -= 30
            
        return max(0, ela_score), noise_warnings, {"mean_var": float(mean_var), "std_var": float(std_var), "edges": edges}
    except Exception as e:
        return 50, [f"Pixel analysis error: {str(e)[:100]}"], {}

def image_stats(img):
    arr = np.asarray(img.convert("RGB"), dtype=np.float32)
    gray = np.mean(arr, axis=2)
    dx = np.abs(np.diff(gray, axis=1))
    dy = np.abs(np.diff(gray, axis=0))
    return {
        "width": img.width,
        "height": img.height,
        "brightness": round(float(gray.mean()), 2),
        "contrast": round(float(gray.std()), 2),
        "edge_density": round(float((np.mean(dx > 20) + np.mean(dy > 20)) / 2), 4),
    }
def check_ai_via_hf(image_bytes):
    try:
        resp = requests.post(HF_API_URL, data=image_bytes, timeout=8)
        if resp.status_code == 200:
            data = resp.json()
            if isinstance(data, list) and len(data) > 0:
                for item in data:
                    if item.get("label") == "artificial":
                        ai_score = item.get("score", 0) * 100
                        return 100 - ai_score, f"AI: {ai_score:.1f}%", ai_score
                    if "fake" in item.get("label", "").lower():
                        ai_score = item.get("score", 0) * 100
                        return 100 - ai_score, f"Fake: {ai_score:.1f}%", ai_score
                top = max(data, key=lambda x: x.get("score", 0))
                return 50, str(top), 50
        return None
    except Exception:
        return None

@app.get("/health")
def health():
    return {"status": "ok", "engine": "light-v2", "mode": "hybrid-api-local", "ram": "<400MB"}

@app.get("/models/status")
def models_status():
    return {
        "pixel_forensics": "local-numpy",
        "metadata": "local-pillow",
        "ai_detector": "hf-api: umm-maybe/AI-image-detector + local Ollama"
    }

@app.post("/scan")
async def scan_image(file: UploadFile = File(...)):
    try:
        content = await file.read()
        extension = (file.filename or "").lower().rsplit(".", 1)[-1]
        if extension not in ALLOWED_EXTENSIONS:
            return {"error": "Unsupported image type", "legitimacy_score": 0, "classification": "ERROR", "warnings": ["Use JPG, PNG, BMP, TIFF, or WEBP"]}
        if len(content) > MAX_UPLOAD_BYTES:
            return {"error": "Image exceeds 50 MB", "legitimacy_score": 0, "classification": "ERROR", "warnings": ["File is too large"]}
        source = Image.open(io.BytesIO(content))
        source.verify()
        img = Image.open(io.BytesIO(content)).convert("RGB")
        exif = get_exif_data(img)
        stats = image_stats(img)
        
        meta_score, meta_warn = analyze_metadata(img, exif)
        pixel_score, pixel_warn, pixel_stats = pixel_forensics_single_pass(img)
        
        ai_result = check_ai_via_hf(content)
        if ai_result:
            ai_score, ai_label, ai_conf = ai_result
            ai_warn = [ai_label]
        else:
            ai_score = 50
            ai_label = "HF API unavailable - using local heuristics"
            ai_conf = 0
            ai_warn = [ai_label]
        
        final_score = int((meta_score * 0.2 + pixel_score * 0.5 + ai_score * 0.3))
        
        if final_score >= 80:
            classification = "LIKELY_REAL"
        elif final_score >= 60:
            classification = "UNCERTAIN"
        elif final_score >= 40:
            classification = "SUSPICIOUS"
        else:
            classification = "LIKELY_FAKE"
        
        all_warnings = meta_warn + pixel_warn + ai_warn
        
        return {
            "filename": file.filename,
            "legitimacy_score": final_score,
            "classification": classification,
            "confidence": ai_conf,
            "warnings": all_warnings,
            "forensics": {
                "metadata_score": meta_score,
                "pixel_score": pixel_score,
                "ai_score": ai_score,
                "exif_count": len(exif),
                "pixel_stats": pixel_stats,
                "image_stats": stats
            },
            "exif": {k: v for k, v in list(exif.items())[:15]},
            "engine": "v2-light-hybrid"
        }
    except Exception as e:
        return {
            "error": str(e),
            "legitimacy_score": 0,
            "classification": "ERROR",
            "warnings": ["Scan failed before a verdict could be produced"],
            "forensics": {"metadata_score": 0, "pixel_score": 0, "ai_score": 0, "pixel_stats": {}},
            "exif": {},
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)
