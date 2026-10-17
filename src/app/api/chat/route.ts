import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json()
    if (!message?.trim()) return NextResponse.json({ error: "Enter a question" }, { status: 400 })
    const prompt = `You are MobiCure Forensics Assistant. Answer clearly in under 100 words. Use only facts explicitly present in the scan context. Never mention an image, APK, URL, warning, score, or risk that is not present. If the context does not answer the question, say that the available evidence is insufficient. Current scan context: ${JSON.stringify(context || {})}. User question: ${message.trim()}`
    const response = await fetch("http://127.0.0.1:11434/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "tinyllama", prompt, stream: false, options: { temperature: 0.2, num_predict: 120 } }), signal: AbortSignal.timeout(15000) })
    if (!response.ok) throw new Error("Ollama is unavailable")
    const answer = (await response.json()).response?.trim()
    return NextResponse.json({ answer: answer || "No assistant response was returned.", model: "tinyllama" })
  } catch (error: any) {
    return NextResponse.json({ answer: "The local assistant is offline. Start Ollama with `ollama serve` and try again.", error: error.message || "Assistant unavailable", model: "offline" }, { status: 200 })
  }
}
