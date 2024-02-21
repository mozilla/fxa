/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';

test.describe('severity-1 #smoke', () => {
  test.describe('two step auth', () => {
    test.beforeEach(async () => {
      test.slow();
    });

    // https://testrail.stage.mozaws.net/index.php?/cases/view/1293446
    // https://testrail.stage.mozaws.net/index.php?/cases/view/1293452
    // FXA-9178
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip('add and remove totp', async ({
      credentials,
      target,
      pages: { settings, totp, page, signupReact },
    }) => {
      await settings.goto();
      let status = await settings.totp.statusText();
      expect(status).toEqual('Not Set');
      await settings.totp.clickAdd();
      const { secret } = await totp.enable(credentials);
      await settings.waitForAlertBar();
      status = await settings.totp.statusText();
      expect(status).toEqual('Enabled');

      await settings.signOut();

      await page.goto(
        `${target.contentServerUrl}/?showReactApp=true&forceExperiment=generalizedReactApp&forceExperimentGroup=react`
      );

      await signupReact.fillOutEmailFirst(credentials.email);
      await page.fill('[name="password"]', credentials.password);
      await page.click('[type="submit"]');
      await page.waitForURL(/signin_totp_code/);
      await page.waitForSelector('#root');
      await page.fill('[name="code"]', '111111');
      await page.click('[type="submit"]');
      page.getByText('Invalid two-step authentication code');

      const code = await totp.getNextCode(secret);
      await page.fill('[name="code"]', code);
      await page.click('[type="submit"]');
      await page.waitForURL(/settings/);
    });
  });
});
