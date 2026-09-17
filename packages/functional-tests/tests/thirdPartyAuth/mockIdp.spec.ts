/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page } from '@playwright/test';
import { expect, test } from '../../lib/fixtures/standard';

// See packages/fxa-auth-server/test/mock-idp/server.js. Only the local stack
// points the Google and Apple buttons and the auth-server at it.
const MOCK_IDP_URL = 'http://localhost:9300';

// Stores the identity the mock will put in the next id_token.
async function useIdentity(page: Page, identity: { email: string }) {
  await page.goto(
    `${MOCK_IDP_URL}/profile?${new URLSearchParams(identity).toString()}`
  );
}

test.describe('severity-2', () => {
  test.describe('third party auth against the local mock IdP', () => {
    test.beforeEach(({ target }) => {
      test.skip(target.name !== 'local', 'the mock IdP only runs locally');
    });

    test('Google links an existing account and signs in', async ({
      target,
      page,
      pages: { signin },
      testAccountTracker,
    }) => {
      const { email } = await testAccountTracker.signUp();
      await useIdentity(page, { email });

      await page.goto(target.contentServerUrl);
      await signin.continueWithGoogleButton.click();

      await expect(page).toHaveURL(/\/settings/);
      await expect(page.getByTestId('settings-linked-accounts')).toContainText(
        'Google'
      );
    });

    test('Google signs in again through the existing link', async ({
      target,
      page,
      pages: { signin },
      testAccountTracker,
    }) => {
      const { email } = await testAccountTracker.signUp();
      await useIdentity(page, { email });

      await page.goto(target.contentServerUrl);
      await signin.continueWithGoogleButton.click();
      await expect(page).toHaveURL(/\/settings/);

      // Forget the browser session but keep the mock identity cookie, so the
      // next attempt takes the already-linked path.
      await page.evaluate(() => localStorage.clear());

      await page.goto(target.contentServerUrl);
      await signin.continueWithGoogleButton.click();

      await expect(page).toHaveURL(/\/settings/);
    });

    test('Apple links an existing account and signs in', async ({
      target,
      page,
      pages: { signin },
      testAccountTracker,
    }) => {
      const { email } = await testAccountTracker.signUp();
      await useIdentity(page, { email });

      await page.goto(target.contentServerUrl);
      await signin.continueWithAppleButton.click();

      await expect(page).toHaveURL(/\/settings/);
      await expect(page.getByTestId('settings-linked-accounts')).toContainText(
        'Apple'
      );
    });
  });
});
