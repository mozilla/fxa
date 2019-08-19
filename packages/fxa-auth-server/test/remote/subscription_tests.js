/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../..';

const { assert } = require('chai');
const clientFactory = require('../client')();
const config = require(`${ROOT_DIR}/config`).getProperties();
const error = require(`${ROOT_DIR}/lib/error`);
const testServerFactory = require('../test_server');

const CLIENT_ID = 'client8675309';
const CLIENT_ID_FOR_DEFAULT = 'client5551212';
const DISPLAY_NAME = 'Example User';
const PAYMENT_TOKEN = 'pay8675309';
const PLAN_ID = 'allDoneProMonthly';
const PLAN_NAME = 'All Done Pro Monthly';
const PRODUCT_ID = 'megaProductHooray';
const PRODUCT_NAME = 'All Done Pro';

describe('remote subscriptions:', function() {
  this.timeout(10000);

  before(async () => {
    config.subhub.useStubs = true;
    config.subhub.stubs = {
      plans: [
        {
          plan_id: PLAN_ID,
          plan_name: PLAN_NAME,
          product_id: PRODUCT_ID,
          product_name: PRODUCT_NAME,
          interval: 'month',
          amount: 50,
          currency: 'usd',
        },
      ],
    };
    config.subscriptions = {
      productCapabilities: {
        defaultRegistered: ['isRegistered'],
        defaultSubscribed: ['isSubscribed'],
        [PRODUCT_ID]: [
          '123donePro',
          '321donePro',
          'FirefoxPlus',
          'MechaMozilla',
        ],
      },
      clientCapabilities: {
        [CLIENT_ID]: ['123donePro', 'ILikePie', 'MechaMozilla', 'FooBar'],
        [CLIENT_ID_FOR_DEFAULT]: ['isRegistered', 'isSubscribed'],
      },
      sharedSecret: 'wibble',
    };
  });

  describe('config.subscriptions.enabled = true:', () => {
    let client, server, tokens;

    before(async () => {
      config.subscriptions.enabled = true;
      server = await testServerFactory.start(config);
    });

    after(async () => {
      await server.stop();
    });

    beforeEach(async () => {
      client = await clientFactory.create(
        config.publicUrl,
        server.uniqueEmail(),
        'wibble'
      );
      tokens = [
        mockRefreshToken(
          CLIENT_ID_FOR_DEFAULT,
          client.uid,
          'profile:subscriptions'
        ),
        mockRefreshToken(CLIENT_ID, client.uid, 'profile:subscriptions'),
        mockRefreshToken(
          CLIENT_ID,
          client.uid,
          'profile',
          'https://identity.mozilla.com/account/subscriptions'
        ),
      ];
    });

    it('should return client capabilities with shared secret', async () => {
      const response = await client.getSubscriptionClients('wibble');
      assert.deepEqual(response, [
        {
          clientId: CLIENT_ID,
          capabilities: ['123donePro', 'ILikePie', 'MechaMozilla', 'FooBar'],
        },
        {
          clientId: CLIENT_ID_FOR_DEFAULT,
          capabilities: ['isRegistered', 'isSubscribed'],
        },
      ]);
    });

    it('should not return client capabilities with invalid shared secret', async () => {
      let succeeded = false;

      try {
        await client.getSubscriptionClients('blee');
        succeeded = true;
      } catch (err) {
        assert.equal(err.code, 401);
        assert.equal(err.errno, error.ERRNO.INVALID_TOKEN);
      }

      assert.isFalse(succeeded);
    });

    it('should return default capability with session token', async () => {
      const response = await client.accountProfile();
      assert.deepEqual(response.subscriptions, ['isRegistered']);
    });

    it('should return default capability with refresh token', async () => {
      const response = await client.accountProfile(tokens[0]);
      assert.deepEqual(response.subscriptions, ['isRegistered']);
    });

    it('should not return any subscription capabilities', async () => {
      const response = await client.accountProfile(tokens[1]);
      assert.isUndefined(response.subscriptions);
    });

    it('should return subscription plans', async () => {
      const result = await client.getSubscriptionPlans(tokens[2]);
      assert.deepEqual(result, [
        {
          plan_id: PLAN_ID,
          plan_name: PLAN_NAME,
          product_id: PRODUCT_ID,
          product_name: PRODUCT_NAME,
          interval: 'month',
          amount: 50,
          currency: 'usd',
        },
      ]);
    });

    it('should return no active subscriptions', async () => {
      let result = await client.getActiveSubscriptions(tokens[2]);
      assert.deepEqual(result, []);

      result = await client.account();
      assert.deepEqual(result.subscriptions, []);
    });

    describe('createSubscription:', () => {
      let subscriptionId;

      beforeEach(async () => {
        ({ subscriptionId } = await client.createSubscription(
          tokens[2],
          PLAN_ID,
          PAYMENT_TOKEN,
          DISPLAY_NAME
        ));
      });

      it('returned the subscription id', () => {
        assert.isString(subscriptionId);
        assert.notEqual(subscriptionId, '');
      });

      it('should return subscription capabilities with session token', async () => {
        const response = await client.accountProfile();
        assert.deepEqual(response.subscriptions, [
          'isRegistered',
          '123donePro',
          '321donePro',
          'FirefoxPlus',
          'MechaMozilla',
          'isSubscribed',
        ]);
      });

      it('should return default capability with refresh token', async () => {
        const response = await client.accountProfile(tokens[0]);
        assert.deepEqual(response.subscriptions, [
          'isRegistered',
          'isSubscribed',
        ]);
      });

      it('should return relevant capabilities with refresh token', async () => {
        const response = await client.accountProfile(tokens[1]);
        assert.deepEqual(response.subscriptions, [
          '123donePro',
          'MechaMozilla',
        ]);
      });

      it('should return active subscriptions', async () => {
        let result = await client.getActiveSubscriptions(tokens[2]);
        assert.isArray(result);
        assert.lengthOf(result, 1);
        assert.isAbove(result[0].createdAt, Date.now() - 1000);
        assert.isAtMost(result[0].createdAt, Date.now());
        assert.equal(result[0].productId, PRODUCT_ID);
        assert.equal(result[0].uid, client.uid);
        assert.isNull(result[0].cancelledAt);

        result = await client.account();
        assert.isArray(result.subscriptions);
        assert.lengthOf(result.subscriptions, 1);
        assert.equal(result.subscriptions[0].subscription_id, subscriptionId);
        assert.equal(result.subscriptions[0].plan_id, PLAN_ID);
      });

      describe('cancelSubscription:', () => {
        beforeEach(async () => {
          await client.cancelSubscription(tokens[2], subscriptionId);
        });

        it('should return subscription capabilities with session token', async () => {
          const response = await client.accountProfile();
          assert.deepEqual(response.subscriptions, [
            'isRegistered',
            '123donePro',
            '321donePro',
            'FirefoxPlus',
            'MechaMozilla',
            'isSubscribed',
          ]);
        });

        it('should return default capability with refresh token', async () => {
          const response = await client.accountProfile(tokens[0]);
          assert.deepEqual(response.subscriptions, [
            'isRegistered',
            'isSubscribed',
          ]);
        });

        it('should return relevant capabilities with refresh token', async () => {
          const response = await client.accountProfile(tokens[1]);
          assert.deepEqual(response.subscriptions, [
            '123donePro',
            'MechaMozilla',
          ]);
        });

        it('should return cancelled subscriptions', async () => {
          const result = await client.getActiveSubscriptions(tokens[2]);
          assert.isArray(result);
          assert.lengthOf(result, 1);
          assert.isAbove(result[0].createdAt, Date.now() - 1000);
          assert.isAtLeast(result[0].cancelledAt, result[0].createdAt);
          assert.isAtMost(result[0].cancelledAt, Date.now());
          assert.equal(result[0].productId, PRODUCT_ID);
          assert.equal(result[0].uid, client.uid);
        });

        describe('reactivateSubscription:', () => {
          beforeEach(async () => {
            await client.reactivateSubscription(tokens[2], subscriptionId);
          });

          it('should return subscription capabilities with session token', async () => {
            const response = await client.accountProfile();
            assert.deepEqual(response.subscriptions, [
              'isRegistered',
              '123donePro',
              '321donePro',
              'FirefoxPlus',
              'MechaMozilla',
              'isSubscribed',
            ]);
          });

          it('should return default capability with refresh token', async () => {
            const response = await client.accountProfile(tokens[0]);
            assert.deepEqual(response.subscriptions, [
              'isRegistered',
              'isSubscribed',
            ]);
          });

          it('should return relevant capabilities with refresh token', async () => {
            const response = await client.accountProfile(tokens[1]);
            assert.deepEqual(response.subscriptions, [
              '123donePro',
              'MechaMozilla',
            ]);
          });

          it('should return reactivated subscriptions', async () => {
            const result = await client.getActiveSubscriptions(tokens[2]);
            assert.isArray(result);
            assert.lengthOf(result, 1);
            assert.isAbove(result[0].createdAt, Date.now() - 1000);
            assert.isNull(result[0].cancelledAt);
            assert.equal(result[0].productId, PRODUCT_ID);
            assert.equal(result[0].uid, client.uid);
          });
        });
      });
    });
  });

  describe('config.subscriptions.enabled = false:', () => {
    let client, refreshToken, server;

    before(async () => {
      config.subscriptions.enabled = false;
      server = await testServerFactory.start(config);
    });

    after(async () => {
      await server.stop();
    });

    beforeEach(async () => {
      client = await clientFactory.create(
        config.publicUrl,
        server.uniqueEmail(),
        'wibble'
      );
      refreshToken = mockRefreshToken(
        CLIENT_ID,
        client.uid,
        'profile:subscriptions'
      );
    });

    it('should not include subscriptions with session token', async () => {
      const response = await client.accountProfile();
      assert.isUndefined(response.subscriptions);
    });

    it('should not include subscriptions with refresh token', async () => {
      const response = await client.accountProfile(refreshToken);
      assert.isUndefined(response.subscriptions);
    });

    it('should not return subscriptions from client.account', async () => {
      const response = await client.account();
      assert.deepEqual(response.subscriptions, []);
    });
  });
});

function mockRefreshToken(clientId, uid, ...scopes) {
  return Buffer.from(
    JSON.stringify({
      client_id: clientId,
      user: uid,
      scope: scopes,
    })
  ).toString('hex');
}
