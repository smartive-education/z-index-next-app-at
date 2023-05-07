import { test, expect, chromium } from '@playwright/test';

test('Login', async ({ page }) => {
  await page.goto('https://z-index-next-app-at.vercel.app/');
  await page.getByRole('button', { name: 'Login/Register' }).click();
  const input = page.getByPlaceholder('username@domain');
  await input.fill('newbie@smartive.zitadel.cloud');
  await page.getByText('next').click();
  const passwordField = await page.waitForSelector('input[name="password"]');
  passwordField.fill('Noob-123');
  await page.getByText('next').click();
  const textarea = await page.waitForSelector('textarea[name="post-comment"]');
  await textarea.isVisible();
  //await page.fill('input[name="loginName"]', 'newbie@smartive.zitadel.cloud');
});

/* test('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects the URL to contain intro.
  await expect(page).toHaveURL(/.*intro/);
}); */
