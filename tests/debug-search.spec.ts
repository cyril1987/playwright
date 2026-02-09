import { test, expect } from '@playwright/test';

test('debug search flow', async ({ page }) => {
  const email = process.env.LOGIN_EMAIL!;
  const password = process.env.LOGIN_PASSWORD!;

  // Login
  await page.goto('https://dev.iconcile.com/session/signin');
  await page.waitForLoadState('networkidle');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForLoadState('networkidle');

  // Navigate to Airline
  await page.getByRole('button', { name: 'Industry Masters' }).click();
  await page.getByRole('button', { name: 'Airline' }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Click Search
  console.log('=== BEFORE CLICKING SEARCH ===');
  const searchBox = page.getByRole('textbox', { name: 'Search' });
  console.log('Search box visible:', await searchBox.isVisible());
  await searchBox.click();
  await page.waitForTimeout(2000);

  // Capture what's visible after clicking search
  console.log('\n=== AFTER CLICKING SEARCH ===');

  // Check all visible textboxes
  const textboxes = await page.getByRole('textbox').all();
  console.log(`Found ${textboxes.length} textboxes:`);
  for (const tb of textboxes) {
    const name = await tb.getAttribute('name');
    const placeholder = await tb.getAttribute('placeholder');
    const ariaLabel = await tb.getAttribute('aria-label');
    const visible = await tb.isVisible();
    console.log(`  name="${name}" placeholder="${placeholder}" aria-label="${ariaLabel}" visible=${visible}`);
  }

  // Check all visible buttons
  const buttons = await page.getByRole('button').all();
  console.log(`\nFound ${buttons.length} buttons:`);
  for (const btn of buttons) {
    const text = await btn.textContent();
    const visible = await btn.isVisible();
    if (visible) {
      console.log(`  text="${text?.trim()}" visible=${visible}`);
    }
  }

  // Take a screenshot of the search dialog state
  await page.screenshot({ path: 'test-results/search-dialog.png', fullPage: true });
  console.log('\nScreenshot saved to test-results/search-dialog.png');
});
