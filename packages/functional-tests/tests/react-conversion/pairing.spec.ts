/* eslint-disable no-console */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 import { firefox } from '@playwright/test';
import { expect, test, Page } from '../../lib/fixtures/standard';
import { BrowserSettingsPage } from '../../pages/browserSettings';

 // may need these, for now they're just commented out
 // while testing the initial flow
 //  import Jimp from 'jimp';
//  import QrCode from 'qrcode-reader';

 const config = {
   fxaContentRoot: 'https://latest.dev.lcip.org/', // Replace with your test config
   fxaOAuthApp: 'https://oauth.dev.lcip.org/',
 };

//  const PASSWORD = 'PASSWORD123123';
//  const GOOD_CLIENT_ID = '3c49430b43dfba77';
//  const BAD_CLIENT_ID = 'dcdb5ae7add825d2';

//  const REDIRECT_HOST = encodeURIComponent(config.fxaContentRoot);
//  const GOOD_PAIR_URL = `${config.fxaContentRoot}pair/supp?response_type=code&client_id=${GOOD_CLIENT_ID}&redirect_uri=${REDIRECT_HOST}oauth%2Fsuccess%2F3c49430b43dfba77&scope=profile%2Bhttps%3A%2F%2Fidentity.mozilla.com%2Fapps%2Foldsync&state=foo&code_challenge_method=S256&code_challenge=IpOAcntLUmKITcxI_rDqMvFTeC9n_g0B8_Pj2yWZp7w&access_type=offline&keys_jwk=eyJjcnYiOiJQLTI1NiIsImt0eSI6IkVDIiwieCI6ImlmcWY2U1pwMlM0ZjA5c3VhS093dmNsbWJxUm8zZXdGY0pvRURpYnc4MTQiLCJ5IjoiSE9LTXh5c1FseExqRGttUjZZbFpaY1Y4MFZBdk9nSWo1ZHRVaWJmYy1qTSJ9`;
//  const BAD_PAIR_URL = `${config.fxaContentRoot}pair/supp?response_type=code&client_id=${BAD_CLIENT_ID}&redirect_uri=${config.fxaOAuthApp}api/oauth&scope=profile%2Bhttps%3A%2F%2Fidentity.mozilla.com%2Fapps%2Foldsync&state=foo&code_challenge_method=S256&code_challenge=IpOAcntLUmKITcxI_rDqMvFTeC9n_g0B8_Pj2yWZp7w&access_type=offline&keys_jwk=...`;

//  const SIGNIN_PAGE_URL = `${config.fxaContentRoot}signin?context=fx_desktop_v3&service=sync&forceAboutAccounts=true&automatedBrowser=true&action=email`;

 // selectors, mocked, need to move to page and use correct selectors
//  const selectors = {
//    ENTER_EMAIL: {
//      EMAIL: 'input[name="email"]',
//      SUBMIT: 'button[type="submit"]',
//    },
//    SIGNIN_PASSWORD: {
//      PASSWORD: 'input[name="password"]',
//      SUBMIT: 'button[type="submit"]',
//    },
//    CONNECT_ANOTHER_DEVICE: {
//      HEADER: 'text=Connect Another Device',
//    },
//    PAIRING: {
//      START_PAIRING: 'text=Start Pairing',
//      SUPP_SUBMIT: 'button:has-text("Connect")',
//      AUTH_SUBMIT: 'button:has-text("Approve")',
//      COMPLETE: 'text=Device Connected',
//    },
//    '400': {
//      ERROR: '.error',
//    },
//  };

function wait() {
  return new Promise((r) => setTimeout(r, 1500));
}


