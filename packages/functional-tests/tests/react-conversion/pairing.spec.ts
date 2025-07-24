/* eslint-disable no-console */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test, Page } from '../../lib/fixtures/standard';
import { BrowserSettingsPage } from '../../pages/browserSettings';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';

//  import Jimp from 'jimp';
//  import QrCode from 'qrcode-reader';


test.describe('severity-2 #smoke', () => {
  test.describe('react device pairing', () => {
    test('user can pair', async ({
      syncBrowserPages: {
        signinTokenCode,
        pairing,
        signin,
        page,
      },
      context,
      target,
      testAccountTracker,
    }) => {
      let initialPages: Array<Page> = [];
      try{

        const credentials = await testAccountTracker.signUpSync();

        const syncParams = new URLSearchParams();
        syncParams.append('context', 'fx_desktop_v3');
        syncParams.append('service', 'sync');
        syncParams.append('action', 'email');
        await signin.goto('/', syncParams);

        await signin.fillOutEmailFirstForm(credentials.email);
        await signin.fillOutPasswordForm(credentials.password);

        await page.waitForURL(/signin_token_code/);

        const code = await target.emailClient.getVerifyLoginCode(credentials.email);

        await signinTokenCode.fillOutCodeForm(code);

        await expect(page).toHaveURL(/pair/);
        initialPages = context.pages();
        await pairing.startPairing();
        await page.screenshot({ path: 'pairing-qr.png' });
      } catch (error) {
        initialPages.forEach(p => console.debug(`Page URL: ${p.url()}`));

        // if this works, we need to only catch the error for "page disconnected"
        // here we would dispatch to Marionette to handle inteeraction with the
        // privileged page `about:preferences#sync`

        // It should hand back an image or file path to the image
        // from there we can parse the QR code and generate the
        // new url to complete the pairing flow.

        const newPage = await context.newPage();
        // use an instance of the BrowserSettingsPage to
        // adhere as close to POM given the circumstances
        const settingsPage = new BrowserSettingsPage(newPage, target);

        const tempDir = os.tmpdir();
        const tempFilePath = path.join(tempDir, 'pairing-qr.png');
        console.debug(`Temp file path: ${tempFilePath}`);

        // dispatch to Marionette to get the screenshot of the QR code
        await Marionette.getScreenshot(tempFilePath);


        // parse the QR code
        const {channel_id, channel_key} = parseQrData('pairing-qr.png');

        // go to the pairing page to complete pairing.
        newPage.goto(`/pair/supp?channel_id=${channel_id}&channel_key=${channel_key}`);

      }
      expect(false).toBeTruthy(); // just so pw linting stops complaining while build test
   });

  });
});

function parseQrData(path: string) {
  // This function would use Jimp and QrCode to read the QR code
  // from the image file at `path` and return the data contained in it.
  // For now, this is a placeholder as the actual implementation
  // would depend on the QR code library used.
  const qrData = path;
  console.debug(`Parsed QR data: ${qrData}`);
  return {
    channel_id: '',
    channel_key: '',
  }
}

// TODO: move this to another file. this is NOT tested to be working yet.
const Marionette = {
  /**
   * Tells
   * @param filePath
   */
  getScreenshot: async (filePath: string) => {
    return await Marionette.dispatch('getScreenshot', { filePath });
  },

  /**
   * Runs the provided Marionette script. Provided data
   * is passed as arguments to the script.
   * @param eventName
   * @param data
   */
  dispatch: async (eventName: string, data: any) => {
    const pythonScript = path.resolve(__dirname, '../../marionette/', eventName);
    const args = Object.entries(data).map(([key, value]) => `--${key}=${value}`);

    const proc = spawn('python3', [pythonScript, ...args]);

    proc.stdout.on('data', (data) => {
      console.log(`[python stdout]: ${data}`);
    });

    proc.stderr.on('data', (data) => {
      console.error(`[python stderr]: ${data}`);
    });

    proc.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Marionette event dispatched successfully!');
      } else {
        console.error(`❌ Marionette event dispatch failed with code ${code}`);
      }
    });
    return proc;
  }
}
