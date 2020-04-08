/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const assert = require('chai').assert;
const mocks = require('../../../mocks');

const {
  determineSubscriptionCapabilities,
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

describe('routes/utils/subscriptions', () => {
  let db;

  beforeEach(async () => {
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
              capabilities: 'capAll',
              'capabilities:c1': 'cap4,cap5',
              'capabilities:c2': 'cap5,cap6',
            },
          },
          {
            product_id: 'prod_876543',
            product_metadata: {
              'capabilities:c2': 'capC,   capD',
              'capabilities:c3': 'capD, capE',
            },
          },
          {
            product_id: 'prod_ABCDEF',
            product_metadata: {
              'capabilities:c3': ' capZ,   capW   ',
            },
          },
          {
            product_id: 'prod_456789',
            product_metadata: {
              'capabilities:c3': '   capZ,capW',
            },
          },
        ]),
      };
    });

    async function assertExpectedCapabilities(clientId, expectedCapabilities) {
      const allCapabilities = await determineSubscriptionCapabilities(
        mockStripeHelper,
        UID,
        EMAIL
      );
      const resultCapabilities = await determineClientVisibleSubscriptionCapabilities(
        // null client represents sessionToken auth from content-server, unfiltered by client
        clientId === 'null' ? null : Buffer.from(clientId, 'hex'),
        allCapabilities
      );
      assert.deepEqual(resultCapabilities.sort(), expectedCapabilities.sort());
    }

    it('only reveals capabilities relevant to the client', async () => {
      const expected = {
        c0: ['capAll'],
        c1: ['capAll', 'cap4', 'cap5'],
        c2: ['capAll', 'cap5', 'cap6', 'capC', 'capD'],
        c3: ['capAll', 'capD', 'capE'],
        null: ['capAll', 'cap4', 'cap5', 'cap6', 'capC', 'capD', 'capE'],
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
            capabilities: 'cap00,  cap01,cap02',
          },
        },
      ]);

      for (const clientId of ['c0', 'c1', 'c2', 'c3', 'null']) {
        const expected = ['cap1', 'cap2', 'cap3', 'capA', 'capB', 'capC'];
        await assertExpectedCapabilities(clientId, expected);
      }
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
