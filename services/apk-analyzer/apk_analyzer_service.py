#!/usr/bin/env python3
"""APK analyzer"""

import zipfile
import os
from datetime import datetime, timezone
import re
import json
import hashlib
import sys
import logging

logging.basicConfig(level=logging.WARNING)
logger = logging.getLogger(__name__)



DANGEROUS_PERMISSIONS = {
    "SEND_SMS": 4,
    "READ_SMS": 4,
    "RECEIVE_SMS": 3,
    "READ_CONTACTS": 3,
    "WRITE_CONTACTS": 4,
    "RECORD_AUDIO": 4,
    "CAMERA": 3,
    "READ_CALL_LOG": 4,
    "WRITE_CALL_LOG": 4,
    "CALL_PHONE": 4,
    "SYSTEM_ALERT_WINDOW": 5,
    "BIND_ACCESSIBILITY_SERVICE": 6,
    "BIND_DEVICE_ADMIN": 6,
    "REQUEST_INSTALL_PACKAGES": 5,
    "REQUEST_DELETE_PACKAGES": 4,
    "READ_EXTERNAL_STORAGE": 1,
    "WRITE_EXTERNAL_STORAGE": 2,
    "ACCESS_FINE_LOCATION": 3,
    "ACCESS_COARSE_LOCATION": 2,
    "GET_ACCOUNTS": 2,
    "READ_PHONE_STATE": 3,
    "PROCESS_OUTGOING_CALLS": 4,
    "MODIFY_AUDIO_SETTINGS": 2,
    "WRITE_SETTINGS": 3,
    "MOUNT_UNMOUNT_FILESYSTEMS": 3,
}

PERSISTENCE_RECEIVERS = [
    "android.intent.action.BOOT_COMPLETED",
    "android.provider.Telephony.SMS_RECEIVED",
    "android.intent.action.PACKAGE_ADDED",
    "android.intent.action.PACKAGE_REMOVED",
    "android.intent.action.USER_PRESENT",
    "android.intent.action.SCREEN_ON",
    "android.intent.action.SCREEN_OFF",
    "android.net.conn.CONNECTIVITY_CHANGE",
    "android.intent.action.NEW_OUTGOING_CALL",
]

SUSPICIOUS_APIS = [
    "Ljava/net/HttpURLConnection;",
    "Lokhttp3/OkHttpClient;",
    "Ljava/net/Socket;",
    "Ljavax/net/ssl/SSLContext;",
    "Ljavax/crypto/Cipher;",
    "Ljava/lang/reflect/Method;",
    "Ljava/lang/Runtime;->exec",
    "Landroid/accessibilityservice/AccessibilityService;",
    "Ldalvik/system/DexClassLoader;",
    "Ldalvik/system/PathClassLoader;",
    "Landroid/telephony/SmsManager;",
    "Landroid/app/admin/DevicePolicyManager;",
    "Ljava/lang/ProcessBuilder;",
]

# Better URL/IP patterns
URL_IP_REGEX = re.compile(
    r"(https?://[^\s\"'<>]+)|((?:\d{1,3}\.){3}\d{1,3})",
    re.IGNORECASE
)

OBFUSCATION_PATTERNS = [
    re.compile(r"^[a-z]{1,3}$"),  # Single/double/triple letter classes
    re.compile(r"^[A-Z]$"),  # Single capital letter
]

SUSPICIOUS_NATIVE_LIBS = [
    "libcrypt", "libssl", "libssh", "libtor", "libtun"
]



def sha256_file(path):
    """Calculate SHA256 hash of file"""
    try:
        h = hashlib.sha256()
        with open(path, "rb") as f:
            for chunk in iter(lambda: f.read(8192), b""):
                h.update(chunk)
        return h.hexdigest()
    except Exception as e:
        logger.error(f"SHA256 calculation error: {e}")
        return None


def normalize_permission(p):
    """Extract permission name from full permission string"""
    return p.split(".")[-1]


def is_obfuscated_name(name):
    """Check if a class/method name appears obfuscated"""
    simple_name = name.split("/")[-1].split(";")[0].split("$")[0]
    for pattern in OBFUSCATION_PATTERNS:
        if pattern.match(simple_name):
            return True
    return False


