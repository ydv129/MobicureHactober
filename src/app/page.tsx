"use client"

import { useState } from "react"
import DropZone from "../components/forensics/DropZone"
import VerdictRing from "../components/forensics/VerdictRing"
import ForensicsTerminal from "../components/forensics/ForensicsTerminal"
import { saveScan } from "../lib/forensics/store"

export default function Page() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState("")

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

  return <main className="shell">
    <header className="masthead"><div><span className="eyebrow">MobiCure / forensic image lab</span><h1>See what the pixels<br /><em>remember.</em></h1></div><div className="engine-status"><span /> engine light-v2<br /><small>hybrid / under 400 MB</small></div></header>
    <div className="tags">#HF26Mumbai <span>·</span> #Oct26MTP <span>·</span> #mumtechup</div>
    <section className="workspace">
      <div className="intake"><DropZone onFile={handleFile} />{preview ? <div className="preview"><img src={preview} alt="Selected evidence" /><span>selected evidence</span></div> : <div className="empty-note">A lightweight pass over metadata, texture, and an optional model signal.</div>}</div>
      <div className="results">{loading ? <div className="loading-panel"><span className="pulse" />Running three forensic passes<span>metadata / pixels / AI signal</span></div> : result ? <><section className="verdict-panel"><span className="eyebrow">Assessment / 02</span><VerdictRing score={result.legitimacy_score} label={result.classification} /></section><ForensicsTerminal data={result} />{result.warnings?.length ? <section className="warnings"><span className="eyebrow">Signals to review</span><ul>{result.warnings.map((warning: string, index: number) => <li key={index}>{warning}</li>)}</ul></section> : null}</> : <div className="results-placeholder"><span>02</span><p>Your verdict, analysis trace, and review signals will land here.</p></div>}</div>
    </section>
  </main>
}
