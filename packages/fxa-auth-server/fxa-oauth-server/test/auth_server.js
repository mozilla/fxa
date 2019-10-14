/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const nock = require('nock');
const auth_serverModule = require('../lib/auth_server');

const mockConfig = {
  publicUrl: 'https://accounts.example.com',
  auth: {
    poolee: {},
    jwtSecretKey: 'secret-key-oh-secret-key',
    url: 'https://auth.server.com',
  },
  domain: 'accounts.example.com',
  audience: 'https://accounts.example.com',
};

describe('lib/auth_server', () => {
  const mockLog = {
    error() {},
    trace() {},
    warn() {},
  };
  const authServer = auth_serverModule(mockLog, mockConfig);
  let mockAuthServer;

  beforeEach(() => {
    mockAuthServer = nock(mockConfig.auth.url).defaultReplyHeaders({
      'Content-Type': 'application/json',
    });
  });

  describe('getUserProfile', () => {
    it('gets the user profile', async () => {
      mockAuthServer.get('/v1/account/profile').reply(200, {
        authenticationMethods: ['password'],
        authenticatorAssuranceLevel: 1,
        email: 'testuser@testuser.com',
        ignored: true,
        locale: 'fr',
        profileChangedAt: 1234,
        subscriptions: ['subscription1'],
      });

      const profile = await authServer.getUserProfile({
        uid: 'uid',
        client_id: 'deadbeef',
        scope: 'profile',
      });

      assert.deepEqual(profile.authenticationMethods, ['password']);
      assert.equal(profile.authenticatorAssuranceLevel, 1);
      assert.equal(profile.email, 'testuser@testuser.com');
      assert.notProperty(profile, 'ignored');
      assert.equal(profile.locale, 'fr');
      assert.equal(profile.profileChangedAt, 1234);
      assert.deepEqual(profile.subscriptions, ['subscription1']);
    });

    it('returns correct error for invalidToken', async () => {
      mockAuthServer.get('/v1/account/profile').reply(400, {
        code: 400,
        errno: 110,
        message: 'Invalid token',
      });

      try {
        await authServer.getUserProfile({
          uid: 'uid',
          client_id: 'deadbeef',
          scope: 'profile',
        });
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.errno, 108);
        assert.equal(err.message, 'Invalid token');
      }
    });

    it('validates the response data', async () => {
      mockAuthServer.get('/v1/account/profile').reply(200, {
        authenticatorAssuranceLevel: 'AAL1',
      });
      try {
        await authServer.getUserProfile({
          uid: 'uid',
          client_id: 'deadbeef',
          scope: 'profile',
        });
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.message, 'Invalid request parameter');
        assert.equal(
          err.output.payload.validation,
          'authenticatorAssuranceLevel'
        );
      }
    });
  });
});
