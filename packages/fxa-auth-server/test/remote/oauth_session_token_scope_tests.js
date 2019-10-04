/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const TestServer = require('../test_server');
const Client = require('../client')();
const config = require('../../config').getProperties();
const {
  OAUTH_SCOPE_SESSION_TOKEN,
  OAUTH_SCOPE_OLD_SYNC,
} = require('../../lib/constants');
const error = require('../../lib/error');
const testUtils = require('../lib/util');

const OAUTH_CLIENT_NAME = 'Android Components Reference Browser';
const PUBLIC_CLIENT_ID = '3c49430b43dfba77';
const MOCK_CODE_VERIFIER = 'abababababababababababababababababababababa';
const MOCK_CODE_CHALLENGE = 'YPhkZqm08uTfwjNSiYcx80-NPT9Zn94kHboQW97KyV0';

describe('/oauth/ session token scope', function() {
  this.timeout(15000);
  let client;
  let email;
  let password;
  let server;

  before(async () => {
    testUtils.disableLogs();
    server = await TestServer.start(config, false);
  });

  after(async () => {
    await TestServer.stop(server);
    testUtils.restoreStdoutWrite();
  });

  beforeEach(async () => {
    email = server.uniqueEmail();
    password = 'test password';
    client = await Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox
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
    assert.ok(res.redirect);
    assert.ok(res.code);
    assert.equal(res.state, 'xyz');

    const tokenRes = await client.grantOAuthTokens({
      client_id: PUBLIC_CLIENT_ID,
      code: res.code,
      code_verifier: MOCK_CODE_VERIFIER,
    });
    assert.ok(tokenRes.access_token);
    assert.ok(tokenRes.session_token);
    assert.notEqual(tokenRes.session_token, client.sessionToken);
    assert.notOk(tokenRes.session_token_id);
    assert.equal(tokenRes.scope, SCOPE);
    assert.ok(tokenRes.auth_at);
    assert.ok(tokenRes.expires_in);
    assert.ok(tokenRes.token_type);
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
    assert.ok(tokenRes.access_token);
    assert.ok(tokenRes.session_token);
    assert.ok(tokenRes.refresh_token);
    // added a new device
    const allClients = await client.attachedClients();
    assert.equal(allClients.length, 2);
    assert.ok(allClients[0].sessionTokenId);
    assert.equal(allClients[0].name, OAUTH_CLIENT_NAME);
    assert.ok(allClients[1].sessionTokenId);
    // the 'isCurrentSession' should be attached to the original device
    // and not the newly created device entry
    assert.isFalse(
      allClients[0].isCurrentSession,
      'session is not on the new device'
    );
    assert.isTrue(
      allClients[1].isCurrentSession,
      'session is still the original device'
    );
    assert.notEqual(allClients[0].sessionTokenId, allClients[1].sessionTokenId);
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
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.UNKNOWN_AUTHORIZATION_CODE);
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
    assert.ok(tokenRes.access_token);
    assert.notOk(tokenRes.session_token);
    assert.notOk(tokenRes.session_token_id);
  });
});