def calculate_entropy(data: bytes) -> float:
    """Calculate Shannon entropy"""
    if not data:
        return 0.0
    from collections import Counter
    import math
    counter = Counter(data)
    length = len(data)
    return -sum((c / length) * math.log2(c / length) for c in counter.values())


# Better Security Scanner

def scan_apk(apk_path: str) -> dict:
    """
    Full APK security analysis
    Returns detailed security report with risk scoring
    """
    report = {
        "meta": {
            "scan_time": datetime.utcnow().isoformat() + "Z",
            "apk_path": apk_path,
            "sha256": None,
        },
        "package": {},
        "permissions": {
            "declared": [],
            "dangerous": [],
            "critical": [],
        },
        "components": {
            "exported_activities": [],
            "exported_services": [],
            "exported_receivers": [],
            "exported_providers": [],
        },
        "persistence_indicators": [],
        "api_indicators": [],
        "network_indicators": {
            "urls_ips": [],
            "has_ssl_pinning": False,
        },
        "code_analysis": {
            "obfuscated": False,
            "obfuscation_ratio": 0.0,
            "dynamic_code_loading": False,
            "reflection_usage": False,
            "native_libraries": [],
        },
        "privacy_concerns": [],
        "risk": {
            "score": 0,
            "verdict": "UNKNOWN",
            "reasons": [],
            "breakdown": {},
        },
    }

    try:
        # Import androguard only when needed
        try:
            from androguard.core.apk import APK
            from androguard.misc import AnalyzeAPK
        except ImportError:
            logger.error("androguard not available - install with: pip install androguard")
            raise ImportError("androguard library is required for APK analysis")
        
        # Calculate file hash
        report["meta"]["sha256"] = sha256_file(apk_path)
        
        # Load APK + DEX analysis - THIS IS REAL APK ANALYSIS, NO MOCK DATA
        logger.info("Loading APK for deep analysis...")
        a, d, dx = AnalyzeAPK(apk_path)
        apk = APK(apk_path)

        # Package / SDK info - STRICT VALIDATION
        package_name = apk.get_package()
        if not package_name:
            raise ValueError("Failed to extract package name from APK. File may be invalid or corrupted.")
        
        report["package"] = {
            "name": package_name,
            "version_name": apk.get_androidversion_name(),
            "version_code": apk.get_androidversion_code(),
            "min_sdk": apk.get_min_sdk_version(),
            "target_sdk": apk.get_target_sdk_version(),
        }
        
        logger.info(f"✓ Analyzing real APK: {package_name}")

        # Check for outdated SDK
        target_sdk = apk.get_target_sdk_version()
        if target_sdk and int(target_sdk) < 28:
            report["risk"]["score"] += 2
            report["risk"]["reasons"].append(f"Outdated target SDK: {target_sdk} (should be 28+)")

        # Permissions Analysis
        perms = apk.get_permissions() or []
        report["permissions"]["declared"] = perms

        perm_score = 0
        for p in perms:
            short = normalize_permission(p)
            if short in DANGEROUS_PERMISSIONS:
                weight = DANGEROUS_PERMISSIONS[short]
                perm_info = {
                    "permission": p,
                    "short_name": short,
                    "weight": weight,
                }
                
                if weight >= 4:
                    report["permissions"]["critical"].append(perm_info)
                    perm_score += weight
                    report["risk"]["reasons"].append(f"Critical permission: {short}")
                else:
                    report["permissions"]["dangerous"].append(perm_info)
                    perm_score += weight
                    report["risk"]["reasons"].append(f"Dangerous permission: {short}")

        report["risk"]["score"] += perm_score
        report["risk"]["breakdown"]["permissions"] = perm_score

        # Exported Components Analysis
        component_score = 0
        
        # Exported Activities
        for act in (apk.get_activities() or []):
            try:
                if apk.get_activity_exported(act):
                    report["components"]["exported_activities"].append(act)
                    component_score += 1
            except:
                pass

        # Exported Services
        for srv in (apk.get_services() or []):
            try:
                if apk.get_service_exported(srv):
                    report["components"]["exported_services"].append(srv)
                    component_score += 3
                    report["risk"]["reasons"].append("Exported service detected")
            except:
                pass

        # Exported Receivers
        for rcv in (apk.get_receivers() or []):
            try:
                if apk.get_receiver_exported(rcv):
                    report["components"]["exported_receivers"].append(rcv)
                    component_score += 1
            except:
                pass

        # Exported Providers (high risk)
        for prov in (apk.get_providers() or []):
            try:
                if apk.get_provider_exported(prov):
                    report["components"]["exported_providers"].append(prov)
                    component_score += 4
                    report["risk"]["reasons"].append("Exported content provider")
            except:
                pass

        report["risk"]["score"] += component_score
        report["risk"]["breakdown"]["components"] = component_score

        # Persistence Indicators
        persistence_score = 0
        for rcv in (apk.get_receivers() or []):
            try:
                filters = apk.get_intent_filters("receiver", rcv)
                for f in filters:
                    for action in f.get("action", []):
                        if action in PERSISTENCE_RECEIVERS:
                            report["persistence_indicators"].append({
                                "receiver": rcv,
                                "action": action,
                            })
                            persistence_score += 3
                            report["risk"]["reasons"].append(f"Persistence via {action}")
            except:
                pass

        report["risk"]["score"] += persistence_score
        report["risk"]["breakdown"]["persistence"] = persistence_score

        # API Usage Analysis
        api_score = 0
        api_set = set()
        
        try:
            for m in dx.get_methods():
                m_str = str(m)
                for api in SUSPICIOUS_APIS:
                    if api in m_str:
                        api_set.add(api)
                        
                        # Higher weight for critical APIs
                        if "AccessibilityService" in api or "DevicePolicyManager" in api:
                            api_score += 5
                        elif "DexClassLoader" in api or "PathClassLoader" in api:
                            api_score += 4
                            report["code_analysis"]["dynamic_code_loading"] = True
                        elif "reflect" in api:
                            api_score += 2
                            report["code_analysis"]["reflection_usage"] = True
                        else:
                            api_score += 1

            report["api_indicators"] = sorted(api_set)
            
            if api_set:
                report["risk"]["reasons"].append(f"Suspicious APIs detected ({len(api_set)})")
        except Exception as e:
            logger.warning(f"API analysis failed: {e}")

        report["risk"]["score"] += api_score
        report["risk"]["breakdown"]["api_usage"] = api_score

        # Code Obfuscation Detection
        try:
            all_classes = dx.get_classes()
            obfuscated_count = 0
            total_count = len(list(all_classes))
            
            for cls in dx.get_classes():
                cls_name = cls.name
                if is_obfuscated_name(cls_name):
                    obfuscated_count += 1
            
            if total_count > 0:
                obfuscation_ratio = obfuscated_count / total_count
                report["code_analysis"]["obfuscation_ratio"] = round(obfuscation_ratio, 2)
                
                if obfuscation_ratio > 0.3:
                    report["code_analysis"]["obfuscated"] = True
                    report["risk"]["score"] += 3
                    report["risk"]["reasons"].append("Code appears obfuscated")
        except Exception as e:
            logger.warning(f"Obfuscation detection failed: {e}")

        # Native Libraries
        try:
            files = apk.get_files()
            native_libs = [f for f in files if f.startswith("lib/") and f.endswith(".so")]
            report["code_analysis"]["native_libraries"] = native_libs
            
            for lib in native_libs:
                lib_name = lib.split("/")[-1].lower()
                for suspicious in SUSPICIOUS_NATIVE_LIBS:
                    if suspicious in lib_name:
                        report["risk"]["score"] += 2
                        report["risk"]["reasons"].append(f"Suspicious native library: {lib_name}")
        except Exception as e:
            logger.warning(f"Native library analysis failed: {e}")

        # Network Indicators
        network_score = 0
        try:
            strings = a.get_strings()
            found_urls = set()
            
            for s in strings:
                matches = URL_IP_REGEX.findall(s)
                for match in matches:
                    url = match[0] if match[0] else match[1]
                    if url and len(url) > 7:
                        found_urls.add(url)
            
            # Check for SSL pinning
            ssl_keywords = ["CertificatePinner", "PinningTrustManager", "pinning"]
            for s in strings:
                if any(keyword in s for keyword in ssl_keywords):
                    report["network_indicators"]["has_ssl_pinning"] = True
                    break
            
            if found_urls:
                report["network_indicators"]["urls_ips"] = sorted(list(found_urls))[:50]
                network_score = min(5, len(found_urls) // 2)
                report["risk"]["reasons"].append(f"Hardcoded URLs/IPs found ({len(found_urls)})")
        except Exception as e:
            logger.warning(f"Network analysis failed: {e}")

        report["risk"]["score"] += network_score
        report["risk"]["breakdown"]["network"] = network_score

        # Privacy Concerns
        privacy_keywords = [
            "IMEI", "IMSI", "phone_number", "device_id", 
            "contact", "location", "gps", "tracking"
        ]
        
        try:
            for s in strings:
                s_lower = s.lower()
                for keyword in privacy_keywords:
                    if keyword in s_lower:
                        report["privacy_concerns"].append(keyword)
                        
            report["privacy_concerns"] = sorted(set(report["privacy_concerns"]))
            
            if report["privacy_concerns"]:
                report["risk"]["score"] += len(report["privacy_concerns"]) // 2
        except:
            pass

        # Verdict Calculation
        score = report["risk"]["score"]
        
        if score >= 20:
            verdict = "CRITICAL"
        elif score >= 15:
            verdict = "HIGH_RISK"
        elif score >= 8:
            verdict = "MEDIUM_RISK"
        elif score >= 3:
            verdict = "LOW_RISK"
        else:
            verdict = "MINIMAL_RISK"

        report["risk"]["verdict"] = verdict
        report["risk"]["reasons"] = sorted(set(report["risk"]["reasons"]))

        # Add recommendations
        report["recommendations"] = generate_recommendations(report)

    except Exception as e:
        logger.error(f"APK scan failed: {str(e)}")
        report["error"] = str(e)
        report["risk"]["verdict"] = "SCAN_FAILED"

    return report


def generate_recommendations(report):
    """Generate security recommendations based on scan results"""
    recommendations = []
    
    # SDK recommendations
    if report["package"].get("target_sdk"):
        target = int(report["package"]["target_sdk"])
        if target < 28:
            recommendations.append("Update target SDK to at least API 28 for better security")
    
    # Permission recommendations
    if len(report["permissions"]["critical"]) > 3:
        recommendations.append("Review and minimize critical permissions")
    
    # Component recommendations
    if report["components"]["exported_services"]:
        recommendations.append("Secure or unexport services if not needed publicly")
    
    if report["components"]["exported_providers"]:
        recommendations.append("Content providers should use proper permissions")
    
    # Code security
    if report["code_analysis"]["dynamic_code_loading"]:
        recommendations.append("Dynamic code loading detected - verify code sources")
    
    if not report["network_indicators"]["has_ssl_pinning"] and report["network_indicators"]["urls_ips"]:
        recommendations.append("Consider implementing SSL certificate pinning")
    
    # Privacy
    if report["privacy_concerns"]:
        recommendations.append("Ensure privacy policy covers data collection")
    
    return recommendations


# Certificate Extraction

def extract_cert_info(apk_path):
    """Extract and parse certificate information"""
    try:
        # Import cryptography only when needed
        try:
            from cryptography.hazmat.primitives.serialization import pkcs7, Encoding
        except ImportError:
            logger.warning("cryptography not available - certificate analysis will be limited")
            return {'error': 'Certificate analysis requires cryptography library'}
        
        with zipfile.ZipFile(apk_path, 'r') as zip_ref:
            # Find signature files
            cert_files = [f for f in zip_ref.namelist() 
                         if f.startswith('META-INF/') and (f.endswith('.RSA') or f.endswith('.DSA'))]
            
            if not cert_files:
                logger.warning("No signature certificate found")
                return {'error': 'No certificate found'}
            
            cert_file = cert_files[0]
            logger.info(f"Found certificate: {cert_file}")
            cert_data = zip_ref.read(cert_file)
            
            try:
                # Try parsing as PKCS7
                certs = pkcs7.load_der_pkcs7_certificates(cert_data)
                if certs and len(certs) > 0:
                    cert = certs[0]
                    der_bytes = cert.public_bytes(encoding=Encoding.DER)
                    
                    subject = cert.subject.rfc4514_string()
                    issuer = cert.issuer.rfc4514_string()
                    valid_from = cert.not_valid_before.strftime('%Y-%m-%d %H:%M:%S')
                    valid_to = cert.not_valid_after.strftime('%Y-%m-%d %H:%M:%S')
                    
                    # Calculate fingerprints
                    sha1_digest = hashlib.sha1(der_bytes).hexdigest().upper()
                    sha256_digest = hashlib.sha256(der_bytes).hexdigest().upper()
                    md5_digest = hashlib.md5(der_bytes).hexdigest().upper()
                    
                    sha1_fp = ':'.join([sha1_digest[i:i+2] for i in range(0, len(sha1_digest), 2)])
                    sha256_fp = ':'.join([sha256_digest[i:i+2] for i in range(0, len(sha256_digest), 2)])
                    md5_fp = ':'.join([md5_digest[i:i+2] for i in range(0, len(md5_digest), 2)])
                    
                    # Check validity
                    now_utc = datetime.now(timezone.utc)
                    not_before = cert.not_valid_before.replace(tzinfo=timezone.utc) if cert.not_valid_before.tzinfo is None else cert.not_valid_before
                    not_after = cert.not_valid_after.replace(tzinfo=timezone.utc) if cert.not_valid_after.tzinfo is None else cert.not_valid_after
                    is_valid = not_before <= now_utc <= not_after
                    
                    return {
                        'subject': subject,
                        'issuer': issuer,
                        'valid_from': valid_from,
                        'valid_to': valid_to,
                        'sha1': sha1_fp,
                        'sha256': sha256_fp,
                        'md5': md5_fp,
                        'is_valid': is_valid
                    }
            except Exception as e:
                logger.warning(f"Certificate parsing error: {e}")
                return {'error': f'Certificate parse failed: {str(e)}'}
    
    except Exception as e:
        logger.error(f"Certificate extraction error: {e}")
        return {'error': str(e)}


# Handler Function

def handler(event, context=None):
    """
    Handler for both serverless and direct invocation (Vercel references removed)
    """
    try:
        # Handle different input formats
        if isinstance(event, dict):
            body = event.get('body', event)
            if isinstance(body, str):
                body = json.loads(body)
        else:
            body = event
        
        apk_path = body.get('apk_path', '')
        
        if not apk_path:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'apk_path is required'})
            }
        
        if not os.path.exists(apk_path):
            return {
                'statusCode': 404,
                'body': json.dumps({'error': f'APK file not found: {apk_path}'})
            }
        
        # Run the analysis
        logger.info(f"Analyzing APK: {apk_path}")
        security_report = scan_apk(apk_path)
        
        # Validate results
        if security_report.get('error') or security_report['risk']['verdict'] == 'SCAN_FAILED':
            error_msg = security_report.get('error', 'APK analysis failed')
            return {
                'statusCode': 500,
                'body': json.dumps({'error': f'Analysis failed: {error_msg}'})
            }
        
        # Ensure we have valid package data
        package_name = security_report['package'].get('name')
        if not package_name or package_name == 'Unknown' or package_name is None:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Failed to extract package information from APK'})
            }
        
        # Get file size
        file_size = os.path.getsize(apk_path)
        
        # Extract certificate info
        cert_info = extract_cert_info(apk_path)
        
        # Build response data
        app_info = {
            'package': package_name,
            'version': security_report['package'].get('version_name') or 'Not specified',
            'version_code': security_report['package'].get('version_code') or 'Not specified',
            'min_sdk': security_report['package'].get('min_sdk') or 'Not specified',
            'target_sdk': security_report['package'].get('target_sdk') or 'Not specified',
            'activities': security_report['components'].get('exported_activities', [])[:15],
            'services': security_report['components'].get('exported_services', [])[:15],
            'receivers': security_report['components'].get('exported_receivers', [])[:10],
            'permissions': security_report['permissions'].get('declared', []),
            'file_size': file_size
        }
        
        permissions = security_report['permissions'].get('declared', [])
        if permissions is None:
            permissions = []
        
        # Create risk categories
        risks = {
            'critical': [],
            'high': [],
            'medium': [],
            'low': []
        }
        
        for reason in security_report['risk'].get('reasons', []):
            if 'Critical' in reason or 'CRITICAL' in reason:
                risks['critical'].append(reason)
            elif security_report['risk']['verdict'] in ['CRITICAL', 'HIGH_RISK']:
                risks['high'].append(reason)
            elif security_report['risk']['verdict'] == 'MEDIUM_RISK':
                risks['medium'].append(reason)
            else:
                risks['low'].append(reason)
        
        # Categorize permissions
        suspicious_perms = {
            'critical': [p['permission'] for p in security_report['permissions'].get('critical', [])],
            'high_risk': [p['permission'] for p in security_report['permissions'].get('dangerous', [])],
            'medium_risk': []
        }
        
        response_data = {
            'success': True,
            'app_info': app_info,
            'permissions': sorted(permissions),
            'certificate': cert_info,
            'risks': risks,
            'suspicious_perms': suspicious_perms,
            'filename': os.path.basename(apk_path),
            'security_scan': security_report
        }
        
        logger.info(f"Successfully analyzed: {package_name}")
        
        return {
            'statusCode': 200,
            'body': json.dumps(response_data)
        }
    
    except Exception as e:
        logger.error(f"Handler error: {str(e)}", exc_info=True)
        return {
            'statusCode': 500,
            'body': json.dumps({'error': f'Analysis failed: {str(e)}'})
        }


