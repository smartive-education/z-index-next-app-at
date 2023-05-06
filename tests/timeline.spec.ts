import { test, expect } from '@playwright/test';

test('Login', async ({ page }) => {
  await page.goto('http://localhost:3000');

  await page.getByRole('button').click();

  await page.waitForURL('https://cas-fee-advanced-ocvdad.zitadel.cloud/*');
});

/* test('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects the URL to contain intro.
  await expect(page).toHaveURL(/.*intro/);
}); */
