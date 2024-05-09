/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { SettingsPage } from '../../pages/settings';
import { SigninReactPage } from '../../pages/signinReact';

test.describe('severity-1 #smoke', () => {
  test('settings help link', async ({
    target,
    page,
    pages: { signinReact, settings },
    testAccountTracker,
  }) => {
    await signInAccount(
      page,
      settings,
      signinReact,
      target,
      testAccountTracker
    );

    await settings.goto();
    const helpPage = await settings.clickHelp();

    expect(helpPage.url()).toContain('https://support.mozilla.org');
  });
});

test.describe('severity-2 #smoke', () => {
  test('open and close bento drop-down menu', async ({
    target,
    page,
    pages: { signinReact, settings },
    testAccountTracker,
  }) => {
    await signInAccount(
      page,
      settings,
      signinReact,
      target,
      testAccountTracker
    );

    await settings.goto();

    await expect(settings.bentoDropDownMenu).toBeHidden();

    await settings.bentoDropDownMenuToggle.click();

    await expect(settings.bentoDropDownMenu).toBeVisible();

    await settings.settingsHeading.click(); // Click anywhere outside menu

    await expect(settings.bentoDropDownMenu).toBeHidden();
  });
});

async function signInAccount(
  page: Page,
  settings: SettingsPage,
  signinReact: SigninReactPage,
  target: BaseTarget,
  testAccountTracker: TestAccountTracker
): Promise<Credentials> {
  const credentials = await testAccountTracker.signUp();
  await page.goto(target.contentServerUrl);
  await signinReact.fillOutEmailFirstForm(credentials.email);
  await signinReact.fillOutPasswordForm(credentials.password);

  //Verify logged in on Settings page
  await expect(settings.settingsHeading).toBeVisible();

  return credentials;
}
