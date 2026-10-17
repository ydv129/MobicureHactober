import { NextRequest, NextResponse } from 'next/server'
import { config } from '../../../lib/config'

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const fd = new FormData()
    fd.append('file', file)

    const res = await fetch(`${config.imageScannerUrl}/scan`, { method: 'POST', body: fd, signal: AbortSignal.timeout(30000) })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message, legitimacy_score: 0, classification: 'ERROR', warnings: ['Engine offline - run src/lib/forensics/engine/main.py'] }, { status: 500 })
  }
}
