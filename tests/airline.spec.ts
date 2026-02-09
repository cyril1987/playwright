import { test, expect } from '@playwright/test';

// Use a unique suffix to avoid conflicts across test runs
const uniqueId = Date.now().toString().slice(-4);
const airlineData = {
  name: `TestAirline${uniqueId}`,
  numCode: `9${uniqueId.slice(-2)}`,
  iataCode: 'TA',
  icaoCode: 'TSA',
  allianceCode: 'T',
};

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

    // Step 2: Search by Alliance Code and verify the record exists
    await page.getByRole('textbox', { name: 'Search' }).click();
    await page.getByRole('textbox', { name: 'Airline Alliance Code' }).fill(airlineData.allianceCode);
    await page.getByRole('button', { name: 'Apply' }).click();
    await page.waitForLoadState('networkidle');

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

    // Step 1: Search for the airline
    await page.getByRole('textbox', { name: 'Search' }).click();
    await page.getByRole('textbox', { name: 'Airline Alliance Code' }).fill(airlineData.allianceCode);
    await page.getByRole('button', { name: 'Apply' }).click();
    await page.waitForLoadState('networkidle');

    // Step 2: Click edit on the matching row
    const row = page.getByRole('row').filter({ hasText: airlineData.name });
    await expect(row).toBeVisible({ timeout: 10000 });
    await row.getByLabel('Edit').click();

    // Step 3: Update the Alliance Code
    await page.getByRole('textbox', { name: 'Airline Alliance Code' }).fill(updatedAllianceCode);
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForLoadState('networkidle');

    // Step 4: Search again with the updated value and verify
    await page.getByRole('textbox', { name: 'Search' }).click();
    await page.getByRole('textbox', { name: 'Airline Alliance Code' }).fill(updatedAllianceCode);
    await page.getByRole('button', { name: 'Apply' }).click();
    await page.waitForLoadState('networkidle');

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
