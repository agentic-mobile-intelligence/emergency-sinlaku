import { test, expect } from "@playwright/test"

test.describe("T-LP: Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  // T-LP-01: Island Navigation
  test("T-LP-01: island buttons navigate to island pages", async ({ page }) => {
    // Verify 4 island buttons exist
    await expect(page.getByRole("link", { name: "Guam" })).toBeVisible()
    await expect(page.getByRole("link", { name: "Saipan" })).toBeVisible()
    await expect(page.getByRole("link", { name: "Tinian" })).toBeVisible()
    await expect(page.getByRole("link", { name: "Rota" })).toBeVisible()
  })

  test("T-LP-01a: clicking Guam navigates to /guam", async ({ page }) => {
    await page.getByRole("link", { name: "Guam" }).click()
    await expect(page).toHaveURL("/guam")
    // Island name appears in the selector bar (bg-gray-100 strip) at top of IslandPage
    await expect(page.locator(".bg-gray-100").filter({ hasText: "Guam" })).toBeVisible({ timeout: 5000 })
  })

  test("T-LP-01b: clicking Saipan navigates to /saipan", async ({ page }) => {
    await page.getByRole("link", { name: "Saipan" }).click()
    await expect(page).toHaveURL("/saipan")
    await expect(page.locator(".bg-gray-100").filter({ hasText: "Saipan" })).toBeVisible({ timeout: 5000 })
  })

  test("T-LP-01c: clicking Tinian navigates to /tinian", async ({ page }) => {
    await page.getByRole("link", { name: "Tinian" }).click()
    await expect(page).toHaveURL("/tinian")
    await expect(page.locator(".bg-gray-100").filter({ hasText: "Tinian" })).toBeVisible({ timeout: 5000 })
  })

  test("T-LP-01d: clicking Rota navigates to /rota", async ({ page }) => {
    await page.getByRole("link", { name: "Rota" }).click()
    await expect(page).toHaveURL("/rota")
    await expect(page.locator(".bg-gray-100").filter({ hasText: "Rota" })).toBeVisible({ timeout: 5000 })
  })

  // T-LP-02: CTA Buttons
  test("T-LP-02a: Sign up as Recipient navigates to /request-aid", async ({ page }) => {
    await page.getByRole("link", { name: /Sign up as Recipient/i }).click()
    await expect(page).toHaveURL("/request-aid")
  })

  test("T-LP-02b: Sign up as Provider navigates to /provider/register", async ({ page }) => {
    await page.getByRole("link", { name: /Sign up as Provider/i }).click()
    await expect(page).toHaveURL("/provider/register")
  })

  test("T-LP-02c: Log in link navigates to /login", async ({ page }, testInfo) => {
    // "Log in" link is hidden sm:block — only visible on ≥640 px viewports
    test.skip(testInfo.project.name.includes("Mobile"), "Log in is hidden sm:block on narrow mobile viewports")
    await page.getByRole("link", { name: /log in/i }).click()
    await expect(page).toHaveURL("/login")
  })

  test("T-LP-02d: 911 phone link has tel: href", async ({ page }) => {
    // Use exact text filter to target the LandingPage "911" link only.
    // EmergencyBanner also has a 911 link but its text is "911 Emergency".
    const link = page.locator('a[href="tel:911"]').filter({ hasText: /^911$/ })
    await expect(link).toHaveAttribute("href", "tel:911")
  })

  test("T-LP-02e: FEMA phone link has tel: href", async ({ page }) => {
    // LandingPage FEMA link uses href="tel:18006213362" (dashes stripped).
    // EmergencyBanner uses href="tel:1-800-621-3362" — target by href to avoid ambiguity.
    const link = page.locator('a[href="tel:18006213362"]')
    await expect(link).toHaveAttribute("href", "tel:18006213362")
  })

  // T-LP-03: Emergency Banner
  test("T-LP-03: emergency banner is visible", async ({ page }) => {
    // EmergencyBanner (red bar at top) shows "911 Emergency" link
    await expect(page.getByRole("link", { name: "911 Emergency" })).toBeVisible()
  })
})
