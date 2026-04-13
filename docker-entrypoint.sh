#!/bin/sh
# Generate runtime config from environment variables
# This allows the same image to connect to different Supabase projects
cat > /usr/share/nginx/html/config.js << EOF
window.__RUNTIME_CONFIG__ = {
  VITE_SUPABASE_URL: "${VITE_SUPABASE_URL:-}",
  VITE_SUPABASE_PUBLISHABLE_KEY: "${VITE_SUPABASE_PUBLISHABLE_KEY:-}"
};
EOF

exec nginx -g "daemon off;"
