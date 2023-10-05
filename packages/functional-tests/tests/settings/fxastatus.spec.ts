import { test, expect, newPagesForSync } from '../../lib/fixtures/standard';

const password = 'passwordzxcv';
let syncBrowserPages;
let browserEmail;
let otherEmail;

test.describe.configure({ mode: 'parallel' });

test.describe('fxa status web channel message in settings page', () => {
  test.beforeEach(async ({ target }) => {
    test.slow();
    syncBrowserPages = await newPagesForSync(target);
    const { login } = syncBrowserPages;
    browserEmail = login.createEmail();
    await target.auth.signUp(browserEmail, password, {
      lang: 'en',
      preVerified: 'true',
    });
    otherEmail = login.createEmail();
    await target.auth.signUp(otherEmail, password, {
      lang: 'en',
      preVerified: 'true',
    });
    // First we sign the browser into an account
    await login.goto('load', 'context=fx_desktop_v3&service=sync');
    await login.fillOutEmailFirstSignIn(browserEmail, password);
    // Then, we sign the content into a **different** account
    await login.goto();
    await login.useDifferentAccountLink();
    await login.fillOutEmailFirstSignIn(otherEmail, password);
  });

  test.afterEach(async ({ target }) => {
    await syncBrowserPages.browser?.close();
    // Cleanup any accounts created during the test
    try {
      await target.auth.accountDestroy(browserEmail, password);
      await target.auth.accountDestroy(otherEmail, password);
    } catch (e) {
      // Log the error here
      console.error('An error occurred during account cleanup:', e);
      // Then rethrow the error to propagate it further
      throw e;
    }
  });
  test.only('message is sent when loading with context = oauth_webchannel_v1', async () => {
    const { settings } = syncBrowserPages;

    // We verify that even though another email is signed in, when
    // accessing the setting with a `context=oauth_webchannel_v1` the account
    // signed into the browser takes precedence
    await settings.goto('context=oauth_webchannel_v1');
    expect(await settings.primaryEmail.statusText()).toBe(browserEmail);
  });

  test.only('message is not sent when loading without oauth web chanel context', async () => {
    const { settings } = syncBrowserPages;

    // We verify that when accessing the setting without the `context=oauth_webchannel_v1`
    // the newer account takes precedence
    await settings.goto();
    expect(await settings.primaryEmail.statusText()).toBe(otherEmail);
  });
});