test.describe('severity-2 #smoke', () => {
  test.describe('react device pairing', () => {
    test('user can pair', async ({
      syncBrowserPages: {
        // browserSettings,
        signin,
        page },
      // pages: {
      //   // browserSettings,
      //   // signin,
      //   page },
      testAccountTracker,
      // context,
    }) => {
        const account = await testAccountTracker.signUp();
        const syncParams = new URLSearchParams();

        await page.screenshot();
        syncParams.append('context', 'fx_desktop_v3');
        syncParams.append('service', 'sync');
        syncParams.append('action', 'email');
        await signin.goto('/', syncParams);
        await signin.fillOutEmailFirstForm(account.email);
        await signin.fillOutPasswordForm(account.password);
        // // const secondPage = await context.newPage();
        await page.goto('about:preferences#sync');
        // await signin.fillOutEmailFirstForm(account.email);
        // await signin.fillOutPasswordForm(account.password);

        // await wait();
        // await page.goto('http://localhost:3030/pair');
        // try {

        //   // todo: need data-test-id attributes added for these when new
        //   // pages are built, move these to page object
        //   // await page.getByText('I already have Firefox for mobile').click();
        //   // await page.locator('button#set-needs-mobile').click();
        //   await page.goto('about:preferences?action=pair#sync');
        //   const screenshot = await page.locator('box.qrContainer').screenshot({});
        //   // const brwoserSettingsPage = new BrowserSettingsPage(newPage);
        //   // this opens the BrowserSettings page
        // } catch (error) {
        //   console.debug('Error during pairing flow:', error);
        // }
        // const pages = context.pages();
        // console.debug('Current pages:', pages.map((p) => p.url()));

        // await browserSettings.getPairingQrCodeImg()
        expect(false).toBeTruthy(); // TODO: Implement browser settings page
        // async function getQrData(buffer: Buffer): Promise<string> {
        //   const image = await Jimp.read(buffer);
        //   return new Promise((resolve, reject) => {
        //     const qr = new QrCode();
        //     qr.callback = (err: Error | null, value: { result: string }) => {
        //       if (err) {
        //         return reject(err);
        //       }
        //       resolve(value.result);
        //     };
        //     qr.decode(image.bitmap);
        //   });
        // }

        // async function waitForQR(page: Page): Promise<string> {
        //   for (let attempt = 0; attempt < 3; attempt++) {
        //     const buffer = await page.screenshot();
        //     try {
        //       const qrData = await getQrData(buffer);
        //       return qrData.split('#')[1];
        //     } catch (e) {
        //       if (attempt === 2) throw new Error(`QRTimeout: ${e}`);
        //       await page.waitForTimeout(1000);
        //     }
        //   }
        //   throw new Error('QR scan failed');
        // }


        // test('it can pair', async ({ pages: {signin}, testAccountTracker }) => {

        //   // const email = createEmail();

        //   // Create user via API (pseudo-function)
        //   // await createUser(email, PASSWORD);
        //   // Sign in
        //   // const credentials = await testAccountTracker.signUp();

        //   // await signin.goto();
        //   // await signin.fillOutEmailFirstForm(credentials.email);
        //   // await signin.fillOutPasswordForm(credentials.password);

        //   // await settings.goto();

        //   // // Verify we've logged in
        //   // await expect(page).toHaveURL(/settings/);

        //   // // confirm that the connect_device is ready/available
        //   // //await page.waitForSelector(selectors.CONNECT_ANOTHER_DEVICE.HEADER);

        //   // await settings.connectAnotherDevice();

        //   // // Start pairing flow
        //   // await page.goto(`${config.fxaContentRoot}pair`);
        //   // await page.click(selectors.PAIRING.START_PAIRING);

        //   // const pairingStuff = await waitForQR(page);
        //   // const pairTab = await context.newPage();
        //   // await pairTab.goto(`${GOOD_PAIR_URL}#${pairingStuff}`);
        //   // await pairTab.click(selectors.PAIRING.SUPP_SUBMIT).catch(() => {
        //   //   // Ignore WebElementReference errors
        //   // });

        //   // await pairTab.close();
        //   // await page.click(selectors.PAIRING.AUTH_SUBMIT);

        //   // const confirmTab = await context.waitForEvent('page');
        //   // await confirmTab.waitForSelector(selectors.PAIRING.COMPLETE);
        //   // const url = confirmTab.url();
        //   // expect(url).toContain('code=');
        //   // expect(url).toContain('state=');
        //   // await confirmTab.close();
        // });

        // test('handles invalid clients', async ({ page }) => {
        //   await page.goto(`${BAD_PAIR_URL}#channel_id=foo&channel_key=bar`);
        //   const errorText = await page.textContent(selectors['400'].ERROR);
        //   expect(errorText).toContain('Invalid pairing client');
        // });
   });

  });
});
