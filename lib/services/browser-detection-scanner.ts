/**
 * Comprehensive Browser Detection and Fingerprinting Utility
 * Scans browser capabilities, security features, and system information
 */

export interface BrowserFingerprint {
  browser: {
    name: string
    version: string
    engine: string
  }
  os: {
    name: string
    version: string
  }
  device: {
    type: string
    screenResolution: string
    screenDensity: number
    hardwareConcurrency: number
    deviceMemory: number
  }
  security: {
    isSecureContext: boolean
    usesHTTPS: boolean
    mixedContentDetected: boolean
    cookiesEnabled: boolean
    referrerPolicy: string
  }
  storage: {
    localStorageAvailable: boolean
    sessionStorageAvailable: boolean
    indexedDBAvailable: boolean
    cookieStorage: boolean
  }
  webAPIs: {
    webCryptoAvailable: boolean
    serviceWorkerAvailable: boolean
    webRTCAvailable: boolean
    clipboardAPIAvailable: boolean
    geolocationAvailable: boolean
    notificationAPIAvailable: boolean
    vibrationAPIAvailable: boolean
    batteryAPIAvailable: boolean
    mediaDevicesAvailable: boolean
    paymentRequestAvailable: boolean
    webSocketsAvailable: boolean
    webGLAvailable: boolean
  }
  permissions: {
    cameraPermission: string
    microphonePermission: string
    geolocationPermission: string
    notificationPermission: string
  }
  network: {
    effectiveType: string
    downlink: number | null
    rtt: number | null
    saveData: boolean
  }
  userAgent: {
    raw: string
    platform: string
    language: string
    languages: string[]
    timezone: string
    timeOffset: number
  }
  detection: {
    isHeadless: boolean
    isAutomated: boolean
    isBotLikely: boolean
    domTamperingDetected: boolean
    extensionIndicators: boolean
    redirectDetected: boolean
  }
  fingerprint: {
    screenFingerprint: string
    canvasFingerprint: string
    webGLFingerprint: string
    audioFingerprint: string
  }
  timestamps: {
    scanTime: string
    scanDuration: number
  }
}

export class BrowserDetectionScanner {
  private startTime: number = Date.now()

  /**
   * Execute full browser scan
   */
  async scan(): Promise<BrowserFingerprint> {
    try {
      const scanStart = Date.now()

      const result: BrowserFingerprint = {
        browser: this.detectBrowser(),
        os: this.detectOS(),
        device: this.detectDevice(),
        security: this.detectSecurity(),
        storage: this.detectStorage(),
        webAPIs: await this.detectWebAPIs(),
        permissions: await this.detectPermissions(),
        network: this.detectNetwork(),
        userAgent: this.parseUserAgent(),
        detection: await this.detectBotSignals(),
        fingerprint: await this.generateFingerprints(),
        timestamps: {
          scanTime: new Date().toISOString(),
          scanDuration: Date.now() - scanStart,
        },
      }

      return result
    } catch (error) {
      console.error("Browser scan error:", error)
      throw error
    }
  }

  /**
   * Detect browser name and version
   */
  private detectBrowser(): BrowserFingerprint["browser"] {
    const ua = navigator.userAgent
    let name = "Unknown"
    let version = "Unknown"
    let engine = "Unknown"

    // Browser detection with version parsing
    const browserTests = [
      {
        regex: /Chrome\/(\d+\.\d+\.\d+\.\d+|\d+\.\d+\.\d+|\d+)/i,
        name: "Chrome",
        engine: "Blink",
      },
      {
        regex: /Firefox\/(\d+\.\d+\.\d+|\d+\.\d+|\d+)/i,
        name: "Firefox",
        engine: "Gecko",
      },
      {
        regex: /Safari\/\d+.*Version\/(\d+\.\d+\.\d+|\d+\.\d+|\d+)/i,
        name: "Safari",
        engine: "WebKit",
      },
      {
        regex: /Edg(?:e)?\/(\d+\.\d+\.\d+\.\d+|\d+\.\d+\.\d+|\d+)/i,
        name: "Edge",
        engine: "Blink",
      },
      {
        regex: /Opera\/.*Version\/(\d+\.\d+\.\d+|\d+\.\d+|\d+)/i,
        name: "Opera",
        engine: "Blink",
      },
      {
        regex: /MSIE\s(\d+\.\d+)/i,
        name: "IE",
        engine: "Trident",
      },
    ]

    for (const test of browserTests) {
      const match = ua.match(test.regex)
      if (match) {
        name = test.name
        version = match[1] || "Unknown"
        engine = test.engine
        break
      }
    }

    return { name, version, engine }
  }

