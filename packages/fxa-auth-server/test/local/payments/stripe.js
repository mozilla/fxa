/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const Sentry = require('@sentry/node');
const { assert } = require('chai');
const { mockLog } = require('../../mocks');
const error = require('../../../lib/error');
const stripeError = require('stripe').Stripe.errors;
const uuidv4 = require('uuid').v4;

let mockRedis;
const proxyquire = require('proxyquire').noPreserveCache();
const StripeHelper = proxyquire('../../../lib/payments/stripe', {
  '../redis': (config, log) => mockRedis.init(config, log),
});

const customer1 = require('./fixtures/customer1.json');
const newCustomer = require('./fixtures/customer_new.json');
const deletedCustomer = require('./fixtures/customer_deleted.json');
const plan1 = require('./fixtures/plan1.json');
const plan2 = require('./fixtures/plan2.json');
const plan3 = require('./fixtures/plan3.json');
const product1 = require('./fixtures/product1.json');
const product2 = require('./fixtures/product2.json');
const product3 = require('./fixtures/product3.json');
const subscription1 = require('./fixtures/subscription1.json');
const subscription2 = require('./fixtures/subscription2.json');
const cancelledSubscription = require('./fixtures/subscription_cancelled.json');
const pastDueSubscription = require('./fixtures/subscription_past_due.json');
const paidInvoice = require('./fixtures/invoice_paid.json');
const unpaidInvoice = require('./fixtures/invoice_open.json');
const successfulPaymentIntent = require('./fixtures/paymentIntent_succeeded.json');
const unsuccessfulPaymentIntent = require('./fixtures/paymentIntent_requires_payment_method.json');
const failedCharge = require('./fixtures/charge_failed.json');

