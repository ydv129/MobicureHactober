#!/usr/bin/env bash

for port in 8004 3000; do
  lsof -ti:"$port" | xargs -r kill -9
done