  /**
   * Detect operating system
   */
  private detectOS(): BrowserFingerprint["os"] {
    const ua = navigator.userAgent
    let name = "Unknown"
    let version = "Unknown"

    // Windows detection with proper Windows 11 support
    const windowsMatch = ua.match(/Windows NT (\d+\.\d+)/i)
    if (windowsMatch) {
      name = "Windows"
      const versionNum = windowsMatch[1]
      
      // Windows version mapping
      const versionMap: { [key: string]: string } = {
        "10.0": this.detectWindows11() ? "11" : "10",
        "6.3": "8.1",
        "6.2": "8",
        "6.1": "7",
      }
      
      version = versionMap[versionNum] || versionNum
      return { name, version }
    }

    const osTests = [
      { regex: /Mac OS X ([\d_.]+)/i, name: "macOS" },
      { regex: /Android (\d+\.?\d*)/i, name: "Android" },
      { regex: /iPhone OS (\d+_\d+)/i, name: "iOS" },
      { regex: /iPad OS (\d+_\d+)/i, name: "iPadOS" },
      { regex: /Linux/i, name: "Linux" },
      { regex: /CrOS/i, name: "ChromeOS" },
      { regex: /FreeBSD/i, name: "FreeBSD" },
    ]

    for (const test of osTests) {
      const match = ua.match(test.regex)
      if (match) {
        name = test.name
        version = match[1] || "Unknown"

        // Clean up version strings
        version = version.replace(/_/g, ".")
        break
      }
    }

    return { name, version }
  }

  /**
   * Detect Windows 11 specifically
   */
  private detectWindows11(): boolean {
    const ua = navigator.userAgent
    
    // Windows 11 indicators in user agent
    if (ua.includes("Windows NT 10.0")) {
      // Check for Windows 11 specific patterns
      // Chrome/Edge on Windows 11 includes "Windows NT 10.0" with specific build info
      if (ua.includes("Win64") || ua.includes("WOW64")) {
        // Windows 11 typically comes with recent browser versions
        // Additional check: look for pattern that indicates Windows 11
        
        // For Chrome/Edge: Windows 11 is detected by presence of certain version combinations
        const chromeMatch = ua.match(/Chrome\/(\d+)/)
        if (chromeMatch) {
          const chromeVersion = parseInt(chromeMatch[1])
          // Chrome 89+ on Windows 10 indicates likely Windows 11
          // More reliable: check for specific OS build info if available
        }
        
        // Firefox and Safari on Windows 11 show specific patterns
        if (ua.includes("Firefox") || ua.includes("Safari")) {
          // Additional heuristics could be added
        }
      }
      
      // Try to detect via navigator.platform (deprecated but still useful for this)
      // Windows 11 64-bit would show "Win32" or "Win64"
      if (navigator.platform === "Win32" || navigator.platform === "Win64") {
        // Check if running on 64-bit with recent browser versions
        if (ua.includes("Win64") && !ua.includes("WOW64")) {
          // Strong indicator of Windows 11 x64
          return this.isLikelyWindows11()
        }
      }
    }
    
    return false
  }

