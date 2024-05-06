import { test } from '../lib/fixtures/standard';

test('stub', async ({ page, testAccountTracker }) => {
  const credentials = await testAccountTracker.signUp();
  console.log(credentials);
  await page.pause();
});
