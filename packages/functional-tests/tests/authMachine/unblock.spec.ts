/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getTotpCode } from '../../lib/totp';
import { expect, test } from '../../lib/fixtures/standard';

/**
 * Auth state machine — sign-in unblock + 2FA E2E (the FXA-12084 chain).
 *
 * This is the re-enabled FXA-12084 scenario (the original lives skipped at
 * tests/signin/signinBlocked.spec.ts 'sync with 2fa'). A 'blocked.'-prefixed
 * account is forced through /signin_unblock on every fresh sign-in by the
 * customs server — a reliable trigger, unlike the canonical's flaky
 * five-wrong-passwords approach. It asserts the chain:
 *   correct password -> /signin_unblock -> unblock code -> /signin_totp_code
 */
test.describe('auth-machine: unblock', () => {
  test('blocked account with 2fa: unblock then routes to /signin_totp_code (FXA-12084)', async ({
    target,
    page,
    pages: {
      signin,
      signinUnblock,
      signinTotpCode,
      settings,
      totp,
      deleteAccount,
    },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUpBlocked();

    // First sign-in is blocked; unblock to reach settings and enable TOTP.
    await signin.goto();
    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);
    await expect(page).toHaveURL(/signin_unblock/);
    const setupUnblockCode = await target.emailClient.getUnblockCode(
      credentials.email
    );
    await signinUnblock.fillOutCodeForm(setupUnblockCode);
    await expect(settings.settingsHeading).toBeVisible();

    await settings.totp.addButton.click();
    await settings.confirmMfaGuard(credentials.email);
    // Read recovery-phone availability so TOTP setup skips the chooser when it's unavailable.
    const { available: recoveryPhoneAvailable } =
      await target.authClient.recoveryPhoneAvailable(credentials.sessionToken);
    const { secret } = await totp.setUpTwoStepAuthWithQrAndBackupCodesChoice(
      credentials,
      recoveryPhoneAvailable
    );

    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.alertBar).toContainText(
      'Two-step authentication has been enabled'
    );
    await expect(settings.totp.status).toHaveText('Enabled');
    await settings.signOut();

    // Second sign-in (machine flag on): blocked again → unblock → the machine
    // must route a TOTP account to /signin_totp_code, not straight to settings.
    await page.goto(`${target.contentServerUrl}?authStateMachine=true`);
    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);
    await expect(page).toHaveURL(/signin_unblock/);
    const unblockCode = await target.emailClient.getUnblockCode(
      credentials.email
    );
    await signinUnblock.fillOutCodeForm(unblockCode);

    await expect(page).toHaveURL(/signin_totp_code/);
    const code = await getTotpCode(secret);
    await signinTotpCode.fillOutCodeForm(code);
    await expect(settings.settingsHeading).toBeVisible();

    // Blocked accounts must be deleted via the UI — auto-teardown cannot sign in.
    await settings.deleteAccountButton.click();
    await deleteAccount.deleteAccount(credentials.password);
    await expect(page.getByText('Account deleted successfully')).toBeVisible();
  });
});
