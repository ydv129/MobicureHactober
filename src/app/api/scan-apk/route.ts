import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData()
    const file = form.get("file") as File | null
    if (!file) return NextResponse.json({ error: "No APK file", legitimacy_score: 0, classification: "ERROR" }, { status: 400 })
    const lower = file.name.toLowerCase()
    const warnings: string[] = []
    let score = 100
    if (file.size > 50 * 1024 * 1024) warnings.push("Large APK")
    if (file.size > 100 * 1024 * 1024) { score -= 20; warnings.push("APK exceeds 100 MB") }
    if (["mod", "hack", "crack", "free", "money"].some((word) => lower.includes(word))) { score -= 30; warnings.push("Suspicious APK filename") }
    let aiAnalysis = "Ollama offline - local heuristics used"
    let ollamaModel = "offline"
    try {
      const response = await fetch("http://127.0.0.1:11434/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "tinyllama", prompt: `Analyze whether APK name ${file.name} with size ${file.size} bytes is suspicious. Return a short risk and reason.`, stream: false, options: { temperature: 0.2, num_predict: 100 } }), signal: AbortSignal.timeout(15000) })
      if (response.ok) { aiAnalysis = ((await response.json()).response || aiAnalysis).slice(0, 300); ollamaModel = "tinyllama" }
    } catch {}
    score = Math.max(0, score)
    const classification = score >= 80 ? "LEGIT" : score >= 60 ? "SUSPICIOUS" : score >= 40 ? "RISKY" : "MALWARE"
    return NextResponse.json({ legitimacy_score: score, classification, warnings, forensics: { apk_score: score }, details: { filename: file.name, size: file.size, permissions: [], ai_analysis: aiAnalysis, ollama_model: ollamaModel } })
  } catch (error: any) { return NextResponse.json({ error: error.message || "APK scan failed", legitimacy_score: 0, classification: "ERROR", warnings: ["APK scan failed"], forensics: { apk_score: 0 } }, { status: 500 }) }
}
