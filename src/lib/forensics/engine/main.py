from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import io
from PIL import Image, ExifTags
import numpy as np
import requests
import os

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

HF_API_URL = "https://api-inference.huggingface.co/models/umm-maybe/AI-image-detector"
HF_TOKEN = os.getenv("HF_TOKEN", "")

def get_exif_data(img):
    try:
        exif = img._getexif()
        if not exif: return {}, 100
        tags = {ExifTags.TAGS.get(k,k):v for k,v in exif.items()}
        score = 100
        warnings = []
        if "Software" in tags:
            sw = str(tags["Software"])
            if any(x in sw.lower() for x in ["【entity-photoshop¦canonical_name=Photoshop】","gimp","midjourney","stable","dall"]):
                score -= 25
                warnings.append(f"Edited: Software={sw}")
        return tags, score, warnings
    except:
        return {}, 100, []

def pixel_forensics_single_pass(img):
    try:
        gray = np.array(img.convert("L"))
        h,w = gray.shape
        block = 16
        vars = []
        edges = 0
        for y in range(0, h-block, block):
            for x in range(0, w-block, block):
                b = gray[y:y+block, x:x+block]
                vars.append(float(np.var(b)))
                if np.var(b) < 5: edges += 1
        if not vars:
            return 50, [], {}
        mean_var = float(np.mean(vars))
        std_var = float(np.std(vars))
        warnings = []
        score = 100
        if std_var < 15:
            warnings.append("Uniform noise pattern - possible AI generation")
            score -= 40
        if mean_var < 20:
            warnings.append("Low texture variation - synthetic pattern")
            score -= 20
        if edges > 10:
            warnings.append(f"Too smooth regions: {edges} blocks")
            score -= 30
        stats = {"mean_var": mean_var, "std_var": std_var, "blocks": len(vars), "smooth_blocks": edges}
        ela_score = max(0, min(100, score))
        return ela_score, warnings, stats
    except Exception as e:
        return 50, [f"Pixel analysis error: {e}"], {}

def check_ai_via_hf(image_bytes):
    try:
        if not HF_TOKEN:
            return None
        headers = {"Authorization": f"Bearer {HF_TOKEN}"}
        r = requests.post(HF_API_URL, headers=headers, data=image_bytes, timeout=8)
        if r.status_code == 200:
            data = r.json()
            if isinstance(data, list) and len(data)>0:
                # fake score
                fake = [x for x in data if "fake" in x.get("label","").lower() or "artificial" in x.get("label","").lower()]
                if fake:
                    return fake[0].get("score",0)*100
                # If real high
                real = [x for x in data if "real" in x.get("label","").lower()]
                if real:
                    return 100 - real[0].get("score",0)*20
        return None
    except:
        return None

@app.post("/scan")
async def scan(file: UploadFile = File(...)):
    content = await file.read()
    warnings_all = []
    try:
        img = Image.open(io.BytesIO(content)).convert("RGB")
    except:
        return {"legitimacy_score":0, "classification":"ERROR", "warnings":["Invalid image"], "forensics":{}}
    
    _, meta_score, meta_warnings = get_exif_data(img)
    warnings_all.extend(meta_warnings)
    
    pixel_score, pixel_warnings, stats = pixel_forensics_single_pass(img)
    warnings_all.extend(pixel_warnings)
    
    ai_score = check_ai_via_hf(content)
    ai_analysis = None
    
    # Ollama local fallback
    try:
        ollama_r = requests.post("http://localhost:11434/api/generate", json={"model":"gemma3:1b","prompt":f"Image forensics: mean_var {stats.get('mean_var',0):.1f} std_var {stats.get('std_var',0):.1f} - Is this AI generated? Short JSON: {{\"score\":0-100, \"reason\":\"...\"}}","stream":False}, timeout=5)
        if ollama_r.status_code == 200:
            ai_analysis = ollama_r.json().get("response","")[:200]
            # Try parse score
            import json, re
            m = re.search(r'\d+', ai_analysis)
            if m and ai_score is None:
                try:
                    v = int(m.group())
                    if 0 <= v <= 100:
                        ai_score = v
                except:
                    pass
    except:
        pass
    
    if ai_score is not None:
        final = (meta_score*0.3 + pixel_score*0.4 + ai_score*0.3)
        forensics = {"metadata_score":meta_score, "pixel_score":pixel_score, "ai_score":ai_score, "pixel_stats":stats, "metadata":{}, "ai_analysis":ai_analysis}
    else:
        final = (meta_score*0.4 + pixel_score*0.6)
        forensics = {"metadata_score":meta_score, "pixel_score":pixel_score, "ai_score":None, "pixel_stats":stats, "metadata":{}, "ai_analysis":ai_analysis}
    
    final = max(0, min(100, int(final)))
    if final >= 80: cls="REAL"
    elif final >= 60: cls="LIKELY_REAL"
    elif final >= 40: cls="SUSPICIOUS"
    else: cls="FAKE_AI_GENERATED"
    
    return {"legitimacy_score":final, "classification":cls, "warnings":warnings_all, "forensics":forensics, "details":{"filename":file.filename}}

@app.get("/")
def root():
    return {"status":"MobiCure Forensics Engine v2 Light - Running", "models":"tinyllama+gemma3:1b"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)
