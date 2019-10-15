/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const assert = require('chai').assert;
const mocks = require('../../../mocks');
const error = require('../../../../lib/error');

const {
  PRODUCT_SUBSCRIBED,
  PRODUCT_REGISTERED,
  determineClientVisibleSubscriptionCapabilities,
  updateSubscriptionsFromSubhub,
} = require('../../../../lib/routes/utils/subscriptions');

const UID = 'uid8675309';
const NOW = Date.now();

const MOCK_SUBSCRIPTIONS = [
  {
    uid: UID,
    subscriptionId: 'sub1',
    productId: 'p1',
    createdAt: NOW,
  },
  {
    uid: UID,
    subscriptionId: 'sub2',
    productId: 'p2',
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

const MOCK_PLANS = [
  {
    plan_id: 'firefox_pro_basic_823',
    plan_name: 'Firefox Pro Basic Weekly',
    product_id: 'firefox_pro_basic',
    product_name: 'Firefox Pro Basic',
    interval: 'week',
    amount: '123',
    currency: 'usd',
  },
  {
    plan_id: 'firefox_pro_basic_999',
    plan_name: 'Firefox Pro Pro Monthly',
    product_id: 'firefox_pro_pro',
    product_name: 'Firefox Pro Pro',
    interval: 'month',
    amount: '456',
    currency: 'usd',
  },
];

describe('routes/utils/subscriptions', () => {
  describe('determineClientVisibleSubscriptionCapabilities', () => {
    let auth, db;

    beforeEach(async () => {
      auth = { strategy: 'oauthToken' };
      db = mocks.mockDB();
      db.fetchAccountSubscriptions = sinon.spy(async uid =>
        MOCK_SUBSCRIPTIONS.filter(s => s.uid === uid)
      );
    });

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

  describe('updateSubscriptionsFromSubhub', () => {
    let db, subhub, profile;

    beforeEach(async () => {
      db = mocks.mockDB();
      subhub = mocks.mockSubHub();
      profile = mocks.mockProfile();

      subhub.listPlans = sinon.spy(async () => MOCK_PLANS);
    });

    it('makes no changes if local and subhub subscriptions match up', async () => {
      subhub.getCustomer = sinon.spy(async inUid => ({
        subscriptions: [
          { subscription_id: '123', plan_id: 'firefox_pro_basic_823' },
          { subscription_id: '456', plan_id: 'firefox_pro_basic_999' },
        ],
      }));

      db.fetchAccountSubscriptions = sinon.spy(async inUid => [
        { subscriptionId: '123', productId: 'firefox_pro_basic' },
        { subscriptionId: '456', productId: 'firefox_pro_pro' },
      ]);

      const resultMadeChanges = await updateSubscriptionsFromSubhub({
        db,
        subhub,
        profile,
        uid: UID,
      });

      assert.equal(resultMadeChanges, false);
      assert.deepEqual(subhub.getCustomer.args, [[UID]]);
      assert.equal(subhub.listPlans.called, true);
      assert.deepEqual(db.fetchAccountSubscriptions.args, [[UID]]);
      assert.equal(db.createAccountSubscription.called, false);
      assert.equal(db.deleteAccountSubscription.called, false);
      assert.equal(profile.deleteCache.called, false);
    });

    it('deletes existing local subscriptions when missing in subhub', async () => {
      subhub.getCustomer = sinon.spy(async inUid => ({
        subscriptions: [
          { subscription_id: '123', plan_id: 'firefox_pro_basic_823' },
        ],
      }));

      db.fetchAccountSubscriptions = sinon.spy(async inUid => [
        { subscriptionId: '123', productId: 'firefox_pro_basic' },
        { subscriptionId: '456', productId: 'firefox_pro_pro' },
      ]);

      const resultMadeChanges = await updateSubscriptionsFromSubhub({
        db,
        subhub,
        profile,
        uid: UID,
      });

      assert.equal(resultMadeChanges, true);
      assert.deepEqual(subhub.getCustomer.args, [[UID]]);
      assert.equal(subhub.listPlans.called, true);
      assert.deepEqual(db.fetchAccountSubscriptions.args, [[UID]]);
      assert.equal(db.createAccountSubscription.called, false);
      assert.deepEqual(db.deleteAccountSubscription.args, [
        [{ uid: UID, subscriptionId: '456' }],
      ]);
      assert.deepEqual(profile.deleteCache.args, [[UID]]);
    });

    it('creates missing local subscriptions when present in subhub', async () => {
      subhub.getCustomer = sinon.spy(async inUid => ({
        subscriptions: [
          { subscription_id: '123', plan_id: 'firefox_pro_basic_823' },
          { subscription_id: '456', plan_id: 'firefox_pro_basic_999' },
        ],
      }));

      db.fetchAccountSubscriptions = sinon.spy(async inUid => [
        { subscriptionId: '456', productId: 'firefox_pro_pro' },
      ]);

      const resultMadeChanges = await updateSubscriptionsFromSubhub({
        db,
        subhub,
        profile,
        uid: UID,
      });

      assert.equal(resultMadeChanges, true);
      assert.deepEqual(subhub.getCustomer.args, [[UID]]);
      assert.equal(subhub.listPlans.called, true);
      assert.deepEqual(db.fetchAccountSubscriptions.args, [[UID]]);
      assert.equal(db.deleteAccountSubscription.called, false);
      assert.equal(db.createAccountSubscription.called, true);
      assert.deepInclude(db.createAccountSubscription.args[0][0], {
        uid: UID,
        subscriptionId: '123',
        productId: 'firefox_pro_basic',
      });
      assert.deepEqual(profile.deleteCache.args, [[UID]]);
    });

    it('both deletes and creates local subscriptions to match subhub', async () => {
      subhub.getCustomer = sinon.spy(async inUid => ({
        subscriptions: [
          { subscription_id: '123', plan_id: 'firefox_pro_basic_823' },
          { subscription_id: '456', plan_id: 'firefox_pro_basic_999' },
        ],
      }));

      db.fetchAccountSubscriptions = sinon.spy(async inUid => [
        { subscriptionId: '789', productId: 'firefox_pro_basic' },
        { subscriptionId: 'abc', productId: 'firefox_pro_pro' },
      ]);

      const resultMadeChanges = await updateSubscriptionsFromSubhub({
        db,
        subhub,
        profile,
        uid: UID,
      });

      assert.equal(resultMadeChanges, true);
      assert.deepEqual(db.deleteAccountSubscription.args, [
        [{ uid: UID, subscriptionId: '789' }],
        [{ uid: UID, subscriptionId: 'abc' }],
      ]);
      assert.equal(db.createAccountSubscription.called, true);
      assert.deepInclude(db.createAccountSubscription.args[0][0], {
        uid: UID,
        subscriptionId: '123',
        productId: 'firefox_pro_basic',
      });
      assert.deepInclude(db.createAccountSubscription.args[1][0], {
        uid: UID,
        subscriptionId: '456',
        productId: 'firefox_pro_pro',
      });
      assert.deepEqual(profile.deleteCache.args, [[UID]]);
    });

    it('properly handles unknown subhub customer', async () => {
      subhub.getCustomer = sinon.spy(async inUid => {
        throw error.unknownCustomer(inUid);
      });
      db.fetchAccountSubscriptions = sinon.spy(async inUid => []);

      const resultMadeChanges = await updateSubscriptionsFromSubhub({
        db,
        subhub,
        profile,
        uid: UID,
      });

      assert.equal(resultMadeChanges, false);
      assert.deepEqual(subhub.getCustomer.args, [[UID]]);
      assert.equal(subhub.listPlans.called, true);
      assert.deepEqual(db.fetchAccountSubscriptions.args, [[UID]]);
      assert.equal(db.createAccountSubscription.called, false);
      assert.equal(db.deleteAccountSubscription.called, false);
      assert.equal(profile.deleteCache.called, false);
    });

    const subjectWithFailure = async args => {
      let resultMadeChanges = null;
      let failedMessage = null;
      try {
        resultMadeChanges = await updateSubscriptionsFromSubhub(args);
      } catch (err) {
        failedMessage = err.message;
      }
      return { failedMessage, resultMadeChanges };
    };

    it('properly handles unexpected error from subhub customer fetch', async () => {
      const expectedMessage = 'OOPS';

      subhub.getCustomer = sinon.spy(async inUid => {
        throw new Error(expectedMessage);
      });

      const { failedMessage } = await subjectWithFailure({
        db,
        subhub,
        profile,
        uid: UID,
      });

      assert.equal(failedMessage, expectedMessage);
      assert.deepEqual(subhub.getCustomer.args, [[UID]]);
      assert.equal(subhub.listPlans.called, false);
      assert.equal(db.fetchAccountSubscriptions.called, false);
      assert.equal(db.createAccountSubscription.called, false);
      assert.equal(db.deleteAccountSubscription.called, false);
      assert.equal(profile.deleteCache.called, false);
    });

    it('throws unexpected error from subhub plans fetch', async () => {
      const expectedMessage = 'OOPS';

      subhub.getCustomer = sinon.spy(async inUid => ({
        subscriptions: [
          { subscription_id: '123', plan_id: 'firefox_pro_basic_823' },
          { subscription_id: '456', plan_id: 'firefox_pro_basic_999' },
        ],
      }));
      subhub.listPlans = sinon.spy(async () => {
        throw new Error(expectedMessage);
      });

      const { failedMessage } = await subjectWithFailure({
        db,
        subhub,
        profile,
        uid: UID,
      });

      assert.equal(failedMessage, expectedMessage);
      assert.deepEqual(subhub.getCustomer.args, [[UID]]);
      assert.equal(subhub.listPlans.called, true);
      assert.equal(db.fetchAccountSubscriptions.called, false);
      assert.equal(db.createAccountSubscription.called, false);
      assert.equal(db.deleteAccountSubscription.called, false);
      assert.equal(profile.deleteCache.called, false);
    });

    it('throws unexpected error from from fetching local subscriptions', async () => {
      const expectedMessage = 'OOPS';

      subhub.getCustomer = sinon.spy(async inUid => ({
        subscriptions: [
          { subscription_id: '123', plan_id: 'firefox_pro_basic_823' },
          { subscription_id: '456', plan_id: 'firefox_pro_basic_999' },
        ],
      }));
      db.fetchAccountSubscriptions = sinon.spy(async () => {
        throw new Error(expectedMessage);
      });

      const { failedMessage } = await subjectWithFailure({
        db,
        subhub,
        profile,
        uid: UID,
      });

      assert.equal(failedMessage, expectedMessage);
      assert.deepEqual(subhub.getCustomer.args, [[UID]]);
      assert.equal(subhub.listPlans.called, true);
      assert.equal(db.fetchAccountSubscriptions.called, true);
      assert.equal(db.createAccountSubscription.called, false);
      assert.equal(db.deleteAccountSubscription.called, false);
      assert.equal(profile.deleteCache.called, false);
    });

    it('properly handles error from creating local subscription', async () => {
      const expectedMessage = 'OOPS';

      subhub.getCustomer = sinon.spy(async inUid => ({
        subscriptions: [
          { subscription_id: '123', plan_id: 'firefox_pro_basic_823' },
          { subscription_id: '456', plan_id: 'firefox_pro_basic_999' },
        ],
      }));

      db.fetchAccountSubscriptions = sinon.spy(async inUid => [
        { subscriptionId: '789', productId: 'firefox_pro_basic' },
        { subscriptionId: 'abc', productId: 'firefox_pro_pro' },
      ]);

      db.createAccountSubscription = sinon.spy(async () => {
        throw new Error(expectedMessage);
      });

      const { failedMessage } = await subjectWithFailure({
        db,
        subhub,
        profile,
        uid: UID,
      });

      assert.equal(failedMessage, expectedMessage);
      assert.deepEqual(subhub.getCustomer.args, [[UID]]);
      assert.equal(subhub.listPlans.called, true);
      assert.equal(db.fetchAccountSubscriptions.called, true);
      assert.equal(db.createAccountSubscription.called, true);
      assert.equal(db.deleteAccountSubscription.called, false);
      assert.equal(profile.deleteCache.called, false);
    });

    it('properly handles error from deleting local subscription', async () => {
      const expectedMessage = 'OOPS';

      subhub.getCustomer = sinon.spy(async inUid => ({
        subscriptions: [
          { subscription_id: '123', plan_id: 'firefox_pro_basic_823' },
          { subscription_id: '456', plan_id: 'firefox_pro_basic_999' },
        ],
      }));

      db.fetchAccountSubscriptions = sinon.spy(async inUid => [
        { subscriptionId: '789', productId: 'firefox_pro_basic' },
        { subscriptionId: 'abc', productId: 'firefox_pro_pro' },
      ]);

      db.deleteAccountSubscription = sinon.spy(async () => {
        throw new Error(expectedMessage);
      });

      const { failedMessage } = await subjectWithFailure({
        db,
        subhub,
        profile,
        uid: UID,
      });

      assert.equal(failedMessage, expectedMessage);
      assert.deepEqual(subhub.getCustomer.args, [[UID]]);
      assert.equal(subhub.listPlans.called, true);
      assert.equal(db.fetchAccountSubscriptions.called, true);
      assert.equal(db.createAccountSubscription.called, true);
      assert.equal(db.deleteAccountSubscription.called, true);
      assert.equal(profile.deleteCache.called, false);
    });
  });
});
