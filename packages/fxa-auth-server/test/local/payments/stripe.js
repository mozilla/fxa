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
const moment = require('moment');

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
const invoicePaymentSucceededSubscriptionCreate = require('./fixtures/invoice_payment_succeeded_subscription_create.json');
const eventCustomerSourceExpiring = require('./fixtures/event_customer_source_expiring.json');
const eventCustomerSubscriptionUpdated = require('./fixtures/event_customer_subscription_updated.json');

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
  host: 'localhost',
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
  Object.keys(mock).forEach((key) => sinon.spy(mock, key));
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

  describe('getCachedResult', () => {
    const expectedResult = { status: 'success' };

    const cacheKey = 'testKey';
    let refreshFunction;

    beforeEach(() => {
      refreshFunction = sandbox.stub().returns(expectedResult);
    });

    it('follows read-through caching logic', async () => {
      // On first call: cache miss, call refresh function, cache the result
      let actualResult = await stripeHelper.getCachedResult(
        cacheKey,
        refreshFunction
      );
      assert.isTrue(mockRedis.get.calledOnceWithExactly(cacheKey));
      assert.isTrue(
        mockRedis.set.calledOnceWith(
          cacheKey,
          JSON.stringify(expectedResult),
          'EX',
          mockConfig.subscriptions.cacheTtlSeconds
        )
      );
      assert.isTrue(refreshFunction.calledOnce);
      assert.deepEqual(actualResult, expectedResult);

      refreshFunction.resetHistory();
      mockRedis.get.resetHistory();
      mockRedis.set.resetHistory();

      // On subsequent call: cache hit, return cache result
      actualResult = await stripeHelper.getCachedResult(
        cacheKey,
        refreshFunction
      );
      assert.isTrue(mockRedis.get.calledOnceWithExactly(cacheKey));
      assert.isTrue(mockRedis.set.notCalled);
      assert.isTrue(refreshFunction.notCalled);
      assert.deepEqual(actualResult, expectedResult);
    });

    describe('when there is an error on cache read', () => {
      it('logs error and returns expected result', async () => {
        mockRedis.get.restore();
        sandbox.stub(mockRedis, 'get').rejects(Error);

        const actualResult = await stripeHelper.getCachedResult(
          cacheKey,
          refreshFunction
        );

        assert.isTrue(mockRedis.get.calledOnceWithExactly(cacheKey));
        assert.isTrue(
          mockRedis.set.calledOnceWith(
            cacheKey,
            JSON.stringify(expectedResult),
            'EX',
            mockConfig.subscriptions.cacheTtlSeconds
          )
        );
        assert.isTrue(
          log.error.calledOnceWith(
            'stripeHelper.getCachedResult.redis.get.failed'
          )
        );
        assert.deepEqual(actualResult, expectedResult);
      });
    });

    describe('when there is an error on cache save', () => {
      it('logs error and returns expected result', async () => {
        mockRedis.set.restore();
        sandbox.stub(mockRedis, 'set').rejects(Error);

        const actualResult = await stripeHelper.getCachedResult(
          cacheKey,
          refreshFunction
        );

        assert.isTrue(mockRedis.get.calledOnceWithExactly(cacheKey));
        assert.isTrue(
          mockRedis.set.calledOnceWith(
            cacheKey,
            JSON.stringify(expectedResult),
            'EX',
            mockConfig.subscriptions.cacheTtlSeconds
          )
        );
        assert.isTrue(
          log.error.calledOnceWith(
            'stripeHelper.getCachedResult.redis.set.failed'
          )
        );
        assert.deepEqual(actualResult, expectedResult);
      });
    });
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

  describe('verifyPlanUpdateForSubscription', () => {
    it('does nothing for valid upgrade or downgrade', async () => {
      assert.isUndefined(
        await stripeHelper.verifyPlanUpdateForSubscription(
          'plan_G93lTs8hfK7NNG',
          'plan_G93mMKnIFCjZek'
        )
      );
      assert.isUndefined(
        await stripeHelper.verifyPlanUpdateForSubscription(
          'plan_G93mMKnIFCjZek',
          'plan_G93lTs8hfK7NNG'
        )
      );
    });

    describe('when the upgrade is invalid', () => {
      it('throws an invalidPlanUpdate error', async () => {
        return stripeHelper
          .verifyPlanUpdateForSubscription(
            'plan_G93lTs8hfK7NNG',
            'plan_F4G9jB3x5i6Dpj'
          )
          .then(
            () => Promise.reject(new Error('Method expected to reject')),
            (err) => {
              assert.equal(err.errno, error.ERRNO.INVALID_PLAN_UPDATE);
            }
          );
      });
    });

    describe('when the current plan specified does not exist', () => {
      it('thows an unknownSubscriptionPlan error', async () => {
        return stripeHelper
          .verifyPlanUpdateForSubscription('plan_bad', 'plan_F4G9jB3x5i6Dpj')
          .then(
            () => Promise.reject(new Error('Method expected to reject')),
            (err) => {
              assert.equal(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION_PLAN);
            }
          );
      });
    });

    describe('when the new plan specified does not exist', () => {
      it('thows an unknownSubscriptionPlan error', async () => {
        return stripeHelper
          .verifyPlanUpdateForSubscription('plan_F4G9jB3x5i6Dpj', 'plan_bad')
          .then(
            () => Promise.reject(new Error('Method expected to reject')),
            (err) => {
              assert.equal(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION_PLAN);
            }
          );
      });
    });

    describe('when the current plan and the new plan are the same', () => {
      it('thows a subscriptionAlreadyChanged error', async () => {
        return stripeHelper
          .verifyPlanUpdateForSubscription(
            'plan_G93lTs8hfK7NNG',
            'plan_G93lTs8hfK7NNG'
          )
          .then(
            () => Promise.reject(new Error('Method expected to reject')),
            (err) => {
              assert.equal(err.errno, error.ERRNO.SUBSCRIPTION_ALREADY_CHANGED);
            }
          );
      });
    });
  });

  describe('changeSubscriptionPlan', () => {
    it('accepts valid upgrade and adds the appropriate metadata', async () => {
      const unixTimestamp = moment().unix();
      const subscription = deepCopy(subscription1);
      subscription.metadata = {
        key: 'value',
        previous_plan_id: 'plan_123',
        plan_change_date: 12345678,
      };

      sandbox.stub(moment, 'unix').returns(unixTimestamp);
      sandbox
        .stub(stripeHelper.stripe.subscriptions, 'retrieve')
        .returns(subscription);

      const update = sandbox
        .stub(stripeHelper.stripe.subscriptions, 'update')
        .returns(subscription2);

      const actual = await stripeHelper.changeSubscriptionPlan(
        'sub_GAt1vgMqOSr5hT',
        'plan_G93mMKnIFCjZek'
      );
      assert.deepEqual(actual, subscription2);

      assert.isTrue(
        update.calledOnceWithExactly('sub_GAt1vgMqOSr5hT', {
          cancel_at_period_end: false,
          items: [
            {
              id: subscription1.items.data[0].id,
              plan: 'plan_G93mMKnIFCjZek',
            },
          ],
          metadata: {
            key: 'value',
            previous_plan_id: subscription1.items.data[0].plan.id,
            plan_change_date: unixTimestamp,
          },
        })
      );
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
        const existingMetadata = { foo: 'bar' };
        const unixTimestamp = moment().unix();
        sandbox.stub(moment, 'unix').returns(unixTimestamp);
        sandbox
          .stub(stripeHelper, 'subscriptionForCustomer')
          .resolves({ ...subscription2, metadata: existingMetadata });

        await stripeHelper.cancelSubscriptionForCustomer(
          '123',
          'test@example.com',
          subscription2.id
        );
        assert.isTrue(
          stripeSubscriptionsUpdateStub.calledOnceWith(subscription2.id, {
            cancel_at_period_end: true,
            metadata: {
              ...existingMetadata,
              cancelled_for_customer_at: unixTimestamp,
            },
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
            (err) => {
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
          const existingMetadata = { foo: 'bar' };
          const expected = {
            ...deepCopy(subscription2),
            metadata: existingMetadata,
          };
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
              metadata: {
                ...existingMetadata,
                cancelled_for_customer_at: '',
              },
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
              metadata: {
                cancelled_for_customer_at: '',
              },
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
              (err) => {
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
            (err) => {
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
          (err) => {
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
          (err) => {
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
      sandbox.replace(Sentry, 'withScope', (fn) => fn(scopeSpy));
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
          (err) => {
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
          (err) => {
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

      describe('removeCustomerFromCache', () => {
        it('removes the entry from redis', async () => {
          assert.isNotEmpty(await mockRedis.get(customerKey));

          await stripeHelper.removeCustomerFromCache(uid, email);

          assert.isTrue(mockRedis.del.calledOnceWithExactly(customerKey));
          assert.isTrue(log.error.notCalled);
          assert.isUndefined(await mockRedis.get(customerKey));
        });

        it('does not fail if key does not exist', async () => {
          const key = stripeHelper.customerCacheKey('test-test-test', email);
          assert.isUndefined(await mockRedis.get(key));

          await stripeHelper.removeCustomerFromCache('test-test-test', email);

          assert.isTrue(mockRedis.del.calledOnceWithExactly(key));
          assert.isTrue(log.error.notCalled);
          assert.isUndefined(await mockRedis.get(key));
        });

        it('logs errors', async () => {
          mockRedis.del.restore();
          sandbox.stub(mockRedis, 'del').rejects(Error);

          await stripeHelper.removeCustomerFromCache(uid, email);

          assert.isTrue(mockRedis.del.calledOnceWithExactly(customerKey));
          const expectedLogMsg = `stripeHelper.removeCustomerFromCache failed to remove cache key: ${customerKey}`;
          assert.isTrue(log.error.calledOnceWith(expectedLogMsg));
        });
      });
    });

    describe('error fetching cached result', () => {
      it('logs error', async () => {
        mockRedis.get.restore();
        sandbox.stub(mockRedis, 'get').rejects(Error);

        const result = await stripeHelper.customer(uid, email, false);
        assert.isNotEmpty(result);
        assert(
          log.error.calledOnceWith('stripeHelper.customer.redis.get.failed')
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
          log.error.calledOnceWith('stripeHelper.customer.redis.set.failed')
        );
      });
    });
  });

  describe('removeCustomer', () => {
    let stripeCustomerUpdate;
    const uid = 'user123';
    const email = 'test@example.com';

    beforeEach(() => {
      stripeCustomerUpdate = sandbox
        .stub(stripeHelper.stripe.customers, 'update')
        .returns();

      sandbox.spy(stripeHelper, 'removeCustomerFromCache');
    });

    describe('when customer is found', () => {
      it('flags customer for deletion and removes cache record', async () => {
        sandbox.stub(stripeHelper, 'fetchCustomer').resolves(customer1);

        await stripeHelper.removeCustomer(uid, email);

        assert(stripeCustomerUpdate.calledOnce);
        assert(stripeHelper.removeCustomerFromCache.calledOnce);
      });
    });

    describe('when customer is not found', () => {
      it('does not throw any errors', async () => {
        sandbox.stub(stripeHelper, 'fetchCustomer').resolves();

        await stripeHelper.removeCustomer(uid, email);

        assert(stripeCustomerUpdate.notCalled);
        assert(stripeHelper.removeCustomerFromCache.notCalled);
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
          (err) => {
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
          (err) => {
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
              (err) => {
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
          (err) => {
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
          (err) => {
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
          (err) => {
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
    const productName = 'FPN Tier 1';
    const productId = 'prod_123';

    beforeEach(() => {
      sandbox
        .stub(stripeHelper, 'expandResource')
        .returns({ id: productId, name: productName });
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
        const failedChargeCopy = deepCopy(failedCharge);
        const subscription = deepCopy(pastDueSubscription);
        const invoice = deepCopy(unpaidInvoice);

        const expected = [
          {
            created: pastDueSubscription.created,
            current_period_end: pastDueSubscription.current_period_end,
            current_period_start: pastDueSubscription.current_period_start,
            cancel_at_period_end: false,
            end_at: null,
            plan_id: pastDueSubscription.plan.id,
            product_id: productId,
            product_name: productName,
            status: 'past_due',
            subscription_id: pastDueSubscription.id,
            failure_code: failedChargeCopy.failure_code,
            failure_message: failedChargeCopy.failure_message,
            latest_invoice: invoice.number,
          },
        ];

        beforeEach(() => {
          sandbox
            .stub(stripeHelper.stripe.charges, 'retrieve')
            .returns(failedChargeCopy);
        });

        describe('when the charge is already expanded', () => {
          it('includes charge failure information with the subscription data', async () => {
            invoice.charge = failedChargeCopy;
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
            invoice.charge = 'ch_123';
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
            sandbox
              .stub(stripeHelper.stripe.invoices, 'retrieve')
              .returns(paidInvoice);
            const expected = [
              {
                created: subscription1.created,
                current_period_end: subscription1.current_period_end,
                current_period_start: subscription1.current_period_start,
                cancel_at_period_end: false,
                end_at: null,
                plan_id: subscription1.plan.id,
                product_id: productId,
                product_name: productName,
                status: 'active',
                subscription_id: subscription1.id,
                failure_code: undefined,
                failure_message: undefined,
                latest_invoice: paidInvoice.number,
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
            sandbox
              .stub(stripeHelper.stripe.invoices, 'retrieve')
              .returns(paidInvoice);
            const expected = [
              {
                created: subscription.created,
                current_period_end: subscription.current_period_end,
                current_period_start: subscription.current_period_start,
                cancel_at_period_end: true,
                end_at: null,
                plan_id: subscription.plan.id,
                product_id: productId,
                product_name: productName,
                status: 'active',
                subscription_id: subscription.id,
                failure_code: undefined,
                failure_message: undefined,
                latest_invoice: paidInvoice.number,
              },
            ];

            const actual = await stripeHelper.subscriptionsToResponse(input);
            assert.deepEqual(actual, expected);
          });
        });

        describe('when the subscription has already ended', () => {
          it('set end_at to the last active day of the subscription', async () => {
            const input = { data: [cancelledSubscription] };
            sandbox
              .stub(stripeHelper.stripe.invoices, 'retrieve')
              .returns(paidInvoice);
            const expected = [
              {
                created: cancelledSubscription.created,
                current_period_end: cancelledSubscription.current_period_end,
                current_period_start:
                  cancelledSubscription.current_period_start,
                cancel_at_period_end: false,
                end_at: cancelledSubscription.ended_at,
                plan_id: cancelledSubscription.plan.id,
                product_id: productId,
                product_name: productName,
                status: 'canceled',
                subscription_id: cancelledSubscription.id,
                failure_code: undefined,
                failure_message: undefined,
                latest_invoice: paidInvoice.number,
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

        sandbox
          .stub(stripeHelper.stripe.invoices, 'retrieve')
          .returns(paidInvoice);

        const input = {
          data: [subscription1, incompleteSubscription, subscription2],
        };

        const response = await stripeHelper.subscriptionsToResponse(input);

        assert.lengthOf(response, 2);
        assert.isDefined(
          response.find((x) => x.subscription_id === subscription1.id),
          'should contain subscription1'
        );
        assert.isDefined(
          response.find((x) => x.subscription_id === subscription2.id),
          'should contain subscription2'
        );
        assert.isUndefined(
          response.find((x) => x.subscription_id === incompleteSubscription.id),
          'should not contain incompleteSubscription'
        );
      });
    });
  });

  describe('formatSubscriptionsForSupport', () => {
    const productName = 'FPN Tier 1';
    const productId = 'prod_123';

    beforeEach(() => {
      sandbox
        .stub(stripeHelper, 'expandResource')
        .returns({ id: productId, name: productName });
    });

    describe('when is one subscription', () => {
      it('when there is a subscription with no metadata', () => {
        it('should include the subscription with null values for plan changed data', async () => {
          const subscription = deepCopy(subscription1);
          subscription.status = 'incomplete';

          const input = {
            data: [subscription],
          };

          const expected = [
            {
              created: subscription.created,
              current_period_end: subscription.current_period_end,
              current_period_start: subscription.current_period_start,
              plan_changed: null,
              previous_product: null,
              product_name: productName,
              subscription_id: subscription.id,
            },
          ];
          const actual = await stripeHelper.formatSubscriptionsForSupport(
            input
          );

          assert.deepEqual(actual, expected);
        });
      });

      it('when there is a subscription with plan changed information in the metadata', () => {
        it('should include the subscription with values for plan changed data', async () => {
          const subscription = deepCopy(subscription1);
          subscription.metadata = {
            previous_plan_id: 'plan_123',
            plan_change_date: '1588962638',
          };

          const input = {
            data: [subscription],
          };

          const expected = [
            {
              created: subscription.created,
              current_period_end: subscription.current_period_end,
              current_period_start: subscription.current_period_start,
              plan_changed: 'plan_123',
              previous_product: 1588962638,
              product_name: productName,
              subscription_id: subscription.id,
            },
          ];
          const actual = await stripeHelper.formatSubscriptionsForSupport(
            input
          );

          assert.deepEqual(actual, expected);
        });
      });
    });

    describe('when there are no subscriptions', () => {
      it('returns an empty array', async () => {
        const expected = [];
        const actual = await stripeHelper.formatSubscriptionsForSupport({
          data: [],
        });

        assert.deepEqual(actual, expected);
      });
    });

    describe('when there are multiple subscriptions', () => {
      it('returns a formatted version of all subscriptions', async () => {
        const input = {
          data: [subscription1, subscription2, cancelledSubscription],
        };

        const response = await stripeHelper.formatSubscriptionsForSupport(
          input
        );

        assert.lengthOf(response, 3);
        assert.isDefined(
          response.find((x) => x.subscription_id === subscription1.id),
          'should contain subscription1'
        );
        assert.isDefined(
          response.find((x) => x.subscription_id === subscription2.id),
          'should contain subscription2'
        );
        assert.isDefined(
          response.find((x) => x.subscription_id === cancelledSubscription.id),
          'should contain subscription2'
        );
      });
    });
  });

  describe('extract details for billing emails', () => {
    const uid = '1234abcd';
    const email = 'test+20200324@example.com';
    const planId = 'plan_00000000000000';
    const planName = 'Example Plan';
    const productId = 'prod_00000000000000';
    const productName = 'Example Product';
    const planEmailIconURL = 'http://example.com/icon';
    const planDownloadURL = 'http://example.com/download';
    const sourceId = eventCustomerSourceExpiring.data.object.id;
    const chargeId = 'ch_1GVm24BVqmGyQTMaUhRAfUmA';
    const privacyNoticeURL =
      'https://www.mozilla.org/privacy/firefox-private-network';
    const termsOfServiceURL =
      'https://www.mozilla.org/about/legal/terms/firefox-private-network';

    const mockPlan = {
      id: planId,
      nickname: planName,
      product: productId,
      metadata: {
        emailIconURL: planEmailIconURL,
        downloadURL: planDownloadURL,
      },
    };

    const mockProduct = {
      id: productId,
      name: productName,
      metadata: {
        'product:termsOfServiceURL': termsOfServiceURL,
        'product:privacyNoticeURL': privacyNoticeURL,
      },
    };

    const mockSource = {
      id: sourceId,
    };

    const mockInvoice = {
      id: 'inv_0000000000',
      number: '1234567',
      charge: chargeId,
      default_source: { id: sourceId },
      total: 1234,
      currency: 'usd',
      period_end: 1587426018,
      lines: {
        data: [
          {
            period: { end: 1590018018 },
          },
        ],
      },
    };

    const mockInvoiceUpcoming = {
      ...mockInvoice,
      id: 'inv_upcoming',
      amount_due: 299000,
    };

    const mockCharge = {
      id: chargeId,
      source: mockSource,
      payment_method_details: {
        card: {
          brand: 'visa',
          last4: '5309',
        },
      },
    };

    let sandbox, mockCustomer, mockStripe, mockAllProducts;
    beforeEach(() => {
      sandbox = sinon.createSandbox();

      mockCustomer = {
        id: 'cus_00000000000000',
        email,
        metadata: {
          userid: uid,
        },
        subscriptions: {
          data: [
            {
              status: 'active',
              latest_invoice: 'inv_0000000000',
              plan: planId,
            },
          ],
        },
      };

      mockAllProducts = [
        {
          product_id: mockProduct.id,
          product_name: mockProduct.name,
          product_metadata: mockProduct.metadata,
        },
        {
          product_id: 'wrongProduct',
          product_name: 'Wrong Product',
          product_metadata: {},
        },
      ];
      sandbox.stub(stripeHelper, 'allProducts').resolves(mockAllProducts);

      mockStripe = Object.entries({
        plans: mockPlan,
        products: mockProduct,
        customers: mockCustomer,
        invoices: mockInvoice,
        charges: mockCharge,
        sources: mockSource,
      }).reduce(
        (acc, [resource, value]) => ({
          ...acc,
          [resource]: { retrieve: sinon.stub().resolves(value) },
        }),
        {}
      );
      mockStripe.invoices.retrieveUpcoming = sinon
        .stub()
        .resolves(mockInvoiceUpcoming);
      stripeHelper.stripe = mockStripe;
    });

    afterEach(() => {
      sandbox.restore();
    });

    describe('extractInvoiceDetailsForEmail', () => {
      const fixture = { ...invoicePaymentSucceededSubscriptionCreate };
      fixture.lines.data[0] = {
        ...fixture.lines.data[0],
        plan: {
          id: planId,
          nickname: planName,
          product: productId,
          metadata: mockPlan.metadata,
        },
      };

      const expected = {
        uid,
        email,
        cardType: 'visa',
        lastFour: '5309',
        invoiceNumber: 'AAF2CECC-0001',
        invoiceTotalCurrency: 'usd',
        invoiceTotalInCents: 500,
        invoiceDate: new Date('2020-03-24T22:23:40.000Z'),
        nextInvoiceDate: new Date('2020-04-24T22:23:40.000Z'),
        productId,
        productName,
        planId,
        planName,
        planEmailIconURL,
        planDownloadURL,
        productMetadata: {
          downloadURL: planDownloadURL,
          emailIconURL: planEmailIconURL,
          'product:privacyNoticeURL': privacyNoticeURL,
          'product:termsOfServiceURL': termsOfServiceURL,
        },
      };

      it('extracts expected details from an invoice that requires requests to expand', async () => {
        const result = await stripeHelper.extractInvoiceDetailsForEmail(
          fixture
        );
        assert.isTrue(stripeHelper.allProducts.called);
        assert.isFalse(mockStripe.products.retrieve.called);
        assert.isTrue(
          mockStripe.customers.retrieve.calledWith(fixture.customer)
        );
        assert.isTrue(mockStripe.charges.retrieve.calledWith(fixture.charge));
        assert.deepEqual(result, expected);
      });

      it('extracts expected details from an invoice when product is missing from cache', async () => {
        mockAllProducts[0].product_id = 'nope';
        const result = await stripeHelper.extractInvoiceDetailsForEmail(
          fixture
        );
        assert.isTrue(stripeHelper.allProducts.called);
        assert.isTrue(mockStripe.products.retrieve.called);
        assert.isTrue(
          mockStripe.customers.retrieve.calledWith(fixture.customer)
        );
        assert.isTrue(mockStripe.charges.retrieve.calledWith(fixture.charge));
        assert.deepEqual(result, expected);
      });

      it('extracts expected details from an expanded invoice', async () => {
        const fixture = deepCopy(invoicePaymentSucceededSubscriptionCreate);
        fixture.lines.data[0].plan = {
          id: planId,
          nickname: planName,
          metadata: mockPlan.metadata,
          product: mockProduct,
        };
        fixture.customer = mockCustomer;
        fixture.charge = mockCharge;
        const result = await stripeHelper.extractInvoiceDetailsForEmail(
          fixture
        );
        assert.isFalse(stripeHelper.allProducts.called);
        assert.isFalse(mockStripe.products.retrieve.called);
        assert.isFalse(mockStripe.customers.retrieve.called);
        assert.isFalse(mockStripe.charges.retrieve.called);
        assert.deepEqual(result, expected);
      });

      it('throws an exception for deleted customer', async () => {
        mockStripe.customers.retrieve = sinon
          .stub()
          .resolves({ ...mockCustomer, deleted: true });

        let thrownError = null;
        try {
          await stripeHelper.extractInvoiceDetailsForEmail(fixture);
        } catch (err) {
          thrownError = err;
        }
        assert.isNotNull(thrownError);
        assert.equal(
          thrownError.errno,
          error.ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER
        );
        assert.isTrue(
          mockStripe.customers.retrieve.calledWith(fixture.customer)
        );
        assert.isFalse(stripeHelper.allProducts.called);
        assert.isFalse(mockStripe.products.retrieve.called);
        assert.isFalse(mockStripe.charges.retrieve.calledWith(fixture.charge));
      });

      it('throws an exception for deleted product', async () => {
        mockAllProducts[0].product_id = 'nope';
        mockStripe.products.retrieve = sinon
          .stub()
          .resolves({ ...mockProduct, deleted: true });

        let thrownError = null;
        try {
          await stripeHelper.extractInvoiceDetailsForEmail(fixture);
        } catch (err) {
          thrownError = err;
        }
        assert.isNotNull(thrownError);
        assert.equal(thrownError.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION_PLAN);
        assert.isTrue(mockStripe.products.retrieve.calledWith(productId));
        assert.isTrue(stripeHelper.allProducts.called);
        assert.isTrue(
          mockStripe.customers.retrieve.calledWith(fixture.customer)
        );
        assert.isTrue(mockStripe.charges.retrieve.calledWith(fixture.charge));
      });

      it('throws an exception with unexpected data', async () => {
        const fixture = {
          ...invoicePaymentSucceededSubscriptionCreate,
          lines: null,
        };
        let thrownError = null;
        try {
          await stripeHelper.extractInvoiceDetailsForEmail(fixture);
        } catch (err) {
          thrownError = err;
        }
        assert.isNotNull(thrownError);
        assert.equal(thrownError.name, 'TypeError');
      });
    });

    describe('extractSourceDetailsForEmail', () => {
      const fixture = { ...eventCustomerSourceExpiring.data.object };

      const expected = {
        uid,
        email,
        productId,
        productName,
        planId,
        planName,
        planEmailIconURL,
        planDownloadURL,
        productMetadata: {
          downloadURL: planDownloadURL,
          emailIconURL: planEmailIconURL,
          'product:privacyNoticeURL': privacyNoticeURL,
          'product:termsOfServiceURL': termsOfServiceURL,
        },
      };

      it('extracts expected details from a source that requires requests to expand', async () => {
        const result = await stripeHelper.extractSourceDetailsForEmail(fixture);
        assert.isTrue(
          mockStripe.customers.retrieve.calledWith(fixture.customer)
        );
        assert.isTrue(
          mockStripe.plans.retrieve.calledWith(
            mockCustomer.subscriptions.data[0].plan
          )
        );
        assert.isTrue(stripeHelper.allProducts.called);
        assert.isFalse(mockStripe.products.retrieve.called);
        assert.deepEqual(result, expected);
      });

      it('throws an exception for deleted customer', async () => {
        mockStripe.customers.retrieve = sinon
          .stub()
          .resolves({ ...mockCustomer, deleted: true });

        let thrownError = null;
        try {
          await stripeHelper.extractSourceDetailsForEmail(fixture);
        } catch (err) {
          thrownError = err;
        }
        assert.isNotNull(thrownError);
        assert.equal(
          thrownError.errno,
          error.ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER
        );
        assert.isTrue(
          mockStripe.customers.retrieve.calledWith(fixture.customer)
        );
        assert.isFalse(mockStripe.plans.retrieve.called);
        assert.isFalse(stripeHelper.allProducts.called);
        assert.isFalse(mockStripe.products.retrieve.called);
      });

      it('throws an exception when unable to find plan or product', async () => {
        mockCustomer.subscriptions.data = [];
        let thrownError = null;
        try {
          await stripeHelper.extractSourceDetailsForEmail(fixture);
        } catch (err) {
          thrownError = err;
        }
        assert.isNotNull(thrownError);
        assert.equal(
          thrownError.errno,
          error.ERRNO.UNKNOWN_SUBSCRIPTION_FOR_SOURCE
        );
      });

      it('throws an exception with unexpected data', async () => {
        const fixture = {
          ...eventCustomerSourceExpiring.data.object,
          object: 'transfer',
        };
        let thrownError = null;
        try {
          await stripeHelper.extractSourceDetailsForEmail(fixture);
        } catch (err) {
          thrownError = err;
        }
        assert.isNotNull(thrownError);
        assert.equal(thrownError.errno, error.ERRNO.INTERNAL_VALIDATION_ERROR);
      });
    });

    const expectedBaseUpdateDetails = {
      uid,
      email,
      planId,
      productId,
      productIdNew: productId,
      productNameNew: productName,
      productIconURLNew:
        eventCustomerSubscriptionUpdated.data.object.plan.metadata.emailIconURL,
      productDownloadURLNew:
        eventCustomerSubscriptionUpdated.data.object.plan.metadata.downloadURL,
      planIdNew: planId,
      paymentAmountNewCurrency:
        eventCustomerSubscriptionUpdated.data.object.plan.currency,
      paymentAmountNewInCents:
        eventCustomerSubscriptionUpdated.data.object.plan.amount,
      productPaymentCycle: 'month',
      closeDate: 1326853478,
      productMetadata: {
        emailIconURL:
          eventCustomerSubscriptionUpdated.data.object.plan.metadata
            .emailIconURL,
        downloadURL:
          eventCustomerSubscriptionUpdated.data.object.plan.metadata
            .downloadURL,
        'product:termsOfServiceURL': termsOfServiceURL,
        'product:privacyNoticeURL': privacyNoticeURL,
        productOrder: 0,
      },
    };

    describe('extractSubscriptionUpdateEventDetailsForEmail', () => {
      const mockReactivationDetails = 'mockReactivationDetails';
      const mockCancellationDetails = 'mockCancellationDetails';
      const mockUpgradeDowngradeDetails = 'mockUpgradeDowngradeDetails';

      beforeEach(() => {
        sandbox
          .stub(
            stripeHelper,
            'extractSubscriptionUpdateCancellationDetailsForEmail'
          )
          .returns(mockCancellationDetails);
        sandbox
          .stub(
            stripeHelper,
            'extractSubscriptionUpdateReactivationDetailsForEmail'
          )
          .returns(mockReactivationDetails);
        sandbox
          .stub(
            stripeHelper,
            'extractSubscriptionUpdateUpgradeDowngradeDetailsForEmail'
          )
          .returns(mockUpgradeDowngradeDetails);
      });

      function assertOnlyExpectedHelperCalledWith(expectedHelperName, ...args) {
        const allHelperNames = [
          'extractSubscriptionUpdateReactivationDetailsForEmail',
          'extractSubscriptionUpdateUpgradeDowngradeDetailsForEmail',
          'extractSubscriptionUpdateCancellationDetailsForEmail',
        ];
        for (const helperName of allHelperNames) {
          if (helperName !== expectedHelperName) {
            assert.isTrue(stripeHelper[helperName].notCalled);
          } else {
            assert.isTrue(stripeHelper[helperName].called);
            assert.deepEqual(stripeHelper[helperName].args[0], args);
          }
        }
      }

      it('calls the expected helper method for cancellation', async () => {
        const event = deepCopy(eventCustomerSubscriptionUpdated);
        event.data.object.cancel_at_period_end = true;
        event.data.previous_attributes = { cancel_at_period_end: false };
        const result = await stripeHelper.extractSubscriptionUpdateEventDetailsForEmail(
          event
        );
        assert.equal(result, mockCancellationDetails);
        assertOnlyExpectedHelperCalledWith(
          'extractSubscriptionUpdateCancellationDetailsForEmail',
          event.data.object,
          expectedBaseUpdateDetails,
          mockInvoice
        );
      });

      it('calls the expected helper method for reactivation', async () => {
        const event = deepCopy(eventCustomerSubscriptionUpdated);
        event.data.object.cancel_at_period_end = false;
        event.data.previous_attributes = { cancel_at_period_end: true };
        const result = await stripeHelper.extractSubscriptionUpdateEventDetailsForEmail(
          event
        );
        assert.equal(result, mockReactivationDetails);
        assertOnlyExpectedHelperCalledWith(
          'extractSubscriptionUpdateReactivationDetailsForEmail',
          event.data.object,
          expectedBaseUpdateDetails,
          mockInvoice
        );
      });

      it('calls the expected helper method for upgrade or downgrade', async () => {
        const event = deepCopy(eventCustomerSubscriptionUpdated);
        event.data.object.cancel_at_period_end = false;
        event.data.previous_attributes.cancel_at_period_end = false;
        const result = await stripeHelper.extractSubscriptionUpdateEventDetailsForEmail(
          event
        );
        assert.equal(result, mockUpgradeDowngradeDetails);
        assertOnlyExpectedHelperCalledWith(
          'extractSubscriptionUpdateUpgradeDowngradeDetailsForEmail',
          event.data.object,
          expectedBaseUpdateDetails,
          mockInvoice,
          mockCustomer,
          event.data.object.plan.metadata.productOrder,
          event.data.previous_attributes.plan
        );
      });
    });

    const productNameOld = '123 Done Pro Plus Monthly';
    const productIconURLOld = 'http://example.com/icon-old';
    const productDownloadURLOld = 'http://example.com/download-old';
    const productNameNew = '123 Done Pro Monthly';
    const productIconURLNew = 'http://example.com/icon-new';
    const productDownloadURLNew = 'http://example.com/download-new';

    describe('extractSubscriptionUpdateUpgradeDowngradeDetailsForEmail', () => {
      const commonTest = (isUpgrade) => async () => {
        const event = deepCopy(eventCustomerSubscriptionUpdated);
        const productIdOld = event.data.previous_attributes.plan.product;
        const productIdNew = event.data.object.plan.product;

        const baseDetails = {
          ...expectedBaseUpdateDetails,
          productIdNew,
          productNameNew,
          productIconURLNew,
          productDownloadURLNew,
          productMetadata: {
            ...expectedBaseUpdateDetails.productMetadata,
            emailIconURL: productIconURLNew,
            downloadURL: productDownloadURLNew,
          },
        };

        mockAllProducts.push(
          {
            product_id: productIdOld,
            product_name: productNameOld,
            product_metadata: {
              ...mockProduct.metadata,
              emailIconUrl: productIconURLOld,
              downloadURL: productDownloadURLOld,
            },
          },
          {
            product_id: productIdNew,
            product_name: productNameNew,
            product_metadata: {
              ...mockProduct.metadata,
              emailIconUrl: productIconURLNew,
              downloadURL: productDownloadURLNew,
            },
          }
        );

        event.data.object.plan.metadata.productOrder = isUpgrade ? 2 : 1;
        event.data.previous_attributes.plan.metadata.productOrder = isUpgrade
          ? 1
          : 2;

        const result = await stripeHelper.extractSubscriptionUpdateUpgradeDowngradeDetailsForEmail(
          event.data.object,
          baseDetails,
          mockInvoice,
          mockCustomer,
          event.data.object.plan.metadata.productOrder,
          event.data.previous_attributes.plan
        );

        // issue #5546: ensure we're looking for the upcoming invoice for this specific subscription
        assert.deepEqual(mockStripe.invoices.retrieveUpcoming.args, [
          [
            {
              subscription: event.data.object.id,
            },
          ],
        ]);

        assert.deepEqual(result, {
          ...baseDetails,
          productIdNew,
          updateType:
            StripeHelper.SUBSCRIPTION_UPDATE_TYPES[
              isUpgrade ? 'UPGRADE' : 'DOWNGRADE'
            ],
          productIdOld,
          productNameOld,
          productIconURLOld,
          productDownloadURLOld,
          paymentAmountOldCurrency:
            event.data.previous_attributes.plan.currency,
          paymentAmountOldInCents: event.data.previous_attributes.plan.amount,
          paymentProratedCurrency: mockInvoiceUpcoming.currency,
          paymentProratedInCents: mockInvoiceUpcoming.amount_due,
          invoiceNumber: mockInvoice.number,
          invoiceId: mockInvoice.id,
        });
      };

      it(
        'extracts expected details for a subscription upgrade',
        commonTest(true)
      );
      it(
        'extracts expected details for a subscription downgrade',
        commonTest(false)
      );
    });

    describe('extractSubscriptionUpdateReactivationDetailsForEmail', () => {
      it('extracts expected details for a subscription reactivation', async () => {
        const event = deepCopy(eventCustomerSubscriptionUpdated);
        const result = await stripeHelper.extractSubscriptionUpdateReactivationDetailsForEmail(
          event.data.object,
          expectedBaseUpdateDetails,
          mockInvoice
        );
        const { card } = mockCharge.payment_method_details;
        assert.deepEqual(result, {
          updateType: StripeHelper.SUBSCRIPTION_UPDATE_TYPES.REACTIVATION,
          email,
          uid,
          productId,
          planId,
          planEmailIconURL: productIconURLNew,
          productName,
          invoiceTotalInCents: mockInvoice.total,
          invoiceTotalCurrency: mockInvoice.currency,
          cardType: card.brand,
          lastFour: card.last4,
          nextInvoiceDate: new Date(
            mockInvoice.lines.data[0].period.end * 1000
          ),
        });
      });
    });

    describe('extractSubscriptionUpdateCancellationDetailsForEmail', () => {
      it('extracts expected details for a subscription cancellation', async () => {
        const event = deepCopy(eventCustomerSubscriptionUpdated);
        const result = await stripeHelper.extractSubscriptionUpdateCancellationDetailsForEmail(
          event.data.object,
          expectedBaseUpdateDetails,
          mockInvoice
        );
        const subscription = event.data.object;
        assert.deepEqual(result, {
          updateType: StripeHelper.SUBSCRIPTION_UPDATE_TYPES.CANCELLATION,
          email,
          uid,
          productId,
          planId,
          planEmailIconURL: productIconURLNew,
          productName,
          invoiceDate: new Date(mockInvoice.created * 1000),
          invoiceTotalInCents: mockInvoice.total,
          invoiceTotalCurrency: mockInvoice.currency,
          serviceLastActiveDate: new Date(
            subscription.current_period_end * 1000
          ),
        });
      });
    });
  });
});
