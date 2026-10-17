import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
    const fd = new FormData(); fd.append('file', file)
    const res = await fetch('http://localhost:8004/scan', { method: 'POST', body: fd })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message, legitimacy_score: 0, classification: 'ERROR', warnings: ['Engine offline'] }, { status: 500 })
  }
}
