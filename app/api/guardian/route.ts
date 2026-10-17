import { NextRequest, NextResponse } from 'next/server'
import { queryGemma } from '@/lib/ollama'

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()
    if (!message) return NextResponse.json({ error: 'No message' }, { status: 400 })
    const response = await queryGemma(`You are MobiCure Guardian - cybersecurity assistant for mobile threats. Be concise, Hinglish. Query: ${message}`)
    return NextResponse.json({ response, model: 'gemma2:2b-local', offline: response.includes('offline') })
  } catch (e: any) {
    return NextResponse.json({ 
      response: 'Guardian Online (Fallback Mode): MobiCure offers 6 scanners - APK, URL, Email, Image Metadata, Network, Threat Explainer. Ollama is starting. Ask me about APK security, phishing URLs, image privacy leaks.',
      model: 'fallback'
    })
  }
}
