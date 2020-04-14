/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const TestServer = require('../test_server');
const Client = require('../client')();
const config = require('../../config').getProperties();

const CLIENT_ID = config.oauthServer.clients.find(
  client => client.trusted && client.canGrant && client.publicClient
).id;

describe('fetch user profile data', function() {
  this.timeout(15000);

  let server, client, email, password;
  before(async () => {
    if (config.subscriptions) {
      config.subscriptions.enabled = false;
    }
    config.oauth.url = 'http://localhost:9000';
    server = await TestServer.start(config, false);
  });

  after(async () => {
    await TestServer.stop(server);
  });

  describe('when a request is authenticated with a session token', async () => {
    beforeEach(async () => {
      client = await Client.create(
        config.publicUrl,
        server.uniqueEmail(),
        'password',
        {
          lang: 'en-US',
        }
      );
    });

    it('returns the profile data', async () => {
      const response = await client.accountProfile();

      assert.ok(response.email, 'email address is returned');
      assert.equal(response.locale, 'en-US', 'locale is returned');
      assert.deepEqual(
        response.authenticationMethods,
        ['pwd', 'email'],
        'authentication methods are returned'
      );
      assert.equal(
        response.authenticatorAssuranceLevel,
        1,
        'assurance level is returned'
      );
      assert.ok(response.profileChangedAt, 'profileChangedAt is returned');
    });
  });

  describe('when a request is authenticated with a valid oauth token', async () => {
    let token;

    async function initialize(scope) {
      email = server.uniqueEmail();
      password = 'test password';
      client = await Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        server.mailbox,
        { lang: 'en-US' }
      );

      const tokenResponse = await client.grantOAuthTokensFromSessionToken({
        grant_type: 'fxa-credentials',
        client_id: CLIENT_ID,
        access_type: 'offline',
        scope: scope,
      });

      token = tokenResponse.access_token;
    }

    it('returns the profile data', async () => {
      await initialize('profile');
      const response = await client.accountProfile(token);

      assert.ok(response.email, 'email address is returned');
      assert.equal(response.locale, 'en-US', 'locale is returned');
      assert.deepEqual(
        response.authenticationMethods,
        ['pwd', 'email'],
        'authentication methods are returned'
      );
      assert.equal(
        response.authenticatorAssuranceLevel,
        1,
        'assurance level is returned'
      );
      assert.ok(response.profileChangedAt, 'profileChangedAt is returned');
    });

    describe('scopes are applied to profile data returned', async () => {
      describe('scope does not authorize profile data', async () => {
        it('returns no profile data', async () => {
          await initialize('preadinglist payments');
          const response = await client.accountProfile(token);

          assert.deepEqual(response, {}, 'no info should be returned');
        });
      });

      describe('limited oauth scopes for profile data', async () => {
        it('returns only email for email only token', async () => {
          await initialize('profile:email');
          const response = await client.accountProfile(token);

          assert.ok(response.email, 'email address is returned');
          assert.ok(!response.locale, 'locale should not be returned');
          assert.ok(response.profileChangedAt, 'profileChangedAt is returned');
        });

        it('returns only locale for locale only token', async () => {
          await initialize('profile:locale');
          const response = await client.accountProfile(token);
          assert.ok(!response.email, 'email address should not be returned');
          assert.equal(response.locale, 'en-US', 'locale is returned');
          assert.ok(response.profileChangedAt, 'profileChangedAt is returned');
        });
      });

      describe('profile authenticated with :write scopes', async () => {
        describe('profile:write', async () => {
          it('returns profile data', async () => {
            await initialize('profile:write');
            const response = await client.accountProfile(token);

            assert.ok(response.email, 'email address is returned');
            assert.ok(response.locale, 'locale is returned');
            assert.ok(
              response.authenticationMethods,
              'authenticationMethods is returned'
            );
            assert.ok(
              response.authenticatorAssuranceLevel,
              'authenticatorAssuranceLevel is returned'
            );
            assert.ok(
              response.profileChangedAt,
              'profileChangedAt is returned'
            );
          });
        });

        describe('profile:locale:write readinglist', async () => {
          it('returns limited profile data', async () => {
            await initialize('profile:locale:write readinglist');
            const response = await client.accountProfile(token);

            assert.ok(!response.email, 'email address should not be returned');
            assert.ok(response.locale, 'locale is returned');
            assert.ok(
              !response.authenticationMethods,
              'authenticationMethods should not be returned'
            );
            assert.ok(
              !response.authenticatorAssuranceLevel,
              'authenticatorAssuranceLevel should not be returned'
            );
          });
        });

        describe('profile:email:write storage', async () => {
          it('returns limited profile data', async () => {
            await initialize('profile:email:write storage');
            const response = await client.accountProfile(token);

            assert.ok(response.email, 'email address is returned');
            assert.ok(!response.locale, 'locale should not be returned');
            assert.ok(
              !response.authenticationMethods,
              'authenticationMethods should not be returned'
            );
            assert.ok(
              !response.authenticatorAssuranceLevel,
              'authenticatorAssuranceLevel should not be returned'
            );
          });
        });

        describe('profile:email:write profile:amr', async () => {
          it('returns limited profile data', async () => {
            await initialize('profile:email:write profile:amr');
            const response = await client.accountProfile(token);

            assert.ok(response.email, 'email address is returned');
            assert.ok(!response.locale, 'locale should not be returned');
            assert.ok(
              response.authenticationMethods,
              'authenticationMethods is returned'
            );
            assert.ok(
              response.authenticatorAssuranceLevel,
              'authenticatorAssuranceLevel is returned'
            );
          });
        });
      });
    });
  });

  describe('when the profile data is not default', async () => {
    describe('when the email address is unicode', async () => {
      it('returns the email address correctly with the profile data', async () => {
        const email = server.uniqueUnicodeEmail();

        client = await Client.create(config.publicUrl, email, 'password');
        const response = await client.accountProfile();
        assert.equal(response.email, email, 'email address is returned');
      });
    });

    describe('when the account has TOTP', async () => {
      it('returns correct TOTP status in profile data', async () => {
        client = await Client.createAndVerifyAndTOTP(
          config.publicUrl,
          server.uniqueEmail(),
          'password',
          server.mailbox,
          { lang: 'en-US' }
        );

        const res = await client.grantOAuthTokensFromSessionToken({
          grant_type: 'fxa-credentials',
          client_id: CLIENT_ID,
          access_type: 'offline',
          scope: 'profile',
        });

        const response = await client.accountProfile(res.access_token);
        assert.ok(response.email, 'email address is returned');
        assert.equal(response.locale, 'en-US', 'locale is returned');
        assert.deepEqual(
          response.authenticationMethods,
          ['pwd', 'email', 'otp'],
          'correct authentication methods are returned'
        );
        assert.equal(
          response.authenticatorAssuranceLevel,
          2,
          'correct assurance level is returned'
        );
      });
    });

    describe('when the locale is empty', async () => {
      it('returns the profile data successfully', async () => {
        email = server.uniqueEmail();
        password = 'test password';
        client = await Client.createAndVerify(
          config.publicUrl,
          email,
          password,
          server.mailbox
        );

        const res = await client.grantOAuthTokensFromSessionToken({
          grant_type: 'fxa-credentials',
          client_id: CLIENT_ID,
          scope: 'profile:locale',
        });

        const response = await client.accountProfile(res.access_token);
        assert.isUndefined(response.locale);
      });
    });
  });
});
