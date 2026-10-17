#!/usr/bin/env python3
"""URL scanner"""

import json
import sys
from datetime import datetime
from urllib.parse import urlparse
import re
import warnings

warnings.filterwarnings('ignore')

# Try to import requests
try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False
    print("Warning: requests library not available. Install with: pip install requests", file=sys.stderr)

try:
    from phishing_detector import PhishingDetector
    PHISHING_DETECTOR_AVAILABLE = True
except ImportError:
    PHISHING_DETECTOR_AVAILABLE = False

try:
    from urlscan import URLScan
    URLSCAN_AVAILABLE = True
except ImportError:
    URLSCAN_AVAILABLE = False

try:
    from cloudflarescan import CloudflareScanner
    CLOUDFLARE_SCANNER_AVAILABLE = True
except ImportError:
    CLOUDFLARE_SCANNER_AVAILABLE = False

try:
    from urlscanner import URLScanner as GenericScanner
    GENERIC_SCANNER_AVAILABLE = True
except ImportError:
    GENERIC_SCANNER_AVAILABLE = False


class BetterURLThreatScanner:
    """Better URL threat scanner using multiple specialized libraries"""
    
    def __init__(self, urlscan_api_key=None):
        """Initialize scanner with optional API keys"""
        self.urlscan_api_key = urlscan_api_key
        
        # Check if requests is available
        if not REQUESTS_AVAILABLE:
            raise ImportError("requests library is required. Install with: pip install requests")
        
        # Initialize phishing detector if available
        if PHISHING_DETECTOR_AVAILABLE:
            try:
                self.phishing_detector = PhishingDetector()
            except:
                self.phishing_detector = None
        else:
            self.phishing_detector = None
        
        # Initialize URLScan if available and API key provided
        if URLSCAN_AVAILABLE and urlscan_api_key:
            try:
                self.urlscan = URLScan(api_key=urlscan_api_key)
            except:
                self.urlscan = None
        else:
            self.urlscan = None
        
        # Initialize Cloudflare scanner if available
        if CLOUDFLARE_SCANNER_AVAILABLE:
            try:
                self.cf_scanner = CloudflareScanner()
            except:
                self.cf_scanner = None
        else:
            self.cf_scanner = None
        
        # Initialize generic scanner if available
        if GENERIC_SCANNER_AVAILABLE:
            try:
                self.generic_scanner = GenericScanner()
            except:
                self.generic_scanner = None
        else:
            self.generic_scanner = None
    
    def validate_and_normalize_url(self, url):
        """Validate and normalize URL"""
        if not url or not isinstance(url, str):
            raise ValueError("URL must be a non-empty string")
        
        url = url.strip()
        
        # Add scheme if missing
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        # Parse and validate
        parsed = urlparse(url)
        if not parsed.hostname:
            raise ValueError(f"Invalid URL format: {url}")
        
        return url
    
    def full_scan(self, url):
        """Perform full URL threat analysis using all available libraries"""
        try:
            url = self.validate_and_normalize_url(url)
        except ValueError as e:
            return {
                "url": url,
                "timestamp": datetime.now().isoformat(),
                "error": str(e),
                "threat_score": 0,
                "risk_level": "Invalid URL",
                "libraries_used": []
            }
        
        results = {
            "url": url,
            "timestamp": datetime.now().isoformat(),
            "libraries_used": [],
            "phishing_analysis": {},
            "urlscan_analysis": {},
            "cloudflare_analysis": {},
            "generic_scan": {},
            "basic_checks": {},
        }
        
        # 1. Phishing Detection
        if self.phishing_detector:
            try:
                results["phishing_analysis"] = self.scan_with_phishing_detector(url)
                results["libraries_used"].append("phishing-detector")
            except Exception as e:
                results["phishing_analysis"] = {"error": str(e)}
        else:
            results["phishing_analysis"] = self.fallback_phishing_check(url)
            results["libraries_used"].append("fallback-phishing-check")
        
        # 2. URLScan.io Analysis
        if self.urlscan:
            try:
                results["urlscan_analysis"] = self.scan_with_urlscan(url)
                results["libraries_used"].append("urlscan-py")
            except Exception as e:
                results["urlscan_analysis"] = {"error": str(e)}
        else:
            results["urlscan_analysis"] = {"error": "URLScan API key not provided or library not available"}
        
        # 3. Cloudflare Security Check
        if self.cf_scanner:
            try:
                results["cloudflare_analysis"] = self.scan_with_cloudflare(url)
                results["libraries_used"].append("cloudflarescan")
            except Exception as e:
                results["cloudflare_analysis"] = {"error": str(e)}
        else:
            results["cloudflare_analysis"] = self.fallback_cloudflare_check(url)
            results["libraries_used"].append("fallback-cloudflare-check")
        
        # 4. Generic URL Scanner
        if self.generic_scanner:
            try:
                results["generic_scan"] = self.scan_with_generic_scanner(url)
                results["libraries_used"].append("urlscanner")
            except Exception as e:
                results["generic_scan"] = {"error": str(e)}
        else:
            results["generic_scan"] = self.fallback_generic_scan(url)
            results["libraries_used"].append("fallback-generic-scan")
        
        # 5. Basic Checks (always performed)
        results["basic_checks"] = self.perform_basic_checks(url)
        
        # Calculate threat metrics
        results["threat_score"] = self.calculate_threat_score(results)
        results["risk_level"] = self.determine_risk_level(results["threat_score"])
        results["threats"] = self.extract_threats(results)
        results["summary"] = self.generate_summary(results)
        
        return results
    
    def scan_with_phishing_detector(self, url):
        """Use phishing-detector library to analyze URL"""
        try:
            # PhishingDetector typical API
            result = self.phishing_detector.predict(url)
            
            return {
                "is_phishing": result.get("is_phishing", False),
                "confidence": result.get("confidence", 0.0),
                "features": result.get("features", {}),
                "risk_indicators": result.get("risk_indicators", []),
                "library": "phishing-detector"
            }
        except Exception as e:
            return {"error": str(e), "fallback": True}
    
    def fallback_phishing_check(self, url):
        """Fallback phishing check using pattern matching"""
        phishing_keywords = [
            "verify", "account", "suspended", "secure", "login", "signin",
            "paypal", "amazon", "microsoft", "bank", "update", "confirm",
            "validate", "authenticate", "credential", "password", "urgent"
        ]
        
        url_lower = url.lower()
        parsed = urlparse(url)
        domain = parsed.hostname or ""
        
        detected_keywords = [kw for kw in phishing_keywords if kw in url_lower]
        
        # Additional checks
        risk_indicators = []
        
        # Check for IP address as domain
        if re.match(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', domain):
            risk_indicators.append("IP address used instead of domain")
        
        # Check for excessive subdomains
        if domain.count('.') > 3:
            risk_indicators.append("Excessive subdomains")
        
        # Check for suspicious TLDs
        suspicious_tlds = ['.tk', '.ml', '.ga', '.cf', '.gq']
        if any(domain.endswith(tld) for tld in suspicious_tlds):
            risk_indicators.append("Suspicious TLD")
        
        # Check for unusual characters
        if '@' in url or '//' in parsed.path:
            risk_indicators.append("Unusual URL structure")
        
        is_phishing = len(detected_keywords) >= 2 or len(risk_indicators) >= 2
        confidence = min(0.95, (len(detected_keywords) * 0.2 + len(risk_indicators) * 0.3))
        
        return {
            "is_phishing": is_phishing,
            "confidence": confidence,
            "detected_keywords": detected_keywords,
            "risk_indicators": risk_indicators,
            "library": "fallback"
        }
    
    def scan_with_urlscan(self, url):
        """Use urlscan-py library to scan URL"""
        try:
            # Submit URL for scanning
            scan_result = self.urlscan.submit(url)
            scan_uuid = scan_result.get("uuid")
            
            if scan_uuid:
                # Wait for scan to complete and get results
                analysis = self.urlscan.result(scan_uuid)
                
                return {
                    "scan_id": scan_uuid,
                    "verdict": analysis.get("verdicts", {}),
                    "brands": analysis.get("brands", []),
                    "certificates": analysis.get("certificates", []),
                    "ip": analysis.get("ip", "Unknown"),
                    "asn": analysis.get("asn", "Unknown"),
                    "country": analysis.get("country", "Unknown"),
                    "malicious": analysis.get("verdicts", {}).get("overall", {}).get("malicious", False),
                    "library": "urlscan-py"
                }
            else:
                return {"error": "Failed to submit URL to URLScan"}
        except Exception as e:
            return {"error": str(e)}
    
    def scan_with_cloudflare(self, url):
        """Use cloudflarescan library to check Cloudflare security"""
        try:
            result = self.cf_scanner.scan(url)
            
            return {
                "protected_by_cloudflare": result.get("cloudflare_protected", False),
                "security_level": result.get("security_level", "unknown"),
                "waf_enabled": result.get("waf_enabled", False),
                "ddos_protection": result.get("ddos_protection", False),
                "ssl_enabled": result.get("ssl_enabled", False),
                "library": "cloudflarescan"
            }
        except Exception as e:
            return {"error": str(e)}
    
    def fallback_cloudflare_check(self, url):
        """Fallback Cloudflare detection by checking headers"""
        try:
            response = requests.head(url, timeout=10, allow_redirects=True)
            headers = response.headers
            
            # Check for Cloudflare indicators
            cf_protected = (
                'cf-ray' in headers or
                'cf-cache-status' in headers or
                'cloudflare' in headers.get('server', '').lower()
            )
            
            return {
                "protected_by_cloudflare": cf_protected,
                "server": headers.get('server', 'Unknown'),
                "cf_ray": headers.get('cf-ray'),
                "ssl_enabled": url.startswith('https://'),
                "library": "fallback"
            }
        except Exception as e:
            return {"error": str(e)}
    
    def scan_with_generic_scanner(self, url):
        """Use generic urlscanner library"""
        try:
            result = self.generic_scanner.scan(url)
            
            return {
                "status": result.get("status", "unknown"),
                "security_score": result.get("security_score", 0),
                "threats_detected": result.get("threats", []),
                "metadata": result.get("metadata", {}),
                "library": "urlscanner"
            }
        except Exception as e:
            return {"error": str(e)}
    
    def fallback_generic_scan(self, url):
        """Fallback generic URL scanning"""
        try:
            response = requests.get(url, timeout=10, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            })
            
            content = response.text
            
            # Analyze response
            suspicious_patterns = [
                r'<script[^>]*>.*?(eval|unescape|fromCharCode).*?</script>',
                r'<iframe[^>]*src=["\']https?://[^"\']*["\']',
                r'onclick=["\'].*?(window\.open|document\.location)',
            ]
            
            detected_patterns = []
            for pattern in suspicious_patterns:
                if re.search(pattern, content, re.IGNORECASE | re.DOTALL):
                    detected_patterns.append(pattern)
            
            return {
                "status_code": response.status_code,
                "content_length": len(content),
                "content_type": response.headers.get('content-type', ''),
                "suspicious_patterns_found": len(detected_patterns),
                "has_javascript": '<script' in content.lower(),
                "has_iframes": '<iframe' in content.lower(),
                "external_links": len(re.findall(r'https?://', content)),
                "library": "fallback"
            }
        except Exception as e:
            return {"error": str(e)}
    
    def perform_basic_checks(self, url):
        """Perform basic URL checks"""
        parsed = urlparse(url)
        domain = parsed.hostname or ""
        
        checks = {
            "uses_https": parsed.scheme == "https",
            "has_port": parsed.port is not None,
            "port": parsed.port or (443 if parsed.scheme == "https" else 80),
            "domain_length": len(domain),
            "url_length": len(url),
            "path_length": len(parsed.path),
            "has_query": bool(parsed.query),
            "subdomain_count": domain.count('.'),
        }
        
        # URL length checks
        if checks["url_length"] > 100:
            checks["url_length_warning"] = "Very long URL (potential obfuscation)"
        
        if checks["domain_length"] > 50:
            checks["domain_length_warning"] = "Very long domain name"
        
        return checks
    
    def calculate_threat_score(self, results):
        """Calculate full threat score (0-100, higher is safer)"""
        score = 100
        
        # Phishing analysis
        phishing = results.get("phishing_analysis", {})
        if phishing.get("is_phishing"):
            confidence = phishing.get("confidence", 0.5)
            score -= int(40 * confidence)
        
        # URLScan analysis
        urlscan = results.get("urlscan_analysis", {})
        if urlscan.get("malicious"):
            score -= 50
        
        # Cloudflare analysis
        cloudflare = results.get("cloudflare_analysis", {})
        if cloudflare.get("protected_by_cloudflare"):
            score += 5  # Slight bonus for Cloudflare protection
        
        # Generic scan
        generic = results.get("generic_scan", {})
        if "security_score" in generic:
            score = (score + generic["security_score"]) / 2
        
        threats_count = len(generic.get("threats_detected", []))
        if threats_count > 0:
            score -= min(30, threats_count * 10)
        
        # Basic checks
        basic = results.get("basic_checks", {})
        if not basic.get("uses_https"):
            score -= 15
        
        if "url_length_warning" in basic:
            score -= 10
        
        if "domain_length_warning" in basic:
            score -= 10
        
        return max(0, min(100, int(score)))
    
    def determine_risk_level(self, score):
        """Determine risk level from threat score"""
        if score >= 80:
            return "Low Risk"
        elif score >= 60:
            return "Medium Risk"
        elif score >= 40:
            return "High Risk"
        else:
            return "Critical Risk"
    
    def extract_threats(self, results):
        """Extract list of detected threats"""
        threats = []
        
        # From phishing analysis
        phishing = results.get("phishing_analysis", {})
        if phishing.get("is_phishing"):
            threats.append(f"Phishing detected (confidence: {phishing.get('confidence', 0):.0%})")
        
        for indicator in phishing.get("risk_indicators", []):
            threats.append(f"Phishing indicator: {indicator}")
        
        # From URLScan
        urlscan = results.get("urlscan_analysis", {})
        if urlscan.get("malicious"):
            threats.append("Marked as malicious by URLScan.io")
        
        # From generic scan
        generic = results.get("generic_scan", {})
        for threat in generic.get("threats_detected", []):
            threats.append(threat)
        
        # From basic checks
        basic = results.get("basic_checks", {})
        if not basic.get("uses_https"):
            threats.append("Not using HTTPS")
        
        if "url_length_warning" in basic:
            threats.append(basic["url_length_warning"])
        
        if "domain_length_warning" in basic:
            threats.append(basic["domain_length_warning"])
        
        return threats
    
    def generate_summary(self, results):
        """Generate summary for frontend display"""
        parsed = urlparse(results["url"])
        domain = parsed.hostname or "Unknown"
        
        summary = {
            "domain": domain,
            "scheme": parsed.scheme,
            "uses_https": parsed.scheme == "https",
            "protected_by_cloudflare": results.get("cloudflare_analysis", {}).get("protected_by_cloudflare", False),
            "phishing_risk": results.get("phishing_analysis", {}).get("is_phishing", False),
            "urlscan_status": "scanned" if "scan_id" in results.get("urlscan_analysis", {}) else "not_scanned",
            "threat_count": len(results.get("threats", [])),
        }
        
        # Extract IP and location from URLScan if available
        urlscan = results.get("urlscan_analysis", {})
        if "error" not in urlscan:
            summary["ip_address"] = urlscan.get("ip", "Unknown")
            summary["country"] = urlscan.get("country", "Unknown")
            summary["asn"] = urlscan.get("asn", "Unknown")
        else:
            summary["ip_address"] = "Unknown"
            summary["country"] = "Unknown"
            summary["asn"] = "Unknown"
        
        return summary


