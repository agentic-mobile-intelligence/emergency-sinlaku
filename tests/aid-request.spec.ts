import { test, expect, type Page } from "@playwright/test"

/** Click through the EmergencyGate to reveal the AidRequestForm. */
async function clickThroughGate(page: Page) {
  await page.getByRole("button", { name: /fill out aid request form/i }).click()
}

test.describe("T-AR: Aid Request Form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/request-aid")
  })

  // T-AR-01: Happy Path
  test("T-AR-01a: emergency contacts shown first", async ({ page }) => {
    // EmergencyGate renders an "Emergency Contacts" heading and FEMA link before the form
    await expect(page.getByRole("heading", { name: /emergency contacts/i })).toBeVisible()
    await expect(page.getByText(/FEMA/i).first()).toBeVisible()
  })

  test("T-AR-01b: form has required fields", async ({ page }) => {
    await clickThroughGate(page)
    // Name field (Label htmlFor="name" → Input id="name")
    await expect(page.getByLabel(/name/i).first()).toBeVisible()
    // Island section label (Select has no id, so check label text)
    await expect(page.getByText(/your island/i)).toBeVisible()
    // Needs checklist — use exact: true to avoid matching description textarea
    await expect(page.getByText("Food", { exact: true })).toBeVisible()
    await expect(page.getByText("Shelter", { exact: true })).toBeVisible()
    await expect(page.getByText("Water", { exact: true })).toBeVisible()
    await expect(page.getByText("Medical", { exact: true })).toBeVisible()
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
    await clickThroughGate(page)
    await expect(page.getByText(/does not collect/i)).toBeVisible()
  })

  // T-AR-04: Safety Questions
  test("T-AR-04a: dogs near home question exists", async ({ page }) => {
    await clickThroughGate(page)
    await expect(page.getByText(/dog/i)).toBeVisible()
  })

  test("T-AR-04b: safely accessible question exists", async ({ page }) => {
    await clickThroughGate(page)
    await expect(page.getByText(/accessible/i)).toBeVisible()
  })

  test("T-AR-04c: cannot leave location flag exists", async ({ page }) => {
    await clickThroughGate(page)
    await expect(page.getByText(/cannot leave/i)).toBeVisible()
  })

  test("T-AR-04d: medical needs options exist", async ({ page }) => {
    await clickThroughGate(page)
    await expect(page.getByText(/wheelchair|oxygen|dialysis|insulin|mobility/i).first()).toBeVisible()
  })

  test("T-AR-04e: household count fields exist", async ({ page }) => {
    await clickThroughGate(page)
    await expect(page.getByText(/elderly|children|disabled/i).first()).toBeVisible()
  })
})
