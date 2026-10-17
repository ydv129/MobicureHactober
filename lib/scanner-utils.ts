export const safeNumber = (value: unknown, fallback = 0) => typeof value === "number" && Number.isFinite(value) ? value : fallback
export const safeText = (value: unknown, fallback = "Unavailable") => typeof value === "string" && value.trim() ? value : fallback
export const safeList = (value: unknown): unknown[] => Array.isArray(value) ? value : []
export const riskLabel = (score: number) => score >= 80 ? "LOW_RISK" : score >= 60 ? "MEDIUM_RISK" : score >= 40 ? "HIGH_RISK" : "CRITICAL"
