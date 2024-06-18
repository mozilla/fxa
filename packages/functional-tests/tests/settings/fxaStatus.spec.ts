/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';
import { oauthWebchannelV1 } from '../../lib/query-params';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { SigninPage } from '../../pages/signin';

test.describe('fxa_status web channel message in Settings', () => {
  test.beforeEach(async ({ pages: { configPage } }) => {
    // Ensure that the feature flag is enabled
    const config = await configPage.getConfig();
    test.skip(config.featureFlags.sendFxAStatusOnSettings !== true);
  });

  test('message is sent when loading with context = oauth_webchannel_v1', async ({
    target,
    syncBrowserPages: { connectAnotherDevice, page, settings, signin },
    testAccountTracker,
  }) => {
    await page.goto(
      `${target.contentServerUrl}/?context=fx_desktop_v3&service=sync`
    );
    const credentials = await signInAccount(signin, testAccountTracker);
    await expect(connectAnotherDevice.header).toBeVisible();

    await page.goto(target.contentServerUrl);
    await signin.useDifferentAccountLink.click();
    await signInAccount(signin, testAccountTracker);

    // We verify that even though another email is signed in, when
    // accessing the setting with a `context=oauth_webchannel_v1` the account
    // signed into the browser takes precedence
    await settings.goto(oauthWebchannelV1.toString());
    await expect(settings.primaryEmail.status).toHaveText(credentials.email);
  });

  test('message is not sent when loading without oauth web channel context', async ({
    target,
    syncBrowserPages: { connectAnotherDevice, page, settings, signin },
    testAccountTracker,
  }) => {
    await page.goto(
      `${target.contentServerUrl}/?context=fx_desktop_v3&service=sync`
    );
    await signInAccount(signin, testAccountTracker);
    await expect(connectAnotherDevice.header).toBeVisible();

    await page.goto(target.contentServerUrl);
    await signin.useDifferentAccountLink.click();
    const credentials = await signInAccount(signin, testAccountTracker);

    // We verify that when accessing settings without the `context=oauth_webchannel_v1`
    // the newer account takes precedence
    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.primaryEmail.status).toHaveText(credentials.email);
  });
});

async function signInAccount(
  signin: SigninPage,
  testAccountTracker: TestAccountTracker
) {
  const credentials = await testAccountTracker.signUp();
  await signin.fillOutEmailFirstForm(credentials.email);
  await signin.fillOutPasswordForm(credentials.password);

  return credentials;
}
