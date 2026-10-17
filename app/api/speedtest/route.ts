import { NextResponse } from "next/server"

// High-speed speedtest payload endpoint for accurate bandwidth and latency measurement
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sizeKb = Math.min(2048, Math.max(10, parseInt(searchParams.get("size") || "500", 10)))
  
  // Generate binary buffer payload
  const buffer = new Uint8Array(sizeKb * 1024)
  for (let i = 0; i < buffer.length; i += 64) {
    buffer[i] = i % 256
  }

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": buffer.length.toString(),
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  })
}

export async function POST(request: Request) {
  try {
    const blob = await request.blob()
    return NextResponse.json(
      { success: true, bytesReceived: blob.size },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache",
        },
      }
    )
  } catch {
    return NextResponse.json({ success: false }, { status: 400 })
  }
}

export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, no-cache",
    },
  })
}
