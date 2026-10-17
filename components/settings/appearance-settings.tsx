"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Moon, Palette } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function AppearanceSettings() {
  const [darkMode, setDarkMode] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("mobicure_dark_mode")

    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === "true")
    }
  }, [])

  const handleDarkModeToggle = (enabled: boolean) => {
    setDarkMode(enabled)
    localStorage.setItem("mobicure_dark_mode", enabled.toString())

    // Apply theme to document
    if (enabled) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    toast({
      title: enabled ? "Dark Mode Enabled" : "Light Mode Enabled",
      description: `Switched to ${enabled ? "dark" : "light"} theme`,
    })
  }

  return (
    <Card className="bg-card/30 backdrop-blur-sm neon-border">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Palette className="h-6 w-6 text-primary glow-primary" />
          <CardTitle className="text-xl font-bold text-primary font-[var(--font-heading)]">
            Appearance
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dark Mode */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Moon className="h-5 w-5 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Dark Mode</p>
              <p className="text-xs text-muted-foreground">Use dark theme for better visibility</p>
            </div>
          </div>
          <Switch checked={darkMode} onCheckedChange={handleDarkModeToggle} />
        </div>
      </CardContent>
    </Card>
  )
}
