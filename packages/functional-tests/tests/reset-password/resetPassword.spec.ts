import { test, expect } from '../../lib/fixtures/standard';
import { EmailHeader, EmailType } from '../../lib/email';

const NEW_PASSWORD = 'passwordzxcv';

test.describe('Reset password current', () => {
  test.beforeEach(async () => {
    test.slow();
  });

  test('can reset password', async ({
    page,
    target,
    credentials,
    context,
    pages: { login, resetPassword, settings },
  }) => {
    await page.goto(`${target.contentServerUrl}/reset_password`);

    // Verify backbone page has been loaded
    await page.waitForSelector('#stage');

    await resetPassword.fillOutResetPassword(credentials.email);

    // Verify confirm password reset page has rendered
    expect(await resetPassword.confirmResetPasswordHeader()).toBe(true);

    const link = await target.email.waitForEmail(
      credentials.email,
      EmailType.recovery,
      EmailHeader.link
    );

    // Open link in a new window
    const diffPage = await context.newPage();
    await diffPage.goto(link);

    // Loads the backbone version
    expect(await diffPage.locator('#stage').isEnabled()).toBe(true);
    expect(await resetPassword.hasCompleteResetPasswordHeading(diffPage)).toBe(
      true
    );

    await resetPassword.resetNewPassword(NEW_PASSWORD, diffPage);

    expect(
      await page
        .getByRole('heading', { name: 'Settings', level: 2 })
        .isEnabled()
    ).toBe(true);

    expect(
      await diffPage
        .getByRole('heading', { name: 'Settings', level: 2 })
        .isEnabled()
    ).toBe(true);

    await diffPage.close();
    await settings.signOut();

    // Verify that new password can be used to log in
    await login.setEmail(credentials.email);
    await login.submit();
    await login.setPassword(NEW_PASSWORD);
    await login.submit();

    expect(
      await page
        .getByRole('heading', { name: 'Settings', level: 2 })
        .isEnabled()
    ).toBe(true);

    // Cleanup requires setting this value to correct password
    credentials.password = NEW_PASSWORD;
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
