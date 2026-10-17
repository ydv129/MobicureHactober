"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Globe,
  Shield,
  Network,
  Mail,
  Key,
  Smartphone,
  ImageIcon,
  QrCode,
  Camera,
  Activity,
  Lock,
  Settings,
  HelpCircle,
  Search,
  Sparkles,
  RefreshCw,
  Terminal,
  Copy,
  Check,
  X,
} from "lucide-react";

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: "Tools" | "Navigation" | "Actions";
  icon: any;
  action: () => void;
  badge?: string;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setSelectedIndex(0);
  }, []);

  const commands: CommandItem[] = [
    // Tools
    {
      id: "tool-url",
      title: "URL Threat Scanner",
      subtitle: "Phishing & malware forensic analysis for web URLs",
      category: "Tools",
      icon: Globe,
      action: () => {
        router.push("/tools?tool=url-threat-scanner");
        close();
      },
      badge: "Core",
    },
    {
      id: "tool-apk",
      title: "APK Security Analyzer",
      subtitle: "Deep Android manifest, certificate & component scan",
      category: "Tools",
      icon: Smartphone,
      action: () => {
        router.push("/tools?tool=apk-analyzer");
        close();
      },
      badge: "Mobile",
    },
    {
      id: "tool-browser",
      title: "Browser Vulnerability Scanner",
      subtitle: "Check browser engine & known CVE vulnerabilities",
      category: "Tools",
      icon: Shield,
      action: () => {
        router.push("/tools?tool=browser-vulnerability-scanner");
        close();
      },
    },
    {
      id: "tool-network",
      title: "Network Packet Analyzer",
      subtitle: "Live packet capture, protocol dissection & anomaly check",
      category: "Tools",
      icon: Network,
      action: () => {
        router.push("/tools?tool=network-packet-analyzer");
        close();
      },
    },
    {
      id: "tool-email",
      title: "Phishing Email Detector",
      subtitle: "Detect header spoofing, deceptive links & social engineering",
      category: "Tools",
      icon: Mail,
      action: () => {
        router.push("/tools?tool=phishing-email-detector");
        close();
      },
    },
    {
      id: "tool-password",
      title: "Password Strength Checker",
      subtitle: "Entropy score, brute-force crack time & generator",
      category: "Tools",
      icon: Key,
      action: () => {
        router.push("/tools?tool=password-strength-checker");
        close();
      },
    },
    {
      id: "tool-image",
      title: "Image Metadata Scanner",
      subtitle: "Extract EXIF, GPS telemetry & privacy leak analysis",
      category: "Tools",
      icon: ImageIcon,
      action: () => {
        router.push("/tools?tool=image-metadata-scanner");
        close();
      },
    },
    {
      id: "tool-qr-gen",
      title: "Secure QR Code Generator",
      subtitle: "Generate cryptographically verifiable QR codes",
      category: "Tools",
      icon: QrCode,
      action: () => {
        router.push("/tools?tool=qr-code-generator");
        close();
      },
    },
    {
      id: "tool-qr-scan",
      title: "QR Code Threat Scanner",
      subtitle: "Decode & sandbox malicious payloads before executing",
      category: "Tools",
      icon: Camera,
      action: () => {
        router.push("/tools?tool=qr-code-scanner");
        close();
      },
    },

    // Navigation
    {
      id: "nav-dash",
      title: "Command Center Dashboard",
      subtitle: "Main system overview, telemetry widgets & network live metrics",
      category: "Navigation",
      icon: Activity,
      action: () => {
        router.push("/");
        close();
      },
    },
    {
      id: "nav-tools",
      title: "Security Arsenal Catalog",
      subtitle: "Browse all 9 active forensic defense modules",
      category: "Navigation",
      icon: Shield,
      action: () => {
        router.push("/tools");
        close();
      },
    },
    {
      id: "nav-vault",
      title: "Privacy Vault",
      subtitle: "Zero-knowledge encrypted credential & sensitive documents vault",
      category: "Navigation",
      icon: Lock,
      action: () => {
        router.push("/vault");
        close();
      },
      badge: "Encrypted",
    },
    {
      id: "nav-settings",
      title: "System Settings",
      subtitle: "Manage security parameters, appearance & local data",
      category: "Navigation",
      icon: Settings,
      action: () => {
        router.push("/settings");
        close();
      },
    },
    {
      id: "nav-about",
      title: "About MOBICURE Platform",
      subtitle: "Lead Architect Neeraj Yadav & defense specs",
      category: "Navigation",
      icon: HelpCircle,
      action: () => {
        router.push("/about");
        close();
      },
    },

    // Actions
    {
      id: "act-copy-ip",
      title: "Copy Public IP to Clipboard",
      subtitle: "Retrieve current external network address",
      category: "Actions",
      icon: copied ? Check : Copy,
      action: async () => {
        try {
          const res = await fetch("https://api.ipify.org?format=json");
          const data = await res.json();
          if (data.ip) {
            await navigator.clipboard.writeText(data.ip);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }
        } catch {
          await navigator.clipboard.writeText("127.0.0.1");
        }
        close();
      },
    },
    {
      id: "act-run-pulse",
      title: "Run Diagnostic Pulse",
      subtitle: "Probe system sockets, latency & threat telemetry",
      category: "Actions",
      icon: RefreshCw,
      action: () => {
        router.push("/");
        close();
        window.dispatchEvent(new CustomEvent("trigger-diagnostic-pulse"));
      },
      badge: "Diagnostic",
    },
  ];

  const filteredCommands = query.trim()
    ? commands.filter(
        (c) =>
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.subtitle.toLowerCase().includes(query.toLowerCase()) ||
          c.category.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Keyboard navigation within list
  useEffect(() => {
    if (!isOpen) return;

    const handleListNav = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev <= 0 ? filteredCommands.length - 1 : prev - 1
        );
      } else if (e.key === "Enter" && filteredCommands[selectedIndex]) {
        e.preventDefault();
        filteredCommands[selectedIndex].action();
      }
    };

    window.addEventListener("keydown", handleListNav);
    return () => window.removeEventListener("keydown", handleListNav);
  }, [isOpen, selectedIndex, filteredCommands]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={close}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-cyan-500/40 bg-gradient-to-b from-slate-950/95 via-black/95 to-cyan-950/40 shadow-[0_20px_70px_rgba(34,211,238,0.25)] text-slate-100 animate-slideDown"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-cyan-500/25 px-5 py-4 bg-white/5">
          <Terminal className="h-5 w-5 text-cyan-400 mr-3 animate-pulse" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search tool (e.g. 'URL', 'APK', 'Network')..."
            autoFocus
            className="w-full bg-transparent font-mono text-base text-cyan-200 placeholder:text-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-slate-400 hover:text-cyan-300 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded bg-black/60 border border-cyan-500/30 px-2 py-0.5 text-[11px] font-mono text-cyan-300 ml-3">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-3 space-y-1 custom-scrollbar">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-mono text-sm">
              <Search className="h-8 w-8 text-cyan-500/40 mx-auto mb-2 animate-bounce" />
              NO DEFENSE PROTOCOLS MATCHING "{query}"
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? "bg-cyan-500/20 border border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.25)] translate-x-1"
                      : "hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`p-2 rounded-lg transition-colors ${
                        isSelected
                          ? "bg-cyan-400/20 text-cyan-300 shadow-[0_0_10px_#00ffe7]"
                          : "bg-white/5 text-slate-400"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-sm font-bold truncate ${
                            isSelected ? "text-cyan-200" : "text-slate-200"
                          }`}
                        >
                          {cmd.title}
                        </span>
                        {cmd.badge && (
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 font-bold">
                            {cmd.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {cmd.subtitle}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider shrink-0 pl-3">
                    {cmd.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="flex items-center justify-between border-t border-cyan-500/20 px-5 py-2.5 bg-black/60 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-cyan-300">↑↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-cyan-300">↵</kbd>
              <span>Execute</span>
            </span>
          </div>
          <span className="text-cyan-400/80">MOBICURE MATRIX • v2.0</span>
        </div>
      </div>
    </div>
  );
}
