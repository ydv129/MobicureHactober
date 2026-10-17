import { type NextRequest, NextResponse } from "next/server"
import { callPythonHandler } from "@/lib/services/python-handler"
import { execFile } from "child_process"
import net from "net"
import { promisify } from "util"

const execFileAsync = promisify(execFile)

interface NetworkScanRequest {
  network_range: string;
}

interface NetworkScanResult {
  error?: string;
  [key: string]: unknown;
}

async function pingHost(host: string) {
  try {
    await execFileAsync("ping", ["-c", "1", "-W", "1", host], { timeout: 2000 })
    return true
  } catch {
    return false
  }
}

function checkPort(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port })
    const finish = (open: boolean) => {
      socket.destroy()
      resolve(open)
    }
    socket.setTimeout(1000)
    socket.once("connect", () => finish(true))
    socket.once("timeout", () => finish(false))
    socket.once("error", () => finish(false))
  })
}

async function fallbackNetworkScan(networkRange: string | undefined) {
  const requestedHost = typeof networkRange === "string" ? networkRange.split("/")[0] : ""
  const host = /^[a-zA-Z0-9.-]+$/.test(requestedHost) ? requestedHost : "127.0.0.1"
  const ports = [22, 80, 443, 3000, 8001]
  const [reachable, portResults] = await Promise.all([
    pingHost(host),
    Promise.all(ports.map(async (port) => ({ port, open: await checkPort(host, port) }))),
  ])
  const openPorts = portResults.filter((result) => result.open).map((result) => result.port)
  return {
    network_range: networkRange || host,
    devices: [{ ip: host, reachable, open_ports: openPorts }],
    statistics: { total_devices: 1, reachable_devices: reachable ? 1 : 0 },
    analysis_source: "fallback-real-ping-port-check",
  }
}

export async function POST(request: NextRequest) {
  try {
    const { networkRange } = await request.json()

    try {
      const result = await callPythonHandler<NetworkScanRequest, NetworkScanResult>(
        'scripts/network_scanner_service.py',
        { network_range: networkRange }
      )

      if (!result) {
        return NextResponse.json(await fallbackNetworkScan(networkRange))
      }

      return NextResponse.json(result)
    } catch (pythonError) {
      console.error("Python network scanner error:", pythonError)
      return NextResponse.json(await fallbackNetworkScan(networkRange))
    }
  } catch (error) {
    console.error("Network scan request error:", error)
    return NextResponse.json(
      {
        error: "Request processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
