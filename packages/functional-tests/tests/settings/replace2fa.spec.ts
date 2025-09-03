/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getTotpCode } from '../../lib/totp';
import { expect, Page, test } from '../../lib/fixtures/standard';
import { Credentials } from '../../lib/targets';
import { SettingsPage } from '../../pages/settings';
import { TotpCredentials, TotpPage } from '../../pages/settings/totp';
import { SigninTotpCodePage } from '../../pages/signinTotpCode';
import { SigninRecoveryChoicePage } from '../../pages/signinRecoveryChoice';
import { SigninRecoveryPhonePage } from '../../pages/signinRecoveryPhone';
import { SigninRecoveryCodePage } from '../../pages/signinRecoveryCode';
import { SigninPage } from '../../pages/signin';
import { RecoveryPhoneSetupPage } from '../../pages/settings/recoveryPhone';
import { BaseTarget } from '../../lib/targets/base';

test.describe('severity-2 #smoke', () => {
  test.describe('change 2FA', () => {
    test.beforeAll(({ target }) => {
      target.smsClient.guardTestPhoneNumber();
    });

    // happy path
    test('can change 2FA and signin with new 2FA', async ({
      page,
      testAccountTracker,
      pages: { settings, signin, totp, signinTotpCode },
    }) => {
      const credentials = await testAccountTracker.signUp();

      await signin.emailFirstSignin(credentials);

      const {
        new: { secret: newSecret },
      } = await addThenChange2FA({ settings, totp });

      await settings.signOut();

      // signin with _new_ 2fa
      const code = await getTotpCode(newSecret);
      await signin.emailFirstSignin(credentials);
      await page.waitForURL(/signin_totp_code/);
      await signinTotpCode.fillOutCodeForm(code);

      await expect(settings.settingsHeading).toBeVisible();

      await settings.disconnectTotp();
    });

    test('can change 2FA and old 2FA should not work', async ({
      page,
      testAccountTracker,
      pages: { settings, signin, totp, signinTotpCode },
    }) => {
      const credentials = await testAccountTracker.signUp();

      await signin.emailFirstSignin(credentials);

      const {
        initial: { secret: oldSecret },
      } = await addThenChange2FA({ settings, totp });

      await settings.signOut();

      // attempt signin with _old_ 2fa (should fail)
      const oldSecretCode = await getTotpCode(oldSecret);
      await signin.emailFirstSignin(credentials);
      await page.waitForURL(/signin_totp_code/);
      await signinTotpCode.fillOutCodeForm(oldSecretCode);

      // final asserts
      await expect(signinTotpCode.invalidCodeError).toBeVisible();
      expect(page.url()).toMatch(/signin_totp_code/);
    });

    test('can change 2fa and use existing backup codes to sign in', async ({
      page,
      testAccountTracker,
      pages: { settings, signin, totp, signinRecoveryCode, signinTotpCode },
    }) => {
      const credentials = await testAccountTracker.signUp();

      await signin.emailFirstSignin(credentials);

      const {
        initial: { recoveryCodes },
      } = await addThenChange2FA({ settings, totp });

      await settings.signOut();

      // use recovery code
      await completeSigninWithBackupCode({
        code: recoveryCodes[0],
        credentials,
        page,
        signin,
        signinTotpCode,
        signinRecoveryCode,
      });

      await expect(settings.settingsHeading).toBeVisible();

      await settings.disconnectTotp();
    });

    test('can change 2fa and use existing recovery phone to sign in', async ({
      page,
      target,
      testAccountTracker,
      pages: {
        recoveryPhone,
        settings,
        signin,
        signinRecoveryCode,
        signinRecoveryChoice,
        signinRecoveryPhone,
        signinTotpCode,
        totp,
      },
    }) => {
      const credentials = await testAccountTracker.signUp();
      await signin.emailFirstSignin(credentials);

      await addThenChange2FA({ settings, totp });

      // connect phone
      await addPhoneRecovery({
        credentials,
        recoveryPhone,
        settings,
        target,
      });

      // sign out
      await settings.signOut();

      // Sign in with recovery phone
      await completeSigninWithDualRecovery({
        method: 'Phone',
        page,
        signin,
        signinTotpCode,
        signinRecoveryChoice,
        signinRecoveryCode,
        signinRecoveryPhone,
        credentials,
        target,
      });

      await expect(settings.settingsHeading).toBeVisible();

      await settings.disconnectTotp();
    });
  });
});

