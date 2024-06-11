/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';
import { createCustomEventDetail, FirefoxCommand } from '../../lib/channels';
import { EmailHeader, EmailType } from '../../lib/email';

test.describe('severity-2 #smoke', () => {
  test.describe('Firefox Desktop Sync v3 signin react', () => {
    test('verified, does not need to confirm', async ({
      syncBrowserPages: { configPage, connectAnotherDevice, signinReact },
      testAccountTracker,
    }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.showReactApp.signInRoutes !== true,
        'React signInRoutes not enabled'
      );

      const credentials = await testAccountTracker.signUp();

      await signinReact.goto(
        undefined,
        new URLSearchParams('context=fx_desktop_v3&service=sync&action=email')
      );
      await expect(signinReact.syncSignInHeading).toBeVisible();
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);

      await signinReact.sendWebChannelMessage(
        createCustomEventDetail(FirefoxCommand.LinkAccount, {
          ok: true,
        })
      );

      await expect(connectAnotherDevice.fxaConnected).toBeEnabled();
    });
  });

  test('verified, does need to confirm', async ({
    target,
    page,
    pages: { login, signinReact, settings, deleteAccount },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUpSync();

    const syncParams = new URLSearchParams();
    syncParams.append('context', 'fx_desktop_v3');
    syncParams.append('service', 'sync');
    syncParams.append('action', 'email');
    await signinReact.goto('/', syncParams);

    await signinReact.fillOutEmailFirstForm(credentials.email);
    await signinReact.fillOutPasswordForm(credentials.password);

    await signinReact.sendWebChannelMessage(
      createCustomEventDetail(FirefoxCommand.LinkAccount, {
        ok: true,
      })
    );

    await page.waitForURL(/signin_token_code/);

    const code = await target.emailClient.waitForEmail(
      credentials.email,
      EmailType.verifyLoginCode,
      EmailHeader.signinCode
    );

    await expect(
      signinReact.page.getByRole('heading', {
        name: 'Enter confirmation code',
      })
    ).toBeVisible();

    await signinReact.codeTextbox.fill(code);
    await signinReact.confirmButton.click();

    await page.waitForURL(/connect_another_device/);
  });
});
