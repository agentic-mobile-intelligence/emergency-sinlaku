---
id: PRD-20260413T100000Z
project: directory-gu
parent_project: john3-16
status: draft
created: 2026-04-13
title: "UI Testing Workflows — Emergency Directory"
---

# PRD: UI Testing Workflows

## 1. Purpose

Define testable user workflows for the emergency directory. Every feature from the main PRD needs a corresponding test flow to verify it works end-to-end before deployment.

---

## 2. Test Environment

| Environment | URL | Notes |
|---|---|---|
| Local dev | `http://localhost:5173` | `bun run dev` |
| Staging | Nexlayer preview URL | Auto-deploy on push |
| Production | `https://sinlaku.directory.gu/` | Custom domain via Cloudflare |

---

## 3. Landing Page Tests

### T-LP-01: Island Navigation

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/` | Landing page loads with 4 island buttons |
| 2 | Click "Guam" | Navigates to `/guam` — map centered on Guam, drawer visible |
| 3 | Click Home button | Returns to `/` |
| 4 | Click "Saipan" | Navigates to `/saipan` — map centered on Saipan |
| 5 | Click "Tinian" | Navigates to `/tinian` — map centered on Tinian |
| 6 | Click "Rota" | Navigates to `/rota` — map centered on Rota |

### T-LP-02: CTA Buttons

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click "Sign up as Recipient" | Navigates to `/request-aid` |
| 2 | Click "Sign up as Provider" | Navigates to `/provider/register` |
| 3 | Click "Have an account? Log in" | Navigates to `/login` |
| 4 | Click 911 phone link | Opens phone dialer (mobile) or `tel:` handler |
| 5 | Click FEMA number | Opens phone dialer |

### T-LP-03: Emergency Banner

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open any page | Red emergency banner visible at top |
| 2 | Scroll down | Banner remains visible (or reappears on scroll-up) |
| 3 | Click phone numbers in banner | Opens dialer |

---

## 4. Island Page Tests

### T-IP-01: Map Rendering

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/guam` | Map loads centered on Guam (13.4443, 144.7937) |
| 2 | Wait for data load | Service pins appear on map (if data exists) |
| 3 | Zoom in/out | Map responds, tiles load |
| 4 | Click a pin | Popup shows service name, org, type, status, hours, phone |
| 5 | Click phone in popup | Opens dialer |

### T-IP-02: Drawer Filters

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/guam` | Left drawer shows filter checkboxes + service cards |
| 2 | Uncheck "Food" | Food pins disappear from map, food cards disappear from drawer |
| 3 | Re-check "Food" | Pins and cards reappear |
| 4 | Uncheck "Active" status | Active services hidden, only Planned/Closed visible |
| 5 | Uncheck all types | Map empty, drawer shows "No services" |

### T-IP-03: Drawer ↔ Map Sync

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click a service card in drawer | Card highlights (blue ring), map pans to that pin |
| 2 | Click a pin on map | Corresponding card scrolls into view and highlights |

### T-IP-04: Island Switching

| Step | Action | Expected Result |
|---|---|---|
| 1 | On `/guam`, click island dropdown | Shows Guam, Saipan, Tinian, Rota |
| 2 | Select "Saipan" | URL changes to `/saipan`, map flies to Saipan, data reloads |

### T-IP-05: Mobile Drawer

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/guam` on mobile viewport (< 768px) | Map is full screen, drawer is hidden |
| 2 | Tap filter icon (bottom-left FAB) | Drawer slides up from bottom (60vh max) |
| 3 | Drag drawer handle down | Drawer closes |

### T-IP-06: Empty State

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to island with no services | Drawer shows "No services registered yet" + "Register as a provider" link |
| 2 | Click "Register as a provider" | Navigates to `/provider/register` |

---

## 5. Provider Registration Tests

### T-PR-01: Happy Path

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/provider/register` | Registration form loads |
| 2 | Fill: org name, email, password, phone, service types, islands | All fields accept input |
| 3 | Submit | Account created in Supabase, redirected to provider dashboard |
| 4 | Check provider dashboard | Shows org info, "Unverified" badge, empty offerings list |

### T-PR-02: Validation

| Step | Action | Expected Result |
|---|---|---|
| 1 | Submit with empty org name | Error: "Organization name required" |
| 2 | Submit with invalid email | Error: "Valid email required" |
| 3 | Submit with no service types selected | Error: "Select at least one service type" |

### T-PR-03: Verification Request

| Step | Action | Expected Result |
|---|---|---|
| 1 | On provider dashboard, toggle "Request Verification" | Shows WhatsApp number + instructions |
| 2 | Admin verifies manually | Provider card shows ✓ Verified badge |

---

## 6. Provider Dashboard Tests

### T-PD-01: Add Offering

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click "Add Offering" | Form appears: name, location, type, hours, capacity, status |
| 2 | Fill and submit | Offering appears in list + as pin on island map |
| 3 | Set status to "Planned" with date/time | Card shows "Planned — [date/time ChST]" |

### T-PD-02: Edit Offering

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click edit on existing offering | Form pre-filled with current data |
| 2 | Change status to "Closed" | Card updates, pin changes appearance on map |

### T-PD-03: View Aid Requests

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to aid requests tab | Shows all requests across all islands |
| 2 | Each request shows island label | Island clearly visible |
| 3 | Click "Responding" on a request | Status changes, visible to recipient |
| 4 | Click "Fulfilled" | Request marked complete |

### T-PD-04: Auto-Close on Capacity

| Step | Action | Expected Result |
|---|---|---|
| 1 | Create offering with capacity 2 | Shows "0/2" |
| 2 | Two aid requests reference this offering | Counter shows "2/2", status auto-changes to "At Capacity" |
| 3 | Provider manually overrides to "Active" | Status changes back, counter resets |

---

## 7. Aid Request Form Tests

### T-AR-01: Happy Path

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/request-aid` | Emergency contacts shown first |
| 2 | Click "Fill out Aid Request Form" | Form loads |
| 3 | Fill: name, island, mobile phone, household size, needs checklist | All fields accept input |
| 4 | Check "I cannot leave my location" | Checkbox toggles, flagged as high-priority |
| 5 | Submit | Confirmation shown, request visible to providers |

