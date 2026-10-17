type VirusTotalResult = {
  malicious: number
  suspicious: number
  harmless: number
  vt_link: string
  source: "virustotal-live-api"
}

type AbuseCHResult = {
  found: boolean
  threat?: unknown
  reporter?: unknown
  source: "abuse-ch-live"
}

type ThreatIntelResult = {
  virustotal: VirusTotalResult | null
  abusech: AbuseCHResult | null
}

type VirusTotalResponse = {
  data?: {
    id?: string
    attributes?: {
      last_analysis_stats?: {
        malicious?: number
        suspicious?: number
        harmless?: number
      }
      stats?: {
        malicious?: number
        suspicious?: number
        harmless?: number
      }
    }
  }
}

export async function checkVirusTotalURL(url: string): Promise<VirusTotalResult | null> {
  const apiKey = process.env.VIRUSTOTAL_API_KEY
  if (!apiKey) return null

  try {
    const id = Buffer.from(url).toString("base64").replace(/=+$/, "")
    const headers = { "x-apikey": apiKey }
    let response = await fetch(`https://www.virustotal.com/api/v3/urls/${id}`, { headers })
    let responseData: VirusTotalResponse

    if (response.status === 404) {
      response = await fetch("https://www.virustotal.com/api/v3/urls", {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ url }),
      })
      if (!response.ok) return null

      const submission = await response.json() as VirusTotalResponse
      const analysisId = submission.data?.id
      if (!analysisId) return null

      response = await fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, { headers })
      if (!response.ok) return null
      responseData = await response.json() as VirusTotalResponse
    } else {
      if (!response.ok) return null
      responseData = await response.json() as VirusTotalResponse
    }

    const stats = responseData.data?.attributes?.last_analysis_stats
      ?? responseData.data?.attributes?.stats
    if (!stats) return null

    return {
      malicious: stats.malicious ?? 0,
      suspicious: stats.suspicious ?? 0,
      harmless: stats.harmless ?? 0,
      vt_link: `https://www.virustotal.com/gui/url/${id}/detection`,
      source: "virustotal-live-api",
    }
  } catch {
    return null
  }
}

export async function checkAbuseCH(url: string): Promise<AbuseCHResult | null> {
  try {
    const response = await fetch("https://urlhaus-api.abuse.ch/v1/url/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ url }),
    })
    if (!response.ok) return null

    const data = await response.json() as {
      query_status?: string
      threat?: unknown
      reporter?: unknown
    }
    if (data.query_status === "ok") {
      return {
        found: true,
        threat: data.threat,
        reporter: data.reporter,
        source: "abuse-ch-live",
      }
    }

    return {
      found: false,
      source: "abuse-ch-live",
    }
  } catch {
    return null
  }
}

export async function checkURLHausAndVT(url: string): Promise<ThreatIntelResult> {
  const [virustotal, abusech] = await Promise.all([
    checkVirusTotalURL(url),
    checkAbuseCH(url),
  ])
  return { virustotal, abusech }
}

export const checkURLThreat = checkURLHausAndVT
