import { test, expect } from '../../lib/fixtures/standard';

test.describe('OAuth totp', () => {
  test.beforeEach(async () => {
    test.slow();
  });

  test('can add TOTP to account and confirm oauth signin', async ({
    credentials,
    pages: { login, relier, settings, totp },
  }) => {
    await settings.goto();
    await settings.totp.clickAdd();
    await totp.enable(credentials);
    await settings.signOut();

    await relier.goto();
    await relier.clickEmailFirst();
    await login.login(credentials.email, credentials.password);
    await login.setTotp(credentials.secret);

    expect(await relier.isLoggedIn()).toBe(true);
  });

  test('can remove TOTP from account and skip confirmation', async ({
    credentials,
    pages: { login, relier, settings, totp },
  }) => {
    await settings.goto();
    await settings.totp.clickAdd();
    await totp.enable(credentials);

    await settings.totp.clickDisable();
    await settings.clickModalConfirm();
    await settings.waitForAlertBar();
    let status = await settings.totp.statusText();
    expect(status).toEqual('Not Set');

    await relier.goto();
    await relier.clickEmailFirst();
    await login.login(credentials.email, credentials.password);

    expect(await relier.isLoggedIn()).toBe(true);
  });
});