### T-AR-02: No Phone Fallback

| Step | Action | Expected Result |
|---|---|---|
| 1 | Leave landline and mobile empty | Textarea appears: "Tell us what's going on and how to reach you" |
| 2 | Fill textarea and submit | Request saved with explanation text |

### T-AR-03: PII Prevention

| Step | Action | Expected Result |
|---|---|---|
| 1 | Verify no SSN field exists | No field labeled SSN, social security, or similar |
| 2 | Verify no address field exists | No field collecting physical address |
| 3 | Privacy notice visible | Banner: "This form does NOT collect SSN, addresses, or confidential info" |

### T-AR-04: Safety Questions

| Step | Action | Expected Result |
|---|---|---|
| 1 | "Are there dogs near your home?" | Yes/No radio buttons |
| 2 | "Is your place safely accessible?" | Yes/No/Unsure radio buttons |
| 3 | Medical needs multi-select | Wheelchair, Oxygen, Dialysis, Insulin, Mobility aid, Other |
| 4 | Elderly/Children/Disabled counts | Number inputs (min 0) |

---

## 8. Calendar View Tests

### T-CV-01: Calendar Rendering

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/calendar` | Unified April 2026 calendar loads |
| 2 | Offerings with dates appear | Color-coded by service type, labeled by island |
| 3 | Click an entry | Navigates to or highlights the corresponding service card |

### T-CV-02: Filters

| Step | Action | Expected Result |
|---|---|---|
| 1 | Filter by service type | Calendar updates to show only matching entries |

---

## 9. Admin Dashboard Tests

### T-AD-01: Metrics

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/admin` | Metrics load: total requests, fulfilled %, by island, by need |
| 2 | Moderation queue shows count | Flagged testimonials visible |
| 3 | Verification requests show count | Pending verifications visible |

### T-AD-02: Verification

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click "Verify" on a pending provider | Provider status changes to verified |
| 2 | Provider card on island page shows ✓ badge | Badge visible in drawer + map popup |

---

## 10. Share & Community Tests

### T-SH-01: Share Buttons

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click WhatsApp share on a service card | Opens WhatsApp with pre-formatted message + URL |
| 2 | Click Facebook share | Opens Facebook share dialog |
| 3 | Click copy link | URL copied to clipboard, toast confirmation |

### T-SH-02: Community Confirmations

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click "Confirm" on a service card | Confirmation count increments |
| 2 | Leave anonymous confirmation | Shows as "Community Verified" |
| 3 | Signed-in user confirms | Shows first name |

---

## 11. PWA / Offline Tests

### T-PWA-01: Install

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open in Safari (iOS) | "Add to Home Screen" available |
| 2 | Open in Chrome (Android) | Install prompt or "Add to Home Screen" available |
| 3 | Launch from home screen | App opens full-screen (no browser chrome) |

### T-PWA-02: Offline

| Step | Action | Expected Result |
|---|---|---|
| 1 | Load island page while online | Data cached by service worker |
| 2 | Disable network | Offline banner appears: "You are offline. Showing last updated data from [timestamp]" |
| 3 | Browse cached services | Cards and map tiles still visible |
| 4 | Submit aid request while offline | Saved locally, toast: "Will submit when back online" |
| 5 | Re-enable network | Queued request auto-submits |

---

## 12. Cross-Browser / Device Matrix

| Device | Browser | Priority |
|---|---|---|
| iPhone (Safari) | iOS Safari 17+ | P0 — most users post-typhoon |
| Android (Chrome) | Chrome 120+ | P0 |
| Desktop (Chrome) | Chrome 120+ | P1 |
| Desktop (Firefox) | Firefox 120+ | P2 |
| Android (Samsung Internet) | Samsung Internet 24+ | P2 |

**Mobile-first testing priority.** Most users will be on phones with potentially cracked screens and poor connectivity.

---

## 13. Automation Strategy

### Phase 1: Manual testing (now)
Run through all T-* test cases manually. Record pass/fail in a spreadsheet or this document.

### Phase 2: Playwright (post-MVP)
Automate critical paths:
- T-LP-01 (island navigation)
- T-PR-01 (provider registration)
- T-AR-01 (aid request submission)
- T-IP-02 (drawer filters)

```bash
# Future: run tests
npx playwright test
```

### Phase 3: CI integration
GitHub Actions runs Playwright on every push to `main`.
