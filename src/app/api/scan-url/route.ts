import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url) return NextResponse.json({ error: 'No URL' }, { status: 400 })
    let score = 100
    const warnings: string[] = []
    const u = url.trim()
    try {
      const parsed = new URL(u)
      if (parsed.protocol !== 'https:') { score -= 30; warnings.push('No HTTPS - insecure') }
      const host = parsed.hostname
      const suspiciousTLDs = ['.tk','.ml','.ga','.cf','.gq','.xyz','.top','.work']
      if (suspiciousTLDs.some(t=>host.endsWith(t))) { score -= 25; warnings.push(`Suspicious TLD: ${host}`) }
      if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) { score -= 40; warnings.push('IP address instead of domain') }
      const parts = host.split('.')
      if (parts.length > 4) { score -= 15; warnings.push('Too many subdomains') }
      if (u.length > 100) { score -= 10; warnings.push('Very long URL') }
      if (u.includes('@')) { score -= 30; warnings.push('Contains @ symbol - phishing pattern') }
    } catch { score -= 20; warnings.push('Invalid URL format') }
    const shorteners = ['bit.ly','tinyurl','t.co','goo.gl','ow.ly']
    if (shorteners.some(s=>u.includes(s))) { score -= 20; warnings.push('URL shortener - hidden destination') }
    const keywords = ['login','verify','secure','account','banking','free-money','lottery','prize','confirm']
    const found = keywords.filter(k=>u.toLowerCase().includes(k))
    if (found.length >= 2) { score -= 15; warnings.push(`Suspicious keywords: ${found.join(', ')}`) }
    let aiScore: number | null = null
    let aiReason = ''
    try {
      const ollama = await fetch('http://localhost:11434/api/generate', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ model: 'gemma3:1b', prompt: `Analyze URL: ${u} - Is it phishing? Respond JSON: {"risk":"low/medium/high","reason":"short","score":0-100}`, stream: false }) })
      if (ollama.ok) {
        const data = await ollama.json()
        const txt = data.response || ''
        aiReason = txt.slice(0,200)
        const m = txt.match(/\d+/)
        if (m) { const v = parseInt(m[0]); if (v>=0 && v<=100) aiScore = v }
      }
    } catch {}
    const final = aiScore !== null ? Math.round(score*0.6 + aiScore*0.4) : score
    const clamped = Math.max(0, Math.min(100, final))
    let cls = 'LEGIT'
    if (clamped < 40) cls = 'PHISHING'
    else if (clamped < 60) cls = 'RISKY'
    else if (clamped < 80) cls = 'SUSPICIOUS'
    return NextResponse.json({ legitimacy_score: clamped, classification: cls, warnings, forensics: { metadata_score: score, ai_score: aiScore, pixel_stats: {} }, details: { url: u, ai_analysis: aiReason } })
  } catch (e: any) {
    return NextResponse.json({ error: e.message, legitimacy_score: 0, classification: 'ERROR', warnings: [e.message] }, { status: 500 })
  }
}
