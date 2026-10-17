"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import {
  Shield,
  Zap,
  Cpu,
  Activity,
  Sparkles,
  RefreshCw,
  Radio,
  Terminal,
  Crosshair,
  Lock,
} from "lucide-react";

export function CommandCenterHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>("");
  const [scanPercent, setScanPercent] = useState(0);
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const [radarDegree, setRadarDegree] = useState(0);

  // Smooth continuous radar sweep rotation
  useEffect(() => {
    let animId: number;
    let currentDegree = 0;
    const animateRadar = () => {
      currentDegree = (currentDegree + 1.2) % 360;
      setRadarDegree(currentDegree);
      animId = requestAnimationFrame(animateRadar);
    };
    animId = requestAnimationFrame(animateRadar);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Subtle natural 3D tilt
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    const spotX = (x / rect.width) * 100;
    const spotY = (y / rect.height) * 100;

    setRotate({ x: rotateX, y: rotateY });
    setSpotlight({ x: spotX, y: spotY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  const triggerScanPulse = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanPercent(10);
    setScanStep("PROBING GLOBAL INGRESS PERIMETER & CERTS...");

    setTimeout(() => {
      setScanPercent(38);
      setScanStep("INSPECTING ZERO-KNOWLEDGE ENCRYPTED SOCKETS...");
    }, 450);

    setTimeout(() => {
      setScanPercent(72);
      setScanStep("NEURAL HEURISTIC THREAT SCAN: 0 VECTORS...");
    }, 1000);

    setTimeout(() => {
      setScanPercent(100);
      setScanStep("DEFENSE MATRIX 100% HARDENED & SYNCHRONIZED");
    }, 1600);

    setTimeout(() => {
      setIsScanning(false);
      setScanStep("");
      setScanPercent(0);
    }, 2800);
  };

  useEffect(() => {
    const handleGlobalTrigger = () => triggerScanPulse();
    window.addEventListener("trigger-diagnostic-pulse", handleGlobalTrigger);
    return () => window.removeEventListener("trigger-diagnostic-pulse", handleGlobalTrigger);
  }, []);

  return (
    <div className="relative mb-12 group/hero perspective-1000 select-none">
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transition: isHovered ? "transform 0.12s ease-out" : "transform 0.6s ease-out",
        }}
        className="relative overflow-hidden rounded-3xl border border-cyan-500/40 bg-gradient-to-b from-[#020612]/95 via-[#01040a]/98 to-[#000d1a]/90 p-6 sm:p-10 md:p-12 shadow-[0_25px_80px_-20px_rgba(0,255,231,0.25)] hover:border-cyan-400/70 hover:shadow-[0_30px_90px_-10px_rgba(0,255,231,0.4)] transition-all duration-500"
      >
        {/* Futuristic Corner Targeting Reticles / Brackets */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400/80 pointer-events-none" />
        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400/80 pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400/80 pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400/80 pointer-events-none" />

        {/* Ambient Subtle Cyber Matrix Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ffe70a_1px,transparent_1px),linear-gradient(to_bottom,#00ffe70a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-80" />

        {/* Dynamic Cursor Spotlight Radial Layer */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(700px circle at ${spotlight.x}% ${spotlight.y}%, rgba(0,255,231,0.18), transparent 45%)`,
            opacity: isHovered ? 1 : 0.4,
          }}
        />

        {/* Central High-Tech Holographic Radar HUD (Background Centerpiece) */}
        <div className="absolute -right-16 -bottom-16 sm:right-6 sm:top-1/2 sm:-translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 pointer-events-none opacity-25 sm:opacity-35 transition-opacity duration-500 group-hover/hero:opacity-50">
          {/* Rotating Conic Sweep Beam */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(from ${radarDegree}deg, rgba(0,255,231,0.45) 0deg, transparent 65deg, transparent 360deg)`,
            }}
          />

          {/* Outer Dashed Orbit Ring */}
          <div
            className="absolute inset-0 rounded-full border border-dashed border-cyan-400/60"
            style={{
              transform: `rotate(-${radarDegree * 0.4}deg)`,
            }}
          />

          {/* Middle Concentric Orbit */}
          <div className="absolute inset-10 rounded-full border border-cyan-400/30" />

          {/* Inner Concentric Orbit */}
          <div
            className="absolute inset-20 rounded-full border border-dotted border-emerald-400/50"
            style={{
              transform: `rotate(${radarDegree * 0.8}deg)`,
            }}
          />

          {/* Center Target Crosshairs */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-400/25 -translate-y-1/2" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan-400/25 -translate-x-1/2" />

          {/* Center Pulsing Defense Node */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-cyan-400/30 border border-cyan-300 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-300 animate-ping" />
          </div>
        </div>

        {/* Laser Scanner Beam Effect when Scanning or Hovered */}
        <div
          className={`absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_30px_#00ffe7] pointer-events-none transition-all duration-700 ${
            isScanning
              ? "animate-[scanLine_1.6s_ease-in-out_infinite] opacity-100"
              : isHovered
              ? "top-1/2 opacity-30"
              : "top-0 opacity-0"
          }`}
        />

        {/* Top Active Telemetry Status Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-400/40 text-cyan-300 text-xs sm:text-sm font-bold shadow-[0_0_20px_rgba(0,255,231,0.2)] hover:bg-cyan-500/20 transition-all duration-300">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-300" />
              </span>
              <span className="font-mono tracking-wider">ARCHITECTURE: CLIENT-SIDE ZERO-KNOWLEDGE</span>
            </div>

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-cyan-500/25 text-[11px] font-mono text-emerald-300">
              <Crosshair className="h-3 w-3 text-emerald-400 animate-spin" />
              <span>RADAR HUD: 360° ACTIVE</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-cyan-500/25 text-[11px] font-mono text-slate-300">
              <span className="text-cyan-400 font-bold">CLIENT NODE:</span>
              <span>LOCAL RUNTIME</span>
            </div>

            <button
              onClick={triggerScanPulse}
              disabled={isScanning}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 hover:from-emerald-500/25 hover:to-cyan-500/25 border border-emerald-400/50 text-emerald-300 text-xs font-mono font-bold shadow-[0_0_20px_rgba(63,255,125,0.25)] hover:shadow-[0_0_30px_rgba(63,255,125,0.5)] transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? "animate-spin text-emerald-300" : ""}`} />
              <span>{isScanning ? "SCANNING PIPELINE..." : "DIAGNOSTIC PULSE"}</span>
            </button>
          </div>
        </div>

        {/* Diagnostic Live Feedback Bar */}
        {isScanning && (
          <div className="mb-6 p-4 rounded-2xl bg-cyan-950/90 border border-cyan-400/60 text-xs font-mono text-cyan-200 relative z-10 animate-fadeIn space-y-2.5 shadow-[0_0_30px_rgba(0,255,231,0.25)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Terminal className="h-4 w-4 text-cyan-300 animate-pulse" />
                <span className="font-bold text-cyan-100 tracking-wide">{scanStep}</span>
              </div>
              <span className="text-emerald-400 font-bold text-sm">{scanPercent}%</span>
            </div>
            <div className="w-full bg-black/80 rounded-full h-2 overflow-hidden border border-cyan-500/35">
              <div
                className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-300 h-full transition-all duration-300 shadow-[0_0_10px_#00ffe7]"
                style={{ width: `${scanPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Main Title Section with Cyber Aesthetics */}
        <div className="relative z-10 my-4 sm:my-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-cyan-500/20 text-[11px] font-mono text-cyan-300 mb-3 uppercase tracking-widest">
            <Shield className="h-3.5 w-3.5 text-cyan-400" />
            <span>Cyber Intelligence & Security Arsenal</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white font-[var(--font-montserrat)] tracking-tight leading-none drop-shadow-[0_0_35px_rgba(255,255,255,0.25)] group-hover/hero:text-cyan-50 transition-colors duration-300">
            CYBERSECURITY
          </h1>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-300 to-cyan-400 font-[var(--font-montserrat)] tracking-wider mt-1 drop-shadow-[0_0_40px_rgba(0,255,231,0.7)] group-hover/hero:scale-[1.01] transition-transform duration-300">
            COMMAND CENTER
          </h2>
          <p className="mt-4 text-sm sm:text-lg text-slate-300 leading-relaxed font-sans font-medium max-w-2xl">
            Client-isolated security tools, zero-knowledge cryptographic vault, URL threat heuristics, and real-time network telemetry.
          </p>
        </div>

        {/* Live Cyber Telemetry Ticker Strip */}
        <div className="relative z-10 my-6 py-2.5 px-4 rounded-xl bg-black/60 border border-cyan-500/25 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold">DATA RETENTION: ZERO EXTERNAL SERVERS</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-cyan-300">
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            <span>RUNTIME: WEB CRYPTO API</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-purple-300">
            <Lock className="h-3.5 w-3.5 text-purple-400" />
            <span>CIPHER: AES-256-GCM LOCAL</span>
          </div>
          <div className="text-slate-400">
            TELEMETRY: <span className="text-cyan-300 font-bold">NATIVE BROWSER APIS</span>
          </div>
        </div>

        {/* 4 Interactive Tactical HUD Telemetry Modules Grid */}
        <div className="mt-6 pt-6 border-t border-cyan-500/25 grid grid-cols-2 sm:grid-cols-4 gap-3.5 relative z-10">
          <TacticalModuleCard
            icon={<Shield className="h-5 w-5 text-emerald-400" />}
            title="PRIVACY VAULT"
            metric="AES-256-GCM"
            subtitle="Local Zero-Knowledge"
            tag="TOOL 01"
            isActive={activeChip === "shield"}
            onClick={() => setActiveChip(activeChip === "shield" ? null : "shield")}
          />
          <TacticalModuleCard
            icon={<Activity className="h-5 w-5 text-cyan-400" />}
            title="THREAT SCANNER"
            metric="HEURISTIC ENGINE"
            subtitle="SSL & Protocol Audit"
            tag="TOOL 02"
            isActive={activeChip === "ai"}
            onClick={() => setActiveChip(activeChip === "ai" ? null : "ai")}
          />
          <TacticalModuleCard
            icon={<Radio className="h-5 w-5 text-purple-400" />}
            title="PASSWORD ENTROPY"
            metric="OFFLINE AUDIT"
            subtitle="zxcvbn Calculation"
            tag="TOOL 03"
            isActive={activeChip === "radar"}
            onClick={() => setActiveChip(activeChip === "radar" ? null : "radar")}
          />
          <TacticalModuleCard
            icon={<Zap className="h-5 w-5 text-yellow-400" />}
            title="NETWORK TELEMETRY"
            metric="NATIVE PROBE"
            subtitle="RTT & Latency Metrics"
            tag="TOOL 04"
            isActive={activeChip === "firewall"}
            onClick={() => setActiveChip(activeChip === "firewall" ? null : "firewall")}
          />
        </div>

        {/* Dynamic Detail Overlay when a Chip is Active */}
        {activeChip && (
          <div className="mt-4 p-4 rounded-2xl bg-cyan-950/90 border border-cyan-400/50 text-xs font-mono text-cyan-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn relative z-10 shadow-[0_0_25px_rgba(0,255,231,0.25)]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-400/20 text-cyan-300 border border-cyan-400/40">
                <Sparkles className="h-4 w-4 animate-spin" />
              </div>
              <div>
                <div className="font-bold text-cyan-100 text-sm">
                  {activeChip === "shield" && "PRIVACY VAULT ARCHITECTURE"}
                  {activeChip === "ai" && "URL THREAT SCANNER SPECIFICATION"}
                  {activeChip === "radar" && "PASSWORD ENTROPY ENGINE"}
                  {activeChip === "firewall" && "NETWORK TELEMETRY SPECIFICATION"}
                </div>
                <div className="text-slate-300 mt-0.5">
                  {activeChip === "shield" && "Encrypted client-side with AES-256-GCM. Master keys never leave your device browser storage."}
                  {activeChip === "ai" && "Parses destination URLs, checks certificate parameters, and evaluates homograph attack indicators."}
                  {activeChip === "radar" && "Zero-transmission entropy auditor assessing character space, dictionary patterns, and crack times."}
                  {activeChip === "firewall" && "Direct HTTP/HEAD probe measuring browser gateway latency, jitter, and transfer rates."}
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveChip(null)}
              className="text-cyan-400 hover:text-white px-3 py-1.5 rounded-lg bg-cyan-900/60 font-bold border border-cyan-500/40 hover:bg-cyan-800 transition-colors cursor-pointer self-end sm:self-center"
            >
              CLOSE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TacticalModuleCard({
  icon,
  title,
  metric,
  subtitle,
  tag,
  isActive,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  metric: string;
  subtitle: string;
  tag: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 cursor-pointer relative group flex flex-col justify-between min-h-[110px] ${
        isActive
          ? "bg-cyan-500/25 border-cyan-400 shadow-[0_0_25px_rgba(0,255,231,0.45)] scale-105"
          : "bg-black/60 border-cyan-500/25 hover:bg-cyan-500/10 hover:border-cyan-400/60 hover:scale-102 hover:shadow-[0_0_20px_rgba(0,255,231,0.2)]"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="p-2 rounded-xl bg-black/60 border border-cyan-500/20 group-hover:border-cyan-400/50 transition-colors">
          {icon}
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 font-bold">
          {tag}
        </span>
      </div>

      <div className="mt-2.5">
        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider truncate">
          {title}
        </div>
        <div className="text-sm sm:text-base font-mono font-black text-cyan-200 mt-0.5">
          {metric}
        </div>
        <div className="text-[10px] font-mono text-emerald-400/90 truncate">
          {subtitle}
        </div>
      </div>
    </div>
  );
}
