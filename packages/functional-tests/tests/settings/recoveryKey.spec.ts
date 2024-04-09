/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';
import { EmailHeader, EmailType } from '../../lib/email';
import fs from 'fs';
import pdfParse from 'pdf-parse';

const HINT = 'secret key location';

test.describe('severity-1 #smoke', () => {
  test.describe('recovery key test', () => {
    test.beforeEach(async () => {
      // Generating and consuming recovery keys is a slow process
      // Mail delivery can also be slow
      test.slow();
    });

    test('can copy recovery key', async ({
      credentials,
      pages: { recoveryKey, settings },
    }) => {
      await settings.goto();

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.recoveryKey.status).toHaveText('Not Set');

      await settings.recoveryKey.createButton.click();
      await recoveryKey.acknowledgeInfoForm();
      await recoveryKey.fillOutConfirmPasswordForm(credentials.password);

      await expect(recoveryKey.recoveryKeyCreatedHeading).toBeVisible();
      const newKey = await recoveryKey.recoveryKey.innerText();
      const clipboard = await recoveryKey.clickCopy();
      expect(clipboard).toEqual(newKey);
    });

    test('can download recovery key as PDF', async ({
      credentials,
      pages: { recoveryKey, settings },
    }) => {
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
      credentials,
      pages: { settings, recoveryKey },
    }) => {
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
      credentials,
      page,
      pages: { settings, login, configPage, recoveryKey },
    }, { project }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.showReactApp.resetPasswordRoutes === true,
        'Scheduled for removal as part of React conversion (see FXA-8267).'
      );
      test.slow(project.name !== 'local', 'email delivery can be slow');

      await settings.goto();

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.recoveryKey.status).toHaveText('Not Set');

      await settings.recoveryKey.createButton.click();
      await recoveryKey.createRecoveryKey(credentials.password, 'hint');

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.recoveryKey.status).toHaveText('Enabled');

      await page.goto(target.contentServerUrl + '/reset_password');
      await login.setEmail(credentials.email);
      await login.clickSubmit();
      const link = await target.email.waitForEmail(
        credentials.email,
        EmailType.recovery,
        EmailHeader.link
      );
      await page.goto(link);
      await login.clickDontHaveRecoveryKey();
      await login.setNewPassword(credentials.password);

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.alertBar).toBeVisible();
      await expect(settings.recoveryKey.status).toHaveText('Not Set');
    });
  });
});
