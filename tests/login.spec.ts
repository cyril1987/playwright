import { test, expect } from '@playwright/test';

test('login to dev.iconcile.com', async ({ page }) => {
  const email = process.env.LOGIN_EMAIL;
  const password = process.env.LOGIN_PASSWORD;

  if (!email || !password) {
    throw new Error('Missing LOGIN_EMAIL or LOGIN_PASSWORD in .env file');
  }

  // Navigate to the login page
  await page.goto('https://dev.iconcile.com');

  // Wait for the login form to load (JS SPA)
  await page.waitForLoadState('networkidle');

  // Fill in login credentials
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);

  // Click the Login button
  await page.getByRole('button', { name: 'Login' }).click();

  // Wait for navigation after login
  await page.waitForLoadState('networkidle');

  // Verify successful login - check that we're no longer on the signin page
  await expect(page).not.toHaveURL(/signin/i, { timeout: 15000 });
});
