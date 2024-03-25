/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';

test.describe('severity-1 #smoke', () => {
  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293407
  test('removing secondary emails #1293407', async ({
    credentials,
    pages: { settings, secondaryEmail },
  }, { project }) => {
    test.slow(project.name !== 'local', 'email delivery can be slow');
    await settings.goto();
    await settings.secondaryEmail.clickAdd();
    const newEmail = credentials.email.replace(/(\w+)/, '$1_alt');
    await secondaryEmail.addAndVerify(newEmail);
    await settings.waitForAlertBar();
    await settings.closeAlertBar();
    await settings.secondaryEmail.clickDelete();
    await settings.waitForAlertBar();
    await expect(settings.alertBar).toHaveText(/successfully deleted/);
    await settings.secondaryEmail.clickAdd();
    await secondaryEmail.setEmail(newEmail);
    await secondaryEmail.submit();
    // skip verification
    await settings.goto();
    expect(await settings.secondaryEmail.statusText()).toContain('UNCONFIRMED');
    await settings.secondaryEmail.clickDelete();
    await settings.waitForAlertBar();
    await expect(settings.alertBar).toHaveText(/successfully deleted/);
  });

  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293504
  test('settings help link #1293504', async ({ pages: { settings } }) => {
    await settings.goto();
    const helpPage = await settings.clickHelp();
    expect(helpPage.url()).toContain('https://support.mozilla.org');
  });

  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293480
  test('edit email communication preferences #1293480', async ({
    credentials,
    pages: { settings, login },
  }, { project }) => {
    test.skip(project.name !== 'production', 'uses prod email prefs');

    await settings.goto();
    const emailPage = await settings.clickEmailPreferences();
    login.page = emailPage;
    await login.setPassword(credentials.password);
    await login.submit();
    expect(emailPage.url()).toContain(
      'https://www.mozilla.org/en-US/newsletter'
    );
    // TODO change prefs and save
  });
});

test.describe('severity-2 #smoke', () => {
  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293501
  test('settings bento menu #1293501', async ({
    page,
    pages: { settings },
  }) => {
    await settings.goto();
    await settings.clickBentoIcon();
    await expect(settings.bentoMenu).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(settings.bentoMenu).toBeHidden();
  });
});
