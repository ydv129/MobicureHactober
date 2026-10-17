"use client"

import { useEffect, useState } from "react"
import { getScans, Scan } from "../../lib/forensics/store"

const ago = (time: number) => {
  const minutes = Math.max(1, Math.floor((Date.now() - time) / 60000))
  return minutes < 60 ? `${minutes}m ago` : `${Math.floor(minutes / 60)}h ago`
}

export default function RecentScans() {
  const [scans, setScans] = useState<Scan[]>([])
  useEffect(() => setScans(getScans().slice(0, 5)), [])
  return <section style={{ background: "rgba(24,24,27,.72)", border: "1px solid #27272a", borderRadius: 16, padding: 24 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}><span className="eyebrow">Recent scans</span><span style={{ color: "#71717a", font: "11px monospace" }}>{scans.length}/5</span></div>
    {scans.length ? <div style={{ maxHeight: 310, overflowY: "auto" }}>{scans.map((scan, index) => { const color = scan.score >= 80 ? "#45f0a0" : scan.score >= 60 ? "#f5d76e" : scan.score >= 40 ? "#ff9f5b" : "#ff657a"; return <div key={`${scan.time}-${index}`} style={{ borderTop: "1px solid #27272a", padding: "14px 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}><div style={{ minWidth: 0 }}><strong style={{ display: "block", color: "#e4e4e7", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{scan.filename}</strong><span style={{ color: "#71717a", font: "10px monospace" }}>{ago(scan.time)}</span></div><span style={{ color, border: `1px solid ${color}55`, borderRadius: 999, padding: "5px 8px", font: "11px monospace" }}>{scan.score}</span></div> })}</div> : <p style={{ color: "#71717a", font: "12px monospace", margin: 0 }}>No scans yet - Go to home</p>}
  </section>
}
