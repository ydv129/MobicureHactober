import { NextRequest, NextResponse } from "next/server"

const model = "tinyllama"

function analyzeUrlHeuristics(value: string) {
  const warnings: string[] = []
  let score = 100
  let domainScore = 100
  let urlScore = 100
  let parsed: URL
  try { parsed = new URL(value) } catch { return { score: 0, domainScore: 0, urlScore: 0, warnings: ["Invalid URL format"] } }
  const lower = value.toLowerCase()
  const punish = (amount: number, warning: string, domain = false) => { score -= amount; if (domain) domainScore -= amount; else urlScore -= amount; warnings.push(warning) }
  if (parsed.protocol !== "https:") punish(30, "No HTTPS - insecure connection")
  if ([".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".work"].some((tld) => parsed.hostname.endsWith(tld) || parsed.pathname.toLowerCase().includes(tld))) punish(25, "Suspicious top-level domain", true)
  if (/^\d+\.\d+\.\d+\.\d+$/.test(parsed.hostname)) punish(40, "IP address used instead of a domain", true)
  if (parsed.hostname.split(".").length > 4) punish(15, "Too many subdomains", true)
  if (["bit.ly", "tinyurl", "goo.gl", "t.co", "is.gd", "cutt.ly"].some((host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`))) punish(20, "URL shortener hides the destination")
  const keywords = ["login", "verify", "secure", "account", "update", "confirm", "banking", "free-money", "lottery"].filter((word) => lower.includes(word))
  if (keywords.length >= 2) punish(15, `Suspicious keywords: ${keywords.join(", ")}`)
  if (value.length > 100) punish(10, "Unusually long URL")
  if (value.includes("@")) punish(30, "@ symbol may redirect to another host")
  return { score: Math.max(0, score), domainScore: Math.max(0, domainScore), urlScore: Math.max(0, urlScore), warnings }
}

async function askOllama(url: string) {
  try {
    const response = await fetch("http://127.0.0.1:11434/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model, prompt: `Analyze the legitimacy of this website URL: ${url}. Return only JSON with risk low, medium, or high, reason, and score from 0 to 100 where 100 means legitimate.`, stream: false, options: { temperature: 0.2, num_predict: 150 } }), signal: AbortSignal.timeout(15000) })
    const text = (await response.json()).response || ""
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return { score: 50, text: text.slice(0, 300), model }
    const data = JSON.parse(match[0])
    return { score: Math.max(0, Math.min(100, Number(data.score) || 50)), text: `${data.risk || "unknown"}: ${data.reason || "No reason returned"}`.slice(0, 300), model }
  } catch { return { score: 50, text: "Ollama offline - heuristics used", model: "offline" } }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    if (!url || typeof url !== "string") return NextResponse.json({ error: "No URL", legitimacy_score: 0, classification: "ERROR" }, { status: 400 })
    const heuristics = analyzeUrlHeuristics(url)
    const ai = await askOllama(url)
    const score = Math.round(heuristics.score * 0.6 + ai.score * 0.4)
    const classification = score >= 80 ? "LEGIT" : score >= 60 ? "SUSPICIOUS" : score >= 40 ? "RISKY" : "PHISHING"
    return NextResponse.json({ legitimacy_score: score, classification, warnings: heuristics.warnings, forensics: { url_score: heuristics.urlScore, domain_score: heuristics.domainScore, ai_score: ai.score }, details: { url, heuristics, ai_analysis: ai.text, ollama_model: ai.model } })
  } catch (error: any) { return NextResponse.json({ error: error.message || "URL scan failed", legitimacy_score: 0, classification: "ERROR", warnings: ["Website scan failed"], forensics: { url_score: 0, domain_score: 0, ai_score: 0 } }, { status: 500 }) }
}
