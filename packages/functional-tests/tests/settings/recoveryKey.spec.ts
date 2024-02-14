/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';
import { EmailHeader, EmailType } from '../../lib/email';
import fs from 'fs';
import pdfParse from 'pdf-parse';

let status;
let key;
let hint;

test.describe('severity-1 #smoke', () => {
  test.describe('recovery key test', () => {
    test.beforeEach(
      async ({ credentials, pages: { settings, recoveryKey } }) => {
        // Generating and consuming recovery keys is a slow process
        // Mail delivery can also be slow
        test.slow();

        await settings.goto();
        let status = await settings.recoveryKey.statusText();
        expect(status).toEqual('Not Set');
        await settings.recoveryKey.clickCreate();
        // View 1/4 info
        await recoveryKey.clickStart();
        // View 2/4 confirm password and generate key
        await recoveryKey.setPassword(credentials.password);
        await recoveryKey.submit();

        // View 3/4 key download
        // Store key to be used later
        key = await recoveryKey.getKey();
        await recoveryKey.clickNext();

        // View 4/4 hint
        // store hint to be used later
        hint = 'secret key location';
        await recoveryKey.setHint(hint);
        await recoveryKey.clickFinish();

        // Verify status as 'enabled'
        status = await settings.recoveryKey.statusText();
        expect(status).toEqual('Enabled');
      }
    );

    test('can copy recovery key', async ({
      credentials,
      pages: { recoveryKey, settings },
    }) => {
      // Create new recovery key
      await settings.recoveryKey.clickCreate();
      // View 1/4 info
      await recoveryKey.clickStart();
      // View 2/4 confirm password and generate key
      await recoveryKey.setPassword(credentials.password);
      await recoveryKey.submit();

      // View 3/4 key download
      // Store key to be used later
      const newKey = await recoveryKey.getKey();

      // Test copy
      const clipboard = await recoveryKey.clickCopy();
      expect(clipboard).toEqual(newKey);
    });

    test('can download recovery key as PDF', async ({
      credentials,
      pages: { recoveryKey, settings },
    }) => {
      // Create new recovery key
      await settings.recoveryKey.clickCreate();
      // View 1/4 info
      await recoveryKey.clickStart();
      // View 2/4 confirm password and generate key
      await recoveryKey.setPassword(credentials.password);
      await recoveryKey.submit();

      // View 3/4 key download
      // Store key to be used later
      const newKey = await recoveryKey.getKey();

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

    test('revoke recovery key', async ({ pages: { settings } }) => {
      await settings.goto();
      await settings.recoveryKey.clickDelete();
      await settings.clickModalConfirm();
      await settings.waitForAlertBar();
      status = await settings.recoveryKey.statusText();

      // Verify status as 'not set'
      expect(status).toEqual('Not Set');
    });
  });
});
