/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { EmailHeader, EmailType } from '../../lib/email';
import { expect, test } from '../../lib/fixtures/standard';

test.describe('severity-2 #smoke', () => {
  test.describe('OAuth signin token code', () => {
    function toQueryString(obj) {
      return Object.entries(obj)
        .map((x) => `${x[0]}=${x[1]}`)
        .join('&');
    }

    /* eslint-disable camelcase */
    const queryParameters = {
      client_id: '7f368c6886429f19',
      code_challenge: 'aSOwsmuRBE1ZIVtiW6bzKMaf47kCFl7duD6ZWAXdnJo',
      code_challenge_method: 'S256',
      forceUA:
        'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Mobile Safari/537.36',

      keys_jwk:
        'eyJrdHkiOiJFQyIsImtpZCI6Im9DNGFudFBBSFZRX1pmQ09RRUYycTRaQlZYblVNZ2xISGpVRzdtSjZHOEEiLCJjcnYiOiJQLTI1NiIsIngiOiJDeUpUSjVwbUNZb2lQQnVWOTk1UjNvNTFLZVBMaEg1Y3JaQlkwbXNxTDk0IiwieSI6IkJCWDhfcFVZeHpTaldsdXU5MFdPTVZwamIzTlpVRDAyN0xwcC04RW9vckEifQ',
      redirect_uri: 'https://mozilla.github.io/notes/fxa/android-redirect.html',
      scope: 'profile https://identity.mozilla.com/apps/notes',
    };
    /* eslint-enable camelcase */

    test('verified - invalid token', async ({
      page,
      pages: { configPage, login, relier, signinTokenCode },
      testAccountTracker,
    }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.showReactApp.signInRoutes === true,
        'FXA-9519, react page shows a tooltip error and does not redirect when session token is destroyed'
      );

      // The `sync` prefix is needed to force confirmation.
      const credentials = await testAccountTracker.signUpSync();

      await relier.goto(toQueryString(queryParameters));
      // Click the Email First flow, which should direct to the sign in page
      await relier.clickEmailFirst();
      // Enter email, then enter password
      await login.fillOutEmailFirstSignIn(
        credentials.email,
        credentials.password
      );

      // Check that the sign in page is show, and is asking for a sign in code
      await expect(signinTokenCode.tokenCodeHeader).toBeVisible();

      // This will cause the token become 'invalid' and ultimately cause an
      // INVALID_TOKEN error to be thrown.
      await login.destroySession(credentials.email);

      // Destroying the session should direct user back to sign in page
      await expect(page).toHaveURL(/oauth\/signin/);
      await expect(login.passwordHeader).toBeVisible();
    });

    test('verified - valid code', async ({
      target,
      pages: { page, signinReact, relier, signinTokenCode },
      testAccountTracker,
    }) => {
      test.fixme(true, 'FXA-9519 authentication token error on resend code');
      // The `sync` prefix is needed to force confirmation.
      const credentials = await testAccountTracker.signUpSync();

      await relier.goto(toQueryString(queryParameters));
      // Click the Email First flow, which should direct to the sign in page
      await relier.clickEmailFirst();
      // Enter email, then enter password
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);

      await expect(signinTokenCode.heading).toBeVisible();
      // Enter invalid code, ensure it doesn't work
      await signinTokenCode.fillOutCodeForm('000000');

      await expect(
        page.getByText('Invalid or expired confirmation code')
      ).toBeVisible();

      // Resend the code
      await signinTokenCode.resendButton.click();

      await expect(signinTokenCode.successMessage).toBeVisible();
      await expect(signinTokenCode.successMessage).toContainText(
        /Email re-?sent/
      );
      // Correctly submits the token code and navigates to oauth page
      await expect(signinTokenCode.tokenCodeHeader).toBeVisible();

      const code = await target.emailClient.getSigninTokenCode(
        credentials.email
      );
      await signinTokenCode.fillOutCodeForm(code);

      await expect(page).toHaveURL(/notes\/fxa\//);
      await expect(
        page.getByRole('heading', { name: 'Notes by Firefox' })
      ).toBeVisible();
    });
  });
});
