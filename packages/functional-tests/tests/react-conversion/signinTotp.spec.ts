/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';
import { getCode } from 'fxa-settings/src/lib/totp';

test.describe('severity-1 #smoke', () => {
  test.describe('two step auth', () => {
    test.beforeEach(async ({}) => {
      test.slow();
    });

    test('add totp', async ({
      credentials,
      target,
      pages: { settings, totp, page, signinReact, signupReact },
    }) => {
      await settings.goto();

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.totp.status).toHaveText('Not Set');

      await settings.totp.addButton.click();
      const { secret } = await totp.fillOutTotpForms();
      credentials.secret = secret;

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.alertBar).toHaveText(
        'Two-step authentication enabled'
      );
      await expect(settings.totp.status).toHaveText('Enabled');

      await settings.signOut();
      await page.goto(
        `${target.contentServerUrl}/?showReactApp=true&forceExperiment=generalizedReactApp&forceExperimentGroup=react`
      );
      await signupReact.fillOutEmailForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);
      const code = await getCode(credentials.secret);
      await signinReact.fillOutAuthenticationForm(code);

      await expect(page).toHaveURL(/settings/);
      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.totp.status).toHaveText('Enabled');
    });

    test('error message when totp code is invalid', async ({
      credentials,
      target,
      pages: { settings, totp, page, signinReact, signupReact },
    }) => {
      await settings.goto();

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.totp.status).toHaveText('Not Set');

      await settings.totp.addButton.click();
      const { secret } = await totp.fillOutTotpForms();
      credentials.secret = secret;

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.alertBar).toHaveText(
        'Two-step authentication enabled'
      );
      await expect(settings.totp.status).toHaveText('Enabled');

      await settings.signOut();
      await page.goto(
        `${target.contentServerUrl}/?showReactApp=true&forceExperiment=generalizedReactApp&forceExperimentGroup=react`
      );
      await signupReact.fillOutEmailForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);
      await signinReact.fillOutAuthenticationForm('111111');

      await expect(signinReact.authenticationCodeTextboxTooltip).toHaveText(
        'Invalid two-step authentication code'
      );
    });
  });
});