const mockConfig = {
  publicUrl: 'https://accounts.example.com',
  subscriptions: {
    cacheTtlSeconds: 10,
    stripeCustomerCacheTtlSeconds: 10,
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

/**
 * To prevent the modification of the test objects loaded, which can impact other tests referencing the object,
 * a deep copy of the object can be created which uses the test object as a template
 *
 * @param {Object} object
 */
function deepCopy(object) {
  return JSON.parse(JSON.stringify(object));
}

describe('StripeHelper', () => {
  /** @type StripeHelper */
  let stripeHelper;
  /** @type sinon.SinonSandbox */
  let sandbox;
  let listStripePlans;

  let log;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    mockRedis = createMockRedis();
    log = mockLog();
    stripeHelper = new StripeHelper(log, mockConfig);
    listStripePlans = sandbox
      .stub(stripeHelper.stripe.plans, 'list')
      .returns(asyncIterable([plan1, plan2, plan3]));
    sandbox
      .stub(stripeHelper.stripe.products, 'list')
      .returns(asyncIterable([product1, product2, product3]));
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('allPlans', () => {
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
  });

  describe('fetchAllPlans', () => {
    it('only returns valid plans', async () => {
      const planMissingProduct = {
        id: 'plan_noprod',
        object: 'plan',
        product: null,
      };

      const planUnloadedProduct = {
        id: 'plan_stringprod',
        object: 'plan',
        product: 'prod_123',
      };

      const planDeletedProduct = {
        id: 'plan_deletedprod',
        object: 'plan',
        product: { deleted: true },
      };

      const goodPlan = deepCopy(plan1);
      goodPlan.product = deepCopy(product1);

      const planList = [
        planMissingProduct,
        planUnloadedProduct,
        planDeletedProduct,
        goodPlan,
      ];

      listStripePlans.restore();
      sandbox.stub(stripeHelper.stripe.plans, 'list').returns(planList);

      const expected = [
        {
          plan_id: goodPlan.id,
          plan_name: 'FPN Tier 1 Monthly',
          plan_metadata: goodPlan.metadata,
          product_id: goodPlan.product.id,
          product_name: goodPlan.product.name,
          product_metadata: goodPlan.product.metadata,
          interval: goodPlan.interval,
          interval_count: goodPlan.interval_count,
          amount: goodPlan.amount,
          currency: goodPlan.currency,
        },
      ];

      const actual = await stripeHelper.fetchAllPlans();

      /** Assert that only the "good" plan was returned */
      assert.deepEqual(actual, expected);

      /** Verify the error cases were handled properly */
      assert.equal(stripeHelper.log.error.callCount, 3);

      /** Plan.product is null */
      assert.equal(
        `fetchAllPlans - Plan "${planMissingProduct.id}" missing Product`,
        stripeHelper.log.error.getCall(0).args[0]
      );

      /** Plan.product is string */
      assert.equal(
        `fetchAllPlans - Plan "${planUnloadedProduct.id}" failed to load Product`,
        stripeHelper.log.error.getCall(1).args[0]
      );

      /** Plan.product is DeletedProduct */
      assert.equal(
        `fetchAllPlans - Plan "${planDeletedProduct.id}" associated with Deleted Product`,
        stripeHelper.log.error.getCall(2).args[0]
      );
    });
  });

  describe('allProducts', () => {
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
  });

  describe('verifyPlanUpgradeForSubscription', () => {
    it('does nothing for valid upgrade', async () => {
      assert.isUndefined(
        await stripeHelper.verifyPlanUpgradeForSubscription(
          'plan_G93lTs8hfK7NNG',
          'plan_G93mMKnIFCjZek'
        )
      );
    });

    describe('when the upgrade is invalid', () => {
      it('throws an invalidPlanUpgrade error', async () => {
        return stripeHelper
          .verifyPlanUpgradeForSubscription(
            'plan_G93lTs8hfK7NNG',
            'plan_F4G9jB3x5i6Dpj'
          )
          .then(
            () => Promise.reject(new Error('Method expected to reject')),
            err => {
              assert.equal(err.errno, error.ERRNO.INVALID_PLAN_UPGRADE);
            }
          );
      });
    });

    describe('when the current plan specified does not exist', () => {
      it('thows an unknownSubscriptionPlan error', async () => {
        return stripeHelper
          .verifyPlanUpgradeForSubscription('plan_bad', 'plan_F4G9jB3x5i6Dpj')
          .then(
            () => Promise.reject(new Error('Method expected to reject')),
            err => {
              assert.equal(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION_PLAN);
            }
          );
      });
    });

    describe('when the new plan specified does not exist', () => {
      it('thows an unknownSubscriptionPlan error', async () => {
        return stripeHelper
          .verifyPlanUpgradeForSubscription('plan_F4G9jB3x5i6Dpj', 'plan_bad')
          .then(
            () => Promise.reject(new Error('Method expected to reject')),
            err => {
              assert.equal(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION_PLAN);
            }
          );
      });
    });

    describe('when the current plan and the new plan are the same', () => {
      it('thows a subscriptionAlreadyChanged error', async () => {
        return stripeHelper
          .verifyPlanUpgradeForSubscription(
            'plan_G93lTs8hfK7NNG',
            'plan_G93lTs8hfK7NNG'
          )
          .then(
            () => Promise.reject(new Error('Method expected to reject')),
            err => {
              assert.equal(err.errno, error.ERRNO.SUBSCRIPTION_ALREADY_CHANGED);
            }
          );
      });
    });
  });

  describe('changeSubscriptionPlan', () => {
    it('accepts valid upgrade', async () => {
      sandbox
        .stub(stripeHelper.stripe.subscriptions, 'retrieve')
        .returns(subscription1);
      sandbox
        .stub(stripeHelper.stripe.subscriptions, 'update')
        .returns(subscription2);

      const actual = await stripeHelper.changeSubscriptionPlan(
        'sub_GAt1vgMqOSr5hT',
        'plan_G93mMKnIFCjZek'
      );
      assert.deepEqual(actual, subscription2);
    });

    it('throws an error if the user already upgraded', async () => {
      sandbox
        .stub(stripeHelper.stripe.subscriptions, 'retrieve')
        .returns(subscription2);
      sandbox
        .stub(stripeHelper.stripe.subscriptions, 'update')
        .returns(subscription2);
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

  describe('cancelSubscriptionForCustomer', () => {
    let stripeSubscriptionsUpdateStub;

    beforeEach(() => {
      stripeSubscriptionsUpdateStub = sandbox
        .stub(stripeHelper.stripe.subscriptions, 'update')
        .resolves();
    });

    describe('customer owns subscription', () => {
      it('calls subscription update', async () => {
        sandbox
          .stub(stripeHelper, 'subscriptionForCustomer')
          .resolves(subscription2);

        await stripeHelper.cancelSubscriptionForCustomer(
          '123',
          'test@example.com',
          subscription2.id
        );
        assert.isTrue(
          stripeSubscriptionsUpdateStub.calledOnceWith(subscription2.id, {
            cancel_at_period_end: true,
          })
        );
      });
    });

    describe('customer does not own the subscription', () => {
      it('throws an error', async () => {
        sandbox.stub(stripeHelper, 'subscriptionForCustomer').resolves();
        return stripeHelper
          .cancelSubscriptionForCustomer(
            '123',
            'test@example.com',
            subscription2.id
          )
          .then(
            () => Promise.reject(new Error('Method expected to reject')),
            err => {
              assert.equal(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION);
              assert.isTrue(stripeSubscriptionsUpdateStub.notCalled);
            }
          );
      });
    });
  });

  describe('reactivateSubscriptionForCustomer', () => {
    let stripeSubscriptionsUpdateStub;

    beforeEach(() => {
      stripeSubscriptionsUpdateStub = sandbox
        .stub(stripeHelper.stripe.subscriptions, 'update')
        .resolves();
    });

    describe('customer owns subscription', () => {
      describe('the intial subscription has a active status', () => {
        it('returns the updated subscription', async () => {
          const expected = deepCopy(subscription2);
          sandbox
            .stub(stripeHelper, 'subscriptionForCustomer')
            .resolves(subscription2);
          stripeHelper.stripe.subscriptions.update.resolves(expected);

          const actual = await stripeHelper.reactivateSubscriptionForCustomer(
            '123',
            'test@example.com',
            expected.id
          );

          assert.deepEqual(actual, expected);

          assert.isTrue(
            stripeSubscriptionsUpdateStub.calledOnceWith(expected.id, {
              cancel_at_period_end: false,
            })
          );
        });
      });

      describe('the initial subscription has a trialing status', () => {
        it('returns the updated subscription', async () => {
          const expected = deepCopy(subscription2);
          expected.status = 'trialing';

          sandbox
            .stub(stripeHelper, 'subscriptionForCustomer')
            .resolves(expected);
          stripeHelper.stripe.subscriptions.update.resolves(expected);

          const actual = await stripeHelper.reactivateSubscriptionForCustomer(
            '123',
            'test@example.com',
            expected.id
          );

          assert.deepEqual(actual, expected);

          assert.isTrue(
            stripeSubscriptionsUpdateStub.calledOnceWith(expected.id, {
              cancel_at_period_end: false,
            })
          );
        });
      });
      describe('the updated subscription is not in a active||trialing state', () => {
        it('throws an error', () => {
          const expected = deepCopy(subscription2);
          expected.status = 'unpaid';

          sandbox
            .stub(stripeHelper, 'subscriptionForCustomer')
            .resolves(expected);

          return stripeHelper
            .reactivateSubscriptionForCustomer(
              '123',
              'test@example.com',
              expected.id
            )
            .then(
              () => Promise.reject(new Error('Method expected to reject')),
              err => {
                assert.equal(err.errno, error.ERRNO.BACKEND_SERVICE_FAILURE);
                assert.isTrue(stripeSubscriptionsUpdateStub.notCalled);
              }
            );
        });
      });
    });

    describe('customer does not own the subscription', () => {
      it('throws an error', async () => {
        sandbox.stub(stripeHelper, 'subscriptionForCustomer').resolves();
        return stripeHelper
          .reactivateSubscriptionForCustomer(
            '123',
            'test@example.com',
            subscription2.id
          )
          .then(
            () => Promise.reject(new Error('Method expected to reject')),
            err => {
              assert.equal(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION);
              assert.isTrue(stripeSubscriptionsUpdateStub.notCalled);
            }
          );
      });
    });
  });

  describe('createCustomer', () => {
    it('creates a customer using stripe api', async () => {
      const expected = deepCopy(newCustomer);
      sandbox.stub(stripeHelper.stripe.customers, 'create').returns(expected);

      const actual = await stripeHelper.createCustomer(
        'uid',
        'joe@example.com',
        'Joe Cool',
        'tok_visa',
        uuidv4()
      );

      assert.deepEqual(actual, expected);
    });

    it('surfaces payment token errors', async () => {
      const apiError = new stripeError.StripeCardError();
      sandbox.stub(stripeHelper.stripe.customers, 'create').rejects(apiError);

      return stripeHelper
        .createCustomer(
          'uid',
          'joe@example.com',
          'Joe Cool',
          'tok_visa',
          uuidv4()
        )
        .then(
          () => Promise.reject(new Error('Method expected to reject')),
          err => {
            assert.equal(
              err.errno,
              error.ERRNO.REJECTED_SUBSCRIPTION_PAYMENT_TOKEN
            );
          }
        );
    });

    it('surfaces stripe errors', async () => {
      const apiError = new stripeError.StripeAPIError();
      sandbox.stub(stripeHelper.stripe.customers, 'create').rejects(apiError);

      return stripeHelper
        .createCustomer(
          'uid',
          'joe@example.com',
          'Joe Cool',
          'tok_visa',
          uuidv4()
        )
        .then(
          () => Promise.reject(new Error('Method expected to reject')),
          err => {
            assert.equal(err, apiError);
          }
        );
    });
  });

  describe('getCustomerUidEmailFromSubscription', () => {
    let customer, subscription;
    let scopeContextSpy, scopeSpy;

    beforeEach(() => {
      subscription = deepCopy(subscription2);

      scopeContextSpy = sinon.fake();
      scopeSpy = {
        setContext: scopeContextSpy,
      };
      sandbox.replace(Sentry, 'withScope', fn => fn(scopeSpy));
    });

    describe('customer exists and has FxA UID on metadata', () => {
      it('returns the uid and email information found on the customer object', async () => {
        customer = deepCopy(newCustomer);
        sandbox
          .stub(stripeHelper.stripe.customers, 'retrieve')
          .resolves(customer);

        const expected = {
          uid: customer.metadata.userid,
          email: customer.email,
        };
        const actual = await stripeHelper.getCustomerUidEmailFromSubscription(
          subscription
        );

        assert.deepEqual(actual, expected);
        assert.isTrue(scopeContextSpy.notCalled, 'Expected to not call Sentry');
      });
    });

    describe('customer deleted', () => {
      it('returns undefined for uid and email', async () => {
        customer = deepCopy(deletedCustomer);
        sandbox
          .stub(stripeHelper.stripe.customers, 'retrieve')
          .resolves(customer);

        const expected = { uid: undefined, email: undefined };
        const actual = await stripeHelper.getCustomerUidEmailFromSubscription(
          subscription
        );

        assert.deepEqual(actual, expected);
        assert.isTrue(scopeContextSpy.notCalled, 'Expected to not call Sentry');
      });
    });

    describe('customer exists but is missing FxA UID on metadata', () => {
      it('notifies Sentry and returns undefined for uid', async () => {
        customer = deepCopy(newCustomer);
        customer.metadata = {};
        sandbox
          .stub(stripeHelper.stripe.customers, 'retrieve')
          .resolves(customer);

        const expected = { uid: undefined, email: customer.email };
        const actual = await stripeHelper.getCustomerUidEmailFromSubscription(
          subscription
        );

        assert.deepEqual(actual, expected);
        assert.isTrue(scopeContextSpy.calledOnce, 'Expected to call Sentry');
      });
    });
  });

  describe('updateCustomerPaymentMethod', () => {
    it('updates a customer using stripe api', async () => {
      const expected = deepCopy(customer1);
      sandbox.stub(stripeHelper.stripe.customers, 'update').returns(expected);

      const actual = await stripeHelper.updateCustomerPaymentMethod(
        customer1.id,
        'tok_visa'
      );

      assert.deepEqual(actual, expected);
    });

    it('surfaces payment token errors', async () => {
      const apiError = new stripeError.StripeCardError();
      sandbox.stub(stripeHelper.stripe.customers, 'update').rejects(apiError);

      return stripeHelper
        .updateCustomerPaymentMethod(customer1.id, 'tok_visa')
        .then(
          () => Promise.reject(new Error('Method expected to reject')),
          err => {
            assert.equal(
              err.errno,
              error.ERRNO.REJECTED_SUBSCRIPTION_PAYMENT_TOKEN
            );
          }
        );
    });

    it('surfaces stripe errors', async () => {
      const apiError = new stripeError.StripeAPIError();
      sandbox.stub(stripeHelper.stripe.customers, 'update').rejects(apiError);

      return stripeHelper
        .updateCustomerPaymentMethod(customer1.id, 'tok_visa')
        .then(
          () => Promise.reject(new Error('Method expected to reject')),
          err => {
            assert.equal(err, apiError);
          }
        );
    });
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

    it('returns void if no customers are found', async () => {
      const listResponse = {
        autoPagingToArray: sinon.fake.resolves([]),
      };
      sandbox.stub(stripeHelper.stripe.customers, 'list').returns(listResponse);
      assert.isUndefined(
        await stripeHelper.fetchCustomer('user123', 'test@example.com')
      );
    });

    describe('when a customer has subscriptions and they are more than one page', () => {
      it('loads all of the subscriptions for the user', async () => {
        const customer = deepCopy(newCustomer);
        const custSubscription1 = deepCopy(subscription1);
        const custSubscription2 = deepCopy(subscription2);

        customer.subscriptions.data = [custSubscription1];
        customer.subscriptions.has_more = true;

        const listResponse = {
          autoPagingToArray: sinon.fake.resolves([customer]),
        };
        sandbox
          .stub(stripeHelper.stripe.customers, 'list')
          .returns(listResponse);
        sandbox
          .stub(stripeHelper, 'fetchAllSubscriptionsForCustomer')
          .resolves([custSubscription2]);

        const result = await stripeHelper.fetchCustomer(
          'testuid',
          customer.email
        );

        assert.isFalse(result.subscriptions.has_more);
        assert.strictEqual(
          result.subscriptions.data.length,
          2,
          'both subscriptions should be loaded'
        );
        assert.deepEqual(
          result.subscriptions.data[0],
          subscription1,
          'the subscription that was initially present is still present'
        );
        assert.deepEqual(
          result.subscriptions.data[1],
          subscription2,
          'the subscription that was loaded should be present'
        );
      });
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

      it('returns void if no customer is found', async () => {
        sandbox.stub(stripeHelper, 'customer').returns(null);

        assert.isUndefined(
          await stripeHelper.subscriptionForCustomer(
            uid,
            email,
            customer1.subscriptions.data[0].id
          )
        );
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

        it('logs errors', async () => {
          sandbox.stub(stripeHelper, 'customer').rejects(Error);
          await stripeHelper.refreshCachedCustomer(uid, email);
          assert(
            stripeHelper.log.error.calledOnceWith(
              'subhub.refreshCachedCustomer.failed'
            )
          );
        });
      });
    });

    describe('error fetching cached result', () => {
      beforeEach(() => {
        mockRedis.get.restore();
        sandbox.stub(mockRedis, 'get').rejects(Error);
      });

      it('logs error with defined refreshFunction', async () => {
        const result = await stripeHelper.customer(uid, email, false);
        assert.isNotEmpty(result);
        assert(
          log.error.calledOnceWith(
            'subhub.cachedResult.getCachedResponse.failed'
          )
        );
      });

      it('logs error with undefined refreshFunction (cacheOnly = true)', async () => {
        const result = await stripeHelper.customer(uid, email, false, true);
        assert.isUndefined(result);
        assert.isFalse(mockRedis.set.calledOnce);
        assert(
          log.error.calledOnceWith(
            'subhub.cachedResult.getCachedResponse.failed'
          )
        );
      });
    });

    describe('error setting cached result', () => {
      it('logs error', async () => {
        mockRedis.set.restore();
        sandbox.stub(mockRedis, 'set').rejects(Error);

        const result = await stripeHelper.customer(uid, email);
        assert.isNotEmpty(result);
        assert(
          log.error.calledOnceWith(
            'subhub.cachedResult.setCacheResponse.failed'
          )
        );
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

  describe('createSubscription', () => {
    describe('failed to create subscription', () => {
      it('surfaces payment token errors', async () => {
        const apiError = new stripeError.StripeCardError();
        sandbox
          .stub(stripeHelper.stripe.subscriptions, 'create')
          .rejects(apiError);

        return stripeHelper.createSubscription(customer1, plan1, uuidv4()).then(
          () => Promise.reject(new Error('Method expected to reject')),
          err => {
            assert.equal(
              err.errno,
              error.ERRNO.REJECTED_SUBSCRIPTION_PAYMENT_TOKEN
            );
          }
        );
      });

      it('surfaces stripe errors', async () => {
        const apiError = new stripeError.StripeAPIError();
        sandbox
          .stub(stripeHelper.stripe.subscriptions, 'create')
          .rejects(apiError);

        return stripeHelper.createSubscription(customer1, plan1, uuidv4()).then(
          () => Promise.reject(new Error('Method expected to reject')),
          err => {
            assert.equal(err, apiError);
          }
        );
      });
    });

    describe('subscription created', () => {
      describe('invoice paid', () => {
        const subscription = deepCopy(subscription1);
        subscription.latest_invoice = deepCopy(paidInvoice);
        subscription.latest_invoice.payment_intent = successfulPaymentIntent;

        it('returns the subscription', async () => {
          const expected = subscription;
          sandbox
            .stub(stripeHelper.stripe.subscriptions, 'create')
            .resolves(subscription);

          const actual = await stripeHelper.createSubscription(
            customer1,
            plan1,
            uuidv4()
          );

          assert.deepEqual(actual, expected);
        });
      });

      describe('invoice not paid', () => {
        const subscription = deepCopy(subscription1);
        subscription.latest_invoice = deepCopy(unpaidInvoice);
        subscription.latest_invoice.payment_intent = unsuccessfulPaymentIntent;

        it('throws a payment failed error', async () => {
          let failed = false;
          sandbox
            .stub(stripeHelper.stripe.subscriptions, 'create')
            .resolves(subscription);

          await stripeHelper
            .createSubscription(customer1, plan1, uuidv4())
            .then(
              () => Promise.reject(new Error('Method expected to reject')),
              err => {
                failed = true;
                assert.equal(err.errno, error.ERRNO.PAYMENT_FAILED);
                assert.equal(err.message, 'Payment method failed');
              }
            );

          assert.isTrue(failed);
        });
      });
    });
  });

  describe('paidInvoice', () => {
    describe("when Invoice status is 'paid'", () => {
      describe("Payment Intent Status is 'succeeded'", () => {
        const invoice = deepCopy(paidInvoice);
        invoice.payment_intent = successfulPaymentIntent;
        it('should return true', () => {
          assert.isTrue(stripeHelper.paidInvoice(invoice));
        });
      });

      describe("Payment Intent Status is NOT 'succeeded'", () => {
        const invoice = deepCopy(paidInvoice);
        invoice.payment_intent = unsuccessfulPaymentIntent;
        it('should return false', () => {
          assert.isFalse(stripeHelper.paidInvoice(invoice));
        });
      });
    });

    describe("when Invoice status is NOT 'paid'", () => {
      describe("Payment Intent Status is 'succeeded'", () => {
        const invoice = deepCopy(unpaidInvoice);
        invoice.payment_intent = successfulPaymentIntent;
        it('should return false', () => {
          assert.isFalse(stripeHelper.paidInvoice(invoice));
        });
      });

      describe("Payment Intent Status is NOT 'succeeded'", () => {
        const invoice = deepCopy(unpaidInvoice);
        invoice.payment_intent = unsuccessfulPaymentIntent;
        it('should return false', () => {
          assert.isFalse(stripeHelper.paidInvoice(invoice));
        });
      });
    });
  });

  describe('payInvoice', () => {
    describe('invoice is created', () => {
      it('returns the invoice if marked as paid', async () => {
        const expected = deepCopy(paidInvoice);
        expected.payment_intent = successfulPaymentIntent;
        sandbox.stub(stripeHelper.stripe.invoices, 'pay').resolves(expected);

        const actual = await stripeHelper.payInvoice(paidInvoice.id);

        assert.deepEqual(expected, actual);
      });

      it('throws an error if invoice is not marked as paid', async () => {
        const expected = deepCopy(paidInvoice);
        expected.payment_intent = unsuccessfulPaymentIntent;
        sandbox.stub(stripeHelper.stripe.invoices, 'pay').resolves(expected);

        return stripeHelper.payInvoice(paidInvoice.id).then(
          () => Promise.reject(new Error('Method expected to reject')),
          err => {
            assert.equal(err.errno, error.ERRNO.PAYMENT_FAILED);
            assert.equal(err.message, 'Payment method failed');
          }
        );
      });
    });

    describe('invoice is not created', () => {
      it('returns payment failed error if card_declined is reason', () => {
        const cardDeclinedError = new stripeError.StripeCardError();
        cardDeclinedError.code = 'card_declined';
        sandbox
          .stub(stripeHelper.stripe.invoices, 'pay')
          .rejects(cardDeclinedError);

        return stripeHelper.payInvoice(paidInvoice.id).then(
          () => Promise.reject(new Error('Method expected to reject')),
          err => {
            assert.equal(err.errno, error.ERRNO.PAYMENT_FAILED);
            assert.equal(err.message, 'Payment method failed');
          }
        );
      });

      it('throws caught Stripe error if not card_declined', () => {
        const apiError = new stripeError.StripeAPIError();
        apiError.code = 'api_error';
        sandbox.stub(stripeHelper.stripe.invoices, 'pay').rejects(apiError);

        return stripeHelper.payInvoice(paidInvoice.id).then(
          () => Promise.reject(new Error('Method expected to reject')),
          err => {
            assert.equal(err, apiError);
          }
        );
      });
    });
  });

  describe('fetchPaymentIntentFromInvoice', () => {
    beforeEach(() => {
      sandbox
        .stub(stripeHelper.stripe.paymentIntents, 'retrieve')
        .returns(unsuccessfulPaymentIntent);
    });

    describe('when the payment_intent is loaded', () => {
      it('returns the payment_intent from the Invoice object', async () => {
        const invoice = deepCopy(unpaidInvoice);
        invoice.payment_intent = unsuccessfulPaymentIntent;

        const expected = invoice.payment_intent;
        const actual = await stripeHelper.fetchPaymentIntentFromInvoice(
          invoice
        );

        assert.deepEqual(actual, expected);
        assert.isTrue(stripeHelper.stripe.paymentIntents.retrieve.notCalled);
      });
    });

    describe('when the payment_intnet is not loaded', () => {
      it('fetches the payment_intent from Stripe', async () => {
        const invoice = deepCopy(unpaidInvoice);
        const expected = unsuccessfulPaymentIntent;
        const actual = await stripeHelper.fetchPaymentIntentFromInvoice(
          invoice
        );

        assert.deepEqual(actual, expected);
        assert.isTrue(stripeHelper.stripe.paymentIntents.retrieve.calledOnce);
      });
    });
  });

  describe('getProductName', () => {
    describe('when provided a Product object', () => {
      it('returns the name of the product', async () => {
        const expected = product1.name;
        const actual = await stripeHelper.getProductName(product1);

        assert.equal(expected, actual);
      });
    });

    describe('when provided a Product ID', () => {
      it('returns the product name if found', async () => {
        const expected = product1.name;
        const actual = await stripeHelper.getProductName(product1.id);

        assert.equal(expected, actual);
      });

      it('returns an empty string if not found', async () => {
        const expected = '';
        const actual = await stripeHelper.getProductName('bad_planid');

        assert.equal(expected, actual);
      });
    });
  });

  describe('constructWebhookEvent', () => {
    it('calls stripe.webhooks.construct event', () => {
      const expected = 'the expected result';
      sandbox
        .stub(stripeHelper.stripe.webhooks, 'constructEvent')
        .returns(expected);

      const actual = stripeHelper.constructWebhookEvent([], 'signature');
      assert.equal(actual, expected);
    });
  });

  describe('subscriptionsToResponse', () => {
    const planName = 'FPN Tier 1 Monthly';

    beforeEach(() => {
      sandbox.stub(stripeHelper, 'formatPlanDisplayName').returns(planName);
    });

    describe('when is one subscription', () => {
      describe('when there is a subscription with an incomplete status', () => {
        it('should not include the subscription', async () => {
          const subscription = deepCopy(subscription1);
          subscription.status = 'incomplete';

          const input = {
            data: [subscription],
          };

          const expected = [];
          const actual = await stripeHelper.subscriptionsToResponse(input);

          assert.deepEqual(actual, expected);
        });
      });

      describe('when there is a subscription with an incomplete_expired status', () => {
        it('should not include the subscription', async () => {
          const subscription = deepCopy(subscription1);
          subscription.status = 'incomplete_expired';

          const input = {
            data: [subscription],
          };

          const expected = [];
          const actual = await stripeHelper.subscriptionsToResponse(input);

          assert.deepEqual(actual, expected);
        });
      });

      describe('when there is a charge-automatically payment that is past due', () => {
        const expected = [
          {
            created: pastDueSubscription.created,
            current_period_end: pastDueSubscription.current_period_end,
            current_period_start: pastDueSubscription.current_period_start,
            cancel_at_period_end: false,
            end_at: null,
            plan_name: planName,
            plan_id: pastDueSubscription.plan.id,
            status: 'past_due',
            subscription_id: pastDueSubscription.id,
            failure_code: failedCharge.failure_code,
            failure_message: failedCharge.failure_message,
            latest_invoice: failedCharge.latest_invoice,
          },
        ];

        beforeEach(() => {
          sandbox
            .stub(stripeHelper.stripe.charges, 'retrieve')
            .returns(failedCharge);
        });

        describe('when the charge is already expanded', () => {
          it('includes charge failure information with the subscription data', async () => {
            const subscription = deepCopy(pastDueSubscription);
            const invoice = deepCopy(unpaidInvoice);
            invoice.charge = failedCharge;
            subscription.latest_invoice = invoice;

            const input = { data: [subscription] };

            const actual = await stripeHelper.subscriptionsToResponse(input);

            assert.deepEqual(actual, expected);
            assert.isTrue(stripeHelper.stripe.charges.retrieve.notCalled);
            assert.isDefined(actual[0].failure_code);
            assert.isDefined(actual[0].failure_message);
          });
        });

        describe('when the charge is not expanded', () => {
          it('expands the charge and includes charge failure information with the subscription data', async () => {
            const subscription = deepCopy(pastDueSubscription);
            const invoice = deepCopy(unpaidInvoice);
            subscription.latest_invoice = invoice;

            const input = { data: [subscription] };

            const actual = await stripeHelper.subscriptionsToResponse(input);

            assert.deepEqual(actual, expected);
            assert.isTrue(stripeHelper.stripe.charges.retrieve.calledOnce);
            assert.isDefined(actual[0].failure_code);
            assert.isDefined(actual[0].failure_message);
          });
        });
      });

      describe('when the subscription is not past_due, incomplete, or incomplete_expired', () => {
        describe('when the subscription is active', () => {
          it('formats the subscription', async () => {
            const input = { data: [subscription1] };
            const expected = [
              {
                created: subscription1.created,
                current_period_end: subscription1.current_period_end,
                current_period_start: subscription1.current_period_start,
                cancel_at_period_end: false,
                end_at: null,
                plan_name: planName,
                plan_id: subscription1.plan.id,
                status: 'active',
                subscription_id: subscription1.id,
                failure_code: undefined,
                failure_message: undefined,
                latest_invoice: subscription1.latest_invoice,
              },
            ];

            const actual = await stripeHelper.subscriptionsToResponse(input);
            assert.deepEqual(actual, expected);
          });
        });

        describe('when the subscription is set to cancel', () => {
          it('sets cancel_at_period_end to `true` and end_at to `null`', async () => {
            const subscription = deepCopy(subscription1);
            subscription.cancel_at_period_end = true;
            const input = { data: [subscription] };
            const expected = [
              {
                created: subscription.created,
                current_period_end: subscription.current_period_end,
                current_period_start: subscription.current_period_start,
                cancel_at_period_end: true,
                end_at: null,
                plan_name: planName,
                plan_id: subscription.plan.id,
                status: 'active',
                subscription_id: subscription.id,
                failure_code: undefined,
                failure_message: undefined,
                latest_invoice: subscription.latest_invoice,
              },
            ];

            const actual = await stripeHelper.subscriptionsToResponse(input);
            assert.deepEqual(actual, expected);
          });
        });

        describe('when the subscription has already ended', () => {
          it('set end_at to the last active day of the subscription', async () => {
            const input = { data: [cancelledSubscription] };
            const expected = [
              {
                created: cancelledSubscription.created,
                current_period_end: cancelledSubscription.current_period_end,
                current_period_start:
                  cancelledSubscription.current_period_start,
                cancel_at_period_end: false,
                end_at: cancelledSubscription.ended_at,
                plan_name: planName,
                plan_id: cancelledSubscription.plan.id,
                status: 'canceled',
                subscription_id: cancelledSubscription.id,
                failure_code: undefined,
                failure_message: undefined,
                latest_invoice: cancelledSubscription.latest_invoice,
              },
            ];

            const actual = await stripeHelper.subscriptionsToResponse(input);
            assert.deepEqual(actual, expected);
            assert.isNotNull(actual[0].end_at);
          });
        });
      });
    });

    describe('when there are no subscriptions', () => {
      it('returns an empty array', async () => {
        const expected = [];
        const actual = await stripeHelper.subscriptionsToResponse({ data: [] });

        assert.deepEqual(actual, expected);
      });
    });

    describe('when there are multiple subscriptions', () => {
      it('returns a formatted version of all not incomplete or incomplete_expired subscriptions', async () => {
        const incompleteSubscription = deepCopy(subscription1);
        incompleteSubscription.status = 'incomplete';
        incompleteSubscription.id = 'sub_incomplete';

        const input = {
          data: [subscription1, incompleteSubscription, subscription2],
        };

        const response = await stripeHelper.subscriptionsToResponse(input);

        assert.lengthOf(response, 2);
        assert.isDefined(
          response.find(x => x.subscription_id === subscription1.id),
          'should contain subscription1'
        );
        assert.isDefined(
          response.find(x => x.subscription_id === subscription2.id),
          'should contain subscription2'
        );
        assert.isUndefined(
          response.find(x => x.subscription_id === incompleteSubscription.id),
          'should not contain incompleteSubscription'
        );
      });
    });
  });

  describe('formatPlanDisplayName', () => {
    it('return a display name based off the plan interval and product name', async () => {
      let actual, expected;
      const plan = deepCopy(plan1);
      const productName = plan.product.name;

      sandbox.stub(stripeHelper, 'getProductName').returns(productName);

      plan.interval = 'day';
      expected = `${productName} Daily`;
      actual = await stripeHelper.formatPlanDisplayName(plan);
      assert.equal(actual, expected, 'it should format daily');

      plan.interval = 'week';
      expected = `${productName} Weekly`;
      actual = await stripeHelper.formatPlanDisplayName(plan);
      assert.equal(actual, expected, 'it should format weekly');

      plan.interval = 'month';
      expected = `${productName} Monthly`;
      actual = await stripeHelper.formatPlanDisplayName(plan);
      assert.equal(actual, expected, 'it should format monthly');

      plan.interval = 'year';
      expected = `${productName} Yearly`;
      actual = await stripeHelper.formatPlanDisplayName(plan);
      assert.equal(actual, expected, 'it should format yearly');
    });
  });
});
