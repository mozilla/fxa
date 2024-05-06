/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { LoginPage } from '../../pages/login';

test.describe('severity-2 #smoke', () => {
  test.describe('sync signin cached', () => {
    test.beforeEach(async () => {
      test.slow(); //This test has steps for email rendering that runs slow on stage
    });

    test('sign in on desktop then specify a different email on query parameter continues to cache desktop signin', async ({
      target,
      syncBrowserPages: { page, login, connectAnotherDevice },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      const syncCredentials = await signInSyncAccount(
        target,
        page,
        login,
        testAccountTracker
      );
      const query = { email: credentials.email };
      const queryParam = new URLSearchParams(query);
      await page.goto(
        `${
          target.contentServerUrl
        }?context=fx_desktop_v3&service=sync&action=email&${queryParam.toString()}`
      );

      //Check prefilled email
      expect(await login.getPrefilledEmail()).toContain(credentials.email);
      await login.setPassword(credentials.password);
      await login.clickSubmit();
      await connectAnotherDevice.clickNotNow();

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);

      //Reset prefill and context
      await login.clearSessionStorage();

      //Testing to make sure cached signin comes back after a refresh
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      expect(await login.getPrefilledEmail()).toContain(syncCredentials.email);
      await login.useDifferentAccountLink();
      await login.waitForEmailHeader();
    });

    test('sign in with desktop context then no context, desktop credentials should persist', async ({
      target,
      syncBrowserPages: { page, login },
      testAccountTracker,
    }) => {
      const syncCredentials = await signInSyncAccount(
        target,
        page,
        login,
        testAccountTracker
      );
      const credentials = await testAccountTracker.signUp();

      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      expect(await login.getPrefilledEmail()).toContain(syncCredentials.email);
      await login.useDifferentAccountLink();
      await login.waitForEmailHeader();
      await login.fillOutEmailFirstSignIn(
        credentials.email,
        credentials.password
      );

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);

      //Reset prefill and context
      await login.clearSessionStorage();

      //Testing to make sure cached signin comes back after a refresh
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      expect(await login.getPrefilledEmail()).toContain(syncCredentials.email);
      await login.useDifferentAccountLink();
      await login.waitForEmailHeader();
    });
  });
});

async function signInSyncAccount(
  target: BaseTarget,
  page: Page,
  login: LoginPage,
  testAccountTracker: TestAccountTracker
): Promise<Credentials> {
  const credentials = await testAccountTracker.signUpSync();
  await page.goto(
    `${target.contentServerUrl}?context=fx_desktop_v3&service=sync`
  );
  await login.fillOutEmailFirstSignIn(credentials.email, credentials.password);

  //Verify sign up code header is visible
  await expect(login.signInCodeHeader).toBeVisible();

  return credentials;
}
