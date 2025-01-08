/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

const AGE_21 = '21';
const HINT = 'secret key location';

test.describe('severity-2 #smoke', () => {
  test(`recovery key is preserved upon upgrade`, async ({
    page,
    target,
    pages: { signin, signup, settings, recoveryKey, confirmSignupCode },
    testAccountTracker,
  }) => {
    const { email, password } = testAccountTracker.generateAccountDetails();
    await page.goto(
      `${target.contentServerUrl}/?forceExperiment=generalizedReactApp&forceExperimentGroup=react&stretch=1`
    );
    await signup.fillOutEmailForm(email);
    await signup.fillOutSignupForm(password, AGE_21);

    await expect(page).toHaveURL(/confirm_signup_code/);

    const code = await target.emailClient.getVerifyShortCode(email);
    await confirmSignupCode.fillOutCodeForm(code);

    await expect(page).toHaveURL(/settings/);
    await expect(settings.recoveryKey.status).toHaveText('Not Set');

    await settings.recoveryKey.createButton.click();
    await recoveryKey.createRecoveryKey(password, HINT);

    await expect(settings.recoveryKey.status).toHaveText('Enabled');

    await settings.signOut();
    await page.goto(
      `${target.contentServerUrl}/?forceExperiment=generalizedReactApp&forceExperimentGroup=react&stretch=2`
    );
    await signin.fillOutEmailFirstForm(email);
    await signin.fillOutPasswordForm(password);

    await expect(page).toHaveURL(/settings/);
    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.recoveryKey.status).toHaveText('Enabled');
  });
});
