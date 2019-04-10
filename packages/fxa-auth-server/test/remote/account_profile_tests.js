/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const TestServer = require('../test_server');
const Client = require('../client')();

const config = require('../../config').getProperties();

const PRODUCT_ID = 'megaProductHooray';
const CLIENT_ID = 'client8675309';
const CLIENT_ID_FOR_DEFAULT = 'client5551212';
const PLAN_ID = 'allDoneProMonthly';
const PAYMENT_TOKEN = 'pay8675309';

function makeMockOAuthHeader(opts) {
  const token = Buffer.from(JSON.stringify(opts)).toString('hex');
  return `Bearer ${  token}`;
}

function startTestServer(subscriptionsEnabled = true) {
  config.oauth.url = 'http://localhost:9010';
  config.subhub.useStubs = true;
  config.subhub.stubs = {
    plans: [
      {
        plan_id: PLAN_ID,
        product_id: PRODUCT_ID,
        interval: 'month',
        amount: 50,
        currency: 'usd'
      }
    ]
  };
  config.subscriptions = {
    enabled: subscriptionsEnabled,
    productCapabilities: {
      'defaultRegistered': [ 'isRegistered' ],
      'defaultSubscribed': [ 'isSubscribed' ],
      [ PRODUCT_ID ]: [ '123donePro', '321donePro', 'FirefoxPlus', 'MechaMozilla' ],
    },
    clientCapabilities: {
      [ CLIENT_ID ]: [ '123donePro', 'ILikePie', 'MechaMozilla', 'FooBar' ],
      [ CLIENT_ID_FOR_DEFAULT ]: [ 'isRegistered', 'isSubscribed' ],
    }
  };
  return TestServer.start(config);
}

