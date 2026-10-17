import { NextRequest, NextResponse } from "next/server"
import { config } from "../../../lib/config"

export async function POST(request: NextRequest) {
  try {
    const { message, context, scanner_context } = await request.json()
    if (!message?.trim()) return NextResponse.json({ error: "Enter a question" }, { status: 400 })
    const scannerContext = scanner_context || context || {}
    const safeContext = JSON.stringify(scannerContext).slice(0, 12000)
    const prompt = `You are MobiCure Forensics Assistant. Answer clearly in under 100 words. Use only facts explicitly present in the scanner evidence. Never mention an image, APK, URL, warning, score, or risk that is not present. If the evidence does not answer the question, say that the available evidence is insufficient. Scanner evidence: ${safeContext}. User question: ${message.trim()}`
    const response = await fetch(`${config.ollamaUrl}/api/generate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: config.ollamaModel, prompt, stream: false, options: { temperature: 0.2, num_predict: 120 } }), signal: AbortSignal.timeout(15000) })
    if (!response.ok) throw new Error("Ollama is unavailable")
    const answer = (await response.json()).response?.trim()
    return NextResponse.json({ answer: answer || "No assistant response was returned.", model: config.ollamaModel })
  } catch (error: any) {
    return NextResponse.json({ answer: "The local assistant is offline. Start Ollama with `ollama serve` and try again.", error: error.message || "Assistant unavailable", model: "offline" }, { status: 200 })
  }
}
