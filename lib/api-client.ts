type ApiData = Record<string, unknown>

export const api = {
	apk: {
		scan: (fd: FormData) => fetch("/api/tools/apk-analyzer", { method: "POST", body: fd }),
	},
	url: {
		scan: (data: ApiData) => fetch("/api/tools/url-threat-scanner", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		}),
	},
	email: {
		scan: (data: ApiData) => fetch("/api/tools/email-phishing-service", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		}),
	},
}
