export type ExternalIntelligence = { virustotal: "available" | "unavailable"; urlscan: "available" | "unavailable"; abusech: "available" | "unavailable" }
export const unavailableThreatIntel: ExternalIntelligence = { virustotal: "unavailable", urlscan: "unavailable", abusech: "unavailable" }
