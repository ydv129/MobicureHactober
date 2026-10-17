"use client"
import { useState } from "react"
import DropZone from "../components/forensics/DropZone"
import VerdictRing from "../components/forensics/VerdictRing"
import ForensicsTerminal from "../components/forensics/ForensicsTerminal"
import UrlScanner from "../components/forensics/UrlScanner"
import ApkScanner from "../components/forensics/ApkScanner"
import { saveScan } from "../lib/forensics/store"
export default function Page() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState("")
  const [activeTab, setActiveTab] = useState<"file" | "url" | "apk">("file")
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
  const handleScanResult = (data: any, fileName = data.details?.url?.slice(0, 30) || data.details?.filename || "scan") => {
    setResult(data)
    if (data.classification !== "ERROR") saveScan({ filename: fileName, score: data.legitimacy_score, classification: data.classification })
  }
  return <main className="shell">
    <header className="masthead"><div><span className="eyebrow">MobiCure/ forensic image lab</span><h1>See what the pixels<br /><em>remember.</em></h1></div><div className="engine-status"><span /> engine light-v2<br /><small>hybrid / under 400 MB</small></div></header>
    <div className="tags">#HF26Mumbai <span>·</span> #Oct26MTP <span>·</span> #mumtechup</div>
    <section className="workspace">
      <div className="intake">
        <div style={{display:"flex", gap:0, marginBottom:18, borderBottom:"1px solid #2a2b30"}}>
          {[
            {id:"file", label:"Image File / 01"},
            {id:"url", label:"Website URL / 02"},
            {id:"apk", label:"APK Scan / 03"},
          ].map(t=>{
            const active=activeTab===t.id
            return <button key={t.id} onClick={()=>{setActiveTab(t.id as any); setResult(null); setPreview("")}} style={{background:"transparent", border:"none", borderBottom: active?"1px solid #58e7e0":"1px solid transparent", color: active?"#58e7e0":"#929297", font:"10px monospace", letterSpacing:".12em", textTransform:"uppercase", padding:"12px 16px", marginBottom:-1, cursor:"pointer"}}>{t.label}</button>
          })}
        </div>
        {activeTab === "file" ? <><DropZone onFile={handleFile} />{preview ? <div className="preview"><img src={preview} alt="Selected evidence" /><span>selected evidence</span></div> : <div className="empty-note">A lightweight pass over metadata, texture, and an optional HF signal.</div>}</> : activeTab === "url" ? <UrlScanner onResult={handleScanResult} /> : <ApkScanner onResult={handleScanResult} />}
      </div>
      <div className="results">{loading ? <div className="loading-panel"><span className="pulse" />Running three forensic passes<span>metadata / pixels / AI signal</span></div> : result ? <><section className="verdict-panel"><span className="eyebrow">Assessment / 02</span><VerdictRing score={result.legitimacy_score} label={result.classification} /></section><ForensicsTerminal data={result} />{result.warnings?.length ? <section className="warnings"><span className="eyebrow">Signals to review</span><ul>{result.warnings.map((warning: string, index: number) => <li key={index}>{warning}</li>)}</ul></section> : null}</> : <div className="results-placeholder"><span>02</span><p>Your verdict, analysis trace, and review signals will land here.</p></div>}</div>
    </section>
  </main>
}
