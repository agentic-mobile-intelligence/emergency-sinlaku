/**
 * T-PR: Provider Registration
 * T-PD: Provider Dashboard
 *
 * Tests cover:
 *  - Multi-step registration form (step indicators, mode toggle, fields)
 *  - Auth step validation
 *  - Org step: service types, islands, required fields
 *  - Dashboard: unauthenticated redirect
 *  - Dashboard: tab structure (mocked session)
 *
 * Auth is mocked via page.route() + addInitScript() — no live Supabase needed.
 * Tests that require a seeded org use SEED_ORGS from helpers/seed-ids.
 */

import { test, expect, type Page } from "@playwright/test"

// ── Constants ─────────────────────────────────────────────────────────────────

const MOCK_USER_ID = "00000000-0000-0000-0000-000000000099"
const MOCK_USER_EMAIL = "sandbox-provider@sinlaku.directory.gu"

const MOCK_SESSION = {
  access_token: "mock-access-token",
  token_type: "bearer",
  expires_in: 3600,
  // expires_at in the future (year 2099) so Supabase never tries to refresh
  expires_at: 4070908800,
  refresh_token: "mock-refresh-token",
  user: {
    id: MOCK_USER_ID,
    aud: "authenticated",
    role: "authenticated",
    email: MOCK_USER_EMAIL,
    email_confirmed_at: "2026-04-13T00:00:00Z",
    confirmed_at: "2026-04-13T00:00:00Z",
    last_sign_in_at: "2026-04-13T00:00:00Z",
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: { display_name: "Sandbox Provider" },
    identities: [],
    created_at: "2026-04-13T00:00:00Z",
    updated_at: "2026-04-13T00:00:00Z",
  },
}

const MOCK_ORG = {
  id: "00000000-0000-0000-0001-000000000099",
  user_id: MOCK_USER_ID,
  name: "Mock Org — Guam",
  description: "Mock org for testing",
  contact_phone: "671-555-0100",
  contact_email: null,
  whatsapp: null,
  service_types: ["food", "water"],
  islands: ["guam"],
  verified: false,
  verification_requested: false,
  created_at: "2026-04-13T00:00:00Z",
  updated_at: "2026-04-13T00:00:00Z",
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Extract project ref from VITE_SUPABASE_URL so we can set the exact localStorage key.
// Key format Supabase v2 uses: "sb-{projectRef}-auth-token"
const SUPABASE_PROJECT_REF = (process.env.VITE_SUPABASE_URL ?? "")
  .replace("https://", "")
  .split(".")[0] // e.g. "uukwajicnqgkuribktdl"

/**
 * Inject a mock Supabase session into localStorage BEFORE the page loads.
 * Must be called before page.goto(). Uses addInitScript to run before
 * app scripts so useAuth's getSession() picks up the mock session.
 *
 * Two-pronged approach for cross-browser compatibility:
 *  1. Directly set localStorage item with the exact Supabase key (works in WebKit/Safari)
 *  2. Override localStorage.getItem as fallback for any sb-*-auth-token key
 */
async function injectSession(page: Page, session = MOCK_SESSION) {
  await page.addInitScript(({ sess, projectRef }) => {
    const sessionStr = JSON.stringify(sess)

    // Prong 1: directly write the session value so Supabase's own getItem reads it
    if (projectRef) {
      try { localStorage.setItem(`sb-${projectRef}-auth-token`, sessionStr) } catch {}
    }

    // Prong 2: override getItem for any Supabase auth token key (WebKit may bypass setItem)
    const _orig = localStorage.getItem.bind(localStorage)
    Object.defineProperty(localStorage, "getItem", {
      value: (key: string) => {
        if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
          return sessionStr
        }
        return _orig(key)
      },
      writable: true,
      configurable: true,
    })
  }, { sess: session, projectRef: SUPABASE_PROJECT_REF })
}

/**
 * Mock all Supabase REST API calls needed for the provider dashboard.
 * Also mocks auth token endpoint for any token refresh attempts.
 */
async function mockProviderApiRoutes(page: Page, opts: { orgExists?: boolean } = {}) {
  const { orgExists = true } = opts

  // Auth token (covers signIn + any token refresh)
  await page.route("**/auth/v1/token**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_SESSION),
    })
  )

  // Auth signup
  await page.route("**/auth/v1/signup**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_SESSION),
    })
  )

  // Profile fetch
  await page.route("**/rest/v1/profiles**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: MOCK_USER_ID,
        display_name: "Sandbox Provider",
        role: "provider",
        avatar_url: null,
        created_at: "2026-04-13T00:00:00Z",
      }),
    })
  )

  // Organization fetch
  await page.route("**/rest/v1/organizations**", (route) =>
    route.fulfill({
      status: orgExists ? 200 : 406,
      contentType: "application/json",
      body: orgExists
        ? JSON.stringify(MOCK_ORG)
        : JSON.stringify({ code: "PGRST116", message: "The result contains 0 rows" }),
    })
  )

  // Offerings and aid requests
  await page.route("**/rest/v1/offerings**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" })
  )

  await page.route("**/rest/v1/aid_requests**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" })
  )
}

