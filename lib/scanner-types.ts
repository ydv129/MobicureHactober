export type RiskLevel = "LOW_RISK" | "MEDIUM_RISK" | "HIGH_RISK" | "CRITICAL" | "UNKNOWN" | "SCAN_FAILED" | "INCOMPLETE"
export type ScannerError = { error: string; analysis_mode?: "failed" | "limited"; retryable?: boolean }
export type ScannerResult = { legitimacy_score?: number; classification?: string; warnings?: string[]; forensics?: Record<string, unknown>; details?: Record<string, unknown> }