def handler(request):
    """Python Function Handler for HTTP requests (Vercel references removed)"""
    try:
        if isinstance(request, dict):  # dict format
            body = request.get('body', {})
            if isinstance(body, str):
                body = json.loads(body)
        else:  # Direct function call
            body = request
        
        url = body.get('url', '')
        urlscan_api_key = body.get('urlscan_api_key')
        
        if not url:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'URL is required'})
            }
        
        scanner = BetterURLThreatScanner(urlscan_api_key=urlscan_api_key)
        results = scanner.full_scan(url)
        
        return {
            'statusCode': 200,
            'body': json.dumps(results)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }


def main():
    """Main function for command-line usage"""
    if len(sys.argv) < 2:
        print("=" * 70)
        print("URL THREAT SCANNER - Full URL Security Analysis")
        print("=" * 70)
        print("\nUsage:")
        print("  python3 url_threat_scanner_service.py <url> [urlscan_api_key]")
        print("\nExamples:")
        print("  python3 url_threat_scanner_service.py https://example.com")
        print("  python3 url_threat_scanner_service.py https://example.com YOUR_API_KEY")
        print("\nLibraries:")
        print("  ✓ phishing-detector   - ML-based phishing detection")
        print("  ✓ urlscan-py         - URLScan.io integration (requires API key)")
        print("  ✓ cloudflarescan     - Cloudflare security detection")
        print("  ✓ urlscanner         - Generic URL scanning")
        print("\nInstallation:")
        print("  pip install phishing-detector urlscan-py cloudflarescan requests")
        print("\nNote: Script works with fallbacks if libraries are not installed")
        print("=" * 70)
        sys.exit(1)
    
    url = sys.argv[1]
    urlscan_api_key = sys.argv[2] if len(sys.argv) > 2 else None
    
    try:
        scanner = BetterURLThreatScanner(urlscan_api_key=urlscan_api_key)
        results = scanner.full_scan(url)
        print(json.dumps(results, indent=2))
    except Exception as e:
        error_result = {
            "error": str(e),
            "url": url,
            "timestamp": datetime.now().isoformat(),
            "message": "Failed to scan URL. Please check your input and try again."
        }
        print(json.dumps(error_result, indent=2), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
