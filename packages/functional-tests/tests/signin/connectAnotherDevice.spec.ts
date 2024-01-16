/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect, newPagesForSync } from '../../lib/fixtures/standard';

test.describe('severity-2 #smoke', () => {
  test.describe('connect_another_device', () => {
    test('signup Fx Desktop, load /connect_another_device page', async ({
      credentials,
      target,
    }) => {
      const {
        browser,
        configPage,
        connectAnotherDevice,
        page,
        login,
        signupReact,
      } = await newPagesForSync(target);
      const config = await configPage.getConfig();
      await target.auth.accountDestroy(credentials.email, credentials.password);

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`,
        { waitUntil: 'load' }
      );

      if (config.showReactApp.signUpRoutes === true) {
        await signupReact.fillOutEmailFirst(credentials.email);
        await signupReact.fillOutSignupForm(credentials.password);
        await signupReact.fillOutCodeForm(credentials.email);
      } else {
        await login.fillOutFirstSignUp(credentials.email, credentials.password);
      }

      // Move on to the connect another device page
      await connectAnotherDevice.goto('load');
      await expect(connectAnotherDevice.header).toHaveCount(1);
      await expect(connectAnotherDevice.signInButton).toHaveCount(0);
      await expect(connectAnotherDevice.installFxDesktop).toHaveCount(1);
      await expect(connectAnotherDevice.success).toHaveCount(0);

      await browser?.close();
    });
  });
});
