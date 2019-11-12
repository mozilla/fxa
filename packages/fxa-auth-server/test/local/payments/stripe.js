/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const { assert } = require('chai');
const { mockLog } = require('../../mocks');
const error = require('../../../lib/error');

const StripeHelper = require('../../../lib/payments/stripe');

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

mockConfig.redis = mockRedisConfig;

describe('StripeHelper', () => {
  /** @type StripeHelper */
  let stripeHelper;
  /** @type sinon.SinonSandbox */
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
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

  it('pulls a list of plans', async () => {
    const plans = await stripeHelper.allPlans();
    assert.lengthOf(plans, 3);
    assert(stripeHelper.stripe.plans.list.calledOnce);
  });

  it('pulls a list of products', async () => {
    const products = await stripeHelper.allProducts();
    assert.lengthOf(products, 3);
    assert(stripeHelper.stripe.products.list.calledOnce);
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

  it('thrwos an error if the product is not upgradeable', async () => {
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
});
