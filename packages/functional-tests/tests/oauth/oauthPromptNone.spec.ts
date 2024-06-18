/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { SettingsPage } from '../../pages/settings';
import { SigninPage } from '../../pages/signin';

test.describe('severity-1 #smoke', () => {
  test.beforeEach(async ({}, { project }) => {
    test.skip(
      project.name === 'production',
      'test plan not yet available in prod'
    );
  });

  test.describe('oauth prompt none', () => {
    test('fails if no user logged in', async ({
      page,
      target,
      pages: { relier },
      testAccountTracker,
    }) => {
      const { email } = testAccountTracker.generateAccountDetails();

      const query = new URLSearchParams({
        login_hint: email,
        return_on_error: 'false',
      });
      await page.goto(`${target.relierUrl}/?${query.toString()}`);
      await relier.signInPromptNone();

      //Verify error message
      expect(await relier.promptNoneError()).toContain('User is not signed in');
    });

    test('fails RP that is not allowed', async ({
      page,
      pages: { relier },
      testAccountTracker,
    }, { project }) => {
      test.skip(
        project.name !== 'local',
        'we dont have an untrusted oauth for stage and prod'
      );
      const { email } = testAccountTracker.generateAccountDetails();

      const query = new URLSearchParams({
        login_hint: email,
        return_on_error: 'false',
      });
      await page.goto(`http://localhost:10139` + `/?${query.toString()}`);
      await relier.signInPromptNone();

      //Verify error message
      expect(await relier.promptNoneError()).toContain(
        'prompt=none is not enabled for this client'
      );
    });

    test('fails if requesting keys', async ({
      page,
      target,
      pages: { relier },
      testAccountTracker,
    }) => {
      const { email } = testAccountTracker.generateAccountDetails();
      const query = new URLSearchParams({
        client_id: '7f368c6886429f19', // eslint-disable-line camelcase
        forceUA:
          'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Mobile Safari/537.36',
        // eslint-disable-next-line camelcase
        keys_jwk:
          'eyJrdHkiOiJFQyIsImtpZCI6Im9DNGFudFBBSFZRX1pmQ09RRUYycTRaQlZYblVNZ2xISGpVRzdtSjZHOEEiLCJjcnYiOi' +
          'JQLTI1NiIsIngiOiJDeUpUSjVwbUNZb2lQQnVWOTk1UjNvNTFLZVBMaEg1Y3JaQlkwbXNxTDk0IiwieSI6IkJCWDhfcFVZeHpTaldsdX' +
          'U5MFdPTVZwamIzTlpVRDAyN0xwcC04RW9vckEifQ',
        login_hint: email, // eslint-disable-line camelcase
        redirect_uri:
          'https://mozilla.github.io/notes/fxa/android-redirect.html', // eslint-disable-line camelcase
        scope: 'profile https://identity.mozilla.com/apps/notes',
        return_on_error: 'false',
      });
      await page.goto(`${target.relierUrl}/?${query.toString()}`);
      await relier.signInPromptNone();

      //Verify error message
      expect(await relier.promptNoneError()).toContain(
        'prompt=none cannot be used when requesting keys'
      );
    });

    test('fails if session is no longer valid', async ({
      page,
      target,
      pages: { relier, settings, signin },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await page.goto(target.contentServerUrl);
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();
      await target.authClient.accountDestroy(
        credentials.email,
        credentials.password,
        {},
        credentials.sessionToken
      );
      const query = new URLSearchParams({
        login_hint: credentials.email,
        return_on_error: 'false',
      });
      await page.goto(`${target.relierUrl}/?${query.toString()}`);
      await relier.signInPromptNone();

      //Verify error message
      expect(await relier.promptNoneError()).toContain('User is not signed in');
    });

    test('fails if account is not verified', async ({
      target,
      pages: { page, confirmSignupCode, relier, signin },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp({
        lang: 'en',
        preVerified: 'false',
      });

      await page.goto(target.contentServerUrl);
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      //Verify sign up code header
      await expect(page).toHaveURL(/confirm_signup_code/);

      const query = new URLSearchParams({
        login_hint: credentials.email,
        return_on_error: 'false',
      });
      await page.goto(`${target.relierUrl}/?${query.toString()}`);
      await relier.signInPromptNone();

      //Verify error message
      expect(await relier.promptNoneError()).toContain(
        'Unverified user or session'
      );
    });
  });

  test.describe('oauth prompt none with emails', () => {
    test('succeeds if login_hint same as logged in user', async ({
      page,
      target,
      pages: { relier, settings, signin },
      testAccountTracker,
    }) => {
      const { email } = await signInAccount(
        target,
        page,
        settings,
        signin,
        testAccountTracker
      );

      const query = new URLSearchParams({
        login_hint: email,
        return_on_error: 'false',
      });
      await page.goto(`${target.relierUrl}/?${query.toString()}`);
      await relier.signInPromptNone();

      //Verify logged in to relier
      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('succeeds if no login_hint is provided', async ({
      page,
      target,
      pages: { relier, settings, signin },
      testAccountTracker,
    }) => {
      await signInAccount(target, page, settings, signin, testAccountTracker);

      const query = new URLSearchParams({
        return_on_error: 'false',
      });
      await page.goto(`${target.relierUrl}/?${query.toString()}`);
      await relier.signInPromptNone();

      //Verify logged in to relier
      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('fails if login_hint is different to logged in user', async ({
      page,
      target,
      pages: { relier, settings, signin },
      testAccountTracker,
    }) => {
      const loginHintAccount = testAccountTracker.generateAccountDetails();
      await signInAccount(target, page, settings, signin, testAccountTracker);

      const query = new URLSearchParams({
        login_hint: loginHintAccount.email,
        return_on_error: 'false',
      });
      await page.goto(`${target.relierUrl}/?${query.toString()}`);
      await relier.signInPromptNone();

      //Verify error message
      expect(await relier.promptNoneError()).toContain(
        'A different user is signed in'
      );
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
