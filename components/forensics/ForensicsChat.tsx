"use client"

import { useState } from "react"

type Props = { result: any }

export default function ForensicsChat({ result }: Props) {
  const [message, setMessage] = useState("")
  const [answer, setAnswer] = useState("")
  const [loading, setLoading] = useState(false)
  const ask = async () => {
    if (!message.trim() || loading) return
    setLoading(true); setAnswer("")
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message, context: result }) })
      setAnswer((await response.json()).answer || "No answer returned")
    } catch { setAnswer("The local assistant could not be reached.")
    } finally { setLoading(false) }
  }
  return <section className="terminal" aria-label="Forensics assistant">
    <header><span className="terminal__dot terminal__dot--green" /><span>forensics-assistant / local Ollama</span></header>
    <div className="terminal__body"><p style={{ color: "#a1a1aa" }}>Ask about this result or image authenticity.</p>{answer && <p className="terminal__final"><i>assistant://reply</i><span>{answer}</span></p>}<div style={{ display: "flex", gap: 8 }}><input value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => event.key === "Enter" && ask()} placeholder="Why is this suspicious?" style={{ flex: 1, minWidth: 0, border: "1px solid #27272a", borderRadius: 8, background: "#111113", color: "#f4f4f5", padding: "9px 10px", font: "11px monospace" }} /><button onClick={ask} disabled={loading || !message.trim()} style={{ border: 0, borderRadius: 8, padding: "0 12px", color: "#09090b", background: "#58e7e0", font: "11px monospace" }}>{loading ? "..." : "Ask"}</button></div></div>
  </section>
}
