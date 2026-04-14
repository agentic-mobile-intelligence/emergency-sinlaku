import { test, expect } from "@playwright/test"

test.describe("T-LP: Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  // T-LP-01: Island Navigation
  test("T-LP-01: island buttons navigate to island pages", async ({ page }) => {
    // Use exact:true — EmergencyBanner marquee includes "NWS Guam" which would cause
    // a strict-mode violation without exact matching.
    await expect(page.getByRole("link", { name: "Guam", exact: true })).toBeVisible()
    await expect(page.getByRole("link", { name: "Saipan", exact: true })).toBeVisible()
    await expect(page.getByRole("link", { name: "Tinian", exact: true })).toBeVisible()
    await expect(page.getByRole("link", { name: "Rota", exact: true })).toBeVisible()
  })

  test("T-LP-01a: clicking Guam navigates to /guam", async ({ page }) => {
    // exact:true — EmergencyBanner also renders "NWS Guam" (twice, as an infinite-scroll marquee)
    await page.getByRole("link", { name: "Guam", exact: true }).click()
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
  test("T-LP-02a: Request Aid button navigates to /request-aid", async ({ page }) => {
    // Header CTA was renamed from "Sign up as Recipient" → "Request Aid" after Clerk migration.
    // The StickyHeader uses Clerk's <SignedOut> which only renders once Clerk is loaded (isLoaded=true).
    // Under parallel test load the Clerk SDK init can be slow — wait up to 15s.
    const link = page.getByRole("link", { name: /Request Aid/i }).first()
    await expect(link).toBeVisible({ timeout: 15000 })
    await link.click()
    await expect(page).toHaveURL("/request-aid")
  })

  test("T-LP-02b: Sign up as Provider navigates to /provider/register", async ({ page }) => {
    // Same Clerk <SignedOut> timing concern — wait for visibility first.
    const link = page.getByRole("link", { name: /Sign up as Provider/i })
    await expect(link).toBeVisible({ timeout: 15000 })
    await link.click()
    await expect(page).toHaveURL("/provider/register")
  })

  test("T-LP-02c: Log in button is visible in header", async ({ page }, testInfo) => {
    // After Clerk migration, "Log in" is a <SignInButton mode="modal"> — not a link to /login.
    // It opens a Clerk-hosted modal, so we just verify it's visible rather than testing navigation.
    test.skip(testInfo.project.name.includes("Mobile"), "Log in is hidden sm:block on narrow mobile viewports")
    await expect(page.getByRole("button", { name: /log in/i })).toBeVisible({ timeout: 15000 })
  })

  test("T-LP-02d: 911 phone link has tel: href", async ({ page }) => {
    // Emergency phone links moved from landing page footer to EmergencyBanner marquee and
    // /emergency-contacts page after Clerk migration. Use .first() because MarqueeContent
    // is rendered twice for the infinite-scroll animation.
    const link = page.locator('a[href="tel:911"]').first()
    await expect(link).toHaveAttribute("href", "tel:911")
  })

  test("T-LP-02e: FEMA phone link has tel: href", async ({ page }) => {
    // FEMA link is in EmergencyBanner marquee (rendered twice); target first occurrence.
    const link = page.locator('a[href="tel:18006213362"]').first()
    await expect(link).toHaveAttribute("href", "tel:18006213362")
  })

  // T-LP-03: Emergency Banner
  test("T-LP-03: emergency banner is visible", async ({ page }) => {
    // EmergencyBanner renders MarqueeContent twice for infinite scroll — use .first()
    // to avoid strict-mode violation from the duplicate link.
    await expect(page.getByRole("link", { name: "911 Emergency" }).first()).toBeVisible()
  })
})
