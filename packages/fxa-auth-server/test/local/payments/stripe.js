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
const { mockLog, asyncIterable } = require('../../mocks');
const error = require('../../../lib/error');
const stripeError = require('stripe').Stripe.errors;
const uuidv4 = require('uuid').v4;
const moment = require('moment');
const { Container } = require('typedi');

const chance = new Chance();
let mockRedis;
const proxyquire = require('proxyquire').noPreserveCache();
const dbStub = {
  getUidAndEmailByStripeCustomerId: sinon.stub(),
};
const {
  StripeHelper,
  STRIPE_INVOICE_METADATA,
  SUBSCRIPTION_UPDATE_TYPES,
  MOZILLA_TAX_ID,
  CUSTOMER_RESOURCE,
  SUBSCRIPTIONS_RESOURCE,
} = proxyquire('../../../lib/payments/stripe', {
  '../redis': (config, log) => mockRedis.init(config, log),
  'fxa-shared/db/models/auth': dbStub,
});
const { CurrencyHelper } = require('../../../lib/payments/currencies');

const customer1 = require('./fixtures/stripe/customer1.json');
const newCustomer = require('./fixtures/stripe/customer_new.json');
const newCustomerPM = require('./fixtures/stripe/customer_new_pmi.json');
const deletedCustomer = require('./fixtures/stripe/customer_deleted.json');
const taxRateDe = require('./fixtures/stripe/taxRateDe.json');
const taxRateFr = require('./fixtures/stripe/taxRateFr.json');
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
const invoicePaidSubscriptionCreate = require('./fixtures/stripe/invoice_paid_subscription_create.json');
const invoicePaidSubscriptionCreateDiscount = require('./fixtures/stripe/invoice_paid_subscription_create_discount.json');
const eventCustomerSourceExpiring = require('./fixtures/stripe/event_customer_source_expiring.json');
const eventCustomerSubscriptionUpdated = require('./fixtures/stripe/event_customer_subscription_updated.json');
const subscriptionCreatedInvoice = require('./fixtures/stripe/invoice_paid_subscription_create.json');
const eventInvoiceCreated = require('./fixtures/stripe/event_invoice_created.json');
const eventSubscriptionUpdated = require('./fixtures/stripe/event_customer_subscription_updated.json');
const eventCustomerUpdated = require('./fixtures/stripe/event_customer_updated.json');
const eventPaymentMethodAttached = require('./fixtures/stripe/event_payment_method_attached.json');
const eventPaymentMethodDetached = require('./fixtures/stripe/event_payment_method_detached.json');
const closedPaymementIntent = require('./fixtures/stripe/paymentIntent_succeeded.json');
const newSetupIntent = require('./fixtures/stripe/setup_intent_new.json');
const {
  createAccountCustomer,
  getAccountCustomerByUid,
} = require('fxa-shared/db/models/auth');
const {
  SubscriptionPurchase,
} = require('../../../lib/payments/google-play/subscription-purchase');
const { AuthFirestore, AuthLogger, AppConfig } = require('../../../lib/types');
const {
  INVOICES_RESOURCE,
  PAYMENT_METHOD_RESOURCE,
  STRIPE_PRICE_METADATA,
} = require('../../../lib/payments/stripe');
const { GoogleMapsService } = require('../../../lib/google-maps-services');
const {
  FirestoreStripeError,
  newFirestoreStripeError,
} = require('../../../lib/payments/stripe-firestore');
const {
  MozillaSubscriptionTypes,
  PAYPAL_PAYMENT_ERROR_FUNDING_SOURCE,
  PAYPAL_PAYMENT_ERROR_MISSING_AGREEMENT,
} = require('../../../../fxa-shared/subscriptions/types');
const AppError = require('../../../lib/error');

const mockConfig = {
  authFirestore: {
    prefix: 'fxa-auth-',
  },
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
    stripeTaxRatesCacheTtlSeconds: 60,
  },
  currenciesToCountries: { ZAR: ['AS', 'CA'] },
};

const mockRedisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  maxPending: 1000,
  retryCount: 5,
  initialBackoff: '100 milliseconds',
  subhub: {
    enabled: true,
    prefix: 'subhub:',
    minConnections: 1,
  },
};

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
    host: process.env.MYSQL_HOST || 'localhost',
    password: process.env.MYSQL_PASSWORD || '',
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USERNAME || 'root',
  },
};

