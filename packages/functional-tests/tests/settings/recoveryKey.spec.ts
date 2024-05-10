/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import fs from 'fs';
import pdfParse from 'pdf-parse';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { SettingsPage } from '../../pages/settings';
import { SigninReactPage } from '../../pages/signinReact';

const HINT = 'secret key location';

test.describe('severity-1 #smoke', () => {
  test.describe('recovery key test', () => {
    test.beforeEach(async () => {
      // Generating and consuming recovery keys is a slow process
      // Mail delivery can also be slow
      test.slow();
    });

    test('can copy recovery key', async ({
      target,
      pages: { page, signinReact, recoveryKey, settings },
      testAccountTracker,
    }) => {
      const { password } = await signInAccount(
        page,
        settings,
        signinReact,
        target,
        testAccountTracker
      );

      await settings.goto();

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.recoveryKey.status).toHaveText('Not Set');

      await settings.recoveryKey.createButton.click();
      await recoveryKey.acknowledgeInfoForm();
      await recoveryKey.fillOutConfirmPasswordForm(password);

      await expect(recoveryKey.recoveryKeyCreatedHeading).toBeVisible();
      const newKey = await recoveryKey.recoveryKey.innerText();
      const clipboard = await recoveryKey.clickCopy();
      expect(clipboard).toEqual(newKey);
    });

    test('can download recovery key as PDF', async ({
      target,
      pages: { page, signinReact, recoveryKey, settings },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        page,
        settings,
        signinReact,
        target,
        testAccountTracker
      );

      await settings.goto();

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.recoveryKey.status).toHaveText('Not Set');

      await settings.recoveryKey.createButton.click();
      await recoveryKey.acknowledgeInfoForm();
      await recoveryKey.fillOutConfirmPasswordForm(credentials.password);

      await expect(recoveryKey.recoveryKeyCreatedHeading).toBeVisible();
      const newKey = await recoveryKey.recoveryKey.innerText();

      // Test download
      const dl = await recoveryKey.clickDownload();
      // Verify filename is as expected
      const date = new Date().toISOString().split('T')[0];
      const filename = dl.suggestedFilename();
      expect(filename.length).toBeLessThanOrEqual(75);
      expect(filename).toBe(
        `Mozilla-Recovery-Key_${date}_${credentials.email}.pdf`
      );

      // Test uses try/finally to ensure the downloaded file is deleted after tests
      // whether or not the assertions passed
      try {
        // Verify file is downloaded
        await dl.saveAs(filename);
        expect(fs.existsSync(filename)).toBeTruthy();

        const getPDF = async (file: fs.PathOrFileDescriptor) => {
          const readFileSync = fs.readFileSync(file);
          const pdfExtract = await pdfParse(readFileSync);
          // Verify downloaded file contains key
          expect(pdfExtract.text).toContain(newKey);
          // Verify the PDF file contains only one page
          expect(pdfExtract.numpages).toEqual(1);
        };
        getPDF(filename);
      } finally {
        // Delete the downloaded file
        await fs.promises.unlink(filename);
      }
    });

    test('revoke recovery key', async ({
      target,
      pages: { page, signinReact, settings, recoveryKey },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        page,
        settings,
        signinReact,
        target,
        testAccountTracker
      );

      await settings.goto();

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.recoveryKey.status).toHaveText('Not Set');

      await settings.recoveryKey.createButton.click();
      await recoveryKey.createRecoveryKey(credentials.password, HINT);

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.recoveryKey.status).toHaveText('Enabled');

      await settings.recoveryKey.deleteButton.click();

      await expect(settings.recoveryKeyModalHeading).toBeVisible();

      await settings.modalConfirmButton.click();

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.alertBar).toHaveText(
        'Account recovery key removed'
      );
      await expect(settings.recoveryKey.status).toHaveText('Not Set');
    });

    test('forgot password has account recovery key but skip using it', async ({
      target,
      pages: { page, recoveryKey, resetPasswordReact, settings, signinReact },
      testAccountTracker,
    }, { project }) => {
      test.slow(project.name !== 'local', 'email delivery can be slow');

      const credentials = await signInAccount(
        page,
        settings,
        signinReact,
        target,
        testAccountTracker
      );

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.recoveryKey.status).toHaveText('Not Set');

      await settings.recoveryKey.createButton.click();
      await recoveryKey.createRecoveryKey(credentials.password, 'hint');

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.recoveryKey.status).toHaveText('Enabled');

      await page.goto(target.contentServerUrl + '/reset_password');
      await resetPasswordReact.fillOutEmailForm(credentials.email);
      const link = await target.emailClient.getResetPasswordLink(
        credentials.email
      );
      await page.goto(link);
      await resetPasswordReact.forgotKeyLink.click();
      await resetPasswordReact.fillOutNewPasswordForm(credentials.password);

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.alertBar).toBeVisible();
      await expect(settings.recoveryKey.status).toHaveText('Not Set');
    });
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
