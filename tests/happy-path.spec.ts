import { test } from '@playwright/test';

test('Create a Mumble', async ({ page }) => {
  //wait for the page to load
  await page.goto('/');
  await page.waitForSelector("img[data-testid='0-profile-header']");

  //create a post
  await page.getByTestId('post-comment-left-button').click();
  await page.setInputFiles("input[type='file']", 'tests/e2e_dog.jpg');
  await page.getByTestId('Speichern').click();
  await page.getByTestId('post-comment-textarea').fill('e2e dog');

  //verify that the post was created
  const postMumbleResponse = page.waitForResponse(
    (response) => response.url().includes('posts') && response.status() === 200
  );
  await page.getByTestId('post-comment-right-button').click();
  await postMumbleResponse;
});

test('Create a Reply to the first Mumble', async ({ page }) => {
  //wait for the page to load
  await page.goto('/');
  const commentButton = await page.waitForSelector(
    "button[data-testid='0-comment']"
  );

  await commentButton.click();
  await page.waitForURL('/mumble/*');

  //create a reply
  await page.getByTestId('reply-comment-left-button').click();
  await page.setInputFiles("input[type='file']", 'tests/e2e_dog.jpg');
  await page.getByTestId('Speichern').click();
  await page.getByTestId('reply-comment-textarea').fill('doggie says hi!');

  //verify that the reply was created
  const replyResponse = page.waitForResponse(
    (response) => response.url().includes('posts') && response.status() === 201
  );
  await page.getByTestId('reply-comment-right-button').click();
  await replyResponse;
});

test('Like the first Mumble', async ({ page }) => {
  //wait for the page to load
  await page.goto('/');
  const likeButton = await page.waitForSelector("button[data-testid='0-like']");

  //verify that the like was created
  const likeResponse = page.waitForResponse(
    (response) => response.url().includes('likes') && response.status() === 204
  );
  await likeButton.click();
  await likeResponse;
});

test('Check Profile Page is loaded correctly', async ({ page }) => {
  //navigate to the profile page
  await page.goto('/');
  await page.getByTestId('Profile Page').click();

  await page.waitForURL('/profile/*');

  //If toggle button is visible it means both mumbles and liked mumbles are loaded
  await page.getByTestId('toggle').isVisible();
});
