"use client"
import { useState } from "react"
type Props = { onResult: (data: any) => void }
export default function UrlScanner({ onResult }: Props) {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const valid = /^https?:\/\/[^\s]+$/i.test(url.trim())
  const scan = async () => {
    if (!valid) { setError("Enter a valid URL http:// or https://"); return }
    setError(""); setLoading(true)
    try {
      const r = await fetch("/api/scan-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: url.trim() }) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || "Scan failed")
      onResult(d)
    } catch (e: any) { setError(e.message) } finally { setLoading(false) }
  }
  return <div className="drop-zone" style={{ cursor: "default" }}>
    <span className="drop-zone__orb">◉</span>
    <span className="eyebrow">Website URL / 02</span>
    <strong style={{ fontSize: "28px", fontWeight: 400, margin: "14px 0 8px" }}>Paste a URL to inspect</strong>
    <span className="drop-zone__hint">HTTPS, domain reputation, and Ollama gemma3:1b analysis.</span>
    <div style={{ width: "100%", maxWidth: 340, marginTop: 18, display: "flex", gap: 8 }}>
      <input value={url} onChange={e => { setUrl(e.target.value); setError("") }} placeholder="https://example.com/login" style={{ flex: 1, background: "#0a0a0a", border: "1px solid #3f3f46", borderRadius: 12, padding: "12px 14px", color: "#fff", font: "11px monospace", outline: "none" }} />
      <button onClick={scan} disabled={loading} style={{ background: valid ? "#58e7e0" : "#27272a", color: valid ? "#0a0a0b" : "#71717a", border: "none", borderRadius: 12, padding: "12px 16px", font: "11px monospace", cursor: valid ? "pointer" : "not-allowed" }}>{loading ? "..." : "Scan"}</button>
    </div>
    <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap", justifyContent: "center" }}>
      <span style={{ background: "rgba(88,231,224,.12)", border: "1px solid #58e7e055", borderRadius: 999, padding: "4px 8px", font: "9px monospace", color: "#58e7e0" }}>HTTPS</span>
      <span style={{ background: "rgba(88,231,224,.12)", border: "1px solid #58e7e055", borderRadius: 999, padding: "4px 8px", font: "9px monospace", color: "#58e7e0" }}>Domain</span>
      <span style={{ background: "rgba(232,139,255,.12)", border: "1px solid #e88bff55", borderRadius: 999, padding: "4px 8px", font: "9px monospace", color: "#e88bff" }}>Gemma 1B</span>
    </div>
    {error && <span style={{ color: "#ff9f9f", font: "11px monospace", marginTop: 12 }}>{error}</span>}
  </div>
}
