import { config } from "./config"

export async function explainWithOllama(prompt: string) {
  const response = await fetch(`${config.ollamaUrl}/api/generate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: config.ollamaModel, prompt, stream: false }), signal: AbortSignal.timeout(15000) })
  if (!response.ok) throw new Error("Local AI unavailable")
  return (await response.json()).response || "No explanation returned"
}
