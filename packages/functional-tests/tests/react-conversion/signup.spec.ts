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
    test.beforeEach(async ({ pages: { login, configPage } }) => {
      test.slow();
      // Ensure that the feature flag is enabled
      const config = await configPage.getConfig();
      test.skip(config.showReactApp.signUpRoutes !== true);

      email = login.createEmail('signup_react{id}');
    });

    test.afterEach(async ({ target }) => {
      if (email) {
        // Cleanup any accounts created during the test
        try {
          await target.auth.accountDestroy(email, PASSWORD);
        } catch (e) {
          // Ignore errors
        }
      }
    });

    test('signup web', async ({ page, target, pages: { signupReact } }) => {
      await signupReact.goto();
      await signupReact.fillOutEmailFirst(email);
      await signupReact.fillOutSignupForm(PASSWORD);

      const code = await target.email.waitForEmail(
        email,
        EmailType.verifyShortCode,
        EmailHeader.shortCode
      );

      await signupReact.fillOutCodeForm(code);

      // Verify logged into settings page
      await page.waitForURL(/settings/);
    });

    test('signup oauth', async ({
      target,
      pages: { page, signupReact, relier },
    }) => {
      await relier.goto();
      await relier.clickEmailFirst();

      const { searchParams } = new URL(page.url());
      searchParams.set('email', email);

      // We want to append the experiment params here, but also keep the original oauth params
      await signupReact.goto('/oauth/signup', searchParams);
      await signupReact.fillOutSignupForm(PASSWORD);

      // TODO: This needs to be uncommented once oauth is redirecting back to relier
      // const code = await target.email.waitForEmail(
      //   email,
      //   EmailType.verifyShortCode,
      //   EmailHeader.shortCode
      // );

      // await signupReact.fillOutCodeForm(code);

      // Verify logged in on relier page
      // expect(await relier.isLoggedIn()).toBe(true);
      // await page.waitForURL(/settings/);
    });

    /* Disabling this until FXA-8287 is fixed
    test('signup oauth webchannel', async ({
      page,
      target,
      pages: { login, relier, signupReact },
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

      await login.respondToWebChannelMessage(customEventDetail);

      // TODO: CTWS has not been implemented yet, probably better to pull into signupReact page
      // await login.waitForCWTSEngineHeader();
      // expect(await login.isCWTSEngineBookmarks()).toBe(true);
      // expect(await login.isCWTSEngineHistory()).toBe(true);

      const { searchParams } = new URL(page.url());
      searchParams.set('email', email);

      // We want to append the experiment params here, but also keep the original oauth params
      await signupReact.goto('/oauth/signup', searchParams);
      await signupReact.fillOutSignupForm(PASSWORD);

      // TODO: This needs to be implemented as well
      // const code = await target.email.waitForEmail(
      //   email,
      //   EmailType.verifyShortCode,
      //   EmailHeader.shortCode
      // );
      //
      // await signupReact.fillOutCodeForm(code);
      // await login.checkWebChannelMessage(FirefoxCommand.OAuthLogin);
    });*/

    test('signup sync', async ({ target }) => {
      test.slow();
      const syncBrowserPages = await newPagesForSync(target);
      const { login, signupReact } = syncBrowserPages;

      email = login.createEmail('sync{id}');

      await signupReact.goto(
        '/',
        new URLSearchParams({
          context: 'fx_desktop_v3',
          service: 'sync',
          action: 'email',
        })
      );

      await signupReact.fillOutEmailFirst(email);
      await signupReact.fillOutSignupForm(PASSWORD);

      const code = await target.email.waitForEmail(
        email,
        EmailType.verifyShortCode,
        EmailHeader.shortCode
      );

      await signupReact.fillOutCodeForm(code);

      // TODO Uncomment once sync is working
      // expect(await connectAnotherDevice.fxaConnected.isVisible()).toBeTruthy();

      await syncBrowserPages.browser?.close();
    });
  });
});
