export type Scan = { filename: string; score: number; classification: string; time: number }
const KEY = "mobicure_scans"
export const saveScan = (scan: Omit<Scan,"time">) => {
  if (typeof window === "undefined") return
  const all: Scan[] = JSON.parse(localStorage.getItem(KEY) || "[]")
  all.unshift({ ...scan, time: Date.now() })
  localStorage.setItem(KEY, JSON.stringify(all.slice(0,50)))
}
export const getScans = (): Scan[] => {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(KEY) || "[]") } catch { return [] }
}
export const getStats = () => {
  const scans = getScans()
  const total = scans.length
  const real = scans.filter(s=>s.score>=60).length
  const fake = scans.filter(s=>s.score<60).length
  const avg = total ? Math.round(scans.reduce((a,b)=>a+b.score,0)/total) : 0
  return { total, real, fake, avg }
}
