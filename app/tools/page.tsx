"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  Shield,
  Globe,
  Network,
  Mail,
  Key,
  Smartphone,
  ImageIcon,
  QrCode,
  Camera,
  Search,
  Sparkles,
  Cpu,
  Lock,
  Layers,
  ChevronRight,
  Terminal,
} from "lucide-react"

// Import all tool components
import URLThreatScanner from "@/features/url-threat/components/UrlThreatScanner"
import BrowserVulnerabilityScanner from "@/features/browser-scan/components/BrowserVulnerabilityScanner"
import NetworkPacketAnalyzer from "@/features/network/components/NetworkPacketAnalyzer"
import PhishingEmailDetector from "@/features/email-phishing/components/PhishingEmailDetector"
import PasswordStrengthChecker from "@/features/password/components/PasswordStrengthChecker"
import APKAnalyzer from "@/features/apk-analyzer/components/APKAnalyzer"
import ImageMetadataScanner from "@/features/image-forensics/components/ImageMetadataScanner"
import QRCodeGenerator from "@/features/qr-tools/components/QRGenerator"
import QRCodeScanner from "@/features/qr-tools/components/QRScanner"

const toolCategories = [
  {
    name: "Web Security",
    code: "WEB",
    tools: [
      {
        id: "url-threat-scanner",
        name: "URL Threat Scanner",
        icon: Globe,
        description: "Analyze URLs for phishing, malware, and security threats",
        tag: "Core",
      },
      {
        id: "browser-vulnerability-scanner",
        name: "Browser Vulnerability Scanner",
        icon: Shield,
        description: "Check browser versions for known security vulnerabilities",
        tag: "Audit",
      },
    ],
  },
  {
    name: "Network Analysis",
    code: "NET",
    tools: [
      {
        id: "network-packet-analyzer",
        name: "Network Packet Analyzer",
        icon: Network,
        description: "Capture and analyze network packets for threats",
        tag: "Deep",
      },
    ],
  },
  {
    name: "File Security",
    code: "FILE",
    tools: [
      {
        id: "apk-analyzer",
        name: "APK Analyzer",
        icon: Smartphone,
        description: "Analyze Android APK files for security risks",
        tag: "Mobile",
      },
      {
        id: "image-metadata-scanner",
        name: "Image scanner",
        icon: ImageIcon,
        description: "Extract and analyze image metadata for privacy risks",
        tag: "EXIF",
      },
    ],
  },
  {
    name: "Communication Security",
    code: "COMM",
    tools: [
      {
        id: "phishing-email-detector",
        name: "Phishing Email Detector",
        icon: Mail,
        description: "Detect phishing attempts in email content",
        tag: "Heuristic",
      },
    ],
  },
  {
    name: "Authentication & QR",
    code: "AUTH",
    tools: [
      {
        id: "password-strength-checker",
        name: "Password Strength Checker",
        icon: Key,
        description: "Evaluate password strength and entropy security",
        tag: "Entropy",
      },
      {
        id: "qr-code-generator",
        name: "QR Code Generator",
        icon: QrCode,
        description: "Generate secure QR codes with integrity checks",
        tag: "Crypto",
      },
      {
        id: "qr-code-scanner",
        name: "QR Code Scanner",
        icon: Camera,
        description: "Scan and analyze QR codes for security threats",
        tag: "Sandbox",
      },
    ],
  },
]

function ToolsPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialTool = searchParams.get("tool") || "url-threat-scanner"

  const [activeToolId, setActiveToolId] = useState<string>(initialTool)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const toolParam = searchParams.get("tool")
    if (toolParam) {
      setActiveToolId(toolParam)
    }
  }, [searchParams])

  const handleSelectTool = (id: string) => {
    setActiveToolId(id)
    router.replace(`/tools?tool=${id}`, { scroll: false })
  }

  const renderToolComponent = (toolId: string) => {
    switch (toolId) {
      case "url-threat-scanner":
        return <URLThreatScanner />
      case "browser-vulnerability-scanner":
        return <BrowserVulnerabilityScanner />
      case "network-packet-analyzer":
        return <NetworkPacketAnalyzer />
      case "phishing-email-detector":
        return <PhishingEmailDetector />
      case "password-strength-checker":
        return <PasswordStrengthChecker />
      case "apk-analyzer":
        return <APKAnalyzer />
      case "image-metadata-scanner":
        return <ImageMetadataScanner />
      case "qr-code-generator":
        return <QRCodeGenerator />
      case "qr-code-scanner":
        return <QRCodeScanner />
      default:
        return (
          <div className="p-8 text-center text-slate-400 font-mono">
            Tool selected not found.
          </div>
        )
    }
  }

  const allTools = toolCategories.flatMap((category) => category.tools)
  const activeTool = allTools.find((tool) => tool.id === activeToolId) || allTools[0]

  const filteredCategories = toolCategories
    .map((cat) => ({
      ...cat,
      tools: cat.tools.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((cat) => cat.tools.length > 0)

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col lg:flex-row bg-black">
      {/* Sidebar on Desktop / Mobile Nav Bar */}
      <aside className="w-full lg:w-84 xl:w-92 shrink-0 border-r border-cyan-500/25 bg-gradient-to-b from-slate-950/90 via-black/95 to-cyan-950/20 backdrop-blur-2xl flex flex-col">
        {/* Sidebar Header & Search */}
        <div className="p-5 border-b border-cyan-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-300 to-cyan-400">
                MOBICURE ARSENAL
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                9 ACTIVE FORENSIC MODULES
              </p>
            </div>
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-400/30 text-cyan-400">
              <Layers className="h-4 w-4" />
            </div>
          </div>

          {/* Real-time search filter */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools (URL, APK, QR)..."
              className="w-full bg-black/60 border border-cyan-500/25 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-cyan-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all"
            />
          </div>
        </div>

        {/* Tools Tree List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar max-h-[400px] lg:max-h-none">
          {filteredCategories.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-slate-500">
              NO TOOLS MATCHING "{searchQuery}"
            </div>
          ) : (
            filteredCategories.map((category) => (
              <div key={category.name} className="space-y-1.5">
                <div className="flex items-center justify-between px-2 text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  <span>{category.name}</span>
                  <span className="text-cyan-400/80">[{category.tools.length}]</span>
                </div>

                <div className="space-y-1">
                  {category.tools.map((tool) => {
                    const Icon = tool.icon
                    const isSelected = activeToolId === tool.id

                    return (
                      <button
                        key={tool.id}
                        onClick={() => handleSelectTool(tool.id)}
                        className={`w-full text-left p-3 rounded-xl transition-all duration-300 relative group flex items-start gap-3 cursor-pointer ${
                          isSelected
                            ? "bg-cyan-500/15 border border-cyan-400/60 shadow-[0_0_20px_rgba(34,211,238,0.25)] translate-x-1"
                            : "hover:bg-white/5 border border-transparent hover:border-cyan-500/20"
                        }`}
                      >
                        {/* Selected laser indicator stripe */}
                        {isSelected && (
                          <div className="absolute left-0 top-2 bottom-2 w-1 bg-cyan-400 rounded-r-full shadow-[0_0_8px_#00ffe7]" />
                        )}

                        <div
                          className={`p-2 rounded-lg shrink-0 transition-colors ${
                            isSelected
                              ? "bg-cyan-400/20 text-cyan-300 shadow-[0_0_10px_#00ffe7]"
                              : "bg-white/5 text-slate-400 group-hover:text-cyan-300"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={`text-xs font-mono font-bold truncate ${
                                isSelected ? "text-cyan-200" : "text-slate-200 group-hover:text-cyan-300"
                              }`}
                            >
                              {tool.name}
                            </span>
                            {tool.tag && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-black/60 border border-cyan-500/30 text-cyan-300 shrink-0 font-bold">
                                {tool.tag}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 font-sans">
                            {tool.description}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Forensic Working Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-black via-slate-950 to-black overflow-y-auto">
        {/* Executive Header Ribbon */}
        <header className="p-6 md:p-8 border-b border-cyan-500/20 bg-slate-950/60 backdrop-blur-xl">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                <activeTool.icon className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-2xl md:text-3xl font-black text-white font-[var(--font-heading)] tracking-tight">
                    {activeTool.name}
                  </h2>
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300">
                    ONLINE
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-1 max-w-xl font-sans">
                  {activeTool.description}
                </p>
              </div>
            </div>

            {/* Status Telemetry Pills */}
            <div className="flex flex-wrap sm:flex-col items-end gap-1.5 font-mono text-[11px] text-slate-400 shrink-0">
              <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-md border border-cyan-500/25">
                <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-cyan-200">ENGINE v2.4 PRO</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-md border border-cyan-500/25">
                <Lock className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-300">SANDBOX ISOLATED</span>
              </div>
            </div>
          </div>
        </header>

        {/* Tool Component Body with Glowing Cyber Frame */}
        <div className="flex-1 p-6 md:p-8">
          <div className="max-w-5xl mx-auto">
            <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-slate-950/80 via-black/90 to-cyan-950/20 backdrop-blur-2xl p-6 md:p-10 shadow-[0_15px_50px_-15px_rgba(34,211,238,0.2)]">
              {renderToolComponent(activeToolId)}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ToolsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center text-cyan-400 font-mono">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 animate-spin" />
            <span>INITIALIZING SECURITY ARSENAL MATRIX...</span>
          </div>
        </div>
      }
    >
      <ToolsPageContent />
    </Suspense>
  )
}
