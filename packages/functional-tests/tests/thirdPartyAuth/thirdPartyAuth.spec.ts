/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test } from '../../lib/fixtures/standard';
import { authenticator } from 'otplib';

const GOOGLE_TEST_EMAIL = process.env.GOOGLE_TEST_EMAIL || 'fxalive2022@gmail.com';
const GOOGLE_TEST_PASSWORD = process.env.GOOGLE_TEST_PASSWORD;
const GOOGLE_TEST_2FA_SECRET = process.env.GOOGLE_TEST_2FA_SECRET;

test.describe('third party auth', () => {
 test('Google signin to settings', async ({
                                    target,
                                    pages: { login, page },
                                   }) => {
  const shouldSkip = !GOOGLE_TEST_EMAIL || !GOOGLE_TEST_PASSWORD || !GOOGLE_TEST_2FA_SECRET;
  test.skip(shouldSkip, 'Please contact FxA admin to get credentials for Google account');
  test.slow();
  await page.goto(
   target.contentServerUrl + '?forceExperiment=thirdPartyAuth&forceExperimentGroup=treatment',
   { waitUntil: 'load' },
  );

  await login.clickContinueWithGoogle();

  await page.locator('input[type="email"]').fill(GOOGLE_TEST_EMAIL);
  await page.getByText('Next').click();
  await page.waitForURL(/v3\/signin\/challenge\/pwd/);

  await page.locator('input[type="password"]').fill(GOOGLE_TEST_PASSWORD);
  await page.getByText('Next').click();

  let token = authenticator.generate(GOOGLE_TEST_2FA_SECRET);
  await page.locator('#totpPin').fill(token);
  await page.locator('#totpNext').getByRole('button', { name: 'Next' }).click();

  const invalidCodeLocator = await page.getByText('Wrong code. Try again.');
  if (await invalidCodeLocator.isVisible()) {
   // Per chance the 2FA code expired, wait few seconds and try a new code 
   await page.waitForTimeout(5000);
   token = authenticator.generate(GOOGLE_TEST_2FA_SECRET);
   await page.locator('#totpPin').fill(token);
   await page.locator('#totpNext').getByRole('button', { name: 'Next' }).click();
  }

  await page.waitForURL(/settings/);
 });
});