mockConfig.database = {
  mysql: {
    auth: {
      database: 'testStripeHelper',
      host: process.env.MYSQL_HOST || 'localhost',
      password: process.env.MYSQL_PASSWORD || '',
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.MYSQL_USERNAME || 'root',
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
  let mockStatsd;
  const existingUid = '40cc397def2d487b9b8ba0369079a267';
  let stripeFirestore;
  let mockGoogleMapsService;

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
    mockStatsd = {
      increment: sandbox.fake.returns({}),
      timing: sandbox.fake.returns({}),
      close: sandbox.fake.returns({}),
    };
    // Make currencyHelper
    const currencyHelper = new CurrencyHelper(mockConfig);
    Container.set(CurrencyHelper, currencyHelper);
    Container.set(AuthFirestore, {
      collection: sinon.fake.returns({}),
    });
    Container.set(AuthLogger, log);
    Container.set(AppConfig, mockConfig);
    mockGoogleMapsService = {
      getStateFromZip: sandbox.stub().resolves('ABD'),
    };
    Container.set(GoogleMapsService, mockGoogleMapsService);

    stripeHelper = new StripeHelper(log, mockConfig, mockStatsd);
    stripeHelper.redis = mockRedis;
    stripeHelper.stripeFirestore = stripeFirestore = {};
    listStripePlans = sandbox
      .stub(stripeHelper.stripe.plans, 'list')
      .returns(asyncIterable([plan1, plan2, plan3]));
    sandbox
      .stub(stripeHelper.stripe.taxRates, 'list')
      .returns(asyncIterable([taxRateDe, taxRateFr]));
    sandbox
      .stub(stripeHelper.stripe.products, 'list')
      .returns(asyncIterable([product1, product2, product3]));
  });

  afterEach(() => {
    Container.reset();
    sandbox.restore();
  });

  describe('constructor', () => {
    it('sets currencyHelper', () => {
      const expectedCurrencyHelper = new CurrencyHelper(mockConfig);
      assert.deepEqual(stripeHelper.currencyHelper, expectedCurrencyHelper);
    });
  });

  describe('createPlainCustomer', () => {
    it('creates a customer using stripe api', async () => {
      const expected = deepCopy(newCustomerPM);
      sandbox.stub(stripeHelper.stripe.customers, 'create').resolves(expected);
      stripeFirestore.insertCustomerRecord = sandbox.stub().resolves({});
      const uid = chance.guid({ version: 4 }).replace(/-/g, '');
      const actual = await stripeHelper.createPlainCustomer(
        uid,
        'joe@example.com',
        'Joe Cool',
        uuidv4()
      );
      assert.deepEqual(actual, expected);
      sinon.assert.calledWithExactly(
        stripeHelper.stripeFirestore.insertCustomerRecord,
        uid,
        expected
      );
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
      stripeFirestore.insertCustomerRecordWithBackfill = sandbox
        .stub()
        .resolves({});
      const actual = await stripeHelper.updateDefaultPaymentMethod(
        'cust_new',
        'pm_1H0FRp2eZvKYlo2CeIZoc0wj'
      );
      assert.deepEqual(actual, expected);
      sinon.assert.calledOnceWithExactly(
        stripeFirestore.insertCustomerRecordWithBackfill,
        expected.metadata.userid,
        expected
      );
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
    it('calls the Stripe api', async () => {
      const paymentMethodId = 'pm_9001';
      sandbox.stub(stripeHelper, 'expandResource');
      await stripeHelper.getPaymentMethod(paymentMethodId);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.expandResource,
        paymentMethodId,
        PAYMENT_METHOD_RESOURCE
      );
    });
  });

  describe('getPaymentProvider', () => {
    let customerExpanded;
    beforeEach(() => {
      customerExpanded = deepCopy(customer1);
    });

    describe('returns correct value based on collection_method', () => {
      describe('when collection_method is "send_invoice"', () => {
        it('payment_provider is "paypal"', async () => {
          subscription2.collection_method = 'send_invoice';
          customerExpanded.subscriptions.data[0] = subscription2;
          assert.strictEqual(
            stripeHelper.getPaymentProvider(customerExpanded),
            'paypal'
          );
        });
      });

      describe('when the customer has a canceled subscription', () => {
        it('payment_provider is "not_chosen"', async () => {
          customerExpanded.subscriptions.data[0] = cancelledSubscription;
          assert.strictEqual(
            stripeHelper.getPaymentProvider(customerExpanded),
            'not_chosen'
          );
        });
      });

      describe('when the customer has no subscriptions', () => {
        it('payment_provider is "not_chosen"', async () => {
          customerExpanded.subscriptions.data = [];
          assert.strictEqual(
            stripeHelper.getPaymentProvider(customerExpanded),
            'not_chosen'
          );
        });
      });

      describe('when collection_method is "instant"', () => {
        it('payment_provider is "stripe"', async () => {
          subscription2.collection_method = 'instant';
          customerExpanded.subscriptions.data[0] = subscription2;
          assert.strictEqual(
            stripeHelper.getPaymentProvider(customerExpanded),
            'stripe'
          );
        });
      });
    });
  });

  describe('hasSubscriptionRequiringPaymentMethod', () => {
    let customerExpanded;
    beforeEach(() => {
      customerExpanded = deepCopy(customer1);
    });

    it('returns true for a non-cancelled active subscription', () => {
      const subscription3 = deepCopy(subscription2);
      subscription3.status = 'active';
      subscription3.cancel_at_period_end = false;
      customerExpanded.subscriptions.data[0] = subscription3;
      assert.isTrue(
        stripeHelper.hasSubscriptionRequiringPaymentMethod(customerExpanded)
      );
    });

    it('returns false for a cancelled active subscription', () => {
      const subscription3 = deepCopy(subscription2);
      subscription3.status = 'active';
      subscription3.cancel_at_period_end = true;
      customerExpanded.subscriptions.data[0] = subscription3;
      assert.isFalse(
        stripeHelper.hasSubscriptionRequiringPaymentMethod(customerExpanded)
      );
    });
  });

  describe('hasActiveSubscription', () => {
    let customerExpanded, subscription;
    beforeEach(() => {
      customerExpanded = deepCopy(customer1);
      subscription = deepCopy(subscription2);
    });

    it('returns true for an active subscription', async () => {
      subscription.status = 'active';
      customerExpanded.subscriptions.data[0] = subscription;
      sandbox.stub(stripeHelper, 'expandResource').resolves(customerExpanded);
      assert.isTrue(
        await stripeHelper.hasActiveSubscription(
          customerExpanded.metadata.userid
        )
      );
    });

    it('returns false when there is no Stripe customer', async () => {
      const uid = uuidv4().replace(/-/g, '');
      customerExpanded = undefined;
      sandbox.stub(stripeHelper, 'expandResource').resolves(customerExpanded);
      assert.isFalse(await stripeHelper.hasActiveSubscription(uid));
    });

    it('returns false when there is no active subscription', async () => {
      subscription.status = 'canceled';
      customerExpanded.subscriptions.data[0] = subscription;
      sandbox.stub(stripeHelper, 'expandResource').resolves(customerExpanded);
      assert.isFalse(
        await stripeHelper.hasActiveSubscription(
          customerExpanded.metadata.userid
        )
      );
    });
  });

  describe('hasOpenInvoice', () => {
    let customerExpanded;
    let invoice;

    beforeEach(() => {
      customerExpanded = deepCopy(customer1);
      invoice = deepCopy(paidInvoice);
      customerExpanded.subscriptions.data[0] = subscription2;
      sandbox.stub(stripeHelper, 'expandResource').resolves(invoice);
    });

    it('returns true for an open invoice', async () => {
      invoice.status = 'open';
      assert.isTrue(await stripeHelper.hasOpenInvoice(customerExpanded));
    });

    it('returns false for no open invoices', async () => {
      assert.isFalse(await stripeHelper.hasOpenInvoice(customerExpanded));
    });
  });

  describe('detachPaymentMethod', () => {
    it('calls the Stripe api', async () => {
      const paymentMethodId = 'pm_9001';
      const expected = { id: paymentMethodId };
      sandbox
        .stub(stripeHelper.stripe.paymentMethods, 'detach')
        .resolves(expected);
      stripeFirestore.removePaymentMethodRecord = sandbox.stub().resolves({});
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
      stripeFirestore.insertCustomerRecordWithBackfill = sandbox
        .stub()
        .resolves({});
      stripeFirestore.insertPaymentMethodRecord = sandbox.stub().resolves({});
      stripeFirestore.insertInvoiceRecord = sandbox.stub().resolves({});
      const actual = await stripeHelper.retryInvoiceWithPaymentId(
        'customerId',
        'invoiceId',
        'pm_1H0FRp2eZvKYlo2CeIZoc0wj',
        uuidv4()
      );

      assert.deepEqual(actual, invoiceRetryExpected);
      sinon.assert.calledOnceWithExactly(
        stripeFirestore.insertCustomerRecordWithBackfill,
        customerExpected.metadata.userid,
        customerExpected
      );
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
      const subIdempotencyKey = uuidv4();
      stripeFirestore.insertCustomerRecordWithBackfill = sandbox
        .stub()
        .resolves({});
      stripeFirestore.insertSubscriptionRecordWithBackfill = sandbox
        .stub()
        .resolves({});
      stripeFirestore.insertPaymentMethodRecord = sandbox.stub().resolves({});
      const actual = await stripeHelper.createSubscriptionWithPMI({
        customerId: 'customerId',
        priceId: 'priceId',
        paymentMethodId: 'pm_1H0FRp2eZvKYlo2CeIZoc0wj',
        subIdempotencyKey,
        taxRateId: 'tr_asdf',
      });

      assert.deepEqual(actual, subscriptionPMIExpanded);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.subscriptions.create,
        {
          customer: 'customerId',
          items: [{ price: 'priceId' }],
          expand: ['latest_invoice.payment_intent'],
          default_tax_rates: ['tr_asdf'],
          promotion_code: undefined,
        },
        { idempotencyKey: `ssc-${subIdempotencyKey}` }
      );
      sinon.assert.calledOnceWithExactly(
        stripeFirestore.insertSubscriptionRecordWithBackfill,
        {
          ...subscriptionPMIExpanded,
          latest_invoice: subscriptionPMIExpanded.latest_invoice
            ? subscriptionPMIExpanded.latest_invoice.id
            : null,
        }
      );
      sinon.assert.callCount(mockStatsd.increment, 1);
    });

    it('uses the given promotion code', async () => {
      const promotionCode = { id: 'redpanda', code: 'firefox' };
      const attachExpected = deepCopy(paymentMethodAttach);
      const customerExpected = deepCopy(newCustomerPM);
      const newSubscription = deepCopy(subscriptionPMIExpanded);
      newSubscription.latest_invoice.discount = {};
      sandbox
        .stub(stripeHelper.stripe.paymentMethods, 'attach')
        .resolves(attachExpected);
      sandbox
        .stub(stripeHelper.stripe.customers, 'update')
        .resolves(customerExpected);
      sandbox
        .stub(stripeHelper.stripe.subscriptions, 'create')
        .resolves(newSubscription);
      sandbox.stub(stripeHelper.stripe.subscriptions, 'update').resolves({});
      const subIdempotencyKey = uuidv4();
      stripeFirestore.insertCustomerRecordWithBackfill = sandbox
        .stub()
        .resolves({});
      stripeFirestore.insertSubscriptionRecordWithBackfill = sandbox
        .stub()
        .resolves({});
      stripeFirestore.insertPaymentMethodRecord = sandbox.stub().resolves({});
      const actual = await stripeHelper.createSubscriptionWithPMI({
        customerId: 'customerId',
        priceId: 'priceId',
        paymentMethodId: 'pm_1H0FRp2eZvKYlo2CeIZoc0wj',
        subIdempotencyKey,
        taxRateId: 'tr_asdf',
        promotionCode,
      });

      const subWithPromotionCodeMetadata = {
        ...newSubscription,
        metadata: {
          ...newSubscription.metadata,
          appliedPromotionCode: promotionCode.code,
        },
      };
      assert.deepEqual(actual, subWithPromotionCodeMetadata);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.subscriptions.create,
        {
          customer: 'customerId',
          items: [{ price: 'priceId' }],
          expand: ['latest_invoice.payment_intent'],
          default_tax_rates: ['tr_asdf'],
          promotion_code: promotionCode.id,
        },
        { idempotencyKey: `ssc-${subIdempotencyKey}` }
      );
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.subscriptions.update,
        newSubscription.id,
        {
          metadata: {
            ...newSubscription.metadata,
            appliedPromotionCode: promotionCode.code,
          },
        }
      );
      sinon.assert.calledOnceWithExactly(
        stripeFirestore.insertSubscriptionRecordWithBackfill,
        {
          ...subWithPromotionCodeMetadata,
          latest_invoice: subscriptionPMIExpanded.latest_invoice
            ? subscriptionPMIExpanded.latest_invoice.id
            : null,
        }
      );
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
      const subIdempotencyKey = uuidv4();
      stripeFirestore.insertSubscriptionRecordWithBackfill = sandbox
        .stub()
        .resolves({});
      const actual = await stripeHelper.createSubscriptionWithPaypal({
        customer: customer1,
        priceId: 'priceId',
        subIdempotencyKey,
        taxRateId: 'tr_asdf',
      });

      assert.deepEqual(actual, subscriptionPMIExpanded);
      sinon.assert.calledOnceWithExactly(
        stripeFirestore.insertSubscriptionRecordWithBackfill,
        {
          ...subscriptionPMIExpanded,
          latest_invoice: subscriptionPMIExpanded.latest_invoice
            ? subscriptionPMIExpanded.latest_invoice.id
            : null,
        }
      );
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.subscriptions.create,
        {
          customer: customer1.id,
          items: [{ price: 'priceId' }],
          expand: ['latest_invoice'],
          collection_method: 'send_invoice',
          days_until_due: 1,
          promotion_code: undefined,
          default_tax_rates: ['tr_asdf'],
        },
        { idempotencyKey: `ssc-${subIdempotencyKey}` }
      );
      sinon.assert.callCount(mockStatsd.increment, 1);
    });

    it('uses the given promotion code to create a subscription', async () => {
      const promotionCode = { id: 'redpanda', code: 'firefox' };
      const newSubscription = deepCopy(subscriptionPMIExpanded);
      newSubscription.latest_invoice.discount = {};
      sandbox
        .stub(stripeHelper, 'findCustomerSubscriptionByPlanId')
        .returns(undefined);
      sandbox
        .stub(stripeHelper.stripe.subscriptions, 'create')
        .resolves(newSubscription);
      sandbox.stub(stripeHelper.stripe.subscriptions, 'update').resolves({});
      const subIdempotencyKey = uuidv4();
      stripeFirestore.insertSubscriptionRecordWithBackfill = sandbox
        .stub()
        .resolves({});
      const actual = await stripeHelper.createSubscriptionWithPaypal({
        customer: customer1,
        priceId: 'priceId',
        subIdempotencyKey,
        taxRateId: 'tr_asdf',
        promotionCode,
      });

      const subWithPromotionCodeMetadata = {
        ...newSubscription,
        metadata: {
          ...newSubscription.metadata,
          appliedPromotionCode: promotionCode.code,
        },
      };
      assert.deepEqual(actual, subWithPromotionCodeMetadata);
      sinon.assert.calledOnceWithExactly(
        stripeFirestore.insertSubscriptionRecordWithBackfill,
        {
          ...subWithPromotionCodeMetadata,
          latest_invoice: subscriptionPMIExpanded.latest_invoice
            ? subscriptionPMIExpanded.latest_invoice.id
            : null,
        }
      );
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.subscriptions.create,
        {
          customer: customer1.id,
          items: [{ price: 'priceId' }],
          expand: ['latest_invoice'],
          collection_method: 'send_invoice',
          days_until_due: 1,
          promotion_code: promotionCode.id,
          default_tax_rates: ['tr_asdf'],
        },
        { idempotencyKey: `ssc-${subIdempotencyKey}` }
      );
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.subscriptions.update,
        newSubscription.id,
        {
          metadata: {
            ...newSubscription.metadata,
            appliedPromotionCode: promotionCode.code,
          },
        }
      );
      sinon.assert.callCount(mockStatsd.increment, 1);
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
      stripeFirestore.insertSubscriptionRecordWithBackfill = sandbox
        .stub()
        .resolves({});
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
      sinon.assert.calledWithExactly(
        stripeFirestore.insertSubscriptionRecordWithBackfill,
        {
          ...subscription1,
          latest_invoice: subscription1.latest_invoice
            ? subscription1.latest_invoice.id
            : null,
        }
      );
    });
  });

  describe('getCoupon', () => {
    it('returns a coupon', async () => {
      const coupon = { id: 'couponId' };
      sandbox.stub(stripeHelper.stripe.coupons, 'retrieve').resolves(coupon);
      const actual = await stripeHelper.getCoupon('couponId');
      assert.deepEqual(actual, coupon);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.coupons.retrieve,
        coupon.id,
        { expand: ['applies_to'] }
      );
    });
  });

  describe('findValidPromoCode', () => {
    it('finds a valid promotionCode with plan metadata', async () => {
      const promotionCode = { code: 'promo1', coupon: { valid: true } };
      sandbox
        .stub(stripeHelper.stripe.promotionCodes, 'list')
        .resolves({ data: [promotionCode] });
      sandbox.stub(stripeHelper, 'findPlanById').resolves({
        plan_metadata: {
          [STRIPE_PRICE_METADATA.PROMOTION_CODES]: 'promo1',
        },
      });
      const actual = await stripeHelper.findValidPromoCode('promo1', 'planId');
      assert.deepEqual(actual, promotionCode);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.promotionCodes.list,
        {
          active: true,
          code: 'promo1',
        }
      );
      sinon.assert.calledOnceWithExactly(stripeHelper.findPlanById, 'planId');
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.promotionCodes.list,
        {
          active: true,
          code: 'promo1',
        }
      );
    });

    it('does not find an expired promotionCode', async () => {
      const expiredTime = Date.now() / 1000 - 50;
      const promotionCode = {
        code: 'promo1',
        coupon: { valid: true },
        expires_at: expiredTime,
      };
      sandbox
        .stub(stripeHelper.stripe.promotionCodes, 'list')
        .resolves({ data: [promotionCode] });
      sandbox.stub(stripeHelper, 'findPlanById').resolves({
        plan_metadata: {
          [STRIPE_PRICE_METADATA.PROMOTION_CODES]: 'promo1',
        },
      });
      const actual = await stripeHelper.findValidPromoCode('promo1', 'planId');
      assert.isUndefined(actual);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.promotionCodes.list,
        {
          active: true,
          code: 'promo1',
        }
      );
      sinon.assert.notCalled(stripeHelper.findPlanById);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.promotionCodes.list,
        {
          active: true,
          code: 'promo1',
        }
      );
    });

    it('does not find a promotionCode with a different plan', async () => {
      const promotionCode = { code: 'promo1', coupon: { valid: true } };
      sandbox
        .stub(stripeHelper.stripe.promotionCodes, 'list')
        .resolves({ data: [promotionCode] });
      sandbox.stub(stripeHelper, 'findPlanById').resolves({
        plan_metadata: {},
      });
      const actual = await stripeHelper.findValidPromoCode('promo1', 'planId');
      assert.isUndefined(actual);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.promotionCodes.list,
        {
          active: true,
          code: 'promo1',
        }
      );
      sinon.assert.calledOnceWithExactly(stripeHelper.findPlanById, 'planId');
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.promotionCodes.list,
        {
          active: true,
          code: 'promo1',
        }
      );
    });

    it('does not find an invalid promotionCode', async () => {
      const promotionCode = {
        code: 'promo1',
        coupon: { valid: false },
      };
      sandbox
        .stub(stripeHelper.stripe.promotionCodes, 'list')
        .resolves({ data: [promotionCode] });
      sandbox.stub(stripeHelper, 'findPlanById').resolves({
        plan_metadata: {
          [STRIPE_PRICE_METADATA.PROMOTION_CODES]: 'promo1',
        },
      });
      const actual = await stripeHelper.findValidPromoCode('promo1', 'planId');
      assert.isUndefined(actual);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.promotionCodes.list,
        {
          active: true,
          code: 'promo1',
        }
      );
      sinon.assert.notCalled(stripeHelper.findPlanById);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.promotionCodes.list,
        {
          active: true,
          code: 'promo1',
        }
      );
    });
  });

  describe('findPromoCodeByCode', () => {
    it('finds a promo code', async () => {
      const promotionCode = { code: 'code1' };
      sandbox
        .stub(stripeHelper.stripe.promotionCodes, 'list')
        .resolves({ data: [promotionCode] });
      const actual = await stripeHelper.findPromoCodeByCode('code1');
      assert.deepEqual(actual, promotionCode);
    });

    it('finds no promo code', async () => {
      const promotionCode = { code: 'code2' };
      sandbox
        .stub(stripeHelper.stripe.promotionCodes, 'list')
        .resolves({ data: [promotionCode] });
      const actual = await stripeHelper.findPromoCodeByCode('code1');
      assert.isUndefined(actual);
    });
  });

  describe('retrieveCouponDetails', () => {
    const validInvoicePreview = {
      total: 1000,
      currency: 'usd',
      discount: {},
      total_discount_amounts: [{ amount: 200 }],
    };

    let sentryScope;

    beforeEach(() => {
      sentryScope = { setContext: sandbox.stub() };
      sandbox.stub(Sentry, 'withScope').callsFake((cb) => cb(sentryScope));
      sandbox.stub(Sentry, 'captureException');
    });

    it('retrieves coupon details', async () => {
      const expected = {
        promotionCode: 'promo',
        type: 'forever',
        discountAmount: 200,
        valid: true,
      };
      sandbox
        .stub(stripeHelper, 'previewInvoice')
        .resolves(validInvoicePreview);

      sandbox.stub(stripeHelper, 'retrievePromotionCodeForPlan').resolves({
        active: true,
        coupon: {
          id: 'promo',
          duration: 'forever',
          valid: true,
        },
      });

      const actual = await stripeHelper.retrieveCouponDetails({
        country: 'US',
        priceId: 'planId',
        promotionCode: 'promo',
      });

      sinon.assert.calledOnceWithExactly(stripeHelper.previewInvoice, {
        country: 'US',
        priceId: 'planId',
        promotionCode: 'promo',
      });
      sinon.assert.calledOnceWithExactly(
        stripeHelper.retrievePromotionCodeForPlan,
        'promo',
        'planId'
      );
      assert.deepEqual(actual, expected);
    });

    it('retrieves coupon details for 100% discount', async () => {
      const expected = {
        promotionCode: 'promo',
        type: 'forever',
        discountAmount: 200,
        valid: true,
      };
      sandbox
        .stub(stripeHelper, 'previewInvoice')
        .resolves({ ...validInvoicePreview, total: 0 });

      sandbox.stub(stripeHelper, 'retrievePromotionCodeForPlan').resolves({
        active: true,
        coupon: {
          id: 'promo',
          duration: 'forever',
          valid: true,
        },
      });

      const actual = await stripeHelper.retrieveCouponDetails({
        country: 'US',
        priceId: 'planId',
        promotionCode: 'promo',
      });

      sinon.assert.calledOnceWithExactly(stripeHelper.previewInvoice, {
        country: 'US',
        priceId: 'planId',
        promotionCode: 'promo',
      });
      sinon.assert.calledOnceWithExactly(
        stripeHelper.retrievePromotionCodeForPlan,
        'promo',
        'planId'
      );
      assert.deepEqual(actual, expected);
    });

    it('retrieves details on an expired coupon', async () => {
      const expected = {
        promotionCode: 'promo',
        type: 'forever',
        expired: true,
        valid: false,
      };
      sandbox
        .stub(stripeHelper, 'previewInvoice')
        .resolves({ ...validInvoicePreview, total_discount_amounts: null });

      sandbox.stub(stripeHelper, 'retrievePromotionCodeForPlan').resolves({
        active: true,
        coupon: {
          id: 'promo',
          duration: 'forever',
          valid: false,
          redeem_by: 1000,
        },
      });

      const actual = await stripeHelper.retrieveCouponDetails({
        country: 'US',
        priceId: 'planId',
        promotionCode: 'promo',
      });
      assert.deepEqual(actual, expected);
    });

    it('retrieves details on a maximally redeemed coupon', async () => {
      const expected = {
        promotionCode: 'promo',
        type: 'forever',
        maximallyRedeemed: true,
        valid: false,
      };
      sandbox
        .stub(stripeHelper, 'previewInvoice')
        .resolves({ ...validInvoicePreview, total_discount_amounts: null });

      sandbox.stub(stripeHelper, 'retrievePromotionCodeForPlan').resolves({
        active: true,
        coupon: {
          id: 'promo',
          duration: 'forever',
          valid: false,
          max_redemptions: 1,
          times_redeemed: 1,
        },
      });

      const actual = await stripeHelper.retrieveCouponDetails({
        country: 'US',
        priceId: 'planId',
        promotionCode: 'promo',
      });
      assert.deepEqual(actual, expected);
    });

    it('return coupon details even when previewInvoice rejects', async () => {
      const expected = {
        promotionCode: 'promo',
        type: 'forever',
        valid: false,
      };
      const err = new AppError('previewInvoiceFailed');
      sandbox.stub(stripeHelper, 'previewInvoice').rejects(err);

      sandbox.stub(stripeHelper, 'retrievePromotionCodeForPlan').resolves({
        active: true,
        coupon: {
          id: 'promo',
          duration: 'forever',
          valid: true,
        },
      });

      const actual = await stripeHelper.retrieveCouponDetails({
        country: 'US',
        priceId: 'planId',
        promotionCode: 'promo',
      });
      assert.deepEqual(actual, expected);
      sinon.assert.calledOnce(Sentry.withScope);
      sinon.assert.calledOnceWithExactly(
        sentryScope.setContext,
        'retrieveCouponDetails',
        {
          priceId: 'planId',
          promotionCode: 'promo',
        }
      );
      sinon.assert.calledOnceWithExactly(Sentry.captureException, err);
    });

    it('return coupon details even when getMinAmount rejects', async () => {
      const expected = {
        promotionCode: 'promo',
        type: 'forever',
        valid: false,
      };
      sandbox
        .stub(stripeHelper, 'previewInvoice')
        .resolves({ ...validInvoicePreview, currency: 'fake' });

      sandbox.stub(stripeHelper, 'retrievePromotionCodeForPlan').resolves({
        active: true,
        coupon: {
          id: 'promo',
          duration: 'forever',
          valid: true,
        },
      });

      const actual = await stripeHelper.retrieveCouponDetails({
        country: 'US',
        priceId: 'planId',
        promotionCode: 'promo',
      });
      assert.deepEqual(actual, expected);
      sinon.assert.calledOnce(Sentry.withScope);
      sinon.assert.calledOnceWithExactly(
        sentryScope.setContext,
        'retrieveCouponDetails',
        {
          priceId: 'planId',
          promotionCode: 'promo',
        }
      );
    });

    it('throw an error when previewInvoice returns total less than stripe minimums', async () => {
      sandbox
        .stub(stripeHelper, 'previewInvoice')
        .resolves({ ...validInvoicePreview, total: 20 });

      sandbox.stub(stripeHelper, 'retrievePromotionCodeForPlan').resolves({
        active: true,
        coupon: {
          id: 'promo',
          duration: 'forever',
          valid: true,
        },
      });
      try {
        await stripeHelper.retrieveCouponDetails({
          country: 'US',
          priceId: 'planId',
          promotionCode: 'promo',
        });
      } catch (e) {
        assert.equal(e.errno, error.ERRNO.INVALID_PROMOTION_CODE);
      }
    });

    it('throw an error when retrievePromotionCodeForPlan returns no coupon', async () => {
      sandbox.stub(stripeHelper, 'retrievePromotionCodeForPlan').resolves();
      try {
        await stripeHelper.retrieveCouponDetails({
          country: 'US',
          priceId: 'planId',
          promotionCode: 'promo',
        });
      } catch (e) {
        assert.equal(e.errno, error.ERRNO.INVALID_PROMOTION_CODE);
      }
    });
  });

  describe('retrievePromotionCodeForPlan', () => {
    it('finds a stripe promotionCode object when a valid code is used', async () => {
      const promotionCode = { code: 'promo1', coupon: { valid: true } };
      sandbox
        .stub(stripeHelper.stripe.promotionCodes, 'list')
        .resolves({ data: [promotionCode] });
      sandbox.stub(stripeHelper, 'findPlanById').resolves({
        plan_metadata: {
          [STRIPE_PRICE_METADATA.PROMOTION_CODES]: 'promo1',
        },
      });

      const actual = await stripeHelper.retrievePromotionCodeForPlan(
        'promo1',
        'planId'
      );
      assert.deepEqual(actual, promotionCode);
    });

    it('returns undefined when an invalid promo code is used', async () => {
      const promotionCode = { code: 'promo1', coupon: { valid: true } };
      sandbox
        .stub(stripeHelper.stripe.promotionCodes, 'list')
        .resolves({ data: [promotionCode] });
      sandbox.stub(stripeHelper, 'findPlanById').resolves({
        plan_metadata: {
          [STRIPE_PRICE_METADATA.PROMOTION_CODES]: 'promo2',
        },
      });

      const actual = await stripeHelper.retrievePromotionCodeForPlan(
        'promo1',
        'planId'
      );
      assert.deepEqual(actual, undefined);
    });
  });

  describe('checkPromotionCodeForPlan', () => {
    it('finds a promo code for a given plan', async () => {
      const promotionCode = 'promo1';
      sandbox.stub(stripeHelper, 'findPlanById').resolves({
        plan_metadata: {
          [STRIPE_PRICE_METADATA.PROMOTION_CODES]: 'promo1',
        },
      });

      const actual = await stripeHelper.checkPromotionCodeForPlan(
        promotionCode,
        'planId'
      );
      assert.deepEqual(actual, true);
    });

    it('does not find a promo code for a given plan', async () => {
      const promotionCode = 'promo1';
      sandbox.stub(stripeHelper, 'findPlanById').resolves({
        plan_metadata: {
          [STRIPE_PRICE_METADATA.PROMOTION_CODES]: 'promo2',
        },
      });

      const actual = await stripeHelper.checkPromotionCodeForPlan(
        promotionCode,
        'planId'
      );
      assert.deepEqual(actual, false);
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
      sandbox.stub(stripeHelper, 'expandResource').resolves(unpaidInvoice);
      const actual = await stripeHelper.getInvoice(unpaidInvoice.id);
      assert.deepEqual(actual, unpaidInvoice);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.expandResource,
        unpaidInvoice.id,
        INVOICES_RESOURCE
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

  describe('updateInvoiceWithPaypalRefundTransactionId', () => {
    it('works successfully', async () => {
      sandbox.stub(stripeHelper.stripe.invoices, 'update').resolves({});
      const actual =
        await stripeHelper.updateInvoiceWithPaypalRefundTransactionId(
          unpaidInvoice,
          'tid'
        );
      assert.deepEqual(actual, {});
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.invoices.update,
        unpaidInvoice.id,
        {
          metadata: { paypalRefundTransactionId: 'tid' },
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

  describe('getEmailTypes', () => {
    it('returns empty array when no email was sent', () => {
      const actual = stripeHelper.getEmailTypes(unpaidInvoice);
      assert.deepEqual(actual, []);
    });

    it('returns the only email sent', () => {
      const emailSentInvoice = {
        ...unpaidInvoice,
        metadata: { [STRIPE_INVOICE_METADATA.EMAIL_SENT]: 'paymentFailed' },
      };
      const actual = stripeHelper.getEmailTypes(emailSentInvoice);
      assert.deepEqual(actual, ['paymentFailed']);
    });

    it('returns all types of emails sent', () => {
      const emailSentInvoice = {
        ...unpaidInvoice,
        metadata: { [STRIPE_INVOICE_METADATA.EMAIL_SENT]: 'paymentFailed:foo' },
      };
      const actual = stripeHelper.getEmailTypes(emailSentInvoice);
      assert.deepEqual(actual, ['paymentFailed', 'foo']);
    });
  });

  describe('updateEmailSent', () => {
    const emailSentInvoice = {
      ...unpaidInvoice,
      metadata: { [STRIPE_INVOICE_METADATA.EMAIL_SENT]: 'paymentFailed' },
    };

    it('returns undefined if email type already sent', async () => {
      const actual = await stripeHelper.updateEmailSent(
        emailSentInvoice,
        'paymentFailed'
      );
      assert.equal(actual, undefined);
    });

    it('returns invoice updated with new email type', async () => {
      const emailSendInvoice = deepCopy(unpaidInvoice);
      sandbox.stub(stripeHelper.stripe.invoices, 'update').resolves({});
      const actual = await stripeHelper.updateEmailSent(
        emailSendInvoice,
        'paymentFailed'
      );
      assert.deepEqual(actual, {});
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.invoices.update,
        emailSendInvoice.id,
        {
          metadata: emailSentInvoice.metadata,
        }
      );
    });

    it('returns invoice updated with another email type', async () => {
      const emailSendInvoice = deepCopy(emailSentInvoice);
      sandbox.stub(stripeHelper.stripe.invoices, 'update').resolves({});
      const actual = await stripeHelper.updateEmailSent(
        emailSendInvoice,
        'foo'
      );
      assert.deepEqual(actual, {});
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.invoices.update,
        emailSendInvoice.id,
        {
          metadata: {
            [STRIPE_INVOICE_METADATA.EMAIL_SENT]: 'paymentFailed:foo',
          },
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

  describe('updateCustomerBillingAddress', () => {
    it('updates Customer with empty PayPal billing address', async () => {
      sandbox
        .stub(stripeHelper.stripe.customers, 'update')
        .resolves({ metadata: {} });
      stripeFirestore.insertCustomerRecordWithBackfill = sandbox
        .stub()
        .resolves({});
      const result = await stripeHelper.updateCustomerBillingAddress(
        customer1.id,
        {
          city: 'city',
          country: 'US',
          line1: 'street address',
          line2: undefined,
          postalCode: '12345',
          state: 'CA',
        }
      );
      assert.deepEqual(result, { metadata: {} });
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.customers.update,
        customer1.id,
        {
          address: {
            city: 'city',
            country: 'US',
            line1: 'street address',
            line2: undefined,
            postal_code: '12345',
            state: 'CA',
          },
        }
      );
      sinon.assert.calledOnceWithExactly(
        stripeFirestore.insertCustomerRecordWithBackfill,
        undefined,
        { metadata: {} }
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
      stripeFirestore.insertCustomerRecordWithBackfill = sandbox
        .stub()
        .resolves({});
      await stripeHelper.updateCustomerPaypalAgreement(
        paypalCustomer,
        'test-1234'
      );
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.customers.update,
        paypalCustomer.id,
        { metadata: { paypalAgreementId: 'test-1234' } }
      );
      sinon.assert.calledOnceWithExactly(
        stripeFirestore.insertCustomerRecordWithBackfill,
        paypalCustomer.metadata.userid,
        {}
      );
    });
  });

  describe('removeCustomerPaypalAgreement', () => {
    it('removes billing agreement id', async () => {
      const paypalCustomer = deepCopy(customer1);
      sandbox.stub(stripeHelper.stripe.customers, 'update').resolves({});
      const now = new Date();
      const clock = sinon.useFakeTimers(now.getTime());

      sandbox.stub(dbStub, 'updatePayPalBA').returns(0);
      stripeFirestore.insertCustomerRecordWithBackfill = sandbox
        .stub()
        .resolves({});
      await stripeHelper.removeCustomerPaypalAgreement(
        'uid',
        paypalCustomer.id,
        'billingAgreementId'
      );

      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.customers.update,
        paypalCustomer.id,
        { metadata: { paypalAgreementId: null } }
      );
      sinon.assert.calledOnceWithExactly(
        dbStub.updatePayPalBA,
        'uid',
        'billingAgreementId',
        'Cancelled',
        clock.now
      );
      sinon.assert.calledOnceWithExactly(
        stripeFirestore.insertCustomerRecordWithBackfill,
        'uid',
        {}
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
      const invoice = deepCopy(invoicePaidSubscriptionCreate);
      invoice.subscription = { status: 'active' };
      const invoice2 = deepCopy(invoicePaidSubscriptionCreate);
      invoice2.subscription = { status: 'cancelled' };
      async function* genInvoice() {
        yield invoice;
        yield invoice2;
      }
      sandbox.stub(stripeHelper.stripe.invoices, 'list').returns(genInvoice());
      const actual = [];
      for await (const item of stripeHelper.fetchOpenInvoices(0)) {
        actual.push(item);
      }
      assert.deepEqual(actual, [invoice]);
      sinon.assert.calledOnceWithExactly(stripeHelper.stripe.invoices.list, {
        customer: undefined,
        limit: 100,
        collection_method: 'send_invoice',
        status: 'open',
        created: 0,
        expand: ['data.customer', 'data.subscription'],
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
      const result =
        stripeHelper.extractSourceCountryFromSubscription(subscription);
      assert.equal(result, 'US');
    });

    it('returns null with no invoice', () => {
      const result =
        stripeHelper.extractSourceCountryFromSubscription(subscription2);
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
      const result =
        stripeHelper.extractSourceCountryFromSubscription(subscription);
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

  describe('allTaxRates', () => {
    it('pulls a list of tax rates and caches it', async () => {
      assert.lengthOf(await stripeHelper.allTaxRates(), 2);
      assert(mockRedis.get.calledOnce);

      assert.lengthOf(await stripeHelper.allTaxRates(), 2);
      assert(mockRedis.get.calledTwice);
      assert(mockRedis.set.calledOnce);

      // Assert that a TTL was set for this cache entry
      assert.deepEqual(mockRedis.set.args[0][2], [
        'EX',
        mockConfig.subhub.stripeTaxRatesCacheTtlSeconds,
      ]);

      assert(stripeHelper.stripe.taxRates.list.calledOnce);

      assert.deepEqual(
        await stripeHelper.allTaxRates(),
        JSON.parse(await mockRedis.get('listStripeTaxRates'))
      );
    });
  });

  describe('updateAllTaxRates', () => {
    it('updates the tax rates in the cache', async () => {
      const newList = ['xyz'];
      await stripeHelper.updateAllTaxRates(newList);
      assert.deepEqual(mockRedis.set.args[0][2], [
        'EX',
        mockConfig.subhub.stripeTaxRatesCacheTtlSeconds,
      ]);
      assert.deepEqual(
        newList,
        JSON.parse(await mockRedis.get('listStripeTaxRates'))
      );
    });
  });

  describe('taxRateByCountryCode', () => {
    it('locates an existing tax rate', async () => {
      const result = await stripeHelper.taxRateByCountryCode('FR');
      assert.isDefined(result);
      assert.deepEqual(result, taxRateFr);
    });

    it('returns undefined for unknown tax rates', async () => {
      const result = await stripeHelper.taxRateByCountryCode('GA');
      assert.isUndefined(result);
    });

    it('ignores case on comparison', async () => {
      const result = await stripeHelper.taxRateByCountryCode('fr');
      assert.isDefined(result);
      assert.deepEqual(result, taxRateFr);
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
        JSON.parse(await mockRedis.get('listStripePlans'))
      );
    });
  });

  describe('updateAllPlans', () => {
    it('updates the plans in the cache', async () => {
      const newList = ['xyz'];
      await stripeHelper.updateAllPlans(newList);
      assert.deepEqual(mockRedis.set.args[0][2], [
        'EX',
        mockConfig.subhub.plansCacheTtlSeconds,
      ]);
      assert.deepEqual(
        newList,
        JSON.parse(await mockRedis.get('listStripePlans'))
      );
    });
  });

  describe('allAbbrevPlans', () => {
    it('returns a AbbrevPlan list based on allPlans', async () => {
      sandbox.spy(stripeHelper, 'allPlans');
      const actual = await stripeHelper.allAbbrevPlans();
      assert(stripeHelper.allPlans.calledOnce);
      assert(stripeHelper.stripe.plans.list.calledOnce);

      assert.deepEqual(
        actual,
        [plan1, plan2, plan3].map((p) => ({
          amount: p.amount,
          currency: p.currency,
          interval_count: p.interval_count,
          interval: p.interval,
          plan_id: p.id,
          plan_metadata: p.metadata,
          plan_name: p.nickname || '',
          product_id: p.product.id,
          product_metadata: p.product.metadata,
          product_name: p.product.name,
        }))
      );
    });
  });

  describe('fetchProductById', () => {
    const productId = 'prod_00000000000000';
    const productName = 'Example Product';
    const mockProduct = {
      id: productId,
      name: productName,
      metadata: {
        'product:termsOfServiceURL':
          'https://www.mozilla.org/about/legal/terms/firefox-private-network',
        'product:privacyNoticeURL':
          'https://www.mozilla.org/privacy/firefox-private-network',
      },
    };
    beforeEach(() => {
      sandbox.stub(stripeHelper, 'allProducts').resolves([mockProduct]);
    });

    it('returns undefined if the product is not in allProducts', async () => {
      const actual = await stripeHelper.fetchProductById('invalidId');
      assert.isUndefined(actual);
    });

    it('returns a product of the correct id', async () => {
      const actual = await stripeHelper.fetchProductById(productId);
      assert.deepEqual(mockProduct, actual);
    });
  });

  describe('fetchAllPlans', () => {
    it('only returns valid plans', async () => {
      const validProductMetadata = plan1.product.metadata;

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

      const planInvalidProductMetadata = {
        id: 'plan_invalidproductmetadata',
        object: 'plan',
        product: {
          metadata: Object.assign({}, validProductMetadata, {
            'product:privacyNoticeDownloadURL': 'https://example.com',
          }),
        },
      };

      const goodPlan = deepCopy(plan1);
      goodPlan.product = deepCopy(product1);

      const planList = [
        planMissingProduct,
        planUnloadedProduct,
        planDeletedProduct,
        planInvalidProductMetadata,
        goodPlan,
      ];

      listStripePlans.restore();
      sandbox.stub(stripeHelper.stripe.plans, 'list').returns(planList);

      const actual = await stripeHelper.fetchAllPlans();

      /** Assert that only the "good" plan was returned */
      assert.deepEqual(actual, [goodPlan]);

      /** Verify the error cases were handled properly */
      assert.equal(stripeHelper.log.error.callCount, 4);

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

      /** Plan.product has invalid metadata */
      assert.isTrue(
        stripeHelper.log.error
          .getCall(3)
          .args[0].includes(
            `fetchAllPlans: ${planInvalidProductMetadata.id} metadata invalid:`
          )
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
        JSON.parse(await mockRedis.get('listStripeProducts'))
      );
    });
  });

  describe('updateAllProducts', () => {
    it('updates the products in the cache', async () => {
      const newList = ['x'];
      await stripeHelper.updateAllProducts(newList);
      assert.deepEqual(mockRedis.set.args[0][2], [
        'EX',
        mockConfig.subhub.plansCacheTtlSeconds,
      ]);
      assert.deepEqual(
        newList,
        JSON.parse(await mockRedis.get('listStripeProducts'))
      );
    });
  });

  describe('allAbbrevProducts', () => {
    it('returns a AbbrevProduct list based on allProducts', async () => {
      sandbox.spy(stripeHelper, 'allProducts');
      const actual = await stripeHelper.allAbbrevProducts();
      assert(stripeHelper.stripe.products.list.calledOnce);
      assert(stripeHelper.allProducts.calledOnce);
      assert.deepEqual(
        actual,
        [product1, product2, product3].map((p) => ({
          product_id: p.id,
          product_name: p.name,
          product_metadata: p.metadata,
        }))
      );
    });
  });

  describe('verifyPlanUpdateForSubscription', () => {
    it('does nothing for a valid upgrade', async () => {
      assert.isUndefined(
        await stripeHelper.verifyPlanUpdateForSubscription(
          'plan_G93lTs8hfK7NNG',
          'plan_G93mMKnIFCjZek'
        )
      );
    });

    it('throws an invalidPlanUpdate when it is a downgrade', async () => {
      try {
        await stripeHelper.verifyPlanUpdateForSubscription(
          'plan_G93mMKnIFCjZek',
          'plan_G93lTs8hfK7NNG'
        );
        assert.fail('An invalidPlanUpdate should have been thrown.');
      } catch (e) {
        assert.equal(e.errno, error.ERRNO.INVALID_PLAN_UPDATE);
      }
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

  describe('updateSubscriptionAndBackfill', () => {
    it('updates and backfills', async () => {
      const subscription = deepCopy(subscription1);
      const updatedSubscription = deepCopy(subscription1);
      updatedSubscription.cancel_at_period_end = false;
      const newProps = {
        cancel_at_period_end: false,
      };
      sandbox
        .stub(stripeHelper.stripe.subscriptions, 'update')
        .resolves(updatedSubscription);

      stripeFirestore.insertSubscriptionRecordWithBackfill = sandbox
        .stub()
        .resolves();
      const actual = await stripeHelper.updateSubscriptionAndBackfill(
        subscription,
        newProps
      );
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.subscriptions.update,
        subscription.id,
        newProps
      );
      sinon.assert.calledOnceWithExactly(
        stripeFirestore.insertSubscriptionRecordWithBackfill,
        updatedSubscription
      );
      assert.deepEqual(actual, updatedSubscription);
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
        .stub(stripeHelper, 'updateSubscriptionAndBackfill')
        .resolves(subscription2);

      const actual = await stripeHelper.changeSubscriptionPlan(
        subscription,
        'plan_G93mMKnIFCjZek'
      );

      assert.deepEqual(actual, subscription2);
      sinon.assert.calledWithExactly(
        stripeHelper.updateSubscriptionAndBackfill,
        subscription,
        {
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
        }
      );
    });

    it('throws an error if the user already upgraded', async () => {
      sandbox
        .stub(stripeHelper, 'updateSubscriptionAndBackfill')
        .resolves(subscription2);
      let thrown;
      try {
        await stripeHelper.changeSubscriptionPlan(
          subscription2,
          'plan_G93mMKnIFCjZek'
        );
      } catch (err) {
        thrown = err;
      }
      assert.equal(thrown.errno, error.ERRNO.SUBSCRIPTION_ALREADY_CHANGED);
      sinon.assert.notCalled(stripeHelper.updateSubscriptionAndBackfill);
    });
  });

  describe('cancelSubscriptionForCustomer', () => {
    beforeEach(() => {
      sandbox.stub(stripeHelper, 'updateSubscriptionAndBackfill').resolves({});
    });

    describe('customer owns subscription', () => {
      it('calls subscription update', async () => {
        const existingMetadata = { foo: 'bar' };
        const unixTimestamp = moment().unix();
        const subscription = { ...subscription2, metadata: existingMetadata };
        sandbox.stub(moment, 'unix').returns(unixTimestamp);
        sandbox
          .stub(stripeHelper, 'subscriptionForCustomer')
          .resolves(subscription);

        await stripeHelper.cancelSubscriptionForCustomer(
          '123',
          'test@example.com',
          subscription2.id
        );
        sinon.assert.calledOnceWithExactly(
          stripeHelper.updateSubscriptionAndBackfill,
          subscription,
          {
            cancel_at_period_end: true,
            metadata: {
              ...existingMetadata,
              cancelled_for_customer_at: unixTimestamp,
            },
          }
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
              sinon.assert.notCalled(
                stripeHelper.updateSubscriptionAndBackfill
              );
            }
          );
      });
    });
  });

  describe('reactivateSubscriptionForCustomer', () => {
    describe('customer owns subscription', () => {
      describe('the intial subscription has a active status', () => {
        it('returns the updated subscription', async () => {
          const existingMetadata = { foo: 'bar' };
          const expected = {
            ...deepCopy(subscription2),
            metadata: existingMetadata,
          };
          sandbox
            .stub(stripeHelper, 'updateSubscriptionAndBackfill')
            .resolves(expected);
          sandbox
            .stub(stripeHelper, 'subscriptionForCustomer')
            .resolves(expected);

          const actual = await stripeHelper.reactivateSubscriptionForCustomer(
            '123',
            'test@example.com',
            expected.id
          );

          assert.deepEqual(actual, expected);
          sinon.assert.calledOnceWithExactly(
            stripeHelper.updateSubscriptionAndBackfill,
            expected,
            {
              cancel_at_period_end: false,
              metadata: {
                ...existingMetadata,
                cancelled_for_customer_at: '',
              },
            }
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
          sandbox
            .stub(stripeHelper, 'updateSubscriptionAndBackfill')
            .resolves(expected);

          const actual = await stripeHelper.reactivateSubscriptionForCustomer(
            '123',
            'test@example.com',
            expected.id
          );

          assert.deepEqual(actual, expected);
          sinon.assert.calledWithExactly(
            stripeHelper.updateSubscriptionAndBackfill,
            expected,
            {
              cancel_at_period_end: false,
              metadata: {
                cancelled_for_customer_at: '',
              },
            }
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
          sandbox
            .stub(stripeHelper, 'updateSubscriptionAndBackfill')
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
                sinon.assert.notCalled(
                  stripeHelper.updateSubscriptionAndBackfill
                );
              }
            );
        });
      });
    });

    describe('customer does not own the subscription', () => {
      it('throws an error', async () => {
        sandbox.stub(stripeHelper, 'subscriptionForCustomer').resolves();
        sandbox.stub(stripeHelper, 'updateSubscriptionAndBackfill').resolves();
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
              sinon.assert.notCalled(
                stripeHelper.updateSubscriptionAndBackfill
              );
            }
          );
      });
    });
  });

  describe('addTaxIdToCustomer', () => {
    it('updates stripe if theres a tax id for the currency', async () => {
      const customer = deepCopy(customer1);
      stripeHelper.taxIds = { EUR: 'EU1234' };
      sandbox.stub(stripeHelper.stripe.customers, 'update').resolves(customer);
      stripeFirestore.insertCustomerRecordWithBackfill = sandbox
        .stub()
        .resolves({});
      await stripeHelper.addTaxIdToCustomer(customer, 'eur');

      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.customers.update,
        customer.id,
        {
          invoice_settings: {
            custom_fields: [{ name: MOZILLA_TAX_ID, value: 'EU1234' }],
          },
        }
      );
      sinon.assert.calledOnceWithExactly(
        stripeFirestore.insertCustomerRecordWithBackfill,
        customer.metadata.userid,
        customer
      );
    });

    it('updates stripe if theres a tax id on the customer', async () => {
      const customer = deepCopy(customer1);
      stripeHelper.taxIds = { EUR: 'EU1234' };
      customer.currency = 'eur';
      sandbox.stub(stripeHelper.stripe.customers, 'update').resolves(customer);
      stripeFirestore.insertCustomerRecordWithBackfill = sandbox
        .stub()
        .resolves({});
      await stripeHelper.addTaxIdToCustomer(customer);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.customers.update,
        customer.id,
        {
          invoice_settings: {
            custom_fields: [{ name: MOZILLA_TAX_ID, value: 'EU1234' }],
          },
        }
      );
      sinon.assert.calledOnceWithExactly(
        stripeFirestore.insertCustomerRecordWithBackfill,
        customer.metadata.userid,
        customer
      );
    });

    it('does not update stripe with no tax id found', async () => {
      const customer = deepCopy(customer1);
      stripeHelper.taxIds = { EUR: 'EU1234' };
      sandbox.stub(stripeHelper.stripe.customers, 'update').resolves({});

      await stripeHelper.addTaxIdToCustomer(customer, 'usd');

      sinon.assert.notCalled(stripeHelper.stripe.customers.update);
    });
  });

  describe('customerTaxId', () => {
    it('returns a custom field if present with the tax id', () => {
      const customer = deepCopy(customer1);
      const field = { name: MOZILLA_TAX_ID, value: 'EU1234' };
      customer.invoice_settings = {
        custom_fields: [field],
      };
      const result = stripeHelper.customerTaxId(customer);
      assert.equal(result, field);
    });

    it('returns nothing if a mozilla tax field is not present', () => {
      const customer = deepCopy(customer1);
      const result = stripeHelper.customerTaxId(customer);
      assert.isUndefined(result);
    });
  });

  describe('fetchCustomer', () => {
    it('fetches an existing customer', async () => {
      sandbox.stub(stripeHelper, 'expandResource').returns(deepCopy(customer1));
      const result = await stripeHelper.fetchCustomer(existingCustomer.uid);
      assert.deepEqual(result, customer1);
    });

    it('throws if the customer record has a fxa id mismatch', async () => {
      sandbox.stub(stripeHelper, 'expandResource').returns(newCustomer);
      let thrown;
      try {
        await stripeHelper.fetchCustomer(existingCustomer.uid);
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
      sandbox.stub(stripeHelper, 'expandResource').returns(deletedCustomer);
      assert.isDefined(await getAccountCustomerByUid(existingCustomer.uid));
      await stripeHelper.fetchCustomer(
        existingCustomer.uid,
        'test@example.com'
      );

      assert.isTrue(stripeHelper.expandResource.calledOnce);
      assert.isUndefined(await getAccountCustomerByUid(existingCustomer.uid));

      // reset for tests:
      existingCustomer = await createAccountCustomer(existingUid, customer1.id);
    });
  });

  describe('removeCustomer', () => {
    let stripeCustomerDel;
    const email = 'test@example.com';

    beforeEach(() => {
      stripeCustomerDel = sandbox
        .stub(stripeHelper.stripe.customers, 'del')
        .resolves();
    });

    describe('when customer is found', () => {
      it('deletes customer in Stripe, removes AccountCustomer record, removes Cached record', async () => {
        const uid = chance.guid({ version: 4 }).replace(/-/g, '');
        const customerId = 'cus_1234456sdf';
        const testAccount = await createAccountCustomer(uid, customerId);
        await stripeHelper.removeCustomer(testAccount.uid, email);
        assert(stripeCustomerDel.calledOnce);
        assert((await getAccountCustomerByUid(uid)) === undefined);
      });
    });

    describe('when customer is not found', () => {
      it('does not throw any errors', async () => {
        const uid = chance.guid({ version: 4 }).replace(/-/g, '');
        await stripeHelper.removeCustomer(uid, email);
        assert(stripeCustomerDel.notCalled);
      });
    });

    describe('when accountCustomer record is not deleted', () => {
      it('logs an error', async () => {
        const uid = chance.guid({ version: 4 }).replace(/-/g, '');
        const customerId = 'cus_1234456sdf';
        const testAccount = await createAccountCustomer(uid, customerId);

        const deleteCustomer = sandbox
          .stub(dbStub, 'deleteAccountCustomer')
          .returns(0);

        await stripeHelper.removeCustomer(testAccount.uid, email);

        assert(deleteCustomer.calledOnce);
        assert(stripeHelper.log.error.calledOnce);
        assert.equal(
          `StripeHelper.removeCustomer failed to remove AccountCustomer record for uid ${uid}`,
          stripeHelper.log.error.getCall(0).args[0]
        );
      });
    });
  });

  describe('findActiveSubscriptionsByPlanId', () => {
    const argsHelper = [
      'plan_123',
      {
        gte: 123,
        lt: 456,
      },
      25,
    ];
    const argsStripe = {
      price: 'plan_123',
      current_period_end: {
        gte: 123,
        lt: 456,
      },
      limit: 25,
      expand: ['data.customer'],
    };
    it('calls Stripe with the correct arguments and iteratively returns active subscriptions', async () => {
      const subscription3 = deepCopy(subscription2);
      subscription3.status = 'cancelled';
      async function* genSubscription() {
        yield subscription1;
        yield subscription2;
        yield subscription3;
      }
      sandbox
        .stub(stripeHelper.stripe.subscriptions, 'list')
        .returns(genSubscription());
      const actual = [];
      for await (const item of stripeHelper.findActiveSubscriptionsByPlanId(
        ...argsHelper
      )) {
        actual.push(item);
      }
      assert.deepEqual(actual, [subscription1, subscription2]);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.subscriptions.list,
        argsStripe
      );
    });
    it('does not return an active subscription marked as cancel_at_period_end', async () => {
      const subscription3 = deepCopy(subscription2);
      subscription3.cancel_at_period_end = 456;
      async function* genSubscription() {
        yield subscription1;
        yield subscription2;
        yield subscription3;
      }
      sandbox
        .stub(stripeHelper.stripe.subscriptions, 'list')
        .returns(genSubscription());
      const actual = [];
      for await (const item of stripeHelper.findActiveSubscriptionsByPlanId(
        ...argsHelper
      )) {
        actual.push(item);
      }
      assert.deepEqual(actual, [subscription1, subscription2]);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.subscriptions.list,
        argsStripe
      );
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
            _subscription_type: MozillaSubscriptionTypes.WEB,
            created: pastDueSubscription.created,
            current_period_end: pastDueSubscription.current_period_end,
            current_period_start: pastDueSubscription.current_period_start,
            cancel_at_period_end: false,
            end_at: null,
            plan_id: pastDueSubscription.plan.id,
            product_id: product1.id,
            product_name: productName,
            status: 'past_due',
            subscription_id: pastDueSubscription.id,
            failure_code: failedChargeCopy.failure_code,
            failure_message: failedChargeCopy.failure_message,
            latest_invoice: invoice.number,
            promotion_code: null,
          },
        ];

        beforeEach(() => {
          sandbox
            .stub(stripeHelper.stripe.charges, 'retrieve')
            .resolves(failedChargeCopy);
        });

        describe('when the charge is already expanded', () => {
          it('includes charge failure information with the subscription data', async () => {
            sandbox
              .stub(stripeHelper, 'expandResource')
              .resolves({ id: productId, name: productName });
            invoice.charge = failedChargeCopy;
            subscription.latest_invoice = invoice;
            subscription.plan.product = product1.id;

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
            sandbox
              .stub(stripeHelper, 'expandResource')
              .resolves({ id: productId, name: productName });

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
            const callback = sandbox.stub(stripeHelper, 'expandResource');
            callback.onCall(0).resolves(paidInvoice);
            callback.onCall(1).resolves({ id: productId, name: productName });
            const expected = [
              {
                _subscription_type: MozillaSubscriptionTypes.WEB,
                created: subscription1.created,
                current_period_end: subscription1.current_period_end,
                current_period_start: subscription1.current_period_start,
                cancel_at_period_end: false,
                end_at: null,
                plan_id: subscription1.plan.id,
                product_id: product1.id,
                product_name: productName,
                status: 'active',
                subscription_id: subscription1.id,
                failure_code: undefined,
                failure_message: undefined,
                latest_invoice: paidInvoice.number,
                promotion_code: null,
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
            const callback = sandbox.stub(stripeHelper, 'expandResource');
            callback.onCall(0).resolves(paidInvoice);
            callback.onCall(1).resolves({ id: productId, name: productName });
            const expected = [
              {
                _subscription_type: MozillaSubscriptionTypes.WEB,
                created: subscription.created,
                current_period_end: subscription.current_period_end,
                current_period_start: subscription.current_period_start,
                cancel_at_period_end: true,
                end_at: null,
                plan_id: subscription.plan.id,
                product_id: product1.id,
                product_name: productName,
                status: 'active',
                subscription_id: subscription.id,
                failure_code: undefined,
                failure_message: undefined,
                latest_invoice: paidInvoice.number,
                promotion_code: null,
              },
            ];

            const actual = await stripeHelper.subscriptionsToResponse(input);
            assert.deepEqual(actual, expected);
          });
        });

        describe('when the subscription has already ended', () => {
          it('set end_at to the last active day of the subscription', async () => {
            const sub = deepCopy(cancelledSubscription);
            sub.plan.product = product1.id;
            const input = { data: [sub] };
            sandbox
              .stub(stripeHelper.stripe.invoices, 'retrieve')
              .resolves(paidInvoice);
            const callback = sandbox.stub(stripeHelper, 'expandResource');
            callback.onCall(0).resolves(paidInvoice);
            callback.onCall(1).resolves({ id: productId, name: productName });
            const expected = [
              {
                _subscription_type: MozillaSubscriptionTypes.WEB,
                created: cancelledSubscription.created,
                current_period_end: cancelledSubscription.current_period_end,
                current_period_start:
                  cancelledSubscription.current_period_start,
                cancel_at_period_end: false,
                end_at: cancelledSubscription.ended_at,
                plan_id: cancelledSubscription.plan.id,
                product_id: product1.id,
                product_name: product1.name,
                status: 'canceled',
                subscription_id: cancelledSubscription.id,
                failure_code: undefined,
                failure_message: undefined,
                latest_invoice: paidInvoice.number,
                promotion_code: null,
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

        sandbox.stub(stripeHelper, 'expandResource').resolves(paidInvoice);

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

    describe('when a subscription has a promotion code', () => {
      it('includes the promotion code value in the returned value', async () => {
        const subscription = deepCopy(subscription1);
        subscription.metadata = {
          ...subscription.metadata,
          appliedPromotionCode: 'jortssentme',
        };
        const input = { data: [subscription] };
        sandbox
          .stub(stripeHelper.stripe.invoices, 'retrieve')
          .resolves(paidInvoice);
        const callback = sandbox.stub(stripeHelper, 'expandResource');
        callback.onCall(0).resolves(paidInvoice);
        callback.onCall(1).resolves({ id: productId, name: productName });
        const expected = [
          {
            _subscription_type: MozillaSubscriptionTypes.WEB,
            created: subscription1.created,
            current_period_end: subscription1.current_period_end,
            current_period_start: subscription1.current_period_start,
            cancel_at_period_end: false,
            end_at: null,
            plan_id: subscription1.plan.id,
            product_id: product1.id,
            product_name: productName,
            status: 'active',
            subscription_id: subscription1.id,
            failure_code: undefined,
            failure_message: undefined,
            latest_invoice: paidInvoice.number,
            promotion_code: 'jortssentme',
          },
        ];

        const actual = await stripeHelper.subscriptionsToResponse(input);
        assert.deepEqual(actual, expected);
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
      created: 1590018018,
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

    let sandbox,
      mockCustomer,
      mockStripe,
      mockAllAbbrevProducts,
      mockAllAbbrevPlans,
      expandMock;

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
              items: {
                data: [{ plan: planId }],
              },
            },
          ],
        },
      };

      mockAllAbbrevProducts = [
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
      mockAllAbbrevPlans = [
        { ...mockPlan, plan_id: planId, product_id: productId },
      ];
      sandbox
        .stub(stripeHelper, 'allAbbrevProducts')
        .resolves(mockAllAbbrevProducts);
      sandbox.stub(stripeHelper, 'allAbbrevPlans').resolves(mockAllAbbrevPlans);

      expandMock = sandbox.stub(stripeHelper, 'expandResource');

      mockStripe = Object.entries({
        plans: mockPlan,
        products: mockProduct,
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
      const fixture = { ...invoicePaidSubscriptionCreate };
      fixture.lines.data[0] = {
        ...fixture.lines.data[0],
        plan: {
          id: planId,
          nickname: planName,
          product: productId,
          metadata: mockPlan.metadata,
        },
      };

      const fixtureDiscount = { ...invoicePaidSubscriptionCreateDiscount };
      fixtureDiscount.lines.data[0] = {
        ...fixtureDiscount.lines.data[0],
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
        invoiceLink:
          'https://pay.stripe.com/invoice/acct_1GCAr3BVqmGyQTMa/invst_GyHjTyIXBg8jj5yjt7Z0T4CCG3hfGtp',
        invoiceNumber: 'AAF2CECC-0001',
        invoiceTotalCurrency: 'usd',
        invoiceTotalInCents: 500,
        invoiceSubtotalInCents: 500,
        invoiceDiscountAmountInCents: null,
        invoiceDate: new Date('2020-03-24T22:23:40.000Z'),
        nextInvoiceDate: new Date('2020-04-24T22:23:40.000Z'),
        payment_provider: 'stripe',
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
        showPaymentMethod: true,
      };

      const expectedDiscount = {
        ...expected,
        invoiceNumber: '3432720C-0001',
        invoiceTotalInCents: 450,
        invoiceSubtotalInCents: 500,
        invoiceDiscountAmountInCents: 50,
      };

      beforeEach(() => {
        expandMock.onCall(0).resolves(mockCustomer);
        expandMock.onCall(1).resolves(mockCharge);
      });

      it('extracts expected details from an invoice that requires requests to expand', async () => {
        const result = await stripeHelper.extractInvoiceDetailsForEmail(
          fixture
        );
        assert.isTrue(stripeHelper.allAbbrevProducts.called);
        assert.isFalse(mockStripe.products.retrieve.called);
        sinon.assert.calledTwice(expandMock);
        assert.deepEqual(result, expected);
      });

      it('extracts expected details from an invoice when product is missing from cache', async () => {
        mockAllAbbrevProducts[0].product_id = 'nope';
        const result = await stripeHelper.extractInvoiceDetailsForEmail(
          fixture
        );
        assert.isTrue(stripeHelper.allAbbrevProducts.called);
        assert.isTrue(mockStripe.products.retrieve.called);
        sinon.assert.calledTwice(expandMock);
        assert.deepEqual(result, expected);
      });

      it('extracts expected details from an expanded invoice', async () => {
        const fixture = deepCopy(invoicePaidSubscriptionCreate);
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
        assert.isTrue(stripeHelper.allAbbrevProducts.called);
        assert.isFalse(mockStripe.products.retrieve.called);
        sinon.assert.calledTwice(expandMock);
        assert.deepEqual(result, expected);
      });

      it('does not throw an exception when details on a payment method are missing', async () => {
        const fixture = deepCopy(invoicePaidSubscriptionCreate);
        fixture.lines.data[0].plan = {
          id: planId,
          nickname: planName,
          metadata: mockPlan.metadata,
          product: mockProduct,
        };
        fixture.customer = mockCustomer;
        fixture.charge = null;
        expandMock.onCall(1).resolves(null);
        const result = await stripeHelper.extractInvoiceDetailsForEmail(
          fixture
        );
        assert.isTrue(stripeHelper.allAbbrevProducts.called);
        assert.isFalse(mockStripe.products.retrieve.called);
        sinon.assert.calledTwice(expandMock);
        assert.deepEqual(result, {
          ...expected,
          lastFour: null,
          cardType: null,
        });
      });

      it('extracts expected details from an invoice with discount', async () => {
        const result = await stripeHelper.extractInvoiceDetailsForEmail(
          fixtureDiscount
        );
        assert.isTrue(stripeHelper.allAbbrevProducts.called);
        assert.isFalse(mockStripe.products.retrieve.called);
        sinon.assert.calledTwice(expandMock);
        assert.deepEqual(result, expectedDiscount);
      });

      it('extracts expected details from an invoice with 100% discount', async () => {
        const fixtureDiscount100 = fixtureDiscount;
        fixtureDiscount100.total = 0;
        fixtureDiscount100.total_discount_amounts[0].amount = 500;
        const expectedDiscount100 = {
          ...expectedDiscount,
          invoiceDiscountAmountInCents: 500,
          invoiceTotalInCents: 0,
          showPaymentMethod: false,
        };
        const result = await stripeHelper.extractInvoiceDetailsForEmail(
          fixtureDiscount100
        );
        assert.isTrue(stripeHelper.allAbbrevProducts.called);
        assert.isFalse(mockStripe.products.retrieve.called);
        sinon.assert.calledTwice(expandMock);
        assert.deepEqual(result, expectedDiscount100);
      });

      it('throws an exception for deleted customer', async () => {
        expandMock.onCall(0).resolves({ ...mockCustomer, deleted: true });

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
        assert.isFalse(stripeHelper.allAbbrevProducts.called);
        assert.isFalse(mockStripe.products.retrieve.called);
        sinon.assert.calledOnce(expandMock);
      });

      it('throws an exception for deleted product', async () => {
        mockAllAbbrevProducts[0].product_id = 'nope';
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
        assert.isTrue(stripeHelper.allAbbrevProducts.called);
        sinon.assert.calledTwice(expandMock);
      });

      it('throws an exception with unexpected data', async () => {
        const fixture = {
          ...invoicePaidSubscriptionCreate,
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

      beforeEach(() => {
        expandMock.onCall(0).resolves(mockCustomer);
        expandMock.onCall(1).resolves(mockPlan);
      });

      it('extracts expected details from a source that requires requests to expand', async () => {
        const result = await stripeHelper.extractSourceDetailsForEmail(fixture);
        assert.isTrue(stripeHelper.allAbbrevProducts.called);
        assert.isFalse(mockStripe.products.retrieve.called);
        assert.deepEqual(result, expected);
        sinon.assert.calledTwice(expandMock);
      });

      it('throws an exception for deleted customer', async () => {
        expandMock.onCall(0).resolves({ ...mockCustomer, deleted: true });
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
        sinon.assert.calledOnce(expandMock);
        assert.isFalse(stripeHelper.allAbbrevProducts.called);
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
      productPaymentCycleNew:
        eventCustomerSubscriptionUpdated.data.object.plan.interval,
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
        expandMock.onCall(0).resolves(mockCustomer);
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
        const result =
          await stripeHelper.extractSubscriptionUpdateEventDetailsForEmail(
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
        const result =
          await stripeHelper.extractSubscriptionUpdateEventDetailsForEmail(
            event
          );
        assert.equal(result, mockReactivationDetails);
        assertOnlyExpectedHelperCalledWith(
          'extractSubscriptionUpdateReactivationDetailsForEmail',
          event.data.object,
          expectedBaseUpdateDetails
        );
      });

      it('calls the expected helper method for upgrade or downgrade', async () => {
        const event = deepCopy(eventCustomerSubscriptionUpdated);
        event.data.object.cancel_at_period_end = false;
        event.data.previous_attributes.cancel_at_period_end = false;
        const result =
          await stripeHelper.extractSubscriptionUpdateEventDetailsForEmail(
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
        const result =
          await stripeHelper.extractSubscriptionUpdateEventDetailsForEmail(
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

        mockAllAbbrevProducts.push(
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
        mockAllAbbrevPlans.unshift(
          {
            ...event.data.previous_attributes.plan,
            plan_id: event.data.previous_attributes.plan.id,
            product_id: productIdOld,
          },
          {
            ...event.data.object.plan,
            plan_id: event.data.object.plan.id,
            product_id: productIdNew,
          }
        );

        event.data.object.plan.metadata.productOrder = isUpgrade ? 2 : 1;
        event.data.previous_attributes.plan.metadata.productOrder = isUpgrade
          ? 1
          : 2;

        const result =
          await stripeHelper.extractSubscriptionUpdateUpgradeDowngradeDetailsForEmail(
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
            SUBSCRIPTION_UPDATE_TYPES[isUpgrade ? 'UPGRADE' : 'DOWNGRADE'],
          productIdOld,
          productNameOld,
          productIconURLOld,
          productDownloadURLOld,
          productPaymentCycleOld: event.data.previous_attributes.plan.interval,
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

      it('checks productPaymentCycleOld returns a value if it is not included in the old plan', async () => {
        const event = deepCopy(eventCustomerSubscriptionUpdated);

        // if the interval of old and new plans are the same,
        // the old plan's previous_attributes object may not include interval value.
        event.data.previous_attributes.interval = undefined;

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

        mockAllAbbrevProducts.push(
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

        mockAllAbbrevPlans.unshift(
          {
            ...event.data.previous_attributes.plan,
            plan_id: event.data.previous_attributes.plan.id,
            product_id: productIdOld,
          },
          {
            ...event.data.object.plan,
            plan_id: event.data.object.plan.id,
            product_id: productIdNew,
          }
        );

        const result =
          await stripeHelper.extractSubscriptionUpdateUpgradeDowngradeDetailsForEmail(
            event.data.object,
            baseDetails,
            mockInvoice,
            mockCustomer,
            event.data.object.plan.metadata.productOrder,
            event.data.previous_attributes.plan
          );

        assert.equal(
          result.productPaymentCycleOld,
          result.productPaymentCycleNew
        );
      });
    });

    describe('extractSubscriptionUpdateReactivationDetailsForEmail', () => {
      const { card } = mockCharge.payment_method_details;
      const defaultExpected = {
        updateType: SUBSCRIPTION_UPDATE_TYPES.REACTIVATION,
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
              country: 'US',
            },
            billing_details: {
              address: {
                postal_code: '99999',
              },
            },
          },
        },
      };

      beforeEach(() => {
        expandMock.onCall(0).returns(mockCharge.payment_method_details);
      });

      it('extracts expected details for a subscription reactivation', async () => {
        const event = deepCopy(eventCustomerSubscriptionUpdated);
        sandbox.stub(stripeHelper, 'fetchCustomer').resolves(mockCustomer);
        const result =
          await stripeHelper.extractSubscriptionUpdateReactivationDetailsForEmail(
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
        sandbox.stub(stripeHelper, 'fetchCustomer').resolves(customer);
        const result =
          await stripeHelper.extractSubscriptionUpdateReactivationDetailsForEmail(
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

    describe('extractCustomerDefaultPaymentDetailsByUid', () => {
      it('fetches the customer and calls extractCustomerDefaultPaymentDetails', async () => {
        const paymentDetails = {
          lastFour: '4242',
          cardType: 'Moz',
          country: 'GD',
          postalCode: '99999',
        };
        sandbox.stub(stripeHelper, 'fetchCustomer').resolves(customer1);
        sandbox
          .stub(stripeHelper, 'extractCustomerDefaultPaymentDetails')
          .resolves(paymentDetails);
        const actual =
          await stripeHelper.extractCustomerDefaultPaymentDetailsByUid(uid);
        assert.deepEqual(actual, paymentDetails);
        sinon.assert.calledOnceWithExactly(stripeHelper.fetchCustomer, uid, [
          'invoice_settings.default_payment_method',
        ]);
        sinon.assert.calledOnceWithExactly(
          stripeHelper.extractCustomerDefaultPaymentDetails,
          customer1
        );
      });

      it('throws for a deleted customer', async () => {
        sandbox.stub(stripeHelper, 'fetchCustomer').resolves(null);
        let thrown;
        try {
          await stripeHelper.extractCustomerDefaultPaymentDetailsByUid(uid);
        } catch (err) {
          thrown = err;
        }
        assert.equal(thrown.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER);
      });
    });

    describe('extractCustomerDefaultPaymentDetails', () => {
      const mockPaymentMethod = {
        card: {
          last4: '4321',
          brand: 'MasterCard',
          country: 'US',
        },
        billing_details: {
          address: {
            postal_code: '99999',
          },
        },
      };

      const mockSource = {
        id: sourceId,
        last4: '0987',
        brand: 'Visa',
        country: 'US',
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

      beforeEach(() => {
        expandMock.onCall(0).returns(mockPaymentMethod);
      });

      it('extracts from default payment method first when available', async () => {
        const result = await stripeHelper.extractCustomerDefaultPaymentDetails(
          mockCustomer
        );
        assert.deepEqual(result, {
          lastFour: mockPaymentMethod.card.last4,
          cardType: mockPaymentMethod.card.brand,
          country: mockPaymentMethod.card.country,
          postalCode: mockPaymentMethod.billing_details.address.postal_code,
        });
      });

      it('does not include the postal code when address is not available in payment method', async () => {
        const customer = deepCopy(mockCustomer);
        delete customer.invoice_settings.default_payment_method.billing_details
          .address;
        const result = await stripeHelper.extractCustomerDefaultPaymentDetails(
          customer
        );
        assert.deepEqual(result, {
          lastFour: mockPaymentMethod.card.last4,
          cardType: mockPaymentMethod.card.brand,
          country: mockPaymentMethod.card.country,
          postalCode: null,
        });
      });

      it('extracts from default source when available', async () => {
        expandMock.onCall(0).resolves(mockPaymentMethod);
        const customer = deepCopy(mockCustomer);
        customer.invoice_settings.default_payment_method = null;
        const result = await stripeHelper.extractCustomerDefaultPaymentDetails(
          customer
        );
        assert.deepEqual(result, {
          lastFour: mockPaymentMethod.card.last4,
          cardType: mockPaymentMethod.card.brand,
          country: mockPaymentMethod.card.country,
          postalCode: mockPaymentMethod.billing_details.address.postal_code,
        });
      });

      it('does not include the postal code when address is not available in source', async () => {
        const noAddressPaymentMethod = deepCopy(mockPaymentMethod);
        delete noAddressPaymentMethod.billing_details.address;
        expandMock.onCall(0).resolves(noAddressPaymentMethod);
        const customer = deepCopy(mockCustomer);
        customer.invoice_settings.default_payment_method = null;
        const result = await stripeHelper.extractCustomerDefaultPaymentDetails(
          customer
        );
        assert.deepEqual(result, {
          lastFour: mockPaymentMethod.card.last4,
          cardType: mockPaymentMethod.card.brand,
          country: mockPaymentMethod.card.country,
          postalCode: null,
        });
      });

      it('returns undefined details when neither default payment method nor source is available', async () => {
        const customer = deepCopy(mockCustomer);
        customer.invoice_settings.default_payment_method = null;
        customer.default_source = null;
        const result = await stripeHelper.extractCustomerDefaultPaymentDetails(
          customer
        );
        assert.deepEqual(result, {
          lastFour: null,
          cardType: null,
          country: null,
          postalCode: null,
        });
      });
    });

    describe('extractSubscriptionUpdateCancellationDetailsForEmail', () => {
      it('extracts expected details for a subscription cancellation', async () => {
        const event = deepCopy(eventCustomerSubscriptionUpdated);
        const result =
          await stripeHelper.extractSubscriptionUpdateCancellationDetailsForEmail(
            event.data.object,
            expectedBaseUpdateDetails,
            mockInvoice
          );
        const subscription = event.data.object;
        assert.deepEqual(result, {
          updateType: SUBSCRIPTION_UPDATE_TYPES.CANCELLATION,
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

  describe('expandResource', () => {
    let customer;

    beforeEach(() => {
      customer = deepCopy(customer1);
    });

    it('expands the customer', async () => {
      stripeFirestore.retrieveAndFetchCustomer = sandbox
        .stub()
        .resolves(deepCopy(customer));
      stripeFirestore.retrieveCustomerSubscriptions = sandbox
        .stub()
        .resolves(deepCopy(customer.subscriptions.data));
      const result = await stripeHelper.expandResource(
        customer.id,
        CUSTOMER_RESOURCE
      );
      // Note that top level will mismatch because subscriptions is copied
      // without the object type.
      assert.deepEqual(result.subscriptions.data, customer.subscriptions.data);
      assert.hasAllKeys(result, customer);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripeFirestore.retrieveAndFetchCustomer,
        customer.id
      );
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripeFirestore.retrieveCustomerSubscriptions,
        customer.id
      );
    });

    it('includes the empty subscriptions list on the expanded customer', async () => {
      stripeFirestore.retrieveAndFetchCustomer = sandbox
        .stub()
        .resolves(deepCopy(customer));
      stripeFirestore.retrieveCustomerSubscriptions = sandbox
        .stub()
        .resolves([]);
      const result = await stripeHelper.expandResource(
        customer.id,
        CUSTOMER_RESOURCE
      );
      assert.deepEqual(result.subscriptions.data, []);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripeFirestore.retrieveAndFetchCustomer,
        customer.id
      );
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripeFirestore.retrieveCustomerSubscriptions,
        customer.id
      );
    });

    it('expands the subscription', async () => {
      stripeFirestore.retrieveAndFetchSubscription = sandbox
        .stub()
        .resolves(deepCopy(subscription1));
      const result = await stripeHelper.expandResource(
        subscription1.id,
        SUBSCRIPTIONS_RESOURCE
      );
      assert.deepEqual(result, subscription1);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripeFirestore.retrieveAndFetchSubscription,
        subscription1.id
      );
    });

    it('expands the invoice', async () => {
      stripeFirestore.retrieveInvoice = sandbox
        .stub()
        .resolves(invoicePaidSubscriptionCreate);
      const result = await stripeHelper.expandResource(
        invoicePaidSubscriptionCreate.id,
        INVOICES_RESOURCE
      );
      assert.deepEqual(result, invoicePaidSubscriptionCreate);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripeFirestore.retrieveInvoice,
        invoicePaidSubscriptionCreate.id
      );
    });

    it('expands invoice when invoice isnt found and inserts it', async () => {
      stripeFirestore.retrieveInvoice = sandbox
        .stub()
        .rejects(
          newFirestoreStripeError(
            'not found',
            FirestoreStripeError.FIRESTORE_INVOICE_NOT_FOUND
          )
        );
      stripeFirestore.retrieveAndFetchCustomer = sandbox
        .stub()
        .resolves(customer);
      stripeHelper.stripe.invoices.retrieve = sandbox
        .stub()
        .resolves(deepCopy(invoicePaidSubscriptionCreate));
      stripeFirestore.insertInvoiceRecord = sandbox.stub().resolves({});

      const result = await stripeHelper.expandResource(
        invoicePaidSubscriptionCreate.id,
        INVOICES_RESOURCE
      );
      assert.deepEqual(result, invoicePaidSubscriptionCreate);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripeFirestore.retrieveInvoice,
        invoicePaidSubscriptionCreate.id
      );
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripeFirestore.retrieveAndFetchCustomer,
        invoicePaidSubscriptionCreate.customer
      );
    });
  });

  describe('processWebhookEventToFirestore', () => {
    let stripeFirestore;

    beforeEach(() => {
      stripeHelper.stripeFirestore = stripeFirestore = {};
    });

    it('handles invoice operations with firestore invoice', async () => {
      const event = deepCopy(eventInvoiceCreated);
      stripeFirestore.retrieveAndFetchSubscription = sandbox
        .stub()
        .resolves({});
      stripeHelper.stripe.invoices.retrieve = sandbox
        .stub()
        .resolves(invoicePaidSubscriptionCreate);
      stripeFirestore.retrieveInvoice = sandbox.stub().resolves({});
      stripeFirestore.insertInvoiceRecord = sandbox.stub().resolves({});
      const result = await stripeHelper.processWebhookEventToFirestore(event);
      assert.isTrue(result);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripeFirestore.insertInvoiceRecord,
        invoicePaidSubscriptionCreate
      );
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.invoices.retrieve,
        event.data.object.id
      );
      sinon.assert.notCalled(stripeFirestore.retrieveInvoice);
    });

    it('handles invoice operations with no firestore invoice', async () => {
      const event = deepCopy(eventInvoiceCreated);
      stripeFirestore.retrieveAndFetchSubscription = sandbox
        .stub()
        .resolves({});
      const insertStub = sandbox.stub();
      stripeHelper.stripe.invoices.retrieve = sandbox
        .stub()
        .resolves(invoicePaidSubscriptionCreate);
      stripeFirestore.insertInvoiceRecord = insertStub;
      insertStub
        .onCall(0)
        .rejects(
          newFirestoreStripeError(
            'no invoice',
            FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND
          )
        );
      insertStub.onCall(1).resolves({});
      const result = await stripeHelper.processWebhookEventToFirestore(event);
      assert.isTrue(result);
      sinon.assert.calledTwice(
        stripeHelper.stripeFirestore.insertInvoiceRecord
      );
      sinon.assert.calledWithExactly(
        stripeHelper.stripeFirestore.insertInvoiceRecord.getCall(0),
        invoicePaidSubscriptionCreate
      );
      sinon.assert.calledWithExactly(
        stripeHelper.stripeFirestore.insertInvoiceRecord.getCall(1),
        invoicePaidSubscriptionCreate
      );
      sinon.assert.calledOnceWithExactly(
        stripeFirestore.retrieveAndFetchSubscription,
        invoicePaidSubscriptionCreate.subscription
      );
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.invoices.retrieve,
        event.data.object.id
      );
    });

    for (const type of [
      'customer.created',
      'customer.updated',
      'customer.deleted',
    ]) {
      it(`handles ${type} operations`, async () => {
        const event = deepCopy(eventCustomerUpdated);
        event.type = type;
        event.request = null;
        stripeFirestore.insertCustomerRecordWithBackfill = sandbox
          .stub()
          .resolves({});
        stripeHelper.stripe.customers.retrieve = sandbox
          .stub()
          .resolves(newCustomer);
        dbStub.getUidAndEmailByStripeCustomerId.resolves({
          uid: newCustomer.metadata.userid,
        });
        await stripeHelper.processWebhookEventToFirestore(event);
        sinon.assert.calledOnceWithExactly(
          stripeHelper.stripeFirestore.insertCustomerRecordWithBackfill,
          newCustomer.metadata.userid,
          newCustomer
        );
        sinon.assert.calledOnceWithExactly(
          stripeHelper.stripe.customers.retrieve,
          event.data.object.id
        );
      });
    }

    for (const type of [
      'customer.subscription.created',
      'customer.subscription.updated',
    ]) {
      it(`handles ${type} operations`, async () => {
        const event = deepCopy(eventSubscriptionUpdated);
        event.type = type;
        delete event.data.previous_attributes;
        stripeHelper.stripe.subscriptions.retrieve = sandbox
          .stub()
          .resolves(subscription1);
        stripeFirestore.retrieveSubscription = sandbox.stub().resolves({});
        stripeFirestore.insertSubscriptionRecordWithBackfill = sandbox
          .stub()
          .resolves({});
        await stripeHelper.processWebhookEventToFirestore(event);
        sinon.assert.calledOnceWithExactly(
          stripeHelper.stripeFirestore.insertSubscriptionRecordWithBackfill,
          subscription1
        );
        sinon.assert.calledOnceWithExactly(
          stripeHelper.stripe.subscriptions.retrieve,
          event.data.object.id
        );
      });
    }

    for (const type of [
      'payment_method.attached',
      'payment_method.card_automatically_updated',
      'payment_method.updated',
    ]) {
      it(`handles ${type} operations`, async () => {
        const event = deepCopy(eventPaymentMethodAttached);
        event.type = type;
        delete event.data.previous_attributes;
        stripeHelper.stripe.paymentMethods.retrieve = sandbox
          .stub()
          .resolves(paymentMethodAttach);
        stripeFirestore.retrievePaymentMethod = sandbox.stub().resolves({});
        stripeFirestore.insertPaymentMethodRecordWithBackfill = sandbox
          .stub()
          .resolves({});
        await stripeHelper.processWebhookEventToFirestore(event);
        sinon.assert.calledOnceWithExactly(
          stripeHelper.stripeFirestore.insertPaymentMethodRecordWithBackfill,
          paymentMethodAttach
        );
        sinon.assert.calledOnceWithExactly(
          stripeHelper.stripe.paymentMethods.retrieve,
          event.data.object.id
        );
      });

      it(`ignores ${type} operations with no customer attached`, async () => {
        const event = deepCopy(eventPaymentMethodAttached);
        event.type = type;
        event.data.object.customer = null;
        delete event.data.previous_attributes;
        stripeHelper.stripe.paymentMethods.retrieve = sandbox.stub();
        stripeFirestore.retrievePaymentMethod = sandbox.stub().resolves({});
        stripeFirestore.insertPaymentMethodRecordWithBackfill = sandbox.stub();
        await stripeHelper.processWebhookEventToFirestore(event);
        sinon.assert.notCalled(
          stripeHelper.stripeFirestore.insertPaymentMethodRecordWithBackfill
        );
        sinon.assert.notCalled(stripeHelper.stripe.paymentMethods.retrieve);
      });
    }

    it('handles payment_method.detached operations', async () => {
      const event = deepCopy(eventPaymentMethodDetached);
      stripeFirestore.removePaymentMethodRecord = sandbox.stub().resolves({});
      await stripeHelper.processWebhookEventToFirestore(event);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripeFirestore.removePaymentMethodRecord,
        event.data.object.id
      );
    });

    it('ignores the deleted customer error when handling a payment method update event', async () => {
      const event = deepCopy(eventPaymentMethodAttached);
      event.type = 'payment_method.card_automatically_updated';
      stripeHelper.stripe.paymentMethods.retrieve = sandbox
        .stub()
        .resolves(event.data.object);
      stripeFirestore.insertPaymentMethodRecordWithBackfill = sandbox
        .stub()
        .throws(
          newFirestoreStripeError(
            'Customer deleted.',
            FirestoreStripeError.STRIPE_CUSTOMER_DELETED
          )
        );
      await stripeHelper.processWebhookEventToFirestore(event);
      sinon.assert.calledOnceWithExactly(
        stripeFirestore.insertPaymentMethodRecordWithBackfill,
        event.data.object
      );
    });

    it('does not handle wibble events', async () => {
      const event = deepCopy(eventSubscriptionUpdated);
      event.type = 'wibble';
      const result = await stripeHelper.processWebhookEventToFirestore(event);
      assert.isFalse(result);
    });
  });

  describe('getBillingDetailsAndSubscriptions', () => {
    const customer = { id: 'cus_xyz' };
    const billingDetails = { payment_provider: 'paypal' };
    const billingAgreementId = 'ba-123';

    beforeEach(() => {
      sandbox.stub(stripeHelper, 'fetchCustomer').resolves(customer);
      sandbox
        .stub(stripeHelper, 'extractBillingDetails')
        .returns(billingDetails);
      sandbox
        .stub(stripeHelper, 'getCustomerPaypalAgreement')
        .returns(billingAgreementId);
      sandbox
        .stub(stripeHelper, 'hasSubscriptionRequiringPaymentMethod')
        .returns(true);
      sandbox.stub(stripeHelper, 'hasOpenInvoice').returns(true);
    });

    it('returns null when no customer is found', async () => {
      stripeHelper.fetchCustomer.restore();
      sandbox.stub(stripeHelper, 'fetchCustomer').resolves(undefined);

      const actual = await stripeHelper.getBillingDetailsAndSubscriptions(
        'uid'
      );

      assert.equal(actual, null);
      sinon.assert.calledOnceWithExactly(stripeHelper.fetchCustomer, 'uid', [
        'invoice_settings.default_payment_method',
      ]);
    });

    it('includes the customer Stripe billing details', async () => {
      const billingDetails = { payment_provider: 'stripe' };
      stripeHelper.extractBillingDetails.restore();
      sandbox
        .stub(stripeHelper, 'extractBillingDetails')
        .returns(billingDetails);

      const actual = await stripeHelper.getBillingDetailsAndSubscriptions(
        'uid'
      );

      assert.deepEqual(actual, {
        customerId: customer.id,
        subscriptions: [],
        ...billingDetails,
      });
      sinon.assert.calledOnceWithExactly(
        stripeHelper.extractBillingDetails,
        customer
      );
    });

    it('includes the customer PayPal billing details', async () => {
      stripeHelper.hasSubscriptionRequiringPaymentMethod.restore();
      sandbox
        .stub(stripeHelper, 'hasSubscriptionRequiringPaymentMethod')
        .returns(false);

      const actual = await stripeHelper.getBillingDetailsAndSubscriptions(
        'uid'
      );

      assert.deepEqual(actual, {
        customerId: customer.id,
        subscriptions: [],
        billing_agreement_id: billingAgreementId,
        ...billingDetails,
      });
      sinon.assert.calledOnceWithExactly(
        stripeHelper.getCustomerPaypalAgreement,
        customer
      );
      sinon.assert.calledOnceWithExactly(
        stripeHelper.hasSubscriptionRequiringPaymentMethod,
        customer
      );
    });

    it('includes the missing billing agreement error state', async () => {
      stripeHelper.getCustomerPaypalAgreement.restore();
      sandbox.stub(stripeHelper, 'getCustomerPaypalAgreement').returns(null);

      const actual = await stripeHelper.getBillingDetailsAndSubscriptions(
        'uid'
      );

      assert.deepEqual(actual, {
        customerId: customer.id,
        subscriptions: [],
        billing_agreement_id: null,
        paypal_payment_error: PAYPAL_PAYMENT_ERROR_MISSING_AGREEMENT,
        ...billingDetails,
      });
    });

    it('includes the funding source error state', async () => {
      const actual = await stripeHelper.getBillingDetailsAndSubscriptions(
        'uid'
      );

      assert.deepEqual(actual, {
        customerId: customer.id,
        subscriptions: [],
        billing_agreement_id: null,
        paypal_payment_error: PAYPAL_PAYMENT_ERROR_FUNDING_SOURCE,
        ...billingDetails,
      });
      sinon.assert.calledOnceWithExactly(stripeHelper.hasOpenInvoice, customer);
    });

    it('includes a list of subscriptions', async () => {
      const subscriptions = { data: [{ id: 'sub_testo', status: 'active' }] };
      stripeHelper.fetchCustomer.restore();
      sandbox
        .stub(stripeHelper, 'fetchCustomer')
        .resolves({ ...customer, subscriptions });
      sandbox
        .stub(stripeHelper, 'subscriptionsToResponse')
        .resolves(subscriptions);

      const actual = await stripeHelper.getBillingDetailsAndSubscriptions(
        'uid'
      );
      assert.deepEqual(actual, {
        customerId: customer.id,
        subscriptions,
        billing_agreement_id: billingAgreementId,
        ...billingDetails,
      });
      sinon.assert.calledOnceWithExactly(
        stripeHelper.subscriptionsToResponse,
        subscriptions
      );
    });

    it('filters out canceled subscriptions', async () => {
      const subscriptions = {
        data: [
          { id: 'sub_testo', status: 'active' },
          { id: 'sub_testo', status: 'canceled' },
        ],
      };
      stripeHelper.fetchCustomer.restore();
      sandbox
        .stub(stripeHelper, 'fetchCustomer')
        .resolves({ ...customer, subscriptions });
      sandbox
        .stub(stripeHelper, 'subscriptionsToResponse')
        .resolves(subscriptions);

      await stripeHelper.getBillingDetailsAndSubscriptions('uid');
      sinon.assert.calledOnceWithExactly(
        stripeHelper.subscriptionsToResponse,
        {
          data: [{ id: 'sub_testo', status: 'active' }],
        } // no canceled subs passed here
      );
    });
  });

  describe('extractBillingDetails', () => {
    const paymentProvider = { payment_provider: 'stripe' };
    const card = {
      brand: 'visa',
      exp_month: 8,
      exp_year: 2022,
      funding: 'credit',
      last4: '4242',
    };
    const invoice_settings = {
      default_payment_method: {
        billing_details: {
          name: 'Testo McTestson',
        },
        card,
      },
    };
    const source = { name: 'Testo McTestson', object: 'card', ...card };

    beforeEach(() => {
      sandbox.stub(stripeHelper, 'getPaymentProvider').returns('stripe');
    });

    it('returns the correct payment provider', () => {
      const customer = { id: 'cus_xyz', invoice_settings: {} };
      const actual = stripeHelper.extractBillingDetails(customer);

      assert.deepEqual(actual, paymentProvider);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.getPaymentProvider,
        customer
      );
    });

    it('returns the card details from the default payment method', () => {
      const customer = {
        id: 'cus_xyz',
        invoice_settings,
      };

      const actual = stripeHelper.extractBillingDetails(customer);

      assert.deepEqual(actual, {
        ...paymentProvider,
        billing_name:
          customer.invoice_settings.default_payment_method.billing_details.name,
        payment_type:
          customer.invoice_settings.default_payment_method.card.funding,
        last4: customer.invoice_settings.default_payment_method.card.last4,
        exp_month:
          customer.invoice_settings.default_payment_method.card.exp_month,
        exp_year:
          customer.invoice_settings.default_payment_method.card.exp_year,
        brand: customer.invoice_settings.default_payment_method.card.brand,
      });
      sinon.assert.calledOnceWithExactly(
        stripeHelper.getPaymentProvider,
        customer
      );
    });

    it('returns the card details from the payment source', () => {
      const customer = {
        id: 'cus_xyz',
        invoice_settings: {
          default_payment_method: {},
        },
        sources: { data: [source] },
      };

      const actual = stripeHelper.extractBillingDetails(customer);

      assert.deepEqual(actual, {
        ...paymentProvider,
        billing_name: customer.sources.data[0].name,
        payment_type: customer.sources.data[0].funding,
        last4: customer.sources.data[0].last4,
        exp_month: customer.sources.data[0].exp_month,
        exp_year: customer.sources.data[0].exp_year,
        brand: customer.sources.data[0].brand,
      });
      sinon.assert.calledOnceWithExactly(
        stripeHelper.getPaymentProvider,
        customer
      );
    });
  });

  describe('setCustomerLocation', () => {
    const err = new Error('testo');
    const expectedAddressArg = {
      line1: '',
      line2: '',
      city: '',
      state: 'ABD',
      country: 'GD',
      postalCode: '99999',
    };
    let sentryScope;

    beforeEach(() => {
      sentryScope = { setContext: sandbox.stub() };
      sandbox.stub(Sentry, 'withScope').callsFake((cb) => cb(sentryScope));
      sandbox.stub(Sentry, 'captureMessage');
      sandbox.stub(Sentry, 'captureException');
    });

    it('updates the Stripe customer address', async () => {
      sandbox.stub(stripeHelper, 'updateCustomerBillingAddress').resolves();
      const result = await stripeHelper.setCustomerLocation({
        customerId: customer1.id,
        postalCode: expectedAddressArg.postalCode,
        country: expectedAddressArg.country,
      });
      assert.isTrue(result);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.googleMapsService.getStateFromZip,
        '99999',
        'GD'
      );
      sinon.assert.calledOnceWithExactly(
        stripeHelper.updateCustomerBillingAddress,
        customer1.id,
        expectedAddressArg
      );
    });

    it('fails when an error is thrown by Google Maps service', async () => {
      sandbox.stub(stripeHelper, 'updateCustomerBillingAddress').resolves();
      mockGoogleMapsService.getStateFromZip = sandbox.stub().rejects(err);
      const result = await stripeHelper.setCustomerLocation({
        customerId: customer1.id,
        postalCode: expectedAddressArg.postalCode,
        country: expectedAddressArg.country,
      });
      assert.isFalse(result);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.googleMapsService.getStateFromZip,
        '99999',
        'GD'
      );
      sinon.assert.notCalled(stripeHelper.updateCustomerBillingAddress);
      sinon.assert.calledOnce(Sentry.withScope);
      sinon.assert.calledOnceWithExactly(
        sentryScope.setContext,
        'setCustomerLocation',
        {
          customer: { id: customer1.id },
          postalCode: expectedAddressArg.postalCode,
          country: expectedAddressArg.country,
        }
      );
      sinon.assert.calledOnceWithExactly(Sentry.captureException, err);
    });

    it('fails when an error is thrown while updating the customer address', async () => {
      sandbox.stub(stripeHelper, 'updateCustomerBillingAddress').rejects(err);
      const result = await stripeHelper.setCustomerLocation({
        customerId: customer1.id,
        postalCode: expectedAddressArg.postalCode,
        country: expectedAddressArg.country,
      });
      assert.isFalse(result);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.googleMapsService.getStateFromZip,
        '99999',
        'GD'
      );
      sinon.assert.calledOnceWithExactly(
        stripeHelper.updateCustomerBillingAddress,
        customer1.id,
        expectedAddressArg
      );
      sinon.assert.calledOnce(Sentry.withScope);
      sinon.assert.calledOnceWithExactly(
        sentryScope.setContext,
        'setCustomerLocation',
        {
          customer: { id: customer1.id },
          postalCode: expectedAddressArg.postalCode,
          country: expectedAddressArg.country,
        }
      );
      sinon.assert.calledOnceWithExactly(Sentry.captureException, err);
    });
  });

  describe('Google Play helpers', () => {
    let subPurchase;
    let productId;
    let priceId;
    let productName;
    let mockPrice;
    let mockAllAbbrevPlans;

    beforeEach(() => {
      productId = 'prod_test';
      priceId = 'price_test';
      productName = 'testProduct';
      mockPrice = {
        plan_id: priceId,
        plan_metadata: {
          [STRIPE_PRICE_METADATA.PLAY_SKU_IDS]: 'testSku,testSku2',
        },
        product_id: productId,
        product_name: productName,
        product_metadata: {},
      };
      mockAllAbbrevPlans = [
        mockPrice,
        {
          plan_id: 'wrong_price_id',
          product_id: 'wrongProduct',
          product_name: 'Wrong Product',
          plan_metadata: {},
          product_metadata: {},
        },
      ];
      sandbox.stub(stripeHelper, 'allAbbrevPlans').resolves(mockAllAbbrevPlans);
    });

    describe('priceToPlaySkus', () => {
      it('formats skus from price metadata, including transforming them to lowercase', () => {
        const result = stripeHelper.priceToPlaySkus(mockPrice);
        assert.deepEqual(result, ['testsku', 'testsku2']);
      });

      it('handles empty price metadata skus', () => {
        const price = {
          ...mockPrice,
          plan_metadata: {},
        };
        const result = stripeHelper.priceToPlaySkus(price);
        assert.deepEqual(result, []);
      });
    });

    describe('purchasesToPriceIds', () => {
      beforeEach(() => {
        const apiResponse = {
          kind: 'androidpublisher#subscriptionPurchase',
          startTimeMillis: `${Date.now() - 10000}`, // some time in the past
          expiryTimeMillis: `${Date.now() + 10000}`, // some time in the future
          autoRenewing: true,
          priceCurrencyCode: 'JPY',
          priceAmountMicros: '99000000',
          countryCode: 'JP',
          developerPayload: '',
          paymentState: 1,
          orderId: 'GPA.3313-5503-3858-32549',
        };

        subPurchase = SubscriptionPurchase.fromApiResponse(
          apiResponse,
          'testPackage',
          'testToken',
          'testSku',
          Date.now()
        );
      });

      it('returns price ids for the subscription purchase', async () => {
        const result = await stripeHelper.purchasesToPriceIds([subPurchase]);
        assert.deepEqual(result, [priceId]);
        sinon.assert.calledOnce(stripeHelper.allAbbrevPlans);
      });

      it('returns no price ids for unknown subscription purchase', async () => {
        subPurchase.sku = 'wrongSku';
        const result = await stripeHelper.purchasesToPriceIds([subPurchase]);
        assert.deepEqual(result, []);
        sinon.assert.calledOnce(stripeHelper.allAbbrevPlans);
      });
    });

    describe('addPriceInfoToAbbrevPlayPurchases', () => {
      let mockAbbrevPlayPurchase;

      beforeEach(() => {
        mockAbbrevPlayPurchase = {
          auto_renewing: true,
          expiry_time_millis: Date.now(),
          package_name: 'org.mozilla.cooking.with.foxkeh',
          sku: 'testSku',
        };
      });

      it('adds matching product info to a subscription purchase', async () => {
        const expected = {
          ...mockAbbrevPlayPurchase,
          price_id: priceId,
          product_id: productId,
          product_name: productName,
        };
        const result = await stripeHelper.addPriceInfoToAbbrevPlayPurchases([
          mockAbbrevPlayPurchase,
        ]);
        assert.deepEqual([expected], result);
      });
      it('returns an empty list if no matching product ids are found', async () => {
        const mockAbbrevPlayPurchase1 = {
          ...mockAbbrevPlayPurchase,
          sku: 'notMatchingSku',
        };
        const result = await stripeHelper.addPriceInfoToAbbrevPlayPurchases([
          mockAbbrevPlayPurchase1,
        ]);
        assert.isEmpty(result);
      });
    });
  });
});
