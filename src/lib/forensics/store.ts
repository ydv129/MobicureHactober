export type Scan = { filename: string; score: number; classification: string; time: number }

const key = "mobicure_scans"

export const getScans = (): Scan[] => {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(key) || "[]") } catch { return [] }
}

export const saveScan = (data: Omit<Scan, "time">) => {
  if (typeof window === "undefined") return
  const scans = getScans()
  scans.unshift({ ...data, time: Date.now() })
  localStorage.setItem(key, JSON.stringify(scans.slice(0, 20)))
}

export const getStats = () => {
  const scans = getScans()
  const total = scans.length
  const real = scans.filter((scan) => scan.score >= 60).length
  const avg = total ? Math.round(scans.reduce((sum, scan) => sum + scan.score, 0) / total) : 0
  return { total, real, fake: total - real, avg }
}
