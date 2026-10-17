"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Smartphone,
  Upload,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  Activity,
  Globe,
  Database,
  Settings,
  FileText,
  Network,
} from "lucide-react"

interface SecurityScan {
  meta: {
    scan_time: string
    apk_path: string
    sha256: string
  }
  package: {
    name: string
    version_name: string
    version_code: string
    min_sdk: string
    target_sdk: string
  }
  permissions: {
    declared: string[]
    dangerous: Array<{ permission: string; short_name: string; weight: number }>
    critical: Array<{ permission: string; short_name: string; weight: number }>
  }
  components: {
    exported_activities: string[]
    exported_services: string[]
    exported_receivers: string[]
    exported_providers: string[]
  }
  persistence_indicators: Array<{ receiver: string; action: string }>
  api_indicators: string[]
  network_indicators: {
    urls_ips: string[]
    has_ssl_pinning: boolean
  }
  code_analysis: {
    obfuscated: boolean
    obfuscation_ratio: number
    dynamic_code_loading: boolean
    reflection_usage: boolean
    native_libraries: string[]
  }
  privacy_concerns: string[]
  risk: {
    score: number
    verdict: string
    reasons: string[]
    breakdown: Record<string, number>
  }
  recommendations: string[]
}

interface APKAnalysisResult {
  filename: string
  packageName: string
  versionCode: number | string
  versionName: string
  supportedABIs: string[]
  nativeLibraries: string[]
  minSdkVersion: number | string
  targetSdkVersion: number | string
  activities: string[]
  services: string[]
  broadcastReceivers: string[]
  contentProviders: string[]
  permissions: string[]
  urlEndpoints: string[]
  ipEndpoints: string[]
  malwareDetected: boolean
  riskLevel: string
  riskScore: number
  suspiciousActivities: string[]
  certificateValid: boolean
  fileSize: number
  certificateInfo: {
    issuer: string
    subject: string
    validFrom: string
    validTo: string
    serialNumber: string
    sha1?: string
    sha256?: string
    md5?: string
  }
  securityAnalysis: {
    hasObfuscation: boolean
    obfuscationRatio: number
    hasAntiDebugging: boolean
    hasRootDetection: boolean
    encryptedStrings: boolean
    suspiciousAPIs: string[]
    dynamicCodeLoading: boolean
    reflectionUsage: boolean
    hasSslPinning: boolean
  }
  securityScan?: SecurityScan
  recommendations: string[]
  privacyConcerns: string[]
  persistenceIndicators: Array<{ receiver: string; action: string }>
}

