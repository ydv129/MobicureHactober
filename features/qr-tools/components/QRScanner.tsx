"use client"

import { useState, useRef } from "react"
import jsQR from "jsqr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle, Shield, Camera, Upload, CheckCircle, XCircle, ExternalLink, Copy } from "lucide-react"

interface Threat {
  type: string
  description: string
  severity: "Low" | "Medium" | "High" | "Critical"
}

interface QRScanResult {
  data: string
  type: "URL" | "Text" | "Email" | "Phone" | "WiFi" | "Unknown"
  isSecure: boolean
  threats: Threat[]
  riskLevel: "Low" | "Medium" | "High" | "Critical"
  recommendations: string[]
}

export default function QRCodeScanner() {
  const [file, setFile] = useState<File | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<QRScanResult | null>(null)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const scanQRCode = async () => {
    if (!file) return

    setIsScanning(true)

    try {
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        try {
          const img = new Image()
          img.onload = () => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            
            if (!ctx) {
              throw new Error('Failed to get canvas context')
            }

            canvas.width = img.width
            canvas.height = img.height
            ctx.drawImage(img, 0, 0)

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            
            decodeQRFromImage(imageData.data, canvas.width, canvas.height)
          }
          
          img.onerror = () => {
            throw new Error('Failed to load image')
          }
          
          img.src = e.target?.result as string
        } catch (error) {
          throw error
        }
      }

      reader.onerror = () => {
        throw new Error('Failed to read file')
      }

      reader.readAsDataURL(file)

    } catch (error) {
      console.error("QR code scanning failed:", error)
      toast({
        title: "Scan Failed",
        description: error instanceof Error ? error.message : "Failed to scan QR code",
        variant: "destructive"
      })
      setIsScanning(false)
    }
  }

  const decodeQRFromImage = (data: Uint8ClampedArray, width: number, height: number) => {
    try {
      const code = jsQR(data, width, height)
      const decodedData = code?.data

      if (decodedData) {
        const type = detectQRType(decodedData)
        const threats = analyzeThreats(decodedData, type)
        const isSecure = threats.length === 0
        const riskLevel = calculateRiskLevel(threats)

        setResult({
          data: decodedData,
          type,
          isSecure,
          threats,
          riskLevel,
          recommendations: generateRecommendations(type, threats),
        })

        toast({
          title: "Scan Successful",
          description: `QR code decoded: ${type}`,
        })
      } else {
        throw new Error('No QR code found in image. Please ensure the QR code is clear and properly positioned.')
      }
    } catch (error) {
      console.error("QR decode error:", error)
      throw error
    } finally {
      setIsScanning(false)
    }
  }

  const copyToClipboard = async () => {
    if (!result?.data) return

    try {
      await navigator.clipboard.writeText(result.data)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Copied",
        description: "QR code content copied to clipboard",
      })
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const detectQRType = (data: string): QRScanResult["type"] => {
    if (data.startsWith("http://") || data.startsWith("https://")) return "URL"
    if (data.startsWith("mailto:")) return "Email"
    if (data.startsWith("tel:")) return "Phone"
    if (data.startsWith("WIFI:")) return "WiFi"
    return "Text"
  }

  const analyzeThreats = (data: string, type: QRScanResult["type"]): Threat[] => {
    const threats: Threat[] = []

    if (type === "URL") {
      if (data.includes("bit.ly") || data.includes("tinyurl") || data.includes("t.co") || data.includes("goo.gl")) {
        threats.push({
          type: "URL Shortener",
          description: "Link uses URL shortening service, destination unknown",
          severity: "Medium",
        })
      }

      if (data.startsWith("http://")) {
        threats.push({
          type: "Insecure Connection",
          description: "URL uses unencrypted HTTP protocol",
          severity: "Medium",
        })
      }

      // Check for suspicious keywords
      const suspiciousKeywords = ['verify', 'confirm', 'urgent', 'login', 'password', 'secure']
      const hasKeyword = suspiciousKeywords.some(kw => data.toLowerCase().includes(kw))
      if (hasKeyword) {
        threats.push({
          type: "Phishing Risk",
          description: "URL contains keywords commonly used in phishing",
          severity: "High",
        })
      }

      // Check for IP addresses instead of domain
      if (/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.test(data)) {
        threats.push({
          type: "IP Address URL",
          description: "URL uses direct IP address instead of domain name",
          severity: "Medium",
        })
      }
    }

    if (type === "WiFi" && data.includes("P:")) {
      threats.push({
        type: "WiFi Credentials Exposed",
        description: "QR code contains WiFi password in plain text",
        severity: "Low",
      })
    }

    return threats
  }

  const calculateRiskLevel = (threats: Threat[]): QRScanResult["riskLevel"] => {
    if (threats.some((t) => t.severity === "Critical")) return "Critical"
    if (threats.some((t) => t.severity === "High")) return "High"
    if (threats.some((t) => t.severity === "Medium")) return "Medium"
    return "Low"
  }

  const generateRecommendations = (type: QRScanResult["type"], threats: Threat[]) => {
    const recommendations: string[] = []

    if (type === "URL") {
      recommendations.push("Verify the destination URL before clicking")
      recommendations.push("Check for HTTPS encryption")
      if (threats.some((t) => t.type === "URL Shortener")) {
        recommendations.push("Expand shortened URLs to see actual destination")
      }
    }

    if (type === "WiFi") {
      recommendations.push("Only connect to trusted WiFi networks")
      recommendations.push("Verify network name with the owner")
    }

    if (threats.length === 0) {
      recommendations.push("QR code appears safe to use")
    } else {
      recommendations.push("Exercise caution when using this QR code")
    }

    return recommendations
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Critical":
        return "text-red-500 border-red-500"
      case "High":
        return "text-orange-500 border-orange-500"
      case "Medium":
        return "text-yellow-500 border-yellow-500"
      default:
        return "text-green-500 border-green-500"
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div>
          <Label htmlFor="qr-image">QR Code Image</Label>
          <Input
            id="qr-image"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="cyber-input"
            ref={fileInputRef}
          />
        </div>

        <Button onClick={scanQRCode} disabled={!file || isScanning} className="cyber-button">
          {isScanning ? (
            <>
              <Camera className="w-4 h-4 mr-2 animate-spin" />
              Scanning QR Code...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Scan QR Code
            </>
          )}
        </Button>
      </div>

      {result && (
        <div className="space-y-4">
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.isSecure ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                QR Code Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Content Type:</span>
                <Badge variant="outline">{result.type}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Risk Level:</span>
                <Badge className={getRiskColor(result.riskLevel)}>{result.riskLevel}</Badge>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Decoded Content</h4>
                <div className="p-3 bg-background/50 border border-primary/20 rounded-lg">
                  <div className="text-sm font-mono break-all">{result.data}</div>
                  <div className="flex gap-2 mt-2">
                    {result.type === "URL" && (
                      <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                        <a href={result.data} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Open Link (Use Caution)
                        </a>
                      </Button>
                    )}
                    <Button variant="link" size="sm" className="p-0 h-auto" onClick={copyToClipboard}>
                      {copied ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 mr-1" />
                          Copy URL
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {result.threats.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    Security Threats
                  </h4>
                  <div className="space-y-2">
                    {result.threats.map((threat, index) => (
                      <div key={index} className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                        <div className="font-medium text-orange-400">{threat.type}</div>
                        <div className="text-sm text-muted-foreground mt-1">{threat.description}</div>
                        <Badge className="mt-2" variant={threat.severity === "High" ? "destructive" : "secondary"}>
                          {threat.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Security Recommendations
                </h4>
                <ul className="space-y-1">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      {rec}
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
