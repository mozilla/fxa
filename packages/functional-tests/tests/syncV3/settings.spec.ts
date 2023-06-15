/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect, newPagesForSync } from '../../lib/fixtures/standard';
import { FirefoxCommand, createCustomEventDetail } from '../../lib/channels';

const firstPassword = 'password';
const secondPassword = 'new_password';
let email;
let syncBrowserPages;

test.describe.configure({ mode: 'parallel' });

test.describe('Firefox Desktop Sync v3 settings', () => {
  test.beforeEach(async ({ target }) => {
    test.slow();
    syncBrowserPages = await newPagesForSync(target);
    const { login, connectAnotherDevice, page } = syncBrowserPages;
    email = login.createEmail('sync{id}');
    await target.auth.signUp(email, firstPassword, {
      lang: 'en',
      preVerified: 'true',
    });
    const customEventDetail = createCustomEventDetail(
      FirefoxCommand.LinkAccount,
      {
        data: {
          ok: true,
        },
      }
    );
    await page.goto(
      `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
    );
    await login.respondToWebChannelMessage(customEventDetail);
    await login.fillOutEmailFirstSignIn(email, firstPassword);
    expect(await login.isSignInCodeHeader()).toBe(true);
    await login.checkWebChannelMessage(FirefoxCommand.LinkAccount);
    await login.fillOutSignInCode(email);
    await login.checkWebChannelMessage(FirefoxCommand.Login);
    expect(await connectAnotherDevice.fxaConnected.isEnabled()).toBeTruthy();
  });

  test.afterEach(async ({ target }) => {
    await syncBrowserPages.browser?.close();
    if (email) {
      // Cleanup any accounts created during the test
      try {
        await target.auth.accountDestroy(email, firstPassword);
      } catch (e) {}
    }
  });

  test('sign in, change the password', async ({ target }) => {
    const { changePassword, settings, page } = syncBrowserPages;

    //Goto settings sync url
    await page.goto(
      `${target.contentServerUrl}/settings?context=fx_desktop_v3&service=sync`
    );

    //Change password
    await settings.password.clickChange();
    await changePassword.fillOutChangePassword(firstPassword, secondPassword);
    await changePassword.submit();

    //Verify success message
    expect(await changePassword.changePasswordSuccess()).toContain(
      'Password updated'
    );
  });

  test('sign in, change the password by browsing directly to settings', async ({
    target,
  }) => {
    const { login, changePassword, settings } = syncBrowserPages;

    //Goto settings non-sync url
    await settings.goto();

    //Change password
    await settings.password.clickChange();
    await login.noSuchWebChannelMessage(FirefoxCommand.ChangePassword);
    await changePassword.fillOutChangePassword(firstPassword, secondPassword);
    await changePassword.submit();

    //Verify success message
    expect(await changePassword.changePasswordSuccess()).toContain(
      'Password updated'
    );
  });

  test('sign in, delete the account', async ({ target }) => {
    const { settings, deleteAccount, page } = syncBrowserPages;

    //Goto settings sync url
    await page.goto(
      `${target.contentServerUrl}/settings?context=fx_desktop_v3&service=sync`
    );
    // Click Delete account
    await settings.clickDeleteAccount();
    await deleteAccount.checkAllBoxes();
    await deleteAccount.clickContinue();

    // Enter incorrect password
    await deleteAccount.setPassword(firstPassword);
    await deleteAccount.submit();

    const success = await page.waitForSelector('.success');
    expect(await success.isVisible()).toBeTruthy();
  });
});
