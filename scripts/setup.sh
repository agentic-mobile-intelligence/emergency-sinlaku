#!/bin/bash
set -e

# Baku Template — Setup Script
# Replaces {{PLACEHOLDER}} tokens with actual values
#
# Usage:
#   ./scripts/setup.sh                    # Interactive
#   ./scripts/setup.sh --from-env .env    # Load from env file

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TEMPLATE_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== Baku Template Setup ==="
echo "Vite + React 18 + TypeScript + Supabase + shadcn/ui"
echo ""

# Load env if provided
if [[ "$1" == "--from-env" ]] && [[ -f "$2" ]]; then
  set -a
  source "$2"
  set +a
else
  [ -z "$PROJECT_NAME" ] && read -p "Project name: " PROJECT_NAME
  [ -z "$PAGE_TITLE" ] && read -p "Page title: " PAGE_TITLE
  [ -z "$DEV_PORT" ] && read -p "Dev server port [3000]: " DEV_PORT
  DEV_PORT="${DEV_PORT:-3000}"
fi

PAGE_TITLE="${PAGE_TITLE:-$PROJECT_NAME}"

# Replace placeholders
echo "  Replacing placeholders..."
find "$TEMPLATE_DIR" -type f \
  -not -path "*/.git/*" \
  -not -path "*/node_modules/*" \
  -not -path "*/.vite/*" \
  -not -path "*/dist/*" \
  \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.json" -o -name "*.html" -o -name "*.css" -o -name "*.md" -o -name "*.toml" -o -name "*.sh" \) \
  -exec sed -i '' \
    -e "s|{{PROJECT_NAME}}|${PROJECT_NAME}|g" \
    -e "s|{{PAGE_TITLE}}|${PAGE_TITLE}|g" \
    -e "s|{{DEV_PORT}}|${DEV_PORT}|g" \
    {} + 2>/dev/null

echo "  Done. Next steps:"
echo "    1. Copy .env.example to .env and fill in Supabase credentials"
echo "    2. bun install"
echo "    3. bun dev"
