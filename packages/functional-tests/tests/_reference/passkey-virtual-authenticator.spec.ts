/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

/**
 * Reference-only suite. The in-house passkey functional tests live at
 * `tests/settings/passkey.spec.ts` — those are what runs in CI against our
 * own surfaces.
 *
 * This file exercises the `PasskeyVirtualAuthenticator` wrapper against the
 * https://passkeys.eu demo site (any-origin registration/authentication).
 * It cannot run in CI because the third-party site blocks us, so the suite
 * is skipped wholesale. Kept as a worked example of the CDP /
 * virtual-authenticator setup pattern.
 */

test.describe('severity-1 #smoke', () => {
  test.skip(true, 'Reference-only — see tests/settings/passkey.spec.ts');
  /**
   * Passkeys have a potential to collide with other tests due to the use of
   * CDP sessions and virtual authenticators. To avoid this, we run all passkey
   * tests in serial.
   */
  test.describe.configure({ mode: 'serial' });

  test.describe('Passkeys chromium happy path', () => {
    test('can register a passkey on the demo site', async ({
      pages: { page, passkeysExample: passkeys },
      testAccountTracker,
    }) => {
      const browserName = page.context().browser()?.browserType().name();
      test.skip(
        browserName !== 'chromium',
        'Passkeys tests run on chromium only'
      );
      // initialize to tell the browser we have the ability to send passkey commands
      // before we navigate to the page, that way, if the page checks for the ability
      // it's already configured!
      await passkeys.initPasskeys(page);

      await page.goto('https://passkeys.eu');

      const email = testAccountTracker.generateEmail();
      // wait for and email field, fill it
      const emailField = page.getByLabel('Email address');
      await expect(emailField).toBeVisible();
      await emailField.fill(email);

      // 'submits' the form that then triggers the passkey creation
      // as soon as this happens, the would prompt for the passkey creation
      // Used in the success() wrapper below will auto 'complete' the prompt
      // and continue the flow
      const initiatePasskey = () =>
        page.getByRole('button', { name: 'Continue' }).click();

      await passkeys.passkeyAuth.success(initiatePasskey);

      await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        'Passkeys demo'
      );

      // Optional "extra confidence": at least one credential exists now
      const creds = await passkeys.passkeyAuth.getCredentials();
      expect(creds?.length).toEqual(1);
    });

    test('does not register a passkey on demo site if user cancels', async ({
      pages: { page, passkeysExample: pk },
      testAccountTracker,
    }) => {
      const browserName = page.context().browser()?.browserType().name();
      test.skip(
        browserName !== 'chromium',
        'Passkeys tests run on chromium only'
      );

      await pk.initPasskeys(page);

      await page.goto('https://passkeys.eu');

      const email = testAccountTracker.generateEmail();

      // wait for and email field, fill it
      const emailField = page.getByLabel('Email address');
      await expect(emailField).toBeVisible();
      await emailField.fill(email);

      const initiatePasskey = () =>
        page.getByRole('button', { name: 'Continue' }).click();

      // expectation that will ensure the failure path was taken
      const somethingWentWrong = () =>
        expect(page.getByText('Something went wrong...')).toBeVisible();

      await pk.passkeyAuth.fail(initiatePasskey, somethingWentWrong);

      await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        'Passkeys demo'
      );

      // Optional "extra confidence": NO credentials should exist
      const creds = await pk.passkeyAuth.getCredentials();
      expect(creds?.length).toBe(0);
    });
  });
});
