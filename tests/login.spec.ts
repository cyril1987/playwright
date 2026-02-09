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
  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Password').fill(password);

  // Click the login/sign-in button
  await page.getByRole('button', { name: /log in|sign in|submit|login/i }).click();

  // Wait for navigation after login
  await page.waitForLoadState('networkidle');

  // Verify successful login - check that we're no longer on the login page
  await expect(page).not.toHaveURL(/login/i, { timeout: 15000 });
});
