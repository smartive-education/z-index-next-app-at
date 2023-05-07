import { test } from '@playwright/test';

test('Login', async ({ page }) => {
  await page.goto('https://z-index-next-app-at.vercel.app/');
  await page.getByTestId('login-button').click();
  const input = page.getByPlaceholder('username@domain');
  await input.fill('newbie@smartive.zitadel.cloud');
  await page.getByText('next').click();
  const passwordField = await page.waitForSelector('input[name="password"]');
  passwordField.fill('Noob-123');
  await page.getByText('next').click();
  const textarea = await page.waitForSelector('textarea[data-testid="post-comment-textarea"]');
  await textarea.isVisible();
});

