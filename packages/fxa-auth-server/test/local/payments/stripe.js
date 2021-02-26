/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const Sentry = require('@sentry/node');
const { assert } = require('chai');
const Chance = require('chance');
const { setupAuthDatabase } = require('fxa-shared/db');
const Knex = require('knex');
const { mockLog } = require('../../mocks');
const error = require('../../../lib/error');
const stripeError = require('stripe').Stripe.errors;
const uuidv4 = require('uuid').v4;
const moment = require('moment');
const { Container } = require('typedi');

const chance = new Chance();
let mockRedis;
const proxyquire = require('proxyquire').noPreserveCache();
const StripeHelper = proxyquire('../../../lib/payments/stripe', {
  '../redis': (config, log) => mockRedis.init(config, log),
});
const { CurrencyHelper } = require('../../../lib/payments/currencies');

const customer1 = require('./fixtures/stripe/customer1.json');
const newCustomer = require('./fixtures/stripe/customer_new.json');
const newCustomerPM = require('./fixtures/stripe/customer_new_pmi.json');
const deletedCustomer = require('./fixtures/stripe/customer_deleted.json');
const plan1 = require('./fixtures/stripe/plan1.json');
const plan2 = require('./fixtures/stripe/plan2.json');
const plan3 = require('./fixtures/stripe/plan3.json');
const product1 = require('./fixtures/stripe/product1.json');
const product2 = require('./fixtures/stripe/product2.json');
const product3 = require('./fixtures/stripe/product3.json');
const subscription1 = require('./fixtures/stripe/subscription1.json');
const subscription2 = require('./fixtures/stripe/subscription2.json');
const multiPlanSubscription = require('./fixtures/stripe/subscription_multiplan.json');
const subscriptionPMIExpanded = require('./fixtures/stripe/subscription_pmi_expanded.json');
const cancelledSubscription = require('./fixtures/stripe/subscription_cancelled.json');
const pastDueSubscription = require('./fixtures/stripe/subscription_past_due.json');
const paidInvoice = require('./fixtures/stripe/invoice_paid.json');
const unpaidInvoice = require('./fixtures/stripe/invoice_open.json');
const invoiceRetry = require('./fixtures/stripe/invoice_retry.json');
const successfulPaymentIntent = require('./fixtures/stripe/paymentIntent_succeeded.json');
const unsuccessfulPaymentIntent = require('./fixtures/stripe/paymentIntent_requires_payment_method.json');
const paymentMethodAttach = require('./fixtures/stripe/payment_method_attach.json');
const failedCharge = require('./fixtures/stripe/charge_failed.json');
const invoicePaymentSucceededSubscriptionCreate = require('./fixtures/stripe/invoice_payment_succeeded_subscription_create.json');
const eventCustomerSourceExpiring = require('./fixtures/stripe/event_customer_source_expiring.json');
const eventCustomerSubscriptionUpdated = require('./fixtures/stripe/event_customer_subscription_updated.json');
const subscriptionCreatedInvoice = require('./fixtures/stripe/invoice_payment_succeeded_subscription_create.json');
const closedPaymementIntent = require('./fixtures/stripe/paymentIntent_succeeded.json');
const newSetupIntent = require('./fixtures/stripe/setup_intent_new.json');
const {
  createAccountCustomer,
  getAccountCustomerByUid,
} = require('fxa-shared/db/models/auth');

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
    customerCacheTtlSeconds: 90,
    plansCacheTtlSeconds: 60,
  },
  currenciesToCountries: { ZAR: ['AS', 'CA'] },
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
      this.redis = this;
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

const testKnexConfig = {
  client: 'mysql',
  connection: {
    charset: 'UTF8MB4_BIN',
    host: 'localhost',
    password: '',
    port: 3306,
    user: 'root',
  },
};

mockConfig.database = {
  mysql: {
    auth: {
      database: 'testStripeHelper',
      host: 'localhost',
      password: '',
      port: 3306,
      user: 'root',
    },
  },
};

async function createTestDatabase() {
  const knex = Knex(testKnexConfig);

  await knex.raw('DROP DATABASE IF EXISTS testStripeHelper');
  await knex.raw('CREATE DATABASE testStripeHelper');
  await knex.raw(
    'CREATE TABLE testStripeHelper.`accountCustomers` (`uid` BINARY(16) PRIMARY KEY,`stripeCustomerId` VARCHAR(32),`createdAt` BIGINT UNSIGNED NOT NULL,`updatedAt` BIGINT UNSIGNED NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;'
  );
  await knex.destroy();
  setupAuthDatabase(mockConfig.database.mysql.auth);
}

