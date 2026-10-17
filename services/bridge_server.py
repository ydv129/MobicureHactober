from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import subprocess
import sys
import os
import tempfile
import json

app = FastAPI()

@app.post("/api/python")
async def run_python_module(request: Request):
    data = await request.json()
    module = data.get("module")
    body = data.get("body", {})

    root_dir = os.path.abspath(os.path.dirname(__file__))
    module_path = os.path.abspath(module) if module else ""
    if module_path and not module_path.startswith(root_dir):
        raise ValueError("Path traversal blocked")

    if not module_path or not os.path.exists(module_path):
        return JSONResponse({"error": f"Module not found: {module}"}, status_code=400)

    with tempfile.NamedTemporaryFile(delete=False, mode="w", suffix=".json") as f:
        json.dump(body, f)
        f.flush()
        input_path = f.name

    try:
        result = subprocess.run(
            [sys.executable, module_path, input_path],
            capture_output=True,
            text=True,
            timeout=30
        )
        if result.returncode != 0:
            return JSONResponse({"error": result.stderr or "Script error"}, status_code=500)
        # Try to parse stdout as JSON
        try:
            output = json.loads(result.stdout)
        except Exception:
            output = {"output": result.stdout}
        return JSONResponse(output)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
    finally:
        if 'input_path' in locals() and input_path and os.path.exists(input_path):
            try: os.unlink(input_path)
            except: pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)
