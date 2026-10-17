export async function queryGemma(prompt: string): Promise<string> {
  try {
    const res = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gemma2:2b', prompt, stream: false, options: { num_predict: 200 } }),
      signal: AbortSignal.timeout(5000)
    })
    if (!res.ok) throw new Error('Ollama offline')
    const data = await res.json()
    return data.response || "Gemma offline - fallback response"
  } catch (e) {
    console.log('Ollama offline, using fallback')
    // Fallback responses for MobiCure
    const lower = prompt.toLowerCase()
    if (lower.includes('what is ai')) return 'AI = Artificial Intelligence. MobiCure uses local Gemma 2B to analyze APK/URL threats privately without cloud.'
    if (lower.includes('apk')) return 'APK is Android Package. MobiCure scans permissions, modded signatures, malware patterns locally.'
    if (lower.includes('url') || lower.includes('phishing')) return 'Phishing URL detection via local heuristics + VirusTotal optional. Check HTTPS, typosquat.'
    return `MobiCure Guardian: I analyze mobile threats. Ask about APK, URL, Image metadata, Phishing. Your query: ${prompt.slice(0,100)} - Ollama is starting, try again in 5 sec.`
  }
}
export async function isOllamaOnline(): Promise<boolean> {
  try {
    const r = await fetch('http://localhost:11434/api/tags', { signal: AbortSignal.timeout(2000) })
    return r.ok
  } catch { return false }
}
