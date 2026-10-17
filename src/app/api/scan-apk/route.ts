import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File
    if (!file) return NextResponse.json({ error: 'No APK' }, { status: 400 })
    let score = 100
    const warnings: string[] = []
    const name = file.name.toLowerCase()
    const sizeMB = file.size / (1024*1024)
    if (sizeMB > 100) { score -= 20; warnings.push(`Large APK: ${sizeMB.toFixed(1)} MB`) }
    const suspicious = ['mod','hack','crack','free','money','unlimited','premium']
    const found = suspicious.filter(s=>name.includes(s))
    if (found.length) { score -= 30; warnings.push(`Suspicious name keywords: ${found.join(', ')}`) }
    let aiScore: number | null = null
    let aiReason = ''
    try {
      const ollama = await fetch('http://localhost:11434/api/generate', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ model: 'gemma3:1b', prompt: `Analyze APK: name ${name} size ${sizeMB.toFixed(1)}MB - suspicious mod/hack? JSON {"risk":"low/medium/high","reason":"short","score":0-100}`, stream: false }) })
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
    if (clamped < 40) cls = 'MALWARE'
    else if (clamped < 60) cls = 'RISKY'
    else if (clamped < 80) cls = 'SUSPICIOUS'
    return NextResponse.json({ legitimacy_score: clamped, classification: cls, warnings, forensics: { metadata_score: score, ai_score: aiScore, pixel_stats: { mean_var: sizeMB } }, details: { filename: file.name, size: file.size, ai_analysis: aiReason } })
  } catch (e: any) {
    return NextResponse.json({ error: e.message, legitimacy_score: 0, classification: 'ERROR', warnings: [e.message] }, { status: 500 })
  }
}
