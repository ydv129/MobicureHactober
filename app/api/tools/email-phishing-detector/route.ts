import { NextRequest, NextResponse } from 'next/server';
import { callPythonHandler } from "@/lib/services/python-handler";

interface EmailPhishingRequest {
  email_content: string;
  sender: string;
  subject: string;
}

interface EmailPhishingResult {
  error?: string;
  [key: string]: unknown;
}

function fallbackEmailAnalysis(emailContent: string, sender: string, subject: string) {
  const fromHeader = emailContent.match(/^From:\s*(.+)$/im)?.[1] || sender;
  const subjectHeader = emailContent.match(/^Subject:\s*(.+)$/im)?.[1] || subject;
  const suspiciousKeywords = emailContent.match(/\b(urgent|immediate|verify|password|login|suspend|expire|payment|invoice)\b/gi) || [];
  const links = emailContent.match(/https?:\/\/[^\s<>"']+/gi) || [];
  const senderDomain = fromHeader.match(/@([a-z0-9.-]+)/i)?.[1] || "";
  const riskScore = Math.min(100, suspiciousKeywords.length * 10 + links.length * 15 + (senderDomain ? 0 : 20));
  const riskLevel = riskScore >= 80 ? "critical" : riskScore >= 60 ? "high" : riskScore >= 30 ? "medium" : "low";
  const indicators = [
    {
      category: "Suspicious Keywords",
      description: `${suspiciousKeywords.length} suspicious keywords detected`,
      severity: suspiciousKeywords.length > 2 ? "high" : "medium",
      found: suspiciousKeywords.length > 0,
    },
    {
      category: "Links",
      description: `${links.length} links detected`,
      severity: links.length > 0 ? "medium" : "low",
      found: links.length > 0,
    },
  ];

  return {
    risk_score: riskScore,
    risk_level: riskLevel,
    indicators,
    sender_analysis: {
      domain_reputation: senderDomain ? 60 : 20,
      spf_valid: false,
      dkim_valid: false,
      suspicious_patterns: suspiciousKeywords,
      from: fromHeader,
      subject: subjectHeader,
    },
    content_analysis: {
      urgency_keywords: suspiciousKeywords,
      suspicious_links: links,
      grammar_score: 100,
      social_engineering: [],
    },
    recommendations: riskScore > 50 ? ["Verify the sender before opening links or attachments"] : [],
    analysis_source: "fallback-real-email-check",
  };
}

export async function POST(request: NextRequest) {
  try {
    const { emailContent, sender, subject } = await request.json();

    if (!emailContent) {
      return NextResponse.json(
        { error: 'Email content is required' },
        { status: 400 }
      );
    }

    try {
      const result = await callPythonHandler<EmailPhishingRequest, EmailPhishingResult>(
        'scripts/email_phishing_service.py',
        {
          email_content: emailContent,
          sender: sender || '',
          subject: subject || ''
        }
      );
      
      if (!result) {
        return NextResponse.json(fallbackEmailAnalysis(emailContent, sender || '', subject || ''));
      }
      
      return NextResponse.json(result);
    } catch (pythonError) {
      console.error("Email phishing service error:", pythonError);
      return NextResponse.json(fallbackEmailAnalysis(emailContent, sender || '', subject || ''));
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
