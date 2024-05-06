/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';
import { oauthWebchannelV1 } from '../../lib/query-params';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { LoginPage } from '../../pages/login';

test.describe.configure({ mode: 'parallel' });

test.describe('fxa_status web channel message in Settings', () => {
  test.beforeEach(async ({ pages: { configPage } }) => {
    // Ensure that the feature flag is enabled
    const config = await configPage.getConfig();
    test.skip(config.featureFlags.sendFxAStatusOnSettings !== true);
    test.slow();
  });

  test('message is sent when loading with context = oauth_webchannel_v1', async ({
    syncBrowserPages: { page, login, settings },
    testAccountTracker,
  }) => {
    const credentials = await signInAccount(testAccountTracker, login);
    await signInDifferentAccount(testAccountTracker, login);

    // We verify that even though another email is signed in, when
    // accessing the setting with a `context=oauth_webchannel_v1` the account
    // signed into the browser takes precedence
    await settings.goto(oauthWebchannelV1.toString());
    await expect(settings.primaryEmail.status).toHaveText(credentials.email);
  });

  test('message is not sent when loading without oauth web channel context', async ({
    syncBrowserPages: { login, settings },
    testAccountTracker,
  }) => {
    await signInAccount(testAccountTracker, login);
    const otherCredentials = await signInDifferentAccount(
      testAccountTracker,
      login
    );

    // We verify that when accessing the setting without the `context=oauth_webchannel_v1`
    // the newer account takes precedence
    await settings.goto();
    await expect(settings.primaryEmail.status).toHaveText(
      otherCredentials.email
    );
  });
});

async function signInAccount(
  testAccountTracker: TestAccountTracker,
  login: LoginPage
) {
  const credentials = await testAccountTracker.signUp();
  await login.goto('load', 'context=fx_desktop_v3&service=sync');
  await login.fillOutEmailFirstSignIn(credentials.email, credentials.password);
  return credentials;
}

async function signInDifferentAccount(
  testAccountTracker: TestAccountTracker,
  login: LoginPage
) {
  const otherCredentials = await testAccountTracker.signUp();
  await login.goto();
  await login.useDifferentAccountLink();
  await login.fillOutEmailFirstSignIn(
    otherCredentials.email,
    otherCredentials.password
  );
  return otherCredentials;
}
