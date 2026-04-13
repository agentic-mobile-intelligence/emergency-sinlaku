import { test, expect } from "@playwright/test"
import { SEED_LABELS, TOTAL_GUAM_SEED_COUNT } from "./helpers/seed-ids"

// ─── helpers ────────────────────────────────────────────────────────────────

/** Wait for Supabase data to populate the drawer (loading → count label) */
async function waitForServices(page: import("@playwright/test").Page, minCount = 1) {
  // Wait for a non-zero service count (avoids matching "0 services")
  await expect(
    page.locator("text=/[1-9]\\d* service/")
  ).toBeVisible({ timeout: 12000 })

  // Ensure at least minCount service cards rendered
  await expect(page.locator('[data-testid="service-card"]').first()).toBeVisible({ timeout: 8000 })
  expect(await page.locator('[data-testid="service-card"]').count()).toBeGreaterThanOrEqual(minCount)
}

// ─── T-IP-01: Map rendering ──────────────────────────────────────────────────

test.describe("T-IP-01: Map rendering", () => {
  test("map container is visible after navigating to /guam", async ({ page }) => {
    await page.goto("/guam")
    await expect(page.locator(".leaflet-container")).toBeVisible({ timeout: 10000 })
  })

  test("Leaflet tiles load on /guam", async ({ page }) => {
    await page.goto("/guam")
    await expect(page.locator(".leaflet-tile-loaded").first()).toBeVisible({ timeout: 15000 })
  })

  test("island selector bar shows 'Guam'", async ({ page }) => {
    await page.goto("/guam")
    // The island name label in the bar
    const bar = page.locator(".bg-gray-100.border-b")
    await expect(bar.getByText("Guam")).toBeVisible()
  })
})

// ─── T-IP-02: Seeded data visible ────────────────────────────────────────────

test.describe("T-IP-02: Seeded Guam data", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/guam")
    await waitForServices(page, TOTAL_GUAM_SEED_COUNT)
  })

  test("shows correct service count for seeded Guam offerings", async ({ page }) => {
    await expect(page.getByText(`${TOTAL_GUAM_SEED_COUNT} services`)).toBeVisible()
  })

  test("shelter card: Tiyan High School offering is visible", async ({ page }) => {
    await expect(page.getByText(SEED_LABELS.offerings.shelter)).toBeVisible()
  })

  test("food card: Hot Meal Distribution offering is visible", async ({ page }) => {
    await expect(page.getByText(SEED_LABELS.offerings.food)).toBeVisible()
  })

  test("FEMA DRC shelter offering is visible", async ({ page }) => {
    await expect(page.getByText(SEED_LABELS.offerings.femaDrc)).toBeVisible()
  })

  test("tarps card: Adelup Point offering is visible", async ({ page }) => {
    await expect(page.getByText(SEED_LABELS.offerings.tarps)).toBeVisible()
  })

  test("org name 'Guam Red Cross Emergency Shelter' appears on card", async ({ page }) => {
    await expect(page.getByText(SEED_LABELS.orgs.redCross).first()).toBeVisible()
  })

  test("org name 'FEMA Disaster Recovery Center — Guam' appears on card", async ({ page }) => {
    await expect(page.getByText(SEED_LABELS.orgs.fema).first()).toBeVisible()
  })

  test("verified badge visible on Red Cross card", async ({ page }) => {
    // Each verified org shows a 'Verified' label in the card
    const verifiedLabels = page.getByText("Verified")
    await expect(verifiedLabels.first()).toBeVisible()
    expect(await verifiedLabels.count()).toBeGreaterThanOrEqual(1)
  })

  test("shelter card shows 'Active' status badge", async ({ page }) => {
    const shelterCard = page.locator('[data-testid="service-card"]').filter({
      hasText: SEED_LABELS.offerings.shelter,
    })
    await expect(shelterCard.getByText("Active")).toBeVisible()
  })

  test("shelter card shows 24/7 hours", async ({ page }) => {
    const shelterCard = page.locator('[data-testid="service-card"]').filter({
      hasText: SEED_LABELS.offerings.shelter,
    })
    await expect(shelterCard.getByText("24/7")).toBeVisible()
  })

  test("tarps card shows correct hours", async ({ page }) => {
    const tarpsCard = page.locator('[data-testid="service-card"]').filter({
      hasText: SEED_LABELS.offerings.tarps,
    })
    await expect(tarpsCard.getByText("8am–4pm Mon–Fri")).toBeVisible()
  })
})

// ─── T-IP-03: Map markers for seeded data ────────────────────────────────────

test.describe("T-IP-03: Map markers", () => {
  test("map shows markers for seeded Guam offerings", async ({ page }) => {
    await page.goto("/guam")
    // Wait for data to load
    await waitForServices(page, TOTAL_GUAM_SEED_COUNT)
    // Leaflet renders each marker as a div icon
    const markers = page.locator(".leaflet-marker-icon")
    await expect(markers.first()).toBeVisible({ timeout: 10000 })
    expect(await markers.count()).toBeGreaterThanOrEqual(TOTAL_GUAM_SEED_COUNT)
  })

  test("clicking a card scrolls and highlights it", async ({ page }) => {
    await page.goto("/guam")
    await waitForServices(page, 1)
    const shelterCard = page.locator('[data-testid="service-card"]').filter({
      hasText: SEED_LABELS.offerings.shelter,
    })
    await shelterCard.click()
    // Card gets ring-2 ring-blue-500 highlight
    await expect(
      page.locator('[class*="ring-blue-500"]')
    ).toBeVisible({ timeout: 3000 })
  })
})

