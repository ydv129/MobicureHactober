"use client"
type Props = { label: string; value: number; color: "cyan" | "green" | "red" | "yellow" }
const colors = { cyan: "#58e7e0", green: "#45f0a0", red: "#ff657a", yellow: "#f5d76e" }
export default function StatsCard({ label, value, color }: Props) {
  const accent = colors[color]
  return <article style={{ background: "rgba(24,24,27,.72)", border: "1px solid #27272a", borderRadius: 16, padding: 20 }}>
    <span style={{ display: "block", width: 8, height: 8, borderRadius: "50%", background: accent, boxShadow: `0 0 12px ${accent}`, marginBottom:18 }} />
    <strong style={{ display: "block", color: "#fff", fontSize: 32, fontWeight: 400 }}>{value}</strong>
    <span style={{ color: "#a1a1aa", font: "10px monospace", letterSpacing: ".12em", textTransform: "uppercase" }}>{label}</span>
  </article>
}
