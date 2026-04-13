# Baku Template

Vite + React 18 + TypeScript SPA with Supabase backend, shadcn/ui components, Tailwind CSS, TanStack React Query, and React Router.

Mobile-first, dark-mode-ready, PWA-friendly starter for building data-rich applications with real-time features.

## What's Included

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Build | Vite 6 + Bun | Fast dev server + bundler |
| UI | React 18 + TypeScript | Component framework |
| Styling | Tailwind CSS + shadcn/ui | Design system (40+ components) |
| Routing | React Router v6 | Client-side navigation |
| Data | TanStack React Query | Server state management |
| Database | Supabase (Postgres + Realtime) | Auth, DB, real-time subscriptions |
| Forms | React Hook Form + Zod | Validation |
| Icons | Lucide React | Icon library |
| Charts | Recharts | Data visualization |
| Toasts | Sonner | Notifications |

## Quick Start

```bash
# 1. Initialize template
./scripts/setup.sh

# 2. Set up environment
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY

# 3. Install dependencies
bun install

# 4. Apply database migrations
npx supabase db push   # or apply migrations manually

# 5. Start dev server
bun dev
```

## Project Structure

```
src/
  pages/          Page components (one per route)
  components/     Reusable UI (shadcn/ui primitives + custom)
  hooks/          Custom React hooks (auth, data fetching, features)
  lib/            Utilities (Supabase client, helpers, exports)
  types/          TypeScript type definitions
  App.tsx         Main router + auth flow
  main.tsx        React entry point
  index.css       Tailwind + CSS variables (light/dark themes)

supabase/
  migrations/     Database schema migrations (SQL)
```

## Conventions

- **Pages** go in `src/pages/` — one file per route
- **Hooks** go in `src/hooks/` — one hook per feature domain
- **UI primitives** in `src/components/ui/` — managed by shadcn/ui CLI
- **Custom components** in `src/components/` — app-specific
- **Path alias**: `@/` maps to `src/`
- **Styling**: Tailwind utility classes + CSS variables for theming

## Adding shadcn/ui Components

```bash
npx shadcn@latest add [component-name]
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase anon/public key |

## Deployment

Ships with `vercel.json` for Vercel SPA deployment. Works with any static host:

```bash
bun run build    # Output in dist/
```

For Cloudflare Pages: `wrangler pages deploy dist/`

## Origin

Based on the GPS Tracker reference app. Domain-specific code (GPS, maps, social feed) is included as a working example — replace with your domain logic.
