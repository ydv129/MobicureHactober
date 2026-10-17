"use client";

import {
  Shield,
  Lock,
  Settings,
  Wrench,
  Zap,
  Menu,
  X,
  Search,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const [lightX, setLightX] = useState(50);
  const [isHoveredStrip, setIsHoveredStrip] = useState(false);

  const handleMouseMoveNavbar = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPercentage = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    setLightX(xPercentage);
  };

  return (
    <header 
      className="w-full sticky top-0 z-50 bg-black/90 backdrop-blur-xl transition-all duration-300"
      onMouseMove={handleMouseMoveNavbar}
      onMouseEnter={() => setIsHoveredStrip(true)}
      onMouseLeave={() => setIsHoveredStrip(false)}
    >
      <nav className="w-full border-b border-cyan-500/30 shadow-[0_10px_40px_-25px_rgba(34,211,238,0.6)]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-6">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <Shield className="h-10 w-10 text-cyan-400 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_rgba(0,255,231,0.8)]" />
                <div className="absolute -top-1 -right-1">
                  <Zap className="h-4 w-4 text-green-400 animate-pulse" />
                </div>
                <div className="absolute inset-0 rounded-full blur-xl bg-cyan-400/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="relative">
                <h1 className="text-2xl font-black text-cyan-400 font-mono group-hover:text-cyan-300 transition-colors duration-300 tracking-tight">
                  MOBICURE
                </h1>
                <div className="h-0.5 bg-gradient-to-r from-cyan-400 to-green-400 w-full" />
                <div className="absolute -bottom-1 left-0 h-px w-full bg-gradient-to-r from-cyan-400/60 via-transparent to-green-400/60 blur-sm" />
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-2 rounded-full px-3 py-2 bg-white/5 border border-cyan-500/20 shadow-inner shadow-cyan-400/10">
              {[
                { href: "/", label: "Dashboard", icon: null },
                {
                  href: "/tools",
                  label: "Tools",
                  icon: <Wrench className="h-4 w-4" />,
                },
                {
                  href: "/vault",
                  label: "Privacy Vault",
                  icon: <Lock className="h-4 w-4" />,
                },
                {
                  href: "/settings",
                  label: "Settings",
                  icon: <Settings className="h-4 w-4" />,
                },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={`group/nav-item flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                      isActive(item.href)
                        ? "text-cyan-300 bg-cyan-400/15 border border-cyan-400/40 shadow-[0_0_20px_rgba(34,211,238,0.25)]"
                        : "text-gray-300 hover:text-cyan-300 hover:bg-cyan-400/10"
                    }`}
                  >
                    {item.icon && (
                      <span className="text-cyan-300">{item.icon}</span>
                    )}
                    <span>{item.label}</span>
                    {isActive(item.href) && (
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-pulse" />
                    )}
                  </Button>
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => {
                  window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
                }}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-cyan-500/10 border border-cyan-500/25 hover:border-cyan-400/50 text-xs text-slate-300 font-mono transition-all duration-300 shadow-inner group"
                title="Open Command Matrix (Ctrl+K)"
              >
                <Search className="h-3.5 w-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="text-slate-300">Command Matrix</span>
                <kbd className="px-1.5 py-0.5 rounded bg-black/60 border border-cyan-500/30 text-[10px] text-cyan-300 font-mono">
                  Ctrl+K
                </kbd>
              </button>

              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-green-500/10 border border-green-400/40 shadow-inner shadow-green-400/20 backdrop-blur">
                <div className="relative">
                  <div className="h-2.5 w-2.5 bg-green-400 rounded-full animate-ping absolute inset-0 opacity-60" />
                  <div className="h-2.5 w-2.5 bg-green-300 rounded-full relative" />
                </div>
                <span className="text-sm font-semibold text-green-200 tracking-wide animate-[pulse_2.4s_ease-in-out_infinite]">
                  SECURE
                </span>
              </div>

              <div className="hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-400/40 shadow-inner shadow-cyan-400/20 backdrop-blur group/live hover:bg-cyan-500/20 transition-all duration-300">
                <Activity className="h-4 w-4 text-cyan-300 animate-heartbeat" />
                <span className="text-sm text-cyan-100 font-semibold font-mono tracking-wider">LIVE</span>
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-ping" />
              </div>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-cyan-400/10 transition-colors duration-300"
                suppressHydrationWarning
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6 text-cyan-400" />
                ) : (
                  <Menu className="h-6 w-6 text-cyan-400" />
                )}
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-cyan-500/20 bg-black/70 rounded-xl shadow-inner shadow-cyan-400/10">
              <div className="flex flex-col space-y-2 pt-4">
                <Link href="/" onClick={() => setIsMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start transition-all duration-300 ${
                      isActive("/")
                        ? "text-cyan-400 bg-cyan-400/20 border border-cyan-400/30"
                        : "text-gray-300 hover:text-cyan-400 hover:bg-cyan-400/10"
                    }`}
                  >
                    Dashboard
                  </Button>
                </Link>
                <Link href="/tools" onClick={() => setIsMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start transition-all duration-300 ${
                      isActive("/tools")
                        ? "text-cyan-400 bg-cyan-400/20 border border-cyan-400/30"
                        : "text-gray-300 hover:text-cyan-400 hover:bg-cyan-400/10"
                    }`}
                  >
                    <Wrench className="h-4 w-4 mr-2" />
                    Tools
                  </Button>
                </Link>
                <Link href="/vault" onClick={() => setIsMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start transition-all duration-300 ${
                      isActive("/vault")
                        ? "text-cyan-400 bg-cyan-400/20 border border-cyan-400/30"
                        : "text-gray-300 hover:text-cyan-400 hover:bg-cyan-400/10"
                    }`}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Privacy Vault
                  </Button>
                </Link>
                <Link href="/settings" onClick={() => setIsMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start transition-all duration-300 ${
                      isActive("/settings")
                        ? "text-cyan-400 bg-cyan-400/20 border border-cyan-400/30"
                        : "text-gray-300 hover:text-cyan-400 hover:bg-cyan-400/10"
                    }`}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Cyber Light Strip Below Navbar */}
      <div className="relative w-full h-[3px] bg-cyan-950/60 overflow-hidden group/strip">
        {/* Base Glowing Gradient Bar */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/80 to-transparent animate-[pulse_2.5s_infinite]" />
        
        {/* Mouse Position Interactive Laser Bead */}
        <div
          className="absolute top-0 h-full w-44 -ml-22 bg-gradient-to-r from-transparent via-emerald-400 to-transparent transition-all duration-75 ease-out shadow-[0_0_15px_#3fff7d]"
          style={{ left: `${lightX}%` }}
        />

        {/* Ambient Hover Glow Expansion */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 bg-gradient-to-r from-cyan-400/40 via-emerald-300/60 to-cyan-400/40 blur-[2px] ${
            isHoveredStrip ? "opacity-100" : "opacity-30"
          }`}
        />
      </div>
    </header>
  );
}
