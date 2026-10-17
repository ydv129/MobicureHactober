import { type NextRequest, NextResponse } from "next/server"
import { callPythonHandler } from "@/lib/services/python-handler"
import { queryGemma, isOllamaRunning } from "@/lib/gemma"
import { checkURLThreat } from "@/lib/threatIntel"

interface UrlScanResult {
  url?: string
  timestamp?: string
  threat_score?: number
  risk_level?: string
  libraries_used?: string[]
  threats?: string[]
  summary?: {
    domain?: string
    ip_address?: string
    country?: string
    asn?: string
    uses_https?: boolean
    protected_by_cloudflare?: boolean
  }
  phishing_analysis?: {
    is_phishing?: boolean
    confidence?: number
    risk_indicators?: string[]
  }
  urlscan_analysis?: {
    scan_id?: string
    malicious?: boolean
  }
  is_malicious?: boolean
  cloudflare_analysis?: {
    protected_by_cloudflare?: boolean
    ssl_enabled?: boolean
    waf_enabled?: boolean
  }
  generic_scan?: {
    suspicious_patterns_found?: number
    has_javascript?: boolean
    has_iframes?: boolean
    external_links?: number
  }
  basic_checks?: {
    url_length?: number
    domain_length?: number
    subdomain_count?: number
  }
  error?: string
}

async function getGemmaExplanation(url: string): Promise<string | null> {
  if (!await isOllamaRunning()) return null
  return queryGemma(
    `You are MobiCure URL Threat Hunter. Analyze URL: ${url}. Give risk level and 1 line reason Hinglish. JSON output`,
  )
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    try {
      // Call Python handler through bridge
      const scanResults = await callPythonHandler<{ url: string }, UrlScanResult>(
        'scripts/url_threat_scanner_service.py',
        { url }
      )
      
      if (!scanResults) {
        const parsedUrl = new URL(url)
        const domain = parsedUrl.hostname
        const subdomainCount = Math.max(0, domain.split(".").length - 2)
        const threats: string[] = []
        let riskScore = 0

        if (parsedUrl.protocol !== "https:") {
          riskScore += 20
          threats.push("URL does not use HTTPS")
        }
        if (subdomainCount > 3) {
          riskScore += 15
          threats.push("URL has more than three subdomains")
        }
        if (domain.length > 30) {
          riskScore += 10
          threats.push("Domain is longer than 30 characters")
        }
        if (/\d/.test(domain)) {
          riskScore += 15
          threats.push("Domain contains numeric characters")
        }
        if (url.includes("@") || url.includes("--")) {
          riskScore += 25
          threats.push("URL contains an obfuscation pattern")
        }

        const riskLevel = riskScore > 50 ? "high" : riskScore > 20 ? "medium" : "low"
        const liveIntel = process.env.VIRUSTOTAL_API_KEY ? await checkURLThreat(url) : null
        const gemmaExplanation = await getGemmaExplanation(url)
        const liveMalicious = (liveIntel?.virustotal?.malicious ?? 0) > 0
        const vtLink = liveIntel?.virustotal?.vt_link
        const finalRiskLevel = liveMalicious ? "critical" : riskLevel
        return NextResponse.json({
          url,
          risk_score: riskScore,
          status: finalRiskLevel,
          risk_level: finalRiskLevel,
          domain,
          uses_https: parsedUrl.protocol === "https:",
          threats,
          phishing_detected: riskScore > 50 || liveMalicious,
          is_malicious: liveMalicious,
          vt_link: vtLink ?? null,
          gemma_explanation: gemmaExplanation,
          live_threat_intel: {
            virustotal: liveIntel?.virustotal ?? null,
            abusech: liveIntel?.abusech ?? null,
          },
          analysis_source: "fallback-real-url-check",
        })
      }

      // Transform Python output to match frontend expectations
      const summary = scanResults.summary || {}
      const phishing = scanResults.phishing_analysis || {}
      const urlscan = scanResults.urlscan_analysis || {}
      const cloudflare = scanResults.cloudflare_analysis || {}
      const generic = scanResults.generic_scan || {}
      const basic = scanResults.basic_checks || {}
      const liveIntel = process.env.VIRUSTOTAL_API_KEY ? await checkURLThreat(url) : null
      const gemmaExplanation = await getGemmaExplanation(url)
      const liveMalicious = (liveIntel?.virustotal?.malicious ?? 0) > 0
      const vtLink = liveIntel?.virustotal?.vt_link
      const existingRiskLevel = scanResults.risk_level || "unknown"
      const finalRiskLevel = liveMalicious ? "critical" : existingRiskLevel
      
      const transformedResults = {
        // Core fields
        url: scanResults.url,
        timestamp: scanResults.timestamp,
        risk_score: scanResults.threat_score || 0,
        status: finalRiskLevel,
        risk_level: finalRiskLevel,
        is_malicious: scanResults.is_malicious || liveMalicious,
        vt_link: vtLink ?? null,
        gemma_explanation: gemmaExplanation,
        live_threat_intel: {
          virustotal: liveIntel?.virustotal ?? null,
          abusech: liveIntel?.abusech ?? null,
        },
        
        // Libraries used
        libraries_used: scanResults.libraries_used || [],
        
        // Summary fields for display
        domain: summary.domain || "Unknown",
        ip_address: summary.ip_address || "Unknown",
        geolocation: summary.country || "Unknown",
        asn: summary.asn || "Unknown",
        uses_https: summary.uses_https || false,
        protected_by_cloudflare: summary.protected_by_cloudflare || false,
        
        // Phishing Analysis
        phishing_detected: phishing.is_phishing || false,
        phishing_confidence: phishing.confidence || 0,
        phishing_indicators: phishing.risk_indicators || [],
        
        // URLScan Analysis
        urlscan_scanned: urlscan.scan_id ? true : false,
        urlscan_malicious: urlscan.malicious || false,
        
        // Cloudflare Analysis
        cloudflare_protected: cloudflare.protected_by_cloudflare || false,
        cloudflare_ssl: cloudflare.ssl_enabled || false,
        cloudflare_waf: cloudflare.waf_enabled || false,
        
        // Generic Scan Results
        suspicious_patterns_found: generic.suspicious_patterns_found || 0,
        has_javascript: generic.has_javascript || false,
        has_iframes: generic.has_iframes || false,
        external_links: generic.external_links || 0,
        
        // Basic Checks
        url_length: basic.url_length || 0,
        domain_length: basic.domain_length || 0,
        subdomain_count: basic.subdomain_count || 0,
        
        // Threats
        threats: scanResults.threats || [],
        
        // DNS Records
        dns_records: {
          a: summary.ip_address ? [summary.ip_address] : [],
          mx: [],
        }
      }
      
      return NextResponse.json(transformedResults)
    } catch (pythonError) {
      console.error("Python service error:", pythonError)
      return NextResponse.json(
        {
          error: "URL scan failed",
          details: pythonError instanceof Error ? pythonError.message : "Python service unavailable",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("URL scan error:", error)
    return NextResponse.json(
      {
        error: "Scan failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
