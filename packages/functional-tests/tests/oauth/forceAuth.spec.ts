/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';

test.describe('severity-1 #smoke', () => {
  test.describe('OAuth force auth', () => {
    test.beforeEach(async ({ pages: { configPage } }) => {
      const config = await configPage.getConfig();
      // TODO: Remove forceAuth tests. React pages don't have this flow.
      test.skip(config.showReactApp.resetPasswordRoutes === true);
    });
    test('with a registered email', async ({
      credentials,
      pages: { login, relier },
    }) => {
      await relier.goto(`email=${credentials.email}`);
      await relier.clickForceAuth();

      // Email is prefilled
      await expect(await login.page.innerText('#prefillEmail')).toContain(
        credentials.email
      );
      await login.setPassword(credentials.password);
      await login.submit();
      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('with a unregistered email', async ({
      credentials,
      pages: { login, relier },
    }, { project }) => {
      test.slow(project.name !== 'local', 'email delivery can be slow');
      const newEmail = `${Date.now()}@restmail.net`;
      await relier.goto(`email=${newEmail}`);
      await relier.clickForceAuth();

      // Signup form is shown and email is prefilled
      await expect(await login.getPrefilledEmail()).toContain(newEmail);
      await login.setAge('21');
      await login.setNewPassword(credentials.password);
      await login.fillOutSignUpCode(newEmail);

      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('with blocked email', async ({
      credentials,
      pages: { login, relier },
    }, { project }) => {
      test.slow(project.name !== 'local', 'email delivery can be slow');

      const blockedEmail = `blocked${Date.now()}@restmail.net`;
      await relier.goto(`email=${blockedEmail}`);
      await relier.clickForceAuth();

      await expect(await login.getPrefilledEmail()).toContain(blockedEmail);
      await login.setAge('21');
      await login.setNewPassword(credentials.password);
      await login.fillOutSignUpCode(blockedEmail);

      expect(await relier.isLoggedIn()).toBe(true);

      await relier.signOut();

      // Attempt to log in again which will show the blocked page
      await relier.goto(`email=${blockedEmail}`);
      await relier.clickForceAuth();
      await login.setPassword(credentials.password);
      await login.submit();

      await login.unblock(blockedEmail);
      expect(await relier.isLoggedIn()).toBe(true);
    });
  });
});
