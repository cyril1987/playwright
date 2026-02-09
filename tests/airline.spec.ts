import { test, expect, Page } from '@playwright/test';

// Use a unique suffix to avoid conflicts across test runs
const uniqueId = Date.now().toString().slice(-4);
const airlineData = {
  name: `TestAirline${uniqueId}`,
  numCode: `9${uniqueId.slice(-2)}`,
  iataCode: 'TA',
  icaoCode: 'TSA',
  allianceCode: 'T',
};

async function waitForTableToLoad(page: Page) {
  // Wait for the table to have at least one data row (initial load complete)
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('row').nth(1)).toBeVisible({ timeout: 15000 });
  // Extra buffer to ensure the default search has fully completed
  await page.waitForTimeout(2000);
}

async function searchByNumCode(page: Page, numCode: string) {
  // Wait for any ongoing data load to finish first
  await waitForTableToLoad(page);

  // Click on the Search textbox to open the filter panel
  await page.getByRole('textbox', { name: 'Search' }).click();

  // Wait for the filter fields to be visible
  const numCodeField = page.getByRole('textbox', { name: 'Airline Num Code' });
  await expect(numCodeField).toBeVisible({ timeout: 5000 });

  // Clear and fill the Num Code field
  await numCodeField.clear();
  await numCodeField.fill(numCode);

  // Click Apply and wait for filtered results
  const applyButton = page.getByRole('button', { name: 'Apply' });
  await expect(applyButton).toBeVisible();
  await applyButton.click();

  // Wait for the filtered results to load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

test.describe('Airline Master', () => {
  test.beforeEach(async ({ page }) => {
    const email = process.env.LOGIN_EMAIL;
    const password = process.env.LOGIN_PASSWORD;

    if (!email || !password) {
      throw new Error('Missing LOGIN_EMAIL or LOGIN_PASSWORD in .env file');
    }

    // Login
    await page.goto('https://dev.iconcile.com/session/signin');
    await page.waitForLoadState('networkidle');
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForLoadState('networkidle');
    await expect(page).not.toHaveURL(/signin/i, { timeout: 15000 });

    // Navigate to Industry Masters > Airline
    await page.getByRole('button', { name: 'Industry Masters' }).click();
    await page.getByRole('button', { name: 'Airline' }).click();

    // Wait for the airline table to fully load before any interaction
    await waitForTableToLoad(page);
  });

  test('add a new airline and verify it appears in search results', async ({ page }) => {
    // Step 1: Add a new airline
    await page.getByRole('button', { name: 'Add New Airline' }).click();

    await page.getByRole('textbox', { name: 'Airline name' }).fill(airlineData.name);
    await page.getByRole('textbox', { name: 'Airline Num Code' }).fill(airlineData.numCode);
    await page.getByRole('textbox', { name: 'Airline IATA Code' }).fill(airlineData.iataCode);
    await page.getByRole('textbox', { name: 'Airline ICAO Code' }).fill(airlineData.icaoCode);
    await page.getByRole('textbox', { name: 'Airline Alliance Code' }).fill(airlineData.allianceCode);

    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Step 2: Search by Num Code and verify the record exists
    await searchByNumCode(page, airlineData.numCode);

    // Verify the row contains the correct data
    const row = page.getByRole('row').filter({ hasText: airlineData.name });
    await expect(row).toBeVisible({ timeout: 10000 });
    await expect(row).toContainText(airlineData.numCode);
    await expect(row).toContainText(airlineData.iataCode);
    await expect(row).toContainText(airlineData.icaoCode);
    await expect(row).toContainText(airlineData.allianceCode);
  });

  test('edit an airline and verify updated values', async ({ page }) => {
    const updatedAllianceCode = 'TA';

    // Step 1: Search for the airline by Num Code
    await searchByNumCode(page, airlineData.numCode);

    // Step 2: Click edit on the matching row
    const row = page.getByRole('row').filter({ hasText: airlineData.name });
    await expect(row).toBeVisible({ timeout: 10000 });
    await row.getByLabel('Edit').click();

    // Step 3: Update the Alliance Code
    await page.getByRole('textbox', { name: 'Airline Alliance Code' }).fill(updatedAllianceCode);
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Step 4: Search again by Num Code and verify the update
    await searchByNumCode(page, airlineData.numCode);

    const updatedRow = page.getByRole('row').filter({ hasText: airlineData.name });
    await expect(updatedRow).toBeVisible({ timeout: 10000 });
    await expect(updatedRow).toContainText(updatedAllianceCode);
  });

  test.afterEach(async ({ page }) => {
    // Logout
    await page.locator('div').filter({ hasText: /^Hi Cyril George$/ }).nth(1).click();
    await page.getByText('Logout').click();
  });
});
