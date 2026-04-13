import { test, expect } from "@playwright/test"

test.describe("T-IP: Island Page", () => {
  // T-IP-01: Map Rendering
  test("T-IP-01a: Guam map loads centered correctly", async ({ page }) => {
    await page.goto("/guam")
    const map = page.locator(".leaflet-container")
    await expect(map).toBeVisible({ timeout: 10000 })
    // Map tiles should load
    await expect(page.locator(".leaflet-tile-loaded").first()).toBeVisible({ timeout: 15000 })
  })

  test("T-IP-01b: sticky header visible with island name", async ({ page }) => {
    await page.goto("/guam")
    await expect(page.getByText("Guam")).toBeVisible()
    // Request Aid and Provider buttons in header
    await expect(page.getByRole("button", { name: /Request Aid/i })).toBeVisible()
    await expect(page.getByRole("button", { name: /Provider/i })).toBeVisible()
  })

  test("T-IP-01c: Home button navigates back to landing", async ({ page }) => {
    await page.goto("/guam")
    await page.locator("button").filter({ has: page.locator("svg.lucide-home") }).click()
    await expect(page).toHaveURL("/")
  })

  // T-IP-02: Drawer Filters
  test("T-IP-02a: filter checkboxes render for all service types", async ({ page }) => {
    await page.goto("/guam")
    const serviceTypes = ["shelter", "food", "water", "medical", "tarps", "cleanup", "clothing", "transportation"]
    for (const type of serviceTypes) {
      await expect(page.getByText(type, { exact: false })).toBeVisible()
    }
  })

  test("T-IP-02b: status filter checkboxes render", async ({ page }) => {
    await page.goto("/guam")
    await expect(page.getByText("active", { exact: false })).toBeVisible()
    await expect(page.getByText("planned", { exact: false })).toBeVisible()
  })

  // T-IP-04: Island Switching
  test("T-IP-04: island dropdown switches islands", async ({ page }) => {
    await page.goto("/guam")
    // Open island dropdown
    await page.getByRole("button", { name: /Guam/i }).click()
    await page.getByRole("menuitem", { name: "Saipan" }).click()
    await expect(page).toHaveURL("/saipan")
  })

  // T-IP-06: Empty State
  test("T-IP-06: empty state shows register link", async ({ page }) => {
    await page.goto("/guam")
    // If no services, should show empty state (depends on data)
    const emptyState = page.getByText("No services registered yet")
    const hasServices = await page.locator("[class*='card']").count() > 0
    if (!hasServices) {
      await expect(emptyState).toBeVisible()
      await expect(page.getByText("Register as a provider")).toBeVisible()
    }
  })

  // T-IP-05: Mobile drawer (only runs in mobile projects)
  test("T-IP-05: mobile filter button visible on small viewport", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Mobile-only test")
    await page.goto("/guam")
    // Filter FAB should be visible
    const filterBtn = page.locator("button").filter({ has: page.locator("svg.lucide-filter") }).first()
    await expect(filterBtn).toBeVisible()
  })
})
