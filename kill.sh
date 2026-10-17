#!/usr/bin/env bash

for port in 3000 8004; do
	fuser -k "${port}/tcp" >/dev/null 2>&1 || true
done
