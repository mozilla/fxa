import { test, expect } from '../../lib/fixtures/standard';

const PASSWORD = 'passwordzxcv';
let email;

test.describe('Sign up with code ', () => {
  test.beforeEach(async ({ pages: { login } }) => {
    test.slow();
    email = login.createEmail();
    await login.clearCache();
  });

  test('bounced email', async ({ target, page, pages: { login } }) => {
    const client = await login.getFxaClient(target);
    await page.goto(`${target.contentServerUrl}`, {
      waitUntil: 'networkidle',
    });
    await login.fillOutFirstSignUp(email, PASSWORD);

    await client.accountDestroy(email, PASSWORD);
    expect(await login.isPasswordHeader()).toBe(true);
  });

  test('valid code then click back', async ({
    target,
    page,
    pages: { login, settings },
  }) => {
    await page.goto(`${target.contentServerUrl}`, {
      waitUntil: 'networkidle',
    });
    await login.fillOutFirstSignUp(email, PASSWORD);
    await page.waitForNavigation();
    await page.goBack({ waitUntil: 'networkidle' });
    expect(await login.loginHeader()).toBe(true);
  });

  test('invalid code', async ({
    target,
    page,
    pages: { login, signinTokenCode },
  }) => {
    await page.goto(`${target.contentServerUrl}`, {
      waitUntil: 'networkidle',
    });
    await login.fillOutFirstSignUp(email, PASSWORD, false);
    await login.setCode('1234');
    await signinTokenCode.clickSubmitButton();
    expect(await login.invalidCodeError()).toMatch(
      'Invalid or expired confirmation code'
    );
  });
});
