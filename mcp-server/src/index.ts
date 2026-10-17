const tools = ["apk_scan", "image_scan", "url_scan", "local_explanation"]
process.stdin.setEncoding("utf8")
process.stdin.on("data", (chunk) => { if (chunk.trim()) process.stdout.write(JSON.stringify({ tools, analysis_mode: "service-backed-or-heuristic", message: "Use the web API services for scanner execution." }) + "\n") })
