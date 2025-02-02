// auth.setup.ts
import { test as setup } from '@playwright/test';
import { authFile } from '../playwright.config';

setup('authenticate', async ({ page }) => {
  //Login
  await page.goto('/');
  await page.getByTestId('login-button').click();
  const input = page.getByPlaceholder('username@domain');
  await input.fill(process.env.LOGIN_USER ?? '');
  await page.getByText('next').click();
  const passwordField = await page.waitForSelector('input[name="password"]');
  passwordField.fill(process.env.LOGIN_PASSWORD ?? '');
  await page.getByText('next').click();

  //optionally skip 2FA
  if (await page.getByText('skip').isVisible()) {
    await page.getByText('skip').click();
  }

  //Make sure we are logged in
  const textarea = await page.waitForSelector(
    'textarea[data-testid="post-comment-textarea"]'
  );
  await textarea.isVisible();

  //Save the auth state
  await page.context().storageState({ path: authFile });
});
