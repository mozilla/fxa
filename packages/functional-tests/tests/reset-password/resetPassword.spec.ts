import { test, expect } from '../../lib/fixtures/standard';

test.describe('Reset password current', () => {
  test.beforeEach(async ({ target, credentials, pages: { login } }) => {
    test.slow();
  });

  test('visit confirmation screen without initiating reset_password, user is redirected to /reset_password', async ({
    target,
    page,
    pages: { resetPassword },
  }) => {
    await page.goto(
      `${target.contentServerUrl}/confirm_reset_password?showReactApp=false`
    );

    // Verify its redirected to reset password page
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

  test('enter an email with leading/trailing whitespace', async ({
    credentials,
    target,
    page,
    pages: { login, resetPassword },
  }) => {
    await page.goto(`${target.contentServerUrl}/reset_password`);
    await resetPassword.fillOutResetPassword(' ' + credentials.email);
    expect(await resetPassword.confirmResetPasswordHeader()).toBe(true);

    await page.goto(`${target.contentServerUrl}/reset_password`);
    await resetPassword.fillOutResetPassword(credentials.email + ' ');
    expect(await resetPassword.confirmResetPasswordHeader()).toBe(true);
  });

  test('open confirm_reset_password page, click resend', async ({
    credentials,
    target,
    page,
    pages: { resetPassword },
  }) => {
    await page.goto(`${target.contentServerUrl}/reset_password`);
    await resetPassword.fillOutResetPassword(credentials.email);
    await resetPassword.clickResend();
    expect(await resetPassword.resendSuccessMessage()).toContain(
      'Email resent. Add accounts@firefox.com to your contacts to ensure a smooth delivery.'
    );
  });

  test('open /reset_password page, enter unknown email, wait for error', async ({
    target,
    page,
    pages: { login, resetPassword },
  }) => {
    await page.goto(`${target.contentServerUrl}/reset_password`);
    await login.setEmail('email@restmail.net');
    await resetPassword.clickBeginReset();
    expect(await resetPassword.unknownAccountError()).toContain(
      'Unknown account.'
    );
  });

  test('browse directly to page with email on query params', async ({
    credentials,
    target,
    page,
    pages: { resetPassword },
  }) => {
    const url = `${target.contentServerUrl}/reset_password?email=${credentials.email}`;
    await page.goto(url);

    //The email shouldn't be pre-filled
    expect(await resetPassword.getEmailValue()).toBeEmpty();
    await resetPassword.fillOutResetPassword(credentials.email);
    expect(await resetPassword.confirmResetPasswordHeader()).toBe(true);
  });
});
