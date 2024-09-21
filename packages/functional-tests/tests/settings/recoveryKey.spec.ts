/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import fs from 'fs';
import pdfParse from 'pdf-parse';
import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { SettingsPage } from '../../pages/settings';
import { SigninPage } from '../../pages/signin';

const HINT = 'secret key location';

test.describe('severity-1 #smoke', () => {
  test.describe('recovery key test', () => {
    test('can copy recovery key', async ({
      target,
      pages: { page, recoveryKey, settings, signin },
      testAccountTracker,
    }) => {
      const { password } = await signInAccount(
        target,
        page,
        settings,
        signin,
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
      pages: { page, recoveryKey, settings, signin },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        target,
        page,
        settings,
        signin,
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
      pages: { page, recoveryKey, settings, signin },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        target,
        page,
        settings,
        signin,
        testAccountTracker
      );

      await settings.goto();

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.recoveryKey.status).toHaveText('Not Set');

      await settings.recoveryKey.createButton.click();
      await recoveryKey.createRecoveryKey(credentials.password, HINT);

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.recoveryKey.status).toHaveText('Enabled');

      await settings.goto();

      await settings.recoveryKey.deleteButton.click();

      await expect(settings.recoveryKeyModalHeading).toBeVisible();

      await settings.modalConfirmButton.click();

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.alertBar).toHaveText(
        'Account recovery key removed'
      );
      await expect(settings.recoveryKey.status).toHaveText('Not Set');
    });
  });
});

async function signInAccount(
  target: BaseTarget,
  page: Page,
  settings: SettingsPage,
  signin: SigninPage,
  testAccountTracker: TestAccountTracker
): Promise<Credentials> {
  const credentials = await testAccountTracker.signUp();
  await page.goto(target.contentServerUrl);
  await signin.fillOutEmailFirstForm(credentials.email);
  await signin.fillOutPasswordForm(credentials.password);

  //Verify logged in on Settings page
  await expect(settings.settingsHeading).toBeVisible();

  return credentials;
}
