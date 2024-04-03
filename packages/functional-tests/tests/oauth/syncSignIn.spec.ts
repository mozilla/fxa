/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test, PASSWORD } from '../../lib/fixtures/standard';

test.describe('severity-1 #smoke', () => {
  test.beforeEach(() => {
    test.slow();
  });

  test.describe('signin with OAuth after Sync', () => {
    test.use({
      emailOptions: [{ PASSWORD }, { prefix: 'sync{id}', PASSWORD }],
    });
    test('signin to OAuth with Sync creds', async ({
      emails,
      target,
      syncBrowserPages: { page, login, connectAnotherDevice, relier },
    }) => {
      const [email, syncEmail] = emails;
      await target.createAccount(syncEmail, PASSWORD);
      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email&`
      );
      await login.login(syncEmail, PASSWORD);
      await login.fillOutSignInCode(syncEmail);
      // eslint-disable-next-line playwright/prefer-web-first-assertions
      expect(await connectAnotherDevice.fxaConnected.isVisible()).toBeTruthy();

      // Sign up for a new account via OAuth
      await relier.goto();
      await relier.clickEmailFirst();
      await login.useDifferentAccountLink();

      await login.fillOutFirstSignUp(email, PASSWORD);

      // RP is logged in, logout then back in again
      expect(await relier.isLoggedIn()).toBe(true);
      await relier.signOut();

      await relier.clickSignIn();

      // By default, we should see the email we signed up for Sync with
      expect(await login.getPrefilledEmail()).toContain(syncEmail);
      await login.clickSignIn();
      expect(await relier.isLoggedIn()).toBe(true);
    });
  });

  test.describe('signin to Sync after OAuth', () => {
    test.use({
      emailOptions: [{ prefix: 'sync{id}', PASSWORD }],
    });
    test('email-first Sync signin', async ({
      emails,
      target,
      syncBrowserPages: { page, login, connectAnotherDevice, relier },
    }) => {
      const [syncEmail] = emails;
      await relier.goto();
      await relier.clickEmailFirst();

      await login.fillOutFirstSignUp(syncEmail, PASSWORD);

      expect(await relier.isLoggedIn()).toBe(true);
      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email&`
      );
      expect(await login.getPrefilledEmail()).toContain(syncEmail);
      await login.setPassword(PASSWORD);
      await login.submit();
      await login.fillOutSignInCode(syncEmail);
      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    });
  });
});
