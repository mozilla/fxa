/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const { assert } = require('chai');
const { mockLog } = require('../../mocks');
const error = require('../../../lib/error');

let mockRedis;
const proxyquire = require('proxyquire').noPreserveCache();
const StripeHelper = proxyquire('../../../lib/payments/stripe', {
  '../redis': (config, log) => mockRedis.init(config, log),
});

const customer1 = require('./fixtures/customer1.json');
const plan1 = require('./fixtures/plan1.json');
const plan2 = require('./fixtures/plan2.json');
const plan3 = require('./fixtures/plan3.json');
const product1 = require('./fixtures/product1.json');
const product2 = require('./fixtures/product2.json');
const product3 = require('./fixtures/product3.json');
const subscription1 = require('./fixtures/subscription1.json');
const subscription2 = require('./fixtures/subscription2.json');

const mockConfig = {
  publicUrl: 'https://accounts.example.com',
  subscriptions: {
    cacheTtlSeconds: 10,
    stripeApiKey: 'sk_test_4eC39HqLyjWDarjtT1zdp7dc',
  },
  subhub: {
    enabled: true,
    url: 'https://foo.bar',
    key: 'foo',
  },
};

const mockRedisConfig = {
  host: '127.0.0.1',
  port: 6379,
  maxPending: 1000,
  retryCount: 5,
  initialBackoff: '100 milliseconds',
  subhub: {
    enabled: true,
    prefix: 'subhub:',
    minConnections: 1,
  },
};

function asyncIterable(lst) {
  const asyncIter = {
    items: lst,
    next() {
      const value = this.items.shift();
      return value
        ? Promise.resolve({ value, done: false })
        : Promise.resolve({ done: true });
    },
  };
  return {
    [Symbol.asyncIterator]: () => asyncIter,
  };
}

function createMockRedis() {
  let _data = {};
  const mock = {
    reset() {
      _data = {};
    },
    _data() {
      return _data;
    },
    init(config, log) {
      this.reset();
      return this;
    },
    async set(key, value, opt, ttl) {
      _data[key] = value;
    },
    async del(key) {
      delete _data[key];
    },
    async get(key) {
      return _data[key];
    },
  };
  Object.keys(mock).forEach(key => sinon.spy(mock, key));
  return mock;
}

mockConfig.redis = mockRedisConfig;

