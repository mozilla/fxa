/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const nock = require('nock');
const oauthdbModule = require('../../../lib/oauthdb');
const { mockLog } = require('../../mocks');

const mockConfig = {
  publicUrl: 'https://accounts.example.com',
  oauth: {
    url: 'https://oauth.server.com',
    secretKey: 'secret-key-oh-secret-key',
  },
  domain: 'accounts.example.com',
};
const mockOAuthServer = nock(mockConfig.oauth.url).defaultReplyHeaders({
  'Content-Type': 'application/json',
});

describe('oauthdb/revokeRefreshToken', () => {
  let oauthdb;

  afterEach(async () => {
    assert.ok(
      nock.isDone(),
      'there should be no pending request mocks at the end of a test'
    );
    if (oauthdb) {
      await oauthdb.close();
    }
  });

  it('can return a token', async () => {
    mockOAuthServer.post('/v1/destroy', body => true).reply(200, {});
    oauthdb = oauthdbModule(mockLog(), mockConfig);
    const resp = await oauthdb.revokeRefreshTokenById(
      'DEADBEEFDEADBEEFDEADBEEFDEADBEEF'
    );

    assert.ok(resp);
  });
});