export function APKAnalyzer() {
  const [file, setFile] = useState<File | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [results, setResults] = useState<APKAnalysisResult | null>(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!file) return

    setAnalyzing(true)
    setProgress(0)
    setError(null)

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90))
    }, 500)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/tools/apk-analyzer", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "APK analysis failed")
      }

      const data = await response.json()
      
      const securityScan = data.security_scan
      const appInfo = data.app_info
      
      const analysisResult: APKAnalysisResult = {
        filename: data.filename || file.name,
        packageName: appInfo?.package || securityScan?.package?.name || "Unknown",
        versionCode: appInfo?.version_code || securityScan?.package?.version_code || "N/A",
        versionName: appInfo?.version || securityScan?.package?.version_name || "Unknown",
        supportedABIs: [],
        nativeLibraries: securityScan?.code_analysis?.native_libraries || [],
        minSdkVersion: appInfo?.min_sdk || securityScan?.package?.min_sdk || "N/A",
        targetSdkVersion: appInfo?.target_sdk || securityScan?.package?.target_sdk || "N/A",
        activities: appInfo?.activities || securityScan?.components?.exported_activities || [],
        services: appInfo?.services || securityScan?.components?.exported_services || [],
        broadcastReceivers: appInfo?.receivers || securityScan?.components?.exported_receivers || [],
        contentProviders: securityScan?.components?.exported_providers || [],
        permissions: data.permissions || securityScan?.permissions?.declared || [],
        urlEndpoints: securityScan?.network_indicators?.urls_ips?.filter((u: string) => u.startsWith("http")) || [],
        ipEndpoints: securityScan?.network_indicators?.urls_ips?.filter((u: string) => !u.startsWith("http")) || [],
        malwareDetected: securityScan?.risk?.verdict === "CRITICAL" || false,
        riskLevel: securityScan?.risk?.verdict || "UNKNOWN",
        riskScore: securityScan?.risk?.score || 0,
        suspiciousActivities: data.risks
          ? [...(data.risks.critical || []), ...(data.risks.high || []), ...(data.risks.medium || [])]
          : securityScan?.risk?.reasons || [],
        certificateValid: data.certificate?.is_valid !== false,
        fileSize: data.app_info?.file_size || file.size,
        certificateInfo: {
          issuer: data.certificate?.issuer || "Unknown",
          subject: data.certificate?.subject || "Unknown",
          validFrom: data.certificate?.valid_from || "Unknown",
          validTo: data.certificate?.valid_to || "Unknown",
          serialNumber: data.certificate?.serial_number || "Unknown",
          sha1: data.certificate?.sha1,
          sha256: data.certificate?.sha256,
          md5: data.certificate?.md5,
        },
        securityAnalysis: {
          hasObfuscation: securityScan?.code_analysis?.obfuscated || false,
          obfuscationRatio: securityScan?.code_analysis?.obfuscation_ratio || 0,
          hasAntiDebugging: false,
          hasRootDetection: false,
          encryptedStrings: false,
          suspiciousAPIs: securityScan?.api_indicators || [],
          dynamicCodeLoading: securityScan?.code_analysis?.dynamic_code_loading || false,
          reflectionUsage: securityScan?.code_analysis?.reflection_usage || false,
          hasSslPinning: securityScan?.network_indicators?.has_ssl_pinning || false,
        },
        securityScan: securityScan,
        recommendations: securityScan?.recommendations || [],
        privacyConcerns: securityScan?.privacy_concerns || [],
        persistenceIndicators: securityScan?.persistence_indicators || [],
      }

      clearInterval(progressInterval)
      setProgress(100)
      setResults(analysisResult)
    } catch (error) {
      console.error("APK analysis failed:", error)
      setError(error instanceof Error ? error.message : "APK analysis failed")
      clearInterval(progressInterval)
    } finally {
      setAnalyzing(false)
    }
  }

  const getRiskColor = (level: string) => {
    const normalized = level.toUpperCase()
    switch (normalized) {
      case "MINIMAL_RISK":
      case "LOW":
      case "LOW_RISK":
        return "text-green-400"
      case "MEDIUM":
      case "MEDIUM_RISK":
        return "text-yellow-400"
      case "HIGH":
      case "HIGH_RISK":
        return "text-orange-400"
      case "CRITICAL":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const getRiskBadgeColor = (level: string) => {
    const normalized = level.toUpperCase()
    switch (normalized) {
      case "MINIMAL_RISK":
      case "LOW":
      case "LOW_RISK":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "MEDIUM":
      case "MEDIUM_RISK":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "HIGH":
      case "HIGH_RISK":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "CRITICAL":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <Card className="glass-morphism-main-large">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-cyan-400">
          <Smartphone className="h-6 w-6" />
          <span>APK Security Analyzer</span>
        </CardTitle>
        <CardDescription className="text-gray-300">
          Full Android APK analysis for malware detection, permission auditing, and security assessment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border-2 border-dashed border-cyan-500/30 rounded-lg p-8 text-center hover:border-cyan-400/50 transition-colors">
          <Upload className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
          <Input
            type="file"
            accept=".apk"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="max-w-xs mx-auto bg-gray-800/50 border-gray-600 text-white"
          />
          <p className="text-sm text-gray-400 mt-2">Upload APK files for full security analysis</p>
        </div>

        {file && (
          <div className="flex items-center justify-between p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
            <div className="flex items-center space-x-3">
              <Smartphone className="h-5 w-5 text-cyan-400" />
              <span className="text-white font-medium">{file.name}</span>
              <span className="text-gray-400 text-sm">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
            </div>
            <Button onClick={handleAnalyze} disabled={analyzing} className="bg-cyan-600 hover:bg-cyan-500 text-white">
              {analyzing ? "Analyzing..." : "Analyze APK"}
            </Button>
          </div>
        )}

        {analyzing && (
          <div className="space-y-3">
            <div className="text-sm text-cyan-400">Performing full APK security analysis...</div>
            <Progress value={progress} className="w-full h-2" />
            <div className="text-xs text-gray-400">
              {progress < 30 && "Extracting APK structure..."}
              {progress >= 30 && progress < 60 && "Analyzing permissions and components..."}
              {progress >= 60 && progress < 90 && "Scanning for malware and vulnerabilities..."}
              {progress >= 90 && "Generating security report..."}
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center space-x-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Analysis Failed</span>
            </div>
            <p className="text-sm text-red-300 mt-2">{error}</p>
          </div>
        )}

        {results && (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6 bg-gray-800/50">
              <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-600">
                Overview
              </TabsTrigger>
              <TabsTrigger value="components" className="data-[state=active]:bg-cyan-600">
                Components
              </TabsTrigger>
              <TabsTrigger value="permissions" className="data-[state=active]:bg-cyan-600">
                Permissions
              </TabsTrigger>
              <TabsTrigger value="network" className="data-[state=active]:bg-cyan-600">
                Network
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-cyan-600">
                Security
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="data-[state=active]:bg-cyan-600">
                Report
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                <div className="flex items-center space-x-3">
                  {results.malwareDetected ? (
                    <XCircle className="h-6 w-6 text-red-400" />
                  ) : (
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  )}
                  <div>
                    <span className="text-white font-medium">Security Risk Level:</span>
                    <div className="text-xs text-gray-400">Risk Score: {results.riskScore}</div>
                  </div>
                </div>
                <Badge className={`${getRiskBadgeColor(results.riskLevel)} font-bold text-sm px-4 py-1`}>
                  {results.riskLevel.replace(/_/g, " ")}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                  <h4 className="font-medium text-cyan-400 flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>App Information</span>
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Package Name:</span>
                      <span className="text-white font-mono text-xs">{results.packageName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Version:</span>
                      <span className="text-white">
                        {results.versionName} ({results.versionCode})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Min SDK:</span>
                      <span className="text-white">Android {results.minSdkVersion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Target SDK:</span>
                      <span className="text-white">Android {results.targetSdkVersion}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                  <h4 className="font-medium text-cyan-400 flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Technical Details</span>
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">File Size:</span>
                      <span className="text-white">{(results.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Certificate:</span>
                      <span className={results.certificateValid ? "text-green-400" : "text-red-400"}>
                        {results.certificateValid ? "Valid" : "Invalid"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">ABIs:</span>
                      <span className="text-white text-xs">{results.supportedABIs.length || "None"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Libraries:</span>
                      <span className="text-white">{results.nativeLibraries.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {results.suspiciousActivities.length > 0 && (
                <div className="space-y-3 p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                  <h4 className="font-medium text-red-400 flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Security Threats Detected</span>
                  </h4>
                  <div className="space-y-2">
                    {results.suspiciousActivities.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-2 bg-red-500/20 rounded border-l-2 border-red-400"
                      >
                        <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                        <span className="text-sm text-white">{activity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="components" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                  <h4 className="font-medium text-cyan-400 flex items-center space-x-2">
                    <Activity className="h-4 w-4" />
                    <span>Activities ({results.activities.length})</span>
                  </h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {results.activities.length > 0 ? (
                      results.activities.map((activity, index) => (
                        <div key={index} className="text-xs font-mono text-gray-300 p-1 bg-gray-900/50 rounded">
                          {activity}
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">No activities found</span>
                    )}
                  </div>
                </div>

                <div className="space-y-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                  <h4 className="font-medium text-cyan-400 flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Services ({results.services.length})</span>
                  </h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {results.services.length > 0 ? (
                      results.services.map((service, index) => (
                        <div key={index} className="text-xs font-mono text-gray-300 p-1 bg-gray-900/50 rounded">
                          {service}
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">No services found</span>
                    )}
                  </div>
                </div>

                <div className="space-y-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                  <h4 className="font-medium text-cyan-400 flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>Broadcast Receivers ({results.broadcastReceivers.length})</span>
                  </h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {results.broadcastReceivers.length > 0 ? (
                      results.broadcastReceivers.map((receiver, index) => (
                        <div key={index} className="text-xs font-mono text-gray-300 p-1 bg-gray-900/50 rounded">
                          {receiver}
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">No broadcast receivers found</span>
                    )}
                  </div>
                </div>

                <div className="space-y-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                  <h4 className="font-medium text-cyan-400 flex items-center space-x-2">
                    <Database className="h-4 w-4" />
                    <span>Content Providers ({results.contentProviders.length})</span>
                  </h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {results.contentProviders.length > 0 ? (
                      results.contentProviders.map((provider, index) => (
                        <div key={index} className="text-xs font-mono text-gray-300 p-1 bg-gray-900/50 rounded">
                          {provider}
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">No content providers found</span>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <div className="space-y-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                <h4 className="font-medium text-cyan-400 flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Requested Permissions ({results.permissions.length})</span>
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {results.permissions.map((permission, index) => {
                    const isDangerous = [
                      "CAMERA",
                      "READ_CONTACTS",
                      "ACCESS_FINE_LOCATION",
                      "READ_SMS",
                      "CALL_PHONE",
                      "RECORD_AUDIO",
                    ].includes(permission)
                    return (
                      <Badge
                        key={index}
                        variant="outline"
                        className={`text-xs justify-start ${isDangerous ? "border-red-500/50 text-red-400" : "border-gray-600 text-gray-300"}`}
                      >
                        {isDangerous && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {permission}
                      </Badge>
                    )
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="network" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                  <h4 className="font-medium text-cyan-400 flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>URL Endpoints ({results.urlEndpoints.length})</span>
                  </h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {results.urlEndpoints.length > 0 ? (
                      results.urlEndpoints.map((url, index) => {
                        const isSuspicious = url.includes("suspicious") || url.startsWith("http://")
                        return (
                          <div
                            key={index}
                            className={`text-xs font-mono p-2 rounded flex items-center space-x-2 ${isSuspicious ? "bg-red-500/20 text-red-400" : "bg-gray-900/50 text-gray-300"}`}
                          >
                            {isSuspicious && <AlertTriangle className="h-3 w-3" />}
                            <span>{url}</span>
                          </div>
                        )
                      })
                    ) : (
                      <span className="text-gray-500 text-sm">No URL endpoints found</span>
                    )}
                  </div>
                </div>

                <div className="space-y-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                  <h4 className="font-medium text-cyan-400 flex items-center space-x-2">
                    <Network className="h-4 w-4" />
                    <span>IP Endpoints ({results.ipEndpoints.length})</span>
                  </h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {results.ipEndpoints.length > 0 ? (
                      results.ipEndpoints.map((ip, index) => {
                        const isSuspicious = ip.includes("185.220") || ip.includes("192.168")
                        return (
                          <div
                            key={index}
                            className={`text-xs font-mono p-2 rounded flex items-center space-x-2 ${isSuspicious ? "bg-red-500/20 text-red-400" : "bg-gray-900/50 text-gray-300"}`}
                          >
                            {isSuspicious && <AlertTriangle className="h-3 w-3" />}
                            <span>{ip}</span>
                          </div>
                        )
                      })
                    ) : (
                      <span className="text-gray-500 text-sm">No IP endpoints found</span>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                  <h4 className="font-medium text-cyan-400 flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Security Analysis</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Code Obfuscation:</span>
                      <div className="text-right">
                        <span className={results.securityAnalysis.hasObfuscation ? "text-red-400" : "text-green-400"}>
                          {results.securityAnalysis.hasObfuscation ? "Detected" : "Not Found"}
                        </span>
                        {results.securityAnalysis.obfuscationRatio > 0 && (
                          <div className="text-xs text-gray-500">
                            {(results.securityAnalysis.obfuscationRatio * 100).toFixed(0)}% obfuscated
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Dynamic Code Loading:</span>
                      <span className={results.securityAnalysis.dynamicCodeLoading ? "text-red-400" : "text-green-400"}>
                        {results.securityAnalysis.dynamicCodeLoading ? "Detected" : "Not Found"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Reflection Usage:</span>
                      <span className={results.securityAnalysis.reflectionUsage ? "text-yellow-400" : "text-green-400"}>
                        {results.securityAnalysis.reflectionUsage ? "Present" : "Not Found"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">SSL Certificate Pinning:</span>
                      <span className={results.securityAnalysis.hasSslPinning ? "text-green-400" : "text-yellow-400"}>
                        {results.securityAnalysis.hasSslPinning ? "Implemented" : "Not Found"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Native Libraries:</span>
                      <span className="text-white">{results.nativeLibraries.length}</span>
                    </div>
                  </div>
                </div>

                {results.persistenceIndicators && results.persistenceIndicators.length > 0 && (
                  <div className="space-y-3 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                    <h4 className="font-medium text-yellow-400 flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Persistence Mechanisms ({results.persistenceIndicators.length})</span>
                    </h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {results.persistenceIndicators.map((indicator, index) => (
                        <div key={index} className="text-xs p-2 bg-yellow-500/20 rounded">
                          <div className="text-yellow-400 font-mono">{indicator.receiver}</div>
                          <div className="text-gray-300 mt-1">→ {indicator.action}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.securityAnalysis.suspiciousAPIs.length > 0 && (
                  <div className="space-y-3 p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                    <h4 className="font-medium text-red-400 flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Suspicious API Calls ({results.securityAnalysis.suspiciousAPIs.length})</span>
                    </h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {results.securityAnalysis.suspiciousAPIs.map((api, index) => (
                        <div key={index} className="text-xs font-mono text-red-400 p-2 bg-red-500/20 rounded">
                          {api}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.nativeLibraries.length > 0 && (
                  <div className="space-y-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                    <h4 className="font-medium text-cyan-400 flex items-center space-x-2">
                      <Database className="h-4 w-4" />
                      <span>Native Libraries ({results.nativeLibraries.length})</span>
                    </h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {results.nativeLibraries.slice(0, 20).map((lib, index) => (
                        <div key={index} className="text-xs font-mono text-gray-300 p-1 bg-gray-900/50 rounded">
                          {lib}
                        </div>
                      ))}
                      {results.nativeLibraries.length > 20 && (
                        <div className="text-xs text-gray-500 italic">
                          ... and {results.nativeLibraries.length - 20} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                  <h4 className="font-medium text-cyan-400">Certificate Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Issuer:</span>
                      <span className="text-white text-xs font-mono break-all max-w-[60%] text-right">
                        {results.certificateInfo.issuer}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Subject:</span>
                      <span className="text-white text-xs font-mono break-all max-w-[60%] text-right">
                        {results.certificateInfo.subject}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Valid From:</span>
                      <span className="text-white">{results.certificateInfo.validFrom}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Valid To:</span>
                      <span className="text-white">{results.certificateInfo.validTo}</span>
                    </div>
                    {results.certificateInfo.sha256 && (
                      <div className="flex flex-col space-y-1">
                        <span className="text-gray-400">SHA-256:</span>
                        <span className="text-white text-xs font-mono break-all bg-gray-900/50 p-2 rounded">
                          {results.certificateInfo.sha256}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              {results.securityScan && (
                <div className="space-y-4">
                  {results.securityScan.risk.breakdown && Object.keys(results.securityScan.risk.breakdown).length > 0 && (
                    <div className="space-y-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                      <h4 className="font-medium text-cyan-400 flex items-center space-x-2">
                        <Activity className="h-4 w-4" />
                        <span>Risk Score Breakdown</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(results.securityScan.risk.breakdown).map(([category, score]) => (
                          <div key={category} className="flex justify-between items-center p-2 bg-gray-900/50 rounded">
                            <span className="text-gray-300 capitalize">{category.replace(/_/g, " ")}:</span>
                            <Badge
                              className={`${
                                score > 10
                                  ? "bg-red-500/20 text-red-400"
                                  : score > 5
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : "bg-green-500/20 text-green-400"
                              }`}
                            >
                              {score}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {results.privacyConcerns && results.privacyConcerns.length > 0 && (
                    <div className="space-y-3 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                      <h4 className="font-medium text-yellow-400 flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Privacy Concerns ({results.privacyConcerns.length})</span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {results.privacyConcerns.map((concern, index) => (
                          <Badge key={index} variant="outline" className="border-yellow-500/50 text-yellow-400">
                            {concern.toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {results.recommendations && results.recommendations.length > 0 && (
                    <div className="space-y-3 p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                      <h4 className="font-medium text-cyan-400 flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Security Recommendations</span>
                      </h4>
                      <div className="space-y-2">
                        {results.recommendations.map((recommendation, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-2 p-2 bg-cyan-500/10 rounded border-l-2 border-cyan-400"
                          >
                            <CheckCircle className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-white">{recommendation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {results.securityScan.meta && (
                    <div className="space-y-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                      <h4 className="font-medium text-cyan-400">Scan Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Scan Time:</span>
                          <span className="text-white">
                            {new Date(results.securityScan.meta.scan_time).toLocaleString()}
                          </span>
                        </div>
                        {results.securityScan.meta.sha256 && (
                          <div className="flex flex-col space-y-1">
                            <span className="text-gray-400">File SHA-256:</span>
                            <span className="text-white text-xs font-mono break-all bg-gray-900/50 p-2 rounded">
                              {results.securityScan.meta.sha256}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}

export default APKAnalyzer
