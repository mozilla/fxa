import { test } from '../lib/fixtures/standard';

test('stub', async ({ credentials, page }) => {
  console.log(credentials);
  await page.pause();
});
