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
      if (!response.ok) throw new Error(data.error)
      onResult(data)
    } catch (scanError: any) { setError(scanError.message) } finally { setLoading(false) }
  }
  return <label className="drop-zone" style={{ minHeight: 430 }}>
    <input type="file" accept=".apk,application/vnd.android.package-archive" onChange={(event) => scan(event.target.files?.[0])} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
    <span className="drop-zone__orb">◍</span>
    <span className="eyebrow">Android package / 03</span>
    <strong>{name || "Drop an APK to begin"}</strong>
    <span className="drop-zone__hint">Permissions, size heuristics, and optional Gemma 1B analysis.</span>
    <span className="drop-zone__action">{loading ? "Analyzing..." : "Choose APK ↗"}</span>
    {error && <span style={{ color: "#ff9f9f", font: "11px monospace", marginTop: 12 }}>{error}</span>}
  </label>
}
