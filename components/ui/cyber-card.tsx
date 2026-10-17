"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"

interface CyberCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "hologram" | "matrix" | "circuit"
  glow?: boolean
}

const CyberCard = forwardRef<HTMLDivElement, CyberCardProps>(
  ({ className, variant = "default", glow = true, children, ...props }, ref) => {
    const baseClasses = "bg-card/30 backdrop-blur-sm border transition-all duration-300"

    const variantClasses = {
      default: "neon-border",
      hologram: "hologram",
      matrix: "matrix-bg neon-border",
      circuit: "circuit-pattern neon-border",
    }

    return (
      <Card ref={ref} className={cn(baseClasses, variantClasses[variant], glow && "hover-glow", className)} {...props}>
        {children}
      </Card>
    )
  },
)

CyberCard.displayName = "CyberCard"

export { CyberCard }
