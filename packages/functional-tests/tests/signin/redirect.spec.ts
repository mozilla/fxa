/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

test.describe('severity-2 #smoke', () => {
  test.describe('redirect_to', () => {
    const testCases = [
      { name: 'invalid', redirectTo: 'https://evil.com/' },
      { name: 'xss', redirectTo: 'javascript:alert(1)' },
    ];
    for (const { name, redirectTo } of testCases) {
      test(`prevent ${name} redirect_to parameter`, async ({
        target,
        page,
        pages: { confirmSignupCode, signupReact, settings },
        testAccountTracker,
      }) => {
        const { email, password } = testAccountTracker.generateAccountDetails();

        await page.goto(target.contentServerUrl);
        await signupReact.fillOutEmailForm(email);
        await signupReact.fillOutSignupForm(password);
        await expect(confirmSignupCode.heading).toBeVisible();

        await page.goto(`${page.url()}&redirect_to=${redirectTo}`);
        const code = await target.emailClient.getConfirmSignupCode(email);
        await confirmSignupCode.fillOutCodeForm(code);

        await expect(page.getByText(/Invalid redirect/)).toBeVisible();
      });
    }

    test('allows valid redirect_to parameter', async ({
      target,
      pages: { confirmSignupCode, page, signupReact },
      testAccountTracker,
    }) => {
      const { email, password } = testAccountTracker.generateAccountDetails();

      await page.goto(target.contentServerUrl);
      await signupReact.fillOutEmailForm(email);
      await signupReact.fillOutSignupForm(password);
      await expect(confirmSignupCode.heading).toBeVisible();

      const redirectTo = `${target.contentServerUrl}/settings/change_password`;
      await page.goto(`${page.url()}&redirect_to=${redirectTo}`);
      const code = await target.emailClient.getConfirmSignupCode(email);
      await confirmSignupCode.fillOutCodeForm(code);

      await expect(page).toHaveURL(redirectTo);
    });
  });
});