describe('remote account profile', function() {
  this.timeout(15000);

  let server;
  before(async () => {
    server = await startTestServer();
  });

  it(
    'account profile authenticated with session returns profile data',
    () => {
      return Client.create(config.publicUrl, server.uniqueEmail(), 'password', { lang: 'en-US' })
        .then(c => {
          return c.api.accountProfile(c.sessionToken);
        })
        .then(response => {
          assert.ok(response.email, 'email address is returned');
          assert.equal(response.locale, 'en-US', 'locale is returned');
          assert.deepEqual(response.authenticationMethods, ['pwd', 'email'], 'authentication methods are returned');
          assert.equal(response.authenticatorAssuranceLevel, 1, 'assurance level is returned');
          assert.ok(response.profileChangedAt, 'profileChangedAt is returned');
        });
    }
  );

  it(
    'account profile authenticated with oauth returns profile data',
    () => {
      return Client.create(config.publicUrl, server.uniqueEmail(), 'password', { lang: 'en-US' })
        .then(c => {
          return c.api.accountProfile(null, {
            Authorization: makeMockOAuthHeader({
              user: c.uid,
              scope: ['profile']
            })
          });
        })
        .then(response => {
          assert.ok(response.email, 'email address is returned');
          assert.equal(response.locale, 'en-US', 'locale is returned');
          assert.deepEqual(response.authenticationMethods, ['pwd', 'email'], 'authentication methods are returned');
          assert.equal(response.authenticatorAssuranceLevel, 1, 'assurance level is returned');
          assert.ok(response.profileChangedAt, 'profileChangedAt is returned');
        });
    }
  );

  it(
    'account profile with no authentication returns a 401',
    () => {
      return Client.create(config.publicUrl, server.uniqueEmail(), 'password', { lang: 'en-US' })
        .then(c => {
          return c.api.accountProfile(null, {});
        })
        .then(
          (response) => { assert.fail('request should have failed'); },
          (err) => {
            assert.equal(err.code, 401, 'request failed with a 401');
          }
        );
    }
  );

  it(
    'account profile authenticated with invalid oauth token returns an error',
    () => {
      return Client.create(config.publicUrl, server.uniqueEmail(), 'password', { lang: 'en-US' })
        .then(c => {
          return c.api.accountProfile(null, {
            Authorization: makeMockOAuthHeader({
              code: 401,
              errno: 108
            })
          });
        })
        .then(
          () => { assert(false, 'should get an error'); },
          (e) => {
            assert.equal(e.code, 401, 'correct error status code');
            assert.equal(e.errno, 110, 'correct errno');
          }
        );
    }
  );

  it(
    'account status authenticated with oauth for unknown uid returns an error',
    () => {
      return Client.create(config.publicUrl, server.uniqueEmail(), 'password', { lang: 'en-US' })
        .then(c => {
          const UNKNOWN_UID = 'abcdef123456';
          assert.notEqual(c.uid, UNKNOWN_UID);
          return c.api.accountProfile(null, {
            Authorization: makeMockOAuthHeader({
              user: UNKNOWN_UID,
              scope: ['profile']
            })
          });
        })
        .then(
          () => {
            assert(false, 'should get an error');
          },
          (e) => {
            assert.equal(e.code, 400, 'correct error status code');
            assert.equal(e.errno, 102, 'correct errno');
          }
        );
    }
  );

  it(
    'account status authenticated with oauth for wrong scope returns no info',
    () => {
      return Client.create(config.publicUrl, server.uniqueEmail(), 'password', { lang: 'en-US' })
        .then(c => {
          return c.api.accountProfile(null, {
            Authorization: makeMockOAuthHeader({
              user: c.uid,
              scope: ['readinglist', 'payments']
            })
          });
        })
        .then(response => {
          assert.deepEqual(response, {}, 'no info should be returned');
        });
    }
  );

  it(
    'account profile authenticated with limited oauth scopes returns limited profile data',
    () => {
      let client;
      return Client.create(config.publicUrl, server.uniqueEmail(), 'password', { lang: 'en-US' })
        .then(c => {
          client = c;
          return client.api.accountProfile(null, {
            Authorization: makeMockOAuthHeader({
              user: client.uid,
              scope: ['profile:email']
            })
          });
        })
        .then(response => {
          assert.ok(response.email, 'email address is returned');
          assert.ok(! response.locale, 'locale should not be returned');
          assert.ok(response.profileChangedAt, 'profileChangedAt is returned');
        })
        .then(() => {
          return client.api.accountProfile(null, {
            Authorization: makeMockOAuthHeader({
              user: client.uid,
              scope: ['profile:locale']
            })
          });
        })
        .then(response => {
          assert.ok(! response.email, 'email address should not be returned');
          assert.equal(response.locale, 'en-US', 'locale is returned');
          assert.ok(response.profileChangedAt, 'profileChangedAt is returned');
        });
    }
  );

  it(
    'account profile authenticated with oauth :write scopes returns profile data',
    () => {
      let client;
      return Client.create(config.publicUrl, server.uniqueEmail(), 'password', { lang: 'en-US' })
        .then(c => {
          client = c;
          return client.api.accountProfile(null, {
            Authorization: makeMockOAuthHeader({
              user: client.uid,
              scope: ['profile:write']
            })
          });
        })
        .then(response => {
          assert.ok(response.email, 'email address is returned');
          assert.ok(response.locale, 'locale is returned');
          assert.ok(response.authenticationMethods, 'authenticationMethods is returned');
          assert.ok(response.authenticatorAssuranceLevel, 'authenticatorAssuranceLevel is returned');
          assert.ok(response.profileChangedAt, 'profileChangedAt is returned');
        })
        .then(() => {
          return client.api.accountProfile(null, {
            Authorization: makeMockOAuthHeader({
              user: client.uid,
              scope: ['profile:locale:write', 'readinglist']
            })
          });
        })
        .then(response => {
          assert.ok(! response.email, 'email address should not be returned');
          assert.ok(response.locale, 'locale is returned');
          assert.ok(! response.authenticationMethods, 'authenticationMethods should not be returned');
          assert.ok(! response.authenticatorAssuranceLevel, 'authenticatorAssuranceLevel should not be returned');
        })
        .then(() => {
          return client.api.accountProfile(null, {
            Authorization: makeMockOAuthHeader({
              user: client.uid,
              scope: ['storage', 'profile:email:write']
            })
          });
        })
        .then(response => {
          assert.ok(response.email, 'email address is returned');
          assert.ok(! response.locale, 'locale should not be returned');
          assert.ok(! response.authenticationMethods, 'authenticationMethods should not be returned');
          assert.ok(! response.authenticatorAssuranceLevel, 'authenticatorAssuranceLevel should not be returned');
        })
        .then(() => {
          return client.api.accountProfile(null, {
            Authorization: makeMockOAuthHeader({
              user: client.uid,
              scope: ['profile:amr', 'profile:email:write']
            })
          });
        })
        .then(response => {
          assert.ok(response.email, 'email address is returned');
          assert.ok(! response.locale, 'locale should not be returned');
          assert.ok(response.authenticationMethods, 'authenticationMethods is returned');
          assert.ok(response.authenticatorAssuranceLevel, 'authenticatorAssuranceLevel is returned');
        });
    }
  );

  it(
    'account profile works with unicode email address',
    () => {
      const email = server.uniqueUnicodeEmail();
      return Client.create(config.publicUrl, email, 'password')
        .then(c => {
          return c.api.accountProfile(c.sessionToken);
        })
        .then(response => {
          assert.equal(response.email, email, 'email address is returned');
        });
    }
  );

  it(
    'account profile reflects TOTP status',
    () => {
      return Client.createAndVerifyAndTOTP(config.publicUrl, server.uniqueEmail(), 'password', server.mailbox, { lang: 'en-US' })
        .then(c => {
          return c.api.accountProfile(null, {
            Authorization: makeMockOAuthHeader({
              user: c.uid,
              scope: ['profile']
            })
          });
        })
        .then(response => {
          assert.ok(response.email, 'email address is returned');
          assert.equal(response.locale, 'en-US', 'locale is returned');
          assert.deepEqual(response.authenticationMethods, ['pwd', 'email', 'otp'], 'correct authentication methods are returned');
          assert.equal(response.authenticatorAssuranceLevel, 2, 'correct assurance level is returned');
        });
    }
  );

  describe('subscription capabilities status', () => {
    let email, client;
    beforeEach(async () => {
      email = server.uniqueEmail();
      client = await Client.create(
        config.publicUrl,
        email,
        'password',
        { lang: 'en-US' }
      );
    });

    it('should report default registered capability with session token', async () => {
      const response = await client.api.accountProfile(client.sessionToken);
      assert.deepEqual(response.subscriptions, [ 'isRegistered' ]);
    });

    it('should not include subscriptions at all if account has none for OAuth client', async () => {
      const response = await client.api.accountProfile(null, {
        Authorization: makeMockOAuthHeader({
          user: client.uid,
          client_id: CLIENT_ID,
          scope: ['profile:subscriptions']
        })
      });
      assert.isNotOk('subscriptions' in response);
    });

    it('should report default registered capability to OAuth client', async () => {
      const response = await client.api.accountProfile(null, {
        Authorization: makeMockOAuthHeader({
          user: client.uid,
          client_id: CLIENT_ID_FOR_DEFAULT,
          scope: ['profile:subscriptions']
        })
      });
      assert.deepEqual(response.subscriptions, [ 'isRegistered' ]);
    });

    describe('with a subscription', () => {
      beforeEach(async () => {
        await client.api.createSubscription(
          PLAN_ID,
          PAYMENT_TOKEN,
          {
            Authorization: makeMockOAuthHeader({
              user: client.uid,
              client_id: CLIENT_ID,
              scope: ['profile', 'https://identity.mozilla.com/account/subscriptions']
            })
          }
        );
      });

      it('should report all subscription capabilities to session token client', async () => {
        const response = await client.api.accountProfile(client.sessionToken);
        assert.deepEqual(response.subscriptions, [
          'isRegistered',
          '123donePro',
          '321donePro',
          'FirefoxPlus',
          'MechaMozilla',
          'isSubscribed'
        ]);
      });

      it('should report default subscription capability to OAuth client', async () => {
        const response = await client.api.accountProfile(null, {
          Authorization: makeMockOAuthHeader({
            user: client.uid,
            client_id: CLIENT_ID_FOR_DEFAULT,
            scope: ['profile:subscriptions']
          })
        });
        assert.deepEqual(response.subscriptions, [ 'isRegistered', 'isSubscribed' ]);
      });

      it('should report subset of subscription capabilities relevant to OAuth client', async () => {
        const response = await client.api.accountProfile(null, {
          Authorization: makeMockOAuthHeader({
            user: client.uid,
            client_id: CLIENT_ID,
            scope: ['profile:subscriptions']
          })
        });
        assert.deepEqual(response.subscriptions,
          [ '123donePro', 'MechaMozilla' ]);
      });

      it('should not include subscriptions for OAuth token without profile:subscriptions scope', async () => {
        const response = await client.api.accountProfile(null, {
          Authorization: makeMockOAuthHeader({
            user: client.uid,
            client_id: CLIENT_ID,
            scope: ['foobar']
          })
        });
        assert.isNotOk('subscriptions' in response);
      });
    });
  });

  after(() => {
    return TestServer.stop(server);
  });
});

describe('remote account profile with subscriptions disabled', function () {
  this.timeout(15000);

  let server;
  before(async () => {
    server = await startTestServer(false);
  });

  after(() => {
    return TestServer.stop(server);
  });

  describe('subscription capabilities status', () => {
    let email, client;
    beforeEach(async () => {
      email = server.uniqueEmail();
      client = await Client.create(
        config.publicUrl,
        email,
        'password',
        { lang: 'en-US' }
      );
    });

    it('should not include subscription status at all with session token', async () => {
      const response = await client.api.accountProfile(client.sessionToken);
      assert.isNotOk('subscriptions' in response);
    });

    it('should not include subscription status at all for OAuth client', async () => {
      const response = await client.api.accountProfile(null, {
        Authorization: makeMockOAuthHeader({
          user: client.uid,
          client_id: CLIENT_ID_FOR_DEFAULT,
          scope: ['profile:subscriptions']
        })
      });
      assert.isNotOk('subscriptions' in response);
    });
  });
});
