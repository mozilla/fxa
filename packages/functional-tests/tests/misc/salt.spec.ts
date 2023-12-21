/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';
import AuthClient from 'fxa-auth-client/browser';
import crypto from 'crypto';
import { SaltVersion } from 'fxa-auth-client/lib/salt';

test.describe('fxa-auth-client--e2e', () => {
  let email = '';
  let password = '';
  let curClient: AuthClient | undefined;

  function getClient(url: string, version: SaltVersion) {
    curClient = new AuthClient(url, {
      saltVersion: version,
    });
    return curClient;
  }

  async function signUp(client: AuthClient) {
    const credentials = await client.signUp(email, password, {
      keys: true,
      preVerified: 'true',
    });
    await client.deviceRegister(
      credentials.sessionToken,
      'playwright',
      'tester'
    );
    expect(credentials?.uid).toHaveLength(32);
    expect(credentials?.sessionToken).toHaveLength(64);
    expect(credentials?.keyFetchToken).toHaveLength(64);
    expect(credentials?.unwrapBKey).toHaveLength(64);

    return credentials;
  }

  test.beforeEach(() => {
    email = `signin${crypto.randomBytes(8).toString('hex')}@restmail.net`;
    password = `${crypto.randomBytes(10).toString('hex')}`;
  });

  test.afterEach(async ({ target }) => {
    await curClient?.accountDestroy(email, password);
  });

  test('it creates with v1 and signs in', async ({ target }) => {
    const client = getClient(target.authServerUrl, 1);

    await signUp(client);

    // Check the salt is V1
    let salt = await client.getLastUsedClientSalt(email);
    expect(salt).toMatch('quickStretch:');

    // Login IN
    const signInResult = await client.signIn(email, password);
    expect(signInResult?.clientSaltUpgraded).toEqual(true);

    salt = await client.getLastUsedClientSalt(email);
    expect(salt).toMatch('quickStretchV2:');
  });

  test('it creates with v2 and signs in', async ({ target }) => {
    const client = getClient(target.authServerUrl, 2);

    await signUp(client);

    // Check the salt is V1
    let salt = await client.getLastUsedClientSalt(email);
    expect(salt).toMatch('quickStretchV2:');

    // Login IN
    const signInResult = await client.signIn(email, password);
    expect(signInResult).toBeDefined();

    // No upgrade should have occurred. We created the account with a v2 salt
    expect(signInResult.clientSaltUpgraded).toBeUndefined();

    // The salt should still be a v2 salt
    salt = await client.getLastUsedClientSalt(email);
    expect(salt).toMatch('quickStretchV2:');
  });
});
