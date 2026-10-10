/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page } from '@playwright/test';
import { expect, test } from '../../lib/fixtures/standard';
import { oauthWebchannelV1 } from '../../lib/query-params';
import { SigninPage } from '../../pages/signin';
import { SigninTokenCodePage } from '../../pages/signinTokenCode';
import { Credentials } from '../../lib/targets';
import { requestBrowserSignedInUser } from '../../lib/sync-helpers';

test.describe('fxa_status web channel message in Settings', () => {
  test('message is sent when loading with context = oauth_webchannel_v1', async ({
    target,
    syncBrowserPages: { connectAnotherDevice, page, settings, signin },
    testAccountTracker,
  }) => {
    await page.goto(
      `${target.contentServerUrl}/?context=fx_desktop_v3&service=sync`
    );
    const credentials = await testAccountTracker.signUp();
    await signInAccount(signin, credentials);
    await page.waitForURL(/pair/);
    await expect(connectAnotherDevice.fxaConnected).toBeVisible();

    await page.goto(target.contentServerUrl);
    await signin.useDifferentAccountLink.click();
    const credentials2 = await testAccountTracker.signUp();
    await signInAccount(signin, credentials2);

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
    const credentials = await testAccountTracker.signUp();
    await signInAccount(signin, credentials);
    await expect(connectAnotherDevice.fxaConnected).toBeEnabled();

    await page.goto(target.contentServerUrl);
    await signin.useDifferentAccountLink.click();
    const credentials2 = await testAccountTracker.signUp();
    await signInAccount(signin, credentials2);

    // We verify that when accessing settings without the `context=oauth_webchannel_v1`
    // the newer account takes precedence
    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.primaryEmail.status).toHaveText(credentials2.email);
  });

  test('sign-out destroys the browser session when web sign-in replaced the stored token', async ({
    target,
    syncOAuthBrowserPages: {
      connectAnotherDevice,
      page,
      settings,
      signin,
      signinTokenCode,
    },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUpSync();
    await page.goto(`${target.contentServerUrl}/pair`);
    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);
    await page.waitForURL(/signin_token_code/);
    const code = await target.emailClient.getVerifyLoginCode(credentials.email);
    await signinTokenCode.fillOutCodeForm(code);
    await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    await connectAnotherDevice.clickNotNowPair();
    await page.waitForURL(/settings/);
    await expect(settings.settingsHeading).toBeVisible();
    const browserSessionToken = (await requestBrowserSignedInUser(page))
      ?.sessionToken as string;

    // A forced web sign-in replaces the stored token without telling Firefox.
    const rpPage = await page.context().newPage();
    await rpPage.goto(`${target.relierUrl}/api/prompt_login`);
    await new SigninPage(rpPage, target).fillOutPasswordForm(
      credentials.password
    );
    await rpPage.waitForURL(/signin_token_code/);
    await new SigninTokenCodePage(rpPage, target).fillOutCodeForm(
      await target.emailClient.getVerifyLoginCode(credentials.email)
    );
    await rpPage.waitForURL((url) => url.href.startsWith(target.relierUrl));
    await rpPage.close();
    expect(await storedSessionToken(page)).not.toEqual(browserSessionToken);

    await settings.signOut();

    await expect(
      target.authClient.sessionStatus(browserSessionToken)
    ).rejects.toMatchObject({ errno: 110 });
  });
});

async function signInAccount(
  signin: SigninPage,
  credentials: Credentials
): Promise<void> {
  await signin.fillOutEmailFirstForm(credentials.email);
  await signin.page.waitForURL(/signin/);
  await signin.fillOutPasswordForm(credentials.password);
}

async function storedSessionToken(page: Page): Promise<string> {
  return page.evaluate(() => {
    const storage = (key: string) =>
      JSON.parse(localStorage.getItem(`__fxa_storage.${key}`) || 'null');
    return storage('accounts')[storage('currentAccountUid')].sessionToken;
  });
}
