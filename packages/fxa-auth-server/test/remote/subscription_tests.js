/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const clientFactory = require('../client')();
const config = require('../../config').getProperties();
const testServerFactory = require('../test_server');

const CLIENT_ID = 'client8675309';
const CLIENT_ID_FOR_DEFAULT = 'client5551212';
const PAYMENT_TOKEN = 'pay8675309';
const PLAN_ID = 'allDoneProMonthly';
const PRODUCT_ID = 'megaProductHooray';

describe('remote subscriptions:', function () {
  this.timeout(10000);

  before(async () => {
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
      productCapabilities: {
        defaultRegistered: [ 'isRegistered' ],
        defaultSubscribed: [ 'isSubscribed' ],
        [PRODUCT_ID]: [ '123donePro', '321donePro', 'FirefoxPlus', 'MechaMozilla' ],
      },
      clientCapabilities: {
        [CLIENT_ID]: [ '123donePro', 'ILikePie', 'MechaMozilla', 'FooBar' ],
        [CLIENT_ID_FOR_DEFAULT]: [ 'isRegistered', 'isSubscribed' ],
      }
    };
  });

  describe('config.subscriptions.enabled = true:', () => {
    let client, defaultRefreshToken, refreshToken, server;

    before(async () => {
      config.subscriptions.enabled = true;
      server = await testServerFactory.start(config);
    });

    after(async () => {
      await server.stop();
    });

    beforeEach(async () => {
      client = await clientFactory.create(config.publicUrl, server.uniqueEmail(), 'wibble');
      defaultRefreshToken = mockRefreshToken(CLIENT_ID_FOR_DEFAULT, client.uid, 'profile:subscriptions');
      refreshToken = mockRefreshToken(CLIENT_ID, client.uid, 'profile:subscriptions');
    });

    it('should return default capability with session token', async () => {
      const response = await client.accountProfile();
      assert.deepEqual(response.subscriptions, [ 'isRegistered' ]);
    });

    it('should return default capability with refresh token', async () => {
      const response = await client.accountProfile(defaultRefreshToken);
      assert.deepEqual(response.subscriptions, [ 'isRegistered' ]);
    });

    it('should not return any subscription capabilities', async () => {
      const response = await client.accountProfile(refreshToken);
      assert.isUndefined(response.subscriptions);
    });

    describe('createSubscription:', () => {
      beforeEach(async () => {
        await client.createSubscription(
          mockRefreshToken(CLIENT_ID, client.uid, 'profile', 'https://identity.mozilla.com/account/subscriptions'),
          PLAN_ID,
          PAYMENT_TOKEN
        );
      });

      it('should return subscription capabilities with session token', async () => {
        const response = await client.accountProfile();
        assert.deepEqual(response.subscriptions, [
          'isRegistered',
          '123donePro',
          '321donePro',
          'FirefoxPlus',
          'MechaMozilla',
          'isSubscribed'
        ]);
      });

      it('should return default capability with refresh token', async () => {
        const response = await client.accountProfile(
          mockRefreshToken(CLIENT_ID_FOR_DEFAULT, client.uid, 'profile:subscriptions')
        );
        assert.deepEqual(response.subscriptions, [ 'isRegistered', 'isSubscribed' ]);
      });

      it('should return relevant capabilities with refresh token', async () => {
        const response = await client.accountProfile(refreshToken);
        assert.deepEqual(response.subscriptions, [ '123donePro', 'MechaMozilla' ]);
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
      client = await clientFactory.create(config.publicUrl, server.uniqueEmail(), 'wibble');
      refreshToken = mockRefreshToken(CLIENT_ID, client.uid, 'profile:subscriptions');
    });

    it('should not include subscriptions with session token', async () => {
      const response = await client.accountProfile();
      assert.isUndefined(response.subscriptions);
    });

    it('should not include subscriptions with refresh token', async () => {
      const response = await client.accountProfile(refreshToken);
      assert.isUndefined(response.subscriptions);
    });
  });
});

function mockRefreshToken (clientId, uid, ...scopes) {
  return Buffer.from(JSON.stringify({
    client_id: clientId,
    user: uid,
    scope: scopes,
  })).toString('hex');
}