/** Switch from signup to signin mode in the auth step. */
async function switchToSignin(page: Page) {
  await page.getByRole("button", { name: /already have an account/i }).click()
  await expect(page.getByText(/sign in to your account/i)).toBeVisible()
}

/** Submit the auth step (signin mode) with mock credentials. */
async function submitSignin(page: Page) {
  await page.locator("input[type='email']").first().fill(MOCK_USER_EMAIL)
  await page.locator("input[type='password']").first().fill("Sinlaku2026!")
  await page.locator("button[type='submit']").first().click()
}

// ── T-PR: Registration ────────────────────────────────────────────────────────

test.describe("T-PR: Provider Registration", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/provider/register")
  })

  // T-PR-01: Page structure — step indicators + fields
  test("T-PR-01: registration form shows step indicators and auth fields", async ({ page }) => {
    // Step indicator labels (use .first() to avoid strict mode violation)
    await expect(page.getByText("Account").first()).toBeVisible()
    await expect(page.getByText("Organization").first()).toBeVisible()

    // Auth step fields
    await expect(page.locator("input[type='email']").first()).toBeVisible()
    await expect(page.locator("input[type='password']").first()).toBeVisible()

    // Submit button (type=submit only, not the toggle link button)
    await expect(page.locator("button[type='submit']").first()).toBeVisible()
  })

  // T-PR-02: Empty submission — email required
  test("T-PR-02: submit without email shows validation", async ({ page }) => {
    // DEV mode pre-fills credentials — clear them to test validation
    await page.locator("input[type='email']").first().fill("")
    await page.locator("input[type='password']").first().fill("")
    await page.locator("button[type='submit']").first().click()
    // HTML5 required — email field should be focused
    await expect(page.locator("input[type='email']").first()).toBeFocused()
    await expect(page).toHaveURL("/provider/register")
  })

  // T-PR-03: Email filled, password missing — password required
  test("T-PR-03: email filled but password empty shows password validation", async ({ page }) => {
    // DEV mode pre-fills password — clear it, then fill only email
    await page.locator("input[type='password']").first().fill("")
    await page.locator("input[type='email']").first().fill("test@example.com")
    await page.locator("button[type='submit']").first().click()
    await expect(page.locator("input[type='password']").first()).toBeFocused()
    await expect(page).toHaveURL("/provider/register")
  })

  // T-PR-04: Toggle between signup and signin modes
  test("T-PR-04: can toggle between signup and signin modes", async ({ page }) => {
    // Default: signup mode
    await expect(page.getByText(/create your provider account/i)).toBeVisible()

    // Switch to signin
    await page.getByRole("button", { name: /already have an account/i }).click()
    await expect(page.getByText(/sign in to your account/i)).toBeVisible()
    // Display name field only shows in signup mode
    await expect(page.locator("#displayName")).not.toBeVisible()

    // Switch back to signup
    await page.getByRole("button", { name: /need an account/i }).click()
    await expect(page.getByText(/create your provider account/i)).toBeVisible()
    await expect(page.locator("#displayName")).toBeVisible()
  })

  // T-PR-05: Signup mode shows display name field
  test("T-PR-05: signup mode shows display name / your name field", async ({ page }) => {
    await expect(page.locator("#displayName")).toBeVisible()
  })

  // T-PR-06: After auth step, org form appears with service type checkboxes
  test("T-PR-06: after auth, org step shows service type options", async ({ page }) => {
    await mockProviderApiRoutes(page, { orgExists: false })
    await switchToSignin(page)
    await submitSignin(page)

    // Should advance to org step
    await expect(page.getByText(/register your organization/i)).toBeVisible({ timeout: 8000 })

    // All 8 service type options — use exact match to avoid matching description textarea
    for (const type of ["Shelter", "Food", "Water", "Medical", "Tarps", "Cleanup", "Clothing", "Transportation"]) {
      await expect(page.getByText(type, { exact: true })).toBeVisible()
    }
  })

  // T-PR-07: After auth step, org form shows island checkboxes
  test("T-PR-07: after auth, org step shows all four island options", async ({ page }) => {
    await mockProviderApiRoutes(page, { orgExists: false })
    await switchToSignin(page)
    await submitSignin(page)

    await expect(page.getByText(/register your organization/i)).toBeVisible({ timeout: 8000 })

    for (const island of ["Guam", "Saipan", "Tinian", "Rota"]) {
      // Use exact match anchored to checkbox labels (not page title or header)
      await expect(page.locator(`label`).filter({ hasText: island })).toBeVisible()
    }
  })

  // T-PR-08: Org form validation — org name required
  test("T-PR-08: org form requires organization name — HTML5 validation fires", async ({ page }) => {
    await mockProviderApiRoutes(page, { orgExists: false })
    await switchToSignin(page)
    await submitSignin(page)

    await expect(page.getByText(/register your organization/i)).toBeVisible({ timeout: 8000 })

    // Clear org name (DEV pre-fills it) and submit
    await page.locator("#org-name").fill("")
    await page.locator("button[type='submit']").first().click()

    // HTML5 required validation prevents submit and focuses the field
    await expect(page.locator("#org-name")).toBeFocused()
    // Form stays on the org step (no redirect)
    await expect(page).toHaveURL("/provider/register")
  })

  // T-PR-09: Verification notice is visible on org step
  test("T-PR-09: org step shows unverified / WhatsApp verification notice", async ({ page }) => {
    await mockProviderApiRoutes(page, { orgExists: false })
    await switchToSignin(page)
    await submitSignin(page)

    await expect(page.getByText(/register your organization/i)).toBeVisible({ timeout: 8000 })
    await expect(page.getByText(/unverified/i)).toBeVisible()
    // WhatsApp text appears in both the label and the notice paragraph — use first()
    await expect(page.getByText(/whatsapp/i).first()).toBeVisible()
  })
})

