#!/usr/bin/env bash
set -euo pipefail

echo "🔍 Running secret scanning pass across codebase..."

# Patterns for high-entropy secrets and sensitive tokens
PATTERNS=(
  '(?i)sk-ant-[a-zA-Z0-9_-]{20,}'
  '(?i)AIza[0-9A-Za-z\\-_]{35}'
  '(?i)(?:api_key|apikey|secret_key|private_key)\s*[:=]\s*["'\''][a-zA-Z0-9_\-]{16,}["'\'']'
  '-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----'
  '(?i)ghp_[a-zA-Z0-9]{36}'
  '(?i)xox[baprs]-[0-9a-zA-Z]{10,48}'
)

FOUND=0

for pattern in "${PATTERNS[@]}"; do
  if grep -rE --exclude-dir={node_modules,.git,.next,coverage} --exclude={package-lock.json,.env.example} -e "$pattern" . ; then
    echo "❌ High-confidence secret pattern detected matching: $pattern"
    FOUND=1
  fi
done

if [ "$FOUND" -eq 1 ]; then
  echo "🚨 Secret scan FAILED: Secrets must never be committed to source control."
  exit 1
fi

echo "✅ Secret scan passed: Zero secrets found in repository."
exit 0
