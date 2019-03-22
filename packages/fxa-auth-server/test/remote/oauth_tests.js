/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const TestServer = require('../test_server');
const Client = require('../client')();
const config = require('../../config').getProperties();
const error = require('../../lib/error');
const testUtils = require('../lib/util');
const oauthServerModule = require('../../fxa-oauth-server/lib/server');

const PUBLIC_CLIENT_ID = '3c49430b43dfba77';
const MOCK_CODE_VERIFIER = 'abababababababababababababababababababababa';
const MOCK_CODE_CHALLENGE = 'YPhkZqm08uTfwjNSiYcx80-NPT9Zn94kHboQW97KyV0';

describe('/oauth/ routes', function () {
  this.timeout(15000);
  let client;
  let email;
  let oauthServer;
  let password;
  let server;

  before(async () => {
    testUtils.disableLogs();
    oauthServer = await oauthServerModule.create();
    await oauthServer.start();
    server = await TestServer.start(config, false, {oauthServer});
  });

  after(async () => {
    await TestServer.stop(server);
    await oauthServer.stop();
    testUtils.restoreStdoutWrite();
  });

  beforeEach(async () => {
    email = server.uniqueEmail();
    password = 'test password';
    client = await Client.createAndVerify(config.publicUrl, email, password, server.mailbox);
  });

  it('successfully grants an authorization code', async () => {
    const res = await client.createAuthorizationCode({
      client_id: PUBLIC_CLIENT_ID,
      state: 'xyz',
      code_challenge: MOCK_CODE_CHALLENGE,
      code_challenge_method: 'S256',
    });
    assert.ok(res.redirect);
    assert.ok(res.code);
    assert.equal(res.state, 'xyz');
  });

  it('rejects invalid sessionToken', async () => {
    const sessionToken = client.sessionToken;
    await client.destroySession();
    client.sessionToken = sessionToken;
    try {
      await client.createAuthorizationCode({
        client_id: PUBLIC_CLIENT_ID,
        state: 'xyz',
        code_challenge: MOCK_CODE_CHALLENGE,
        code_challenge_method: 'S256',
      });
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.INVALID_TOKEN);
    }
  });

  it('rejects `assertion` parameter in /authorization request', async () => {
    try {
      await client.createAuthorizationCode({
        client_id: PUBLIC_CLIENT_ID,
        state: 'xyz',
        assertion: 'a~b'
      });
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.INVALID_PARAMETER);
      assert.equal(err.validation.keys[0], 'assertion', 'assertion param caught in validation');
    }
  });

  it('successfully grants tokens from sessionToken', async () => {
    const SCOPE = 'https://identity.mozilla.com/apps/oldsync';
    const res = await client.grantOAuthTokensFromSessionToken({
      grant_type: 'fxa-credentials',
      client_id: PUBLIC_CLIENT_ID,
      access_type: 'offline',
      scope: SCOPE
    });

    assert.ok(res.access_token);
    assert.ok(res.refresh_token);
    assert.equal(res.scope, SCOPE);
    assert.ok(res.auth_at);
    assert.ok(res.expires_in);
    assert.ok(res.token_type);
  });

  it('successfully grants tokens via authentication code flow, and refresh token flow', async () => {
    const SCOPE = 'https://identity.mozilla.com/apps/oldsync openid';

    let res = await client.createAuthorizationCode({
      client_id: PUBLIC_CLIENT_ID,
      state: 'abc',
      code_challenge: MOCK_CODE_CHALLENGE,
      code_challenge_method: 'S256',
      scope: SCOPE,
      access_type: 'offline',
    });
    assert.ok(res.code);

    res = await client.grantOAuthTokens({
      client_id: PUBLIC_CLIENT_ID,
      code: res.code,
      code_verifier: MOCK_CODE_VERIFIER,
    });
    assert.ok(res.access_token);
    assert.ok(res.refresh_token);
    assert.ok(res.id_token);
    assert.equal(res.scope, SCOPE);
    assert.ok(res.auth_at);
    assert.ok(res.expires_in);
    assert.ok(res.token_type);

    const res2 = await client.grantOAuthTokens({
      client_id: PUBLIC_CLIENT_ID,
      refresh_token: res.refresh_token,
      grant_type: 'refresh_token',
    });
    assert.ok(res.access_token);
    assert.equal(res.scope, SCOPE);
    assert.ok(res.expires_in);
    assert.ok(res.token_type);
    assert.notEqual(res.access_token, res2.access_token);
  });
});
