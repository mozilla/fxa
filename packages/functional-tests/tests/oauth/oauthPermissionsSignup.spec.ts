/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

test.describe('severity-1 #smoke', () => {
  test.describe('oauth permissions for trusted reliers - sign up', () => {
    test('signup without `prompt=consent`', async ({
      target,
      pages: { page, signup, relier, confirmSignupCode },
      testAccountTracker,
    }) => {
      const { email, password } = testAccountTracker.generateAccountDetails();

      await relier.goto();
      await relier.clickEmailFirst();
      await signup.fillOutEmailForm(email);
      await signup.fillOutSignupForm(password, '21');

      //no permissions asked for, straight to confirm
      await expect(page).toHaveURL(/confirm_signup_code/);

      // Provide the code so the account can be cleaned up.
      const code = await target.emailClient.getVerifyShortCode(email);
      await confirmSignupCode.fillOutCodeForm(code);
    });

    test('signup with `prompt=consent`', async ({
      target,
      page,
      pages: { configPage, signup, relier, confirmSignupCode },
      testAccountTracker,
    }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.showReactApp.signUpRoutes === true,
        'permissions page is not supported in React, see FXA-8827'
      );
      const { email, password } = testAccountTracker.generateAccountDetails();

      const query = { prompt: 'consent' };
      const queryParam = new URLSearchParams(query);

      await page.goto(`${target.relierUrl}/?${queryParam.toString()}`);
      await relier.clickEmailFirst();
      await signup.fillOutEmailForm(email);
      await signup.fillOutSignupForm(password, '21');

      //Verify permissions header
      await expect(signup.permissionsHeading).toBeVisible();
      await signup.permissionsAcceptButton.click();

      //Verify sign up code header
      await expect(page).toHaveURL(/confirm_signup_code/);

      // Provide the code so the account can be cleaned up.
      const code = await target.emailClient.getVerifyShortCode(email);
      await confirmSignupCode.fillOutCodeForm(code);
    });
  });
});
