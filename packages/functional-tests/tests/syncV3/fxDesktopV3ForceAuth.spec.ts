/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';
import { BaseTarget } from '../../lib/targets/base';
import { SettingsPage } from '../../pages/settings';
import { SecondaryEmailPage } from '../../pages/settings/secondaryEmail';

const makeUid = () =>
  [...Array(32)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('');

test.describe('severity-1 #smoke', () => {
  test.describe('Desktop Sync V3 force auth', () => {
    test('sync v3 with a registered email, no uid', async ({
      syncBrowserPages: {
        page,
        configPage,
        fxDesktopV3ForceAuth,
        connectAnotherDevice,
        signin,
        signinTokenCode,
      },
      target,
      testAccountTracker,
    }) => {
      const config = await configPage.getConfig();
      // backbone signin sends a fxaccounts:can_link_account event on signin
      // but this has been removed for react because we already send up this message on the index page
      // See discussion here: https://github.com/mozilla/fxa/pull/16622/files#r1538329391

      // TODO in FXA-9868 - determine if wfxaccounts:can_link_account needs to be added in react signin,
      // if index is bypassed the message might not be sent at all.
      // it is unclear if this scenario can occur or if the account for force auth with sync will always be
      // the signed in account (no need to merge sync data)

      test.skip(config.showReactApp.signInRoutes === true, 'FXA-9868');

      const credentials = await testAccountTracker.signUpSync();

      await fxDesktopV3ForceAuth.openWithReplacementParams(credentials, {
        uid: undefined,
      });
      await signin.fillOutPasswordForm(credentials.password);

      // fails on this chck for react (message not sent)
      await fxDesktopV3ForceAuth.checkWebChannelMessage(
        'fxaccounts:can_link_account'
      );
      await expect(page).toHaveURL(/signin_token_code/);
      const code = await target.emailClient.getVerifyLoginCode(
        credentials.email
      );
      await signinTokenCode.fillOutCodeForm(code);
      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
      await fxDesktopV3ForceAuth.checkWebChannelMessage('fxaccounts:login');
    });

    test('sync v3 with a registered email, registered uid', async ({
      syncBrowserPages: {
        page,
        configPage,
        fxDesktopV3ForceAuth,
        connectAnotherDevice,
        signin,
        signinTokenCode,
      },
      target,
      testAccountTracker,
    }) => {
      const config = await configPage.getConfig();
      // see comment in first test
      test.skip(config.showReactApp.signInRoutes === true, 'FXA-9868');
      const credentials = await testAccountTracker.signUpSync();

      await fxDesktopV3ForceAuth.open(credentials);
      await signin.fillOutPasswordForm(credentials.password);

      // fails on this chck for react (message not sent)
      await fxDesktopV3ForceAuth.checkWebChannelMessage(
        'fxaccounts:can_link_account'
      );
      await expect(page).toHaveURL(/signin_token_code/);
      const code = await target.emailClient.getVerifyLoginCode(
        credentials.email
      );
      await signinTokenCode.fillOutCodeForm(code);
      await expect(page).toHaveURL(/connect_another_device/);
      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
      await fxDesktopV3ForceAuth.checkWebChannelMessage('fxaccounts:login');
    });

    test('sync v3 with a registered email, unregistered uid', async ({
      syncBrowserPages: {
        page,
        configPage,
        fxDesktopV3ForceAuth,
        connectAnotherDevice,
        signin,
        signinTokenCode,
      },
      target,
      testAccountTracker,
    }) => {
      const config = await configPage.getConfig();
      // see comment in first test
      test.skip(config.showReactApp.signInRoutes === true, 'FXA-9868');
      const credentials = await testAccountTracker.signUpSync();
      const uid = makeUid();
      await fxDesktopV3ForceAuth.openWithReplacementParams(credentials, {
        uid,
      });
      await fxDesktopV3ForceAuth.noSuchWebChannelMessage('fxaccounts:logout');
      await signin.fillOutPasswordForm(credentials.password);
      // fails on this chck for react (message not sent)
      await fxDesktopV3ForceAuth.checkWebChannelMessage(
        'fxaccounts:can_link_account'
      );
      await expect(page).toHaveURL(/signin_token_code/);
      const code = await target.emailClient.getVerifyLoginCode(
        credentials.email
      );
      await signinTokenCode.fillOutCodeForm(code);
      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
      await fxDesktopV3ForceAuth.checkWebChannelMessage('fxaccounts:login');
    });

    test('blocked with an registered email, unregistered uid', async ({
      syncBrowserPages: {
        page,
        configPage,
        fxDesktopV3ForceAuth,
        connectAnotherDevice,
        secondaryEmail,
        settings,
        deleteAccount,
        signin,
        signinUnblock,
      },
      target,
      testAccountTracker,
    }) => {
      const config = await configPage.getConfig();
      // see comment in first test
      test.skip(config.showReactApp.signInRoutes === true, 'FXA-9868');
      const credentials = await testAccountTracker.signUpBlocked();
      const nonBlockedEmail = await testAccountTracker.generateEmail();
      const uid = makeUid();
      await fxDesktopV3ForceAuth.openWithReplacementParams(credentials, {
        uid,
      });
      await fxDesktopV3ForceAuth.noSuchWebChannelMessage('fxaccounts:logout');
      await signin.fillOutPasswordForm(credentials.password);
      // fails on this chck for react (message not sent)
      await fxDesktopV3ForceAuth.checkWebChannelMessage(
        'fxaccounts:can_link_account'
      );
      await expect(page).toHaveURL(/signin_unblock/);
      const code = await target.emailClient.getUnblockCode(credentials.email);
      await signinUnblock.fillOutCodeForm(code);

      await expect(page).toHaveURL(/connect_another_device/);
      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
      await fxDesktopV3ForceAuth.checkWebChannelMessage('fxaccounts:login');

      // Change primary email to non-blocked email
      await settings.goto();
      await changePrimaryEmail(
        target,
        settings,
        secondaryEmail,
        nonBlockedEmail
      );
      await settings.deleteAccountButton.click();
      await deleteAccount.deleteAccount(credentials.password);

      await expect(
        page.getByText('Account deleted successfully')
      ).toBeVisible();
    });
  });
});

async function changePrimaryEmail(
  target: BaseTarget,
  settings: SettingsPage,
  secondaryEmail: SecondaryEmailPage,
  email: string
): Promise<void> {
  await settings.secondaryEmail.addButton.click();
  await secondaryEmail.fillOutEmail(email);
  const code: string = await target.emailClient.getVerifySecondaryCode(email);
  await secondaryEmail.fillOutVerificationCode(code);
  await settings.secondaryEmail.makePrimaryButton.click();

  await expect(settings.settingsHeading).toBeVisible();
  await expect(settings.alertBar).toHaveText(
    new RegExp(`${email}.*is now your primary email`)
  );
}
