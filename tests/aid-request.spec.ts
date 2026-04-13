import { test, expect } from "@playwright/test"

test.describe("T-AR: Aid Request Form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/request-aid")
  })

  // T-AR-01: Happy Path
  test("T-AR-01a: emergency contacts shown first", async ({ page }) => {
    await expect(page.getByText("911")).toBeVisible()
    await expect(page.getByText(/FEMA/i)).toBeVisible()
  })

  test("T-AR-01b: form has required fields", async ({ page }) => {
    // Core fields
    await expect(page.getByLabel(/name/i).first()).toBeVisible()
    await expect(page.getByLabel(/island/i).first()).toBeVisible()
    // Needs checklist
    await expect(page.getByText(/food/i)).toBeVisible()
    await expect(page.getByText(/shelter/i)).toBeVisible()
    await expect(page.getByText(/water/i)).toBeVisible()
    await expect(page.getByText(/medical/i)).toBeVisible()
  })

  // T-AR-03: PII Prevention
  test("T-AR-03a: no SSN field exists", async ({ page }) => {
    const content = await page.content()
    const lowerContent = content.toLowerCase()
    expect(lowerContent).not.toContain("social security")
    expect(lowerContent).not.toContain("ssn")
  })

  test("T-AR-03b: no address field exists", async ({ page }) => {
    // Should not have a field labeled "address" or "street"
    const addressField = page.getByLabel(/street address|home address|physical address/i)
    await expect(addressField).toHaveCount(0)
  })

  test("T-AR-03c: privacy notice visible", async ({ page }) => {
    await expect(page.getByText(/does not collect/i)).toBeVisible()
  })

  // T-AR-04: Safety Questions
  test("T-AR-04a: dogs near home question exists", async ({ page }) => {
    await expect(page.getByText(/dog/i)).toBeVisible()
  })

  test("T-AR-04b: safely accessible question exists", async ({ page }) => {
    await expect(page.getByText(/accessible/i)).toBeVisible()
  })

  test("T-AR-04c: cannot leave location flag exists", async ({ page }) => {
    await expect(page.getByText(/cannot leave/i)).toBeVisible()
  })

  test("T-AR-04d: medical needs options exist", async ({ page }) => {
    await expect(page.getByText(/wheelchair|oxygen|dialysis|insulin|mobility/i).first()).toBeVisible()
  })

  test("T-AR-04e: household count fields exist", async ({ page }) => {
    await expect(page.getByText(/elderly|children|disabled/i).first()).toBeVisible()
  })
})
