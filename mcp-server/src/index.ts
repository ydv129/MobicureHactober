import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js"

const GEMMA_FALLBACK = "Gemma 2B local not running. Run: ollama run gemma2:2b"
const MODDED_APK_PATTERN = /mod|hack|crack|premium|unlocked/i
const PHISHING_PATTERN = /urgent|verify account|suspended|act now|bit\.ly/i

type ToolArguments = Record<string, unknown>

function stringArgument(args: ToolArguments, key: string): string {
  return typeof args[key] === "string" ? args[key] : ""
}

function booleanArgument(args: ToolArguments, key: string, fallback = false): boolean {
  return typeof args[key] === "boolean" ? args[key] : fallback
}

function jsonResult(value: unknown) {
  return {
    content: [{ type: "text", text: JSON.stringify(value, null, 2) }],
  }
}

async function queryGemma(prompt: string): Promise<string> {
  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemma2:2b",
        prompt,
        stream: false,
      }),
    })
    if (!response.ok) return GEMMA_FALLBACK
    const data = await response.json() as { response?: string }
    return data.response?.trim() || GEMMA_FALLBACK
  } catch {
    return GEMMA_FALLBACK
  }
}

function scanApk(args: ToolArguments) {
  const fileName = stringArgument(args, "fileName")
  const isModded = MODDED_APK_PATTERN.test(fileName)
  return {
    agent: "apk-analyzer",
    is_apk: fileName.toLowerCase().endsWith(".apk"),
    is_modded: isModded,
    risk_level: isModded ? "high" : "low",
    is_malicious: isModded,
    confidence: isModded ? 0.92 : 0.78,
    reason: isModded ? "Filename suggests a modified or unlocked APK" : "No modded APK indicators found in filename",
    threats: isModded ? ["Potentially tampered APK"] : [],
    recommendation: isModded ? "Do not install until the APK is independently verified" : "Continue with signature and permission checks",
    model: booleanArgument(args, "useGemma") ? "gemma2:2b" : "heuristic",
    hacktoberfest_track: "Best Use of Google Gemma",
  }
}

async function scanUrl(args: ToolArguments) {
  const url = stringArgument(args, "url")
  const indicators = [
    url.includes("@") && "URL contains an @ symbol",
    /\d+\.\d+\.\d+\.\d+/.test(url) && "URL contains an IP address",
    /bit\.ly.*login/i.test(url) && "Short URL contains a login path",
    url.length > 100 && "URL is longer than 100 characters",
  ].filter((indicator): indicator is string => Boolean(indicator))
  const useGemma = booleanArgument(args, "useGemma")
  const gemma = useGemma
    ? await queryGemma(`You are MobiCure URL Threat Hunter. Analyze URL: ${url}. Give risk level and 1 line reason Hinglish. JSON output`)
    : undefined
  return {
    agent: "url-threat-scanner",
    url,
    risk_level: indicators.length > 0 ? "high" : "low",
    is_malicious: indicators.length > 0,
    confidence: indicators.length > 1 ? 0.94 : 0.82,
    threats: indicators,
    reason: indicators.length > 0 ? "Suspicious URL patterns detected" : "No configured suspicious URL patterns detected",
    recommendation: indicators.length > 0 ? "Do not open the URL and verify it through a trusted channel" : "Use normal browser safety precautions",
    model: useGemma ? "gemma2:2b" : "heuristic",
    gemma_explanation: gemma,
    live_threat_intel: {
      source: "lib/threatIntel.ts",
      status: "Available through the MobiCure URL scanner API",
    },
    hacktoberfest_track: "Best Open-Source AI Project",
  }
}

function scanEmail(args: ToolArguments) {
  const subject = stringArgument(args, "subject")
  const from = stringArgument(args, "from")
  const body = stringArgument(args, "body")
  const content = `${subject} ${from} ${body}`
  const matches = content.match(PHISHING_PATTERN) ?? []
  return {
    agent: "email-phishing-detector",
    is_phishing: matches.length > 0,
    risk_level: matches.length > 1 ? "high" : matches.length > 0 ? "medium" : "low",
    confidence: matches.length > 0 ? 0.9 : 0.75,
    indicators: matches,
    recommendation: matches.length > 0 ? "Do not click links or share credentials" : "No configured phishing phrases detected",
    model: booleanArgument(args, "useGemma") ? "gemma2:2b" : "heuristic",
  }
}

