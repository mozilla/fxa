import { test, expect } from '../../lib/fixtures/standard';

test.describe('OAuth and Fx Desktop handshake', () => {
  test('user signed into browser and OAuth login', async ({
    target,
    page,
    credentials,
    pages: { login, relier },
  }) => {
    await page.goto(
      target.contentServerUrl +
        '?context=fx_desktop_v3&entrypoint=fxa%3Aenter_email&service=sync&action=email'
    );
    await login.login(credentials.email, credentials.password);

    await relier.goto();
    await relier.clickEmailFirst();

    // User can sign in with cached credentials, no password needed.
    await expect(await login.getPrefilledEmail()).toMatch(credentials.email);
    await expect(await login.isCachedLogin()).toBe(true);
    await login.submit();
    await relier.isLoggedIn();

    await relier.signOut();

    // Attempt to sign back in
    await relier.goto();
    await relier.clickEmailFirst();
    await expect(await login.getPrefilledEmail()).toMatch(credentials.email);
    await expect(await login.isCachedLogin()).toBe(true);
    await login.submit();
    await relier.isLoggedIn();
  });
});
