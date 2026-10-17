"use client"

import { useState } from "react"
import DropZone from "../components/forensics/DropZone"
import VerdictRing from "../components/forensics/VerdictRing"
import ForensicsTerminal from "../components/forensics/ForensicsTerminal"
import UrlScanner from "../components/forensics/UrlScanner"
import { saveScan } from "../lib/forensics/store"

export default function Page() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState("")
  const [activeTab, setActiveTab] = useState<"file" | "url">("file")

  const handleFile = async (file: File) => {
    setPreview(URL.createObjectURL(file))
    setResult(null)
    setLoading(true)
    const form = new FormData()
    form.append("file", file)
    try {
      const response = await fetch("/api/scan", { method: "POST", body: form })
      const data = await response.json()
      setResult(data)
      if (response.ok && data.classification !== "ERROR") saveScan({ filename: file.name, score: data.legitimacy_score, classification: data.classification })
    } catch {
      setResult({ legitimacy_score: 0, classification: "ERROR", warnings: ["The scan service is unreachable"] })
    } finally {
      setLoading(false)
    }
  }

  const handleUrlResult = (data: any, fileName: string) => {
    setResult(data)
    if (data.classification !== "ERROR") saveScan({ filename: fileName, score: data.legitimacy_score, classification: data.classification })
  }

  return <main className="shell">
    <header className="masthead"><div><span className="eyebrow">MobiCure / forensic image lab</span><h1>See what the pixels<br /><em>remember.</em></h1></div><div className="engine-status"><span /> engine light-v2<br /><small>hybrid / under 400 MB</small></div></header>
    <div className="tags">#HF26Mumbai <span>·</span> #Oct26MTP <span>·</span> #mumtechup</div>
    <section className="workspace">
      <div className="intake"><div style={{ display: "flex", gap: 8, marginBottom: 14 }}><button onClick={() => { setActiveTab("file"); setResult(null) }} style={{ border: 0, borderRadius: 999, padding: "9px 14px", color: activeTab === "file" ? "#09090b" : "#a1a1aa", background: activeTab === "file" ? "#58e7e0" : "#27272a", font: "11px monospace", cursor: "pointer" }}>Image File</button><button onClick={() => { setActiveTab("url"); setResult(null) }} style={{ border: 0, borderRadius: 999, padding: "9px 14px", color: activeTab === "url" ? "#09090b" : "#a1a1aa", background: activeTab === "url" ? "#58e7e0" : "#27272a", font: "11px monospace", cursor: "pointer" }}>Image URL</button></div>{activeTab === "file" ? <><DropZone onFile={handleFile} />{preview ? <div className="preview"><img src={preview} alt="Selected evidence" /><span>selected evidence</span></div> : <div className="empty-note">A lightweight pass over metadata, texture, and an optional HF signal.</div>}</> : <UrlScanner onResult={handleUrlResult} />}</div>
      <div className="results">{loading ? <div className="loading-panel"><span className="pulse" />Running three forensic passes<span>metadata / pixels / AI signal</span></div> : result ? <><section className="verdict-panel"><span className="eyebrow">Assessment / 02</span><VerdictRing score={result.legitimacy_score} label={result.classification} /></section><ForensicsTerminal data={result} />{result.warnings?.length ? <section className="warnings"><span className="eyebrow">Signals to review</span><ul>{result.warnings.map((warning: string, index: number) => <li key={index}>{warning}</li>)}</ul></section> : null}</> : <div className="results-placeholder"><span>02</span><p>Your verdict, analysis trace, and review signals will land here.</p></div>}</div>
    </section>
  </main>
}
