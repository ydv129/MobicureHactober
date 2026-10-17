"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Clock,
  ChevronRight,
} from "lucide-react";

export function SiteFooter() {
  const [timeUtc, setTimeUtc] = useState<string>("");
  const [timeLocal, setTimeLocal] = useState<string>("");
  const [dayShort, setDayShort] = useState<string>("");
  const [dayFull, setDayFull] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeUtc(
        now.toISOString().substring(11, 19) + " UTC"
      );
      setDayShort(
        now.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()
      );
      setDayFull(
        now.toLocaleDateString("en-US", { weekday: "long" })
      );
      setTimeLocal(
        now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="w-full mt-16 border-t border-cyan-500/25 bg-gradient-to-b from-black/80 via-slate-950/95 to-black text-slate-300 relative z-20 overflow-hidden">
      {/* Top Cyber Telemetry Bar */}
      <div className="border-b border-cyan-500/20 bg-cyan-950/30 px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-emerald-300 font-bold tracking-wide">
              DEFENSE MATRIX: ALL SYSTEMS NOMINAL
            </span>
            <span className="hidden md:inline text-slate-500">•</span>
            <span className="hidden md:inline text-cyan-400/80">
              CLUSTER: AP-SOUTH-PRIMARY
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <div className="flex items-center gap-1.5 bg-black/50 px-2.5 py-1 rounded-md border border-cyan-500/20">
              <Clock className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-cyan-200">{timeUtc || "00:00:00 UTC"}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 bg-black/60 px-3 py-1 rounded-lg border border-cyan-500/25 shadow-inner">
              <span className="text-emerald-400 font-bold">LOC:</span>
              <span className="text-cyan-300 font-bold">
                <span className="hidden md:inline">{dayFull}</span>
                <span className="md:hidden">{dayShort}</span>
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-100 font-bold tracking-wide">{timeLocal || "--:--:-- --"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Shield className="h-8 w-8 text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
                <div className="absolute inset-0 rounded-full blur-md bg-cyan-400/30" />
              </div>
              <span className="text-2xl font-black text-cyan-300 font-mono tracking-tight">
                MOBICURE
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/40 text-cyan-300 font-mono font-bold">
                v2.0 PRO
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md font-sans">
              Next-generation client-isolated cybersecurity command center. High-fidelity forensic analysis, real-time telemetry observation, zero-knowledge encryption, and threat prevention.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] font-mono">
              <span className="px-2.5 py-1 rounded-md bg-white/5 border border-cyan-500/20 text-cyan-300">
                AES-GCM-256
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/5 border border-emerald-500/20 text-emerald-300">
                ZERO-TELEMETRY
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/5 border border-purple-500/20 text-purple-300">
                TLS 1.3 / STRICT CSP
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-3 font-mono text-xs">
            <div className="text-sm font-bold text-cyan-300 font-[var(--font-heading)] uppercase tracking-wider mb-2">
              COMMAND NAVIGATION
            </div>
            <ul className="space-y-2">
              {[
                { href: "/", label: "System Dashboard" },
                { href: "/tools", label: "Security Arsenal (9 Tools)" },
                { href: "/vault", label: "Privacy Vault (Encrypted)" },
                { href: "/settings", label: "System Preferences" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-slate-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors duration-200"
                  >
                    <ChevronRight className="h-3 w-3 text-cyan-400/60" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Security Arsenal Tools Shortcut */}
          <div className="space-y-3 font-mono text-xs">
            <div className="text-sm font-bold text-cyan-300 font-[var(--font-heading)] uppercase tracking-wider mb-2">
              FEATURED ARSENAL
            </div>
            <ul className="space-y-2">
              {[
                { href: "/tools?tool=url-threat-scanner", label: "URL Threat Scanner" },
                { href: "/tools?tool=apk-analyzer", label: "APK Deep Analyzer" },
                { href: "/tools?tool=password-strength-checker", label: "Password Strength" },
                { href: "/about", label: "About Architecture" },
                { href: "/contact", label: "Contact Engineering" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-slate-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors duration-200"
                  >
                    <ChevronRight className="h-3 w-3 text-cyan-400/60" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Attribution Line */}
        <div className="mt-12 pt-6 border-t border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div>
            Lead Architect & Engineer:{" "}
            <span className="text-cyan-300 font-bold tracking-wide">
              NEERAJ YADAV
            </span>{" "}
            • All Rights Reserved
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="text-emerald-400/80">AUTHENTICATED CLIENT</span>
            <span>•</span>
            <span>PRESS <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-cyan-300">CTRL+K</kbd> FOR COMMAND PALETTE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
