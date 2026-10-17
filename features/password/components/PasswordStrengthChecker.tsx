"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Key, Shield, AlertTriangle, CheckCircle, Eye, EyeOff, Sparkles, Copy, Check, RefreshCw } from "lucide-react"

interface PasswordAnalysis {
  password: string
  strength: "Very Weak" | "Weak" | "Fair" | "Good" | "Strong" | "Very Strong"
  score: number
  entropyBits: number
  criteria: {
    length: boolean
    uppercase: boolean
    lowercase: boolean
    numbers: boolean
    symbols: boolean
    commonPassword: boolean
  }
  estimatedCrackTime: string
  recommendations: string[]
}

export default function PasswordStrengthChecker() {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null)

  const isCommonPassword = (pwd: string) => {
    const commonPasswords = [
      "password",
      "123456",
      "password123",
      "admin",
      "qwerty",
      "letmein",
      "welcome",
      "monkey",
      "1234567890",
      "abc123",
      "Password1",
      "password1",
    ]
    return commonPasswords.includes(pwd.toLowerCase())
  }

  const estimateCrackTime = (pwd: string, score: number) => {
    let pool = 0
    if (/[a-z]/.test(pwd)) pool += 26
    if (/[A-Z]/.test(pwd)) pool += 26
    if (/\d/.test(pwd)) pool += 10
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd)) pool += 32
    pool = Math.max(1, pool)

    const entropy = pwd.length * Math.log2(pool)
    const combinations = 2 ** entropy
    const guessesPerSecond = 1e10 // Modern offline cracking rig
    const secondsToCrack = combinations / (2 * guessesPerSecond)

    if (secondsToCrack < 1) return "Instantly (< 1 sec)"
    if (secondsToCrack < 60) return `${Math.round(secondsToCrack)} seconds`
    if (secondsToCrack < 3600) return `${Math.round(secondsToCrack / 60)} minutes`
    if (secondsToCrack < 86400) return `${Math.round(secondsToCrack / 3600)} hours`
    if (secondsToCrack < 31536000) return `${Math.round(secondsToCrack / 86400)} days`
    if (secondsToCrack < 31536000000) return `${Math.round(secondsToCrack / 31536000)} years`
    return "Centuries (Cryptographically Secure)"
  }

  const calculateScore = (pwd: string, criteria: any) => {
    let score = 0
    if (pwd.length >= 8) score += 10
    if (pwd.length >= 12) score += 15
    if (pwd.length >= 16) score += 15

    if (criteria.uppercase) score += 10
    if (criteria.lowercase) score += 10
    if (criteria.numbers) score += 15
    if (criteria.symbols) score += 15

    if (pwd.length > 8 && /(.)\1{2,}/.test(pwd)) score -= 10
    const isCommon = isCommonPassword(pwd)
    if (isCommon) score -= 30
    else score += 10

    const uniqueChars = new Set(pwd).size
    score += Math.min(uniqueChars * 2, 15)

    return Math.max(0, Math.min(100, score))
  }

  const getStrengthLevel = (score: number): PasswordAnalysis["strength"] => {
    if (score >= 90) return "Very Strong"
    if (score >= 75) return "Strong"
    if (score >= 60) return "Good"
    if (score >= 40) return "Fair"
    if (score >= 20) return "Weak"
    return "Very Weak"
  }

  const analyzePassword = (pwd: string) => {
    if (!pwd) {
      setAnalysis(null)
      return
    }

    const criteria = {
      length: pwd.length >= 12,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      numbers: /\d/.test(pwd),
      symbols: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd),
      commonPassword: !isCommonPassword(pwd),
    }

    let pool = 0
    if (criteria.lowercase) pool += 26
    if (criteria.uppercase) pool += 26
    if (criteria.numbers) pool += 10
    if (criteria.symbols) pool += 32
    const entropyBits = Math.round(pwd.length * (pool > 0 ? Math.log2(pool) : 0))

    const score = calculateScore(pwd, criteria)
    const strength = getStrengthLevel(score)
    const crackTime = estimateCrackTime(pwd, score)

    const recommendations = []
    if (!criteria.length) recommendations.push("Increase password length to at least 12-16 characters")
    if (!criteria.uppercase) recommendations.push("Include at least one uppercase letter (A-Z)")
    if (!criteria.lowercase) recommendations.push("Include lowercase letters (a-z)")
    if (!criteria.numbers) recommendations.push("Add numerical digits (0-9)")
    if (!criteria.symbols) recommendations.push("Include special symbols (!@#$%^&*)")
    if (!criteria.commonPassword) recommendations.push("Avoid standard dictionary passwords")
    if (recommendations.length === 0) recommendations.push("Military-grade password strength!")

    setAnalysis({
      password: pwd,
      strength,
      score,
      entropyBits,
      criteria,
      estimatedCrackTime: crackTime,
      recommendations,
    })
  }

  const generateStrongPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()_+~"
    let generated = ""
    const array = new Uint32Array(16)
    window.crypto.getRandomValues(array)
    for (let i = 0; i < 16; i++) {
      generated += chars[array[i] % chars.length]
    }
    setPassword(generated)
    analyzePassword(generated)
  }

  const copyToClipboard = async () => {
    if (!password) return
    await navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case "Very Strong":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
      case "Strong":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-400/40"
      case "Good":
        return "bg-blue-500/20 text-blue-300 border-blue-400/40"
      case "Fair":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-400/40"
      case "Weak":
        return "bg-orange-500/20 text-orange-300 border-orange-400/40"
      default:
        return "bg-red-500/20 text-red-300 border-red-400/40"
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="password" className="text-sm font-mono font-semibold text-cyan-300">
              INPUT PASSWORD FOR ENTROPY & BRUTE-FORCE AUDIT
            </Label>
            <button
              type="button"
              onClick={generateStrongPassword}
              className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors cursor-pointer bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-400/30"
            >
              <Sparkles className="h-3 w-3" />
              <span>GENERATE HIGH-ENTROPY</span>
            </button>
          </div>

          <div className="relative">
            <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-cyan-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Type or generate a password to audit..."
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                analyzePassword(e.target.value)
              }}
              className="cyber-input pl-11 pr-24 py-2.5 h-12 text-sm text-cyan-100 placeholder:text-slate-500 font-mono"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-400 hover:text-cyan-300"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-400 hover:text-cyan-300"
                onClick={copyToClipboard}
                disabled={!password}
                title="Copy password"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {analysis && (
        <div className="space-y-4 animate-fadeIn">
          <Card className="cyber-card p-6 border border-cyan-500/30">
            <CardHeader className="p-0 pb-4 border-b border-cyan-500/20">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-cyan-400" />
                  <span className="font-mono font-bold text-cyan-200">
                    CRYPTOGRAPHIC ENTROPY AUDIT
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">
                    {analysis.entropyBits} bits
                  </span>
                  <span
                    className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${getStrengthColor(
                      analysis.strength
                    )}`}
                  >
                    {analysis.strength.toUpperCase()}
                  </span>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0 pt-4 space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Security Score:</span>
                  <span className="text-cyan-300 font-bold">{analysis.score} / 100</span>
                </div>
                <div className="w-full bg-black/70 rounded-full h-2 overflow-hidden border border-cyan-500/30">
                  <div
                    className={`h-full transition-all duration-500 ${
                      analysis.score >= 80
                        ? "bg-gradient-to-r from-cyan-400 to-emerald-400"
                        : analysis.score >= 50
                        ? "bg-gradient-to-r from-yellow-400 to-cyan-400"
                        : "bg-red-400"
                    }`}
                    style={{ width: `${analysis.score}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-black/60 border border-cyan-500/25 flex items-center justify-between font-mono text-xs">
                <span className="text-slate-400">ESTIMATED BRUTE-FORCE RESISTANCE:</span>
                <span className="text-emerald-300 font-bold text-sm tracking-wide">
                  {analysis.estimatedCrackTime}
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                  SECURITY CRITERIA MATRIX
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(analysis.criteria).map(([key, met]) => (
                    <div
                      key={key}
                      className={`p-2.5 rounded-lg border flex items-center gap-2 text-xs font-mono ${
                        met
                          ? "bg-emerald-500/10 border-emerald-400/30 text-emerald-200"
                          : "bg-red-500/10 border-red-400/30 text-red-300"
                      }`}
                    >
                      {met ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      )}
                      <span className="capitalize truncate">
                        {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {analysis.recommendations.length > 0 && (
                <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/25 space-y-2">
                  <div className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5" />
                    <span>DEFENSE RECOMMENDATIONS</span>
                  </div>
                  <ul className="space-y-1 text-xs text-slate-300 font-sans">
                    {analysis.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
