/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const assert = require('chai').assert;
const mocks = require('../../../mocks');

const {
  PRODUCT_SUBSCRIBED,
  PRODUCT_REGISTERED,
  determineClientVisibleSubscriptionCapabilities,
} = require('../../../../lib/routes/utils/subscriptions');

const UID = 'uid8675309';
const NOW = Date.now();
const MOCK_SUBSCRIPTIONS = [
  {
    uid: UID,
    subscriptionId: 'sub1',
    productName: 'p1',
    createdAt: NOW,
  },
  {
    uid: UID,
    subscriptionId: 'sub2',
    productName: 'p2',
    createdAt: NOW,
  },
];
const MOCK_CONFIG = {
  subscriptions: {
    productCapabilities: {
      p1: ['cap1', 'cap2', 'cap3'],
      p2: ['cap4', 'cap5', 'cap6'],
      p3: ['cap7', 'cap8', 'cap9'],
      [PRODUCT_SUBSCRIBED]: ['capSubscribed'],
      [PRODUCT_REGISTERED]: ['capRegistered'],
    },
    clientCapabilities: {
      c1: ['cap1', 'cap5', 'cap9'],
      c2: ['capSubscribed'],
      c3: ['capRegistered'],
    },
  },
};

describe('routes/utils/subscriptions', () => {
  let auth, db;

  beforeEach(async () => {
    auth = { strategy: 'oauthToken' };
    db = mocks.mockDB();
    db.fetchAccountSubscriptions = sinon.spy(async uid =>
      MOCK_SUBSCRIPTIONS.filter(s => s.uid === uid)
    );
  });

  describe('determineClientVisibleSubscriptionCapabilities', () => {
    afterEach(() => {
      // Each of these tests should cause a fetch of subscriptions
      assert.deepEqual(db.fetchAccountSubscriptions.args, [[UID]]);
    });

    it('should reveal all subscribed capabilities to a sessionToken client', async () => {
      auth.strategy = 'sessionToken';
      const result = await determineClientVisibleSubscriptionCapabilities(
        MOCK_CONFIG,
        auth,
        db,
        UID,
        null
      );
      assert.deepEqual(result, [
        'capRegistered',
        'cap1',
        'cap2',
        'cap3',
        'cap4',
        'cap5',
        'cap6',
        'capSubscribed',
      ]);
    });

    it('should only reveal capabilities relevant to the client', async () => {
      const client = 'c1';
      const result = await determineClientVisibleSubscriptionCapabilities(
        MOCK_CONFIG,
        auth,
        db,
        UID,
        client
      );
      assert.deepEqual(result, ['cap1', 'cap5']);
    });

    it('should return undefined if no capabilities are visible to client', async () => {
      const client = 'someRando';
      const result = await determineClientVisibleSubscriptionCapabilities(
        MOCK_CONFIG,
        auth,
        db,
        UID,
        client
      );
      assert.deepEqual(result, undefined);
    });

    it('should implicitly include subscribed default product for users with at least one subscription', async () => {
      const client = 'c2';
      const result = await determineClientVisibleSubscriptionCapabilities(
        MOCK_CONFIG,
        auth,
        db,
        UID,
        client
      );
      assert.deepEqual(result, ['capSubscribed']);
    });

    it('should implicitly include registered default product for all users', async () => {
      const client = 'c3';
      db.fetchAccountSubscriptions = sinon.spy(async uid => []);
      const result = await determineClientVisibleSubscriptionCapabilities(
        MOCK_CONFIG,
        auth,
        db,
        UID,
        client
      );
      assert.deepEqual(result, ['capRegistered']);
    });
  });
});