// ── T-PD: Provider Dashboard ──────────────────────────────────────────────────

test.describe("T-PD: Provider Dashboard", () => {
  // T-PD-01: Unauthenticated access redirects to /login
  test("T-PD-01: unauthenticated access redirects to /login", async ({ page }) => {
    await page.goto("/provider/dashboard")
    await expect(page).toHaveURL("/login", { timeout: 5000 })
  })

  // T-PD-02: Authenticated dashboard shows org card + two tabs
  test("T-PD-02: authenticated dashboard shows org info card and Offerings/Aid Requests tabs", async ({ page }) => {
    // Inject session before page loads, then mock API routes
    await injectSession(page)
    await mockProviderApiRoutes(page)
    await page.goto("/provider/dashboard")

    // Org info card is above the tabs (always visible when org loaded)
    await expect(page.getByText(/organization info/i)).toBeVisible({ timeout: 8000 })
    // Two tabs: Offerings | Aid Requests
    await expect(page.getByRole("tab", { name: /offerings/i })).toBeVisible()
    await expect(page.getByRole("tab", { name: /aid requests/i })).toBeVisible()
  })

  // T-PD-03: Add Offering button visible on Offerings tab
  test("T-PD-03: Offerings tab has Add Offering button", async ({ page }) => {
    await injectSession(page)
    await mockProviderApiRoutes(page)
    await page.goto("/provider/dashboard")

    await expect(page.getByRole("tab", { name: /offering/i })).toBeVisible({ timeout: 8000 })
    await page.getByRole("tab", { name: /offering/i }).click()
    await expect(page.getByRole("button", { name: /add offering/i })).toBeVisible({ timeout: 5000 })
  })

  // T-PD-04: Org card shows verification toggle
  test("T-PD-04: org card shows Request Verification toggle", async ({ page }) => {
    await injectSession(page)
    await mockProviderApiRoutes(page)
    await page.goto("/provider/dashboard")

    // Org card is always visible above tabs
    await expect(page.getByText(/organization info/i)).toBeVisible({ timeout: 8000 })
    // Unverified org shows "Request Verification" toggle
    await expect(page.getByText(/request verification/i)).toBeVisible({ timeout: 5000 })
  })

  // T-PD-05: Add Offering dialog opens when button clicked
  test("T-PD-05: clicking Add Offering opens the offering dialog", async ({ page }) => {
    await injectSession(page)
    await mockProviderApiRoutes(page)
    await page.goto("/provider/dashboard")

    await expect(page.getByRole("tab", { name: /offering/i })).toBeVisible({ timeout: 8000 })
    await page.getByRole("tab", { name: /offering/i }).click()
    await page.getByRole("button", { name: /add offering/i }).click()

    // Dialog should open with the offering name field
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 3000 })
    // Dialog has a "Name" label (first field in the offering form)
    await expect(page.getByRole("dialog").getByText("Name", { exact: true })).toBeVisible()
  })
})