// ─── T-IP-04: Service type filter ────────────────────────────────────────────

test.describe("T-IP-04: Filtering by service type", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/guam")
    await waitForServices(page, TOTAL_GUAM_SEED_COUNT)
  })

  test("unchecking 'shelter' hides shelter cards", async ({ page }) => {
    // Uncheck shelter
    const shelterLabel = page.locator("label").filter({ hasText: /^shelter$/i })
    await shelterLabel.click()

    // Shelter cards should disappear
    await expect(page.getByText(SEED_LABELS.offerings.shelter)).not.toBeVisible({ timeout: 3000 })
    await expect(page.getByText(SEED_LABELS.offerings.femaDrc)).not.toBeVisible({ timeout: 3000 })

    // Non-shelter cards still visible
    await expect(page.getByText(SEED_LABELS.offerings.food)).toBeVisible()
    await expect(page.getByText(SEED_LABELS.offerings.tarps)).toBeVisible()
  })

  test("unchecking 'food' hides food card only", async ({ page }) => {
    const foodLabel = page.locator("label").filter({ hasText: /^food$/i })
    await foodLabel.click()

    await expect(page.getByText(SEED_LABELS.offerings.food)).not.toBeVisible({ timeout: 3000 })
    await expect(page.getByText(SEED_LABELS.offerings.shelter)).toBeVisible()
  })

  test("re-checking a type restores its cards", async ({ page }) => {
    const tarpsLabel = page.locator("label").filter({ hasText: /^tarps$/i })

    // Uncheck
    await tarpsLabel.click()
    await expect(page.getByText(SEED_LABELS.offerings.tarps)).not.toBeVisible({ timeout: 3000 })

    // Re-check
    await tarpsLabel.click()
    await expect(page.getByText(SEED_LABELS.offerings.tarps)).toBeVisible({ timeout: 3000 })
  })

  test("service count updates after filtering", async ({ page }) => {
    await expect(page.getByText(`${TOTAL_GUAM_SEED_COUNT} services`)).toBeVisible()

    // Uncheck food (1 food offering)
    const foodLabel = page.locator("label").filter({ hasText: /^food$/i })
    await foodLabel.click()

    await expect(
      page.getByText(`${TOTAL_GUAM_SEED_COUNT - 1} service`)
    ).toBeVisible({ timeout: 3000 })
  })
})

// ─── T-IP-05: Status filter ───────────────────────────────────────────────────

test.describe("T-IP-05: Status filter", () => {
  test("unchecking 'active' hides all seeded offerings", async ({ page }) => {
    await page.goto("/guam")
    await waitForServices(page, TOTAL_GUAM_SEED_COUNT)

    const activeLabel = page.locator("label").filter({ hasText: /^active$/i })
    await activeLabel.click()

    // All seeded offerings are active — all should disappear
    await expect(page.getByText(SEED_LABELS.offerings.shelter)).not.toBeVisible({ timeout: 3000 })
    await expect(page.getByText(SEED_LABELS.offerings.food)).not.toBeVisible()
    await expect(page.getByText("0 services")).toBeVisible()
  })
})

// ─── T-IP-06: Island switching ────────────────────────────────────────────────

test.describe("T-IP-06: Island switching", () => {
  test("Guam data does NOT appear on /saipan", async ({ page }) => {
    await page.goto("/saipan")
    // Wait for load
    await expect(page.locator(".leaflet-container")).toBeVisible({ timeout: 10000 })
    // Give data time to load
    await page.waitForTimeout(2000)
    // Guam-only offering should not be visible on Saipan
    await expect(page.getByText(SEED_LABELS.offerings.shelter)).not.toBeVisible()
  })

  test("switching island dropdown from Guam to Saipan changes URL and hides Guam data", async ({ page }) => {
    await page.goto("/guam")
    await waitForServices(page, 1)

    await page.getByRole("button", { name: /Switch island/i }).click()
    await page.getByRole("menuitem", { name: "Saipan" }).click()

    await expect(page).toHaveURL("/saipan")
    await expect(page.getByText(SEED_LABELS.offerings.shelter)).not.toBeVisible()
  })
})

// ─── T-IP-07: Landing → Guam flow ────────────────────────────────────────────

test.describe("T-IP-07: Full landing → Guam navigation", () => {
  test("clicking Guam on landing shows map and seeded data", async ({ page }) => {
    await page.goto("/")

    // Click the Guam island button
    await page.getByRole("link", { name: "Guam" }).click()

    await expect(page).toHaveURL("/guam")
    await expect(page.locator(".leaflet-container")).toBeVisible({ timeout: 10000 })

    // Data loads
    await waitForServices(page, TOTAL_GUAM_SEED_COUNT)
    await expect(page.getByText(SEED_LABELS.offerings.shelter)).toBeVisible()
    await expect(page.getByText(SEED_LABELS.orgs.redCross).first()).toBeVisible()
  })
})
