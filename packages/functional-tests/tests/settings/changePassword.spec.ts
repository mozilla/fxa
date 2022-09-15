import { test, expect } from '../../lib/fixtures/standard';
import { EmailHeader, EmailType } from '../../lib/email';

test.describe('severity-1 #smoke', () => {
  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293385
  test('change password with an incorrect password', async ({
    pages: { settings, changePassword, login },
    credentials, page,
  }) => {
    const newPassword = credentials.password + '@@2';
    await settings.goto();
    await settings.password.clickChange();

    // Enter incorrect old password and verify the tooltip error
    await changePassword.fillOutChangePassword('Incorrect Password', newPassword);
    expect(await changePassword.changePasswordTooltip()).toMatch('Incorrect password');

    // Enter the correct old password and verify that chnage password is succesful
    //await changePassword.fillOutChangePassword(credentials.password, newPassword);
    //await page.fill('[data-testid=current-password-input-field]', '');
    //await changePassword.setCurrentPassword(credentials.password);
    await page.fill('[data-testid=current-password-input-field]', credentials.password);
    //await page.pause();
    //await page.locator('button[type=submit]').click();
    await changePassword.submit();

    // Sign out and login with new password
    await settings.signOut();
    credentials.password = newPassword;
    await login.setEmail(credentials.email);
    await page.locator('button[type=submit]').click();
    await login.setPassword(credentials.password);
    await login.submit();
    const primaryEmail = await settings.primaryEmail.statusText();
    expect(primaryEmail).toEqual(credentials.email);
  });
});
