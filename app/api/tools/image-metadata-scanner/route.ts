import { type NextRequest, NextResponse } from "next/server"

const IMAGE_SCANNER_SERVICE_URL = "http://localhost:8004/api/scan"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 })
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 413 })
    }

    const scanForm = new FormData()
    scanForm.append("file", file, file.name)
    const response = await fetch(IMAGE_SCANNER_SERVICE_URL, {
      method: "POST",
      body: scanForm,
      signal: AbortSignal.timeout(30000),
    })
    const rawResponse = await response.json() as Record<string, unknown>
    if (!response.ok) {
      return NextResponse.json(
        { error: "Image scan failed", details: rawResponse },
        { status: response.status },
      )
    }

    const r = (rawResponse.results as Record<string, unknown> | undefined) ?? rawResponse
    const fileInfo = (r.file_info ?? {}) as Record<string, unknown>
    const analysis = (r.analysis ?? {}) as Record<string, unknown>
    const findings: unknown[] = Array.isArray(r.findings) ? r.findings : []
    const adapted = {
      scan_id: r.scan_id,
      status: "completed",
      timestamp: r.created_at,
      image_hash: r.file_hash,
      file_info: {
        filename: r.filename,
        size_bytes: r.file_size,
        format: fileInfo.format,
        dimensions: [fileInfo.width, fileInfo.height],
        color_mode: fileInfo.mode,
      },
      forensics: {
        metadata_analysis: analysis.metadata,
        image_stats: analysis.image_stats,
        ela_analysis: analysis.error_level_analysis,
        noise_analysis: analysis.noise_analysis,
        edge_analysis: analysis.edge_analysis,
        color_analysis: analysis.color_analysis,
        compression_analysis: analysis.compression_analysis,
        copy_move_detection: analysis.clone_detection,
        ai_generation_detection: analysis.ai_detection,
        clip_analysis: analysis.clip_forensics,
        face_forensics: analysis.face_forensics,
      },
      verdict: {
        legitimacy_score: r.legitimacy_score,
        classification: r.classification,
        warnings: findings.map((finding) => {
          const item = finding as Record<string, unknown>
          return {
            category: item.category,
            severity: item.severity,
            message: item.description,
            confidence: item.confidence,
          }
        }),
      },
      recommendations: [
        r.is_likely_real ? "Image appears authentic" : "Verify source",
      ],
    }
    return NextResponse.json(adapted)
  } catch (error) {
    return NextResponse.json(
      { error: "Image scanner service unavailable", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 503 },
    )
  }
}