/**
 * Adds a new 2FA authentication method and then changes it. Call when on the settings page.
 * @returns An object containing the initial and new credentials. NOTE, `new`
 * does _not_ contain any recovery codes. Initial recovery codes are left intact during change.
 */
const addThenChange2FA = async ({
  settings,
  totp,
}: {
  settings: SettingsPage;
  totp: TotpPage;
}): Promise<{ initial: TotpCredentials; new: TotpCredentials }> => {
  async function assertEnabled(isSetup: boolean) {
    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.alertBar).toHaveText(
      `Two-step authentication has been ${isSetup ? 'enabled' : 'updated'}`
    );
    await expect(settings.totp.status).toHaveText('Enabled');
  }

  await settings.settingsHeading.waitFor({ state: 'visible' });

  // setup 2fa with backup codes
  await settings.totp.addButton.click();
  const { recoveryCodes, secret } =
    await totp.setUpTwoStepAuthWithManualCodeAndBackupCodesChoice();

  await assertEnabled(true);

  await settings.totp.changeButton.click();
  // changing doesn't do anything special or require saving backup codes
  // just call straight to the setup method
  const newSecret = await totp.setUp2faAppWithQrCode();

  await assertEnabled(false);

  return {
    initial: { secret, recoveryCodes },
    new: { secret: newSecret, recoveryCodes: [] },
  };
};

/**
 * Completes the signin process for an account with 2FA enabled and only backup codes.
 * Success or failure is not assumed, that is up to the caller to verify.
 * @param pages
 */
const completeSigninWithBackupCode = async ({
  code,
  credentials,
  page,
  signin,
  signinTotpCode,
  signinRecoveryCode,
}: {
  code: string;
  credentials: Credentials;
  page: Page;
  signin: SigninPage;
  signinTotpCode: SigninTotpCodePage;
  signinRecoveryCode: SigninRecoveryCodePage;
}) => {
  await signin.emailFirstSignin(credentials);
  // assert we're on the right page
  await page.waitForURL(/signin_totp_code/);

  // continue to trouble/pick method page
  await signinTotpCode.clickTroubleEnteringCode();
  await page.waitForURL(/signin_recovery_code/);
  await signinRecoveryCode.fillOutCodeForm(code);
};

/**
 * Completes the signin process for a user who
 * has both backup codes and a recovery phone configured
 */
const completeSigninWithDualRecovery = async ({
  credentials,
  method,
  page,
  signin,
  signinTotpCode,
  signinRecoveryChoice,
  signinRecoveryCode,
  signinRecoveryPhone,
  target,
}: {
  credentials: Credentials;
  method: 'Code' | 'Phone';
  page: Page;
  signin: SigninPage;
  signinTotpCode: SigninTotpCodePage;
  signinRecoveryChoice: SigninRecoveryChoicePage;
  signinRecoveryCode: SigninRecoveryCodePage;
  signinRecoveryPhone: SigninRecoveryPhonePage;
  target: BaseTarget;
}) => {
  // since both pages extend the same base we can
  // do this to prevent conditionals in the test.
  const recoveries = {
    Code: signinRecoveryCode,
    Phone: signinRecoveryPhone,
  };
  await signin.emailFirstSignin(credentials);
  await page.waitForURL(/signin_totp_code/);
  await signinTotpCode.clickTroubleEnteringCode();
  await page.waitForURL(/signin_recovery_choice/);
  await signinRecoveryChoice[`clickChoose${method}`]();
  await signinRecoveryChoice.clickContinue();
  // new RegExp because template literal isn't supported directly inside regex literal
  await page.waitForURL(new RegExp(`signin_recovery_${method.toLowerCase()}`));
  const code = await target.smsClient.getCode({ ...credentials });
  await recoveries[method].fillOutCodeForm(code);
};

/**
 * Completes the setup to add a backup phone.
 */
const addPhoneRecovery = async ({
  credentials,
  recoveryPhone,
  settings,
  target,
}: {
  credentials: Credentials;
  recoveryPhone: RecoveryPhoneSetupPage;
  settings: SettingsPage;
  target: BaseTarget;
}) => {
  await settings.totp.addRecoveryPhoneButton.click();

  await recoveryPhone.submitPhoneNumber();

  const code = await target.smsClient.getCode({ ...credentials });

  await recoveryPhone.submitCode(code);
};