describe('StripeHelper', () => {
  /** @type StripeHelper */
  let stripeHelper;
  /** @type sinon.SinonSandbox */
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    mockRedis = createMockRedis();
    const log = mockLog();
    stripeHelper = new StripeHelper(log, mockConfig);
    sandbox
      .stub(stripeHelper.stripe.plans, 'list')
      .returns(asyncIterable([plan1, plan2, plan3]));
    sandbox
      .stub(stripeHelper.stripe.products, 'list')
      .returns(asyncIterable([product1, product2, product3]));
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('pulls a list of plans and caches it', async () => {
    assert.lengthOf(await stripeHelper.allPlans(), 3);
    assert(mockRedis.get.calledOnce);

    assert.lengthOf(await stripeHelper.allPlans(), 3);
    assert(mockRedis.get.calledTwice);
    assert(mockRedis.set.calledOnce);
    assert(stripeHelper.stripe.plans.list.calledOnce);

    assert.deepEqual(
      await stripeHelper.allPlans(),
      JSON.parse(await mockRedis.get('listPlans'))
    );
  });

  it('pulls a list of products and caches it', async () => {
    assert.lengthOf(await stripeHelper.allProducts(), 3);
    assert(mockRedis.get.calledOnce);

    assert.lengthOf(await stripeHelper.allProducts(), 3);
    assert(mockRedis.get.calledTwice);
    assert(mockRedis.set.calledOnce);
    assert(stripeHelper.stripe.products.list.calledOnce);

    assert.deepEqual(
      await stripeHelper.allProducts(),
      JSON.parse(await mockRedis.get('listProducts'))
    );
  });

  describe('with tier change', () => {
    it('accepts valid upgrade', async () => {
      sandbox
        .stub(stripeHelper.stripe.subscriptions, 'retrieve')
        .returns(subscription1);
      sandbox
        .stub(stripeHelper.stripe.subscriptions, 'update')
        .returns(subscription2);
      await stripeHelper.verifyPlanUpgradeForSubscription(
        'prod_G93l8Yn7XJHYUs',
        'plan_G93mMKnIFCjZek'
      );
      await stripeHelper.changeSubscriptionPlan(
        'sub_GAt1vgMqOSr5hT',
        'plan_G93mMKnIFCjZek'
      );
      assert(stripeHelper.stripe.plans.list.calledOnce);
    });

    it('throws an error if the user already upgraded', async () => {
      sandbox
        .stub(stripeHelper.stripe.subscriptions, 'retrieve')
        .returns(subscription2);
      sandbox
        .stub(stripeHelper.stripe.subscriptions, 'update')
        .returns(subscription2);
      await stripeHelper.verifyPlanUpgradeForSubscription(
        'prod_G93l8Yn7XJHYUs',
        'plan_G93mMKnIFCjZek'
      );
      let thrown;
      try {
        await stripeHelper.changeSubscriptionPlan(
          'sub_GAt1vgMqOSr5hT',
          'plan_G93mMKnIFCjZek'
        );
      } catch (err) {
        thrown = err;
      }
      assert.equal(thrown.errno, error.ERRNO.SUBSCRIPTION_ALREADY_CHANGED);
    });
  });

  it('throws an error if the product is not upgradeable', async () => {
    sandbox
      .stub(stripeHelper.stripe.subscriptions, 'retrieve')
      .returns(subscription1);
    let thrown;
    try {
      await stripeHelper.verifyPlanUpgradeForSubscription(
        'prod_G93l8Yn7XJHYUs',
        'plan_F4G9jB3x5i6Dpj'
      );
    } catch (err) {
      thrown = err;
    }
    assert.equal(thrown.errno, error.ERRNO.INVALID_PLAN_UPGRADE);
  });

  describe('fetchCustomer', () => {
    it('fetches an existing customer', async () => {
      const listResponse = {
        autoPagingToArray: sinon.fake.resolves([customer1]),
      };
      sandbox.stub(stripeHelper.stripe.customers, 'list').returns(listResponse);
      const result = await stripeHelper.fetchCustomer(
        'user123',
        'test@example.com'
      );
      assert.deepEqual(result, customer1);
    });

    it('throws if the customer record has a fxa id mismatch', async () => {
      const listResponse = {
        autoPagingToArray: sinon.fake.resolves([customer1]),
      };
      sandbox.stub(stripeHelper.stripe.customers, 'list').returns(listResponse);
      let thrown;
      try {
        await stripeHelper.fetchCustomer('user1234', 'test@example.com');
      } catch (err) {
        thrown = err;
      }
      assert.isObject(thrown);
      assert.equal(thrown.message, 'A backend service request failed.');
      assert.equal(
        thrown.cause().message,
        'Customer for email: test@example.com in Stripe has mismatched uid'
      );
    });
  });

  describe('customer caching', () => {
    const uid = 'user123';
    const email = 'test@example.com';

    beforeEach(() => {
      const listResponse = {
        autoPagingToArray: sinon.fake.resolves([customer1]),
      };
      sandbox.stub(stripeHelper.stripe.customers, 'list').returns(listResponse);
    });

    describe('customer', () => {
      it('fetches an existing customer and caches it', async () => {
        assert.deepEqual(await stripeHelper.customer(uid, email), customer1);
        assert(mockRedis.get.calledOnce);
        assert(mockRedis.set.calledOnce);

        assert.deepEqual(await stripeHelper.customer(uid, email), customer1);
        assert(mockRedis.get.calledTwice);
        assert(mockRedis.set.calledOnce);
        assert(stripeHelper.stripe.customers.list.calledOnce);

        const customerKey = stripeHelper.customerCacheKey(uid, email);
        assert.deepEqual(
          await stripeHelper.customer(uid, email),
          JSON.parse(await mockRedis.get(customerKey))
        );
      });
    });

    describe('subscriptionForCustomer', () => {
      it('uses cached customer data to look up a subscription', async () => {
        assert.deepEqual(await stripeHelper.customer(uid, email), customer1);
        assert(mockRedis.get.calledOnce);
        assert(mockRedis.set.calledOnce);

        assert.deepEqual(
          await stripeHelper.subscriptionForCustomer(
            uid,
            email,
            customer1.subscriptions.data[0].id
          ),
          customer1.subscriptions.data[0]
        );
        assert(mockRedis.get.calledTwice);
        assert(mockRedis.set.calledOnce);
        assert(stripeHelper.stripe.customers.list.calledOnce);
      });
    });

    describe('subscriptionForCustomer', () => {
      it('uses only cached customer data to look up a subscription', async () => {
        assert.deepEqual(
          await stripeHelper.customer('nonexistentuid', email, false, true),
          undefined
        );
        assert(mockRedis.get.calledOnce);
        assert.equal(mockRedis.set.callCount, 0);
        assert.equal(stripeHelper.stripe.customers.list.callCount, 0);
      });
    });

    describe('fetchAllSubscriptionsForCustomer', () => {
      it('calls Stripe with the correct arguments', async () => {
        sandbox
          .stub(stripeHelper.stripe.subscriptions, 'list')
          .returns({ has_more: false, data: [{ id: 'sub_wibble' }] });
        await stripeHelper.fetchAllSubscriptionsForCustomer(
          'cus_9001',
          'sub_ixi'
        );
        assert.isTrue(
          stripeHelper.stripe.subscriptions.list.calledOnceWith({
            customer: 'cus_9001',
            starting_after: 'sub_ixi',
          })
        );
      });
      it('calls Stripe until has_more is false', async () => {
        const stub = sandbox.stub(stripeHelper.stripe.subscriptions, 'list');
        stub
          .onFirstCall()
          .returns({ has_more: true, data: [{ id: 'sub_quux' }] });
        stub
          .onSecondCall()
          .returns({ has_more: true, data: [{ id: 'sub_foo' }] });
        stub
          .onThirdCall()
          .returns({ has_more: false, data: [{ id: 'sub_bar' }] });
        const subs = await stripeHelper.fetchAllSubscriptionsForCustomer(
          'cus_9001',
          'sub_ixi'
        );
        assert.equal(stripeHelper.stripe.subscriptions.list.callCount, 3);
        stub.firstCall.calledWithExactly({
          customer: 'cus_9001',
          starting_after: 'sub_ixi',
        });
        stub.secondCall.calledWithExactly({
          customer: 'cus_9001',
          starting_after: 'sub_quux',
        });
        stub.thirdCall.calledWithExactly({
          customer: 'cus_9001',
          starting_after: 'sub_foo',
        });
        assert.deepEqual(subs, [
          { id: 'sub_quux' },
          { id: 'sub_foo' },
          { id: 'sub_bar' },
        ]);
      });
    });

    describe('cache deletion', () => {
      let customerKey;

      beforeEach(async () => {
        customerKey = stripeHelper.customerCacheKey(uid, email);
        assert.deepEqual(
          await stripeHelper.customer(uid, email),
          JSON.parse(await mockRedis.get(customerKey))
        );
      });

      describe('refreshCachedCustomer', () => {
        it('forces a refresh of a cached customer by uid and email', async () => {
          await stripeHelper.refreshCachedCustomer(uid, email);
          assert(stripeHelper.stripe.customers.list.calledTwice);
        });
      });
    });
  });

  describe('findPlanById', () => {
    it('finds a valid plan', async () => {
      const planId = 'plan_G93lTs8hfK7NNG';
      const result = await stripeHelper.findPlanById(planId);
      assert(stripeHelper.stripe.plans.list.calledOnce);
      assert(result.plan_id, planId);
    });

    it('throws on invalid plan id', async () => {
      const planId = 'plan_9';
      let thrown;
      try {
        await stripeHelper.findPlanById(planId);
      } catch (err) {
        thrown = err;
      }
      assert(stripeHelper.stripe.plans.list.calledOnce);
      assert.isObject(thrown);
      assert.equal(thrown.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION_PLAN);
    });
  });
});
