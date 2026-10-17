import { NextRequest, NextResponse } from "next/server"
import { config } from "../../../lib/config"
import { forwardMultipart } from "../../../lib/services/python-handler"

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData()
    const file = form.get("file") as File | null
    if (!file) return NextResponse.json({ error: "No APK file", analysis_mode: "failed", retryable: false }, { status: 400 })
    if (!file.name.toLowerCase().endsWith(".apk")) return NextResponse.json({ error: "Only .apk files are supported", analysis_mode: "failed", retryable: false }, { status: 400 })
    const forwarded = new FormData()
    forwarded.append("file", file, file.name.replace(/[^a-zA-Z0-9._-]/g, "_"))
    return NextResponse.json(await forwardMultipart(config.apkAnalyzerUrl, "/scan", forwarded), { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message === "fetch failed" ? "APK analyzer service unavailable" : error.message || "APK scan failed", analysis_mode: "failed", retryable: true }, { status: 503 })
  }
}
