import { test, expect } from '@playwright/test';

test('login to dev.iconcile.com', async ({ page }) => {
  const email = process.env.LOGIN_EMAIL;
  const password = process.env.LOGIN_PASSWORD;

  if (!email || !password) {
    throw new Error('Missing LOGIN_EMAIL or LOGIN_PASSWORD in .env file');
  }

  // Navigate to the login page
  await page.goto('https://dev.iconcile.com/session/signin');
  await page.waitForLoadState('networkidle');

  // Fill in login credentials
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);

  // Click the Login button
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForLoadState('networkidle');

  // Verify successful login
  await expect(page).not.toHaveURL(/signin/i, { timeout: 15000 });
});
