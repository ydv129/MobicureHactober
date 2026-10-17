#!/bin/bash
pkill -9 -f "next dev" 2>/dev/null || true
rm -rf .next 2>/dev/null || true
echo "💀 Killed + Cleared ✅"
echo "Run: pnpm dev"
