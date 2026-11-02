#!/usr/bin/bash
# Endpoint parity harness: runs the same request set against two Next.js
# instances (pre-migration baseline @3100 vs Hono refactor @3200) and prints
# normalized results for diffing. Secret values are never printed.
BASE=http://127.0.0.1:3100
NEW=http://127.0.0.1:3200

REVAL_TOKEN=$(grep -E '^REVALIDATE_SECRET=' .env | cut -d= -f2- | tr -d '"')
ANALYTICS_TOKEN=$(grep -E '^NEXT_PUBLIC_ANALYTICS_INGEST_SECRET=' .env | cut -d= -f2- | tr -d '"')
TEST_TOKEN="${REVAL_TOKEN:-$ANALYTICS_TOKEN}"
if [ -n "$TEST_TOKEN" ]; then echo "TOKEN_STATE=server-secret-available"; else echo "TOKEN_STATE=no-server-secret-in-env"; fi

# probe <label> <path> [extra curl args...]
probe() {
  local label="$1"; local path="$2"; shift 2
  for host in "$BASE" "$NEW"; do
    echo "### $label  [${host##*:}]"
    out=$(curl -s -S -i --max-time 25 "$@" "$host$path" 2>&1 | tr -d '\r')
    echo "STATUS: $(printf '%s\n' "$out" | head -1)"
    echo "HEADERS: $(printf '%s\n' "$out" | sed -n '/^\r\?$/,$p' | head -n -1 | grep -iE '^(content-type|cache-control|content-disposition|access-control-allow-[a-z-]+|retry-after|x-request-id):' | sort | tr '\n' ' ')"
    body=$(printf '%s\n' "$out" | awk 'f{print} /^$/{f=1}')
    echo "BODYLEN: $(printf '%s' "$body" | wc -c)"
    echo "BODY: $(printf '%s' "$body" | head -c 300)"
    echo
  done
}

probe "GET public/projects"      /api/public/projects
probe "GET public/testimonials"  /api/public/testimonials
probe "GET public/settings"      /api/public/settings
probe "GET public/resume"        /api/public/resume
probe "GET public/resume/file"   /api/public/resume/file
probe "POST pageview"            /api/pageview -X POST -H 'Content-Type: application/json' -d '{"path":"/parity-test"}'
probe "POST revalidate no-token"  /api/revalidate -X POST -H 'Content-Type: application/json' -d '{}'
probe "POST revalidate bad-token" /api/revalidate -X POST -H 'Content-Type: application/json' -H 'x-revalidate-token: definitely-not-the-secret' -d '{}'
probe "POST revalidate good-token" /api/revalidate -X POST -H 'Content-Type: application/json' -H "x-revalidate-token: $TEST_TOKEN" -d '{}'
probe "POST revalidate bad-tags"  /api/revalidate -X POST -H 'Content-Type: application/json' -H "x-revalidate-token: $TEST_TOKEN" -d '{"tags":["not-a-real-tag"]}'
probe "POST flush-cache no-auth"  /api/admin/flush-cache -X POST -H 'Content-Type: application/json' -d '{}'
probe "POST flush-cache bad-bearer" /api/admin/flush-cache -X POST -H 'Content-Type: application/json' -H 'Authorization: Bearer garbage' -d '{}'
probe "OPTIONS contact"           /api/contact -X OPTIONS
probe "POST contact empty"        /api/contact -X POST -H 'Content-Type: application/json' -d '{}'
probe "POST contact bad-email"    /api/contact -X POST -H 'Content-Type: application/json' -d '{"name":"Parity","email":"not-an-email","message":"hello"}'
probe "PUT contact (method)"      /api/contact -X PUT -H 'Content-Type: application/json' -d '{}'
probe "GET unknown api path"      /api/definitely-not-a-route
probe "GET homepage"              /
