# Emergency Sinlaku — Mariana Islands Relief Service Directory

**Domain:** sinlaku.directory.gu

A public, map-based directory of emergency, support, and relief services for communities affected by Supertyphoon Sinlaku (April 2026). Covers Guam, Saipan, Tinian, and Rota.

## What This Is

- **Recipients** browse services by island, filter by need (food, shelter, water, medical), and request aid
- **Service Providers** (FEMA, Red Cross, GovGuam, nonprofits, churches, businesses) register their offerings
- **Map-first experience** with real-time status (Active / Planned / Closed)
- **No sign-up required to browse** — public-first for maximum accessibility
- **PWA installable** — works offline when cell towers are down

## Islands

- [sinlaku.directory.gu/guam](/) — Guam
- [sinlaku.directory.gu/saipan](/saipan) — Saipan
- [sinlaku.directory.gu/tinian](/tinian) — Tinian
- [sinlaku.directory.gu/rota](/rota) — Rota

## Tech Stack

- Next.js + Supabase (auth, DB, realtime)
- OpenStreetMaps + Leaflet (map)
- Cloudflare Pages + Workers (deploy)
- PWA with service worker (offline support)
- All times in Chamorro Standard Time (ChST, UTC+10)

## Key Features

- Service cards with status indicators, badges, community testimonials
- Aid request form (no PII — no SSN, no addresses)
- Calendar view of service provider schedules (April 2026)
- Emergency hotline banner on every page
- Multi-language toggle (English authoritative, translations may be inaccurate)
- Share via WhatsApp, Facebook, Instagram
- Provider team access, auto-close on capacity
- Admin dashboard with metrics and moderation

## Project Structure

```
emergency-sinlaku/
├── app/                    Next.js app routes
│   ├── page.tsx            Landing page (island selector)
│   ├── guam/               Guam service directory
│   ├── saipan/             Saipan service directory
│   ├── tinian/             Tinian service directory
│   ├── rota/               Rota service directory
│   ├── request-aid/        Aid request form
│   ├── provider/           Provider registration + dashboard
│   └── admin/              Admin dashboard
├── components/
│   ├── map/                OpenStreetMaps integration
│   ├── cards/              Service cards (compact + expanded)
│   ├── drawer/             Left sidebar with filters
│   ├── calendar/           Unified April calendar view
│   └── shared/             Header, footer, hotline banner
├── lib/
│   ├── supabase.ts         Supabase client
│   └── types.ts            TypeScript types
├── public/
│   ├── manifest.json       PWA manifest
│   └── sw.js               Service worker
└── supabase/
    └── migrations/         Database migrations
```

## PRD

Full PRD at: `singlesourceoftruth/project_management/projects/john3-16/sub-projects/emergency-directory-gu/prds/emergency-directory-prd.md`

## Built By

manåha-built and fuetsa'd (powered) by [Guåhan.TECH](https://guahan.tech)

---

**Emergency Contacts:**
- 911 (Emergency)
- 311 (Non-Emergency)
- FEMA: 1-800-621-3362
