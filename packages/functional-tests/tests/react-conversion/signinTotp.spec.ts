/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';

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
      await expect(settings.twoStepAuthenticationStatus).toHaveText('Not Set');

      await settings.addTwoStepAuthenticationButton.click();
      const { secret } = await totp.fillOutTwoStepAuthenticationForm();
      credentials.secret = secret;

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.alertBar).toHaveText(
        'Two-step authentication enabled'
      );
      await expect(settings.twoStepAuthenticationStatus).toHaveText('Enabled');

      await settings.signOut();
      await page.goto(
        `${target.contentServerUrl}/?showReactApp=true&forceExperiment=generalizedReactApp&forceExperimentGroup=react`
      );
      await signupReact.fillOutEmailForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);
      const code = await totp.getNextCode(credentials.secret);
      await signinReact.fillOutAuthenticationForm(code);

      await expect(page).toHaveURL(/settings/);
      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.twoStepAuthenticationStatus).toHaveText('Enabled');
    });

    test('error message when totp code is invalid', async ({
      credentials,
      target,
      pages: { settings, totp, page, signinReact, signupReact },
    }) => {
      await settings.goto();

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.twoStepAuthenticationStatus).toHaveText('Not Set');

      await settings.addTwoStepAuthenticationButton.click();
      const { secret } = await totp.fillOutTwoStepAuthenticationForm();
      credentials.secret = secret;

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.alertBar).toHaveText(
        'Two-step authentication enabled'
      );
      await expect(settings.twoStepAuthenticationStatus).toHaveText('Enabled');

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
