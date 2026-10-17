import { NextRequest, NextResponse } from "next/server"
import { config } from "../../../lib/config"

const maxBytes = 100 * 1024 * 1024
const suspiciousNames = ["mod", "hack", "crack", "free", "money"]

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData()
    const file = form.get("file") as File | null
    if (!file) return NextResponse.json({ error: "No APK file", legitimacy_score: 0, classification: "SCAN_FAILED" }, { status: 400 })
    if (!file.name.toLowerCase().endsWith(".apk")) return NextResponse.json({ error: "Only .apk files are supported", legitimacy_score: 0, classification: "SCAN_FAILED" }, { status: 400 })
    if (!file.size || file.size > maxBytes) return NextResponse.json({ error: file.size ? "APK exceeds 100 MB" : "APK is empty", legitimacy_score: 0, classification: "SCAN_FAILED" }, { status: 400 })
    const bytes = new Uint8Array(await file.arrayBuffer())
    const isZip = bytes[0] === 0x50 && bytes[1] === 0x4b && (bytes[2] === 0x03 || bytes[2] === 0x05 || bytes[2] === 0x07)
    if (!isZip) return NextResponse.json({ error: "File is not a valid APK/ZIP archive", legitimacy_score: 0, classification: "SCAN_FAILED" }, { status: 400 })
    const warnings = suspiciousNames.some((word) => file.name.toLowerCase().includes(word)) ? ["Suspicious APK filename"] : []
    const score = Math.max(0, 100 - (warnings.length ? 30 : 0))
    let aiAnalysis = "Local AI unavailable; limited archive validation only"
    let ollamaModel = "offline"
    try {
      const response = await fetch(`${config.ollamaUrl}/api/generate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: config.ollamaModel, prompt: `Explain this limited APK evidence without inventing facts: filename ${file.name}, size ${file.size} bytes, ZIP signature valid ${isZip}. Return a short risk note.`, stream: false, options: { temperature: 0.2, num_predict: 100 } }), signal: AbortSignal.timeout(15000) })
      if (response.ok) { aiAnalysis = ((await response.json()).response || aiAnalysis).slice(0, 300); ollamaModel = config.ollamaModel }
    } catch {}
    return NextResponse.json({ legitimacy_score: score, classification: "INCOMPLETE", warnings, forensics: { apk_score: score }, details: { filename: file.name, size: file.size, permissions: [], ai_analysis: aiAnalysis, ollama_model: ollamaModel }, analysis_mode: "limited", limitations: ["Androguard analysis is unavailable", "Manifest, DEX, certificate, and permission analysis was not completed"] })
  } catch (error: any) { return NextResponse.json({ error: error.message || "APK scan failed", legitimacy_score: 0, classification: "SCAN_FAILED", warnings: ["APK scan failed"] }, { status: 500 }) }
}
