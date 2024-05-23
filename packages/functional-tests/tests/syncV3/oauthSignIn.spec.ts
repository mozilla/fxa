/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

test.describe('severity-1 #smoke', () => {
  test.describe('OAuth and Fx Desktop handshake', () => {
    test('user signed into browser and OAuth login', async ({
      target,
      syncBrowserPages: { page, login, relier, settings },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await page.goto(
        target.contentServerUrl +
          '?context=fx_desktop_v3&entrypoint=fxa%3Aenter_email&service=sync&action=email'
      );
      await login.login(credentials.email, credentials.password);
      await expect(login.isSyncConnectedHeader()).toBeVisible({
        timeout: 1000,
      });

      await relier.goto();
      await relier.clickEmailFirst();

      // User can sign in with cached credentials, no password needed.
      expect(await login.getPrefilledEmail()).toContain(credentials.email);
      expect(await login.isCachedLogin()).toBe(true);

      await login.submit();
      expect(await relier.isLoggedIn()).toBe(true);

      await relier.signOut();

      // Attempt to sign back in
      await relier.clickEmailFirst();

      expect(await login.getPrefilledEmail()).toContain(credentials.email);
      expect(await login.isCachedLogin()).toBe(true);

      await login.submit();
      expect(await relier.isLoggedIn()).toBe(true);

      // Disconnect sync otherwise we can have flaky tests.
      await settings.disconnectSync(credentials);

      expect(page.url()).toContain(login.url);
    });
  });
});
