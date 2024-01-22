/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';

let email;
let bouncedEmail;
const password = 'passwordzxcv';

test.describe('severity-1 #smoke', () => {
  test.describe('Oauth sign up', () => {
    test.beforeEach(async ({ pages: { configPage, login } }) => {
      const config = await configPage.getConfig();
      if (config.showReactApp.signUpRoutes === true) {
        email = '';
        test.skip(
          true,
          'this test is specific to backbone, skip if serving react'
        );
      } else {
        test.slow();
        email = login.createEmail();
        bouncedEmail = login.createEmail('bounced{id}');
        await login.clearCache();
      }
    });

    test.afterEach(async ({ target }) => {
      if (email) {
        // Cleanup any accounts created during the test
        await target.auth.accountDestroy(email, password);
      }
    });

    test('sign up', async ({ pages: { login, relier } }) => {
      await relier.goto();
      await relier.clickEmailFirst();
      await login.fillOutFirstSignUp(email, password, { verify: false });

      //Verify sign up code header
      await login.waitForSignUpCodeHeader();

      await login.fillOutSignUpCode(email);

      //Verify logged in on relier page
      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('signup, bounce email, allow user to restart flow but force a different email', async ({
      target,
      pages: { login, relier },
    }) => {
      const client = await login.getFxaClient(target);

      await relier.goto();
      await relier.clickEmailFirst();
      await login.fillOutFirstSignUp(bouncedEmail, password, { verify: false });

      //Verify sign up code header
      await login.waitForSignUpCodeHeader();
      await client.accountDestroy(bouncedEmail, password);

      //Verify error message
      expect(await login.getTooltipError()).toContain(
        'Your confirmation email was just returned. Mistyped email?'
      );

      await login.setEmail('');

      await login.fillOutFirstSignUp(email, password, { verify: false });

      //Verify sign up code header
      await login.waitForSignUpCodeHeader();
      await login.fillOutSignUpCode(email);

      //Verify logged in on relier page
      expect(await relier.isLoggedIn()).toBe(true);
    });
  });

  test.describe('Oauth sign up success', () => {
    test.beforeEach(async ({ pages: { login } }) => {
      test.slow();
      await login.clearCache();
    });

    test('a success screen is available', async ({
      target,
      page,
      pages: { relier },
    }, { project }) => {
      // Our production clientId for 123Done is different from localhost and stage
      const clientId =
        project.name === 'production' ? '3c32bf6654542211' : 'dcdb5ae7add825d2';
      await page.goto(`${target.contentServerUrl}/oauth/success/${clientId}`);

      //Verify oauth success header
      expect(await relier.isOauthSuccessHeader()).toBe(true);
    });
  });
});
