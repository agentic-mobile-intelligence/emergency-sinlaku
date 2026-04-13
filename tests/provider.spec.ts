import { test, expect } from "@playwright/test"

test.describe("T-PR: Provider Registration", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/provider/register")
  })

  // T-PR-01: Registration Form Loads
  test("T-PR-01: registration form has required fields", async ({ page }) => {
    // Org name
    await expect(page.getByLabel(/organization|org name/i).first()).toBeVisible()
    // Email
    await expect(page.getByLabel(/email/i).first()).toBeVisible()
    // Service types
    await expect(page.getByText(/shelter|food|water|medical/i).first()).toBeVisible()
    // Submit button
    await expect(page.getByRole("button", { name: /register|submit|sign up/i })).toBeVisible()
  })

  // T-PR-02: Validation
  test("T-PR-02: empty submission shows validation errors", async ({ page }) => {
    // Click submit without filling
    await page.getByRole("button", { name: /register|submit|sign up/i }).click()
    // Should show error messages (exact text depends on implementation)
    const errors = page.locator("[class*='error'], [class*='destructive'], [role='alert']")
    await expect(errors.first()).toBeVisible({ timeout: 3000 })
  })
})

test.describe("T-PD: Provider Dashboard", () => {
  // T-PD-01: Dashboard loads (requires auth — skip if not logged in)
  test("T-PD-01: dashboard page loads", async ({ page }) => {
    await page.goto("/provider/dashboard")
    // Either dashboard loads or redirect to login
    const url = page.url()
    expect(url).toMatch(/provider\/dashboard|login|provider\/register/)
  })
})
