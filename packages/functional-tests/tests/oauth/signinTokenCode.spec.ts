/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
      pages: { login, relier, signinTokenCode },
      testAccountTracker,
    }) => {
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
      pages: { login, relier, signinTokenCode },
      testAccountTracker,
    }) => {
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
      // Enter invalid code, ensure it doesn't work
      await signinTokenCode.input.fill('000000');
      await signinTokenCode.submit.click();

      await expect(signinTokenCode.tooltip).toContainText('Invalid or expired');

      // Resend the code
      await signinTokenCode.resendLink.click();

      await expect(signinTokenCode.successMessage).toBeVisible();
      await expect(signinTokenCode.successMessage).toContainText(
        /Email re-?sent/
      );
      // Correctly submits the token code and navigates to oauth page
      await expect(signinTokenCode.tokenCodeHeader).toBeVisible();

      const code = await target.emailClient.getVerifyLoginCode(
        credentials.email
      );
      await signinTokenCode.input.fill(code);
      await signinTokenCode.submit.click();

      await expect(login.notesHeader).toContainText('Notes by Firefox');
    });
  });
});