# CLI entry point

def main():
    """CLI entry point for testing"""
    if len(sys.argv) != 2:
        print("Usage: python apk_analyzer_service.py <apk_file>")
        print("Example: python apk_analyzer_service.py /path/to/app.apk")
        sys.exit(1)
    
    apk_file = sys.argv[1]
    
    if not os.path.exists(apk_file):
        print(f"Error: APK file '{apk_file}' not found")
        sys.exit(1)
    
    if not apk_file.endswith('.apk'):
        print("Error: File must be an APK (.apk extension)")
        sys.exit(1)
    
    print("=" * 60)
    print("APK Security Analyzer")
    print("=" * 60)
    print(f"Analyzing: {apk_file}")
    print()
    
    result = handler({'apk_path': apk_file})
    
    if result['statusCode'] == 200:
        data = json.loads(result['body'])
        print(json.dumps(data, indent=2))
    else:
        error_data = json.loads(result['body'])
        print(f"Error: {error_data.get('error', 'Unknown error')}")
        sys.exit(1)



# FastAPI Service Entrypoint
try:
    from fastapi import FastAPI, UploadFile, File, HTTPException
    import uvicorn
except ImportError:
    FastAPI = None
    uvicorn = None

if __name__ == "__main__":
    if FastAPI is None or uvicorn is None:
        print("FastAPI and uvicorn are required to run as a service. Install with: pip install fastapi uvicorn")
        sys.exit(1)

    app = FastAPI(title="APK Analyzer Service", description="Persistent APK analysis microservice.")

    @app.post("/analyze")
    async def analyze_apk(file: UploadFile = File(...)):
        if not file.filename.endswith('.apk'):
            raise HTTPException(status_code=400, detail="File must be an APK (.apk extension)")
        # Save uploaded file to a temp location
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix=".apk") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name
        try:
            result = handler({'apk_path': tmp_path})
            if result['statusCode'] == 200:
                return json.loads(result['body'])
            else:
                error_data = json.loads(result['body'])
                raise HTTPException(status_code=500, detail=error_data.get('error', 'Unknown error'))
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    print("[APK Analyzer Service] Starting FastAPI server on http://0.0.0.0:8003 ...")
    uvicorn.run(app, host="0.0.0.0", port=8003, log_level="warning")