  /**
   * Heuristic check for Windows 11
   */
  private isLikelyWindows11(): boolean {
    // Windows 11 indicators:
    // 1. Modern browser versions (Chrome 89+, Edge 89+, Firefox 87+)
    // 2. Win64 in user agent
    // 3. WebGL2 support
    
    const ua = navigator.userAgent.toLowerCase()
    
    // Check browser version indicators of Windows 11 era
    const chromeMatch = ua.match(/chrome\/(\d+)/)
    const edgeMatch = ua.match(/edg\/(\d+)/)
    const firefoxMatch = ua.match(/firefox\/(\d+)/)
    
    // If very recent browser versions, likely Windows 11
    if (chromeMatch && parseInt(chromeMatch[1]) >= 95) return true
    if (edgeMatch && parseInt(edgeMatch[1]) >= 95) return true
    if (firefoxMatch && parseInt(firefoxMatch[1]) >= 95) return true
    
    // Check for WebGL2 (more common on Windows 11 with modern browsers)
    try {
      const canvas = document.createElement("canvas")
      if (canvas.getContext("webgl2")) {
        // WebGL2 + Win64 + recent OS build
        return true
      }
    } catch {
      // Ignore
    }
    
    // If Win64 and has modern APIs
    if (ua.includes("win64")) {
      // Check for newer APIs that Windows 11 typically has
      if (navigator.clipboard && navigator.mediaDevices) {
        return true
      }
    }
    
    return false
  }

  /**
   * Detect device information
   */
  private detectDevice(): BrowserFingerprint["device"] {
    const screen = window.screen
    const nav = navigator as Navigator & { deviceMemory?: number }

    return {
      type: this.detectDeviceType(),
      screenResolution: `${screen.width}x${screen.height}`,
      screenDensity: window.devicePixelRatio || 1,
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      deviceMemory: nav.deviceMemory || 0,
    }
  }

  /**
   * Detect device type
   */
  private detectDeviceType(): string {
    const ua = navigator.userAgent.toLowerCase()

    if (/mobile|android|iphone|ipad|ipod|windows phone|blackberry|opera mini/.test(ua)) {
      if (/ipad/.test(ua)) return "Tablet"
      return "Mobile"
    }

    return "Desktop"
  }

  /**
   * Detect security features
   */
  private detectSecurity(): BrowserFingerprint["security"] {
    const referrerPolicyMeta = document.querySelector('meta[name="referrer"]')
    const referrerPolicy = referrerPolicyMeta?.getAttribute('content') || "no-referrer-when-downgrade"
    return {
      isSecureContext: window.isSecureContext || false,
      usesHTTPS: window.location.protocol === "https:",
      mixedContentDetected: this.detectMixedContent(),
      cookiesEnabled: this.checkCookiesEnabled(),
      referrerPolicy,
    }
  }

  /**
   * Detect mixed content
   */
  private detectMixedContent(): boolean {
    if (!window.isSecureContext) return false

    const images = document.querySelectorAll("img")
    const scripts = document.querySelectorAll("script")
    const links = document.querySelectorAll("link")

    for (const img of images) {
      if (img.src && img.src.startsWith("http://")) return true
    }

    for (const script of scripts) {
      if (script.src && script.src.startsWith("http://")) return true
    }

    for (const link of links) {
      if (link.href && link.href.startsWith("http://")) return true
    }

    return false
  }

  /**
   * Check if cookies are enabled
   */
  private checkCookiesEnabled(): boolean {
    if (!navigator.cookieEnabled) return false

    try {
      document.cookie = "test=1;path=/"
      const enabled = document.cookie.indexOf("test=") !== -1
      document.cookie = "test=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;"
      return enabled
    } catch {
      return false
    }
  }

  /**
   * Detect storage capabilities
   */
  private detectStorage(): BrowserFingerprint["storage"] {
    return {
      localStorageAvailable: this.testStorage("localStorage"),
      sessionStorageAvailable: this.testStorage("sessionStorage"),
      indexedDBAvailable: !!window.indexedDB,
      cookieStorage: navigator.cookieEnabled,
    }
  }

