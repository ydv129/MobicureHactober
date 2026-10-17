"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"

interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "success" | "destructive" | "ghost"
  size?: "sm" | "md" | "lg"
  glitch?: boolean
  scan?: boolean
}

const CyberButton = forwardRef<HTMLButtonElement, CyberButtonProps>(
  ({ className, variant = "primary", size = "md", glitch = false, scan = false, children, ...props }, ref) => {
    const baseClasses = "relative overflow-hidden font-bold transition-all duration-300 border"

    const variantClasses = {
      primary: "bg-primary/10 hover:bg-primary/20 text-primary border-primary/30 hover:border-primary/50 glow-primary",
      success: "bg-success/10 hover:bg-success/20 text-success border-success/30 hover:border-success/50 glow-success",
      destructive:
        "bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/30 hover:border-destructive/50 glow-destructive",
      ghost:
        "bg-transparent hover:bg-primary/10 text-foreground hover:text-primary border-transparent hover:border-primary/30",
    }

    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    }

    return (
      <Button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          glitch && "glitch-text",
          scan && "scan-line",
          "hover-glow neon-border",
          className,
        )}
        data-text={glitch ? children : undefined}
        {...props}
      >
        {children}
      </Button>
    )
  },
)

CyberButton.displayName = "CyberButton"

export { CyberButton }
