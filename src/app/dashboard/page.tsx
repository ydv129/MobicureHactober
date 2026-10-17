"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import StatsCard from "../../components/forensics/StatsCard"
import RecentScans from "../../components/forensics/RecentScans"
import { getStats } from "../../lib/forensics/store"
export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, real: 0, fake: 0, avg: 0 })
  useEffect(() => setStats(getStats()), [])
  const refresh = () => setStats(getStats())
  return <main className="shell">
    <header style={{ borderBottom: "1px solid #27272a", paddingBottom: 24, display: "flex", justifyContent: "space-between", gap: 20, alignItems:"flex-start" }}>
      <div><span className="eyebrow">MobiCure / operations</span><h1 style={{ fontSize: "clamp(36px,6vw,64px)", margin: "18px 0 10px" }}>Dashboard <em>v2</em></h1><p style={{ color: "#71717a", font: "11px monospace", margin: 0 }}>#HF26Mumbai · #Oct26MTP · #mumtechup</p></div>
      <span style={{ color: "#45f0a0", font: "11px monospace", whiteSpace: "nowrap" }}><i style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#45f0a0", marginRight: 7 }} />LIVE</span>
    </header>
    <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr))", gap: 14, margin: "28px 0" }}><StatsCard label="Total scans" value={stats.total} color="cyan" /><StatsCard label="Real signals" value={stats.real} color="green" /><StatsCard label="Fake signals"value={stats.fake} color="red" /><StatsCard label="Average score" value={stats.avg} color="yellow" /></section>
    <section style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) minmax(240px,1fr)", gap: 18 }}>
      <RecentScans />
      <aside style={{ background: "rgba(24,24,27,.72)", border: "1px solid #27272a", borderRadius: 16, padding: 24 }}><span className="eyebrow">Quick actions</span><div style={{ display: "grid", gap: 10, marginTop: 20 }}><Link href="/" style={{ color: "#0a0a0b", background: "#58e7e0", borderRadius: 12, padding: "13px 15px", font: "12px monospace", textDecoration: "none" }}>+ Start new scan</Link><button onClick={() => { localStorage.removeItem("mobicure_scans"); refresh() }} style={{ color: "#d4d4d8", background: "transparent", border: "1px solid #3f3f46", borderRadius: 12, padding: "12px 15px", font: "12px monospace", cursor: "pointer" }}>Clear local history</button></div><p style={{ color: "#71717a", font: "11px monospace", lineHeight: 1.6, marginTop: 24 }}>Scan history stays in this browser and never leaves the dashboard.</p></aside>
    </section>
  </main>
}
