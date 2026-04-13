/**
 * T-LG: Login Page
 *
 * Tests cover:
 *  - Page rendering + required fields
 *  - Navigation links (register)
 *  - Invalid credentials → error display
 *  - Valid credentials → redirect to /provider/dashboard
 *
 * Auth is mocked via page.route() — no live Supabase instance required.
 */

import { test, expect, type Page } from "@playwright/test"

// ── Helpers ───────────────────────────────────────────────────────────────────

const MOCK_USER_ID = "00000000-0000-0000-0000-000000000099"
const MOCK_EMAIL = "sandbox-provider@sinlaku.directory.gu"
const MOCK_PASSWORD = "Sinlaku2026!"

// Mock a successful Supabase signInWithPassword round-trip.
// Intercepts:
//   - POST glob(**)/auth/v1/token  -> 200 with session payload
//   - GET  glob(**)/rest/v1/profiles -> 200 with profile row
//   - GET  glob(**)/rest/v1/organizations -> 200 with org row
//   - GET  glob(**)/rest/v1/aid_requests -> 200 empty array
async function mockSuccessfulAuth(page: Page) {
  await page.route("**/auth/v1/token**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        access_token: "mock-access-token",
        token_type: "bearer",
        expires_in: 3600,
        refresh_token: "mock-refresh-token",
        user: {
          id: MOCK_USER_ID,
          aud: "authenticated",
          role: "authenticated",
          email: MOCK_EMAIL,
          email_confirmed_at: "2026-04-13T00:00:00Z",
          confirmed_at: "2026-04-13T00:00:00Z",
          last_sign_in_at: "2026-04-13T00:00:00Z",
          app_metadata: { provider: "email", providers: ["email"] },
          user_metadata: { display_name: "Sandbox Provider" },
          identities: [],
          created_at: "2026-04-13T00:00:00Z",
          updated_at: "2026-04-13T00:00:00Z",
        },
      }),
    })
  )

  await page.route("**/rest/v1/profiles*", (route) =>
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

  await page.route("**/rest/v1/organizations*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "00000000-0000-0000-0001-000000000099",
        user_id: MOCK_USER_ID,
        name: "Mock Org",
        description: null,
        contact_phone: "671-555-0100",
        contact_email: null,
        whatsapp: null,
        service_types: ["food"],
        islands: ["guam"],
        verified: false,
        verification_requested: false,
        created_at: "2026-04-13T00:00:00Z",
        updated_at: "2026-04-13T00:00:00Z",
      }),
    })
  )

  await page.route("**/rest/v1/aid_requests*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    })
  )

  await page.route("**/rest/v1/offerings*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    })
  )
}

/** Mock a failed signIn attempt (invalid credentials). */
async function mockFailedAuth(page: Page) {
  await page.route("**/auth/v1/token**", (route) =>
    route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({
        error: "invalid_grant",
        error_description: "Invalid login credentials",
      }),
    })
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe("T-LG: Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login")
  })

  // T-LG-01: Page renders with correct heading and fields
  test("T-LG-01: login page renders with required fields", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /provider sign in/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible()
  })

  // T-LG-02: Subtitle / helper text is visible
  test("T-LG-02: subtitle describes the purpose of this page", async ({ page }) => {
    await expect(page.getByText(/manage your relief offerings/i)).toBeVisible()
  })

  // T-LG-03: Register link navigates to /provider/register
  test("T-LG-03: register link navigates to /provider/register", async ({ page }) => {
    await page.getByRole("link", { name: /sign up as a provider/i }).click()
    await expect(page).toHaveURL("/provider/register")
  })

  // T-LG-04: Empty form submission — email field required (HTML5 validation)
  test("T-LG-04: empty form does not submit — email is required", async ({ page }) => {
    await page.getByRole("button", { name: /sign in/i }).click()
    // HTML5 required prevents submission; email field should be focused
    const emailField = page.getByLabel(/email/i)
    await expect(emailField).toBeFocused()
    // URL stays on /login
    await expect(page).toHaveURL("/login")
  })

  // T-LG-05: Email with missing password — password field required
  test("T-LG-05: email filled but password empty — password is required", async ({ page }) => {
    await page.getByLabel(/email/i).fill("test@example.com")
    await page.getByRole("button", { name: /sign in/i }).click()
    const passwordField = page.getByLabel(/password/i)
    await expect(passwordField).toBeFocused()
    await expect(page).toHaveURL("/login")
  })

  // T-LG-06: Invalid credentials display an error message
  test("T-LG-06: wrong credentials show error alert", async ({ page }) => {
    await mockFailedAuth(page)
    await page.getByLabel(/email/i).fill("wrong@example.com")
    await page.getByLabel(/password/i).fill("badpassword")
    await page.getByRole("button", { name: /sign in/i }).click()

    // Error container with AlertTriangle icon + red styling
    const errorBox = page.locator(
      "[class*='red'], [class*='destructive'], [role='alert']"
    ).first()
    await expect(errorBox).toBeVisible({ timeout: 5000 })
  })

  // T-LG-07: Button re-enables after a failed request completes
  test("T-LG-07: sign-in button re-enables after failed request", async ({ page }) => {
    // Delay the auth response so we can observe the in-flight state
    await page.route("**/auth/v1/token**", async (route) => {
      await new Promise((r) => setTimeout(r, 200))
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ error: "invalid_grant", error_description: "Invalid login credentials" }),
      })
    })

    await page.getByLabel(/email/i).fill("test@example.com")
    await page.getByLabel(/password/i).fill("somepassword")
    await page.getByRole("button", { name: /sign in/i }).click()

    // Spinner (animate-spin) appears during loading — wait for it
    await expect(page.locator(".animate-spin")).toBeVisible({ timeout: 2000 })
    // After request completes, spinner disappears and button re-enables
    await expect(page.locator(".animate-spin")).not.toBeVisible({ timeout: 5000 })
    await expect(page.getByRole("button", { name: /sign in/i })).toBeEnabled({ timeout: 3000 })
  })

  // T-LG-08: Successful login redirects to /provider/dashboard
  test("T-LG-08: valid credentials redirect to /provider/dashboard", async ({ page }) => {
    await mockSuccessfulAuth(page)

    await page.getByLabel(/email/i).fill(MOCK_EMAIL)
    await page.getByLabel(/password/i).fill(MOCK_PASSWORD)
    await page.getByRole("button", { name: /sign in/i }).click()

    await expect(page).toHaveURL("/provider/dashboard", { timeout: 8000 })
  })
})
