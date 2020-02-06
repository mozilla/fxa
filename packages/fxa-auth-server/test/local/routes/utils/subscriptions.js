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
  metadataFromPlan,
} = require('../../../../lib/routes/utils/subscriptions');

const UID = 'uid8675309';
const EMAIL = 'user@example.com';
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

describe('routes/utils/subscriptions', () => {
  let auth, db;

  beforeEach(async () => {
    auth = { strategy: 'oauthToken' };
    db = mocks.mockDB();
    db.fetchAccountSubscriptions = sinon.spy(async uid =>
      MOCK_SUBSCRIPTIONS.filter(s => s.uid === uid)
    );
  });

  describe('determineClientVisibleSubscriptionCapabilities using Stripe customer', () => {
    let mockStripeHelper;

    beforeEach(() => {
      mockStripeHelper = {
        customer: sinon.spy(async () => ({
          subscriptions: {
            data: [
              { plan: { product: 'prod_123456' }, status: 'active' },
              { plan: { product: 'prod_876543' }, status: 'active' },
              { plan: { product: 'prod_456789' }, status: 'incomplete' },
            ],
          },
        })),
        allPlans: sinon.spy(async () => [
          {
            product_id: 'prod_123456',
            product_metadata: {
              'capabilities:c1': 'cap4,cap5',
              'capabilities:c2': 'cap5,cap6',
            },
          },
          {
            product_id: 'prod_876543',
            product_metadata: {
              'capabilities:c2': 'capC,capD',
              'capabilities:c3': 'capD,capE',
            },
          },
          {
            product_id: 'prod_ABCDEF',
            product_metadata: {
              'capabilities:c3': 'capZ,capW',
            },
          },
          {
            product_id: 'prod_456789',
            product_metadata: {
              'capabilities:c3': 'capZ,capW',
            },
          },
        ]),
      };
    });

    async function assertExpectedCapabilities(clientId, expectedCapabilities) {
      assert.deepEqual(
        await determineClientVisibleSubscriptionCapabilities(
          MOCK_CONFIG,
          auth,
          db,
          UID,
          // null client represents sessionToken auth from content-server, unfiltered by client
          clientId === 'null' ? null : clientId,
          mockStripeHelper,
          EMAIL
        ),
        expectedCapabilities
      );
    }

    it('only reveals capabilities relevant to the client', async () => {
      const expected = {
        c0: undefined,
        c1: ['cap4', 'cap5'],
        c2: ['cap5', 'cap6', 'capC', 'capD', 'capSubscribed'],
        c3: ['capD', 'capE', 'capRegistered'],
        null: ['cap4', 'cap5', 'cap6', 'capC', 'capD', 'capE'],
      };
      for (const clientId in expected) {
        await assertExpectedCapabilities(clientId, expected[clientId]);
      }
    });

    it('supports capabilities visible to all clients', async () => {
      mockStripeHelper.allPlans = sinon.spy(async () => [
        {
          product_id: 'prod_123456',
          product_metadata: {
            capabilities: 'cap1,cap2,cap3',
          },
        },
        {
          product_id: 'prod_876543',
          product_metadata: {
            capabilities: 'capA,capB,capC',
          },
        },
        {
          product_id: 'prod_ABCDEF',
          product_metadata: {
            capabilities: 'cap00,cap01,cap02',
          },
        },
      ]);

      for (const clientId of ['c0', 'c1', 'c2', 'c3', 'null']) {
        const expected = ['cap1', 'cap2', 'cap3', 'capA', 'capB', 'capC'];
        if (clientId === 'c2') {
          expected.push('capSubscribed');
        }
        if (clientId === 'c3') {
          expected.push('capRegistered');
        }
        await assertExpectedCapabilities(clientId, expected);
      }
    });

    // TODO: This capability still comes from server config, not stripe metadata
    it('implicitly includes subscribed default product for users with at least one subscription', async () => {
      const client = 'c2';
      const result = await determineClientVisibleSubscriptionCapabilities(
        MOCK_CONFIG,
        auth,
        db,
        UID,
        client,
        mockStripeHelper,
        EMAIL
      );
      assert.include(result, 'capSubscribed');
    });

    // TODO: This capability still comes from server config, not stripe metadata
    it('implicitly includes registered default product even for users with no subscriptions', async () => {
      const client = 'c3';
      mockStripeHelper.customer = sinon.spy(async () => ({
        subscriptions: {
          data: [],
        },
      }));
      const result = await determineClientVisibleSubscriptionCapabilities(
        MOCK_CONFIG,
        auth,
        db,
        UID,
        client,
        mockStripeHelper,
        EMAIL
      );
      assert.deepEqual(result, ['capRegistered']);
    });
  });

  // TODO: issue #3846 - remove these tests
  describe('determineClientVisibleSubscriptionCapabilities with local DB table', () => {
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

  describe('metadataFromPlan', () => {
    const NULL_METADATA = {
      productSet: null,
      productOrder: null,
      emailIconURL: null,
      webIconURL: null,
      upgradeCTA: null,
      downloadURL: null,
    };

    const PLAN = {
      plan_id: 'plan_8675309',
      plan_name: 'Example plan',
      product_id: 'prod_8675309',
      product_name: 'Example product',
      currency: 'usd',
      amount: 599,
      interval: 'monthly',
    };

    it('produces default null values', () => {
      assert.deepEqual(metadataFromPlan(PLAN), NULL_METADATA);
    });

    it('extracts product metadata', () => {
      const product_metadata = {
        productSet: 'foo',
        productOrder: 1,
      };
      assert.deepEqual(metadataFromPlan({ ...PLAN, product_metadata }), {
        ...NULL_METADATA,
        ...product_metadata,
      });
    });

    it('extracts plan metadata', () => {
      const plan_metadata = {
        productSet: 'foo',
        productOrder: 1,
      };
      assert.deepEqual(metadataFromPlan({ ...PLAN, plan_metadata }), {
        ...NULL_METADATA,
        ...plan_metadata,
      });
    });

    it('overrides product metadata with plan metadata', () => {
      const product_metadata = {
        productSet: 'foo',
        productOrder: 1,
      };
      const plan_metadata = {
        productSet: 'bar',
      };
      assert.deepEqual(
        metadataFromPlan({ ...PLAN, plan_metadata, product_metadata }),
        {
          ...NULL_METADATA,
          productOrder: 1,
          productSet: 'bar',
        }
      );
    });
  });
});
