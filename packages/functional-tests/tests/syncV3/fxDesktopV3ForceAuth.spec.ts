/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget } from '../../lib/targets/base';
import { SettingsPage } from '../../pages/settings';
import { SecondaryEmailPage } from '../../pages/settings/secondaryEmail';
import { SigninPage } from '../../pages/signin';
import { SigninTokenCodePage } from '../../pages/signinTokenCode';

/**
 * Firefox 147+ chains the legacy fx_desktop_v3 sign-in into an OAuth re-auth to
 * derive Sync keys (keys decoupling): after the first password + token code, the
 * flow redirects to context=oauth_webchannel_v1 and re-prompts for the password
 * and a second token code before completing.
 */
async function completeForceAuthSignIn(
  target: BaseTarget,
  page: Page,
  signin: SigninPage,
  signinTokenCode: SigninTokenCodePage,
  creds: { email: string; password: string }
): Promise<void> {
  await signin.fillOutPasswordForm(creds.password);
  await expect(page).toHaveURL(/signin_token_code/);
  let code = await target.emailClient.getVerifyLoginCode(creds.email);
  await signinTokenCode.fillOutCodeForm(code);

  await signin.fillOutPasswordForm(creds.password);
  await expect(page).toHaveURL(/signin_token_code/);
  code = await target.emailClient.getVerifyLoginCode(creds.email);
  await signinTokenCode.fillOutCodeForm(code);
}

const makeUid = () =>
  [...Array(32)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('');

test.describe('severity-1 #smoke', () => {
  test.describe('Desktop Sync V3 force auth', () => {
    test('sync v3 with a registered email, no uid', async ({
      syncBrowserPages: {
        page,
        fxDesktopV3ForceAuth,
        connectAnotherDevice,
        signin,
        signinTokenCode,
      },
      target,
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpSync();

      await fxDesktopV3ForceAuth.openWithReplacementParams(credentials, {
        uid: undefined,
      });
      await completeForceAuthSignIn(target, page, signin, signinTokenCode, {
        email: credentials.email,
        password: credentials.password,
      });
      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    });

    test('sync v3 with a registered email, registered uid', async ({
      syncBrowserPages: {
        page,
        fxDesktopV3ForceAuth,
        connectAnotherDevice,
        signin,
        signinTokenCode,
      },
      target,
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpSync();

      await fxDesktopV3ForceAuth.open(credentials);
      await completeForceAuthSignIn(target, page, signin, signinTokenCode, {
        email: credentials.email,
        password: credentials.password,
      });
      await expect(page).toHaveURL(/pair/);
      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    });

    test('sync v3 with a registered email, unregistered uid', async ({
      syncBrowserPages: {
        page,
        fxDesktopV3ForceAuth,
        connectAnotherDevice,
        signin,
        signinTokenCode,
      },
      target,
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpSync();
      const uid = makeUid();
      await fxDesktopV3ForceAuth.openWithReplacementParams(credentials, {
        uid,
      });
      await completeForceAuthSignIn(target, page, signin, signinTokenCode, {
        email: credentials.email,
        password: credentials.password,
      });
      await page.waitForURL(/pair/);
      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    });

    test('blocked with an registered email, unregistered uid', async ({
      syncBrowserPages: {
        page,
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
      const credentials = await testAccountTracker.signUpBlocked();
      const nonBlockedEmail = await testAccountTracker.generateEmail();
      const uid = makeUid();
      await fxDesktopV3ForceAuth.openWithReplacementParams(credentials, {
        uid,
      });
      await signin.fillOutPasswordForm(credentials.password);
      await expect(page).toHaveURL(/signin_unblock/);
      const code = await target.emailClient.getUnblockCode(credentials.email);
      await signinUnblock.fillOutCodeForm(code);

      await expect(page).toHaveURL(/pair/);
      await expect(connectAnotherDevice.fxaConnected).toBeVisible();

      // Change primary email to non-blocked email
      await settings.goto();
      await changePrimaryEmail(
        target,
        settings,
        secondaryEmail,
        nonBlockedEmail,
        credentials.email
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
  email: string,
  primaryEmail: string
): Promise<void> {
  await settings.secondaryEmail.addButton.click();
  await settings.confirmMfaGuard(primaryEmail);
  await secondaryEmail.fillOutEmail(email);
  const code: string = await target.emailClient.getVerifySecondaryCode(email);
  await secondaryEmail.fillOutVerificationCode(code);
  await settings.secondaryEmail.makePrimaryButton.click();

  await expect(settings.settingsHeading).toBeVisible();
  await expect(settings.alertBar).toHaveText(
    new RegExp(`${email}.*is now your primary email`)
  );
}
