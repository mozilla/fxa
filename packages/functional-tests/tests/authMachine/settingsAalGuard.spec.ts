/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getTotpCode } from '../../lib/totp';
import { expect, test } from '../../lib/fixtures/standard';

/**
 * Auth state machine — Settings AAL2 access guard (routeSettingsAccess) E2E.
 *
 * The machine owns the Settings root access decision:
 *   - unverified → /  (handled elsewhere)
 *   - session below minimum AAL (TOTP account, session hasn't satisfied 2FA)
 *       → /signin_totp_code (isSessionAALUpgrade)
 *   - else → allow settings
 */
test.describe('auth-machine: settings AAL guard', () => {
  test('ALLOW: fully-verified non-TOTP account reaches settings via routeSettingsAccess', async ({
    target,
    page,
    pages: { signin, settings },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();
    await page.goto(`${target.contentServerUrl}?authStateMachine=true`);
    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);
    await expect(settings.settingsHeading).toBeVisible();

    // Navigate directly to settings with flag; routeSettingsAccess must allow.
    await page.goto(
      `${target.contentServerUrl}/settings?authStateMachine=true`
    );
    await expect(settings.settingsHeading).toBeVisible();
  });

  test('AAL2 step-up: TOTP account session below AAL2 redirects to /signin_totp_code', async ({
    target,
    page,
    pages: { signin, settings, totp, signinTotpCode },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();

    // Sign in and enable TOTP.
    await page.goto(`${target.contentServerUrl}?authStateMachine=true`);
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
    await expect(settings.totp.status).toHaveText('Enabled');
    await settings.signOut();

    // Sign in with email+password only — session does not yet satisfy AAL2.
    await page.goto(`${target.contentServerUrl}?authStateMachine=true`);
    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);
    // The machine's routeSettingsAccess must redirect to /signin_totp_code
    // because the TOTP account session hasn't satisfied the minimum AAL.
    await expect(page).toHaveURL(/signin_totp_code/);

    // Complete TOTP to confirm recovery.
    const code = await getTotpCode(secret);
    await signinTotpCode.fillOutCodeForm(code);
    await expect(settings.settingsHeading).toBeVisible();
  });
});
