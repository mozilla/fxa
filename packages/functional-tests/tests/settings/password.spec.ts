import { test, expect } from '../../lib/fixtures/standard';
import { EmailHeader, EmailType } from '../../lib/email';

test.describe('severity-1 #smoke', () => {
  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293389
  test('forgot password #1293389', async ({
    target,
    credentials,
    page,
    pages: { settings, login },
  }, { project }) => {
    test.slow(project.name !== 'local', 'email delivery can be slow');
    await page.goto(target.contentServerUrl + '/reset_password', {
      waitUntil: 'networkidle',
    });
    await login.setEmail(credentials.email);
    await login.submit();
    const link = await target.email.waitForEmail(
      credentials.email,
      EmailType.recovery,
      EmailHeader.link
    );
    await page.goto(link, { waitUntil: 'networkidle' });
    await login.setNewPassword(credentials.password);
    expect(page.url()).toMatch(settings.url);
  });

  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293431
  test('forgot password has account recovery key but skip using it #1293431', async ({
    target,
    credentials,
    page,
    pages: { settings, login, recoveryKey },
  }, { project }) => {
    test.slow(project.name !== 'local', 'email delivery can be slow');
    await settings.goto();
    await settings.recoveryKey.clickCreate();
    await recoveryKey.setPassword(credentials.password);
    await recoveryKey.submit();
    await settings.signOut();

    await page.goto(target.contentServerUrl + '/reset_password', {
      waitUntil: 'networkidle',
    });
    await login.setEmail(credentials.email);
    await login.submit();
    const link = await target.email.waitForEmail(
      credentials.email,
      EmailType.recovery,
      EmailHeader.link
    );
    await page.goto(link, { waitUntil: 'networkidle' });
    await login.clickDontHaveRecoveryKey();
    await login.setNewPassword(credentials.password);
    await settings.waitForAlertBar();
    const status = await settings.recoveryKey.statusText();
    expect(status).toEqual('Not Set');
  });
});

test.describe('password strength tests', () => {
  test.beforeEach(async ({ target, credentials, page, pages: { login } }) => {
    const email = login.createEmail();
    await page.goto(target.contentServerUrl, { waitUntil: 'networkidle' });
    credentials.email = email;

    //Enter email at email first and then goto the sign up page
    await login.setEmail(credentials.email);
    await login.submit();
  });

  test('test different password errors and success', async ({
    credentials,
    pages: { login },
  }) => {
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
