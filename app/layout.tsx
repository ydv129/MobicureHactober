import type React from "react"
import type { Metadata, Viewport } from "next"
import { Montserrat, Open_Sans } from "next/font/google"
import { Navbar } from "@/components/navbar"
import { Chatbot } from "@/components/chatbot/chatbot"
import { CommandPalette } from "@/components/command-palette"
import { SiteFooter } from "@/components/footer"
import { siteConfig } from "@/config/site"
import "./globals.css"

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
})

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  generator: `developed by ${siteConfig.creator}`,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.creator }],
  creator: siteConfig.creator,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.png", type: "image/png", sizes: "192x192" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#00ffe7",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${montserrat.variable} ${openSans.variable} min-h-screen flex flex-col antialiased selection:bg-cyan-500/30 selection:text-cyan-200 bg-black text-slate-100`}
        suppressHydrationWarning
      >
        <CommandPalette />
        <Navbar />
        <div className="flex-1 w-full flex flex-col">{children}</div>
        <SiteFooter />
        <Chatbot />
      </body>
    </html>
  )
}

