"use client"
export default function VerdictRing({ score, label }: { score: number; label: string }) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0))
  const color = safeScore >= 80 ? "#45f0a0" : safeScore >= 60 ? "#f5d76e" : safeScore >= 40 ? "#ff9f5b" : "#ff657a"
  const circumference = 2 * Math.PI * 56
  const offset = circumference - (circumference * safeScore) / 100
  return <div className="verdict"><div className="verdict__ring"><svg viewBox="0 0 128 128"><circle className="verdict__track" cx="64" cy="64" r="56" /><circle className="verdict__progress" cx="64" cy="64" r="56" stroke={color} strokeDasharray={circumference} strokeDashoffset={offset} /></svg><div className="verdict__value"><strong>{safeScore}</strong><span>/100</span></div></div><p style={{ color }}>{label.replaceAll("_", " ")}</p></div>
}
