"use client"

import { useState } from "react"

type Props = { onResult: (data: any) => void }

export default function ApkScanner({ onResult }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [name, setName] = useState("")
  const scan = async (file?: File) => {
    if (!file) return
    setName(file.name); setError(""); setLoading(true)
    try {
      const form = new FormData(); form.append("file", file)
      const response = await fetch("/api/scan-apk", { method: "POST", body: form })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "APK scan failed")
      onResult(data)
    } catch (scanError: any) { setError(scanError.message || "APK scan failed")
    } finally { setLoading(false) }
  }
  return <label style={{ display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 430, padding: 24, textAlign: "center", cursor: "pointer", background: "rgba(24,24,27,.72)", border: "1px dashed #3f3f46", borderRadius: 24 }}>
    <input type="file" accept=".apk,application/vnd.android.package-archive" onChange={(event) => scan(event.target.files?.[0])} style={{ display: "none" }} />
    <span className="eyebrow">Android package / static review</span><strong style={{ color: "#f4f4f5", fontSize: 26, fontWeight: 400, margin: "18px 0 10px" }}>{name || "Choose an APK to scan"}</strong><span style={{ color: "#71717a", font: "11px monospace" }}>Name and size heuristics with optional Ollama analysis.</span>
    <span style={{ alignSelf: "center", marginTop: 24, padding: "12px 16px", borderRadius: 14, color: "#09090b", background: "linear-gradient(100deg,#58e7e0,#e88bff)", font: "11px monospace" }}>{loading ? "Analyzing..." : "Select APK"}</span>
    {error && <span style={{ color: "#ff9f9f", font: "11px monospace", marginTop: 14 }}>{error}</span>}
  </label>
}
