"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Shield, ImageIcon, Upload, MapPin, Camera, Bot, Edit, Link, Lock, Zap, Eye, Fingerprint, Copy, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ScanResult {
  scan_id: string
  status: string
  timestamp: string
  image_hash: string
  file_info: {
    filename: string
    size_bytes: number
    format: string
    dimensions: [number, number]
    color_mode: string
  }
  forensics: {
    metadata_analysis: any
    image_stats: any
    ela_analysis: any
    noise_analysis: any
    edge_analysis: any
    color_analysis: any
    compression_analysis: any
    copy_move_detection: any
    ai_generation_detection: any
    clip_analysis: any
    face_forensics: any
  }
  verdict: {
    legitimacy_score: number
    warnings: Array<{
      category: string
      severity: string
      message: string
      confidence: number
    }>
    classification: string
  }
  recommendations: string[]
}

export default function ImageMetadataScanner() {
  const [file, setFile] = useState<File | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const scanImageMetadata = async () => {
    if (!file) return

    setIsScanning(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/tools/image-metadata-scanner", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Scan failed")
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      console.error("Error scanning image:", err)
      setError(err instanceof Error ? err.message : "Failed to scan image")
    } finally {
      setIsScanning(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "text-red-500 border-red-500 bg-red-500/10"
      case "high":
        return "text-orange-500 border-orange-500 bg-orange-500/10"
      case "medium":
        return "text-yellow-500 border-yellow-500 bg-yellow-500/10"
      case "low":
        return "text-blue-500 border-blue-500 bg-blue-500/10"
      default:
        return "text-green-500 border-green-500 bg-green-500/10"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    if (score >= 40) return "text-orange-500"
    return "text-red-500"
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div>
          <Label htmlFor="image-file">Image File</Label>
          <Input
            id="image-file"
            type="file"
            accept="image/*"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null)
              setResult(null)
              setError(null)
            }}
            className="cyber-input"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Supported: JPG, PNG, BMP, TIFF, WEBP (max 50MB)
          </p>
        </div>

        <Button onClick={scanImageMetadata} disabled={!file || isScanning} className="cyber-button">
          {isScanning ? (
            <>
              <ImageIcon className="w-4 h-4 mr-2 animate-spin" />
              Analyzing Image Forensics...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Scan Image
            </>
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <div className="space-y-4">
          <Card className="cyber-card border-2 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Forensic Analysis Results
                </span>
                <Badge variant="outline" className="text-xs">
                  Scan ID: {result.scan_id.slice(0, 8)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Legitimacy Score</span>
                  <span className={`text-2xl font-bold ${getScoreColor(result.verdict.legitimacy_score)}`}>
                    {result.verdict.legitimacy_score.toFixed(1)}%
                  </span>
                </div>
                <Progress value={result.verdict.legitimacy_score} className="h-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Classification: {result.verdict.classification}</span>
                  <span>{new Date(result.timestamp).toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <div className="text-xs text-muted-foreground">File Name</div>
                  <div className="font-medium text-sm truncate">{result.file_info.filename}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Size</div>
                  <div className="font-medium text-sm">{(result.file_info.size_bytes / 1024 / 1024).toFixed(2)} MB</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Format</div>
                  <div className="font-medium text-sm">{result.file_info.format.toUpperCase()}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Dimensions</div>
                  <div className="font-medium text-sm">{result.file_info.dimensions[0]} × {result.file_info.dimensions[1]}</div>
                </div>
              </div>

              {result.verdict.warnings.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    Detected Issues ({result.verdict.warnings.length})
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {result.verdict.warnings.map((warning, idx) => (
                      <div key={idx} className={`p-3 rounded-lg border ${getSeverityColor(warning.severity)}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{warning.category}</div>
                            <div className="text-xs mt-1 opacity-90">{warning.message}</div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant="outline" className="text-xs">
                              {warning.severity}
                            </Badge>
                            <span className="text-xs opacity-70">{(warning.confidence * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="metadata" className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
              <TabsTrigger value="ai">AI Detection</TabsTrigger>
              <TabsTrigger value="forensics">Forensics</TabsTrigger>
              <TabsTrigger value="noise">Noise</TabsTrigger>
              <TabsTrigger value="compression">Compression</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="metadata" className="space-y-4">
              <Card className="cyber-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    EXIF Metadata
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.forensics.metadata_analysis && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Total Fields</div>
                          <div className="font-medium">{result.forensics.metadata_analysis.total_fields || 0}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Has Camera Info</div>
                          <div className="flex items-center gap-1">
                            {result.forensics.metadata_analysis.has_camera_info ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className="font-medium">
                              {result.forensics.metadata_analysis.has_camera_info ? "Yes" : "No"}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Has GPS</div>
                          <div className="flex items-center gap-1">
                            {result.forensics.metadata_analysis.has_gps ? (
                              <MapPin className="w-4 h-4 text-orange-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-gray-500" />
                            )}
                            <span className="font-medium">
                              {result.forensics.metadata_analysis.has_gps ? "Yes" : "No"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {result.forensics.metadata_analysis.software_detected?.length > 0 && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-2">Editing Software Detected</div>
                          <div className="flex flex-wrap gap-2">
                            {result.forensics.metadata_analysis.software_detected.map((software: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                                <Edit className="w-3 h-3" />
                                {software}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {result.forensics.metadata_analysis.suspicious_fields?.length > 0 && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <div className="font-medium mb-1">Suspicious Fields Detected:</div>
                            <ul className="text-xs space-y-1">
                              {result.forensics.metadata_analysis.suspicious_fields.map((field: string, idx: number) => (
                                <li key={idx}>• {field}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}

                      {result.forensics.metadata_analysis.inconsistencies?.length > 0 && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <div className="font-medium mb-1">Metadata Inconsistencies:</div>
                            <ul className="text-xs space-y-1">
                              {result.forensics.metadata_analysis.inconsistencies.map((item: string, idx: number) => (
                                <li key={idx}>• {item}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai" className="space-y-4">
              <Card className="cyber-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    AI Generation Detection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.forensics.ai_generation_detection && (
                    <>
                      <div className={`p-4 rounded-lg border-2 ${
                        result.forensics.ai_generation_detection.is_likely_ai_generated
                          ? "border-orange-500 bg-orange-500/10"
                          : "border-green-500 bg-green-500/10"
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-lg">
                            {result.forensics.ai_generation_detection.is_likely_ai_generated ? "AI Generated" : "Likely Authentic"}
                          </span>
                          <Badge variant="outline" className="text-sm">
                            Confidence: {(result.forensics.ai_generation_detection.confidence * 100).toFixed(1)}%
                          </Badge>
                        </div>
                        <Progress value={result.forensics.ai_generation_detection.ai_probability * 100} className="h-2 mb-3" />
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">AI Indicators:</span>
                            <span className="font-medium ml-2">{result.forensics.ai_generation_detection.ai_indicators}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">AI Probability:</span>
                            <span className="font-medium ml-2">{(result.forensics.ai_generation_detection.ai_probability * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>

                      {result.forensics.ai_generation_detection.details?.length > 0 && (
                        <div>
                          <div className="text-sm font-medium mb-2">Detection Details:</div>
                          <div className="space-y-1">
                            {result.forensics.ai_generation_detection.details.map((detail: string, idx: number) => (
                              <div key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                {detail}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-muted/50 rounded-lg text-sm">
                        <div>
                          <div className="text-xs text-muted-foreground">Texture Uniformity</div>
                          <div className="font-medium">{result.forensics.ai_generation_detection.texture_uniformity?.toFixed(4)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Frequency Smoothness</div>
                          <div className="font-medium">{result.forensics.ai_generation_detection.frequency_smoothness?.toFixed(4)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Color Gradient Var</div>
                          <div className="font-medium">{result.forensics.ai_generation_detection.color_gradient_variance?.toFixed(4)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Saturation Entropy</div>
                          <div className="font-medium">{result.forensics.ai_generation_detection.saturation_entropy?.toFixed(4)}</div>
                        </div>
                      </div>
                    </>
                  )}

                  {result.forensics.clip_analysis && result.forensics.clip_analysis.classifications && (
                    <div className="mt-4">
                      <div className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        CLIP Vision Analysis
                      </div>
                      <div className="space-y-2">
                        {result.forensics.clip_analysis.classifications.slice(0, 5).map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                            <span className="text-sm">{item.label}</span>
                            <div className="flex items-center gap-2">
                              <Progress value={item.score * 100} className="w-20 h-2" />
                              <span className="text-xs font-medium w-12">{(item.score * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="forensics" className="space-y-4">
              <Card className="cyber-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Fingerprint className="w-5 h-5" />
                    Error Level Analysis (ELA)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result.forensics.ela_analysis && (
                    <div className="space-y-4">
                      <div className={`p-4 rounded-lg border ${
                        result.forensics.ela_analysis.anomaly_detected
                          ? "border-orange-500 bg-orange-500/10"
                          : "border-green-500 bg-green-500/10"
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">
                            {result.forensics.ela_analysis.anomaly_detected ? "Anomaly Detected" : "No Anomaly"}
                          </span>
                          <Badge variant="outline">
                            Confidence: {(result.forensics.ela_analysis.confidence * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div className="p-3 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground">ELA Mean</div>
                          <div className="font-medium">{result.forensics.ela_analysis.ela_mean?.toFixed(4)}</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground">ELA Std Dev</div>
                          <div className="font-medium">{result.forensics.ela_analysis.ela_std?.toFixed(4)}</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground">Block Variance</div>
                          <div className="font-medium">{result.forensics.ela_analysis.block_variance?.toFixed(4)}</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground">Outlier Ratio</div>
                          <div className="font-medium">{result.forensics.ela_analysis.outlier_ratio?.toFixed(4)}</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground">Quality Consistency</div>
                          <div className="font-medium">{result.forensics.ela_analysis.quality_consistency?.toFixed(4)}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="cyber-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Copy className="w-5 h-5" />
                    Copy-Move Detection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result.forensics.copy_move_detection && (
                    <div className="space-y-4">
                      <div className={`p-4 rounded-lg border ${
                        result.forensics.copy_move_detection.copy_move_suspected
                          ? "border-red-500 bg-red-500/10"
                          : "border-green-500 bg-green-500/10"
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {result.forensics.copy_move_detection.copy_move_suspected ? "Copy-Move Suspected" : "No Copy-Move Detected"}
                          </span>
                          {result.forensics.copy_move_detection.copy_move_suspected && (
                            <Badge variant="outline">
                              Confidence: {(result.forensics.copy_move_detection.confidence * 100).toFixed(0)}%
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="p-3 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground">Blocks Analyzed</div>
                          <div className="font-medium">{result.forensics.copy_move_detection.blocks_analyzed}</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground">Similar Pairs</div>
                          <div className="font-medium">{result.forensics.copy_move_detection.similar_block_pairs}</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground">Max Cluster Size</div>
                          <div className="font-medium">{result.forensics.copy_move_detection.max_cluster_size}</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground">Similarity Ratio</div>
                          <div className="font-medium">{result.forensics.copy_move_detection.similarity_ratio?.toFixed(6)}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {result.forensics.edge_analysis && (
                <Card className="cyber-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Edge Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.forensics.edge_analysis.unnatural_edges && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Unnatural edge patterns detected - possible manipulation
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div className="p-3 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground">Edge Mean</div>
                          <div className="font-medium">{result.forensics.edge_analysis.edge_mean?.toFixed(4)}</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground">Direction Entropy</div>
                          <div className="font-medium">{result.forensics.edge_analysis.direction_entropy?.toFixed(4)}</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground">Sharp Edge Ratio</div>
                          <div className="font-medium">{result.forensics.edge_analysis.sharp_edge_ratio?.toFixed(6)}</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground">Discontinuity Score</div>
                          <div className="font-medium">{result.forensics.edge_analysis.discontinuity_score?.toFixed(6)}</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground">Laplacian Variance</div>
                          <div className="font-medium">{result.forensics.edge_analysis.laplacian_variance?.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="noise" className="space-y-4">
              <Card className="cyber-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Noise Pattern Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result.forensics.noise_analysis && (
                    <div className="space-y-4">
                      {result.forensics.noise_analysis.synthetic_pattern_detected && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Synthetic noise patterns detected - indicates AI generation or heavy processing
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="p-3 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground">Noise Mean</div>
                          <div className="font-medium">{result.forensics.noise_analysis.noise_mean?.toFixed(4)}</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground">Noise Std Dev</div>
                          <div className="font-medium">{result.forensics.noise_analysis.noise_std?.toFixed(4)}</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground">Channel Variance</div>
                          <div className="font-medium">{result.forensics.noise_analysis.channel_variance?.toFixed(4)}</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground">Noise Correlation</div>
                          <div className="font-medium">{result.forensics.noise_analysis.noise_correlation?.toFixed(4)}</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground">Noise Consistency</div>
                          <div className="font-medium">{result.forensics.noise_analysis.noise_consistency?.toFixed(4)}</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground">Periodicity Ratio</div>
                          <div className="font-medium">{result.forensics.noise_analysis.periodicity_ratio?.toFixed(6)}</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground">Synthetic Indicators</div>
                          <div className="font-medium">{result.forensics.noise_analysis.synthetic_indicators}</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground">Noise Uniform</div>
                          <div className="font-medium">{result.forensics.noise_analysis.noise_uniform ? "Yes" : "No"}</div>
                        </div>
                      </div>

                      {result.forensics.noise_analysis.channel_noise_std && (
                        <div>
                          <div className="text-sm font-medium mb-2">Channel Noise Distribution:</div>
                          <div className="flex gap-2">
                            {result.forensics.noise_analysis.channel_noise_std.map((std: number, idx: number) => (
                              <div key={idx} className="flex-1 p-2 bg-muted/50 rounded text-center">
                                <div className="text-xs text-muted-foreground">{["Red", "Green", "Blue"][idx]}</div>
                                <div className="font-medium text-sm">{std.toFixed(4)}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compression" className="space-y-4">
              <Card className="cyber-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Compression Artifact Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result.forensics.compression_analysis && (
                    <div className="space-y-4">
                      {result.forensics.compression_analysis.double_compression_detected && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Double compression detected - image has been saved multiple times
                          </AlertDescription>
                        </Alert>
                      )}

                      {result.forensics.compression_analysis.compression_anomaly && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Compression anomalies detected - inconsistent quality across regions
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div className="p-3 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground">Format</div>
                          <div className="font-medium uppercase">{result.forensics.compression_analysis.format}</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground">Quality Estimate</div>
                          <div className="font-medium">{result.forensics.compression_analysis.quality_estimate}</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground">Blocking Ratio</div>
                          <div className="font-medium">{result.forensics.compression_analysis.blocking_ratio?.toFixed(4)}</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground">Boundary Artifact Mean</div>
                          <div className="font-medium">{result.forensics.compression_analysis.boundary_artifact_mean?.toFixed(4)}</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground">Blocking Variance</div>
                          <div className="font-medium">{result.forensics.compression_analysis.blocking_variance?.toFixed(4)}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {result.forensics.color_analysis && (
                <Card className="cyber-card">
                  <CardHeader>
                    <CardTitle>Color Distribution Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.forensics.color_analysis.histogram_anomaly && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Histogram anomalies detected - unusual color distribution
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div className="p-3 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground">Channel Correlation</div>
                          <div className="font-medium">{result.forensics.color_analysis.channel_correlation?.toFixed(4)}</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground">Saturation Mean</div>
                          <div className="font-medium">{result.forensics.color_analysis.saturation_mean?.toFixed(4)}</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground">Benford Deviation</div>
                          <div className="font-medium">{result.forensics.color_analysis.benford_deviation?.toFixed(4)}</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground">Clipped Shadows</div>
                          <div className="font-medium">{result.forensics.color_analysis.clipped_shadows?.toFixed(6)}</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground">Clipped Highlights</div>
                          <div className="font-medium">{result.forensics.color_analysis.clipped_highlights?.toFixed(6)}</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground">Color Smoothness</div>
                          <div className="font-medium">{result.forensics.color_analysis.color_smoothness?.toFixed(4)}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              {result.forensics.face_forensics && (
                <Card className="cyber-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Face Forensics Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.forensics.face_forensics.face_manipulation_suspected && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Face manipulation detected - possible deepfake or face swap
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="p-3 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground">Faces Detected</div>
                          <div className="font-medium">{result.forensics.face_forensics.faces_analyzed || 0}</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground">Manipulation Score</div>
                          <div className="font-medium">{(result.forensics.face_forensics.manipulation_score * 100).toFixed(1)}%</div>
                        </div>
                      </div>

                      {result.forensics.face_forensics.details && result.forensics.face_forensics.details.length > 0 && (
                        <div>
                          <div className="text-sm font-medium mb-2">Analysis Details:</div>
                          <div className="space-y-1">
                            {result.forensics.face_forensics.details.map((detail: string, idx: number) => (
                              <div key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                {detail}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {result.forensics.image_stats && (
                <Card className="cyber-card">
                  <CardHeader>
                    <CardTitle>Image Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div className="p-3 bg-muted/50 rounded">
                        <div className="text-xs text-muted-foreground">Brightness</div>
                        <div className="font-medium">{result.forensics.image_stats.brightness?.toFixed(2)}</div>
                      </div>
                      <div className="p-3 bg-muted/50 rounded">
                        <div className="text-xs text-muted-foreground">Contrast</div>
                        <div className="font-medium">{result.forensics.image_stats.contrast?.toFixed(2)}</div>
                      </div>
                      <div className="p-3 bg-muted/50 rounded">
                        <div className="text-xs text-muted-foreground">Gradient Strength</div>
                        <div className="font-medium">{result.forensics.image_stats.gradient_strength?.toFixed(2)}</div>
                      </div>
                      <div className="p-3 bg-muted/50 rounded">
                        <div className="text-xs text-muted-foreground">Edge Density</div>
                        <div className="font-medium">{result.forensics.image_stats.edge_density?.toFixed(4)}</div>
                      </div>
                      <div className="p-3 bg-muted/50 rounded">
                        <div className="text-xs text-muted-foreground">Texture Complexity</div>
                        <div className="font-medium">{result.forensics.image_stats.texture_complexity?.toFixed(2)}</div>
                      </div>
                      <div className="p-3 bg-muted/50 rounded">
                        <div className="text-xs text-muted-foreground">Avg Saturation</div>
                        <div className="font-medium">{result.forensics.image_stats.avg_saturation?.toFixed(4)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="cyber-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
