"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info, Shield, Calendar, Cpu, Activity, Lock, User, Mail } from "lucide-react"

export function AboutSection() {
  const appInfo = {
    version: "1.0.0",
    build: "#1437",
    securityStatus: "AES-256 Encrypted",
    lastScan: new Date().toISOString(),
  }

  // Use last scan time as the latest update timestamp
  const lastUpdated = appInfo.lastScan

  return (
    <Card className="group relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card via-card/95 to-card/80 backdrop-blur-xl shadow-2xl hover:shadow-primary/20 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-info/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/20 rounded-full animate-pulse" style={{ animationDelay: '0s', animationDuration: '3s' }} />
        <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-info/20 rounded-full animate-pulse" style={{ animationDelay: '1s', animationDuration: '4s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-success/20 rounded-full animate-pulse" style={{ animationDelay: '2s', animationDuration: '5s' }} />
      </div>
      
      <CardHeader className="relative border-b border-primary/10 pb-6 animate-in fade-in slide-in-from-top-2 duration-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-info/20 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Info className="h-7 w-7 text-primary animate-pulse" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-info bg-clip-text text-transparent font-[var(--font-heading)] animate-in fade-in slide-in-from-left-2 duration-700">
                About MOBICURE
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1 animate-in fade-in slide-in-from-left-2 duration-700" style={{ animationDelay: '100ms' }}>
                Advanced Cybersecurity Command Center
              </p>
            </div>
          </div>
          <div className="px-4 py-2 rounded-lg border bg-success/10 border-success/30 animate-in fade-in zoom-in duration-700" style={{ animationDelay: '200ms' }}>
            <span className="text-xs font-semibold text-success flex items-center gap-2">
              <Activity className="h-3 w-3 animate-pulse" />
              ACTIVE
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative pt-8 space-y-6">
        {/* Version Info with enhanced styling */}
        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700" style={{ animationDelay: '300ms' }}>
          <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/10 group/version">
            <div className="flex items-center space-x-2 mb-3">
              <Cpu className="h-4 w-4 text-primary group-hover/version:animate-spin transition-all duration-1000" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Version</span>
            </div>
            <p className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {appInfo.version}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-gradient-to-br from-info/10 to-info/5 border border-info/20 hover:border-info/40 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-info/10 group/build">
            <div className="flex items-center space-x-2 mb-3">
              <Cpu className="h-4 w-4 text-info group-hover/build:animate-spin transition-all duration-1000" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Build</span>
            </div>
            <p className="text-2xl font-bold bg-gradient-to-r from-info to-info/70 bg-clip-text text-transparent animate-pulse">
              {appInfo.build}
            </p>
          </div>
        </div>

        {/* Last Updated with enhanced design */}
        <div className="p-4 rounded-lg bg-muted/30 border-2 border-muted/50 hover:border-primary/30 transition-all duration-300 hover:scale-[1.02] animate-in fade-in slide-in-from-left-2 duration-700" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-primary/10 group-hover:rotate-12 transition-transform duration-300">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Last Updated</span>
                <p className="text-sm font-semibold text-foreground mt-1">
                  {new Date(lastUpdated).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Status with premium design */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-success/10 via-success/5 to-transparent border-2 border-success/20 hover:border-success/40 transition-all duration-300 hover:scale-[1.01] animate-in fade-in slide-in-from-right-2 duration-700" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center space-x-3 mb-5">
            <div className="p-2.5 rounded-lg bg-gradient-to-br from-success/20 to-success/10 ring-2 ring-success/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <Shield className="h-5 w-5 text-success animate-pulse" />
            </div>
            <span className="text-base font-bold text-foreground">Security Status</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-success/10 hover:border-success/30 hover:bg-card/70 transition-all duration-300 hover:translate-x-1">
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4 text-success animate-pulse" style={{ animationDuration: '2s' }} />
                <span className="text-sm font-medium text-muted-foreground">Encryption</span>
              </div>
              <Badge className="bg-gradient-to-r from-success/20 to-success/10 text-success border-success/40 px-3 py-1 font-bold animate-pulse" style={{ animationDuration: '3s' }}>
                {appInfo.securityStatus}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-success/10 hover:border-success/30 hover:bg-card/70 transition-all duration-300 hover:translate-x-1">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-success animate-pulse" style={{ animationDuration: '2.5s' }} />
                <span className="text-sm font-medium text-muted-foreground">Last Security Scan</span>
              </div>
              <span className="text-sm text-success font-semibold">
                {new Date(appInfo.lastScan).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-success/10 hover:border-success/30 hover:bg-card/70 transition-all duration-300 hover:translate-x-1">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-success animate-pulse" style={{ animationDuration: '2s' }} />
                <span className="text-sm font-medium text-muted-foreground">System Status</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="h-2 w-2 bg-success rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 h-2 w-2 bg-success rounded-full animate-ping"></div>
                </div>
                <span className="text-sm text-success font-bold">SECURE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info with enhanced footer */}
        <div className="pt-6 border-t border-primary/10 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700" style={{ animationDelay: '600ms' }}>
          {/* Application Info */}
          <div className="text-center space-y-2 animate-in fade-in zoom-in duration-700" style={{ animationDelay: '700ms' }}>
            <p className="text-sm font-semibold text-foreground hover:text-primary transition-colors duration-300">
              MOBICURE Cybersecurity Command Center
            </p>
            <p className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-300">
              Advanced threat detection and security monitoring platform
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <div className="h-1 w-1 bg-primary rounded-full animate-pulse" style={{ animationDuration: '2s' }}></div>
              <span className="text-xs text-muted-foreground font-medium hover:text-primary transition-colors duration-300">Developed by NEERAJ</span>
              <div className="h-1 w-1 bg-primary rounded-full animate-pulse" style={{ animationDuration: '2s', animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
