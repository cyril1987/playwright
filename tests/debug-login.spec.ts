import { test } from '@playwright/test';

test('debug login page', async ({ page }) => {
  await page.goto('https://dev.iconcile.com');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);

  // Capture the page HTML to understand the form structure
  const html = await page.content();
  console.log('=== PAGE TITLE ===');
  console.log(await page.title());
  console.log('=== CURRENT URL ===');
  console.log(page.url());

  // Find all input elements
  const inputs = await page.locator('input').all();
  console.log(`\n=== FOUND ${inputs.length} INPUT ELEMENTS ===`);
  for (const input of inputs) {
    const type = await input.getAttribute('type');
    const name = await input.getAttribute('name');
    const id = await input.getAttribute('id');
    const placeholder = await input.getAttribute('placeholder');
    const ariaLabel = await input.getAttribute('aria-label');
    const className = await input.getAttribute('class');
    console.log(`  type="${type}" name="${name}" id="${id}" placeholder="${placeholder}" aria-label="${ariaLabel}" class="${className}"`);
  }

  // Find all buttons
  const buttons = await page.locator('button').all();
  console.log(`\n=== FOUND ${buttons.length} BUTTONS ===`);
  for (const btn of buttons) {
    const text = await btn.textContent();
    const type = await btn.getAttribute('type');
    console.log(`  text="${text?.trim()}" type="${type}"`);
  }

  // Find all labels
  const labels = await page.locator('label').all();
  console.log(`\n=== FOUND ${labels.length} LABELS ===`);
  for (const label of labels) {
    const text = await label.textContent();
    const forAttr = await label.getAttribute('for');
    console.log(`  text="${text?.trim()}" for="${forAttr}"`);
  }
});
