import type { Metadata } from "next"
import { DashboardWidgets } from "@/components/dashboard-widgets"
import { AnimatedBackground } from "@/components/ui/animated-background"
import { CommandCenterHero } from "@/components/command-center-hero"
import { siteConfig } from "@/config/site"

export const metadata: Metadata = {
  title: "Dashboard",
  description: siteConfig.description,
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
          <CommandCenterHero />
          <DashboardWidgets />
        </main>
      </div>
    </div>
  )
}
