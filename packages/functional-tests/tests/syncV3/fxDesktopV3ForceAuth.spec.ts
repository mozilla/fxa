/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

const makeUid = () =>
  [...Array(32)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('');

test.describe('severity-1 #smoke', () => {
  test.describe('Desktop Sync V3 force auth', () => {
    test('sync v3 with a registered email, no uid', async ({
      syncBrowserPages: {
        fxDesktopV3ForceAuth,
        login,
        connectAnotherDevice,
        signinTokenCode,
      },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpSync();

      await fxDesktopV3ForceAuth.openWithReplacementParams(credentials, {
        uid: undefined,
      });
      await login.setPassword(credentials.password);
      await login.submit();
      await expect(signinTokenCode.tokenCodeHeader).toBeVisible();
      await fxDesktopV3ForceAuth.checkWebChannelMessage(
        'fxaccounts:can_link_account'
      );
      await login.fillOutSignInCode(credentials.email);
      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
      await fxDesktopV3ForceAuth.checkWebChannelMessage('fxaccounts:login');
    });

    test('sync v3 with a registered email, registered uid', async ({
      syncBrowserPages: {
        fxDesktopV3ForceAuth,
        login,
        connectAnotherDevice,
        signinTokenCode,
      },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpSync();

      await fxDesktopV3ForceAuth.open(credentials);
      await login.setPassword(credentials.password);
      await login.submit();
      await expect(signinTokenCode.tokenCodeHeader).toBeVisible();
      await fxDesktopV3ForceAuth.checkWebChannelMessage(
        'fxaccounts:can_link_account'
      );
      await login.fillOutSignInCode(credentials.email);
      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
      await fxDesktopV3ForceAuth.checkWebChannelMessage('fxaccounts:login');
    });

    test('sync v3 with a registered email, unregistered uid', async ({
      syncBrowserPages: {
        fxDesktopV3ForceAuth,
        login,
        connectAnotherDevice,
        signinTokenCode,
      },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpSync();
      const uid = makeUid();
      await fxDesktopV3ForceAuth.openWithReplacementParams(credentials, {
        uid,
      });
      await fxDesktopV3ForceAuth.noSuchWebChannelMessage('fxaccounts:logout');
      await login.setPassword(credentials.password);
      await login.submit();
      await expect(signinTokenCode.tokenCodeHeader).toBeVisible();
      await fxDesktopV3ForceAuth.checkWebChannelMessage(
        'fxaccounts:can_link_account'
      );
      await login.fillOutSignInCode(credentials.email);
      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
      await fxDesktopV3ForceAuth.checkWebChannelMessage('fxaccounts:login');
    });

    test('blocked with an registered email, unregistered uid', async ({
      syncBrowserPages: {
        page,
        fxDesktopV3ForceAuth,
        login,
        connectAnotherDevice,
        settings,
        deleteAccount,
      },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpBlocked();
      const uid = makeUid();
      await fxDesktopV3ForceAuth.openWithReplacementParams(credentials, {
        uid,
      });
      await fxDesktopV3ForceAuth.noSuchWebChannelMessage('fxaccounts:logout');
      await login.setPassword(credentials.password);
      await login.submit();
      await fxDesktopV3ForceAuth.checkWebChannelMessage(
        'fxaccounts:can_link_account'
      );
      await login.unblock(credentials.email);
      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
      await fxDesktopV3ForceAuth.checkWebChannelMessage('fxaccounts:login');

      // Delete account, required before teardown
      await settings.goto();
      await settings.deleteAccountButton.click();
      await deleteAccount.deleteAccount(credentials.password);

      await expect(
        page.getByText('Account deleted successfully')
      ).toBeVisible();
    });
  });
});
