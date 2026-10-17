"use client"

import { useState } from "react"

type Props = { onResult: (data: any) => void }

export default function UrlScanner({ onResult }: Props) {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const valid = /^https?:\/\/[^\s]+$/i.test(url.trim())

  const scan = async () => {
    if (!valid) { setError("Enter a valid website URL starting with http:// or https://"); return }
    setError(""); setLoading(true)
    try {
      const response = await fetch("/api/scan-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: url.trim() }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Website scan failed")
      onResult(data)
    } catch (scanError: any) { setError(scanError.message || "Website scan failed")
    } finally { setLoading(false) }
  }

  const chip = (label: string, active: boolean) => <span style={{ background: active ? "#123b3b" : "#18181b", border: `1px solid ${active ? "#2f8f8a" : "#27272a"}`, borderRadius: 999, padding: "5px 9px", font: "9px monospace", color: active ? "#8ff7ef" : "#71717a" }}>{label}</span>
  return <div style={{ background: "rgba(24,24,27,.72)", border: "1px solid #3f3f46", borderRadius: 24, padding: 24 }}>
    <span className="eyebrow">Website URL / remote analysis</span>
    <input type="url" value={url} onChange={(event) => { setUrl(event.target.value); setError("") }} placeholder="https://example.com/login" style={{ width: "100%", marginTop: 18, padding: 14, borderRadius: 14, border: "1px solid #3f3f46", background: "#0a0a0a", color: "#fff", font: "12px monospace" }} />
    <button onClick={scan} disabled={loading} style={{ width: "100%", marginTop: 12, padding: 14, border: 0, borderRadius: 14, color: "#09090b", cursor: loading ? "wait" : "pointer", background: "linear-gradient(100deg,#58e7e0,#e88bff)", font: "12px monospace" }}>{loading ? "Analyzing website..." : "Scan URL"}</button>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 16 }}>{chip("HTTPS check", /^https:\/\//i.test(url))}{chip("Domain heuristics", valid)}{chip("Ollama AI", true)}</div>
    {error && <p style={{ color: "#ff9f9f", font: "11px monospace", marginBottom: 0 }}>{error}</p>}
  </div>
}
