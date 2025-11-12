#!/bin/sh
set -e

# Generate env.js with runtime environment variables to avoid rebuilds.
cat > /usr/share/nginx/html/env.js <<'EOF'
window.__AKI_ENV__ = {
  VITE_API_BASE_URL: "${VITE_API_BASE_URL}",
  VITE_BFF_BASE_URL: "${VITE_BFF_BASE_URL}",
  VITE_APP_ENV: "${VITE_APP_ENV}",
  VITE_APP_NAME: "${VITE_APP_NAME}",
};
EOF

echo "Runtime env.js generated with VITE_API_BASE_URL=$VITE_API_BASE_URL"

exec nginx -g 'daemon off;'