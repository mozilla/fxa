/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getTotpCode } from '../../lib/totp';
import { expect, test } from '../../lib/fixtures/standard';

/**
 * Auth state machine — verification routing E2E.
 *
 * The machine's verification routing — including the safety net where a TOTP
 * account routes to /signin_totp_code even if the response method echoes
 * email-otp — is covered at the unit level in
 * src/lib/auth-machine/funnel.verifying.test.ts. This E2E re-proves it
 * end-to-end against a target with the authStateMachine flag enabled.
 */
test.describe('auth-machine: verify', () => {
  test('totp account routes to /signin_totp_code', async ({
    target,
    page,
    pages: { signin, settings, totp, signinTotpCode },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();

    // Sign in to settings and enable TOTP, capturing the shared secret.
    await signin.goto();
    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);
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

    // Sign in with the machine flag on — the machine must route to TOTP.
    await page.goto(`${target.contentServerUrl}?authStateMachine=true`);
    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);
    await expect(page).toHaveURL(/signin_totp_code/);
    const code = await getTotpCode(secret);
    await signinTotpCode.fillOutCodeForm(code);
    await expect(settings.settingsHeading).toBeVisible();
  });
});
