export async function forwardMultipart(baseUrl: string, path: string, form: FormData, timeout = 30000) {
  const response = await fetch(`${baseUrl}${path}`, { method: "POST", body: form, signal: AbortSignal.timeout(timeout) })
  const data = await response.json().catch(() => ({ error: "Invalid service response" }))
  if (!response.ok) throw Object.assign(new Error(data.error || "Python service failed"), { status: response.status, data })
  return data
}
