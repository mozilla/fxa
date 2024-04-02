/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';
import fs from 'fs';
import pdfParse from 'pdf-parse';

const HINT = 'secret key location';

test.describe('severity-1 #smoke', () => {
  test.describe('recovery key test', () => {
    test.beforeEach(
      async ({ credentials, pages: { settings, recoveryKey } }) => {
        // Generating and consuming recovery keys is a slow process
        // Mail delivery can also be slow
        test.slow();
      }
    );

    test('can copy recovery key', async ({
      credentials,
      pages: { recoveryKey, settings },
    }) => {
      await settings.goto();

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.recoveryKey.status).toHaveText('Not Set');

      // Create new recovery key
      await settings.recoveryKey.createButton.click();

      // View 1/4 info
      await expect(recoveryKey.createRecoveryKeyHeading).toBeVisible();

      await recoveryKey.getStartedButton.click();

      // View 2/4 confirm password and generate key
      await expect(recoveryKey.passwordHeading).toBeVisible();

      await recoveryKey.createKeyPasswordTextbox.fill(credentials.password);
      await recoveryKey.createKeyButton.click();

      // View 3/4 key download
      await expect(recoveryKey.recoveryKeyCreatedHeading).toBeVisible();

      // Store key to be used later
      const newKey = await recoveryKey.recoveryKey.innerText();

      // Test copy
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

      // Create new recovery key
      await settings.recoveryKey.createButton.click();

      // View 1/4 info
      await expect(recoveryKey.createRecoveryKeyHeading).toBeVisible();

      await recoveryKey.getStartedButton.click();

      // View 2/4 confirm password and generate key
      await expect(recoveryKey.passwordHeading).toBeVisible();

      await recoveryKey.createKeyPasswordTextbox.fill(credentials.password);
      await recoveryKey.createKeyButton.click();

      // View 3/4 key download
      await expect(recoveryKey.recoveryKeyCreatedHeading).toBeVisible();

      // Store key to be used later
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

        const getPDF = async (file) => {
          const readFileSync = fs.readFileSync(file);
          try {
            const pdfExtract = await pdfParse(readFileSync);
            // Verify downloaded file contains key
            expect(pdfExtract.text).toContain(newKey);
            // Verify the PDF file contains only one page
            expect(pdfExtract.numpages).toEqual(1);
          } catch (error) {
            throw new Error(error);
          }
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
      await recoveryKey.fillOutRecoveryKeyForms(credentials.password, HINT);

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.recoveryKey.status).toHaveText('Enabled');

      await settings.recoveryKey.clickDelete();
      await settings.clickModalConfirm();

      await settings.waitForAlertBar();
      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.recoveryKey.status).toHaveText('Not Set');
    });
  });
});
