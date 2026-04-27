#!/usr/bin/env bash
set -euo pipefail

base_url="${1:-http://127.0.0.1:3310}"
email="smoke-test-$(date +%s)@example.com"
password="Smoketest123!"

signup_payload=$(cat <<JSON
{"firstName":"Smoke","lastName":"Test","email":"$email","password":"$password"}
JSON
)

signin_payload=$(cat <<JSON
{"email":"$email","password":"$password"}
JSON
)

build_payload=$(cat <<JSON
{"name":"Smoke Test Org","location":"US","baseCurrency":"USD","timezone":"America/Los_Angeles","fiscalYear":"january","language":"en","dateFormat":"MM/DD/yyyy"}
JSON
)

signup_response=$(curl -sS "$base_url/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "$signup_payload")
echo "SIGNUP:$signup_response"

signin_response=$(curl -sS "$base_url/api/auth/signin" \
  -H "Content-Type: application/json" \
  -d "$signin_payload")
echo "SIGNIN:$signin_response"

token=$(printf '%s' "$signin_response" | python3 -c 'import sys,json; data=json.load(sys.stdin); print(data.get("accessToken") or data["access_token"])')
org_id=$(printf '%s' "$signin_response" | python3 -c 'import sys,json; data=json.load(sys.stdin); print(data.get("organizationId") or data["organization_id"])')

build_response=$(curl -sS "$base_url/api/organization/build" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $token" \
  -H "organization-id: $org_id" \
  -d "$build_payload")
echo "BUILD:$build_response"

job_id=$(printf '%s' "$build_response" | python3 -c 'import sys,json; data=json.load(sys.stdin); payload=data.get("data") or {}; print(payload.get("jobId") or payload["job_id"])')
sleep 2

job_response=$(curl -sS "$base_url/api/organization/build/$job_id" \
  -H "Authorization: Bearer $token" \
  -H "organization-id: $org_id")
echo "BUILD_STATUS:$job_response"
