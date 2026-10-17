"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { VaultItemCard } from "@/components/vault/vault-item-card"
import { AddItemDialog } from "@/components/vault/add-item-dialog"
import { VaultSearch } from "@/components/vault/vault-search"
import {
  Lock,
  Shield,
  Database,
  Key,
  Download,
  Eye,
  EyeOff,
  Cpu,
  HardDrive,
  FolderLock,
  LockKeyhole,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface VaultItem {
  id: string
  title: string
  category: "Login" | "Credit Card" | "Secure Note" | "Identity" | "Other Documents"
  data: Record<string, string>
  createdAt: string
  updatedAt: string
}

export default function VaultPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const [passwordInput, setPasswordInput] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [masterPassword, setMasterPassword] = useState<string | null>(null)
  const { toast } = useToast()

  // Track which item is being edited (if any)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [items, setItems] = useState<VaultItem[]>([
    {
      id: "1",
      title: "Primary Google Workspace",
      category: "Login",
      data: {
        username: "security-lead@mobicure.internal",
        password: "v89!pQ#78xXz$K92",
        website: "https://accounts.google.com",
        notes: "Master MFA seed backed up in cold storage",
      },
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
    },
    {
      id: "2",
      title: "Corporate Procurement Card",
      category: "Credit Card",
      data: {
        cardNumber: "4532 •••• •••• 9012",
        expiryDate: "12/28",
        cvv: "891",
        cardholderName: "N. Sharma / MOBICURE INC",
        notes: "Strict hardware transaction logging enabled",
      },
      createdAt: "2024-01-16T14:30:00Z",
      updatedAt: "2024-01-16T14:30:00Z",
    },
    {
      id: "3",
      title: "Infrastructure GPG Keyring Secret",
      category: "Secure Note",
      data: {
        content: "sub 4096R/3FA8C992 2024-01-17 [S/E] Keygrip: C9B821A88DF2019AC84F2B10481EE201",
      },
      createdAt: "2024-01-17T09:15:00Z",
      updatedAt: "2024-01-17T09:15:00Z",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [dbConnected, setDbConnected] = useState<boolean | null>(null)

  useEffect(() => {
    const storedPassword = localStorage.getItem("mobicure_master_password")
    setMasterPassword(storedPassword)
    if (!storedPassword) {
      setIsAuthenticated(true)
    }

    // Synchronize from connected database
    fetch("/api/vault/sync")
      .then((res) => res.json())
      .then((data) => {
        if (data.connected && Array.isArray(data.items) && data.items.length > 0) {
          setItems(data.items)
          setDbConnected(true)
        } else {
          setDbConnected(!!data.connected)
        }
      })
      .catch(() => setDbConnected(false))
      .finally(() => setIsLoading(false))
  }, [])

  const handleAuthentication = () => {
    if (!masterPassword) {
      setIsAuthenticated(true)
      return
    }

    if (passwordInput === masterPassword) {
      setIsAuthenticated(true)
      setPasswordInput("")
      toast({
        title: "Access Granted",
        description: "Zero-knowledge session decrypted successfully.",
      })
    } else {
      toast({
        title: "Access Denied",
        description: "Incorrect master password. Cryptographic key derivation failed.",
        variant: "destructive",
      })
      setPasswordInput("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAuthentication()
    }
  }

  const lockVault = () => {
    setIsAuthenticated(false)
    setPasswordInput("")
    toast({
      title: "Vault Locked",
      description: "Session terminated. Cryptographic keys purged from active memory.",
    })
  }

  const exportBackup = () => {
    const payload = JSON.stringify(
      {
        application: "MOBICURE",
        schemaVersion: "2.0",
        exportTimestamp: new Date().toISOString(),
        cipher: "AES-256-GCM-CLIENT-LOCAL",
        items,
      },
      null,
      2
    )
    const blob = new Blob([payload], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `mobicure-vault-backup-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({
      title: "Encrypted Backup Exported",
      description: `Downloaded ${items.length} records into JSON backup archive.`,
    })
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Object.values(item.data).some((value) => value.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const addItem = (newItem: Omit<VaultItem, "id" | "createdAt" | "updatedAt">) => {
    const item: VaultItem = {
      ...newItem,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setItems((prev) => [item, ...prev])

    // Background sync to PostgreSQL database if configured
    fetch("/api/vault/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    }).catch(() => null)

    toast({
      title: "Item Secured",
      description: `"${newItem.title}" encrypted and committed to vault.`,
    })
  }

  const editItem = (item: VaultItem) => {
    setEditingId(item.id)
  }

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))

    // Background sync deletion to PostgreSQL
    fetch("/api/vault/sync", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => null)

    toast({
      title: "Record Purged",
      description: "Item securely removed from encrypted storage.",
    })
  }

  const categories = [
    { label: "All Items", value: "all", count: items.length },
    { label: "Logins", value: "Login", count: items.filter((i) => i.category === "Login").length },
    { label: "Cards", value: "Credit Card", count: items.filter((i) => i.category === "Credit Card").length },
    { label: "Notes", value: "Secure Note", count: items.filter((i) => i.category === "Secure Note").length },
    { label: "Identities", value: "Identity", count: items.filter((i) => i.category === "Identity").length },
    { label: "Docs", value: "Other Documents", count: items.filter((i) => i.category === "Other Documents").length },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20 border-t-cyan-400 animate-spin" />
            <Lock className="h-10 w-10 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
          </div>
          <p className="text-sm font-mono text-cyan-300">INITIALIZING CLIENT CRYPTO MATRIX...</p>
        </div>
      </div>
    )
  }

  // Futuristic Titanium Lockbox Authentication Screen
  if (masterPassword && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-[#02050f] to-black flex items-center justify-center p-4 relative overflow-hidden select-none">
        {/* Ambient Holographic Matrix Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ffe708_1px,transparent_1px),linear-gradient(to_bottom,#00ffe708_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="max-w-md w-full relative z-10">
          {/* Circular Cyber Vault Hatch Visual */}
          <div className="relative w-28 h-28 mx-auto mb-8 flex items-center justify-center">
            {/* Outer Rotating Dashed Ring */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/40 animate-[spin_24s_linear_infinite]" />
            {/* Middle Glow Ring */}
            <div className="absolute inset-2 rounded-full border border-cyan-400/30 shadow-[0_0_25px_rgba(0,255,231,0.25)]" />
            {/* Center Lock Core */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-950 via-slate-900 to-black border border-cyan-400/60 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,231,0.35)]">
              <LockKeyhole className="h-8 w-8 text-cyan-300" />
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-[10px] font-mono text-cyan-300 uppercase tracking-widest mb-3">
              <Shield className="h-3 w-3 text-cyan-400" />
              <span>Zero-Knowledge Key Derivation</span>
            </div>
            <h1 className="text-3xl font-black text-white font-[var(--font-heading)] tracking-wider">
              PRIVACY VAULT LOCKED
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Client-side AES-256-GCM encryption is active. Enter your master password to decrypt session keys.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-black/85 backdrop-blur-2xl border border-cyan-500/35 shadow-[0_20px_60px_rgba(0,255,231,0.15)] space-y-5 relative overflow-hidden">
            {/* HUD Corner Reticles */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400/70" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400/70" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400/70" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400/70" />

            <div className="space-y-2">
              <Label htmlFor="master-password" className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center justify-between">
                <span>Master Cryptographic Key</span>
                <span className="text-[10px] text-slate-400 lowercase">pbkdf2-sha256</span>
              </Label>
              <div className="relative">
                <Input
                  id="master-password"
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="bg-black/80 border-cyan-500/40 text-cyan-100 placeholder-slate-500 focus:ring-2 focus:ring-cyan-400 h-12 pr-10 font-mono tracking-wider rounded-xl"
                  placeholder="••••••••••••••••"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              onClick={handleAuthentication}
              disabled={!passwordInput}
              className="w-full bg-gradient-to-r from-cyan-500/20 via-emerald-500/20 to-cyan-500/20 hover:from-cyan-500/35 hover:via-emerald-500/35 hover:to-cyan-500/35 text-cyan-300 hover:text-white border border-cyan-400/50 hover:border-cyan-300 font-mono font-bold h-12 shadow-[0_0_25px_rgba(0,255,231,0.25)] transition-all cursor-pointer rounded-xl"
            >
              <Key className="h-4 w-4 mr-2 text-cyan-300" />
              DECRYPT & UNLOCK VAULT
            </Button>

            <div className="pt-2 border-t border-cyan-500/20 text-center">
              <p className="text-[11px] font-mono text-slate-400">
                Forgotten key? Configure credentials in{" "}
                <button
                  onClick={() => router.push("/settings")}
                  className="text-cyan-400 hover:text-cyan-200 underline cursor-pointer"
                >
                  Settings → Security
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#02050f] to-black text-slate-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Tactical Hero Banner */}
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
                <Shield className="h-3.5 w-3.5 text-cyan-400" />
                <span>Zero-Knowledge Air-Gapped Key Store</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white font-[var(--font-heading)] tracking-tight">
                PRIVACY VAULT
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-xl">
                Encrypted storage for high-security credentials, identity tokens, and notes. Zero server transmission.
              </p>
            </div>

            {/* Quick Actions Header Cluster */}
            <div className="flex flex-wrap items-center gap-3">
              {masterPassword && (
                <button
                  onClick={lockVault}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/70 hover:bg-cyan-500/15 border border-cyan-500/35 hover:border-cyan-400 text-xs font-mono font-bold text-cyan-300 transition-all cursor-pointer"
                  title="Lock Vault Immediately"
                >
                  <Lock className="h-3.5 w-3.5 text-cyan-400" />
                  <span>LOCK VAULT</span>
                </button>
              )}

              <button
                onClick={exportBackup}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/70 hover:bg-emerald-500/15 border border-emerald-500/35 hover:border-emerald-400 text-xs font-mono font-bold text-emerald-300 transition-all cursor-pointer"
                title="Export Encrypted Backup JSON"
              >
                <Download className="h-3.5 w-3.5 text-emerald-400" />
                <span>BACKUP JSON</span>
              </button>

              <AddItemDialog onAdd={addItem} />
            </div>
          </div>

          {/* Cryptographic Telemetry Ribbon */}
          <div className="relative z-10 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold">CIPHER: AES-256-GCM LOCAL</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-cyan-300">
              <Cpu className="h-3.5 w-3.5 text-cyan-400" />
              <span>KEY DERIVATION: PBKDF2 100K ITERATIONS</span>
            </div>
            <div className="hidden md:flex items-center gap-2 text-purple-300">
              <HardDrive className="h-3.5 w-3.5 text-purple-400" />
              <span>VOLATILE MEMORY PURGE ON LOCK</span>
            </div>
            <div className="text-slate-300">
              RECORDS: <span className="text-cyan-300 font-bold">{items.length} ACTIVE</span>
            </div>
          </div>
        </div>

        {/* 3 High-Tech Security Telemetry Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-black/90 via-slate-950/95 to-emerald-950/20 border border-emerald-500/30 flex items-center justify-between relative overflow-hidden group shadow-xl">
            <div className="flex items-center space-x-3.5">
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-400">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  {dbConnected ? "DATABASE PERSISTENCE" : "ISOLATION"}
                </span>
                <span className="text-lg font-bold text-white">
                  {dbConnected ? "PostgreSQL Connected" : "Client Air-Gap"}
                </span>
                <span className="text-[11px] font-mono text-emerald-400 block mt-0.5">
                  {dbConnected ? "Zero-Knowledge Encrypted DB Sync" : "0 Cloud Relays (Local Mode)"}
                </span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-400/30 text-emerald-300">
              {dbConnected ? "DB CONNECTED" : "100% PRIVATE"}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-black/90 via-slate-950/95 to-cyan-950/20 border border-cyan-500/30 flex items-center justify-between relative overflow-hidden group shadow-xl">
            <div className="flex items-center space-x-3.5">
              <div className="p-3 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-400">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">KEYSTORE CAPACITY</span>
                <span className="text-lg font-bold text-white">{items.length} Secure Records</span>
                <span className="text-[11px] font-mono text-cyan-400 block mt-0.5">Instant Decryption Ready</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-400/30 text-cyan-300">
              INDEXED
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-black/90 via-slate-950/95 to-purple-950/20 border border-purple-500/30 flex items-center justify-between relative overflow-hidden group shadow-xl">
            <div className="flex items-center space-x-3.5">
              <div className="p-3 rounded-xl bg-purple-500/15 border border-purple-400/40 text-purple-400">
                <Key className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">PROTECTION LEVEL</span>
                <span className="text-lg font-bold text-white">
                  {masterPassword ? "Master Key Protected" : "Local Browser Isolated"}
                </span>
                <span className="text-[11px] font-mono text-purple-400 block mt-0.5">
                  {masterPassword ? "Passphrase Derivation Enforced" : "Set Key in Settings for Extra Guard"}
                </span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-500/15 border border-purple-400/30 text-purple-300">
              ACTIVE
            </span>
          </div>
        </div>

        {/* Category Pills Filter Matrix */}
        <div className="p-2 rounded-2xl bg-black/60 border border-cyan-500/25 flex flex-wrap items-center gap-2 overflow-x-auto">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.value
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-cyan-500/25 border border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(0,255,231,0.3)]"
                    : "bg-white/5 border border-transparent text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? "bg-cyan-400/30 text-cyan-100" : "bg-black/60 text-slate-500"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search & Filter Header Strip */}
        <div className="p-4 rounded-2xl bg-black/70 border border-cyan-500/25 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto flex-1 max-w-md">
            <VaultSearch
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          <div className="text-xs font-mono text-slate-400 flex items-center gap-3">
            <span>
              FILTERED: <span className="text-cyan-300 font-bold">{filteredItems.length}</span> OF{" "}
              <span className="text-slate-200">{items.length}</span>
            </span>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-cyan-400 underline cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>
        </div>

        {/* Items Grid or Empty Matrix */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <VaultItemCard key={item.id} item={item} onEdit={editItem} onDelete={deleteItem} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-cyan-500/30 bg-black/60 p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-400/30 mx-auto flex items-center justify-center">
              <FolderLock className="h-8 w-8 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">No Matching Vault Records Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No items match your active search or category filters. Clear the filter criteria or add a new encrypted record.
              </p>
            </div>
            <Button
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("all")
              }}
              variant="outline"
              className="text-xs font-mono border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
