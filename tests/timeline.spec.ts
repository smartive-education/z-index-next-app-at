import { test } from '@playwright/test';

test('Create a Post', async ({ page }) => {
  await page.goto('https://z-index-next-app-at.vercel.app/');
  const textarea = await page.waitForSelector(
    'textarea[data-testid="post-comment-textarea"]'
  );
  textarea.fill('Hello World');
});
