#!/usr/bin/env python3
"""Email scanner"""

import sys
import json
import re
from datetime import datetime
from typing import Dict, List

class EmailPhishingDetector:
    def __init__(self):
        self.phishing_keywords = [
            'urgent', 'verify', 'suspended', 'click here', 'confirm', 'account',
            'password', 'security', 'update', 'billing', 'expire', 'limited time',
            'winner', 'congratulations', 'claim', 'prize', 'lottery', 'inheritance'
        ]
        
        self.suspicious_domains = [
            'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly',
            '.tk', '.ml', '.ga', '.cf', '.gq'
        ]
    
    def analyze_email(self, email_content: str, sender: str = "", subject: str = "") -> Dict:
        """Analyze email for phishing indicators"""
        
        indicators = []
        risk_score = 0
        
        # Check sender
        if sender:
            sender_analysis = self._analyze_sender(sender)
            if sender_analysis['suspicious']:
                indicators.extend(sender_analysis['reasons'])
                risk_score += 25
        
        # Check subject
        if subject:
            subject_analysis = self._analyze_subject(subject)
            if subject_analysis['suspicious']:
                indicators.extend(subject_analysis['reasons'])
                risk_score += 20
        
        # Check content
        content_analysis = self._analyze_content(email_content)
        indicators.extend(content_analysis['indicators'])
        risk_score += content_analysis['risk_score']
        
        # Check URLs
        url_analysis = self._analyze_urls(email_content)
        if url_analysis['suspicious_urls']:
            indicators.append(f"Contains {len(url_analysis['suspicious_urls'])} suspicious URLs")
            risk_score += len(url_analysis['suspicious_urls']) * 15
        
        # Determine threat level
        if risk_score >= 70:
            threat_level = "HIGH"
        elif risk_score >= 40:
            threat_level = "MEDIUM"
        elif risk_score >= 20:
            threat_level = "LOW"
        else:
            threat_level = "SAFE"
        
        return {
            "is_phishing": risk_score >= 40,
            "threat_level": threat_level,
            "risk_score": min(100, risk_score),
            "indicators": indicators,
            "suspicious_urls": url_analysis['suspicious_urls'],
            "recommendations": self._generate_recommendations(threat_level),
            "scan_timestamp": datetime.now().isoformat()
        }
    
    def _analyze_sender(self, sender: str) -> Dict:
        """Analyze sender address"""
        suspicious = False
        reasons = []
        
        # Check for spoofed display name
        if '<' in sender and '>' in sender:
            display_name = sender.split('<')[0].strip()
            email_addr = sender.split('<')[1].split('>')[0]
            
            # Check if display name contains suspicious keywords
            for keyword in ['paypal', 'amazon', 'microsoft', 'apple', 'bank']:
                if keyword in display_name.lower() and keyword not in email_addr.lower():
                    suspicious = True
                    reasons.append(f"Display name '{display_name}' doesn't match email domain")
        
        # Check for suspicious TLDs
        for tld in self.suspicious_domains:
            if tld in sender.lower():
                suspicious = True
                reasons.append(f"Sender uses suspicious domain: {tld}")
        
        return {'suspicious': suspicious, 'reasons': reasons}
    
    def _analyze_subject(self, subject: str) -> Dict:
        """Analyze email subject"""
        suspicious = False
        reasons = []
        
        subject_lower = subject.lower()
        
        # Check for urgency indicators
        urgency_words = ['urgent', 'immediate', 'action required', 'expires', 'suspended']
        for word in urgency_words:
            if word in subject_lower:
                suspicious = True
                reasons.append(f"Subject contains urgency indicator: '{word}'")
        
        # Check for excessive punctuation
        if subject.count('!') >= 3 or subject.count('?') >= 3:
            suspicious = True
            reasons.append("Excessive punctuation in subject")
        
        return {'suspicious': suspicious, 'reasons': reasons}
    
    def _analyze_content(self, content: str) -> Dict:
        """Analyze email content"""
        indicators = []
        risk_score = 0
        
        content_lower = content.lower()
        
        # Check for phishing keywords
        keyword_count = 0
        for keyword in self.phishing_keywords:
            if keyword in content_lower:
                keyword_count += 1
        
        if keyword_count >= 5:
            indicators.append(f"Contains {keyword_count} phishing-related keywords")
            risk_score += 20
        elif keyword_count >= 3:
            indicators.append(f"Contains {keyword_count} suspicious keywords")
            risk_score += 10
        
        # Check for suspicious patterns
        if re.search(r'verify.*account', content_lower):
            indicators.append("Requests account verification")
            risk_score += 15
        
        if re.search(r'click.*link|click.*here', content_lower):
            indicators.append("Encourages clicking on links")
            risk_score += 10
        
        if re.search(r'password.*expire|password.*reset', content_lower):
            indicators.append("Mentions password expiration or reset")
            risk_score += 15
        
        # Check for spelling errors (simplified)
        common_misspellings = ['secruity', 'acount', 'verfiy', 'urgnet', 'immedate']
        for misspelling in common_misspellings:
            if misspelling in content_lower:
                indicators.append("Contains spelling errors")
                risk_score += 10
                break
        
        return {'indicators': indicators, 'risk_score': risk_score}
    
    def _analyze_urls(self, content: str) -> Dict:
        """Extract and analyze URLs"""
        url_pattern = r'https?://[^\s<>"\']+|www\.[^\s<>"\']+' 
        urls = re.findall(url_pattern, content, re.IGNORECASE)
        
        suspicious_urls = []
        for url in urls:
            for domain in self.suspicious_domains:
                if domain in url.lower():
                    suspicious_urls.append(url)
                    break
            
            # Check for IP addresses in URLs
            if re.search(r'https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', url):
                suspicious_urls.append(url)
        
        return {'urls': urls, 'suspicious_urls': suspicious_urls}
    
    def _generate_recommendations(self, threat_level: str) -> List[str]:
        """Generate security recommendations"""
        recommendations = [
            "Do not click on any links in the email",
            "Verify sender authenticity through official channels",
            "Check the actual email address, not just the display name"
        ]
        
        if threat_level in ["HIGH", "MEDIUM"]:
            recommendations.extend([
                "Report this email as phishing to your email provider",
                "Delete the email immediately",
                "Do not provide any personal information"
            ])
        
        if threat_level == "HIGH":
            recommendations.append("If you clicked any links, change your passwords immediately")
        
        return recommendations

def handler(request):
    """Python Function Handler for HTTP requests (Vercel references removed)"""
    try:
        if isinstance(request, dict):  # dict format
            body = request.get('body', {})
            if isinstance(body, str):
                body = json.loads(body)
        else:
            body = request
        
        email_content = body.get('email_content', '')
        sender = body.get('sender', '')
        subject = body.get('subject', '')
        
        if not email_content:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'email_content is required'})
            }
        
        detector = EmailPhishingDetector()
        result = detector.analyze_email(email_content, sender, subject)
        
        return {
            'statusCode': 200,
            'body': json.dumps(result)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python email_phishing_service.py <email_content> [sender] [subject]"}))
        sys.exit(1)
    
    email_content = sys.argv[1]
    sender = sys.argv[2] if len(sys.argv) > 2 else ""
    subject = sys.argv[3] if len(sys.argv) > 3 else ""
    
    detector = EmailPhishingDetector()
    result = detector.analyze_email(email_content, sender, subject)
    print(json.dumps(result, indent=2))
