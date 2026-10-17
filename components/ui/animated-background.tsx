"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const createParticles = () => {
      const particles: Particle[] = []
      const particleCount = Math.min(50, Math.floor((canvas.width * canvas.height) / 15000))

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.2,
          color: Math.random() > 0.5 ? "#00ffe7" : "#3fff7d",
        })
      }

      particlesRef.current = particles
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connections
      const particles = particlesRef.current
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(0, 255, 231, ${0.1 * (1 - distance / 100)})`
            ctx.lineWidth = 0.5
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      // Update and draw particles
      particles.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        // Keep particles in bounds
        particle.x = Math.max(0, Math.min(canvas.width, particle.x))
        particle.y = Math.max(0, Math.min(canvas.height, particle.y))

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `${particle.color}${Math.floor(particle.opacity * 255)
          .toString(16)
          .padStart(2, "0")}`
        ctx.fill()

        // Add glow effect
        ctx.shadowColor = particle.color
        ctx.shadowBlur = 10
        ctx.fill()
        ctx.shadowBlur = 0
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    resizeCanvas()
    createParticles()
    animate()

    const handleResize = () => {
      resizeCanvas()
      createParticles()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" style={{ background: "transparent" }} />
  )
}
