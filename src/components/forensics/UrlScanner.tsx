"use client"

import { useState } from "react"

type Props = { onResult: (data: any, fileName: string) => void }

export default function UrlScanner({ onResult }: Props) {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const validUrl = (() => { try { const parsed = new URL(url); return ["http:", "https:"].includes(parsed.protocol) } catch { return false } })()

  const scan = async () => {
    if (!validUrl) { setError("Enter a valid http:// or https:// image URL"); return }
    setError(""); setLoading(true)
    try {
      const response = await fetch("/api/scan-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "URL scan failed")
      onResult(data, url.split("/").pop()?.split("?")[0] || "url-image")
    } catch (scanError: any) { setError(scanError.message || "Could not scan this URL")
    } finally { setLoading(false) }
  }

  return <div className="drop-zone" style={{ alignItems: "stretch", minHeight: 430, textAlign: "left" }}>
    <span className="eyebrow">Remote intake / 01</span><strong style={{ textAlign: "center" }}>Scan an image URL</strong>
    <input value={url} onChange={(event) => { setUrl(event.target.value); setError("") }} placeholder="https://example.com/suspicious.jpg" type="url" style={{ position: "static", opacity: 1, cursor: "text", width: "100%", padding: "15px 14px", marginTop: 20, borderRadius: 14, border: "1px solid #3f3f46", background: "#111113", color: "#f4f4f5", font: "12px monospace" }} />
    <button onClick={scan} disabled={loading} style={{ border: 0, borderRadius: 14, padding: 15, marginTop: 12, color: "#09090b", cursor: loading ? "wait" : "pointer", background: "linear-gradient(100deg,#58e7e0,#e88bff)", font: "12px monospace" }}>{loading ? "Scanning..." : "Scan URL"}</button>
    {validUrl && <img src={url} alt="Remote image preview" style={{ maxHeight: 200, width: "100%", objectFit: "contain", marginTop: 20, borderRadius: 14 }} onError={() => setError("This URL did not return a previewable image")} />}
    {error && <p style={{ color: "#ff9f9f", font: "11px monospace", margin: "14px 0 0" }}>{error}</p>}
  </div>
}
