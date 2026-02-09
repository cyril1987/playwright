import { test, expect } from '@playwright/test';

test('open a page and verify title', async ({ page }) => {
  // Navigate to a page with Google-like content
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head><title>Google</title></head>
      <body>
        <h1>Welcome to Google</h1>
        <input type="text" aria-label="Search" />
      </body>
    </html>
  `);

  // Verify the page title
  await expect(page).toHaveTitle('Google');

  // Verify the heading is visible
  await expect(page.locator('h1')).toHaveText('Welcome to Google');

  // Verify the search input exists
  await expect(page.locator('input[aria-label="Search"]')).toBeVisible();
});
