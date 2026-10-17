import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    if (!url || typeof url !== "string") return NextResponse.json({ error: "No URL", legitimacy_score: 0, classification: "ERROR" }, { status: 400 })
    const parsed = new URL(url)
    if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Only http:// and https:// URLs are supported")
    const imageResponse = await fetch(parsed, { headers: { "User-Agent": "MobiCure/2.0" }, signal: AbortSignal.timeout(10000) })
    if (!imageResponse.ok) throw new Error(`Image request failed (${imageResponse.status})`)
    const type = imageResponse.headers.get("content-type") || ""
    if (!type.startsWith("image/")) throw new Error("URL did not return an image")
    const form = new FormData()
    form.append("file", await imageResponse.blob(), `url-image.${type.split("/")[1].split(";")[0] || "jpg"}`)
    const scanResponse = await fetch("http://localhost:8004/scan", { method: "POST", body: form })
    return NextResponse.json(await scanResponse.json(), { status: scanResponse.status })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "URL scan failed", legitimacy_score: 0, classification: "ERROR", warnings: ["Could not fetch a scannable image"] }, { status: 500 })
  }
}
