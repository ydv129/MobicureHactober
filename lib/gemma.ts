export const GEMMA_SYSTEM_PROMPT =
  "You are MobiCure Elite Security Analyst powered by Gemma 2B. Mumbai cyber expert. Hinglish mix, actionable, privacy-first, local."

type OllamaResponse = {
  response?: string
}

const OLLAMA_URL = "http://localhost:11434"
const DEFAULT_MODEL = "gemma2:2b"

// Hacktoberfest Best Use of Gemma - Local, no cloud.
export async function isOllamaRunning(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`)
    return response.ok
  } catch {
    return false
  }
}

export async function queryGemma(prompt: string, model = DEFAULT_MODEL): Promise<string | null> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt, stream: false }),
    })
    if (!response.ok) return null

    const data = await response.json() as OllamaResponse
    return data.response?.trim() || null
  } catch {
    return null
  }
}

export function explainThreat(threat_data: string, language = "hinglish"): Promise<string | null> {
  return queryGemma(
    `${GEMMA_SYSTEM_PROMPT}\nExplain this threat in ${language}. Keep the explanation simple, actionable, and concise:\n${threat_data}`,
  )
}

export function analyzeUrlWithGemma(url: string): Promise<string | null> {
  return queryGemma(
    `${GEMMA_SYSTEM_PROMPT}\nAnalyze URL ${url} risk low/medium/high/critical + 1 line Hinglish reason JSON`,
  )
}

export function analyzeApkWithGemma(fileName: string): Promise<string | null> {
  return queryGemma(
    `${GEMMA_SYSTEM_PROMPT}\nAnalyze APK ${fileName} for mod detection and return the risk level with a 1 line Hinglish reason as JSON`,
  )
}
