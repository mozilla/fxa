/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createTestServer, TestServerInstance } from '../support/helpers/test-server';

const Client = require('../client')();
const {
  OAUTH_SCOPE_SESSION_TOKEN,
  OAUTH_SCOPE_OLD_SYNC,
} = require('fxa-shared/oauth/constants');
const { AppError: error } = require('@fxa/accounts/errors');

const OAUTH_CLIENT_NAME = 'Android Components Reference Browser';
const PUBLIC_CLIENT_ID = '3c49430b43dfba77';
const MOCK_CODE_VERIFIER = 'abababababababababababababababababababababa';
const MOCK_CODE_CHALLENGE = 'YPhkZqm08uTfwjNSiYcx80-NPT9Zn94kHboQW97KyV0';

let server: TestServerInstance;

beforeAll(async () => {
  server = await createTestServer();
}, 120000);

afterAll(async () => {
  await server.stop();
});

const testVersions = [
  { version: '', tag: '' },
  { version: 'V2', tag: 'V2' },
];

describe.each(testVersions)(
  '#integration$tag - /oauth/ session token scope',
  ({ version, tag }) => {
    const testOptions = { version };
    let client: any;
    let email: string;
    let password: string;

    beforeEach(async () => {
      email = server.uniqueEmail();
      password = 'test password';
      client = await Client.createAndVerify(
        server.publicUrl, email, password, server.mailbox, testOptions
      );
    });

    it('provides a session token using the session token scope', async () => {
      const SCOPE = OAUTH_SCOPE_SESSION_TOKEN;
      const res = await client.createAuthorizationCode({
        client_id: PUBLIC_CLIENT_ID,
        scope: SCOPE,
        state: 'xyz',
        code_challenge: MOCK_CODE_CHALLENGE,
        code_challenge_method: 'S256',
      });
      expect(res.redirect).toBeTruthy();
      expect(res.code).toBeTruthy();
      expect(res.state).toBe('xyz');

      const tokenRes = await client.grantOAuthTokens({
        client_id: PUBLIC_CLIENT_ID,
        code: res.code,
        code_verifier: MOCK_CODE_VERIFIER,
      });
      expect(tokenRes.access_token).toBeTruthy();
      expect(tokenRes.session_token).toBeTruthy();
      expect(tokenRes.session_token).not.toBe(client.sessionToken);
      expect(tokenRes.session_token_id).toBeFalsy();
      expect(tokenRes.scope).toBe(SCOPE);
      expect(tokenRes.auth_at).toBeTruthy();
      expect(tokenRes.expires_in).toBeTruthy();
      expect(tokenRes.token_type).toBeTruthy();
    });

    it('works with oldsync and session token scopes', async () => {
      const SCOPE = `${OAUTH_SCOPE_SESSION_TOKEN} ${OAUTH_SCOPE_OLD_SYNC}`;
      const res = await client.createAuthorizationCode({
        client_id: PUBLIC_CLIENT_ID,
        scope: SCOPE,
        state: 'xyz',
        code_challenge: MOCK_CODE_CHALLENGE,
        code_challenge_method: 'S256',
        access_type: 'offline',
      });

      const tokenRes = await client.grantOAuthTokens({
        client_id: PUBLIC_CLIENT_ID,
        code: res.code,
        code_verifier: MOCK_CODE_VERIFIER,
      });
      expect(tokenRes.access_token).toBeTruthy();
      expect(tokenRes.session_token).toBeTruthy();
      expect(tokenRes.refresh_token).toBeTruthy();

      const allClients = await client.attachedClients();
      expect(allClients.length).toBe(2);
      expect(allClients[0].sessionTokenId).toBeTruthy();
      expect(allClients[0].name).toBe(OAUTH_CLIENT_NAME);
      expect(allClients[1].sessionTokenId).toBeTruthy();
      expect(allClients[0].isCurrentSession).toBe(false);
      expect(allClients[1].isCurrentSession).toBe(true);
      expect(allClients[0].sessionTokenId).not.toBe(allClients[1].sessionTokenId);
    });

    it('rejects invalid sessionToken', async () => {
      const res = await client.createAuthorizationCode({
        client_id: PUBLIC_CLIENT_ID,
        scope: OAUTH_SCOPE_SESSION_TOKEN,
        state: 'xyz',
        code_challenge: MOCK_CODE_CHALLENGE,
        code_challenge_method: 'S256',
      });

      await client.destroySession();
      try {
        await client.grantOAuthTokens({
          client_id: PUBLIC_CLIENT_ID,
          code: res.code,
          code_verifier: MOCK_CODE_VERIFIER,
        });
        throw new Error('should have thrown');
      } catch (err: any) {
        expect(err.errno).toBe(error.ERRNO.INVALID_TOKEN);
      }
    });

    it('contains no token when scopes is not set', async () => {
      const res = await client.createAuthorizationCode({
        client_id: PUBLIC_CLIENT_ID,
        scope: 'profile',
        state: 'xyz',
        code_challenge: MOCK_CODE_CHALLENGE,
        code_challenge_method: 'S256',
      });

      const tokenRes = await client.grantOAuthTokens({
        client_id: PUBLIC_CLIENT_ID,
        code: res.code,
        code_verifier: MOCK_CODE_VERIFIER,
      });
      expect(tokenRes.access_token).toBeTruthy();
      expect(tokenRes.session_token).toBeFalsy();
      expect(tokenRes.session_token_id).toBeFalsy();
    });
  }
);
