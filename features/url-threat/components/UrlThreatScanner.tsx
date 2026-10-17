"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Shield, Globe, Clock, Eye, EyeOff, Server, Lock, Database, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ForensicAnalysis {
  url: string
  status: "safe" | "warning" | "critical"
  riskScore: number
  forensicDetails: {
    domain: string
    ipAddress: string
    geolocation: string
    asn: string
    usesHttps: boolean
    protectedByCloudflare: boolean
    librariesUsed: string[]
    phishingDetected: boolean
    phishingConfidence: number
    phishingIndicators: string[]
    urlscanScanned: boolean
    urlscanMalicious: boolean
    cloudflareProtected: boolean
    cloudflareSSL: boolean
    cloudflareWAF: boolean
    suspiciousPatternsFound: number
    hasJavaScript: boolean
    hasIframes: boolean
    externalLinks: number
    urlLength: number
    domainLength: number
    subdomainCount: number
    dnsRecords: {
      a: string[]
      mx: string[]
    }
  }
  threats: string[]
  timestamp: string
}

export default function URLThreatScanner() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ForensicAnalysis | null>(null)
  const [showForensics, setShowForensics] = useState(false)
  const { toast } = useToast()

  const performForensicAnalysis = async () => {
    if (!url) return

    setLoading(true)
    // Start scanning URL

    try {
      const targetUrl = url.startsWith("http") ? url : `https://${url}`

      // Call the real Python backend API
      const response = await fetch('/api/tools/url-threat-scanner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl })
      })

      let data: any = null
      if (!response.ok) {
        // Try to parse error details from backend
        try {
          data = await response.json()
        } catch {
          data = null
        }
        const errorMsg = data?.error || 'URL threat scan failed'
        const errorDetails = data?.details ? `: ${data.details}` : ''
        throw new Error(errorMsg + errorDetails)
      }

      data = await response.json()

      // Map risk_level from Python to status for frontend
      const riskScore = data.risk_score || 0
      const status: "safe" | "warning" | "critical" = riskScore >= 70 ? "critical" : riskScore >= 40 ? "warning" : "safe"

      // Transform the Python backend response to match the component's expected format
      const forensicData: ForensicAnalysis = {
        url: data.url || targetUrl,
        status: status,
        riskScore,
        forensicDetails: {
          domain: data.domain || "Unknown",
          ipAddress: data.ip_address || "Unknown",
          geolocation: data.geolocation || "Unknown",
          asn: data.asn || "Unknown",
          usesHttps: data.uses_https || false,
          protectedByCloudflare: data.protected_by_cloudflare || false,
          librariesUsed: data.libraries_used || [],
          phishingDetected: data.phishing_detected || false,
          phishingConfidence: data.phishing_confidence || 0,
          phishingIndicators: data.phishing_indicators || [],
          urlscanScanned: data.urlscan_scanned || false,
          urlscanMalicious: data.urlscan_malicious || false,
          cloudflareProtected: data.cloudflare_protected || false,
          cloudflareSSL: data.cloudflare_ssl || false,
          cloudflareWAF: data.cloudflare_waf || false,
          suspiciousPatternsFound: data.suspicious_patterns_found || 0,
          hasJavaScript: data.has_javascript || false,
          hasIframes: data.has_iframes || false,
          externalLinks: data.external_links || 0,
          urlLength: data.url_length || 0,
          domainLength: data.domain_length || 0,
          subdomainCount: data.subdomain_count || 0,
          dnsRecords: data.dns_records || {
            a: [],
            mx: [],
          },
        },
        threats: data.threats || [],
        timestamp: data.timestamp || new Date().toISOString(),
      }

      setResult(forensicData)
    } catch (error: any) {
      console.error("Forensic analysis failed:", error)
      toast({
        title: "Scan Failed",
        description: error?.message || "Failed to perform URL threat analysis. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "safe":
        return "text-green-500"
      case "warning":
        return "text-yellow-500"
      case "critical":
        return "text-red-500"
      default:
        return "text-muted-foreground"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "safe":
        return <Shield className="w-5 h-5 text-green-500" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case "critical":
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      default:
        return <Globe className="w-4 h-4" />
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && url && !loading) {
      performForensicAnalysis();
    }
  };

  const presetUrls = [
    { label: "Google (Safe)", url: "https://google.com" },
    { label: "GitHub (Clean)", url: "https://github.com" },
    { label: "Suspicious Demo", url: "http://secure-login-account-update.xyz/verify" },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="url" className="text-sm font-mono font-semibold text-cyan-300">
              TARGET URL FOR FORENSIC DEEP SCAN
            </Label>
            <span className="text-[11px] font-mono text-slate-400">
              PRESS <kbd className="px-1.5 py-0.5 rounded bg-black/60 border border-cyan-500/30 text-cyan-300">↵ ENTER</kbd> TO SCAN
            </span>
          </div>

          <div className="relative">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-cyan-400" />
            <Input
              id="url"
              type="url"
              placeholder="https://example.com or domain.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              className="cyber-input pl-11 pr-4 py-2.5 h-12 text-sm text-cyan-100 placeholder:text-slate-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs font-mono">
            <span className="text-slate-400">QUICK PRESETS:</span>
            {presetUrls.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setUrl(preset.url)}
                className="px-2.5 py-1 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 hover:border-cyan-400/60 transition-all cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={performForensicAnalysis}
          disabled={loading || !url}
          className="w-full cyber-button h-12 text-sm font-bold tracking-wider"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-cyan-300" />
              <span>PERFORMING DEEP MATRIX ANALYSIS...</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-cyan-300" />
              <span>START FORENSIC SCAN</span>
            </span>
          )}
        </Button>
      </div>

      {loading && (
        <Card className="cyber-card p-8 border border-cyan-400/40 text-center relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="relative h-16 w-16 mx-auto flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400 animate-spin"
                style={{ animationDuration: "6s" }}
              />
              <div className="h-10 w-10 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center">
                <Globe className="h-5 w-5 text-cyan-300 animate-pulse" />
              </div>
            </div>
            <div className="space-y-1.5 font-mono">
              <p className="text-sm font-bold text-cyan-300 tracking-wider">
                INTERCEPTING SSL CERTIFICATES & DNS TOPOLOGY...
              </p>
              <p className="text-xs text-slate-400">
                Scanning reputation heuristics, ASN routing, and malware signatures
              </p>
            </div>
          </div>
        </Card>
      )}

      {result && (
        <div className="space-y-4">
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(result.status)}
                  <span className={`font-bold ${getStatusColor(result.status)}`}>{result.status.toUpperCase()}</span>
                </div>
                <Badge
                  variant={result.riskScore > 70 ? "destructive" : result.riskScore > 40 ? "secondary" : "default"}
                >
                  Risk: {result.riskScore}/100
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Target URL</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-sm bg-muted px-2 py-1 rounded flex-1 break-all">{result.url}</code>
                </div>
              </div>

              {result.threats.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Security Concerns</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {result.threats.map((threat, index) => (
                      <Badge key={index} variant="destructive">
                        {threat}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Forensic Analysis</Label>
                <Button variant="ghost" size="sm" onClick={() => setShowForensics(!showForensics)}>
                  {showForensics ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span className="ml-2">{showForensics ? "Hide" : "Show"} Details</span>
                </Button>
              </div>

              {showForensics && (
                <div className="space-y-4 border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary" />
                        <Label className="text-sm font-medium">Domain Information</Label>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Domain:</span>
                          <span>{result.forensicDetails.domain}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">IP Address:</span>
                          <span>{result.forensicDetails.ipAddress}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Location:</span>
                          <span>{result.forensicDetails.geolocation}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ASN:</span>
                          <span>{result.forensicDetails.asn}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">HTTPS:</span>
                          <Badge variant={result.forensicDetails.usesHttps ? "default" : "destructive"}>
                            {result.forensicDetails.usesHttps ? "Yes" : "No"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        <Label className="text-sm font-medium">Security Analysis</Label>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cloudflare Protected:</span>
                          <Badge variant={result.forensicDetails.cloudflareProtected ? "default" : "secondary"}>
                            {result.forensicDetails.cloudflareProtected ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cloudflare SSL:</span>
                          <Badge variant={result.forensicDetails.cloudflareSSL ? "default" : "secondary"}>
                            {result.forensicDetails.cloudflareSSL ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">WAF Protection:</span>
                          <Badge variant={result.forensicDetails.cloudflareWAF ? "default" : "secondary"}>
                            {result.forensicDetails.cloudflareWAF ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">URLScan.io:</span>
                          <Badge variant={result.forensicDetails.urlscanScanned ? "default" : "secondary"}>
                            {result.forensicDetails.urlscanScanned ? "Scanned" : "Not Scanned"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-primary" />
                      <Label className="text-sm font-medium">Phishing Analysis</Label>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phishing Detected:</span>
                        <Badge variant={result.forensicDetails.phishingDetected ? "destructive" : "default"}>
                          {result.forensicDetails.phishingDetected ? "Yes" : "No"}
                        </Badge>
                      </div>
                      {result.forensicDetails.phishingDetected && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Confidence:</span>
                          <span>{(result.forensicDetails.phishingConfidence * 100).toFixed(0)}%</span>
                        </div>
                      )}
                      {result.forensicDetails.phishingIndicators.length > 0 && (
                        <div>
                          <span className="text-muted-foreground">Risk Indicators:</span>
                          <div className="ml-4 mt-1 space-y-1">
                            {result.forensicDetails.phishingIndicators.map((indicator, idx) => (
                              <Badge key={idx} variant="outline" className="mr-2 mb-1">
                                {indicator}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-primary" />
                      <Label className="text-sm font-medium">Content Analysis</Label>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">JavaScript:</span>
                        <Badge variant={result.forensicDetails.hasJavaScript ? "secondary" : "default"}>
                          {result.forensicDetails.hasJavaScript ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">Iframes:</span>
                        <Badge variant={result.forensicDetails.hasIframes ? "secondary" : "default"}>
                          {result.forensicDetails.hasIframes ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">External Links:</span>
                        <span>{result.forensicDetails.externalLinks}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">Suspicious Patterns:</span>
                        <span>{result.forensicDetails.suspiciousPatternsFound}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-primary" />
                      <Label className="text-sm font-medium">Technical Details</Label>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">URL Length:</span>
                        <div>{result.forensicDetails.urlLength} chars</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Domain Length:</span>
                        <div>{result.forensicDetails.domainLength} chars</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Subdomains:</span>
                        <div>{result.forensicDetails.subdomainCount}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-primary" />
                      <Label className="text-sm font-medium">Libraries Used</Label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.forensicDetails.librariesUsed.map((lib, index) => (
                        <Badge key={index} variant="outline">
                          {lib}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-primary" />
                      <Label className="text-sm font-medium">DNS Records</Label>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">A Records:</span>
                        <div className="ml-4">{result.forensicDetails.dnsRecords.a.join(", ") || "None"}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">MX Records:</span>
                        <div className="ml-4">{result.forensicDetails.dnsRecords.mx.join(", ") || "None"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                Analysis completed: {new Date(result.timestamp).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
