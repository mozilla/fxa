import { test, expect } from '../../lib/fixtures/standard';
import { EmailHeader, EmailType } from '../../lib/email';

const PASSWORD = 'passwordzxcv';
let email;

test.describe('Reset password ', () => {
  test.beforeEach(async ({ target, credentials, pages: { login } }) => {
    test.slow();
    email = login.createEmail();
    await target.auth.signUp(email, PASSWORD, {
      lang: 'en',
      preVerified: 'true',
    });
    await login.clearCache();
  });

  test('visit confirmation screen without initiating reset_password, user is redirected to /reset_password', async ({
    target,
    page,
    pages: { resetPassword },
  }) => {
    await page.goto(`${target.contentServerUrl}/confirm_reset_password`, {
      waitUntil: 'networkidle',
    });

    //Verify its redirected to reset password page
    expect(await resetPassword.resetPasswordHeader()).toBe(true);
  });

  test('open /reset_password page from /signin', async ({
    credentials,
    pages: { login },
  }) => {
    await login.goto();
    await login.setEmail(credentials.email);
    await login.submit();
    await login.clickForgotPassword();
  });

  test('enter an email with leading whitespace', async ({
    target,
    page,
    pages: { login, resetPassword },
  }) => {
    await page.goto(`${target.contentServerUrl}/reset_password`, {
      waitUntil: 'networkidle',
    });
    await resetPassword.fillOutResetPassword(' ' + email);
    expect(await resetPassword.confirmResetPasswordHeader()).toBe(true);
  });

  test('enter an email with trailing whitespace', async ({
    target,
    page,
    pages: { resetPassword },
  }) => {
    await page.goto(`${target.contentServerUrl}/reset_password`, {
      waitUntil: 'networkidle',
    });
    await resetPassword.fillOutResetPassword(email + ' ');
    expect(await resetPassword.confirmResetPasswordHeader()).toBe(true);
  });

  test('open confirm_reset_password page, click resend', async ({
    target,
    page,
    pages: { resetPassword },
  }) => {
    await page.goto(`${target.contentServerUrl}/reset_password`, {
      waitUntil: 'networkidle',
    });
    await resetPassword.fillOutResetPassword(email);
    await resetPassword.clickResend();
    expect(await resetPassword.resendSuccessMessage()).toMatch(
      'Email resent. Add accounts@firefox.com to your contacts to ensure a smooth delivery.'
    );
  });

  test('open /reset_password page, enter unknown email, wait for error', async ({
    target,
    page,
    pages: { login, resetPassword },
  }) => {
    await page.goto(`${target.contentServerUrl}/reset_password`, {
      waitUntil: 'networkidle',
    });
    await login.setEmail('email@restmail.com');
    await resetPassword.clickBeginReset();
    expect(await resetPassword.unknownAccountError()).toMatch(
      'Unknown account.'
    );
  });

  test('browse directly to page with email on query params', async ({
    target,
    page,
    pages: { resetPassword },
  }) => {
    const url = `${target.contentServerUrl}/reset_password` + '?email=' + email;
    await page.goto(url, {
      waitUntil: 'networkidle',
    });

    //The email shouldn't be pre-filled
    expect(resetPassword.getEmailValue()).toBeEmpty();
    await resetPassword.fillOutResetPassword(email);
    expect(await resetPassword.confirmResetPasswordHeader()).toBe(true);
  });
});
