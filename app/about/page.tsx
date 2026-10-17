"use client"

import {
  Shield,
  Zap,
  Lock,
  Globe,
  FileText,
  Smartphone,
  Eye,
  QrCode,
  Network,
  AlertTriangle,
  Search,
  Key,
  Archive,
  ImageIcon,
  Mail,
} from "lucide-react"

export default function AboutPage() {
  const tools = [
    {
      name: "URL Threat Scanner",
      icon: <Globe className="h-8 w-8" />,
      description:
        "Advanced URL analysis with malware detection and phishing pattern recognition using real-time threat databases.",
      features: [
        "Malware Database Scanning",
        "Phishing Detection",
        "Domain Reputation Check",
      ],
    },
    {
      name: "Network Scanner",
      icon: <Network className="h-8 w-8" />,
      description:
        "Comprehensive network security analysis including port scanning, vulnerability assessment, and device discovery with detailed security reporting.",
      features: ["Port Scanning", "Vulnerability Assessment", "Device Discovery", "Network Topology Mapping"],
    },
    {
      name: "APK Analyzer",
      icon: <Smartphone className="h-8 w-8" />,
      description:
        "Deep Android application analysis examining permissions, components, security vulnerabilities, and malware detection with detailed reporting.",
      features: ["Permission Analysis", "Component Scanning", "Malware Detection", "Certificate Validation"],
    },
    {
      name: "PDF Security Scanner",
      icon: <FileText className="h-8 w-8" />,
      description:
        "Advanced PDF security analysis detecting JavaScript exploits, embedded threats, metadata extraction, and content security assessment.",
      features: ["JavaScript Detection", "Embedded Threat Analysis", "Metadata Extraction", "Content Security Check"],
    },
    {
      name: "ZIP File Scanner",
      icon: <Archive className="h-8 w-8" />,
      description:
        "Comprehensive archive analysis with malware detection, content scanning, compression bomb detection, and nested file analysis.",
      features: ["Malware Detection", "Content Analysis", "Compression Bomb Detection", "Nested File Scanning"],
    },
    {
      name: "Image scanner",
      icon: <ImageIcon className="h-8 w-8" />,
      description:
        "Extract and analyze image metadata including EXIF data, GPS coordinates, camera information, and privacy risk assessment.",
      features: ["EXIF Data Extraction", "GPS Coordinate Analysis", "Camera Information", "Privacy Risk Assessment"],
    },
    {
      name: "Email Phishing Detector",
      icon: <Mail className="h-8 w-8" />,
      description:
        "Advanced email security analysis detecting phishing attempts, suspicious links, sender reputation, and social engineering tactics.",
      features: ["Phishing Detection", "Link Analysis", "Sender Reputation", "Social Engineering Detection"],
    },
    {
      name: "QR Code Scanner",
      icon: <QrCode className="h-8 w-8" />,
      description:
        "Secure QR code analysis with malicious URL detection, content verification, and safety assessment before execution.",
      features: ["Malicious URL Detection", "Content Verification", "Safety Assessment", "Real-time Analysis"],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Shield className="h-20 w-20 text-cyan-400 animate-pulse" />
              <div className="absolute -top-2 -right-2">
                <Zap className="h-8 w-8 text-green-400 animate-bounce" />
              </div>
            </div>
          </div>
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400 mb-4 animate-pulse">
            MOBICURE
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Advanced Cybersecurity Command Center providing comprehensive security analysis, threat detection, and
            privacy protection tools for modern digital environments.
          </p>
        </div>

        <div className="mb-16">
          <div className="bg-black/50 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-8 hover:border-cyan-400/50 transition-all duration-300">
            <h2 className="text-3xl font-bold text-cyan-400 mb-6 flex items-center">
              <Eye className="h-8 w-8 mr-3 animate-pulse" />
              Our Mission
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              MOBICURE is designed to provide cybersecurity professionals and privacy-conscious users with a
              comprehensive suite of security analysis tools. Our platform combines advanced threat detection algorithms
              with real-time analysis capabilities to ensure maximum protection against modern cyber threats.
            </p>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center text-cyan-400 mb-12 animate-pulse">Security Tools Arsenal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map((tool, index) => (
              <div
                key={index}
                className="bg-black/50 backdrop-blur-md border border-cyan-500/30 rounded-xl p-6 hover:border-cyan-400/50 hover:scale-105 transition-all duration-300 group cursor-crosshair"
              >
                <div className="flex items-center mb-4">
                  <div className="text-cyan-400 group-hover:text-green-400 transition-colors duration-300">
                    {tool.icon}
                  </div>
                  <h3 className="text-xl font-bold text-cyan-400 ml-3 group-hover:text-green-400 transition-colors duration-300">
                    {tool.name}
                  </h3>
                </div>
                <p className="text-gray-300 mb-4 leading-relaxed">{tool.description}</p>
                <div className="space-y-2">
                  {tool.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center text-sm text-gray-400">
                      <div className="h-2 w-2 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center text-cyan-400 mb-12 animate-pulse">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-black/50 backdrop-blur-md border border-cyan-500/30 rounded-xl hover:border-cyan-400/50 transition-all duration-300 hover:scale-105 cursor-crosshair">
              <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4 animate-bounce" />
              <h3 className="text-lg font-bold text-cyan-400 mb-2">Real-time Threat Detection</h3>
              <p className="text-gray-400 text-sm">Advanced algorithms detect threats as they emerge</p>
            </div>
            <div className="text-center p-6 bg-black/50 backdrop-blur-md border border-cyan-500/30 rounded-xl hover:border-cyan-400/50 transition-all duration-300 hover:scale-105 cursor-crosshair">
              <Lock className="h-12 w-12 text-green-400 mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-bold text-cyan-400 mb-2">Privacy Protection</h3>
              <p className="text-gray-400 text-sm">Secure vault with AES-256 encryption</p>
            </div>
            <div className="text-center p-6 bg-black/50 backdrop-blur-md border border-cyan-500/30 rounded-xl hover:border-cyan-400/50 transition-all duration-300 hover:scale-105 cursor-crosshair">
              <Search className="h-12 w-12 text-yellow-400 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-bold text-cyan-400 mb-2">Deep Analysis</h3>
              <p className="text-gray-400 text-sm">Comprehensive security assessments</p>
            </div>
            <div className="text-center p-6 bg-black/50 backdrop-blur-md border border-cyan-500/30 rounded-xl hover:border-cyan-400/50 transition-all duration-300 hover:scale-105 cursor-crosshair">
              <Key className="h-12 w-12 text-purple-400 mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-bold text-cyan-400 mb-2">Zero Trust Security</h3>
              <p className="text-gray-400 text-sm">Never trust, always verify approach</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
