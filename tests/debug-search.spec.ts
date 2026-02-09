import { test, expect } from '@playwright/test';

test('debug search filter fields', async ({ page }) => {
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

  // Look at the search/filter area
  console.log('=== ALL VISIBLE INPUT ELEMENTS ===');
  const inputs = await page.locator('input:visible').all();
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const id = await input.getAttribute('id');
    const name = await input.getAttribute('name');
    const type = await input.getAttribute('type');
    const placeholder = await input.getAttribute('placeholder');
    const ariaLabel = await input.getAttribute('aria-label');

    // Try to find a label associated with this input
    let labelText = '';
    if (id) {
      const label = page.locator(`label[for="${id}"]`);
      if (await label.count() > 0) {
        labelText = (await label.textContent()) || '';
      }
    }

    // Try to find a sibling/parent label
    const parentLabel = input.locator('xpath=ancestor::div[1]//label');
    let parentLabelText = '';
    if (await parentLabel.count() > 0) {
      parentLabelText = (await parentLabel.first().textContent()) || '';
    }

    console.log(`  [${i}] id="${id}" name="${name}" type="${type}" placeholder="${placeholder}" aria-label="${ariaLabel}" label="${labelText}" parentLabel="${parentLabelText}"`);
  }

  // Check for any text near the filter inputs that could help identify them
  console.log('\n=== FILTER AREA LABELS ===');
  const labels = await page.locator('label:visible').all();
  for (const label of labels) {
    const text = (await label.textContent())?.trim();
    const forAttr = await label.getAttribute('for');
    if (text) {
      console.log(`  text="${text}" for="${forAttr}"`);
    }
  }

  // Take screenshot
  await page.screenshot({ path: 'test-results/search-filter-area.png', fullPage: true });
  console.log('\nScreenshot saved to test-results/search-filter-area.png');
});
