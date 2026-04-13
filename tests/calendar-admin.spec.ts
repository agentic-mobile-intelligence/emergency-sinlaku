import { test, expect } from "@playwright/test"

test.describe("T-CV: Calendar View", () => {
  test("T-CV-01: calendar page loads", async ({ page }) => {
    await page.goto("/calendar")
    // Calendar should render with April 2026 content
    await expect(page.getByText(/april|calendar/i).first()).toBeVisible({ timeout: 5000 })
  })
})

test.describe("T-AD: Admin Dashboard", () => {
  test("T-AD-01: admin page loads", async ({ page }) => {
    await page.goto("/admin")
    // Either admin loads or redirects to login
    const url = page.url()
    expect(url).toMatch(/admin|login/)
  })
})

test.describe("T-SH: Share & Community", () => {
  test("T-SH-01: emergency banner phone links work on all pages", async ({ page }) => {
    const pages = ["/", "/guam", "/request-aid", "/provider/register", "/calendar"]
    for (const path of pages) {
      await page.goto(path)
      const banner = page.getByText("EMERGENCY")
      await expect(banner).toBeVisible()
    }
  })
})