async function destroyTestDatabase() {
  const knex = Knex(testKnexConfig);
  await knex.raw('DROP DATABASE IF EXISTS testStripeHelper');
  await knex.destroy();
}

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
  /** @type AccountCustomers */
  let existingCustomer;
  const existingUid = '40cc397def2d487b9b8ba0369079a267';

  before(async () => {
    await createTestDatabase();
    existingCustomer = await createAccountCustomer(existingUid, customer1.id);
  });

  after(async () => {
    await destroyTestDatabase();
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    mockRedis = createMockRedis();
    log = mockLog();
    // Make currencyHelper
    const currencyHelper = new CurrencyHelper(mockConfig);
    Container.set(CurrencyHelper, currencyHelper);
    stripeHelper = new StripeHelper(log, mockConfig);
    stripeHelper.redis = mockRedis;
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

  describe('constructur', () => {
    it('sets currencyHelper', () => {
      const expectedCurrencyHelper = new CurrencyHelper(mockConfig);
      assert.deepEqual(stripeHelper.currencyHelper, expectedCurrencyHelper);
    });
  });

  describe('createPlainCustomer', () => {
    it('creates a customer using stripe api', async () => {
      const expected = deepCopy(newCustomerPM);
      sandbox.stub(stripeHelper.stripe.customers, 'create').resolves(expected);
      const uid = chance.guid({ version: 4 }).replace(/-/g, '');
      const actual = await stripeHelper.createPlainCustomer(
        uid,
        'joe@example.com',
        'Joe Cool',
        uuidv4()
      );

      assert.deepEqual(actual, expected);
    });

    it('surfaces stripe errors', async () => {
      const apiError = new stripeError.StripeAPIError();
      sandbox.stub(stripeHelper.stripe.customers, 'create').rejects(apiError);

      return stripeHelper
        .createPlainCustomer('uid', 'joe@example.com', 'Joe Cool', uuidv4())
        .then(
          () => Promise.reject(new Error('Method expected to reject')),
          (err) => {
            assert.equal(err, apiError);
          }
        );
    });
  });

  describe('createLocalCustomer', () => {
    it('inserts a local customer record', async () => {
      const uid = '993499bcb0cf4da2bf1b37f1a37f3b88';

      // customer doesn't exist
      const existingCustomer = await getAccountCustomerByUid(uid);
      assert.isUndefined(existingCustomer);

      await stripeHelper.createLocalCustomer(uid, newCustomer);

      // customer does exist
      const insertedCustomer = await getAccountCustomerByUid(uid);
      assert.isObject(insertedCustomer);

      // inserting again
      await stripeHelper.createLocalCustomer(uid, {
        ...newCustomer,
        id: 'cus_nope',
      });
      const sameCustomer = await getAccountCustomerByUid(uid);
      assert.notEqual(sameCustomer.stripeCustomerId, 'cus_nope');
    });
  });

  describe('createSetupIntent', () => {
    it('creates a setup intent', async () => {
      const expected = deepCopy(newSetupIntent);
      sandbox
        .stub(stripeHelper.stripe.setupIntents, 'create')
        .resolves(expected);

      const actual = await stripeHelper.createSetupIntent('cust_new');

      assert.deepEqual(actual, expected);
      assert.hasAnyKeys(actual, 'client_secret');
    });

    it('surfaces stripe errors', async () => {
      const apiError = new stripeError.StripeAPIError();
      sandbox
        .stub(stripeHelper.stripe.setupIntents, 'create')
        .rejects(apiError);

      return stripeHelper.createSetupIntent('cust_new').then(
        () => Promise.reject(new Error('Method expected to reject')),
        (err) => {
          assert.equal(err, apiError);
        }
      );
    });
  });

  describe('updateDefaultPaymentMethod', () => {
    it('updates the default payment method', async () => {
      const expected = deepCopy(newCustomerPM);
      sandbox.stub(stripeHelper.stripe.customers, 'update').resolves(expected);

      const actual = await stripeHelper.updateDefaultPaymentMethod(
        'cust_new',
        'pm_1H0FRp2eZvKYlo2CeIZoc0wj'
      );

      assert.deepEqual(actual, expected);
    });

    it('surfaces stripe errors', async () => {
      const apiError = new stripeError.StripeAPIError();
      sandbox.stub(stripeHelper.stripe.customers, 'update').rejects(apiError);

      return stripeHelper
        .updateDefaultPaymentMethod('cust_new', 'pm_1H0FRp2eZvKYlo2CeIZoc0wj')
        .then(
          () => Promise.reject(new Error('Method expected to reject')),
          (err) => {
            assert.equal(err, apiError);
          }
        );
    });
  });

  describe('getPaymentMethod', () => {
    it('calls the Strip api', async () => {
      const paymentMethodId = 'pm_9001';
      sandbox.stub(stripeHelper.stripe.paymentMethods, 'retrieve');
      await stripeHelper.getPaymentMethod(paymentMethodId);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.paymentMethods.retrieve,
        paymentMethodId
      );
    });
  });

  describe('detachPaymentMethod', () => {
    it('calls the Stripe api', async () => {
      const paymentMethodId = 'pm_9001';
      const expected = { id: paymentMethodId };
      sandbox
        .stub(stripeHelper.stripe.paymentMethods, 'detach')
        .resolves(expected);
      const actual = await stripeHelper.detachPaymentMethod(paymentMethodId);
      assert.deepEqual(actual, expected);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.paymentMethods.detach,
        paymentMethodId
      );
    });
  });

  describe('removeSources', () => {
    it('removes all the sources', async () => {
      const ids = {
        data: [{ id: uuidv4() }, { id: uuidv4() }, { id: uuidv4() }],
      };
      sandbox.stub(stripeHelper.stripe.customers, 'listSources').resolves(ids);
      sandbox.stub(stripeHelper.stripe.customers, 'deleteSource').resolves({});
      const result = await stripeHelper.removeSources('cust_new');
      assert.deepEqual(result, [{}, {}, {}]);
      sinon.assert.calledThrice(stripeHelper.stripe.customers.deleteSource);
      for (const obj of ids.data) {
        sinon.assert.calledWith(
          stripeHelper.stripe.customers.deleteSource,
          'cust_new',
          obj.id
        );
      }
    });

    it('returns if no sources', async () => {
      sandbox
        .stub(stripeHelper.stripe.customers, 'listSources')
        .resolves({ data: [] });
      sandbox.stub(stripeHelper.stripe.customers, 'deleteSource').resolves({});
      const result = await stripeHelper.removeSources('cust_new');
      assert.deepEqual(result, []);
      sinon.assert.notCalled(stripeHelper.stripe.customers.deleteSource);
    });

    it('surfaces stripe errors', async () => {
      const apiError = new stripeError.StripeAPIError();
      sandbox
        .stub(stripeHelper.stripe.customers, 'listSources')
        .rejects(apiError);
      return stripeHelper.removeSources('cust_new').then(
        () => Promise.reject(new Error('Method expected to reject')),
        (err) => {
          assert.equal(err, apiError);
        }
      );
    });
  });

  describe('retryInvoiceWithPaymentId', () => {
    it('retries with an invoice successfully', async () => {
      const attachExpected = deepCopy(paymentMethodAttach);
      const customerExpected = deepCopy(newCustomerPM);
      const invoiceRetryExpected = deepCopy(invoiceRetry);
      sandbox
        .stub(stripeHelper.stripe.paymentMethods, 'attach')
        .resolves(attachExpected);
      sandbox
        .stub(stripeHelper.stripe.customers, 'update')
        .resolves(customerExpected);
      sandbox
        .stub(stripeHelper.stripe.invoices, 'pay')
        .resolves(invoiceRetryExpected);
      sandbox
        .stub(stripeHelper.stripe.invoices, 'retrieve')
        .resolves(invoiceRetryExpected);
      const actual = await stripeHelper.retryInvoiceWithPaymentId(
        'customerId',
        'invoiceId',
        'pm_1H0FRp2eZvKYlo2CeIZoc0wj',
        uuidv4()
      );

      assert.deepEqual(actual, invoiceRetryExpected);
    });

    it('surfaces payment issues', async () => {
      const apiError = new stripeError.StripeCardError();
      sandbox
        .stub(stripeHelper.stripe.paymentMethods, 'attach')
        .rejects(apiError);

      return stripeHelper
        .retryInvoiceWithPaymentId(
          'customerId',
          'invoiceId',
          'pm_1H0FRp2eZvKYlo2CeIZoc0wj',
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
      sandbox
        .stub(stripeHelper.stripe.paymentMethods, 'attach')
        .rejects(apiError);

      return stripeHelper
        .retryInvoiceWithPaymentId(
          'customerId',
          'invoiceId',
          'pm_1H0FRp2eZvKYlo2CeIZoc0wj',
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

  describe('createSubscriptionWithPMI', () => {
    it('creates a subscription successfully', async () => {
      const attachExpected = deepCopy(paymentMethodAttach);
      const customerExpected = deepCopy(newCustomerPM);
      sandbox
        .stub(stripeHelper.stripe.paymentMethods, 'attach')
        .resolves(attachExpected);
      sandbox
        .stub(stripeHelper.stripe.customers, 'update')
        .resolves(customerExpected);
      sandbox
        .stub(stripeHelper.stripe.subscriptions, 'create')
        .resolves(subscriptionPMIExpanded);
      const actual = await stripeHelper.createSubscriptionWithPMI(
        'customerId',
        'priceId',
        'pm_1H0FRp2eZvKYlo2CeIZoc0wj',
        uuidv4()
      );

      assert.deepEqual(actual, subscriptionPMIExpanded);
    });

    it('surfaces payment issues', async () => {
      const apiError = new stripeError.StripeCardError();
      sandbox
        .stub(stripeHelper.stripe.paymentMethods, 'attach')
        .rejects(apiError);

      return stripeHelper
        .createSubscriptionWithPMI({
          customerId: 'customerId',
          priceId: 'priceId',
          paymentMethodId: 'pm_1H0FRp2eZvKYlo2CeIZoc0wj',
          subIdempotencyKey: uuidv4(),
        })
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
      sandbox
        .stub(stripeHelper.stripe.paymentMethods, 'attach')
        .rejects(apiError);

      return stripeHelper
        .createSubscriptionWithPMI({
          customerId: 'customerId',
          priceId: 'invoiceId',
          paymentMethodId: 'pm_1H0FRp2eZvKYlo2CeIZoc0wj',
          subIdempotencyKey: uuidv4(),
        })
        .then(
          () => Promise.reject(new Error('Method expected to reject')),
          (err) => {
            assert.equal(err, apiError);
          }
        );
    });
  });

  describe('createSubscriptionWithPaypal', () => {
    it('creates a subscription successfully', async () => {
      sandbox
        .stub(stripeHelper, 'findCustomerSubscriptionByPlanId')
        .returns(undefined);
      sandbox
        .stub(stripeHelper.stripe.subscriptions, 'create')
        .resolves(subscriptionPMIExpanded);
      const actual = await stripeHelper.createSubscriptionWithPaypal({
        customer: customer1,
        priceId: 'priceId',
        subIdempotencyKey: uuidv4(),
      });

      assert.deepEqual(actual, subscriptionPMIExpanded);
    });

    it('returns a usable sub if one is active/past_due', async () => {
      const collectionSubscription = deepCopy(subscription1);
      collectionSubscription.collection_method = 'send_invoice';
      sandbox
        .stub(stripeHelper, 'findCustomerSubscriptionByPlanId')
        .returns(collectionSubscription);
      sandbox.stub(stripeHelper, 'expandResource').returns({});
      const actual = await stripeHelper.createSubscriptionWithPaypal({
        customer: customer1,
        priceId: 'priceId',
        subIdempotencyKey: uuidv4(),
      });

      assert.deepEqual(actual, collectionSubscription);
    });

    it('throws an error for an existing charge subscription', async () => {
      sandbox
        .stub(stripeHelper, 'findCustomerSubscriptionByPlanId')
        .returns(subscription1);
      sandbox.stub(stripeHelper, 'expandResource').returns({});
      try {
        await stripeHelper.createSubscriptionWithPaypal({
          customer: customer1,
          priceId: 'priceId',
          subIdempotencyKey: uuidv4(),
        });
        assert.fail('Error should throw with active charge subscription');
      } catch (err) {
        assert.deepEqual(err, error.subscriptionAlreadyExists());
      }
    });

    it('deletes an incomplete subscription when creating', async () => {
      const collectionSubscription = deepCopy(subscription1);
      collectionSubscription.status = 'incomplete';
      sandbox
        .stub(stripeHelper, 'findCustomerSubscriptionByPlanId')
        .returns(collectionSubscription);
      sandbox.stub(stripeHelper.stripe.subscriptions, 'del').resolves({});
      sandbox
        .stub(stripeHelper.stripe.subscriptions, 'create')
        .resolves(subscription1);
      const actual = await stripeHelper.createSubscriptionWithPaypal({
        customer: customer1,
        priceId: 'priceId',
        subIdempotencyKey: uuidv4(),
      });

      assert.deepEqual(actual, subscription1);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.subscriptions.del,
        collectionSubscription.id
      );
    });
  });

  describe('invoicePayableWithPaypal', () => {
    it('returns true if its payable via paypal', async () => {
      const mockInvoice = {
        billing_reason: 'subscription_cycle',
        subscription: 'sub-1234',
      };
      const mockSub = {
        collection_method: 'send_invoice',
      };
      sandbox.stub(stripeHelper, 'expandResource').resolves(mockSub);
      const actual = await stripeHelper.invoicePayableWithPaypal(mockInvoice);
      assert.isTrue(actual);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.expandResource,
        'sub-1234',
        'subscriptions'
      );
    });

    it('returns false if invoice is sub create', async () => {
      const mockInvoice = {
        billing_reason: 'subscription_create',
      };
      const mockSub = {
        collection_method: 'send_invoice',
      };
      sandbox.stub(stripeHelper, 'expandResource').resolves(mockSub);
      const actual = await stripeHelper.invoicePayableWithPaypal(mockInvoice);
      assert.isFalse(actual);
      sinon.assert.notCalled(stripeHelper.expandResource);
    });

    it('returns false if subscription collection_method isnt invoice', async () => {
      const mockInvoice = {
        billing_reason: 'subscription_cycle',
        subscription: 'sub-1234',
      };
      const mockSub = {
        collection_method: 'charge_automatically',
      };
      sandbox.stub(stripeHelper, 'expandResource').resolves(mockSub);
      const actual = await stripeHelper.invoicePayableWithPaypal(mockInvoice);
      assert.isFalse(actual);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.expandResource,
        'sub-1234',
        'subscriptions'
      );
    });
  });

  describe('getInvoice', () => {
    it('works successfully', async () => {
      sandbox
        .stub(stripeHelper.stripe.invoices, 'retrieve')
        .resolves(unpaidInvoice);
      const actual = await stripeHelper.getInvoice(unpaidInvoice.id);
      assert.deepEqual(actual, unpaidInvoice);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.invoices.retrieve,
        unpaidInvoice.id
      );
    });
  });

  describe('finalizeInvoice', () => {
    it('works successfully', async () => {
      sandbox
        .stub(stripeHelper.stripe.invoices, 'finalizeInvoice')
        .resolves({});
      const actual = await stripeHelper.finalizeInvoice(unpaidInvoice);
      assert.deepEqual(actual, {});
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.invoices.finalizeInvoice,
        unpaidInvoice.id,
        {
          auto_advance: false,
        }
      );
    });
  });

  describe('updateInvoiceWithPaypalTransactionId', () => {
    it('works successfully', async () => {
      sandbox.stub(stripeHelper.stripe.invoices, 'update').resolves({});
      const actual = await stripeHelper.updateInvoiceWithPaypalTransactionId(
        unpaidInvoice,
        'tid'
      );
      assert.deepEqual(actual, {});
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.invoices.update,
        unpaidInvoice.id,
        {
          metadata: { paypalTransactionId: 'tid' },
        }
      );
    });
  });

  describe('getPaymentAttempts', () => {
    it('returns 0 with no attempts', () => {
      const actual = stripeHelper.getPaymentAttempts(unpaidInvoice);
      assert.equal(actual, 0);
    });

    it('returns 1 when the attempt is 1', () => {
      const attemptedInvoice = deepCopy(unpaidInvoice);
      attemptedInvoice.metadata['paymentAttempts'] = '1';
      const actual = stripeHelper.getPaymentAttempts(attemptedInvoice);
      assert.equal(actual, 1);
    });
  });

  describe('updatePaymentAttempts', () => {
    it('returns 1 updating from 0', async () => {
      const attemptedInvoice = deepCopy(unpaidInvoice);
      const actual = stripeHelper.getPaymentAttempts(attemptedInvoice);
      assert.equal(actual, 0);
      sandbox.stub(stripeHelper.stripe.invoices, 'update').resolves({});
      await stripeHelper.updatePaymentAttempts(attemptedInvoice);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.invoices.update,
        attemptedInvoice.id,
        {
          metadata: { paymentAttempts: '1' },
        }
      );
    });

    it('returns 2 updating from 1', async () => {
      const attemptedInvoice = deepCopy(unpaidInvoice);
      attemptedInvoice.metadata.paymentAttempts = '1';
      const actual = stripeHelper.getPaymentAttempts(attemptedInvoice);
      assert.equal(actual, 1);
      sandbox.stub(stripeHelper.stripe.invoices, 'update').resolves({});
      await stripeHelper.updatePaymentAttempts(attemptedInvoice);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.invoices.update,
        attemptedInvoice.id,
        {
          metadata: { paymentAttempts: '2' },
        }
      );
    });

    it('returns 3 updating from 1', async () => {
      const attemptedInvoice = deepCopy(unpaidInvoice);
      attemptedInvoice.metadata.paymentAttempts = '1';
      const actual = stripeHelper.getPaymentAttempts(attemptedInvoice);
      assert.equal(actual, 1);
      sandbox.stub(stripeHelper.stripe.invoices, 'update').resolves({});
      await stripeHelper.updatePaymentAttempts(attemptedInvoice, 3);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.invoices.update,
        attemptedInvoice.id,
        {
          metadata: { paymentAttempts: '3' },
        }
      );
    });
  });

  describe('payInvoiceOutOfBand', () => {
    it('pays the invoice', async () => {
      sandbox.stub(stripeHelper.stripe.invoices, 'pay').resolves({});
      await stripeHelper.payInvoiceOutOfBand(unpaidInvoice);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.invoices.pay,
        unpaidInvoice.id,
        { paid_out_of_band: true }
      );
    });
  });

  describe('updateCustomerPaypalAgreement', () => {
    it('skips if the agreement id is already set', async () => {
      const paypalCustomer = deepCopy(customer1);
      paypalCustomer.metadata.paypalAgreementId = 'test-1234';
      sandbox.stub(stripeHelper.stripe.customers, 'update').resolves({});
      await stripeHelper.updateCustomerPaypalAgreement(
        paypalCustomer,
        'test-1234'
      );
      sinon.assert.callCount(stripeHelper.stripe.customers.update, 0);
    });

    it('updates for a billing agreement id', async () => {
      const paypalCustomer = deepCopy(customer1);
      sandbox.stub(stripeHelper.stripe.customers, 'update').resolves({});
      await stripeHelper.updateCustomerPaypalAgreement(
        paypalCustomer,
        'test-1234'
      );
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.customers.update,
        paypalCustomer.id,
        { metadata: { paypalAgreementId: 'test-1234' } }
      );
    });
  });

  describe('removeCustomerPaypalAgreement', () => {
    it('removes billing agreement id', async () => {
      const paypalCustomer = deepCopy(customer1);
      sandbox.stub(stripeHelper.stripe.customers, 'update').resolves({});
      const now = new Date();
      const clock = sinon.useFakeTimers(now.getTime());

      const authDbModule = require('fxa-shared/db/models/auth');
      sandbox.stub(authDbModule, 'updatePayPalBA').returns(0);

      await stripeHelper.removeCustomerPaypalAgreement(
        'uid',
        paypalCustomer,
        'billingAgreementId'
      );

      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.customers.update,
        paypalCustomer.id,
        { metadata: { paypalAgreementId: null } }
      );
      sinon.assert.calledOnceWithExactly(
        authDbModule.updatePayPalBA,
        'uid',
        'billingAgreementId',
        'Cancelled',
        clock.now
      );
      clock.restore();
    });
  });

  describe('getCustomerPaypalAgreement', () => {
    it('returns undefined with no paypal agreement', () => {
      const actual = stripeHelper.getCustomerPaypalAgreement(customer1);
      assert.isUndefined(actual);
    });

    it('returns an agreement when set', () => {
      const paypalCustomer = deepCopy(customer1);
      paypalCustomer.metadata.paypalAgreementId = 'test-1234';
      const actual = stripeHelper.getCustomerPaypalAgreement(paypalCustomer);
      assert.equal(actual, 'test-1234');
    });
  });

  describe('fetchOpenInvoices', () => {
    it('returns customer paypal agreement id', async () => {
      sandbox.stub(stripeHelper.stripe.invoices, 'list').resolves({});
      const actual = await stripeHelper.fetchOpenInvoices(0);
      assert.deepEqual(actual, {});
      sinon.assert.calledOnceWithExactly(stripeHelper.stripe.invoices.list, {
        customer: undefined,
        limit: 100,
        collection_method: 'send_invoice',
        status: 'open',
        created: 0,
        expand: ['data.customer'],
      });
    });
  });

  describe('markUncollectible', () => {
    it('returns an invoice marked uncollectible', async () => {
      sandbox
        .stub(stripeHelper.stripe.invoices, 'markUncollectible')
        .resolves({});
      sandbox.stub(stripeHelper.stripe.invoices, 'list').resolves({});
      const actual = await stripeHelper.markUncollectible(unpaidInvoice);
      assert.deepEqual(actual, {});
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.invoices.markUncollectible,
        unpaidInvoice.id
      );
    });
  });

  describe('cancelSubscription', () => {
    it('sets subscription to cancelled', async () => {
      sandbox.stub(stripeHelper.stripe.subscriptions, 'del').resolves({});
      await stripeHelper.cancelSubscription('subscriptionId');
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.subscriptions.del,
        'subscriptionId'
      );
    });
  });

  describe('findCustomerSubscriptionByPlanId', () => {
    describe('Customer has Single One-Plan Subscription', () => {
      const customer = deepCopy(customer1);
      customer.subscriptions.data = [subscription2];
      it('returns the Subscription when the plan id is found', () => {
        const expected = customer.subscriptions.data[0];
        const actual = stripeHelper.findCustomerSubscriptionByPlanId(
          customer,
          customer.subscriptions.data[0].items.data[0].plan.id
        );

        assert.deepEqual(actual, expected);
      });

      it('returns `undefined` when the plan id is not found', () => {
        assert.isUndefined(
          stripeHelper.findCustomerSubscriptionByPlanId(customer, 'plan_test2')
        );
      });
    });

    describe('Customer has Single Multi-Plan Subscription', () => {
      const customer = deepCopy(customer1);
      customer.subscriptions.data = [multiPlanSubscription];

      it('returns the Subscription when the plan id is found - first in array', () => {
        const expected = customer.subscriptions.data[0];
        const actual = stripeHelper.findCustomerSubscriptionByPlanId(
          customer,
          'plan_1'
        );

        assert.deepEqual(actual, expected);
      });

      it('returns the Subscription when the plan id is found - not first in array', () => {
        const expected = customer.subscriptions.data[0];
        const actual = stripeHelper.findCustomerSubscriptionByPlanId(
          customer,
          'plan_2'
        );

        assert.deepEqual(actual, expected);
      });

      it('returns `undefined` when the plan id is not found', () => {
        assert.isUndefined(
          stripeHelper.findCustomerSubscriptionByPlanId(customer, 'plan_3')
        );
      });
    });

    describe('Customer has Multiple Subscriptions', () => {
      const customer = deepCopy(customer1);
      customer.subscriptions.data = [multiPlanSubscription, subscription2];

      it('returns the Subscription when the plan id is found in the first subscription', () => {
        const expected = customer.subscriptions.data[0];
        const actual = stripeHelper.findCustomerSubscriptionByPlanId(
          customer,
          'plan_2'
        );

        assert.deepEqual(actual, expected);
      });

      it('returns the Subscription when the plan id is found in not the first subscription', () => {
        const expected = customer.subscriptions.data[1];
        const actual = stripeHelper.findCustomerSubscriptionByPlanId(
          customer,
          'plan_G93mMKnIFCjZek'
        );

        assert.deepEqual(actual, expected);
      });

      it('returns `undefined` when the plan id is not found', () => {
        assert.isUndefined(
          stripeHelper.findCustomerSubscriptionByPlanId(customer, 'plan_test2')
        );
      });
    });
  });

  describe('extractSourceCountryFromSubscription', () => {
    it('extracts the country if its present', () => {
      const latest_invoice = {
        ...subscriptionCreatedInvoice,
        payment_intent: { ...closedPaymementIntent },
      };
      const subscription = { ...subscription2, latest_invoice };
      const result = stripeHelper.extractSourceCountryFromSubscription(
        subscription
      );
      assert.equal(result, 'US');
    });

    it('returns null with no invoice', () => {
      const result = stripeHelper.extractSourceCountryFromSubscription(
        subscription2
      );
      assert.equal(result, null);
    });

    it('returns null and sends sentry error with no charges', () => {
      const scopeContextSpy = sinon.fake();
      const scopeSpy = {
        setContext: scopeContextSpy,
      };
      sandbox.replace(Sentry, 'withScope', (fn) => fn(scopeSpy));
      sandbox.replace(Sentry, 'captureMessage', sinon.stub());

      const latest_invoice = {
        ...subscriptionCreatedInvoice,
        payment_intent: { charges: { data: [] } },
      };
      const subscription = { ...subscription2, latest_invoice };
      const result = stripeHelper.extractSourceCountryFromSubscription(
        subscription
      );
      assert.equal(result, null);

      assert.isTrue(
        scopeContextSpy.calledOnce,
        'Set a message scope when "charges" is missing'
      );
      assert.isTrue(
        Sentry.captureMessage.calledOnce,
        'Capture a message with Sentry when "charges" is missing'
      );
    });
  });

  describe('allPlans', () => {
    it('pulls a list of plans and caches it', async () => {
      assert.lengthOf(await stripeHelper.allPlans(), 3);
      assert(mockRedis.get.calledOnce);

      assert.lengthOf(await stripeHelper.allPlans(), 3);
      assert(mockRedis.get.calledTwice);
      assert(mockRedis.set.calledOnce);

      // Assert that a TTL was set for this cache entry
      assert.deepEqual(mockRedis.set.args[0][2], [
        'EX',
        mockConfig.subhub.plansCacheTtlSeconds,
      ]);

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
          plan_name: goodPlan.nickname,
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

      // Assert that a TTL was set for this cache entry
      assert.deepEqual(mockRedis.set.args[0][2], [
        'EX',
        mockConfig.subhub.plansCacheTtlSeconds,
      ]);

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
        .resolves(subscription);

      const update = sandbox
        .stub(stripeHelper.stripe.subscriptions, 'update')
        .resolves(subscription2);

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
        .resolves(subscription2);
      sandbox
        .stub(stripeHelper.stripe.subscriptions, 'update')
        .resolves(subscription2);
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

        const expected = { uid: null, email: null };
        const actual = await stripeHelper.getCustomerUidEmailFromSubscription(
          subscription
        );

        assert.deepEqual(actual, expected);
        assert.isTrue(scopeContextSpy.notCalled, 'Expected to not call Sentry');
      });
    });

    describe('customer exists but is missing FxA UID on metadata', () => {
      it('notifies Sentry and throws validation check error', async () => {
        customer = deepCopy(newCustomer);
        customer.metadata = {};
        sandbox
          .stub(stripeHelper.stripe.customers, 'retrieve')
          .resolves(customer);

        try {
          await stripeHelper.getCustomerUidEmailFromSubscription(subscription);
          assert.fail('Internal validation check should be thrown');
        } catch (err) {
          assert.equal(err.errno, error.ERRNO.INTERNAL_VALIDATION_ERROR);
        }

        assert.isTrue(scopeContextSpy.calledOnce, 'Expected to call Sentry');
      });
    });
  });

  describe('updateCustomerPaymentMethod', () => {
    it('updates a customer using stripe api', async () => {
      const expected = deepCopy(customer1);
      sandbox.stub(stripeHelper.stripe.customers, 'update').resolves(expected);

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
      sandbox
        .stub(stripeHelper.stripe.customers, 'retrieve')
        .returns(customer1);
      const result = await stripeHelper.fetchCustomer(
        existingCustomer.uid,
        'test@example.com'
      );
      assert.deepEqual(result, customer1);
    });

    it('throws if the customer record has a fxa id mismatch', async () => {
      sandbox
        .stub(stripeHelper.stripe.customers, 'retrieve')
        .returns(newCustomer);
      let thrown;
      try {
        await stripeHelper.fetchCustomer(
          existingCustomer.uid,
          'test@example.com'
        );
        assert.fail('Error should have been thrown.');
      } catch (err) {
        thrown = err;
      }
      assert.isObject(thrown);
      assert.equal(thrown.message, 'A backend service request failed.');
      assert.equal(
        thrown.cause().message,
        'Stripe Customer: cus_new has mismatched uid in metadata.'
      );
    });

    it('returns void if no there is no record of the user-customer relationship in db', async () => {
      assert.isUndefined(
        await stripeHelper.fetchCustomer(
          '013b3c2f6c7b41e0991e6707fdbb62b3',
          'test@example.com'
        )
      );
    });

    it('returns void if the stripe customer is deleted and updates db', async () => {
      sandbox
        .stub(stripeHelper.stripe.customers, 'retrieve')
        .returns(deletedCustomer);
      assert.isDefined(await getAccountCustomerByUid(existingCustomer.uid));
      assert.isUndefined(
        await stripeHelper.fetchCustomer(
          existingCustomer.uid,
          'test@example.com'
        )
      );
      assert.isTrue(stripeHelper.stripe.customers.retrieve.calledOnce);
      assert.isUndefined(await getAccountCustomerByUid(existingCustomer.uid));

      // reset for tests:
      existingCustomer = await createAccountCustomer(existingUid, customer1.id);
    });

    describe('when a customer has subscriptions and they are more than one page', () => {
      it('loads all of the subscriptions for the user', async () => {
        const customer = deepCopy(customer1);
        const custSubscription1 = deepCopy(subscription1);
        const custSubscription2 = deepCopy(subscription2);

        customer.subscriptions.data = [custSubscription1];
        customer.subscriptions.has_more = true;

        sandbox
          .stub(stripeHelper.stripe.customers, 'retrieve')
          .returns(customer);
        sandbox
          .stub(stripeHelper, 'fetchAllSubscriptionsForCustomer')
          .resolves([custSubscription2]);

        const result = await stripeHelper.fetchCustomer(
          existingCustomer.uid,
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
    const email = 'test@example.com';

    beforeEach(() => {
      sandbox
        .stub(stripeHelper.stripe.customers, 'retrieve')
        .returns(customer1);
    });

    describe('customer', () => {
      it('fetches an existing customer and caches it', async () => {
        assert.deepEqual(
          await stripeHelper.customer({ uid: existingUid, email }),
          customer1
        );
        assert(mockRedis.get.calledOnce);
        assert(mockRedis.set.calledOnce);

        // Assert that a TTL was set for this cache entry
        assert.deepEqual(mockRedis.set.args[0][2], [
          'EX',
          mockConfig.subhub.customerCacheTtlSeconds,
        ]);

        assert.deepEqual(
          await stripeHelper.customer({ uid: existingUid, email }),
          customer1
        );
        assert(mockRedis.get.calledTwice);
        assert(mockRedis.set.calledOnce);
        assert(stripeHelper.stripe.customers.retrieve.calledOnce);

        const customerKey = StripeHelper.StripeHelper.customerCacheKey([
          existingUid,
          email,
        ]);
        assert.deepEqual(
          await stripeHelper.customer({ uid: existingUid, email }),
          JSON.parse(await mockRedis.get(customerKey))
        );
      });
    });

    describe('subscriptionForCustomer', () => {
      it('uses cached customer data to look up a subscription', async () => {
        assert.deepEqual(
          await stripeHelper.customer({ uid: existingUid, email }),
          customer1
        );
        assert(mockRedis.get.calledOnce);
        assert(mockRedis.set.calledOnce);

        assert.deepEqual(
          await stripeHelper.subscriptionForCustomer(
            existingUid,
            email,
            customer1.subscriptions.data[0].id
          ),
          customer1.subscriptions.data[0]
        );
        assert(mockRedis.get.calledTwice);
        assert(mockRedis.set.calledOnce);
        assert(stripeHelper.stripe.customers.retrieve.calledOnce);
      });

      it('returns void if no customer is found', async () => {
        sandbox.stub(stripeHelper, 'customer').resolves(null);

        assert.isUndefined(
          await stripeHelper.subscriptionForCustomer(
            existingUid,
            email,
            customer1.subscriptions.data[0].id
          )
        );
      });
    });

    describe('fetchAllSubscriptionsForCustomer', () => {
      it('calls Stripe with the correct arguments', async () => {
        sandbox
          .stub(stripeHelper.stripe.subscriptions, 'list')
          .resolves({ has_more: false, data: [{ id: 'sub_wibble' }] });
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
          .resolves({ has_more: true, data: [{ id: 'sub_quux' }] });
        stub
          .onSecondCall()
          .resolves({ has_more: true, data: [{ id: 'sub_foo' }] });
        stub
          .onThirdCall()
          .resolves({ has_more: false, data: [{ id: 'sub_bar' }] });
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
        customerKey = StripeHelper.StripeHelper.customerCacheKey([
          existingUid,
          email,
        ]);
        assert.deepEqual(
          await stripeHelper.customer({ uid: existingUid, email }),
          JSON.parse(await mockRedis.get(customerKey))
        );
      });

      describe('refreshCachedCustomer', () => {
        it('forces a refresh of a cached customer by uid and email', async () => {
          await stripeHelper.refreshCachedCustomer(existingUid, email);
          assert(stripeHelper.stripe.customers.retrieve.calledTwice);
        });

        it('logs errors', async () => {
          sandbox.stub(stripeHelper, 'customer').rejects(Error);
          await stripeHelper.refreshCachedCustomer(existingUid, email);
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

          await stripeHelper.removeCustomerFromCache(existingUid, email);

          assert.isTrue(mockRedis.del.calledOnceWithExactly(customerKey));
          assert.isTrue(log.error.notCalled);
          assert.isUndefined(await mockRedis.get(customerKey));
        });

        it('does not fail if key does not exist', async () => {
          const key = StripeHelper.StripeHelper.customerCacheKey([
            'test-test-test',
            email,
          ]);
          assert.isUndefined(await mockRedis.get(key));

          await stripeHelper.removeCustomerFromCache('test-test-test', email);

          assert.isTrue(mockRedis.del.calledOnceWithExactly(key));
          assert.isTrue(log.error.notCalled);
          assert.isUndefined(await mockRedis.get(key));
        });
      });
    });
  });

  describe('removeCustomer', () => {
    let stripeCustomerDel;
    const email = 'test@example.com';

    beforeEach(() => {
      stripeCustomerDel = sandbox
        .stub(stripeHelper.stripe.customers, 'del')
        .resolves();

      sandbox.spy(stripeHelper, 'removeCustomerFromCache');
    });

    describe('when customer is found', () => {
      it('deletes customer in Stripe, removes AccountCustomer record, removes Cached record', async () => {
        const uid = chance.guid({ version: 4 }).replace(/-/g, '');
        const customerId = 'cus_1234456sdf';
        const testAccount = await createAccountCustomer(uid, customerId);

        await stripeHelper.removeCustomer(testAccount.uid, email);

        assert(stripeCustomerDel.calledOnce);
        assert((await getAccountCustomerByUid(uid)) === undefined);
        assert(stripeHelper.removeCustomerFromCache.calledOnce);
      });
    });

    describe('when customer is not found', () => {
      it('does not throw any errors', async () => {
        const uid = chance.guid({ version: 4 }).replace(/-/g, '');

        await stripeHelper.removeCustomer(uid, email);

        assert(stripeCustomerDel.notCalled);
        assert(stripeHelper.removeCustomerFromCache.notCalled);
      });
    });

    describe('when accountCustomer record is not deleted', () => {
      it('logs an error', async () => {
        const uid = chance.guid({ version: 4 }).replace(/-/g, '');
        const customerId = 'cus_1234456sdf';
        const testAccount = await createAccountCustomer(uid, customerId);

        const authDbModule = require('fxa-shared/db/models/auth');
        const deleteCustomer = sandbox
          .stub(authDbModule, 'deleteAccountCustomer')
          .returns(0);

        await stripeHelper.removeCustomer(testAccount.uid, email);

        assert(deleteCustomer.calledOnce);
        assert(stripeHelper.removeCustomerFromCache.calledOnce);
        assert(stripeHelper.log.error.calledOnce);
        assert.equal(
          `StripeHelper.removeCustomer failed to remove AccountCustomer record for uid ${uid}`,
          stripeHelper.log.error.getCall(0).args[0]
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
        .resolves(unsuccessfulPaymentIntent);
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
        .resolves({ id: productId, name: productName });
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
            .resolves(failedChargeCopy);
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
              .resolves(paidInvoice);
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
              .resolves(paidInvoice);
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
              .resolves(paidInvoice);
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
          .resolves(paidInvoice);

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
        .resolves({ id: productId, name: productName });
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
      next_payment_attempt: 1590018018,
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

      it('does not throw an exception when details on a payment method are missing', async () => {
        const fixture = deepCopy(invoicePaymentSucceededSubscriptionCreate);
        fixture.lines.data[0].plan = {
          id: planId,
          nickname: planName,
          metadata: mockPlan.metadata,
          product: mockProduct,
        };
        fixture.customer = mockCustomer;
        fixture.charge = null;
        const result = await stripeHelper.extractInvoiceDetailsForEmail(
          fixture
        );
        assert.isFalse(stripeHelper.allProducts.called);
        assert.isFalse(mockStripe.products.retrieve.called);
        assert.isFalse(mockStripe.customers.retrieve.called);
        assert.isFalse(mockStripe.charges.retrieve.called);
        assert.deepEqual(result, {
          ...expected,
          lastFour: null,
          cardType: null,
        });
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
        subscriptions: [
          {
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
          },
        ],
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
          .resolves(mockCancellationDetails);
        sandbox
          .stub(
            stripeHelper,
            'extractSubscriptionUpdateReactivationDetailsForEmail'
          )
          .resolves(mockReactivationDetails);
        sandbox
          .stub(
            stripeHelper,
            'extractSubscriptionUpdateUpgradeDowngradeDetailsForEmail'
          )
          .resolves(mockUpgradeDowngradeDetails);
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

      it('calls the expected helper method for upgrade or downgrade if previously cancelled', async () => {
        const event = deepCopy(eventCustomerSubscriptionUpdated);
        event.data.object.cancel_at_period_end = false;
        event.data.previous_attributes.cancel_at_period_end = true;
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
      const { card } = mockCharge.payment_method_details;
      const defaultExpected = {
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
        nextInvoiceDate: new Date(mockInvoice.lines.data[0].period.end * 1000),
      };

      const { lastFour, cardType } = defaultExpected;

      const mockCustomer = {
        invoice_settings: {
          default_payment_method: {
            card: {
              last4: lastFour,
              brand: cardType,
            },
          },
        },
      };

      it('extracts expected details for a subscription reactivation', async () => {
        const event = deepCopy(eventCustomerSubscriptionUpdated);
        sandbox.stub(stripeHelper, 'customer').resolves(mockCustomer);
        const result = await stripeHelper.extractSubscriptionUpdateReactivationDetailsForEmail(
          event.data.object,
          expectedBaseUpdateDetails,
          mockInvoice
        );
        assert.deepEqual(mockStripe.invoices.retrieveUpcoming.args, [
          [
            {
              subscription: event.data.object.id,
            },
          ],
        ]);
        assert.deepEqual(result, defaultExpected);
      });

      it('does not throw an exception when payment method is missing', async () => {
        const event = deepCopy(eventCustomerSubscriptionUpdated);
        const customer = deepCopy(mockCustomer);
        customer.invoice_settings.default_payment_method = null;
        sandbox.stub(stripeHelper, 'customer').resolves(customer);
        const result = await stripeHelper.extractSubscriptionUpdateReactivationDetailsForEmail(
          event.data.object,
          expectedBaseUpdateDetails,
          mockInvoice
        );
        assert.deepEqual(result, {
          ...defaultExpected,
          lastFour: null,
          cardType: null,
        });
      });
    });

    describe('extractCustomerDefaultPaymentDetails', () => {
      const mockPaymentMethod = {
        card: {
          last4: '4321',
          brand: 'MasterCard',
        },
      };

      const mockSource = {
        id: sourceId,
        last4: '0987',
        brand: 'Visa',
      };

      const mockCustomer = {
        invoice_settings: {
          default_payment_method: mockPaymentMethod,
        },
        default_source: mockSource.id,
        sources: {
          data: [mockSource],
        },
      };

      it('throws for a deleted customer', async () => {
        sandbox.stub(stripeHelper, 'customer').resolves(null);
        let thrown;
        try {
          await stripeHelper.extractCustomerDefaultPaymentDetails({
            uid,
            email,
          });
        } catch (err) {
          thrown = err;
        }
        assert.equal(thrown.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER);
      });

      it('extracts from default payment method first when available', async () => {
        sandbox.stub(stripeHelper, 'customer').resolves(mockCustomer);
        const result = await stripeHelper.extractCustomerDefaultPaymentDetails({
          uid,
          email,
        });
        assert.deepEqual(result, {
          lastFour: mockPaymentMethod.card.last4,
          cardType: mockPaymentMethod.card.brand,
        });
      });

      it('extracts from default source when available', async () => {
        const customer = deepCopy(mockCustomer);
        customer.invoice_settings.default_payment_method = null;
        sandbox.stub(stripeHelper, 'customer').resolves(customer);
        const result = await stripeHelper.extractCustomerDefaultPaymentDetails({
          uid,
          email,
        });
        assert.deepEqual(result, {
          lastFour: mockSource.last4,
          cardType: mockSource.brand,
        });
      });

      it('returns undefined details when neither default payment method nor source is available', async () => {
        const customer = deepCopy(mockCustomer);
        customer.invoice_settings.default_payment_method = null;
        customer.default_source = null;
        sandbox.stub(stripeHelper, 'customer').resolves(customer);
        const result = await stripeHelper.extractCustomerDefaultPaymentDetails({
          uid,
          email,
        });
        assert.deepEqual(result, {
          lastFour: null,
          cardType: null,
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