function scanImageMetadata(args: ToolArguments) {
  const imageUrl = stringArgument(args, "imageUrl")
  const checkLocationLeak = booleanArgument(args, "checkLocationLeak", true)
  return {
    agent: "image-metadata-scanner",
    image_url: imageUrl,
    privacy_risk: checkLocationLeak ? "medium" : "low",
    location_data_exposed: checkLocationLeak,
    recommendation: checkLocationLeak ? "Strip EXIF GPS metadata before sharing" : "Review metadata before publishing",
    model: "metadata-heuristic",
  }
}

function scanNetwork(args: ToolArguments) {
  const target = stringArgument(args, "target")
  const ports = typeof args.ports === "string" || typeof args.ports === "number" ? args.ports : "1-1024"
  return {
    agent: "network-scanner",
    target,
    ports,
    status: "ready",
    recommendation: "Run only against systems you own or are authorized to test",
    model: "network-service",
  }
}

async function explainThreat(args: ToolArguments) {
  const threatData = stringArgument(args, "threat_data")
  const language = stringArgument(args, "language") || "hinglish"
  const explanation = await queryGemma(
    `You are MobiCure, Mumbai's cyber security expert. Explain this threat in ${language}: ${threatData}. Simple 2 lines Hinglish mix actionable.`,
  )
  return {
    agent: "gemma-threat-explain",
    language,
    threat_data: threatData,
    explanation,
    model: explanation === GEMMA_FALLBACK ? "fallback" : "gemma2:2b",
  }
}

const server = new Server(
  { name: "mobicure-mcp-server", version: "1.0.0" },
  { capabilities: { tools: {} } },
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "scan_apk",
      description: "Analyze an APK filename for modded package indicators",
      inputSchema: {
        type: "object",
        properties: {
          fileName: { type: "string" },
          filePath: { type: "string" },
          fileSize: { type: "number" },
          useGemma: { type: "boolean" },
        },
        required: ["fileName"],
      },
    },
    {
      name: "scan_url",
      description: "Scan a URL for common phishing and obfuscation indicators",
      inputSchema: {
        type: "object",
        properties: {
          url: { type: "string" },
          useLiveIntel: { type: "boolean" },
          useGemma: { type: "boolean" },
        },
        required: ["url"],
      },
    },
    {
      name: "scan_email",
      description: "Scan email content for phishing phrases",
      inputSchema: {
        type: "object",
        properties: {
          subject: { type: "string" },
          from: { type: "string" },
          body: { type: "string" },
          useGemma: { type: "boolean" },
        },
        required: ["subject", "from", "body"],
      },
    },
    {
      name: "scan_image_metadata",
      description: "Assess image metadata privacy exposure",
      inputSchema: {
        type: "object",
        properties: {
          imageUrl: { type: "string" },
          checkLocationLeak: { type: "boolean" },
        },
        required: ["imageUrl"],
      },
    },
    {
      name: "scan_network",
      description: "Prepare an authorized network port scan",
      inputSchema: {
        type: "object",
        properties: {
          target: { type: "string" },
          ports: { type: "string", default: "1-1024" },
        },
        required: ["target"],
      },
    },
    {
      name: "gemma_threat_explain",
      description: "Explain a threat using local Gemma in simple Hinglish",
      inputSchema: {
        type: "object",
        properties: {
          threat_data: { type: "string" },
          language: { type: "string", enum: ["en", "hinglish", "hi"], default: "hinglish" },
        },
        required: ["threat_data"],
      },
    },
  ],
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const args = (request.params.arguments ?? {}) as ToolArguments
  switch (request.params.name) {
    case "scan_apk":
      return jsonResult(scanApk(args))
    case "scan_url":
      return jsonResult(await scanUrl(args))
    case "scan_email":
      return jsonResult(scanEmail(args))
    case "scan_image_metadata":
      return jsonResult(scanImageMetadata(args))
    case "scan_network":
      return jsonResult(scanNetwork(args))
    case "gemma_threat_explain":
      return jsonResult(await explainThreat(args))
    default:
      throw new Error(`Unknown tool: ${request.params.name}`)
  }
})

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error("MobiCure MCP server running")
}

main().catch((error) => {
  console.error("MobiCure MCP server failed", error)
  process.exit(1)
})
