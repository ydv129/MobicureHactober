"use client"

export default function ForensicsTerminal({ data }: { data: any }) {
  if (!data) return null
  const stats = data.forensics?.pixel_stats || {}
  const lines = [
    ["metadata", `${data.forensics?.metadata_score ?? 0}/100`],
    ["pixel-pass", `mean ${Number(stats.mean_var || 0).toFixed(1)} / std ${Number(stats.std_var || 0).toFixed(1)}`],
    ["ai-signal", data.forensics?.ai_score ? `${data.forensics.ai_score.toFixed(1)}/100` : "fallback heuristics"],
  ]

  return <section className="terminal" aria-label="Forensics analysis log">
    <header><span className="terminal__dot terminal__dot--red" /><span className="terminal__dot terminal__dot--yellow" /><span className="terminal__dot terminal__dot--green" /><span>forensics.log</span></header>
    <div className="terminal__body">{lines.map(([name, value]) => <p key={name}><i>scan://{name}</i><span>{value}</span></p>)}<p className="terminal__final"><i>verdict://final</i><span>{data.classification} · {data.legitimacy_score}/100</span></p></div>
  </section>
}
