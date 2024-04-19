/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  test,
  expect,
  PASSWORD,
  SYNC_EMAIL_PREFIX,
} from '../../lib/fixtures/standard';

const CODE_CHALLENGE = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';
const CODE_CHALLENGE_METHOD = 'S256';

test.describe('OAuth scopeKeys', () => {
  test.use({
    emailOptions: [{ prefix: SYNC_EMAIL_PREFIX, password: PASSWORD }],
  });

  test('signin in Chrome for Android, verify same browser', async ({
    target,
    page,
    pages: { login },
    emails,
  }) => {
    const [email] = emails;
    const query = new URLSearchParams({
      client_id: '7f368c6886429f19', // eslint-disable-line camelcase
      code_challenge: CODE_CHALLENGE,
      code_challenge_method: CODE_CHALLENGE_METHOD,
      forceUA:
        'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Mobile Safari/537.36',
      // eslint-disable-next-line camelcase
      keys_jwk:
        'eyJrdHkiOiJFQyIsImtpZCI6Im9DNGFudFBBSFZRX1pmQ09RRUYycTRaQlZYblVNZ2xISGpVRzdtSjZHOEEiLCJjcnYiOi' +
        'JQLTI1NiIsIngiOiJDeUpUSjVwbUNZb2lQQnVWOTk1UjNvNTFLZVBMaEg1Y3JaQlkwbXNxTDk0IiwieSI6IkJCWDhfcFVZeHpTaldsdX' +
        'U5MFdPTVZwamIzTlpVRDAyN0xwcC04RW9vckEifQ',
      redirect_uri: 'https://mozilla.github.io/notes/fxa/android-redirect.html', // eslint-disable-line camelcase
      scope: 'profile https://identity.mozilla.com/apps/notes',
      state: 'fakestate',
    });

    await target.createAccount(email, PASSWORD);
    await page.goto(target.contentServerUrl + `/?${query.toString()}`);
    await login.login(email, PASSWORD);
    await login.fillOutSignInCode(email);

    await expect(login.notesHeader).toBeVisible();
  });
});
