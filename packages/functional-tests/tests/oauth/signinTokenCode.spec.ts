/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

test.describe('severity-2 #smoke', () => {
  test.describe('OAuth signin token code', () => {
    function toQueryString(obj: Record<string, any>) {
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

    test('verified - valid code', async ({
      target,
      pages: { page, signin, relier, signinTokenCode },
      testAccountTracker,
    }) => {
      // The `sync` prefix is needed to force confirmation.
      const credentials = await testAccountTracker.signUpSync();

      await relier.goto(toQueryString(queryParameters));
      await relier.clickEmailFirst();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      await expect(page).toHaveURL(/signin_token_code/);

      const code = await target.emailClient.getVerifyLoginCode(
        credentials.email
      );
      await signinTokenCode.fillOutCodeForm(code);

      await expect(page).toHaveURL(/notes\/fxa/);
    });

    test('verified - invalid code', async ({
      pages: { page, signin, relier, signinTokenCode },
      testAccountTracker,
    }) => {
      // The `sync` prefix is needed to force confirmation.
      const credentials = await testAccountTracker.signUpSync();

      await relier.goto(toQueryString(queryParameters));
      await relier.clickEmailFirst();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      // Enter invalid code, ensure it doesn't work
      await expect(page).toHaveURL(/signin_token_code/);
      await signinTokenCode.fillOutCodeForm('123456');

      await expect(page.getByText(/Invalid or expired/)).toBeVisible();
    });

    test('verified - resend code', async ({
      target,
      pages: { page, signin, relier, signinTokenCode },
      testAccountTracker,
    }) => {
      // The `sync` prefix is needed to force confirmation.
      const credentials = await testAccountTracker.signUpSync();

      await relier.goto(toQueryString(queryParameters));

      await relier.clickEmailFirst();

      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      await expect(page).toHaveURL(/signin_token_code/);
      // retrieve the first code and delete the email
      let code = await target.emailClient.getVerifyLoginCode(credentials.email);

      await expect(signinTokenCode.resendCodeButton).toBeVisible();
      await signinTokenCode.resendCodeButton.click();

      await expect(
        page.getByText(/A new code was sent to your email./)
      ).toBeVisible();

      // Retrieves the code from the new email
      code = await target.emailClient.getVerifyLoginCode(credentials.email);
      await signinTokenCode.fillOutCodeForm(code);

      await expect(page).toHaveURL(/notes\/fxa/);
    });

    test('verified - token is always required', async ({
      target,
      pages: { page, signin, relier, signinTokenCode },
      testAccountTracker,
    }) => {
      // The `sync` prefix is needed to force confirmation.
      const credentials = await testAccountTracker.signUpSync();

      await relier.goto(toQueryString(queryParameters));
      await relier.clickEmailFirst();

      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      await expect(page).toHaveURL(/signin_token_code/);

      // retrieve the first code and delete the email
      let code = await target.emailClient.getVerifyLoginCode(credentials.email);

      // Go back to sign in page.
      page.goBack();

      // Enter the wrong password
      await signin.fillOutPasswordForm(credentials.password + 'x');
      await expect(page).toHaveURL(/signin/);

      // Enter the right password
      await signin.fillOutPasswordForm(credentials.password);
      await expect(page).toHaveURL(/signin_token_code/);

      // Retrieves the code from the new email
      code = await target.emailClient.getVerifyLoginCode(credentials.email);
      await signinTokenCode.fillOutCodeForm(code);

      await expect(page).toHaveURL(/notes\/fxa/);
    });
  });
});
