import { test, expect } from '../../lib/fixtures/standard';

const PASSWORD = 'passwordzxcv';

test.describe('OAuth `login_hint` and `email` param', () => {
  test('email specified by relier, invalid', async ({
    pages: { login, relier },
  }) => {
    const invalidEmail = 'invalid@';
    await relier.goto(`email=${invalidEmail}`);
    await relier.clickEmailFirst();
    const error = await login.getTooltipError();
    expect(error).toMatch('Valid email required');
  });

  test('login_hint specified by relier, not registered', async ({
    pages: { login, relier },
  }) => {
    const email = login.createEmail();
    await relier.goto(`login_hint=${email}`);
    await relier.clickEmailFirst();

    // Email is prefilled
    await expect(await login.getPrefilledEmail()).toEqual(email);
    expect(await login.signUpPasswordHeader()).toEqual(true);

    await login.useDifferentAccountLink();

    // Email first page has email input prefilled
    await expect(await login.getEmailInput()).toEqual(email);
  });

  test('email specified by relier, registered', async ({
    credentials,
    pages: { login, relier },
  }) => {
    await relier.goto(`email=${credentials.email}`);
    await relier.clickEmailFirst();

    // Email is prefilled
    await expect(await login.getPrefilledEmail()).toEqual(credentials.email);
    expect(await login.signInPasswordHeader()).toEqual(true);

    await login.useDifferentAccountLink();

    // Email first page has email input prefilled
    await expect(await login.getEmailInput()).toEqual(credentials.email);
  });

  test('login_hint specified by relier, registered', async ({
    credentials,
    pages: { login, relier },
  }) => {
    await relier.goto(`login_hint=${credentials.email}`);
    await relier.clickEmailFirst();

    // Email is prefilled
    await expect(await login.getPrefilledEmail()).toEqual(credentials.email);
    expect(await login.signInPasswordHeader()).toEqual(true);

    await login.useDifferentAccountLink();

    // Email first page has email input prefilled
    await expect(await login.getEmailInput()).toEqual(credentials.email);
  });

  test('cached credentials, login_hint specified by relier', async ({
    target,
    pages: { login, relier },
  }) => {
    const email = login.createEmail();
    await target.auth.signUp(email, PASSWORD, {
      lang: 'en',
      preVerified: 'true',
    });

    const loginHintEmail = login.createEmail();
    await target.auth.signUp(loginHintEmail, PASSWORD, {
      lang: 'en',
      preVerified: 'true',
    });

    // Create a cached login
    await relier.goto();
    await relier.clickEmailFirst();
    await login.login(email, PASSWORD);
    expect(await relier.isLoggedIn()).toBe(true);
    await relier.signOut();

    // login_hint takes precedence over the signed-in user
    await relier.goto(`login_hint=${loginHintEmail}`);
    await relier.clickEmailFirst();

    // Email is prefilled
    await expect(await login.getPrefilledEmail()).toEqual(loginHintEmail);
    expect(await login.signInPasswordHeader()).toEqual(true);

    await login.useDifferentAccountLink();

    // Email first page has email input prefilled
    await expect(await login.getEmailInput()).toEqual(loginHintEmail);
  });
});
