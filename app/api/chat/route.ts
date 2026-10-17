import { NextRequest, NextResponse } from 'next/server'
import { isOllamaRunning, queryGemma, GEMMA_SYSTEM_PROMPT } from '@/lib/gemma'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()
    
    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    // Check Gemma local - NOT NVIDIA
    const ollamaRunning = await isOllamaRunning()
    
    if (!ollamaRunning) {
      return NextResponse.json({
        response: `🔐 MobiCure Guardian: Gemma 2B starting... Please run: ollama serve & ollama pull gemma2:2b\n\nYour query: "${message}"\n\nMOBICURE offers 6 AI scanners: APK Analyzer (mod APK detect), URL Threat Hunter, Email Phishing Detector, Image Metadata Scanner, Network Scanner, Gemma Threat Explainer (Hinglish). All run locally via Ollama - No cloud!`,
        offline: true,
        gemma: false
      })
    }

    // Gemma online - Use local AI
    const prompt = `${GEMMA_SYSTEM_PROMPT}\n\nUser query: ${message}\n${history ? `History: ${JSON.stringify(history).slice(0,500)}` : ''}\n\nRespond as Mumbai cyber expert, Hinglish mix, actionable, privacy-first. If threat, give HIGH/MED/LOW risk.`

    const gemmaResponse = await queryGemma(prompt)
    
    if (!gemmaResponse) {
      return NextResponse.json({
        response: `🔐 MobiCure Guardian Online: Gemma 2B Local (1.6GB) - Privacy-First\n\nMOBICURE offers 6 forensic scanners: APK Analyzer, URL Scanner, Email Phishing Detector, Image Metadata Stripper, Network Scanner, Gemma Threat Explainer.\n\nYour query: "${message}"\n\nGemma is processing... Try again in 2 sec. (Ollama running at localhost:11434)`,
        gemma: true,
        local: true
      })
    }

    return NextResponse.json({
      response: gemmaResponse,
      gemma: true,
      local: true,
      model: 'gemma2:2b',
      privacy: 'local-only'
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({
      response: `🔐 MobiCure Guardian: Gemma 2B Local Mode\n\nQuery: "${(await req.json().catch(()=>({message:'error'}))).message}"\n\nError: ${error instanceof Error ? error.message : 'Unknown'}\n\nTry: ollama serve & ollama pull gemma2:2b`,
      error: true
    }, { status: 200 })
  }
}

export async function GET() {
  const ollamaRunning = await isOllamaRunning()
  return NextResponse.json({
    status: ollamaRunning ? 'online' : 'starting',
    guardian: 'MobiCure Guardian Online: Gemma 2B Local (1.6GB)',
    mode: 'privacy-first, local-only',
    model: 'gemma2:2b',
    size: '1.6GB',
    url: 'http://localhost:11434',
    track: 'Best Use of Google Gemma',
    scanners: ['scan_apk', 'scan_url', 'scan_email', 'scan_image_metadata', 'scan_network', 'gemma_threat_explain'],
    ollama: ollamaRunning
  })
}