  /**
   * Test storage availability
   */
  private testStorage(type: "localStorage" | "sessionStorage"): boolean {
    try {
      const storage = window[type]
      const test = "__test__"
      storage.setItem(test, test)
      storage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  /**
   * Detect available Web APIs
   */
  private async detectWebAPIs(): Promise<BrowserFingerprint["webAPIs"]> {
    return {
      webCryptoAvailable: !!window.crypto && !!window.crypto.subtle,
      serviceWorkerAvailable: !!navigator.serviceWorker,
      webRTCAvailable: await this.detectWebRTC(),
      clipboardAPIAvailable: !!navigator.clipboard,
      geolocationAvailable: !!navigator.geolocation,
      notificationAPIAvailable: !!window.Notification,
      vibrationAPIAvailable: !!navigator.vibrate,
      batteryAPIAvailable: !!(navigator as unknown as { getBattery?: () => Promise<unknown> }).getBattery,
      mediaDevicesAvailable: !!navigator.mediaDevices,
      paymentRequestAvailable: !!window.PaymentRequest,
      webSocketsAvailable: !!window.WebSocket,
      webGLAvailable: this.detectWebGL(),
    }
  }

  /**
   * Detect WebRTC availability
   */
  private async detectWebRTC(): Promise<boolean> {
    try {
      const legacyWindow = window as Window & {
        webkitRTCPeerConnection?: typeof RTCPeerConnection
        mozRTCPeerConnection?: typeof RTCPeerConnection
      }
      const Ctor = window.RTCPeerConnection || legacyWindow.webkitRTCPeerConnection || legacyWindow.mozRTCPeerConnection
      if (!Ctor) return false
      const pc = new Ctor()
      pc.close()
      return true
    } catch {
      return false
    }
  }

  /**
   * Detect WebGL support
   */
  private detectWebGL(): boolean {
    try {
      const canvas = document.createElement("canvas")
      return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    } catch {
      return false
    }
  }

  /**
   * Detect permissions status
   */
  private async detectPermissions(): Promise<BrowserFingerprint["permissions"]> {
    const permissions: BrowserFingerprint["permissions"] = {
      cameraPermission: "unknown",
      microphonePermission: "unknown",
      geolocationPermission: "unknown",
      notificationPermission: "unknown",
    }

    if (!navigator.permissions) return permissions

    const permissionChecks = [
      { name: "camera", key: "cameraPermission" },
      { name: "microphone", key: "microphonePermission" },
      { name: "geolocation", key: "geolocationPermission" },
      { name: "notifications", key: "notificationPermission" },
    ]

    for (const check of permissionChecks) {
      try {
        const result = await navigator.permissions.query({ name: check.name as PermissionName })
        permissions[check.key as keyof BrowserFingerprint["permissions"]] = result.state
      } catch {
        // Permission not supported
      }
    }

    return permissions
  }

  /**
   * Detect network information
   */
  private detectNetwork(): BrowserFingerprint["network"] {
    const navWithConn = navigator as unknown as {
      connection?: { effectiveType?: string; downlink?: number; rtt?: number; saveData?: boolean }
      mozConnection?: { effectiveType?: string; downlink?: number; rtt?: number; saveData?: boolean }
      webkitConnection?: { effectiveType?: string; downlink?: number; rtt?: number; saveData?: boolean }
    }
    const connection = navWithConn.connection || navWithConn.mozConnection || navWithConn.webkitConnection

    if (!connection) {
      return {
        effectiveType: "unknown",
        downlink: null,
        rtt: null,
        saveData: false,
      }
    }

    return {
      effectiveType: connection.effectiveType || "unknown",
      downlink: connection.downlink || null,
      rtt: connection.rtt || null,
      saveData: connection.saveData || false,
    }
  }

  /**
   * Parse user agent details
   */
  private parseUserAgent(): BrowserFingerprint["userAgent"] {
    return {
      raw: navigator.userAgent,
      platform: navigator.platform || "Unknown",
      language: navigator.language || "Unknown",
      languages: Array.from(navigator.languages || []),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timeOffset: new Date().getTimezoneOffset(),
    }
  }

  /**
   * Detect bot and automation signals
   */
  private async detectBotSignals(): Promise<BrowserFingerprint["detection"]> {
    return {
      isHeadless: this.detectHeadless(),
      isAutomated: this.detectAutomation(),
      isBotLikely: await this.assessBotLikelihood(),
      domTamperingDetected: this.detectDOMTampering(),
      extensionIndicators: this.detectExtensionIndicators(),
      redirectDetected: this.detectRedirects(),
    }
  }

  /**
   * Detect headless browser
   */
  private detectHeadless(): boolean {
    const ua = navigator.userAgent.toLowerCase()
    return /headless|phantom|puppeteer|nightmare|splash|crawl|bot|spider|scraper|curl|wget|python|java|perl|ruby|node|go/.test(
      ua
    )
  }

  /**
   * Detect automation tools
   */
  private detectAutomation(): boolean {
    const win = window as Window & {
      __nightmare?: unknown
      __puppeteer?: unknown
      callPhantom?: unknown
      _phantom?: unknown
      mockWebDriver?: unknown
    }

    const checks = [
      () => !!win.__nightmare,
      () => !!win.__puppeteer,
      () => !!win.callPhantom,
      () => !!win._phantom,
      () => document.documentElement.getAttribute("webdriver") === "true",
      () => !!navigator.webdriver,
      () => document.documentElement.getAttribute("_saucelabs") === "true",
      () => !!win.mockWebDriver,
    ]

    return checks.some((check) => {
      try {
        return check()
      } catch {
        return false
      }
    })
  }

  /**
   * Assess if browser behaves like a bot
   */
  private async assessBotLikelihood(): Promise<boolean> {
    const indicators: boolean[] = []

    // Check for missing common plugins
    if (navigator.plugins.length === 0) indicators.push(true)

    // Check for unusual user agent
    if (this.detectHeadless()) indicators.push(true)

    // Check for missing languages
    if ((navigator.languages || []).length === 0) indicators.push(true)

    // Check for unusual screen resolution
    if (window.screen.width === 0 || window.screen.height === 0) indicators.push(true)

    // Check for timing anomalies
    if (performance.now() < 100) indicators.push(true)

    // Bot is likely if multiple indicators present
    return indicators.length >= 2
  }

  /**
   * Detect DOM tampering
   */
  private detectDOMTampering(): boolean {
    const checks = [
      () => {
        try {
          // Check if common DOM methods are overridden
          return Object.getOwnPropertyDescriptor(HTMLElement.prototype, "onclick")?.set !== undefined
        } catch {
          return false
        }
      },
      () => {
        try {
          // Check for modified querySelector
          return !document.querySelector.toString().includes("[native code]")
        } catch {
          return false
        }
      },
      () => {
        try {
          // Check for modified addEventListener
          return !window.addEventListener.toString().includes("[native code]")
        } catch {
          return false
        }
      },
    ]

    return checks.some((check) => {
      try {
        return check()
      } catch {
        return false
      }
    })
  }

  /**
   * Detect browser extension indicators
   */
  private detectExtensionIndicators(): boolean {
    const win = window as Window & { chrome?: { runtime?: { id?: string; sendMessage?: unknown } } }

    // Check for common extension patterns
    const extensionTests = [
      () => false,
      () => !!win.chrome?.runtime?.id,
      () => {
        const fnString = document.getElementById?.toString() || ""
        const isNative = /\[native code\]/.test(fnString)
        return isNative === false
      },
      () => {
        // Check for injected scripts
        const scripts = document.getElementsByTagName("script")
        for (let i = 0; i < scripts.length; i++) {
          if (scripts[i].src && scripts[i].src.includes("chrome-extension://")) return true
        }
        return false
      },
      () => {
        // Check for extension-specific APIs
        try {
          return !!(win.chrome && win.chrome.runtime && win.chrome.runtime.sendMessage)
        } catch {
          return false
        }
      },
    ]

    return extensionTests.some((test) => {
      try {
        return test()
      } catch {
        return false
      }
    })
  }

  /**
   * Detect client-side redirects
   */
  private detectRedirects(): boolean {
    // Check for common redirect indicators
    if (window.location.href !== document.URL) return true

    // Check for meta refresh tags
    const metaRefresh = document.querySelector('meta[http-equiv="refresh"]')
    if (metaRefresh) return true

    // Check for redirect scripts
    const scripts = document.getElementsByTagName("script")
    for (let i = 0; i < scripts.length; i++) {
      const content = scripts[i].textContent || ""
      if (content.includes("window.location") || content.includes("window.replace")) return true
    }

    return false
  }

  /**
   * Generate fingerprints
   */
  private async generateFingerprints(): Promise<BrowserFingerprint["fingerprint"]> {
    return {
      screenFingerprint: this.generateScreenFingerprint(),
      canvasFingerprint: await this.generateCanvasFingerprint(),
      webGLFingerprint: this.generateWebGLFingerprint(),
      audioFingerprint: await this.generateAudioFingerprint(),
    }
  }

  /**
   * Generate screen fingerprint
   */
  private generateScreenFingerprint(): string {
    const screen = window.screen
    const data = `${screen.width}x${screen.height}x${screen.colorDepth}x${screen.pixelDepth}x${window.devicePixelRatio}`
    return this.hashString(data)
  }

  /**
   * Generate canvas fingerprint
   */
  private async generateCanvasFingerprint(): Promise<string> {
    try {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) return "unavailable"

      canvas.width = 280
      canvas.height = 60

      ctx.textBaseline = "top"
      ctx.font = "14px Arial"
      ctx.textBaseline = "alphabetic"
      ctx.fillStyle = "#f60"
      ctx.fillRect(125, 1, 62, 20)
      ctx.fillStyle = "#069"
      ctx.fillText("BrowserScanner", 2, 15)
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)"
      ctx.fillText("BrowserScanner", 4, 17)

      return this.hashString(canvas.toDataURL())
    } catch {
      return "unavailable"
    }
  }

