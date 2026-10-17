"use client"

import { useEffect, useMemo, useRef, useState } from "react"

type Packet = {
  id: string
  url: string
  duration: number
  size: number
  protocol: string
  timestamp: number
}

type ResourceWithProtocol = PerformanceResourceTiming & {
  nextHopProtocol?: string
}

export default function NetworkPacketAnalyzer() {
  const [packets, setPackets] = useState<Packet[]>([])
  const [filter, setFilter] = useState("")
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const load = () => {
      const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[]
      const real = resources.slice(-100).map((resource) => {
        const resourceWithProtocol = resource as ResourceWithProtocol
        return {
          id: resource.name.slice(-50),
          url: resource.name,
          duration: Math.round(resource.duration),
          size: resource.transferSize || 0,
          protocol: resourceWithProtocol.nextHopProtocol || "h2",
          timestamp: Date.now(),
        }
      })
      setPackets(real)
    }

    load()
    intervalRef.current = setInterval(load, 2000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const filtered = useMemo(
    () => packets.filter((packet) => packet.url.toLowerCase().includes(filter.toLowerCase())),
    [packets, filter],
  )

  return (
    <div className="p-4">
      <input
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
        placeholder="Filter URL"
        className="border p-2 mb-4 w-full"
      />
      <div>
        {filtered.map((packet) => (
          <div key={`${packet.id}-${packet.timestamp}`} className="text-xs border-b py-1">
            {packet.protocol} {packet.duration}ms {packet.url.slice(0, 80)}
          </div>
        ))}
      </div>
    </div>
  )
}