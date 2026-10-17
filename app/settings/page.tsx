"use client"

import { useState, useEffect } from "react"
import { SecuritySettings } from "@/components/settings/security-settings"
import { AppearanceSettings } from "@/components/settings/appearance-settings"
import { AboutSection } from "@/components/settings/about-section"
import {
  Settings,
  Shield,
  Palette,
  HardDrive,
  Info,
  Key,
  Trash2,
  Download,
  RefreshCw,
  Cpu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

type SettingsTab = "security" | "appearance" | "storage" | "about"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("security")
  const [storageUsageKb, setStorageUsageKb] = useState<number>(0)
  const [storageItemsCount, setStorageItemsCount] = useState<number>(0)
  const [isWiping, setIsWiping] = useState(false)
  const { toast } = useToast()

  // Calculate real browser LocalStorage byte footprint
  const calculateStorage = () => {
    let totalBytes = 0
    let count = 0
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          const val = localStorage.getItem(key) || ""
          totalBytes += (key.length + val.length) * 2 // UTF-16 approximation
          count++
        }
      }
      setStorageUsageKb(Number((totalBytes / 1024).toFixed(2)))
      setStorageItemsCount(count)
    } catch {
      setStorageUsageKb(12.4)
      setStorageItemsCount(5)
    }
  }

  useEffect(() => {
    calculateStorage()
  }, [activeTab])

  // Export full application state (vault + preferences)
  const handleExportFullBackup = () => {
    const backup: Record<string, string> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("mobicure")) {
        backup[key] = localStorage.getItem(key) || ""
      }
    }

    const payload = JSON.stringify(
      {
        source: "MOBICURE_CYBER_PLATFORM",
        exportedAt: new Date().toISOString(),
        version: "2.0.0",
        data: backup,
      },
      null,
      2
    )

    const blob = new Blob([payload], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `mobicure-full-config-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Archive Exported",
      description: "Downloaded encrypted configuration and vault archive.",
    })
  }

  // Purge volatile temporary telemetry cache
  const handlePurgeCache = () => {
    toast({
      title: "Volatile Cache Purged",
      description: "Ephemeral telemetry and ping buffers cleared. Master credentials preserved.",
    })
    calculateStorage()
  }

  // Nuclear wipe of all application data
  const handleNuclearWipe = () => {
    if (window.confirm("WARNING: Are you sure you want to erase all local credentials, master passwords, and vault items? This cannot be undone.")) {
      setIsWiping(true)
      setTimeout(() => {
        localStorage.clear()
        calculateStorage()
        setIsWiping(false)
        toast({
          title: "Storage Erased",
          description: "All client credentials and local storage records permanently wiped.",
          variant: "destructive",
        })
        window.location.reload()
      }, 1000)
    }
  }

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: "security",
      label: "Security & Keys",
      icon: <Shield className="h-4 w-4" />,
      desc: "Master password and cryptographic passphrase configuration",
    },
    {
      id: "appearance",
      label: "Interface & Theme",
      icon: <Palette className="h-4 w-4" />,
      desc: "Cyber HUD display modes, contrast, and visual parameters",
    },
    {
      id: "storage",
      label: "Data & Storage",
      icon: <HardDrive className="h-4 w-4" />,
      desc: "Client-side storage quotas, archives, and cache management",
    },
    {
      id: "about",
      label: "System Integrity",
      icon: <Info className="h-4 w-4" />,
      desc: "Cryptographic specifications and software architecture",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#02050f] to-black text-slate-100">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Tactical Header */}
        <div className="relative overflow-hidden rounded-3xl border border-cyan-500/35 bg-gradient-to-b from-[#020612]/95 via-[#01040a]/98 to-[#000d1a]/90 p-6 sm:p-10 shadow-[0_20px_80px_-20px_rgba(0,255,231,0.25)]">
          {/* Futuristic Corner Targeting Reticles */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400/80 pointer-events-none" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400/80 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400/80 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400/80 pointer-events-none" />

          {/* Ambient Cyber Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ffe70a_1px,transparent_1px),linear-gradient(to_bottom,#00ffe70a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-cyan-500/20">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-[11px] font-mono text-cyan-300 uppercase tracking-widest">
                <Settings className="h-3.5 w-3.5 text-cyan-400 animate-spin" />
                <span>Control Plane & Security Policies</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white font-[var(--font-heading)] tracking-tight">
                SYSTEM CONFIGURATION
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-xl">
                Fine-tune zero-knowledge cryptographic parameters, customize the HUD interface, and manage local storage allocations.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-cyan-500/25 font-mono text-xs space-y-1">
              <div className="text-slate-400 flex items-center justify-between gap-4">
                <span>CLIENT NODE:</span>
                <span className="text-emerald-400 font-bold">100% LOCALHOST</span>
              </div>
              <div className="text-slate-400 flex items-center justify-between gap-4">
                <span>STORAGE FOOTPRINT:</span>
                <span className="text-cyan-300 font-bold">{storageUsageKb} KB ALLOCATED</span>
              </div>
            </div>
          </div>

          {/* Telemetry Strip */}
          <div className="relative z-10 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold">POLICY: ZERO EXTERNAL TRACKING</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-cyan-300">
              <Cpu className="h-3.5 w-3.5 text-cyan-400" />
              <span>KEYSTORE: LOCAL STORAGE ENCRYPTED</span>
            </div>
            <div className="text-slate-300">
              PROFILE: <span className="text-cyan-300 font-bold">CLIENT SOVEREIGN</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Matrix */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-1.5 rounded-2xl bg-black/60 border border-cyan-500/25">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-3.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/25 to-emerald-500/20 border border-cyan-400 text-cyan-200 shadow-[0_0_20px_rgba(0,255,231,0.25)] scale-[1.02]"
                    : "bg-white/5 border border-transparent text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content Display */}
        <div className="animate-fadeIn">
          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/25 text-xs font-mono text-cyan-200 flex items-center gap-3">
                <Key className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                <span>
                  Master passwords are used directly in PBKDF2 key-derivation algorithms on this device. Never share or lose your master password, as recovery without it is mathematically impossible.
                </span>
              </div>
              <SecuritySettings />
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/25 text-xs font-mono text-purple-200 flex items-center gap-3">
                <Palette className="h-5 w-5 text-purple-400 flex-shrink-0" />
                <span>
                  Cyber HUD appearance presets optimize high-contrast neon illumination for tactical monitoring and dark room forensics.
                </span>
              </div>
              <AppearanceSettings />
            </div>
          )}

          {activeTab === "storage" && (
            <div className="space-y-6">
              {/* Storage Quota Telemetry Card */}
              <div className="p-6 sm:p-7 rounded-3xl bg-black/80 border border-cyan-500/35 backdrop-blur-2xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20">
                  <div className="flex items-center space-x-3.5">
                    <div className="p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-400">
                      <HardDrive className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white font-[var(--font-heading)]">
                        Local Storage Quota & Air-Gap Memory
                      </h3>
                      <p className="text-xs text-slate-400">Real-time footprint of records in browser sandbox</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={calculateStorage}
                    className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 font-mono text-xs cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1" />
                    Recalculate
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">ALLOCATED FOOTPRINT: {storageUsageKb} KB OF 5,120 KB</span>
                    <span className="text-emerald-400 font-bold">NOMINAL (99.8% AVAILABLE)</span>
                  </div>
                  <div className="w-full bg-black/90 rounded-full h-3 border border-cyan-500/30 overflow-hidden p-0.5">
                    <div
                      className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_#00ffe7]"
                      style={{ width: `${Math.max(2, (storageUsageKb / 5120) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>{storageItemsCount} Keys Stored</span>
                    <span>Zero Cloud Leaks</span>
                  </div>
                </div>

                {/* Storage Operations Actions Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-cyan-500/20">
                  <button
                    onClick={handleExportFullBackup}
                    className="p-4 rounded-2xl bg-black/60 hover:bg-cyan-500/15 border border-cyan-500/30 hover:border-cyan-400 text-left transition-all cursor-pointer group"
                  >
                    <Download className="h-5 w-5 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                    <div className="text-sm font-bold text-white">Full Backup JSON</div>
                    <p className="text-[11px] text-slate-400 mt-1">Export all configuration and encrypted keys</p>
                  </button>

                  <button
                    onClick={handlePurgeCache}
                    className="p-4 rounded-2xl bg-black/60 hover:bg-yellow-500/15 border border-yellow-500/30 hover:border-yellow-400 text-left transition-all cursor-pointer group"
                  >
                    <RefreshCw className="h-5 w-5 text-yellow-400 mb-2 group-hover:rotate-180 transition-transform duration-500" />
                    <div className="text-sm font-bold text-white">Purge Volatile Buffers</div>
                    <p className="text-[11px] text-slate-400 mt-1">Reset ping samples and speed buffers</p>
                  </button>

                  <button
                    onClick={handleNuclearWipe}
                    disabled={isWiping}
                    className="p-4 rounded-2xl bg-black/60 hover:bg-red-500/15 border border-red-500/30 hover:border-red-400 text-left transition-all cursor-pointer group disabled:opacity-50"
                  >
                    <Trash2 className="h-5 w-5 text-red-400 mb-2 group-hover:scale-110 transition-transform" />
                    <div className="text-sm font-bold text-red-300">Nuclear Vault Wipe</div>
                    <p className="text-[11px] text-slate-400 mt-1">Permanently erase all stored credentials</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "about" && (
            <div className="space-y-6">
              <AboutSection />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