  /**
   * Generate WebGL fingerprint
   */
  private generateWebGLFingerprint(): string {
    try {
      const canvas = document.createElement("canvas")
      const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null

      if (!gl) return "unavailable"

      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info") as
        | { UNMASKED_VENDOR_WEBGL: number; UNMASKED_RENDERER_WEBGL: number }
        | null
      if (!debugInfo) return "unavailable"

      const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) as string
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string

      return this.hashString(`${vendor}|${renderer}`)
    } catch {
      return "unavailable"
    }
  }

  /**
   * Generate audio fingerprint
   */
  private async generateAudioFingerprint(): Promise<string> {
    try {
      const legacyWindow = window as Window & { webkitAudioContext?: typeof AudioContext }
      const Ctor = window.AudioContext || legacyWindow.webkitAudioContext
      if (!Ctor) return "unavailable"
      const audioContext = new Ctor()
      const oscillator = audioContext.createOscillator()
      const analyser = audioContext.createAnalyser()
      const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1)
      const gain = audioContext.createGain()

      gain.gain.value = 0 // Mute
      oscillator.connect(analyser)
      analyser.connect(scriptProcessor)
      scriptProcessor.connect(gain)
      gain.connect(audioContext.destination)

      return this.hashString(`${audioContext.sampleRate}|${audioContext.state}`)
    } catch {
      return "unavailable"
    }
  }

  /**
   * Simple hash function
   */
  private hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16)
  }
}

// Export default instance
export const browserScanner = new BrowserDetectionScanner()
