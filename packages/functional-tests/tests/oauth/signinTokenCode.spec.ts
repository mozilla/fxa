import { EmailHeader, EmailType } from '../../lib/email';
import { test, expect } from '../../lib/fixtures/standard';

test.describe('OAuth signin token code', () => {
  function toQueryString(obj) {
    return Object.entries(obj)
      .map((x) => `${x[0]}=${x[1]}`)
      .join('&');
  }

  /* Email for fake account */
  let email = '';

  /* Password for fake account */
  const password = 'passwordzxcv';

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

  test.beforeEach(async ({ target }, { project }) => {
    test.skip(project.name === 'production', 'doesnt work in prod currently');
    // The `sync` prefix is needed to force confirmation.
    email = `sync${Math.random()}@restmail.net`;
    await target.createAccount(email, password, {
      // Important, must set this to be directed to /sign_in_token_code page
      verificationMethod: 'email-otp',
    });
  });

  test('verified - invalid token', async ({
    page,
    pages: { login, relier, signinTokenCode },
  }) => {
    await relier.goto(toQueryString(queryParameters));

    // Click the Email First flow, which should direct to the sign in page
    await relier.clickEmailFirst();

    // Enter email, then enter password
    await login.fillOutEmailFirstSignIn(email, password);

    // Check that the sign in page is show, and is asking for a sign in code
    expect(await signinTokenCode.tokenCodeHeader.isVisible()).toBeTruthy();

    // This will cause the token become 'invalid' and ultimately cause an
    // INVALID_TOKEN error to be thrown.
    await login.destroySession(email);
    await page.waitForNavigation({ waitUntil: 'networkidle' });

    // Destroying the session should direct user back to sign in page
    expect(await login.passwordHeader.isVisible()).toBeTruthy();
  });

  test('verified - valid code', async ({
    target,
    page,
    pages: { login, relier, signinTokenCode },
  }) => {
    await relier.goto(toQueryString(queryParameters));

    // Click the Email First flow, which should direct to the sign in page
    await relier.clickEmailFirst();

    // Enter email, then enter password
    await login.fillOutEmailFirstSignIn(email, password);

    // Enter invalid code, ensure it doesn't work
    await signinTokenCode.input.fill('000000');
    await signinTokenCode.submit.click();
    await expect(signinTokenCode.tooltip).toContainText('Invalid or expired');

    // Resend the code
    await signinTokenCode.resendLink.click();
    await signinTokenCode.successMessage.waitFor({ state: 'visible' });
    await expect(signinTokenCode.successMessage).toBeVisible();
    await expect(signinTokenCode.successMessage).toContainText('Email resent.');

    // Correctly submits the token code and navigates to oauth page
    await expect(signinTokenCode.tokenCodeHeader).toBeVisible();

    const code = await target.email.waitForEmail(
      email,
      EmailType.verifyLoginCode,
      EmailHeader.signinCode
    );
    await signinTokenCode.input.fill(code);
    await signinTokenCode.submit.click();
    await page.waitForNavigation({ waitUntil: 'networkidle' });

    const NOTES_REDIRECT_PAGE_SELECTOR = '#notes-by-firefox';
    await expect(page.locator(NOTES_REDIRECT_PAGE_SELECTOR)).toBeVisible();
    await expect(page.locator(NOTES_REDIRECT_PAGE_SELECTOR)).toContainText(
      'Notes by Firefox'
    );
  });
});
