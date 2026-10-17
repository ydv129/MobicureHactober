"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Mail, Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

interface PhishingAnalysis {
  risk_score: number
  risk_level: "low" | "medium" | "high" | "critical"
  indicators: Indicator[]
  sender_analysis: {
    domain_reputation: number
    spf_valid: boolean
    dkim_valid: boolean
    suspicious_patterns: string[]
  }
  content_analysis: {
    urgency_keywords: string[]
    suspicious_links: string[]
    grammar_score: number
    social_engineering: string[]
  }
  recommendations: string[]
}

type Severity = "low" | "medium" | "high"
type Indicator = {
  category: string
  description: string
  severity: Severity
  found: boolean
}

export default function PhishingEmailDetector() {
  const [emailContent, setEmailContent] = useState("")
  const [senderEmail, setSenderEmail] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<PhishingAnalysis | null>(null)

  const analyzeEmail = async () => {
    if (!emailContent.trim()) return

    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/tools/email-phishing-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailContent, senderEmail }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Email analysis failed")
      setAnalysis(data)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const performPhishingAnalysis = (content: string, sender: string): PhishingAnalysis => {
    const urgencyKeywords = [
      "urgent",
      "immediate",
      "expire",
      "suspend",
      "verify",
      "confirm",
      "click now",
      "act now",
      "limited time",
    ]
    const suspiciousPatterns = [
      "dear customer",
      "dear sir/madam",
      "congratulations",
      "you have won",
      "claim now",
      "free money",
    ]
    const socialEngineering = ["fear", "urgency", "authority", "scarcity", "social proof"]

    const foundUrgencyKeywords = urgencyKeywords.filter((keyword) =>
      content.toLowerCase().includes(keyword.toLowerCase()),
    )

    const foundSuspiciousPatterns = suspiciousPatterns.filter((pattern) =>
      content.toLowerCase().includes(pattern.toLowerCase()),
    )

    const foundSocialEngineering = socialEngineering.filter((technique) => {
      switch (technique) {
        case "fear":
          return /suspend|block|close|terminate|fraud/i.test(content)
        case "urgency":
          return /urgent|immediate|expire|deadline|hurry/i.test(content)
        case "authority":
          return /bank|government|irs|police|legal|court/i.test(content)
        case "scarcity":
          return /limited|exclusive|only|last chance|few left/i.test(content)
        case "social proof":
          return /others|everyone|popular|trending|recommended/i.test(content)
        default:
          return false
      }
    })

    // Extract suspicious links
    const linkRegex = /https?:\/\/[^\s<>"]+/gi
    const links = content.match(linkRegex) || []
    const suspiciousLinks = links.filter((link) => {
      const domain = new URL(link).hostname
      return (
        domain.includes("bit.ly") ||
        domain.includes("tinyurl") ||
        domain.includes("t.co") ||
        domain.split(".").length > 3 || // Suspicious subdomain count
        /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/.test(domain)
      ) // IP address
    })

    // Calculate grammar score (simplified)
    const grammarScore = calculateGrammarScore(content)

    // Domain analysis
    const domainReputation = analyzeDomainReputation(sender)

    // Compute typed severity values
    const urgencySeverity: Severity =
      foundUrgencyKeywords.length > 2 ? "high" : foundUrgencyKeywords.length > 0 ? "medium" : "low"
    const linksSeverity: Severity = suspiciousLinks.length > 0 ? "high" : "low"
    const socialSeverity: Severity =
      foundSocialEngineering.length > 2 ? "high" : foundSocialEngineering.length > 0 ? "medium" : "low"
    const grammarSeverity: Severity = grammarScore < 60 ? "medium" : "low"

    // Calculate risk indicators with explicit typing
    const indicators: Indicator[] = [
      {
        category: "Sender Authentication",
        description: "SPF/DKIM validation",
        severity: "high" as Severity,
        found: false,
      },
      {
        category: "Urgency Language",
        description: `Found ${foundUrgencyKeywords.length} urgency keywords`,
        severity: urgencySeverity,
        found: foundUrgencyKeywords.length > 0,
      },
      {
        category: "Suspicious Links",
        description: `${suspiciousLinks.length} suspicious URLs detected`,
        severity: linksSeverity,
        found: suspiciousLinks.length > 0,
      },
      {
        category: "Social Engineering",
        description: `${foundSocialEngineering.length} manipulation techniques detected`,
        severity: socialSeverity,
        found: foundSocialEngineering.length > 0,
      },
      {
        category: "Grammar Quality",
        description: `Grammar score: ${grammarScore}%`,
        severity: grammarSeverity,
        found: grammarScore < 60,
      },
    ]

    // Calculate overall risk score
    let riskScore = 0
    indicators.forEach((indicator) => {
      if (indicator.found) {
        switch (indicator.severity) {
          case "high":
            riskScore += 25
            break
          case "medium":
            riskScore += 15
            break
          case "low":
            riskScore += 5
            break
        }
      }
    })

    // Add domain reputation impact
    riskScore += (100 - domainReputation) * 0.3

    riskScore = Math.min(100, Math.max(0, riskScore))

    const getRiskLevel = (score: number): "low" | "medium" | "high" | "critical" => {
      if (score >= 80) return "critical"
      if (score >= 60) return "high"
      if (score >= 30) return "medium"
      return "low"
    }

    return {
      risk_score: Math.round(riskScore),
      risk_level: getRiskLevel(riskScore),
      indicators,
      sender_analysis: {
        domain_reputation: domainReputation,
        spf_valid: true,
        dkim_valid: true,
        suspicious_patterns: foundSuspiciousPatterns,
      },
      content_analysis: {
        urgency_keywords: foundUrgencyKeywords,
        suspicious_links: suspiciousLinks,
        grammar_score: grammarScore,
        social_engineering: foundSocialEngineering,
      },
      recommendations: generateRecommendations(riskScore, indicators),
    }
  }

  const calculateGrammarScore = (text: string): number => {
    let score = 100

    // Check for common grammar issues
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
    const avgSentenceLength = text.length / sentences.length

    // Penalize very short or very long sentences
    if (avgSentenceLength < 10 || avgSentenceLength > 100) score -= 10

    // Check for excessive capitalization
    const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length
    if (capsRatio > 0.1) score -= 15

    // Check for repeated punctuation
    if (/[!]{2,}|[?]{2,}/.test(text)) score -= 10

    // Check for spelling patterns (simplified)
    const commonMisspellings = ["recieve", "seperate", "occured", "neccessary"]
    commonMisspellings.forEach((word) => {
      if (text.toLowerCase().includes(word)) score -= 5
    })

    return Math.max(0, score)
  }

  const analyzeDomainReputation = (email: string): number => {
    if (!email) return 50

    const domain = email.split("@")[1]?.toLowerCase()
    if (!domain) return 30

    // Known good domains
    const trustedDomains = ["gmail.com", "outlook.com", "yahoo.com", "hotmail.com"]
    if (trustedDomains.includes(domain)) return 85

    // Suspicious patterns
    if (domain.includes("secure") || domain.includes("verify") || domain.includes("update")) return 20
    if (domain.split(".").length > 3) return 30 // Too many subdomains
    if (/[0-9]/.test(domain)) return 40 // Numbers in domain

    return 60 // Default for unknown domains
  }

  const generateRecommendations = (riskScore: number, indicators: Indicator[]): string[] => {
    const recommendations = []

    if (riskScore >= 60) {
      recommendations.push("Do not click any links or download attachments")
      recommendations.push("Do not provide any personal information")
      recommendations.push("Report this email as phishing to your IT department")
    }

    if (indicators.some((i) => i.category === "Suspicious Links" && i.found)) {
      recommendations.push("Verify URLs by hovering over links before clicking")
    }

    if (indicators.some((i) => i.category === "Sender Authentication" && i.found)) {
      recommendations.push("Verify sender identity through alternative communication")
    }

    if (riskScore < 30) {
      recommendations.push("Email appears legitimate but remain cautious")
      recommendations.push("Verify sender if requesting sensitive information")
    }

    return recommendations
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical":
        return "text-red-500 bg-red-500/20"
      case "high":
        return "text-red-400 bg-red-400/20"
      case "medium":
        return "text-yellow-400 bg-yellow-400/20"
      default:
        return "text-green-400 bg-green-400/20"
    }
  }

  const getSeverityIcon = (severity: Severity, found: boolean) => {
    if (!found) return <CheckCircle className="w-4 h-4 text-green-400" />

    switch (severity) {
      case "high":
        return <XCircle className="w-4 h-4 text-red-400" />
      case "medium":
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      default:
        return <AlertTriangle className="w-4 h-4 text-blue-400" />
    }
  }

  return (
    <div className="space-y-6">
      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Sender Email (Optional)</label>
            <input
              type="email"
              placeholder="sender@example.com"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-background border border-primary/20 focus:border-primary/40 outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Email Content</label>
            <Textarea
              placeholder="Paste the email content here..."
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              className="min-h-32"
            />
          </div>

          <Button
            onClick={analyzeEmail}
            disabled={isAnalyzing || !emailContent.trim()}
            className="cyber-button variant-default"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Email"}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">{analysis.risk_score}%</div>
                <Badge className={`${getRiskColor(analysis.risk_level)} mb-4`}>
                  {analysis.risk_level.toUpperCase()} RISK
                </Badge>
                <Progress value={analysis.risk_score} className="mb-4" />
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Security Indicators</h4>
                {analysis.indicators.map((indicator, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    {getSeverityIcon(indicator.severity, indicator.found)}
                    <div className="flex-1">
                      <div className="font-medium text-sm">{indicator.category}</div>
                      <div className="text-xs text-muted-foreground">{indicator.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-card">
            <CardHeader>
              <CardTitle>Detailed Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Sender Analysis</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Domain Reputation:</span>
                    <span className="font-mono">{analysis.sender_analysis.domain_reputation}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SPF Valid:</span>
                    <span className={analysis.sender_analysis.spf_valid ? "text-green-400" : "text-red-400"}>
                      {analysis.sender_analysis.spf_valid ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>DKIM Valid:</span>
                    <span className={analysis.sender_analysis.dkim_valid ? "text-green-400" : "text-red-400"}>
                      {analysis.sender_analysis.dkim_valid ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Content Analysis</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Grammar Score:</span>
                    <span className="ml-2 font-mono">{analysis.content_analysis.grammar_score}%</span>
                  </div>

                  {analysis.content_analysis.urgency_keywords.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">Urgency Keywords:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {analysis.content_analysis.urgency_keywords.map((keyword, index) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.content_analysis.suspicious_links.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">Suspicious Links:</span>
                      <div className="mt-1 space-y-1">
                        {analysis.content_analysis.suspicious_links.map((link, index) => (
                          <div key={index} className="font-mono text-xs bg-red-500/20 p-1 rounded">
                            {link}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Recommendations</h4>
                <ul className="space-y-1 text-sm">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
