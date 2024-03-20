/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';

const password = 'passwordzxcv';

test.describe('severity-1 #smoke', () => {
  test.describe('oauth prompt none', () => {
    test.beforeEach(async ({ pages: { login } }, { project }) => {
      test.slow();

      test.skip(
        project.name === 'production',
        'test plan not yet available in prod'
      );
    });

    test('fails if no user logged in', async ({
      page,
      standardEmail,
      target,
      pages: { relier },
    }) => {
      const query = new URLSearchParams({
        login_hint: standardEmail,
        return_on_error: 'false',
      });
      await page.goto(`${target.relierUrl}/?${query.toString()}`);
      await relier.signInPromptNone();

      //Verify error message
      expect(await relier.promptNoneError()).toContain('User is not signed in');
    });

    test('fails RP that is not allowed', async ({
      standardEmail,
      page,
      pages: { relier },
    }, { project }) => {
      test.skip(
        project.name !== 'local',
        'we dont have an untrusted oauth for stage and prod'
      );
      const query = new URLSearchParams({
        login_hint: standardEmail,
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
      standardEmail,
      target,
      pages: { relier },
    }) => {
      const query = new URLSearchParams({
        client_id: '7f368c6886429f19', // eslint-disable-line camelcase
        forceUA:
          'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Mobile Safari/537.36',
        // eslint-disable-next-line camelcase
        keys_jwk:
          'eyJrdHkiOiJFQyIsImtpZCI6Im9DNGFudFBBSFZRX1pmQ09RRUYycTRaQlZYblVNZ2xISGpVRzdtSjZHOEEiLCJjcnYiOi' +
          'JQLTI1NiIsIngiOiJDeUpUSjVwbUNZb2lQQnVWOTk1UjNvNTFLZVBMaEg1Y3JaQlkwbXNxTDk0IiwieSI6IkJCWDhfcFVZeHpTaldsdX' +
          'U5MFdPTVZwamIzTlpVRDAyN0xwcC04RW9vckEifQ',
        login_hint: standardEmail, // eslint-disable-line camelcase
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
      standardEmail,
      target,
      pages: { relier, login },
    }) => {
      const creds = await target.auth.signUp(standardEmail, password, {
        lang: 'en',
        preVerified: 'true',
      });
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await login.fillOutEmailFirstSignIn(standardEmail, password);

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);
      await target.auth.accountDestroy(
        standardEmail,
        password,
        {},
        creds.sessionToken
      );

      const query = new URLSearchParams({
        login_hint: standardEmail,
        return_on_error: 'false',
      });
      await page.goto(`${target.relierUrl}/?${query.toString()}`);
      await relier.signInPromptNone();

      //Verify error message
      expect(await relier.promptNoneError()).toContain('User is not signed in');
    });

    test('fails if account is not verified', async ({
      page,
      standardEmail,
      target,
      pages: { relier, login },
    }) => {
      test.fixme(true, 'test to be fixed, see FXA-9194');
      await target.auth.signUp(standardEmail, password, {
        lang: 'en',
        preVerified: 'false',
      });
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await login.fillOutEmailFirstSignIn(standardEmail, password);

      //Verify sign up code header
      expect(login.signUpCodeHeader()).toBeVisible();

      const query = new URLSearchParams({
        login_hint: standardEmail,
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
    test.beforeEach(async ({ pages: { login } }, { project }) => {
      test.slow();

      test.skip(
        project.name === 'production',
        'test plan not yet available in prod'
      );
    });

    test('fails if login_hint is different to logged in user', async ({
      page,
      standardEmail,
      target,
      pages: { relier, login },
    }) => {
      await target.auth.signUp(standardEmail, password, {
        lang: 'en',
        preVerified: 'true',
      });
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await login.fillOutEmailFirstSignIn(standardEmail, password);

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);

      const query = new URLSearchParams({
        login_hint: login.createEmail(),
        return_on_error: 'false',
      });
      await page.goto(`${target.relierUrl}/?${query.toString()}`);

      await relier.signInPromptNone();

      //Verify error message
      expect(await relier.promptNoneError()).toContain(
        'A different user is signed in'
      );
    });

    test('succeeds if login_hint same as logged in user', async ({
      page,
      standardEmail,
      target,
      pages: { relier, login },
    }) => {
      await target.auth.signUp(standardEmail, password, {
        lang: 'en',
        preVerified: 'true',
      });
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await login.fillOutEmailFirstSignIn(standardEmail, password);

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);

      const query = new URLSearchParams({
        login_hint: standardEmail,
        return_on_error: 'false',
      });
      await page.goto(`${target.relierUrl}/?${query.toString()}`);

      await relier.signInPromptNone();

      //Verify logged in to relier
      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('succeeds if no login_hint is provided', async ({
      page,
      standardEmail,
      target,
      pages: { relier, login },
    }) => {
      await target.auth.signUp(standardEmail, password, {
        lang: 'en',
        preVerified: 'true',
      });
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await login.fillOutEmailFirstSignIn(standardEmail, password);

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);

      const query = new URLSearchParams({
        return_on_error: 'false',
      });
      await page.goto(`${target.relierUrl}/?${query.toString()}`);

      await relier.signInPromptNone();

      //Verify logged in to relier
      expect(await relier.isLoggedIn()).toBe(true);
    });
  });
});
