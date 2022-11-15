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
  test.beforeEach(async ({ target, page, pages: { login } }, { project }) => {
    test.slow(project.name !== 'local', 'email delivery can be slow');
    const email = login.createEmail('sync{id}');
    await page.goto(
      `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`,
      { waitUntil: 'networkidle' }
    );
    await login.setEmail(email);
    await login.submit();
  });

  test.only('submit w/o password', async ({ pages: { login } }) => {
    //Submit without providing a password
    await login.submitButton.click();
  });
});
