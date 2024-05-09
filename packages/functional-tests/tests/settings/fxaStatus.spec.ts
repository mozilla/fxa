/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { oauthWebchannelV1 } from '../../lib/query-params';
import { BaseTarget } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { ConnectAnotherDevicePage } from '../../pages/connectAnotherDevice';
import { SettingsPage } from '../../pages/settings';
import { SigninReactPage } from '../../pages/signinReact';

test.describe('fxa_status web channel message in Settings', () => {
  test.beforeEach(async ({ pages: { configPage } }) => {
    // Ensure that the feature flag is enabled
    const config = await configPage.getConfig();
    test.skip(config.featureFlags.sendFxAStatusOnSettings !== true);
    test.slow();
  });

  test('message is sent when loading with context = oauth_webchannel_v1', async ({
    syncBrowserPages: { connectAnotherDevice, page, signinReact, settings },
    target,
    testAccountTracker,
  }) => {
    const credentials = await signInAccount(
      connectAnotherDevice,
      page,
      signinReact,
      target,
      testAccountTracker
    );
    await signInDifferentAccount(settings, signinReact, testAccountTracker);

    // We verify that even though another email is signed in, when
    // accessing the setting with a `context=oauth_webchannel_v1` the account
    // signed into the browser takes precedence
    await settings.goto(oauthWebchannelV1.toString());
    await expect(settings.primaryEmail.status).toHaveText(credentials.email);
  });

  test('message is not sent when loading without oauth web channel context', async ({
    syncBrowserPages: { connectAnotherDevice, page, signinReact, settings },
    target,
    testAccountTracker,
  }) => {
    await signInAccount(
      connectAnotherDevice,
      page,
      signinReact,
      target,
      testAccountTracker
    );
    const otherCredentials = await signInDifferentAccount(
      settings,
      signinReact,
      testAccountTracker
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
  connectAnotherDevice: ConnectAnotherDevicePage,
  page: Page,
  signinReact: SigninReactPage,
  target: BaseTarget,
  testAccountTracker: TestAccountTracker
) {
  const credentials = await testAccountTracker.signUp();
  await page.goto(
    `${target.contentServerUrl}?context=fx_desktop_v3&service=sync`
  );
  await signinReact.fillOutEmailFirstForm(credentials.email);
  await signinReact.fillOutPasswordForm(credentials.password);

  await expect(connectAnotherDevice.fxaConnectedHeading).toBeVisible();
  return credentials;
}

async function signInDifferentAccount(
  settings: SettingsPage,
  signinReact: SigninReactPage,
  testAccountTracker: TestAccountTracker
) {
  const otherCredentials = await testAccountTracker.signUp();
  await signinReact.goto();
  await signinReact.useDifferentAccountLink.click();
  await signinReact.fillOutEmailFirstForm(otherCredentials.email);
  await signinReact.fillOutPasswordForm(otherCredentials.password);

  //Verify logged in on Settings page
  await expect(settings.settingsHeading).toBeVisible();
  return otherCredentials;
}
