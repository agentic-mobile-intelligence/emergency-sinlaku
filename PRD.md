---
id: PRD-20260413T000000Z
project: emergency-directory-gu
parent_project: john3-16
status: draft
created: 2026-04-13
title: "Mariana Islands Emergency Relief Service Directory"
context: "Supertyphoon Sinlaku — April 2026"
---

# PRD: Mariana Islands Emergency Relief Service Directory

## 1. Overview

| Field | Value |
|---|---|
| Project | emergency-directory-gu (sub-project of john3-16) |
| Purpose | Public directory of emergency, support, and relief services for typhoon-affected communities |
| Islands | Guam, Saipan, Tinian, Rota |
| Context | Supertyphoon Sinlaku, April 2026 |
| Timezone | Chamorro Standard Time (ChST, UTC+10) — all dates/times in ChST |
| Domain | sinlaku.directory.gu |
| Stack | Next.js + Supabase + OpenStreetMaps + Cloudflare Pages |
| Code reuse | Map pattern from john3-16 business directory |

### References

- [NYT Sinlaku Tracker](https://www.nytimes.com/interactive/2026/04/09/weather/sinlaku-map-path-tracker.html)
- [NWS Tropical Cyclone Public Advisory](https://forecast.weather.gov/product.php?issuedby=PQ1&product=TCP&site=gum)
- [NWS Hurricane Local Statement](https://forecast.weather.gov/product.php?issuedby=PQ1&product=HLS&site=gum)
- [NWS Guam Cyclones](https://www.weather.gov/gum/Cyclones)

---

## 2. Product Vision

When a typhoon hits the Mariana Islands, people need to know **where to get help** and **who is providing it** — fast, on their phone, with no login required.

This is a **public-first, map-based directory** of emergency and relief services. Service providers register their offerings (shelter, food, water, medical, cleanup). Affected community members browse and request aid. Everything is organized by island with real-time status updates.

Built on the john3-16 business directory codebase — same map pattern, same card model, repurposed for emergency response.

---

## 3. Users & Personas

### Persona 1: Recipient (Affected Community Member)

**Who:** Residents of Guam, Saipan, Tinian, or Rota affected by the typhoon.

**Journey:**
1. Opens the app (no sign-up required to browse)
2. Selects their island → sees map with service locations
3. Filters by need (food, shelter, water, medical, tarps, cleanup)
4. Views service cards with status, hours, location
5. Optionally: signs up to request specific aid
6. Fills out Request Aid form (no PII — no SSN, no address, no confidential info)

**Sign-up fields (optional):**
- Name
- Island
- Contact (phone or email)
- Needs checklist: food, shelter, water, tarps, medical, clothing, transportation, other

### Persona 2: Service Provider (Organization)

**Who:** FEMA, Red Cross, GovGuam agencies, nonprofits, churches, community groups, businesses offering relief.

**Journey:**
1. Clicks "Sign up (Service Provider)" in sticky header
2. Quick registration: org name, contact, service type(s), island(s)
3. Starts UNVERIFIED — can toggle "Request Verification"
4. Verification = call Jay's WhatsApp number for manual verification
5. Posts specific offerings (what, where, when, capacity)
6. Manages offerings — update status (Active / Planned / Closed)
7. Views incoming aid requests from recipients

### Persona 3: Admin (Jay / Guahan Tech)

**Who:** Platform administrator.

**Journey:**
1. Reviews service provider registrations
2. Performs manual verification via WhatsApp
3. Monitors aid request volume
4. Updates situation reports per island

---

## 4. Information Architecture

### URL Structure

```
/                   → Landing page (island selector)
/guam               → Guam services map + directory
/saipan             → Saipan services map + directory
/tinian             → Tinian services map + directory
/rota               → Rota services map + directory
/request-aid        → Aid request form (for recipients)
/provider/register  → Service provider registration
/provider/dashboard → Provider dashboard (manage offerings, view requests)
/admin              → Admin dashboard
```

### Landing Page (`/`)

```
┌─────────────────────────────────────────────────────────────┐
│  [Sticky Header]                                            │
│  Logo + "Sign up (Recipient)" + "Sign up (Service Provider)"│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Mariana Islands Emergency Relief Directory                 │
│  ─────────────────────────────────────                      │
│  Find emergency services, support, and relief resources     │
│  for communities affected by Supertyphoon Sinlaku.          │
│                                                             │
│  Select your island:                                        │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │   Guam   │ │  Saipan  │ │  Tinian  │ │   Rota   │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                             │
│  Emergency Contacts:                                        │
│  911 (Emergency) | 311 (Non-Emergency) | FEMA: 1-800-...   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Footer: "Built by Guåhan.TECH for the Mariana Islands"     │
└─────────────────────────────────────────────────────────────┘
```

### Sticky Header (all pages)

```
┌─────────────────────────────────────────────────────────────┐
│  🏠 Home  |  [Island selector dropdown]  |  Sign up (Recipient)  |  Sign up (Service Provider)  │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Island Page: Map + Service Directory

Reuses the john3-16 map-primary layout:

```
┌─────────────────────────────────────────────────────────────┐
│  [Sticky Header]                                            │
├──────────────────────┬──────────────────────────────────────┤
│                      │                                      │
│  Left Drawer         │  Map (OpenStreetMaps)                │
│  ─────────────       │  Centered on selected island         │
│                      │                                      │
│  Filter by need:     │  [Pin: Shelter] [Pin: Food]          │
│  ☑ Food              │       [Pin: Medical]                 │
│  ☑ Shelter           │                                      │
│  ☑ Water             │  Pin colors by service type:         │
│  ☑ Medical           │  🔴 Shelter  🟢 Food  🔵 Medical    │
│  ☑ Tarps             │  🟡 Water   🟣 Cleanup              │
│  ☑ Cleanup           │                                      │
│  ☑ Clothing          │  Pin shape by status:                │
│  ☑ Transportation    │  ● Active  ◐ Planned  ○ Closed      │
│                      │                                      │
│  Filter by status:   │                                      │
│  ☑ Active            │                                      │
│  ☑ Planned           │                                      │
│  ☐ Closed            │                                      │
│                      │                                      │
│  ┌────────────────┐  │                                      │
│  │ Service Card   │  │                                      │
│  │ (compact)      │  │                                      │
│  └────────────────┘  │                                      │
│  ┌────────────────┐  │                                      │
│  │ Service Card   │  │                                      │
│  │ (compact)      │  │                                      │
│  └────────────────┘  │                                      │
│                      │                                      │
│  [📅 Calendar View]  │                                      │
│  [🆘 Request Aid]    │                                      │
│                      │                                      │
├──────────────────────┴──────────────────────────────────────┤
│  Footer                                                     │
└─────────────────────────────────────────────────────────────┘
```

### Drawer ↔ Map sync (same as john3-16)
- Filtering drawer updates map pins
- Clicking map pin highlights card in drawer
- Card expansion centers map on that service location

---

## 6. Core Object: Service Card

### Compact View (in drawer/search)

| Field | Required | Notes |
|---|---|---|
| Organization name | Yes | |
| Service type | Yes | Shelter, Food, Water, Medical, Tarps, Cleanup, Clothing, Transportation |
| Status | Yes | Active (green), Planned (yellow + date/time), Closed (gray) |
| Location summary | Yes | Village/area name |
| Hours | Yes | "8am-5pm ChST" or "24/7" |
| Verified badge | Auto | ✓ Verified or "Unverified" |

### Expanded View (on click)

| Field | Required | Notes |
|---|---|---|
| Organization name | Yes | |
| Service type(s) | Yes | Can offer multiple types |
| Description | Yes | What they're providing, any restrictions |
| Full address / location | Yes | With map pin focus |
| Contact phone | Yes | Click-to-call |
| Contact email | No | |
| WhatsApp | No | Click-to-chat |
| Hours of operation | Yes | All times in ChST |
| Capacity | No | "Serving 200 meals/day" or "50 beds available" |
| Availability window | No | "April 13 - April 30" or "Until further notice" |
| Status | Yes | Active / Planned (with start time) / Closed (with reason) |
| Specific offerings | Yes | List of individual services (see Section 7) |
| Verified badge | Auto | With verification steps if unverified |
| Last updated | Auto | Timestamp of last edit |

---

## 7. Service Provider Offerings (Sub-cards)

After registration, providers post specific offerings:

| Field | Required | Notes |
|---|---|---|
| Offering name | Yes | "Water Distribution", "Emergency Shelter", "Tarp Installation" |
| Description | No | Details and restrictions |
| Location | Yes | Specific address or landmark |
| Date/time | Yes | One-time or recurring, all in ChST |
| Capacity | No | Numeric or text |
| Status | Yes | Active / Planned / Closed |

Offerings appear:
- On the provider's expanded service card
- As individual pins on the map
- In the **Calendar View**

---

## 8. Calendar View

Accessible via button at bottom of island drawer.

```
┌─────────────────────────────────────────────────────────────┐
│  📅 Service Calendar — Guam (ChST)                         │
├─────┬──────────┬──────────┬──────────┬──────────┬──────────┤
│     │ Mon 4/14 │ Tue 4/15 │ Wed 4/16 │ Thu 4/17 │ Fri 4/18│
├─────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ 8am │ 🟢 Water │ 🟢 Water │ 🟢 Water │          │ 🟢 Water│
│     │ Dededo   │ Dededo   │ Dededo   │          │ Dededo  │
├─────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ 9am │ 🔴 Shelt │ 🔴 Shelt │ 🔴 Shelt │ 🔴 Shelt│ 🔴 Shelt│
│     │ Tiyan    │ Tiyan    │ Tiyan    │ Tiyan   │ Tiyan   │
├─────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ 10a │ 🔵 Med   │          │ 🔵 Med   │          │ 🔵 Med  │
│     │ GMH      │          │ GMH      │          │ GMH     │
└─────┴──────────┴──────────┴──────────┴──────────┴──────────┘
```

- Filter by service type (same filters as map)
- Click an entry → jumps to that offering's service card
- One unified calendar for April 2026 (all islands combined, color-coded by island)

---

## 9. Request Aid Workflow

### Step 1: "Request Aid" button

Shows emergency contacts first:
```
┌─────────────────────────────────────────────────┐
│  🆘 Emergency Contacts                          │
│                                                  │
│  911 — Emergency                                │
│  311 — Non-Emergency                            │
│  FEMA: 1-800-621-3362                           │
│  Red Cross Guam: (671) 555-XXXX                 │
│                                                  │
│  ⚠️ Services subject to availability.            │
│                                                  │
│  [Fill out Aid Request Form →]                   │
└─────────────────────────────────────────────────┘
```

### Step 2: Aid Request Form

| Field | Type | Required | Notes |
|---|---|---|---|
| Name | Text | Yes | First name or alias is fine |
| Island | Select | Yes | Guam / Saipan / Tinian / Rota |
| Landline phone | Phone | No | Optional — landline number |
| Mobile phone | Phone | No | Optional — mobile number |
| Email | Email | No | Optional — alternative contact |
| If no phone/email | Textarea | Conditional | Required if no phone or email provided — "Tell us what's going on and how to reach you" |
| Number of people | Number | Yes | Household/group size |
| Needs checklist | Multi-select | Yes | Food, Water, Shelter, Tarps, Medical, Clothing, Transportation, Other |
| Are there dogs near your home? | Yes/No | Yes | Safety info for responders |
| Is your place safely accessible? | Yes/No/Unsure | Yes | Safety info for responders |
| Additional notes | Text | No | Free-text for specifics |
| ~~SSN~~ | — | **BLOCKED** | ⛔ No SSN field. No address field. No confidential PII. |
| ~~Address~~ | — | **BLOCKED** | ⛔ Contact method only — no physical address collection. |

**Privacy notice at top of form:**
> "This form does NOT collect Social Security Numbers, home addresses, or other confidential personal information. Your request will be visible to registered service providers on this platform."

### Step 3: Request visible to all providers

- All registered service providers (existing and new) can see ALL submitted aid requests across ALL islands
- Each request clearly shows which island it's from
- Providers can mark requests as: "Responding" / "Fulfilled" / "Unable to fulfill"

---

## 10. Verification System

### Default state: UNVERIFIED

All service providers start unverified. Their cards show "Unverified" label.

### Request Verification flow:

1. Provider toggles "Request Verification" on their dashboard
2. App shows instructions:
   ```
   To verify your organization:
   1. Call or WhatsApp: [Jay's WhatsApp number]
   2. Provide your organization name and registration details
   3. Verification typically completed within 24 hours
   ```
3. Jay manually verifies → toggles verified flag in admin
4. Provider card shows ✓ Verified badge

### Verification tiers (future)

| Tier | Criteria | Badge |
|---|---|---|
| Unverified | Default | No badge |
| Verified | Manual WhatsApp verification | ✓ Verified |
| Official | Government agency or FEMA | 🏛️ Official |

---

## 11. Technical Architecture

### Stack choice: Speed over perfection

| Component | Choice | Why |
|---|---|---|
| Framework | Next.js | Reuse john3-16 codebase |
| Auth | Supabase Auth | Free, fast setup, no Clerk dependency |
| Database | Supabase (PostgreSQL) | Free tier, PostGIS for map queries, realtime for status updates |
| Map | OpenStreetMaps + Leaflet | Copy from john3-16 |
| Deploy | Cloudflare Pages | Fast, free, edge-cached |
| Timezone | All ChST (UTC+10) | `Pacific/Guam` timezone throughout |

### Caching strategy

- **Public pages cached aggressively** — service listings, map data cached at CDN edge
- **Commonly viewed data saved to DB** — track popular queries, pre-compute filtered views
- **Realtime for status changes** — Supabase Realtime for provider status updates (Active → Closed)
- **Service worker for offline** — critical for post-typhoon when internet is spotty

### Data model

```
organizations
├── id (uuid)
├── name
├── contact_phone
├── contact_email
├── whatsapp
├── service_types[] (enum: shelter, food, water, medical, tarps, cleanup, clothing, transportation)
├── islands[] (enum: guam, saipan, tinian, rota)
├── verified (boolean, default: false)
├── verification_requested (boolean)
├── description
├── created_at
└── updated_at

offerings
├── id (uuid)
├── organization_id (FK)
├── name
├── description
├── location_text
├── location_lat
├── location_lng
├── island (enum)
├── service_type (enum)
├── status (enum: active, planned, closed)
├── planned_start (timestamp, ChST)
├── planned_end (timestamp, ChST)
├── capacity_text
├── hours_text
├── created_at
└── updated_at

aid_requests
├── id (uuid)
├── name
├── island (enum)
├── landline_phone (text, nullable)
├── mobile_phone (text, nullable)
├── email (text, nullable)
├── no_contact_explanation (text, nullable — required if no phone/email)
├── household_size (integer)
├── needs[] (enum: food, water, shelter, tarps, medical, clothing, transportation, other)
├── dogs_nearby (boolean)
├── safely_accessible (enum: yes, no, unsure)
├── notes (text)
├── status (enum: open, responding, fulfilled, unable)
├── responded_by (FK → organizations, nullable)
├── created_at
└── updated_at

recipients (optional sign-up)
├── id (uuid)
├── name
├── island (enum)
├── contact_method
├── needs[]
├── created_at
└── updated_at
```

### Code reuse from john3-16

| Component | Source | Adaptation |
|---|---|---|
| Map component | `components/map/` | Change pins from businesses to services, add status-based pin shapes |
| Card component | `components/BusinessCard.tsx` | Rename to ServiceCard, change fields |
| Drawer/sidebar | `components/drawer/` | Change filters from categories to service types + status |
| Auth flow | Clerk → Supabase Auth | Simpler, free-tier friendly |
| Admin dashboard | `app/admin/` | Repurpose for verification + request monitoring |

---

## 12. Phased Delivery

### Phase 0 — Ship ASAP (minimum features + working functionality + UI tests)

Composition of two existing templates:
- **Static layer:** `/Users/jay/Home/projects/template/atomic/cloudflare-static-site-suite` — landing page, island pages, static content
- **Dynamic layer:** `/Users/jay/Home/projects/template/atomic/cloudflare-edge-workers` — API, auth, form handlers, realtime
- **Composition template:** Create `/Users/jay/Home/projects/template/emergency-service-directory/` combining both
- Deploy to Cloudflare Pages + Workers
- Minimum: landing page, island selector, service provider registration, aid request form, basic map

### Phase 1 — MVP (1-2 weeks)

| Task | Priority | Effort |
|---|---|---|
| Landing page with 4 island buttons | P0 | Small |
| Sticky header with sign-up links | P0 | Small |
| Supabase setup (auth + DB + tables) | P0 | Small |
| Service provider registration form | P0 | Medium |
| Service card display (map + drawer) | P0 | Medium (reuse john3-16) |
| Island page with map + filtered drawer | P0 | Medium |
| Aid request form (no PII) | P0 | Small |
| Provider dashboard (manage offerings, view requests) | P0 | Medium |
| Verification request flow (WhatsApp instructions) | P1 | Small |
| Status indicators (Active/Planned/Closed) with ChST times | P1 | Small |
| Pre-seed FEMA, Red Cross, GovGuam data | P1 | Small |

### Phase 2 — Calendar + Polish

| Task | Priority | Effort |
|---|---|---|
| Calendar view per island | P1 | Medium |
| Provider offering sub-cards | P1 | Medium |
| Request status tracking (responding/fulfilled) | P1 | Small |
| Offline support (service worker) | P2 | Medium |
| Situation update section per island | P2 | Small |

### Phase 3 — Reusability

| Task | Priority | Effort |
|---|---|---|
| Templatize for future emergencies | P2 | Medium |
| Multi-language support (CHamoru, Carolinian, Tagalog) | P3 | Large |
| Push notifications for new services | P3 | Medium |
| iCal/Google Calendar feed | P3 | Small |
| Analytics (most-requested needs, coverage gaps) | P3 | Medium |

---

## 13. Design System

Inherit john3-16 tropical theme but adapted for emergency context:

| Element | Value | Notes |
|---|---|---|
| Primary | Deep blue (#1E3A5F) | Trust, stability |
| Alert/urgent | Red (#DC2626) | Active services, emergencies |
| Planned | Amber (#F59E0B) | Upcoming services |
| Available | Green (#16A34A) | Active + accepting |
| Closed | Gray (#6B7280) | Exhausted/ended |
| Background | White (#FFFFFF) | Maximum readability |
| Font | System font stack | Fast load, accessible |
| Cards | White with colored left border by service type | Quick visual scanning |

**Accessibility priority:** Large touch targets (mobile-first), high contrast, clear typography. Many users will be on phones with cracked screens in poor lighting.

---

## 14. Success Criteria

### MVP Launch
- [ ] Landing page with 4 island buttons loads in < 2s
- [ ] Service provider can register in < 3 minutes
- [ ] Recipient can find services on map without signing up
- [ ] Aid request form submits successfully (no PII collected)
- [ ] All times display in ChST
- [ ] Works on mobile (primary device for typhoon-affected users)
- [ ] At least 5 service providers registered at launch

### 30 Days Post-Launch
- [ ] 20+ service providers registered
- [ ] 50+ aid requests submitted
- [ ] All 4 island pages have active service listings
- [ ] Zero PII incidents

---

## 15. Multi-Language Support

Language toggle in sticky header. English is the authoritative language.

```
┌──────────────────────────────────────────────────────┐
│  🏠 Home | [Island] | Sign up | Sign up | 🌐 EN ▼  │
│                                           CHamoru    │
│                                           Carolinian │
│                                           Tagalog    │
│                                           Japanese   │
└──────────────────────────────────────────────────────┘
```

**Warning banner when non-English selected:**
> "⚠️ This translation is machine-generated and may be inaccurate. For authoritative information, switch to English."

Implementation: client-side translation via i18n library with machine-translated JSON files. English is source of truth. No server-side translation. Translations reviewed when time allows — never block deployment for translation accuracy.

---

## 16. Reusability: Template vs Deployment

This project has two artifacts:

| Artifact | Purpose | Location |
|---|---|---|
| **Template** | Reusable emergency service directory template for ANY future disaster | `/Users/jay/Home/projects/template/emergency-service-directory/` |
| **Deployment** | Sinlaku-specific deployment of the template | Cloudflare Pages (domain TBD) |

The template composition:
- Static layer from `cloudflare-static-site-suite`
- Dynamic layer from `cloudflare-edge-workers`
- Emergency-specific components (service cards, aid forms, map, calendar)

For a future emergency (e.g., Typhoon X in 2027):
1. Clone the template
2. Update `config.json`: event name, date range, islands, domain
3. Deploy to Cloudflare Pages
4. Service providers self-register

---

## 17. Situation Updates Per Island

Each island page includes a situation update section at the top:

```
┌─────────────────────────────────────────────────────┐
│  📋 Situation Update — Guam (Last updated: 4/13 2pm ChST) │
│                                                      │
│  • Power: 60% restored island-wide                   │
│  • Water: Boil water advisory in Dededo, Yigo        │
│  • Roads: Route 1 (Marine Corps Dr) clear            │
│  • Schools: All public schools closed through 4/18   │
│                                                      │
│  Source: [attached data feed]                         │
└─────────────────────────────────────────────────────┘
```

### Data Sources

**News:**
- [Guam Pacific Daily News (PDN)](https://www.guampdn.com/) — local reporting
- [Kandit News](https://kanditnews.com/) — Marianas news

**Official Weather / Military:**
- [Joint Typhoon Warning Center (JTWC)](https://www.metoc.navy.mil/jtwc/jtwc.html) — primary military forecast
  - [TC Warning Text](https://www.metoc.navy.mil/jtwc/products/wp0426web.txt)
  - [TC Warning Graphic](https://www.metoc.navy.mil/jtwc/products/wp0426.gif)
  - [Prognostic Reasoning](https://www.metoc.navy.mil/jtwc/products/wp0426prog.txt)
  - [JMV 3.0 Data](https://www.metoc.navy.mil/jtwc/products/wp0426.tcw)
  - [Google Earth Overlay](https://www.metoc.navy.mil/jtwc/products/wp0426.kmz)
  - [IR Satellite Imagery](https://www.metoc.navy.mil/jtwc/products/04W_130000sair.jpg)
  - [Satellite Fix Bulletin](https://www.metoc.navy.mil/jtwc/products/wp0426fix.txt)
- [NWS Guam Tropical Cyclone Advisory](https://forecast.weather.gov/product.php?issuedby=PQ1&product=TCP&site=gum)
- [NWS Hurricane Local Statement](https://forecast.weather.gov/product.php?issuedby=PQ1&product=HLS&site=gum)
- [NWS Guam Cyclones Page](https://www.weather.gov/gum/Cyclones)

**Implementation:** MVP = manual admin updates referencing these sources. Phase 2 = automated scraping/polling of JTWC text products and NWS advisories to auto-populate situation update sections.

---

## 18. Community Trust & Sharing

### Report Inaccurate Info

Every service card has a "Report Inaccurate Info" button:
- Options: "Hours are wrong", "Location is wrong", "Service is closed", "Other"
- Reports go to admin queue for review
- After 3+ reports on same issue → auto-flag card with "⚠️ Information may be outdated"

### Share Buttons

Every service card has share buttons:
- **WhatsApp** — pre-formatted message: "{Service Name} at {Location} — {Status}. See more: {card URL}"
- **Facebook** — share with Open Graph preview
- **Instagram** — copy link (Instagram doesn't support direct URL sharing)
- **Copy link** — clipboard copy with confirmation toast

Critical for post-typhoon when families are texting each other about where to find help.

### Community Verification (Testimonials)

Users can leave brief confirmations on service cards:
- "I went to Dededo gym, they had water" ✓ Confirmed
- Anonymous posting allowed — labeled "Community Verified"
- Signed-in users show first name only
- **Moderation:** Hate speech / toxic language is shadow-hidden (visible only in admin moderation queue, not publicly removed — avoids escalation)
- Confirmation count shown on card: "✓ 12 community confirmations"

---

## 19. Enhanced Recipient Safety Fields

In addition to existing aid request form fields, add:

| Field | Type | Required | Notes |
|---|---|---|---|
| Medical needs | Multi-select | No | Wheelchair, Oxygen/ventilator, Dialysis, Insulin/medication, Mobility aid, Other |
| Medical notes | Textarea | No | "Father needs daily insulin" — free-text for specifics |
| Elderly in household | Number | No | Count of persons 65+ |
| Children in household | Number | No | Count of persons under 18 |
| Disabled persons in household | Number | No | Count of persons with disabilities |
| "I cannot leave my location" | Checkbox | No | Flags this request for services-to-you providers. Displayed prominently to providers as 🔴 "Cannot relocate — needs service delivery" |

When "I cannot leave my location" is checked:
- Request is tagged with high-priority indicator in provider dashboard
- Providers see these requests in a separate "Needs Delivery" tab
- Contact info becomes more prominent (providers need to reach them)

---

## 20. Provider Experience Enhancements

### Auto-Close on Capacity

Providers set a max capacity per offering (e.g., "50 beds", "200 meals"):
- When aid requests referencing that offering reach capacity → status auto-changes to "At Capacity"
- Card shows: "🟠 At Capacity (50/50 beds)" instead of "Active"
- Provider can manually override back to "Active" if capacity increases
- Closed ≠ At Capacity — "Closed" means permanently done, "At Capacity" means temporarily full

### Notifications

Providers receive alerts when:
- New aid request comes in (matching their service type + island)
- Their card is reported as inaccurate
- A request they're "Responding" to is updated by the recipient
- Delivery: Email (required at registration) + SMS (optional, Twilio Phase 2)

### Team Access

Multiple people from the same organization can manage the same provider profile:
- Primary registrant = org admin (can invite team members)
- Team members can: update offerings, change status, respond to requests
- Team members cannot: delete the org profile, change org name, manage other members
- Invite flow: org admin sends invite link → team member creates account → auto-linked to org

---

## 21. Donate & Volunteer

### Donate Button

Two donation paths in the sticky header:

| Button | Destination | Notes |
|---|---|---|
| "Donate to Relief" | Redirects to island-specific help pages with verified donation links (Red Cross, GovGuam relief fund, etc.) | We do NOT collect donations directly — redirect to official channels |
| "Support This Site" | Small donation to Guahan Tech to keep sinlaku.directory.gu running | PayPal or Stripe link, clearly labeled as "for website operations, not relief" |

### Volunteer Button

- "Volunteer" → registration form similar to service provider but for individuals
- Fields: name, skills, availability, island, can provide transportation (yes/no)
- Volunteers visible to registered organizations (not publicly listed)

---

## 22. Emergency Hotline Banner

Persistent banner at the very top of every page, above the sticky header:

```
┌─────────────────────────────────────────────────────────────┐
│  🆘 EMERGENCY: 911 | Non-Emergency: 311 | FEMA: 1-800-621-3362 | Red Cross: (671) XXX-XXXX  │
└─────────────────────────────────────────────────────────────┘
```

- Cannot be dismissed — always visible
- Collapses to icon on mobile with tap-to-expand
- Phone numbers are click-to-call

---

## 23. Offline & SMS Fallback

### Offline Mode (MVP) — PWA / Add to Home Screen

The app should be installable via native Safari and Chrome "Add to Home Screen" for offline use:

- **Progressive Web App (PWA)** with service worker + web manifest
- Prompts "Add to Home Screen" after first visit
- Service worker caches:
  - Service listings per island
  - Emergency contacts
  - Map tiles for viewed areas
  - Aid request form (queued for submission when online)
- Full app shell cached — navigable offline

When offline:
- Banner: "📡 You are offline. Showing last updated data from [timestamp]."
- Cached service cards still browsable
- Aid request form saves locally, auto-submits when connection returns
- Map shows cached tiles only (no new tile loading)

### SMS Fallback (Phase 2 — Twilio)

For users who can't load the website:
- Text "HELP" to [short code or number] → receive list of active services for their island
- Text "GUAM" / "SAIPAN" / "TINIAN" / "ROTA" → filtered results
- Text "AID" → receive instructions for requesting aid via SMS
- Powered by Twilio, routed through Cloudflare Worker

---

## 24. Admin Dashboard

### Metrics Overview

```
┌─────────────────────────────────────────────────────────────┐
│  📊 Admin Dashboard — sinlaku.directory.gu                  │
├──────────┬──────────┬──────────┬──────────┬────────────────┤
│ Requests │ Fulfilled│ Pending  │ Unable   │ Providers      │
│   347    │  201     │   128    │    18    │    43          │
│          │  58%     │   37%    │    5%    │  12 verified   │
├──────────┴──────────┴──────────┴──────────┴────────────────┤
│                                                             │
│  By Island:        By Need Type:       Fulfillment Trend:  │
│  Guam: 201 (58%)   Food: 142 (41%)    [sparkline chart]   │
│  Saipan: 89 (26%)  Water: 98 (28%)                        │
│  Tinian: 34 (10%)  Shelter: 67 (19%)                      │
│  Rota: 23 (7%)     Medical: 40 (12%)                      │
│                                                             │
│  ⚠️ Moderation Queue: 3 flagged testimonials               │
│  ⚠️ Inaccuracy Reports: 7 pending review                   │
│  📋 Verification Requests: 5 pending                       │
└─────────────────────────────────────────────────────────────┘
```

### Admin capabilities
- View all metrics (requests, fulfillment %, by island, by need)
- Review and resolve inaccuracy reports
- Moderate shadow-hidden testimonials (approve / permanently remove)
- Process verification requests
- Post situation updates per island
- View provider team membership
- Export data (CSV) for reporting

---

## 25. Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Internet unreliable post-typhoon | Critical | Service worker for offline, aggressive caching, lightweight pages |
| Fake/malicious service providers | High | All start unverified, manual WhatsApp verification, admin review |
| PII accidentally collected | High | No SSN/address fields in schema, privacy notice on form, input validation |
| Low adoption from providers | Medium | Pre-seed known agencies, direct outreach, social media promotion |
| Scope creep delays launch | Medium | Phase 0 static fallback ready to ship in hours |

---

## 16. Answered Questions

- [x] **Timeline:** ASAP — minimum features, working functionality, UI tests for MVP
- [x] **Deployment:** Static (cloudflare-static-site-suite) + Dynamic (cloudflare-edge-workers) composition template
- [x] **Aid form fields:** Landline (opt), Mobile (opt), textarea fallback if no phone, dogs near home, safely accessible
- [x] **Organization visibility:** All requests across all islands (show which island each is from)
- [x] **Request marking:** Yes — organizations can mark requests as fulfilled/in-progress/unable
- [x] **Provider sign-up:** Must share organization name. Default unverified. Can apply for verification (public badge).
- [x] **Calendar:** One unified calendar for April only (no island split)
- [x] **iCal/Google Calendar:** Not right now
- [x] **Pre-seeding:** No — let FEMA, Red Cross, GovGuam self-register
- [x] **Situation updates:** Yes — per island, Jay will attach a data source for this
- [x] **Multi-language:** Toggle to switch language. Warn that translations may be inaccurate. Only English is authoritative.
- [x] **Reusability:** The TEMPLATE is reusable for future emergencies. This DEPLOYMENT is Sinlaku-specific.

## 17. Open Questions

- [x] Domain: **sinlaku.directory.gu**
- [x] Situation update data sources: JTWC (military), NWS Guam, Guam PDN, Kandit News. MVP = manual. Phase 2 = auto-scrape JTWC/NWS text products.

**All questions answered. PRD is complete.**
