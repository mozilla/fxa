/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const assert = require('chai').assert;
const { Container } = require('typedi');

const { mockLog } = require('../../mocks');
const { AuthLogger } = require('../../../lib/types');
const { StripeHelper } = require('../../../lib/payments/stripe');
const { PlayBilling } = require('../../../lib/payments/google-play');
const proxyquire = require('proxyquire').noPreserveCache();

const mockAuthEvents = {};

const { CapabilityService } = proxyquire('../../../lib/payments/capability', {
  '../events': {
    authEvents: mockAuthEvents,
  },
});

const UID = 'uid8675309';
const EMAIL = 'user@example.com';

describe('CapabilityService', () => {
  let mockStripeHelper;
  let mockPlayBilling;
  let capabilityService;
  let log;
  let mockSubscriptionPurchase;

  beforeEach(async () => {
    mockAuthEvents.on = sinon.fake.returns({});
    mockStripeHelper = {};
    mockPlayBilling = {
      userManager: {},
      purchaseManager: {},
    };
    mockStripeHelper.allPlans = sinon.spy(async () => [
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
      {
        product_id: 'prod_PLAY',
        product_metadata: {
          'capabilities:c3': '   capP',
        },
      },
    ]);
    log = mockLog();
    Container.set(AuthLogger, log);
    Container.set(StripeHelper, mockStripeHelper);
    Container.set(PlayBilling, mockPlayBilling);
    capabilityService = new CapabilityService();
  });

  describe('broadcastCapabilitiesAdded', () => {
    it('should broadcast the capabilities added', async () => {
      const capabilities = ['cap2'];
      capabilityService.broadcastCapabilitiesAdded({ uid: UID, capabilities });
      sinon.assert.calledOnce(log.notifyAttachedServices);
    });
  });

  describe('broadcastCapabilitiesRemoved', () => {
    it('should broadcast the capabilities removed event', async () => {
      const capabilities = ['cap1'];
      capabilityService.broadcastCapabilitiesRemoved({
        uid: UID,
        capabilities,
      });
      sinon.assert.calledOnce(log.notifyAttachedServices);
    });
  });

  describe('processProductDiff', () => {
    it('should process the product diff', async () => {
      mockAuthEvents.emit = sinon.fake.returns({});
      await capabilityService.processProductDiff({
        uid: UID,
        priorProductIds: ['prod_123456', 'prod_876543'],
        currentProductIds: ['prod_876543', 'prod_ABCDEF'],
      });
      sinon.assert.calledTwice(mockAuthEvents.emit);
      sinon.assert.calledTwice(log.notifyAttachedServices);
    });
  });

  describe('determineClientVisibleSubscriptionCapabilities', () => {
    beforeEach(() => {
      mockStripeHelper.customer = sinon.spy(async () => ({
        subscriptions: {
          data: [
            {
              status: 'active',
              items: {
                data: [{ price: { product: 'prod_123456' } }],
              },
            },
            {
              status: 'active',
              items: {
                data: [{ price: { product: 'prod_876543' } }],
              },
            },
            {
              status: 'incomplete',
              items: {
                data: [{ price: { product: 'prod_456789' } }],
              },
            },
          ],
        },
      }));
      mockStripeHelper.purchasesToSubscribedProductIds = sinon.fake.returns([
        'prod_PLAY',
      ]);
      mockSubscriptionPurchase = {
        sku: 'play_1234',
      };

      mockPlayBilling.userManager.queryCurrentSubscriptions = sinon.spy(
        async () => [mockSubscriptionPurchase]
      );
    });

    async function assertExpectedCapabilities(clientId, expectedCapabilities) {
      const allCapabilities = await capabilityService.subscriptionCapabilities(
        undefined,
        UID,
        EMAIL
      );
      const resultCapabilities =
        await capabilityService.determineClientVisibleSubscriptionCapabilities(
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
        c3: ['capAll', 'capD', 'capE', 'capP'],
        null: [
          'capAll',
          'cap4',
          'cap5',
          'cap6',
          'capC',
          'capD',
          'capE',
          'capP',
        ],
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
});
