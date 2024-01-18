/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';
import { EmailHeader, EmailType } from '../../lib/email';

test.describe('severity-1 #smoke', () => {
  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293389
  test('forgot password #1293389', async ({
    target,
    credentials,
    page,
    pages: { configPage, login, resetPasswordReact, settings },
  }, { project }) => {
    test.slow(project.name !== 'local', 'email delivery can be slow');
    const config = await configPage.getConfig();
    await page.goto(target.contentServerUrl + '/reset_password', {
      waitUntil: 'load',
    });
    if (config.showReactApp.resetPasswordRoutes === true) {
      await resetPasswordReact.fillEmailToResetPwd(credentials.email);
      const link = await target.email.waitForEmail(
        credentials.email,
        EmailType.recovery,
        EmailHeader.link
      );
      await page.goto(link, { waitUntil: 'load' });
      await resetPasswordReact.submitNewPassword(credentials.password);
      // TODO: React reset PW does not currently take users to Settings, FXA-8266
      await resetPasswordReact.resetPwdConfirmedHeadingVisible();
    } else {
      await login.setEmail(credentials.email);
      await login.clickSubmit();
      const link = await target.email.waitForEmail(
        credentials.email,
        EmailType.recovery,
        EmailHeader.link
      );
      await page.goto(link, { waitUntil: 'load' });
      await login.setNewPassword(credentials.password);
      await settings.waitForAlertBar();
    }
  });

  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293431
  test('forgot password has account recovery key but skip using it #1293431', async ({
    target,
    credentials,
    page,
    pages: { settings, login, configPage, recoveryKey, resetPasswordReact },
  }, { project }) => {
    test.slow(project.name !== 'local', 'email delivery can be slow');
    const config = await configPage.getConfig();

    await settings.goto();
    let status = await settings.recoveryKey.statusText();
    expect(status).toEqual('Not Set');

    await settings.recoveryKey.clickCreate();
    // View 1/4 info
    await recoveryKey.clickStart();
    // View 2/4 confirm password and generate key
    await recoveryKey.setPassword(credentials.password);
    await recoveryKey.submit();

    // See download key page but click next without saving the key
    await recoveryKey.clickNext();

    // See hint page but finish the flow without saving a hint
    await recoveryKey.clickFinish();

    // Verify status as 'enabled'
    status = await settings.recoveryKey.statusText();
    expect(status).toEqual('Enabled');

    await page.goto(target.contentServerUrl + '/reset_password', {
      waitUntil: 'load',
    });
    if (config.showReactApp.resetPasswordRoutes === true) {
      await resetPasswordReact.fillEmailToResetPwd(credentials.email);
      const link = await target.email.waitForEmail(
        credentials.email,
        EmailType.recovery,
        EmailHeader.link
      );
      await page.goto(link, { waitUntil: 'load' });
      await resetPasswordReact.clickDontHaveRecoveryKey();
      await resetPasswordReact.submitNewPassword(credentials.password);
      // TODO: React reset PW does not currently take users to Settings, FXA-8266
      await resetPasswordReact.resetPwdConfirmedHeadingVisible();
      await settings.goto();
    } else {
      await login.setEmail(credentials.email);
      await login.clickSubmit();
      const link = await target.email.waitForEmail(
        credentials.email,
        EmailType.recovery,
        EmailHeader.link
      );
      await page.goto(link, { waitUntil: 'load' });
      await login.clickDontHaveRecoveryKey();
      await login.setNewPassword(credentials.password);
      await settings.waitForAlertBar();
    }

    status = await settings.recoveryKey.statusText();
    expect(status).toEqual('Not Set');
  });
});

test.describe('password strength tests', () => {
  test.beforeEach(async ({ target, credentials, page, pages: { login } }) => {
    const email = login.createEmail();
    await page.goto(target.contentServerUrl, { waitUntil: 'load' });
    credentials.email = email;

    //Enter email at email first and then goto the sign up page
    await login.setEmail(credentials.email);
    await login.submit();
  });

  test('test different password errors and success', async ({
    credentials,
    pages: { configPage, login },
  }) => {
    const config = await configPage.getConfig();
    test.skip(
      config.showReactApp.signUpRoutes === true,
      'password errors and success tests were converted to unit tests in PasswordStrengthBalloon component'
    );
    //Submit without providing a password
    await login.submitButton.click();

    //Verify the error
    expect(await login.minLengthFailError()).toBe(true);
    expect(await login.notEmailUnmetError()).toBe(true);
    expect(await login.notCommonPasswordUnmetError()).toBe(true);

    //Submit a short password
    await login.setPassword('p');
    await login.submitButton.click();

    //Verify the error
    expect(await login.minLengthFailError()).toBe(true);
    expect(await login.notEmailUnmetError()).toBe(true);
    expect(await login.notCommonPasswordUnmetError()).toBe(true);

    //Submit a common password
    await login.setPassword('password');
    await login.submitButton.click();

    //Verify the error
    expect(await login.minLengthSuccess()).toBe(true);
    expect(await login.notEmailSuccess()).toBe(true);
    expect(await login.notCommonPasswordFailError()).toBe(true);

    //Submit password same as email
    await login.setPassword(credentials.email);
    await login.submitButton.click();

    //Verify the error
    expect(await login.minLengthSuccess()).toBe(true);
    expect(await login.notEmailFailError()).toBe(true);
    expect(await login.notCommonPasswordUnmetError()).toBe(true);

    //Submit password same as local part of email
    const newEmail = credentials.email.split('@')[0];
    await login.setPassword(newEmail);
    await login.submitButton.click();

    //Verify the error
    expect(await login.minLengthSuccess()).toBe(true);
    expect(await login.notEmailFailError()).toBe(true);
    expect(await login.notCommonPasswordUnmetError()).toBe(true);

    //Submit a common password
    await login.setPassword('password123123');
    await login.submitButton.click();

    //Verify the success message
    expect(await login.minLengthSuccess()).toBe(true);
    expect(await login.notEmailSuccess()).toBe(true);
    expect(await login.notCommonPasswordSuccess()).toBe(true);
  });
});
