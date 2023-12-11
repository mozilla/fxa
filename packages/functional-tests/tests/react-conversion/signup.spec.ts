/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, newPagesForSync, test } from '../../lib/fixtures/standard';
import { EmailHeader, EmailType } from '../../lib/email';
import { createCustomEventDetail, FirefoxCommand } from '../../lib/channels';

const PASSWORD = 'passwordzxcv';

test.describe('severity-1 #smoke', () => {
  test.describe('signup react', () => {
    let email;

    test.beforeEach(async ({ pages: { configPage, login } }) => {
      test.slow();
      // Ensure that the feature flag is enabled else skip react tests
      const config = await configPage.getConfig();
      if (config.showReactApp.signUpRoutes !== true) {
        test.skip();
        email = undefined;
      } else {
        email = login.createEmail('signup_react{id}');
      }
    });

    test.afterEach(async ({ target }) => {
      if (email) {
        try {
          await target.auth.accountDestroy(email, PASSWORD);
        } catch (e) {
          // Handle the error here
          console.error('An error occurred during account cleanup:', e);
          // Optionally, rethrow the error to propagate it further
          throw e;
        }
      }
    });

    test('signup web', async ({
      page,
      target,
      pages: { settings, signupReact },
    }) => {
      await signupReact.goto();
      await signupReact.fillOutEmailFirst(email);
      await page.waitForSelector('#root');
      await signupReact.fillOutSignupForm(PASSWORD);

      const code = await target.email.waitForEmail(
        email,
        EmailType.verifyShortCode,
        EmailHeader.shortCode
      );

      await signupReact.fillOutCodeForm(code);

      // Verify logged into settings page
      await page.waitForURL(/settings/);
      await settings.signOut();
    });

    test('signup oauth', async ({
      page,
      target,
      pages: { relier, signupReact },
    }) => {
      relier.goto();
      relier.clickEmailFirst();

      // wait for navigation, and get search params
      await page.waitForURL(/oauth\//);
      const params = new URL(page.url()).searchParams;

      // reload email-first page with React experiment params
      await signupReact.goto('/', params);
      // fill out email first form
      await signupReact.fillOutEmailFirst(email);
      await page.waitForURL(/signup/);
      await page.waitForSelector('#root');
      await signupReact.fillOutSignupForm(PASSWORD);

      // Get code from email
      const code = await target.email.waitForEmail(
        email,
        EmailType.verifyShortCode,
        EmailHeader.shortCode
      );

      await signupReact.fillOutCodeForm(code);

      // expect to be redirected to relier after confirming signup code
      await page.waitForURL(target.relierUrl);
      expect(await relier.isLoggedIn()).toBe(true);
      await relier.signOut();
    });

    // TODO in FXA-8657: This isn't working because we're checking for sync mobile webchannel in the page
    // by checking against the client ID. This client ID is 123done and not Sync.
    test.skip('signup oauth webchannel (sync mobile)', async ({
      pages: { page, login, relier, signupReact },
    }) => {
      const customEventDetail = createCustomEventDetail(
        FirefoxCommand.FxAStatus,
        {
          capabilities: {
            choose_what_to_sync: true,
            engines: ['bookmarks', 'history'],
          },
          signedInUser: null,
        }
      );

      await relier.goto('context=oauth_webchannel_v1&automatedBrowser=true');
      await relier.clickEmailFirst();

      // wait for navigation, and get search params
      await page.waitForURL(/oauth\//);
      const params = new URL(page.url()).searchParams;

      // reload email-first page with React experiment params
      await signupReact.goto('/', params);
      await signupReact.fillOutEmailFirst(email);

      await page.waitForSelector('#root');

      await login.respondToWebChannelMessage(customEventDetail);

      // TODO FXA-8657 Update to use signupReact template
      await login.waitForCWTSEngineHeader();
      expect(await login.isCWTSEngineBookmarks()).toBe(true);
      expect(await login.isCWTSEngineHistory()).toBe(true);
      expect(await login.isCWTSEngineCreditCards()).toBe(false);

      await login.fillOutFirstSignUp(email, PASSWORD, {
        enterEmail: false,
        waitForNavOnSubmit: false,
      });
      await login.checkWebChannelMessage(FirefoxCommand.OAuthLogin);
    });

    test('signup sync', async ({ target }) => {
      test.slow();
      const syncBrowserPages = await newPagesForSync(target);
      const { page, signupReact } = syncBrowserPages;

      await signupReact.goto(
        '/',
        new URLSearchParams({
          context: 'fx_desktop_v3',
          service: 'sync',
          action: 'email',
          automatedBrowser: 'true',
        })
      );

      await signupReact.fillOutEmailFirst(email);
      await page.waitForURL(/signup/);
      await page.waitForSelector('#root');
      await signupReact.fillOutSignupForm(PASSWORD);

      const code = await target.email.waitForEmail(
        email,
        EmailType.verifyShortCode,
        EmailHeader.shortCode
      );

      await signupReact.fillOutCodeForm(code);

      // See note in `firefox.ts` about an event listener hack needed for this test
      expect(await page.getByText(/Invalid token/).isVisible()).toBeFalsy();
      await page.waitForURL(/connect_another_device/);
      await expect(page.getByText('You’re signed into Firefox')).toBeVisible();

      await syncBrowserPages.browser?.close();
    });
  });
});
