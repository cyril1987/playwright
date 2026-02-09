import { test, expect } from '@playwright/test';

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

  test('add a new airline', async ({ page }) => {
    await page.getByRole('button', { name: 'Add New Airline' }).click();

    // Fill in airline details
    await page.getByRole('textbox', { name: 'Airline name' }).fill('TestCase');
    await page.getByRole('textbox', { name: 'Airline Num Code' }).fill('965');
    await page.getByRole('textbox', { name: 'Airline IATA Code' }).fill('AB');
    await page.getByRole('textbox', { name: 'Airline ICAO Code' }).fill('AB');
    await page.getByRole('textbox', { name: 'Airline Alliance Code' }).fill('A');

    // Save
    await page.getByRole('button', { name: 'Save' }).click();
  });

  test('search airline by Num Code', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Search' }).click();
    await page.getByRole('textbox', { name: 'Airline Num Code' }).fill('AB');
    await page.getByRole('button', { name: 'Apply' }).click();
  });

  test('search airline by Alliance Code', async ({ page }) => {
    await page.getByTestId('CloseOutlinedIcon').click();
    await page.getByRole('textbox', { name: 'Search' }).click();
    await page.getByRole('textbox', { name: 'Airline Alliance Code' }).fill('A');
    await page.getByRole('button', { name: 'Apply' }).click();
  });

  test('edit an airline', async ({ page }) => {
    // Search for the airline to edit
    await page.getByRole('textbox', { name: 'Search' }).click();
    await page.getByRole('textbox', { name: 'Airline Alliance Code' }).fill('A');
    await page.getByRole('button', { name: 'Apply' }).click();

    // Click edit on the matching row
    await page.getByRole('row', { name: 'Select row Edit TestCase 965' }).getByLabel('Edit').click();

    // Update Alliance Code
    await page.getByRole('textbox', { name: 'Airline Alliance Code' }).fill('AB');
    await page.getByRole('button', { name: 'Save' }).click();
  });

  test.afterEach(async ({ page }) => {
    // Logout
    await page.locator('div').filter({ hasText: /^Hi Cyril George$/ }).nth(1).click();
    await page.getByText('Logout').click();
  });
});
