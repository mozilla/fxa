/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect, newPagesForSync } from '../../lib/fixtures/standard';
const password = 'passwordzxcv';
let email;
let email2;
let syncBrowserPages;

test.describe('severity-2 #smoke', () => {
  test.describe('sync signin cached', () => {
    test.beforeEach(async ({ target }) => {
      test.slow(); //This test has steps for email rendering that runs slow on stage
      syncBrowserPages = await newPagesForSync(target);
      const { login } = syncBrowserPages;
      email = login.createEmail('sync{id}');
      email2 = login.createEmail();
      await target.auth.signUp(email, password, {
        lang: 'en',
        preVerified: 'true',
      });
      await target.auth.signUp(email2, password, {
        lang: 'en',
        preVerified: 'true',
      });
    });

    test.afterEach(async ({ target }) => {
      test.slow(); //The cleanup was timing out and exceeding 3000ms
      await syncBrowserPages.browser?.close();
      const emails = [email, email2];
      for (const email of emails) {
        if (email) {
          try {
            await target.auth.accountDestroy(email, password);
          } catch (e) {
            // Handle any errors if needed
          }
        }
      }
    });

    test('sign in on desktop then specify a different email on query parameter continues to cache desktop signin', async ({
      target,
    }) => {
      test.fixme(true, 'test to be fixed, see FXA-9194');
      const { page, login, connectAnotherDevice } = syncBrowserPages;
      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync`
      );
      await login.fillOutEmailFirstSignIn(email, password);

      //Verify sign up code header is visible
      expect(login.signInCodeHeader()).toBeVisible();

      const query = { email: email2 };
      const queryParam = new URLSearchParams(query);
      await page.goto(
        `${
          target.contentServerUrl
        }?context=fx_desktop_v3&service=sync&action=email&${queryParam.toString()}`
      );

      //Check prefilled email
      expect(await login.getPrefilledEmail()).toContain(email2);
      await login.setPassword(password);
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
      expect(await login.getPrefilledEmail()).toContain(email);
      await login.useDifferentAccountLink();
      await login.waitForEmailHeader();
    });

    test('sign in with desktop context then no context, desktop credentials should persist', async ({
      target,
    }) => {
      test.fixme(true, 'test to be fixed, see FXA-9194');
      const { page, login } = syncBrowserPages;
      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync`
      );
      await login.fillOutEmailFirstSignIn(email, password);

      //Verify sign up code header is visible
      expect(login.signInCodeHeader()).toBeVisible();

      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      expect(await login.getPrefilledEmail()).toContain(email);
      await login.useDifferentAccountLink();
      await login.waitForEmailHeader();
      await login.fillOutEmailFirstSignIn(email2, password);

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);

      //Reset prefill and context
      await login.clearSessionStorage();

      //Testing to make sure cached signin comes back after a refresh
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      expect(await login.getPrefilledEmail()).toContain(email);
      await login.useDifferentAccountLink();
      await login.waitForEmailHeader();
    });
  });
});
