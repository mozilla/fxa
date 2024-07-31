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
  MozillaSubscriptionTypes,
  PAYPAL_PAYMENT_ERROR_FUNDING_SOURCE,
  PAYPAL_PAYMENT_ERROR_MISSING_AGREEMENT,
} = require('../../../../fxa-shared/subscriptions/types');
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
const {
  generateIdempotencyKey,
  roundTime,
} = require('../../../lib/payments/utils');
const {
  stripeInvoiceToLatestInvoiceItemsDTO,
} = require('../../../lib/payments/stripe-formatter');
const {
  ProductConfigurationManager,
  PurchaseWithDetailsOfferingContentTransformedFactory,
  PurchaseDetailsTransformedFactory,
} = require('@fxa/shared/cms');

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
const subscriptionPMIExpandedIncompleteCVCFail = require('./fixtures/stripe/subscription_pmi_expanded_incomplete_cvc_fail.json');
const cancelledSubscription = require('./fixtures/stripe/subscription_cancelled.json');
const pastDueSubscription = require('./fixtures/stripe/subscription_past_due.json');
const subscriptionCouponOnce = require('./fixtures/stripe/subscription_coupon_once.json');
const subscriptionCouponForever = require('./fixtures/stripe/subscription_coupon_forever.json');
const subscriptionCouponRepeating = require('./fixtures/stripe/subscription_coupon_repeating.json');
const paidInvoice = require('./fixtures/stripe/invoice_paid.json');
const unpaidInvoice = require('./fixtures/stripe/invoice_open.json');
const invoiceRetry = require('./fixtures/stripe/invoice_retry.json');
const successfulPaymentIntent = require('./fixtures/stripe/paymentIntent_succeeded.json');
const unsuccessfulPaymentIntent = require('./fixtures/stripe/paymentIntent_requires_payment_method.json');
const paymentMethodAttach = require('./fixtures/stripe/payment_method_attach.json');
const failedCharge = require('./fixtures/stripe/charge_failed.json');
const invoicePaidSubscriptionCreate = require('./fixtures/stripe/invoice_paid_subscription_create.json');
const invoicePaidSubscriptionCreateDiscount = require('./fixtures/stripe/invoice_paid_subscription_create_discount.json');
const invoicePaidSubscriptionCreateTaxDiscount = require('./fixtures/stripe/invoice_paid_subscription_create_tax_discount.json');
const invoiceDraftProrationRefund = require('./fixtures/stripe/invoice_draft_proration_refund.json');
const invoicePaidSubscriptionCreateTax = require('./fixtures/stripe/invoice_paid_subscription_create_tax.json');
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

// App Store Server API response fixtures
const appStoreApiResponse = require('./fixtures/apple-app-store/api_response_subscription_status.json');
const renewalInfo = require('./fixtures/apple-app-store/decoded_renewal_info.json');
const transactionInfo = require('./fixtures/apple-app-store/decoded_transaction_info.json');

const {
  createAccountCustomer,
  getAccountCustomerByUid,
} = require('fxa-shared/db/models/auth');
const {
  AppStoreSubscriptionPurchase,
} = require('../../../lib/payments/iap/apple-app-store/subscription-purchase');
const {
  PlayStoreSubscriptionPurchase,
} = require('../../../lib/payments/iap/google-play/subscription-purchase');
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
  StripeFirestoreMultiError,
} = require('../../../lib/payments/stripe-firestore');
const AppError = require('../../../lib/error');

const mockConfig = {
  authFirestore: {
    prefix: 'fxa-auth-',
  },
  publicUrl: 'https://accounts.example.com',
  subscriptions: {
    cacheTtlSeconds: 10,
    productConfigsFirestore: { enabled: true },
    stripeApiKey: 'blah',
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
  cms: {
    enabled: false,
  },
};

const mockRedisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || '',
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
    info() {
      return 'mock\nredis';
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
  mock.options = {};
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

const mockConfigCollection = (configDocs) => ({
  get: () => ({ docs: configDocs.map((c) => ({ id: c.id, data: () => c })) }),
  onSnapshot: () => {},
});

describe('#integration - StripeHelper', () => {
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
      collection: sandbox.stub().callsFake((arg) => {
        if (arg.endsWith('products')) {
          return mockConfigCollection([
            { id: 'doc1', stripeProductId: product1.id },
            { id: 'doc2', stripeProductId: product2.id },
            { id: 'doc3', stripeProductId: product3.id },
          ]);
        }
        if (arg.endsWith('plans')) {
          return mockConfigCollection([
            {
              id: 'doc1',
              productConfigId: 'doc1',
              stripePriceId: plan1.id,
            },
            {
              id: 'doc2',
              productConfigId: 'doc2',
              stripePriceId: plan2.id,
            },
          ]);
        }

        return {};
      }),
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
      const actual = await stripeHelper.createPlainCustomer({
        uid,
        email: 'joe@example.com',
        displayName: 'Joe Cool',
        idempotencyKey: uuidv4(),
      });
      assert.deepEqual(actual, expected);
      sinon.assert.calledWithExactly(
        stripeHelper.stripeFirestore.insertCustomerRecord,
        uid,
        expected
      );
    });

    it('creates a customer using the stripe api with a shipping address', async () => {
      const expected = deepCopy(newCustomerPM);
      sandbox.stub(stripeHelper.stripe.customers, 'create').resolves(expected);
      stripeFirestore.insertCustomerRecord = sandbox.stub().resolves({});
      const uid = chance.guid({ version: 4 }).replace(/-/g, '');
      const idempotencyKey = uuidv4();
      const actual = await stripeHelper.createPlainCustomer({
        uid,
        email: 'joe@example.com',
        displayName: 'Joe Cool',
        idempotencyKey,
        taxAddress: {
          countryCode: 'US',
          postalCode: '92841',
        },
      });
      assert.deepEqual(actual, expected);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.customers.create,
        {
          email: 'joe@example.com',
          name: 'Joe Cool',
          description: uid,
          metadata: {
            userid: uid,
            geoip_date: sinon.match.any,
          },
          shipping: {
            name: sinon.match.any,
            address: {
              country: 'US',
              postal_code: '92841',
            },
          },
        },
        { idempotencyKey }
      );
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
        .createPlainCustomer({
          uid: 'uid',
          email: 'joe@example.com',
          displayName: 'Joe Cool',
          idempotencyKey: uuidv4(),
        })
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

  describe('getLatestInvoicesForActiveSubscriptions', () => {
    let customerExpanded;
    let invoice;
    let subscription;

    beforeEach(() => {
      customerExpanded = deepCopy(customer1);
      invoice = deepCopy(paidInvoice);
      subscription = deepCopy(subscription2);
      customerExpanded.subscriptions.data[0] = subscription;
      sandbox.stub(stripeHelper, 'expandResource').resolves(invoice);
    });

    it('returns latest invoices for any active subscriptions', async () => {
      const expected = [invoice];
      const actual = await stripeHelper.getLatestInvoicesForActiveSubscriptions(
        customerExpanded
      );
      assert.deepEqual(actual, expected);
    });

    it('returns [] if there are no active subscriptions', async () => {
      subscription.status = 'incomplete';
      const expected = [];
      const actual = await stripeHelper.getLatestInvoicesForActiveSubscriptions(
        customerExpanded
      );
      assert.deepEqual(actual, expected);
    });

    it('returns [] if no invoices are found', async () => {
      subscription.latest_invoice = null;
      const expected = [];
      const actual = await stripeHelper.getLatestInvoicesForActiveSubscriptions(
        customerExpanded
      );
      assert.deepEqual(actual, expected);
    });
  });

  describe('hasOpenInvoiceWithPaymentAttempts', async () => {
    let customerExpanded;
    let invoice;

    beforeEach(() => {
      invoice = deepCopy(paidInvoice);
      customerExpanded = deepCopy(customer1);
    });

    it('returns true if any open invoices are found with payment attempts', async () => {
      const openInvoice = deepCopy(invoice);
      openInvoice.status = 'open';
      openInvoice.metadata.paymentAttempts = 1;
      sandbox
        .stub(stripeHelper, 'getLatestInvoicesForActiveSubscriptions')
        .resolves([invoice, openInvoice]);
      assert.isTrue(
        await stripeHelper.hasOpenInvoiceWithPaymentAttempts(customerExpanded)
      );
      sinon.assert.calledOnceWithExactly(
        stripeHelper.getLatestInvoicesForActiveSubscriptions,
        customerExpanded
      );
    });

    it('returns false for open invoices with no payment attempts', async () => {
      const openInvoice = deepCopy(invoice);
      openInvoice.status = 'open';
      openInvoice.metadata.paymentAttempts = 0;
      sandbox
        .stub(stripeHelper, 'getLatestInvoicesForActiveSubscriptions')
        .resolves([invoice]);
      assert.isFalse(
        await stripeHelper.hasOpenInvoiceWithPaymentAttempts(customerExpanded)
      );
    });

    it('returns false for open invoices with no payment attempts and paid invoices with payment attempts', async () => {
      const openInvoice = deepCopy(invoice);
      openInvoice.status = 'open';
      openInvoice.metadata.paymentAttempts = 0;
      invoice.metadata.paymentAttempts = 1;
      sandbox
        .stub(stripeHelper, 'getLatestInvoicesForActiveSubscriptions')
        .resolves([invoice, openInvoice]);
      assert.isFalse(
        await stripeHelper.hasOpenInvoiceWithPaymentAttempts(customerExpanded)
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
    it('checks that roundTime() returns time rounded to the nearest minute', async () => {
      const mockDate = new Date('2023-01-03T17:44:44.400Z');
      const res = roundTime(mockDate);
      const actualTime = '27879464.74';
      const roundedTime = '27879465';

      assert.deepEqual(res, roundedTime);
      assert.notEqual(res, actualTime);
    });

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
      stripeFirestore.insertCustomerRecordWithBackfill = sandbox
        .stub()
        .resolves({});
      stripeFirestore.insertSubscriptionRecordWithBackfill = sandbox
        .stub()
        .resolves({});
      stripeFirestore.insertPaymentMethodRecord = sandbox.stub().resolves({});
      const expectedIdempotencyKey = generateIdempotencyKey([
        'customerId',
        'priceId',
        attachExpected.card.fingerprint,
        roundTime(),
      ]);

      const actual = await stripeHelper.createSubscriptionWithPMI({
        customerId: 'customerId',
        priceId: 'priceId',
        paymentMethodId: 'pm_1H0FRp2eZvKYlo2CeIZoc0wj',
        automaticTax: true,
      });

      assert.deepEqual(actual, subscriptionPMIExpanded);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.subscriptions.create,
        {
          customer: 'customerId',
          items: [{ price: 'priceId' }],
          expand: ['latest_invoice.payment_intent.latest_charge'],
          promotion_code: undefined,
          automatic_tax: {
            enabled: true,
          },
        },
        { idempotencyKey: `ssc-${expectedIdempotencyKey}` }
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
      stripeFirestore.insertCustomerRecordWithBackfill = sandbox
        .stub()
        .resolves({});
      stripeFirestore.insertSubscriptionRecordWithBackfill = sandbox
        .stub()
        .resolves({});
      stripeFirestore.insertPaymentMethodRecord = sandbox.stub().resolves({});
      const expectedIdempotencyKey = generateIdempotencyKey([
        'customerId',
        'priceId',
        attachExpected.card.fingerprint,
        roundTime(),
      ]);

      const actual = await stripeHelper.createSubscriptionWithPMI({
        customerId: 'customerId',
        priceId: 'priceId',
        paymentMethodId: 'pm_1H0FRp2eZvKYlo2CeIZoc0wj',
        promotionCode,
        automaticTax: false,
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
          expand: ['latest_invoice.payment_intent.latest_charge'],
          promotion_code: promotionCode.id,
          automatic_tax: {
            enabled: false,
          },
        },
        { idempotencyKey: `ssc-${expectedIdempotencyKey}` }
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

    it('errors and deletes subscription when a cvc check fails on subscription creation', async () => {
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
        .resolves(subscriptionPMIExpandedIncompleteCVCFail);
      sandbox.stub(stripeHelper, 'cancelSubscription').resolves({});
      stripeFirestore.insertCustomerRecordWithBackfill = sandbox
        .stub()
        .resolves({});
      stripeFirestore.insertSubscriptionRecordWithBackfill = sandbox
        .stub()
        .resolves({});
      stripeFirestore.insertPaymentMethodRecord = sandbox.stub().resolves({});
      const expectedIdempotencyKey = generateIdempotencyKey([
        'customerId',
        'priceId',
        attachExpected.card.fingerprint,
        roundTime(),
      ]);

      try {
        await stripeHelper.createSubscriptionWithPMI({
          customerId: 'customerId',
          priceId: 'priceId',
          paymentMethodId: 'pm_1H0FRp2eZvKYlo2CeIZoc0wj',
          automaticTax: true,
        });
        sinon.assert.fail();
      } catch (err) {
        assert.equal(
          err.errno,
          error.ERRNO.REJECTED_SUBSCRIPTION_PAYMENT_TOKEN
        );
      }
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.subscriptions.create,
        {
          customer: 'customerId',
          items: [{ price: 'priceId' }],
          expand: ['latest_invoice.payment_intent.latest_charge'],
          promotion_code: undefined,
          automatic_tax: {
            enabled: true,
          },
        },
        { idempotencyKey: `ssc-${expectedIdempotencyKey}` }
      );
      sinon.assert.calledOnceWithExactly(
        stripeHelper.cancelSubscription,
        subscriptionPMIExpandedIncompleteCVCFail.id
      );
      sinon.assert.notCalled(
        stripeFirestore.insertSubscriptionRecordWithBackfill
      );
      sinon.assert.callCount(mockStatsd.increment, 1);
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
        automaticTax: true,
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
          automatic_tax: {
            enabled: true,
          },
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
        promotionCode,
        automaticTax: false,
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
          automatic_tax: {
            enabled: false,
          },
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
      sandbox.stub(stripeHelper.stripe.subscriptions, 'cancel').resolves({});
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
        stripeHelper.stripe.subscriptions.cancel,
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

  describe('getInvoiceWithDiscount', () => {
    it('returns an invoice with discounts expanded', async () => {
      const invoice = { id: 'invoiceId' };
      sandbox.stub(stripeHelper.stripe.invoices, 'retrieve').resolves(invoice);
      const actual = await stripeHelper.getInvoiceWithDiscount('invoiceId');
      assert.deepEqual(actual, invoice);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.invoices.retrieve,
        invoice.id,
        { expand: ['discounts'] }
      );
    });
  });

  describe('findValidPromoCode', () => {
    it('finds a valid promotionCode with plan metadata', async () => {
      const promotionCode = { code: 'promo1', coupon: { valid: true } };
      sandbox
        .stub(stripeHelper.stripe.promotionCodes, 'list')
        .resolves({ data: [promotionCode] });
      sandbox.stub(stripeHelper, 'findAbbrevPlanById').resolves({
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
      sinon.assert.calledOnceWithExactly(
        stripeHelper.findAbbrevPlanById,
        'planId'
      );
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
      sandbox.stub(stripeHelper, 'findAbbrevPlanById').resolves({
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
      sinon.assert.notCalled(stripeHelper.findAbbrevPlanById);
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
      sandbox.stub(stripeHelper, 'findAbbrevPlanById').resolves({
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
      sinon.assert.calledOnceWithExactly(
        stripeHelper.findAbbrevPlanById,
        'planId'
      );
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
      sandbox.stub(stripeHelper, 'findAbbrevPlanById').resolves({
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
      sinon.assert.notCalled(stripeHelper.findAbbrevPlanById);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.promotionCodes.list,
        {
          active: true,
          code: 'promo1',
        }
      );
    });
  });

  describe('validateCouponDurationForPlan', () => {
    const priceId = 'priceId';
    const promotionCode = 'promotionCode';
    const couponTemplate = {
      duration: 'repeating',
      duration_in_months: 3,
    };
    const planTemplate = {
      interval: 'month',
      interval_count: 1,
    };
    const couponDuration = 'repeating';
    const couponDurationInMonths = 3;
    const priceInterval = 'month';
    const priceIntervalCount = 1;
    let sentryScope;

    const setDefaultFindPlanById = () =>
      sandbox.stub(stripeHelper, 'findAbbrevPlanById').resolves(planTemplate);

    beforeEach(() => {
      sentryScope = { setContext: sandbox.stub() };
      sandbox.stub(Sentry, 'withScope').callsFake((cb) => cb(sentryScope));
      sandbox.stub(Sentry, 'captureException');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('coupon duration other than repeating', async () => {
      const expected = true;
      const coupon = {
        ...couponTemplate,
        duration: 'once',
      };
      setDefaultFindPlanById();
      const actual = await stripeHelper.validateCouponDurationForPlan(
        priceId,
        promotionCode,
        coupon
      );
      assert.equal(actual, expected);
    });

    it('valid yearly plan interval', async () => {
      const expected = true;
      const coupon = {
        ...couponTemplate,
        duration_in_months: 12,
      };
      sandbox.stub(stripeHelper, 'findAbbrevPlanById').resolves({
        ...planTemplate,
        interval: 'year',
        interval_count: 1,
      });

      const actual = await stripeHelper.validateCouponDurationForPlan(
        priceId,
        promotionCode,
        coupon
      );

      assert.equal(actual, expected);
    });

    it('invalid yearly plan interval', async () => {
      const expected = false;
      const coupon = couponTemplate;
      const priceIntervalOverride = 'year';

      sandbox.stub(stripeHelper, 'findAbbrevPlanById').resolves({
        ...planTemplate,
        interval: priceIntervalOverride,
      });

      const actual = await stripeHelper.validateCouponDurationForPlan(
        priceId,
        promotionCode,
        coupon
      );

      assert.equal(actual, expected);
      sinon.assert.calledOnce(Sentry.withScope);
      sinon.assert.calledOnceWithExactly(
        sentryScope.setContext,
        'validateCouponDurationForPlan',
        {
          promotionCode,
          priceId,
          couponDuration,
          couponDurationInMonths,
          priceInterval: priceIntervalOverride,
          priceIntervalCount,
        }
      );
    });

    it('valid monthly plan interval', async () => {
      const expected = true;
      const coupon = couponTemplate;
      setDefaultFindPlanById();

      const actual = await stripeHelper.validateCouponDurationForPlan(
        priceId,
        promotionCode,
        coupon
      );

      assert.equal(actual, expected);
    });

    it('invalid monthly plan interval', async () => {
      const expected = false;
      const coupon = couponTemplate;
      const priceIntervalCountOverride = 6;
      sandbox.stub(stripeHelper, 'findAbbrevPlanById').resolves({
        ...planTemplate,
        interval_count: priceIntervalCountOverride,
      });

      const actual = await stripeHelper.validateCouponDurationForPlan(
        priceId,
        promotionCode,
        coupon
      );

      assert.equal(actual, expected);
      sinon.assert.calledOnce(Sentry.withScope);
      sinon.assert.calledOnceWithExactly(
        sentryScope.setContext,
        'validateCouponDurationForPlan',
        {
          promotionCode,
          priceId,
          couponDuration,
          couponDurationInMonths,
          priceInterval,
          priceIntervalCount: priceIntervalCountOverride,
        }
      );
    });

    it('invalid plan interval', async () => {
      const expected = false;
      const coupon = couponTemplate;
      sandbox.stub(stripeHelper, 'findAbbrevPlanById').resolves({
        ...planTemplate,
        interval: 'week',
      });

      const actual = await stripeHelper.validateCouponDurationForPlan(
        priceId,
        promotionCode,
        coupon
      );

      assert.equal(actual, expected);
      sinon.assert.notCalled(Sentry.withScope);
    });

    it('missing coupon duration in months', async () => {
      const expected = false;
      const coupon = {
        ...couponTemplate,
        duration_in_months: null,
      };
      setDefaultFindPlanById();

      const actual = await stripeHelper.validateCouponDurationForPlan(
        priceId,
        promotionCode,
        coupon
      );

      assert.equal(actual, expected);
      sinon.assert.notCalled(Sentry.withScope);
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

    const expectedTemplate = {
      promotionCode: 'promo',
      type: 'forever',
      valid: true,
      durationInMonths: null,
      expired: false,
      maximallyRedeemed: false,
    };

    let sentryScope;

    beforeEach(() => {
      sentryScope = { setContext: sandbox.stub() };
      sandbox.stub(Sentry, 'withScope').callsFake((cb) => cb(sentryScope));
      sandbox.stub(Sentry, 'captureException');
    });

    it('retrieves coupon details', async () => {
      const expected = { ...expectedTemplate, discountAmount: 200 };
      sandbox
        .stub(stripeHelper, 'previewInvoice')
        .resolves([validInvoicePreview, undefined]);

      sandbox.stub(stripeHelper, 'retrievePromotionCodeForPlan').resolves({
        active: true,
        coupon: {
          id: 'promo',
          duration: 'forever',
          valid: true,
          duration_in_months: null,
        },
      });

      const actual = await stripeHelper.retrieveCouponDetails({
        automaticTax: false,
        country: 'US',
        priceId: 'planId',
        promotionCode: 'promo',
        taxAddress: {
          countryCode: 'US',
          postalCode: '92841',
        },
      });

      sinon.assert.calledOnceWithExactly(stripeHelper.previewInvoice, {
        priceId: 'planId',
        promotionCode: 'promo',
        taxAddress: {
          countryCode: 'US',
          postalCode: '92841',
        },
      });
      sinon.assert.calledOnceWithExactly(
        stripeHelper.retrievePromotionCodeForPlan,
        'promo',
        'planId'
      );
      assert.deepEqual(actual, expected);
    });

    it('retrieves coupon details for 100% discount', async () => {
      const expected = { ...expectedTemplate, discountAmount: 200 };
      sandbox
        .stub(stripeHelper, 'previewInvoice')
        .resolves([{ ...validInvoicePreview, total: 0 }, undefined]);

      sandbox.stub(stripeHelper, 'retrievePromotionCodeForPlan').resolves({
        active: true,
        coupon: {
          id: 'promo',
          duration: 'forever',
          valid: true,
          duration_in_months: null,
        },
      });

      const actual = await stripeHelper.retrieveCouponDetails({
        priceId: 'planId',
        promotionCode: 'promo',
        taxAddress: {
          countryCode: 'US',
          postalCode: '92841',
        },
      });

      sinon.assert.calledOnceWithExactly(stripeHelper.previewInvoice, {
        priceId: 'planId',
        promotionCode: 'promo',
        taxAddress: {
          countryCode: 'US',
          postalCode: '92841',
        },
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
        ...expectedTemplate,
        valid: false,
        expired: true,
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
          duration_in_months: null,
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
        ...expectedTemplate,
        valid: false,
        maximallyRedeemed: true,
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
          duration_in_months: null,
        },
      });

      const actual = await stripeHelper.retrieveCouponDetails({
        country: 'US',
        priceId: 'planId',
        promotionCode: 'promo',
      });
      assert.deepEqual(actual, expected);
    });

    it('retrieves details on an expired promotion code', async () => {
      const expected = {
        ...expectedTemplate,
        valid: false,
        expired: true,
      };
      sandbox
        .stub(stripeHelper, 'previewInvoice')
        .resolves({ ...validInvoicePreview, total_discount_amounts: null });

      sandbox.stub(stripeHelper, 'retrievePromotionCodeForPlan').resolves({
        active: false,
        expires_at: 1000,
        coupon: {
          id: 'promo',
          duration: 'forever',
          valid: true,
          duration_in_months: null,
        },
      });

      const actual = await stripeHelper.retrieveCouponDetails({
        country: 'US',
        priceId: 'planId',
        promotionCode: 'promo',
      });
      assert.deepEqual(actual, expected);
    });

    it('retrieves details on a maximally redeemed promotion code', async () => {
      const expected = {
        ...expectedTemplate,
        valid: false,
        maximallyRedeemed: true,
      };
      sandbox
        .stub(stripeHelper, 'previewInvoice')
        .resolves({ ...validInvoicePreview, total_discount_amounts: null });

      sandbox.stub(stripeHelper, 'retrievePromotionCodeForPlan').resolves({
        active: false,
        max_redemptions: 1,
        times_redeemed: 1,
        coupon: {
          id: 'promo',
          duration: 'forever',
          valid: true,
          duration_in_months: null,
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
        ...expectedTemplate,
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
          duration_in_months: null,
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
        ...expectedTemplate,
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
          duration_in_months: null,
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
          duration_in_months: null,
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

  describe('previewInvoice', () => {
    it('uses shipping address when present and no customer is provided', async () => {
      const stripeStub = sandbox
        .stub(stripeHelper.stripe.invoices, 'retrieveUpcoming')
        .resolves();

      await stripeHelper.previewInvoice({
        priceId: 'priceId',
        taxAddress: {
          countryCode: 'US',
          postalCode: '92841',
        },
      });

      sinon.assert.calledOnceWithExactly(stripeStub, {
        customer: undefined,
        automatic_tax: {
          enabled: true,
        },
        customer_details: {
          tax_exempt: 'none',
          shipping: {
            name: sinon.match.any,
            address: {
              country: 'US',
              postal_code: '92841',
            },
          },
        },
        subscription_items: [
          {
            price: 'priceId',
          },
        ],
        expand: ['total_tax_amounts.tax_rate'],
      });
    });

    it('excludes shipping address when shipping address not passed', async () => {
      const stripeStub = sandbox
        .stub(stripeHelper.stripe.invoices, 'retrieveUpcoming')
        .resolves();

      await stripeHelper.previewInvoice({
        priceId: 'priceId',
        taxAddress: undefined,
      });

      sinon.assert.calledOnceWithExactly(stripeStub, {
        customer: undefined,
        automatic_tax: {
          enabled: false,
        },
        customer_details: {
          tax_exempt: 'none',
          shipping: undefined,
        },
        subscription_items: [
          {
            price: 'priceId',
          },
        ],
        expand: ['total_tax_amounts.tax_rate'],
      });
    });

    it('logs when there is an error', async () => {
      sandbox
        .stub(stripeHelper.stripe.invoices, 'retrieveUpcoming')
        .throws(new Error());

      try {
        await stripeHelper.previewInvoice({
          priceId: 'priceId',
          taxAddress: {
            countryCode: 'US',
            postalCode: '92841',
          },
        });
      } catch (e) {
        sinon.assert.calledOnce(stripeHelper.log.warn);
      }
    });

    it('retrieves both upcoming invoices with and without proration info', async () => {
      const stripeStub = sandbox
        .stub(stripeHelper.stripe.invoices, 'retrieveUpcoming')
        .resolves();
      sandbox.stub(Math, 'floor').returns(1);

      await stripeHelper.previewInvoice({
        customer: customer1,
        priceId: 'priceId',
        taxAddress: {
          countryCode: 'US',
          postalCode: '92841',
        },
        isUpgrade: true,
        sourcePlan: {
          plan_id: 'plan_test1',
        },
      });

      sinon.assert.callCount(stripeStub, 2);

      sinon.assert.calledWith(stripeStub, {
        customer: 'cus_test1',
        automatic_tax: {
          enabled: false,
        },
        customer_details: {
          tax_exempt: 'none',
          shipping: undefined,
        },
        subscription_proration_behavior: 'always_invoice',
        subscription: customer1.subscriptions?.data[0].id,
        subscription_proration_date: 1,
        subscription_items: [
          {
            price: 'priceId',
            id: customer1.subscriptions?.data[0].items.data[0].id,
          },
        ],
        expand: ['total_tax_amounts.tax_rate'],
      });
    });
  });

  describe('previewInvoiceBySubscriptionId', () => {
    it('fetches invoice preview', async () => {
      const stripeStub = sandbox
        .stub(stripeHelper.stripe.invoices, 'retrieveUpcoming')
        .resolves();

      await stripeHelper.previewInvoiceBySubscriptionId({
        subscriptionId: 'sub123',
      });

      sinon.assert.calledOnceWithExactly(stripeStub, {
        subscription: 'sub123',
      });
    });

    it('fetches invoice preview for cancelled subscription', async () => {
      const stripeStub = sandbox
        .stub(stripeHelper.stripe.invoices, 'retrieveUpcoming')
        .resolves();

      await stripeHelper.previewInvoiceBySubscriptionId({
        subscriptionId: 'sub123',
        includeCanceled: true,
      });

      sinon.assert.calledOnceWithExactly(stripeStub, {
        subscription: 'sub123',
        subscription_cancel_at_period_end: false,
      });
    });
  });

  describe('retrievePromotionCodeForPlan', () => {
    it('finds a stripe promotionCode object when a valid code is used', async () => {
      const promotionCode = { code: 'promo1', coupon: { valid: true } };
      sandbox
        .stub(stripeHelper.stripe.promotionCodes, 'list')
        .resolves({ data: [promotionCode] });
      sandbox.stub(stripeHelper, 'findAbbrevPlanById').resolves({
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
      sandbox.stub(stripeHelper, 'findAbbrevPlanById').resolves({
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

  describe('verifyPromotionAndCoupon', () => {
    const priceId = 'priceId';
    const promotionCodeTemplate = {
      active: true,
      expires_at: null,
      max_redemptions: null,
      times_redeemed: 0,
      coupon: {
        valid: true,
        max_redemptions: null,
        times_redeemed: 0,
        redeem_by: null,
      },
    };

    const expectedTemplate = {
      valid: false,
      expired: false,
      maximallyRedeemed: false,
    };

    beforeEach(() => {
      sandbox
        .stub(stripeHelper, 'validateCouponDurationForPlan')
        .resolves(true);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('return valid for valid coupon and promotion code', async () => {
      const expected = { ...expectedTemplate, valid: true };
      const actual = await stripeHelper.verifyPromotionAndCoupon(
        priceId,
        promotionCodeTemplate
      );
      assert.deepEqual(actual, expected);
    });

    it('return invalid with maximallyRedeemed for max redeemed coupon', async () => {
      const promotionCode = {
        ...promotionCodeTemplate,
        coupon: {
          ...promotionCodeTemplate.coupon,
          valid: false,
          max_redemptions: 1,
          times_redeemed: 1,
        },
      };
      const expected = { ...expectedTemplate, maximallyRedeemed: true };
      const actual = await stripeHelper.verifyPromotionAndCoupon(
        priceId,
        promotionCode
      );
      assert.deepEqual(actual, expected);
    });

    it('return invalid with expired for expired coupon', async () => {
      const promotionCode = {
        ...promotionCodeTemplate,
        coupon: {
          valid: false,
          redeem_by: 1000,
        },
      };
      const expected = { ...expectedTemplate, expired: true };
      const actual = await stripeHelper.verifyPromotionAndCoupon(
        priceId,
        promotionCode
      );
      assert.deepEqual(actual, expected);
    });

    it('return invalid with maximallyRedeemed for max redeemed promotion code', async () => {
      const promotionCode = {
        ...promotionCodeTemplate,
        active: false,
        max_redemptions: 1,
        times_redeemed: 1,
      };
      const expected = { ...expectedTemplate, maximallyRedeemed: true };
      const actual = await stripeHelper.verifyPromotionAndCoupon(
        priceId,
        promotionCode
      );
      assert.deepEqual(actual, expected);
    });

    it('return invalid with expired for expired promotion code', async () => {
      const promotionCode = {
        ...promotionCodeTemplate,
        active: false,
        expires_at: 1000,
      };
      const expected = { ...expectedTemplate, expired: true };
      const actual = await stripeHelper.verifyPromotionAndCoupon(
        priceId,
        promotionCode
      );
      assert.deepEqual(actual, expected);
    });

    it('return invalid for invalid coupon duration for plan', async () => {
      const promotionCode = promotionCodeTemplate;
      sandbox.restore();
      sandbox
        .stub(stripeHelper, 'validateCouponDurationForPlan')
        .resolves(false);

      const expected = expectedTemplate;
      const actual = await stripeHelper.verifyPromotionAndCoupon(
        priceId,
        promotionCode
      );
      assert.deepEqual(actual, expected);
    });
  });

  describe('checkPromotionAndCouponProperties', () => {
    const propertiesTemplate = {
      valid: false,
      redeem_by: null,
      max_redemptions: null,
      times_redeemed: 0,
    };
    it('return valid', () => {
      const properties = {
        ...propertiesTemplate,
        valid: true,
      };
      const expected = {
        valid: true,
        expired: false,
        maximallyRedeemed: false,
      };
      const actual = stripeHelper.checkPromotionAndCouponProperties(properties);
      assert.deepEqual(actual, expected);
    });

    it('return invalid and maximally redeemed', () => {
      const properties = {
        ...propertiesTemplate,
        max_redemptions: 1,
        times_redeemed: 1,
      };
      const expected = {
        valid: false,
        expired: false,
        maximallyRedeemed: true,
      };
      const actual = stripeHelper.checkPromotionAndCouponProperties(properties);
      assert.deepEqual(actual, expected);
    });

    it('return invalid and expired', () => {
      const properties = {
        ...propertiesTemplate,
        redeem_by: 1000,
      };
      const expected = {
        valid: false,
        expired: true,
        maximallyRedeemed: false,
      };
      const actual = stripeHelper.checkPromotionAndCouponProperties(properties);
      assert.deepEqual(actual, expected);
    });

    it('return invalid only if neither expired or maximally redeemed', () => {
      const properties = propertiesTemplate;
      const expected = {
        valid: false,
        expired: false,
        maximallyRedeemed: false,
      };
      const actual = stripeHelper.checkPromotionAndCouponProperties(properties);
      assert.deepEqual(actual, expected);
    });
  });

  describe('checkPromotionCodeForPlan', () => {
    const couponTemplate = {
      duration: 'once',
      duration_in_months: null,
    };
    it('finds a promo code for a given plan', async () => {
      const promotionCode = 'promo1';
      sandbox.stub(stripeHelper, 'findAbbrevPlanById').resolves({
        plan_metadata: {
          [STRIPE_PRICE_METADATA.PROMOTION_CODES]: 'promo1',
        },
      });

      const actual = await stripeHelper.checkPromotionCodeForPlan(
        promotionCode,
        'planId',
        couponTemplate
      );
      assert.deepEqual(actual, true);
    });

    it('finds a promo code in a Firestore config', async () => {
      const promotionCode = 'promo1';
      sandbox.stub(stripeHelper, 'findAbbrevPlanById').resolves({
        plan_metadata: {
          [STRIPE_PRICE_METADATA.PROMOTION_CODES]: '',
        },
      });
      sandbox.stub(stripeHelper, 'maybeGetPlanConfig').resolves({
        promotionCodes: ['promo1'],
      });

      const actual = await stripeHelper.checkPromotionCodeForPlan(
        promotionCode,
        'planId',
        couponTemplate
      );
      assert.deepEqual(actual, true);
    });

    it('does not find a promo code for a given plan', async () => {
      const promotionCode = 'promo1';
      sandbox.stub(stripeHelper, 'findAbbrevPlanById').resolves({
        plan_metadata: {
          [STRIPE_PRICE_METADATA.PROMOTION_CODES]: 'promo2',
        },
      });

      const actual = await stripeHelper.checkPromotionCodeForPlan(
        promotionCode,
        'planId',
        couponTemplate
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

  describe('refundInvoices', () => {
    it('refunds invoice with charge unexpanded', async () => {
      sandbox.stub(stripeHelper.stripe.refunds, 'create').resolves({});
      sandbox
        .stub(stripeHelper.stripe.charges, 'retrieve')
        .resolves({ refunded: false });
      await stripeHelper.refundInvoices([
        {
          ...paidInvoice,
          collection_method: 'charge_automatically',
        },
      ]);
      sinon.assert.calledOnceWithExactly(stripeHelper.stripe.refunds.create, {
        charge: paidInvoice.charge,
      });
    });

    it('refunds invoice with charge expanded', async () => {
      sandbox.stub(stripeHelper.stripe.refunds, 'create').resolves({});
      sandbox
        .stub(stripeHelper.stripe.charges, 'retrieve')
        .resolves({ refunded: false });
      await stripeHelper.refundInvoices([
        {
          ...paidInvoice,
          collection_method: 'charge_automatically',
          charge: {
            id: paidInvoice.charge,
          },
        },
      ]);
      sinon.assert.calledOnceWithExactly(stripeHelper.stripe.refunds.create, {
        charge: paidInvoice.charge,
      });
    });

    it('does not refund invoice from PayPal', async () => {
      sandbox.stub(stripeHelper.stripe.refunds, 'create').resolves({});
      await stripeHelper.refundInvoices([
        {
          ...paidInvoice,
          collection_method: 'send_invoice',
        },
      ]);
      sinon.assert.notCalled(stripeHelper.stripe.refunds.create);
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

  describe('updateInvoiceWithPaypalRefundReason', () => {
    it('works successfully', async () => {
      sandbox.stub(stripeHelper.stripe.invoices, 'update').resolves({});
      const actual = await stripeHelper.updateInvoiceWithPaypalRefundReason(
        unpaidInvoice,
        'reason'
      );
      assert.deepEqual(actual, {});
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.invoices.update,
        unpaidInvoice.id,
        {
          metadata: { paypalRefundRefused: 'reason' },
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

    it('ignores error if the invoice was already paid', async () => {
      const paidInvoice = { ...deepCopy(unpaidInvoice), paid: true };
      sandbox
        .stub(stripeHelper.stripe.invoices, 'pay')
        .rejects(new Error('Invoice is already paid'));
      await stripeHelper.payInvoiceOutOfBand(paidInvoice);
      sinon.assert.calledOnce(stripeHelper.stripe.invoices.pay);
    });
  });

  describe('updateCustomerBillingAddress', () => {
    it('updates Customer with empty PayPal billing address', async () => {
      sandbox
        .stub(stripeHelper.stripe.customers, 'update')
        .resolves({ metadata: {}, tax: {} });
      stripeFirestore.insertCustomerRecordWithBackfill = sandbox
        .stub()
        .resolves({});
      const result = await stripeHelper.updateCustomerBillingAddress({
        customerId: customer1.id,
        options: {
          city: 'city',
          country: 'US',
          line1: 'street address',
          line2: undefined,
          postalCode: '12345',
          state: 'CA',
        },
      });
      assert.deepEqual(result, { metadata: {}, tax: {} });
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
          expand: ['tax'],
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
      sandbox.stub(stripeHelper.stripe.subscriptions, 'cancel').resolves({});
      await stripeHelper.cancelSubscription('subscriptionId');
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripe.subscriptions.cancel,
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
        payment_intent: { latest_charge: null },
      };
      const subscription = { ...subscription2, latest_invoice };
      const result =
        stripeHelper.extractSourceCountryFromSubscription(subscription);
      assert.equal(result, null);

      assert.isTrue(
        scopeContextSpy.calledOnce,
        'Set a message scope when "latest_charge" is missing'
      );
      assert.isTrue(
        Sentry.captureMessage.calledOnce,
        'Capture a message with Sentry when "latest_charge" is missing'
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

  describe('allConfiguredPlans', () => {
    it('gets a list of configured plans', async () => {
      const thePlans = await stripeHelper.allPlans();
      sandbox.spy(stripeHelper, 'allPlans');
      sandbox.spy(stripeHelper.paymentConfigManager, 'getMergedConfig');
      const actual = await stripeHelper.allConfiguredPlans();
      actual.forEach((p, idx) => {
        assert.equal(p.id, thePlans[idx].id);
        assert.isTrue('configuration' in p);
        if (p.id === plan3.id) {
          assert.isNull(p.configuration);
        } else {
          assert.isNotNull(p.configuration);
        }
      });
      assert.isTrue(stripeHelper.allPlans.calledOnce);
      assert.isTrue(
        // one of the plans does not have a matching ProductConfig
        stripeHelper.paymentConfigManager.getMergedConfig.calledTwice
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
      sandbox.spy(stripeHelper, 'allConfiguredPlans');
      const actual = await stripeHelper.allAbbrevPlans();
      assert(stripeHelper.allConfiguredPlans.calledOnce);
      assert(stripeHelper.allPlans.calledOnce);
      assert(stripeHelper.stripe.plans.list.calledOnce);

      assert.deepEqual(
        actual,
        [plan1, plan2]
          .map((p) => ({
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
            active: true,
            configuration: {
              locales: {},
              productSet: undefined,
              stripePriceId: p.id,
              styles: {},
              support: {},
              uiContent: {},
              urls: {},
            },
          }))
          .concat(
            [plan3].map((p) => ({
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
              active: true,
              configuration: null,
            }))
          )
      );
    });

    it('filters out invalid plans', async () => {
      const first = { ...plan1, product: { ...plan1.product, metadata: {} } };
      const second = {
        ...plan2,
        id: 'veryfake',
        product: { ...plan2.product, id: 'veryfake' },
      };
      const third = {
        ...plan3,
        id: 'missing',
        metadata: {},
        product: { ...plan3.product, metadata: {} },
      };
      listStripePlans.restore();
      sandbox
        .stub(stripeHelper.stripe.plans, 'list')
        .returns([first, second, third]);
      sandbox.spy(stripeHelper, 'allPlans');
      sandbox.spy(stripeHelper, 'allConfiguredPlans');
      const actual = await stripeHelper.allAbbrevPlans();
      assert(stripeHelper.allConfiguredPlans.calledOnce);
      assert(stripeHelper.allPlans.calledOnce);
      assert(stripeHelper.stripe.plans.list.calledOnce);

      assert.deepEqual(
        actual,
        [first]
          .map((p) => ({
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
            active: true,
            configuration: {
              locales: {},
              productSet: undefined,
              stripePriceId: p.id,
              styles: {},
              support: {},
              uiContent: {},
              urls: {},
            },
          }))
          .concat(
            [second].map((p) => ({
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
              active: true,
              configuration: null,
            }))
          )
      );
    });

    it('rejects and returns stripe values', async () => {
      const err = new Error('It is bad');
      const mockProductConfigurationManager = {
        getPurchaseWithDetailsOfferingContentByPlanIds: sinon
          .stub()
          .rejects(err),
      };
      Container.set(
        ProductConfigurationManager,
        mockProductConfigurationManager
      );
      const stripeHelper = new StripeHelper(log, mockConfig, mockStatsd);
      listStripePlans = sandbox
        .stub(stripeHelper.stripe.plans, 'list')
        .returns(asyncIterable([plan1, plan2, plan3]));
      sandbox.spy(stripeHelper, 'allPlans');
      sandbox.spy(stripeHelper, 'allConfiguredPlans');
      sandbox.stub(Sentry, 'captureException');
      const actual = await stripeHelper.allAbbrevPlans();
      assert(stripeHelper.allConfiguredPlans.calledOnce);
      assert(stripeHelper.allPlans.calledOnce);
      assert(stripeHelper.stripe.plans.list.calledOnce);
      sinon.assert.calledOnceWithExactly(Sentry.captureException, err);

      assert.deepEqual(
        actual,
        [plan1, plan2]
          .map((p) => ({
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
            active: true,
            configuration: {
              locales: {},
              productSet: undefined,
              stripePriceId: p.id,
              styles: {},
              support: {},
              uiContent: {},
              urls: {},
            },
          }))
          .concat(
            [plan3].map((p) => ({
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
              active: true,
              configuration: null,
            }))
          )
      );
    });

    it('returns CMS values', async () => {
      const newWebIconURL = 'http://strapi.example/webicon';
      const mockCMSConfigUtil = {
        transformedPurchaseWithCommonContentForPlanId: (planId) => {
          return PurchaseWithDetailsOfferingContentTransformedFactory({
            purchaseDetails: {
              data: {
                attributes: PurchaseDetailsTransformedFactory({
                  webIcon: newWebIconURL,
                }),
              },
            },
          });
        },
      };
      const mockProductConfigurationManager = {
        getPurchaseWithDetailsOfferingContentByPlanIds:
          sinon.fake.resolves(mockCMSConfigUtil),
      };
      Container.set(
        ProductConfigurationManager,
        mockProductConfigurationManager
      );
      const stripeHelper = new StripeHelper(log, mockConfig, mockStatsd);
      const newPlan1 = deepCopy(plan1);
      delete newPlan1.product.metadata['webIconURL'];
      listStripePlans = sandbox
        .stub(stripeHelper.stripe.plans, 'list')
        .returns(asyncIterable([newPlan1, plan2, plan3]));
      sandbox.spy(stripeHelper, 'allPlans');
      sandbox.spy(stripeHelper, 'allConfiguredPlans');
      const sentryScope = { setContext: sandbox.stub() };
      sandbox.stub(Sentry, 'withScope').callsFake((cb) => cb(sentryScope));
      sandbox.stub(Sentry, 'captureMessage');
      const actual = await stripeHelper.allAbbrevPlans();
      assert(stripeHelper.allConfiguredPlans.calledOnce);
      assert(stripeHelper.allPlans.calledOnce);
      assert(stripeHelper.stripe.plans.list.calledOnce);
      assert.equal(actual[0].plan_metadata['webIconURL'], newWebIconURL);
      assert.equal(actual[0].product_metadata['webIconURL'], newWebIconURL);
      sinon.assert.calledOnce(Sentry.withScope);
      sinon.assert.calledOnce(sentryScope.setContext);
    });

    it('returns CMS values when flag is enabled', async () => {
      // enable flag
      mockConfig.cms.enabled = true;

      // set container
      const mockProductConfigurationManager = {
        getPurchaseWithDetailsOfferingContentByPlanIds: sinon.fake.resolves(),
      };
      Container.set(
        ProductConfigurationManager,
        mockProductConfigurationManager
      );

      // set stripeHelper
      const stripeHelper = new StripeHelper(log, mockConfig, mockStatsd);

      // set sandbox and spies
      sandbox
        .stub(stripeHelper.stripe.plans, 'list')
        .returns(asyncIterable([plan1, plan2, plan3]));
      sandbox.spy(stripeHelper, 'allPlans');
      sandbox.spy(stripeHelper, 'allConfiguredPlans');

      // test method
      await stripeHelper.allAbbrevPlans();

      // test that flag is enabled and all spies called
      assert.isTrue(mockConfig.cms.enabled);
      assert(stripeHelper.allConfiguredPlans.calledOnce);
      assert(stripeHelper.allPlans.calledOnce);
      assert(stripeHelper.stripe.plans.list.calledOnce);
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
    describe('without Firestore configs', () => {
      beforeEach(() => {
        stripeHelper.config.subscriptions.productConfigsFirestore.enabled = false;
      });

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
              // Include some invalid whitespace that will be trimmed.
              'product:privacyNoticeDownloadURL': 'https://example.com',
            }),
          },
        };

        const goodPlan = deepCopy(plan1);
        goodPlan.product = deepCopy(product1);
        goodPlan.product.metadata['product:privacyNoticeURL'] =
          'https://accounts-static.cdn.mozilla.net/legal/privacy\n\n';
        goodPlan.metadata['product:privacyNoticeURL'] =
          'https://accounts-static.cdn.mozilla.net/legal/privacy\n\n';
        const dupeGoodPlan = deepCopy(goodPlan);

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

        // Assert that the product metadata was trimmed
        assert.equal(
          actual[0].product.metadata['product:privacyNoticeURL'],
          dupeGoodPlan.product.metadata['product:privacyNoticeURL'].trim()
        );
        // Assert that the plan metadata was trimmed
        assert.equal(
          actual[0].metadata['product:privacyNoticeURL'],
          dupeGoodPlan.metadata['product:privacyNoticeURL'].trim()
        );

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
          proration_behavior: 'always_invoice',
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

    it('fetches a customer and refreshes the cache if needed', async () => {
      const customer = deepCopy(customer1);
      customer.currency = null;
      const customerSecond = deepCopy(customer1);
      const expandStub = sandbox.stub(stripeHelper, 'expandResource');
      stripeHelper.stripeFirestore = {
        fetchAndInsertCustomer: sandbox.stub().resolves({}),
      };
      expandStub.onFirstCall().resolves(customer);
      expandStub.onSecondCall().resolves(customerSecond);
      const result = await stripeHelper.fetchCustomer(existingCustomer.uid);
      assert.deepEqual(result, customerSecond);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripeFirestore.fetchAndInsertCustomer,
        customer.id
      );
      sinon.assert.calledTwice(expandStub);
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

    it('expands the tax information if present', async () => {
      const customer = deepCopy(customer1);
      const customerSecond = deepCopy(customer1);
      customerSecond.tax = {
        location: { country: 'US', state: 'CA', source: 'billing_address' },
        ip_address: null,
        automatic_tax: 'supported',
      };
      sandbox.stub(stripeHelper, 'expandResource').returns(customer);
      sandbox
        .stub(stripeHelper.stripe.customers, 'retrieve')
        .resolves(customerSecond);
      const result = await stripeHelper.fetchCustomer(existingCustomer.uid, [
        'tax',
      ]);
      const customerResult = {
        ...customer,
        tax: customerSecond.tax,
      };
      assert.deepEqual(result, customerResult);
    });
  });

  describe('fetchInvoicesForActiveSubscriptions', () => {
    it('returns empty array if customer has no active subscriptions', async () => {
      sandbox
        .stub(stripeHelper.stripe.subscriptions, 'list')
        .resolves({ data: [] });
      const result = await stripeHelper.fetchInvoicesForActiveSubscriptions(
        existingUid,
        'paid'
      );
      assert.deepEqual(result, []);
    });

    it('fetches invoices no older than earliestCreatedDate', async () => {
      sandbox.stub(stripeHelper.stripe.subscriptions, 'list').resolves({
        data: [
          {
            id: 'idNull',
          },
        ],
      });
      sandbox.stub(stripeHelper.stripe.invoices, 'list').resolves({ data: [] });
      const expectedDateTime = 1706667661086;
      const expectedDate = new Date(expectedDateTime);

      const result = await stripeHelper.fetchInvoicesForActiveSubscriptions(
        'customerId',
        'paid',
        expectedDate
      );

      assert.deepEqual(result, []);
      sinon.assert.calledOnceWithExactly(stripeHelper.stripe.invoices.list, {
        customer: 'customerId',
        status: 'paid',
        created: { gte: Math.floor(expectedDateTime / 1000) },
      });
    });

    it('returns only invoices of active subscriptions', async () => {
      const expectedString = {
        id: 'idString',
        subscription: 'idSub',
      };
      sandbox.stub(stripeHelper.stripe.subscriptions, 'list').resolves({
        data: [
          {
            id: 'idNull',
          },
          {
            id: 'subIdExpanded',
          },
          {
            id: 'idSub',
          },
        ],
      });
      sandbox.stub(stripeHelper.stripe.invoices, 'list').resolves({
        data: [
          {
            id: 'idNull',
            subscription: null,
          },
          {
            ...expectedString,
          },
        ],
      });
      const result = await stripeHelper.fetchInvoicesForActiveSubscriptions(
        existingUid,
        'paid'
      );
      assert.deepEqual(result, [expectedString]);
    });
  });

  describe('removeCustomer', () => {
    let stripeCustomerDel;

    beforeEach(() => {
      stripeCustomerDel = sandbox
        .stub(stripeHelper.stripe.customers, 'del')
        .resolves();
    });

    describe('when customer is found', () => {
      it('deletes customer in Stripe, removes AccountCustomer and cached records, detach payment method', async () => {
        const uid = chance.guid({ version: 4 }).replace(/-/g, '');
        const customerId = 'cus_1234456sdf';
        sandbox.stub(stripeHelper, 'fetchCustomer').resolves({
          invoice_settings: { default_payment_method: { id: 'pm9001' } },
        });
        sandbox.stub(stripeHelper.stripe.paymentMethods, 'detach').resolves();
        const testAccount = await createAccountCustomer(uid, customerId);
        await stripeHelper.removeCustomer(testAccount.uid);
        assert(stripeCustomerDel.calledOnce);
        assert((await getAccountCustomerByUid(uid)) === undefined);
        sinon.assert.calledOnceWithExactly(stripeHelper.fetchCustomer, uid, [
          'invoice_settings.default_payment_method',
        ]);
        sinon.assert.calledOnceWithExactly(
          stripeHelper.stripe.paymentMethods.detach,
          'pm9001'
        );
      });

      it('deletes everything and updates metadata', async () => {
        const uid = chance.guid({ version: 4 }).replace(/-/g, '');
        const customerId = 'cus_1234456sdf';
        sandbox.stub(stripeHelper, 'fetchCustomer').resolves({
          invoice_settings: { default_payment_method: { id: 'pm9001' } },
          subscriptions: {
            data: [{ id: 'sub_123', status: 'active' }],
          },
        });
        sandbox.stub(stripeHelper.stripe.paymentMethods, 'detach').resolves();
        sandbox.stub(stripeHelper.stripe.subscriptions, 'update').resolves();
        const testAccount = await createAccountCustomer(uid, customerId);
        await stripeHelper.removeCustomer(testAccount.uid, {
          cancellation_reason: 'test',
        });
        assert(stripeCustomerDel.calledOnce);
        assert((await getAccountCustomerByUid(uid)) === undefined);
        sinon.assert.calledOnceWithExactly(stripeHelper.fetchCustomer, uid, [
          'invoice_settings.default_payment_method',
        ]);
        sinon.assert.calledOnceWithExactly(
          stripeHelper.stripe.subscriptions.update,
          'sub_123',
          {
            metadata: {
              cancellation_reason: 'test',
            },
          }
        );
        sinon.assert.calledOnceWithExactly(
          stripeHelper.stripe.paymentMethods.detach,
          'pm9001'
        );
      });
    });

    describe('when customer is not found', () => {
      it('does not throw any errors', async () => {
        const uid = chance.guid({ version: 4 }).replace(/-/g, '');
        await stripeHelper.removeCustomer(uid);
        assert(stripeCustomerDel.notCalled);
      });
    });

    describe('when accountCustomer record is not deleted', () => {
      it('logs an error', async () => {
        const uid = chance.guid({ version: 4 }).replace(/-/g, '');
        const customerId = 'cus_1234456sdf';
        const testAccount = await createAccountCustomer(uid, customerId);

        sandbox.stub(stripeHelper, 'fetchCustomer').resolves({
          invoice_settings: { default_payment_method: { id: 'pm9001' } },
        });
        sandbox.stub(stripeHelper.stripe.paymentMethods, 'detach').resolves();
        const deleteCustomer = sandbox
          .stub(dbStub, 'deleteAccountCustomer')
          .returns(0);

        await stripeHelper.removeCustomer(testAccount.uid);

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

  describe('findAbbrevPlanById', () => {
    it('finds a valid plan', async () => {
      const planId = 'plan_G93lTs8hfK7NNG';
      const result = await stripeHelper.findAbbrevPlanById(planId);
      assert(stripeHelper.stripe.plans.list.calledOnce);
      assert(result.plan_id, planId);
    });

    it('throws on invalid plan id', async () => {
      const planId = 'plan_9';
      let thrown;
      try {
        await stripeHelper.findAbbrevPlanById(planId);
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
        const latestInvoiceItems =
          stripeInvoiceToLatestInvoiceItemsDTO(invoice);

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
            latest_invoice_items: latestInvoiceItems,
            promotion_amount_off: null,
            promotion_code: null,
            promotion_duration: null,
            promotion_end: null,
            promotion_name: null,
            promotion_percent_off: null,
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
        const latestInvoiceItems =
          stripeInvoiceToLatestInvoiceItemsDTO(paidInvoice);
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
                latest_invoice_items: latestInvoiceItems,
                promotion_amount_off: null,
                promotion_code: null,
                promotion_duration: null,
                promotion_end: null,
                promotion_name: null,
                promotion_percent_off: null,
              },
            ];

            const actual = await stripeHelper.subscriptionsToResponse(input);
            assert.deepEqual(actual, expected);
          });

          it('formats the subscription, when total_excluding_tax and subtotal_excluding_tax are not set', async () => {
            const missingExcludingTaxPaidInvoice = deepCopy(paidInvoice);
            delete missingExcludingTaxPaidInvoice.total_excluding_tax;
            delete missingExcludingTaxPaidInvoice.subtotal_excluding_tax;
            const latestInvoiceItems = stripeInvoiceToLatestInvoiceItemsDTO(
              missingExcludingTaxPaidInvoice
            );
            const input = { data: [subscription1] };
            sandbox
              .stub(stripeHelper.stripe.invoices, 'retrieve')
              .resolves(missingExcludingTaxPaidInvoice);
            const callback = sandbox.stub(stripeHelper, 'expandResource');
            callback.onCall(0).resolves(missingExcludingTaxPaidInvoice);
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
                latest_invoice_items: latestInvoiceItems,
                promotion_amount_off: null,
                promotion_code: null,
                promotion_duration: null,
                promotion_end: null,
                promotion_name: null,
                promotion_percent_off: null,
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
                latest_invoice_items: latestInvoiceItems,
                promotion_amount_off: null,
                promotion_code: null,
                promotion_duration: null,
                promotion_end: null,
                promotion_name: null,
                promotion_percent_off: null,
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
                latest_invoice_items: latestInvoiceItems,
                promotion_amount_off: null,
                promotion_code: null,
                promotion_duration: null,
                promotion_end: null,
                promotion_name: null,
                promotion_percent_off: null,
              },
            ];
            const actual = await stripeHelper.subscriptionsToResponse(input);
            assert.deepEqual(actual, expected);
            assert.isNotNull(actual[0].end_at);
          });
        });
      });

      describe('when there is a subscription invalid latest_invoice', () => {
        it('should throw an error for a null latest_invoice', async () => {
          const subscription = deepCopy(subscription1);
          subscription.latest_invoice = null;

          const input = {
            data: [subscription],
          };

          try {
            await stripeHelper.subscriptionsToResponse(input);
            assert.fail();
          } catch (err) {
            assert.isNotNull(err);
            assert.equal(
              err.message,
              'Latest invoice for subscription could not be found'
            );
          }
        });

        it('should throw an error for a latest_invoice without an invoice number', async () => {
          const subscription = deepCopy(subscription1);
          const input = {
            data: [subscription],
          };
          sandbox
            .stub(stripeHelper, 'expandResource')
            .resolves({ ...paidInvoice, number: null });

          try {
            await stripeHelper.subscriptionsToResponse(input);
            assert.fail();
          } catch (err) {
            assert.isNotNull(err);
            assert.equal(
              err.message,
              'Invoice number for subscription is required'
            );
          }
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
      const latestInvoiceItems =
        stripeInvoiceToLatestInvoiceItemsDTO(paidInvoice);
      it('"once" coupon duration do not include the promotion values in the returned value', async () => {
        const subscription = deepCopy(subscriptionCouponOnce);
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
            created: subscriptionCouponOnce.created,
            current_period_end: subscriptionCouponOnce.current_period_end,
            current_period_start: subscriptionCouponOnce.current_period_start,
            cancel_at_period_end: false,
            end_at: null,
            plan_id: subscriptionCouponOnce.plan.id,
            product_id: product1.id,
            product_name: productName,
            status: 'active',
            subscription_id: subscriptionCouponOnce.id,
            failure_code: undefined,
            failure_message: undefined,
            latest_invoice: paidInvoice.number,
            latest_invoice_items: latestInvoiceItems,
            promotion_amount_off: null,
            promotion_code: null,
            promotion_duration: null,
            promotion_end: null,
            promotion_name: null,
            promotion_percent_off: null,
          },
        ];

        const actual = await stripeHelper.subscriptionsToResponse(input);
        assert.deepEqual(actual, expected);
      });

      it('forever coupon duration includes the promotion values in the returned value', async () => {
        const subscription = deepCopy(subscriptionCouponForever);
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
            created: subscriptionCouponForever.created,
            current_period_end: subscriptionCouponForever.current_period_end,
            current_period_start:
              subscriptionCouponForever.current_period_start,
            cancel_at_period_end: false,
            end_at: null,
            plan_id: subscriptionCouponForever.plan.id,
            product_id: product1.id,
            product_name: productName,
            status: 'active',
            subscription_id: subscriptionCouponForever.id,
            failure_code: undefined,
            failure_message: undefined,
            latest_invoice: paidInvoice.number,
            latest_invoice_items: latestInvoiceItems,
            promotion_amount_off:
              subscriptionCouponForever.discount.coupon.amount_off,
            promotion_code:
              subscriptionCouponForever.metadata.appliedPromotionCode,
            promotion_duration: 'forever',
            promotion_end: null,
            promotion_name: subscriptionCouponForever.discount.coupon.name,
            promotion_percent_off:
              subscriptionCouponForever.discount.coupon.percent_off,
          },
        ];

        const actual = await stripeHelper.subscriptionsToResponse(input);
        assert.deepEqual(actual, expected);
      });

      it('repeating coupon includes the promotion values in the returned value', async () => {
        const subscription = deepCopy(subscriptionCouponRepeating);
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
            created: subscriptionCouponRepeating.created,
            current_period_end: subscriptionCouponRepeating.current_period_end,
            current_period_start:
              subscriptionCouponRepeating.current_period_start,
            cancel_at_period_end: false,
            end_at: null,
            plan_id: subscriptionCouponRepeating.plan.id,
            product_id: product1.id,
            product_name: productName,
            status: 'active',
            subscription_id: subscriptionCouponRepeating.id,
            failure_code: undefined,
            failure_message: undefined,
            latest_invoice: paidInvoice.number,
            latest_invoice_items: latestInvoiceItems,
            promotion_amount_off:
              subscriptionCouponRepeating.discount.coupon.amount_off,
            promotion_code:
              subscriptionCouponRepeating.metadata.appliedPromotionCode,
            promotion_duration: 'repeating',
            promotion_end: subscriptionCouponRepeating.discount.end,
            promotion_name: subscriptionCouponRepeating.discount.coupon.name,
            promotion_percent_off:
              subscriptionCouponRepeating.discount.coupon.percent_off,
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

  describe('checkSubscriptionPastDue', () => {
    const subscription = {
      status: 'past_due',
      collection_method: 'charge_automatically',
    };
    it('return true for a subscription past due', () => {
      assert.isTrue(stripeHelper.checkSubscriptionPastDue(subscription));
    });

    it('return false for a subscription not past due', () => {
      assert.isFalse(
        stripeHelper.checkSubscriptionPastDue({
          ...subscription,
          status: 'active',
        })
      );
    });

    it('return false for an invalid subscription', () => {
      assert.isFalse(stripeHelper.checkSubscriptionPastDue({}));
    });
  });

  describe('extract details for billing emails', () => {
    const uid = '1234abcd';
    const email = 'test+20200324@example.com';
    const planId = 'plan_00000000000000';
    const planName = 'Example Plan';
    const productId = 'prod_00000000000000';
    const productName = 'Example Product';
    const planEmailIconURL = 'http://example.com/icon-new';
    const successActionButtonURL = 'http://example.com/download-new';
    const sourceId = eventCustomerSourceExpiring.data.object.id;
    const chargeId = 'ch_1GVm24BVqmGyQTMaUhRAfUmA';
    const privacyNoticeURL =
      'https://www.mozilla.org/privacy/firefox-private-network';
    const termsOfServiceURL =
      'https://www.mozilla.org/about/legal/terms/firefox-private-network';
    const cancellationSurveyURL =
      'https://www.mozilla.org/legal/mozilla_cancellation_survey_url';

    const mockPlan = {
      id: planId,
      nickname: planName,
      product: productId,
      metadata: {
        emailIconURL: planEmailIconURL,
        successActionButtonURL: successActionButtonURL,
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

    const mockOldInvoice = {
      total: 4567,
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

      const fixtureTaxDiscount = {
        ...invoicePaidSubscriptionCreateTaxDiscount,
      };
      fixtureTaxDiscount.lines.data[0] = {
        ...fixtureTaxDiscount.lines.data[0],
        plan: {
          id: planId,
          nickname: planName,
          product: productId,
          metadata: mockPlan.metadata,
        },
      };

      const fixtureTax = { ...invoicePaidSubscriptionCreateTax };
      fixtureTax.lines.data[0] = {
        ...fixtureTax.lines.data[0],
        plan: {
          id: planId,
          nickname: planName,
          product: productId,
          metadata: mockPlan.metadata,
        },
      };

      const fixtureProrated = deepCopy(invoicePaidSubscriptionCreate);
      fixtureProrated.lines.data.unshift({
        ...fixtureProrated.lines.data[0],
        type: 'invoiceitem',
        proration: true,
        amount: -100,
        plan: {
          id: 'mock-prorated-plan-id',
          nickname: 'Prorated plan',
          product: productId,
          metadata: mockPlan.metadata,
        },
      });

      const fixtureProrationRefund = { ...invoiceDraftProrationRefund };
      fixtureProrationRefund.lines.data[1] = {
        ...fixtureProrationRefund.lines.data[1],
        plan: {
          id: planId,
          nickname: planName,
          product: productId,
          metadata: mockPlan.metadata,
        },
        period: {
          end: 1587767020,
          start: 1585088620,
        },
      };

      const planConfig = {
        urls: {
          emailIcon: 'http://firestore.example.gg/email.ico',
          download: 'http://firestore.example.gg/download',
          successActionButton: 'http://firestore.example.gg/download',
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
        invoiceStatus: 'paid',
        invoiceTotalCurrency: 'usd',
        invoiceTotalInCents: 500,
        invoiceSubtotalInCents: null,
        invoiceDiscountAmountInCents: null,
        invoiceTaxAmountInCents: null,
        invoiceDate: new Date('2020-03-24T22:23:40.000Z'),
        nextInvoiceDate: new Date('2020-04-24T22:23:40.000Z'),
        payment_provider: 'stripe',
        productId,
        productName,
        planId,
        planConfig: {},
        planName,
        planEmailIconURL,
        planSuccessActionButtonURL: successActionButtonURL,
        productMetadata: {
          successActionButtonURL: successActionButtonURL,
          emailIconURL: planEmailIconURL,
          'product:privacyNoticeURL': privacyNoticeURL,
          'product:termsOfServiceURL': termsOfServiceURL,
          productOrder: '0',
        },
        showPaymentMethod: true,
        showTaxAmount: false,
        discountType: null,
        discountDuration: null,
      };

      const expectedDiscount_foreverCoupon = {
        ...expected,
        invoiceNumber: '3432720C-0001',
        invoiceTotalInCents: 450,
        invoiceSubtotalInCents: 500,
        invoiceDiscountAmountInCents: 50,
        discountType: 'forever',
        discountDuration: null,
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

      it('extracts expected details from an invoice of an upgrade', async () => {
        const fixture = deepCopy(invoicePaidSubscriptionCreate);
        const subscriptionItem = deepCopy(fixture.lines.data[0]);
        const subscriptionPeriodEnd = 1593032000;
        fixture.lines.data.push(subscriptionItem);
        fixture.lines.data[0].type = 'invoiceitem';
        fixture.lines.data[1].period.end = subscriptionPeriodEnd;

        const result = await stripeHelper.extractInvoiceDetailsForEmail(
          fixture
        );

        assert.isTrue(stripeHelper.allAbbrevProducts.called);
        assert.isFalse(mockStripe.products.retrieve.called);
        sinon.assert.calledTwice(expandMock);
        assert.deepEqual(result, {
          ...expected,
          nextInvoiceDate: new Date(subscriptionPeriodEnd * 1000),
        });
      });

      it('extracts expected details from an invoice with invoiceitem for a previous subscription', async () => {
        const result = await stripeHelper.extractInvoiceDetailsForEmail(
          fixtureProrated
        );
        assert.isTrue(stripeHelper.allAbbrevProducts.called);
        assert.isFalse(mockStripe.products.retrieve.called);
        sinon.assert.calledTwice(expandMock);
        assert.deepEqual(result, expected);
      });

      it('extracts expected details from an invoice with discount', async () => {
        const result = await stripeHelper.extractInvoiceDetailsForEmail(
          fixtureDiscount
        );
        assert.isTrue(stripeHelper.allAbbrevProducts.called);
        assert.isFalse(mockStripe.products.retrieve.called);
        sinon.assert.calledTwice(expandMock);
        assert.deepEqual(result, expectedDiscount_foreverCoupon);
      });

      it('extracts expected details from an invoice with 100% discount', async () => {
        const fixtureDiscount100 = fixtureDiscount;
        fixtureDiscount100.total = 0;
        fixtureDiscount100.total_discount_amounts[0].amount = 500;
        const expectedDiscount100 = {
          ...expectedDiscount_foreverCoupon,
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

      it('extract expected details for Product with custom cancellationSurveyURL', async () => {
        const mockAllAbbrevProducts = [
          {
            product_id: mockProduct.id,
            product_name: mockProduct.name,
            product_metadata: {
              ...mockProduct.metadata,
              'product:cancellationSurveyURL': cancellationSurveyURL,
            },
          },
        ];
        stripeHelper.allAbbrevProducts.resolves(mockAllAbbrevProducts);
        const fixture = deepCopy(invoicePaidSubscriptionCreate);
        const result = await stripeHelper.extractInvoiceDetailsForEmail(
          fixture
        );
        assert.isTrue(stripeHelper.allAbbrevProducts.called);
        assert.isFalse(mockStripe.products.retrieve.called);
        sinon.assert.calledTwice(expandMock);
        assert.deepEqual(result, {
          ...expected,
          productMetadata: {
            ...expected.productMetadata,
            'product:cancellationSurveyURL': cancellationSurveyURL,
          },
        });
      });

      it('extracts expected details for an invoice with tax', async () => {
        const result = await stripeHelper.extractInvoiceDetailsForEmail(
          fixtureTax
        );
        assert.isTrue(stripeHelper.allAbbrevProducts.called);
        assert.isFalse(mockStripe.products.retrieve.called);
        sinon.assert.calledTwice(expandMock);
        assert.deepEqual(result, {
          ...expected,
          invoiceTaxAmountInCents: 54,
        });
      });

      it('extracts expected details from an invoice with discount and tax', async () => {
        const result = await stripeHelper.extractInvoiceDetailsForEmail(
          fixtureTaxDiscount
        );
        assert.isTrue(stripeHelper.allAbbrevProducts.called);
        assert.isFalse(mockStripe.products.retrieve.called);
        sinon.assert.calledTwice(expandMock);
        assert.deepEqual(result, {
          ...expectedDiscount_foreverCoupon,
          invoiceTaxAmountInCents: 48,
        });
      });

      it('extracts expected details from an invoice without line item of type "subscription"', async () => {
        const result = await stripeHelper.extractInvoiceDetailsForEmail(
          fixtureProrationRefund
        );
        assert.isTrue(stripeHelper.allAbbrevProducts.called);
        assert.isFalse(mockStripe.products.retrieve.called);
        sinon.assert.calledTwice(expandMock);
        assert.deepEqual(result, { ...expected, invoiceStatus: 'draft' });
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

      it('throws an exception if invoice line items doesnt have type = "subscription" or "invoiceitem"', async () => {
        const fixture = deepCopy(invoicePaidSubscriptionCreate);
        fixture.lines.data[0].type = 'none';
        try {
          await stripeHelper.extractInvoiceDetailsForEmail(fixture);
          assert.fail();
        } catch (err) {
          assert.isNotNull(err);
          assert.equal(err.errno, error.ERRNO.INTERNAL_VALIDATION_ERROR);
        }
      });

      it('throws an exception if an invoice has multiple discounts', async () => {
        const fixtureDiscountMultiple = deepCopy(fixtureDiscount);
        fixtureDiscountMultiple.discounts = ['discount1', 'discount2'];
        let thrownError = null;
        try {
          await stripeHelper.extractInvoiceDetailsForEmail(
            fixtureDiscountMultiple
          );
        } catch (err) {
          thrownError = err;
        }

        assert.isNotNull(thrownError);
      });

      it('extracts the correct months and coupon type for a 3 month coupon', async () => {
        const fixtureDiscount3Month = deepCopy(fixtureDiscount);
        fixtureDiscount3Month.discount = {
          coupon: {
            duration: 'repeating',
            duration_in_months: 3,
          },
        };

        const actual = await stripeHelper.extractInvoiceDetailsForEmail(
          fixtureDiscount3Month
        );
        assert.equal(actual.discountType, 'repeating');
        assert.equal(actual.discountDuration, 3);
      });

      it('extracts the correct months and coupon type for a one time coupon', async () => {
        const fixtureDiscountOneTime = deepCopy(fixtureDiscount);
        fixtureDiscountOneTime.discount = {
          coupon: {
            duration: 'once',
            duration_in_months: null,
          },
        };

        const actual = await stripeHelper.extractInvoiceDetailsForEmail(
          fixtureDiscountOneTime
        );
        assert.equal(actual.discountType, 'once');
        assert.isNull(actual.discountDuration);
      });

      it('extracts the correct discount type when discounts property needs to be expanded', async () => {
        const fixtureDiscountOneTime = deepCopy(fixture);
        fixtureDiscountOneTime.discounts = ['discountId'];
        sandbox.stub(stripeHelper, 'getInvoiceWithDiscount').resolves({
          ...fixtureDiscountOneTime,
          discounts: [
            {
              coupon: {
                duration: 'once',
                duration_in_months: null,
              },
            },
          ],
        });

        const actual = await stripeHelper.extractInvoiceDetailsForEmail(
          fixtureDiscountOneTime
        );
        assert.equal(actual.discountType, 'once');
        assert.isNull(actual.discountDuration);
      });

      it('uses and includes Firestore based configs when available', async () => {
        sandbox.stub(stripeHelper, 'maybeGetPlanConfig').resolves(planConfig);
        const result = await stripeHelper.extractInvoiceDetailsForEmail(
          fixture
        );
        const expectedWithPlanConfig = {
          ...expected,
          planConfig,

          planEmailIconURL: planConfig.urls.emailIcon,
          planSuccessActionButtonURL: planConfig.urls.successActionButton,
        };
        sinon.assert.calledOnce(stripeHelper.maybeGetPlanConfig);
        assert.deepEqual(result, expectedWithPlanConfig);
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
            planConfig: {},
            planName,
            planEmailIconURL,
            planSuccessActionButtonURL: successActionButtonURL,
            productMetadata: {
              successActionButtonURL,
              emailIconURL: planEmailIconURL,
              'product:privacyNoticeURL': privacyNoticeURL,
              'product:termsOfServiceURL': termsOfServiceURL,
              productOrder: '0',
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
      planIdNew: planId,
      planConfig: {},
      paymentAmountNewCurrency:
        eventCustomerSubscriptionUpdated.data.object.plan.currency,
      paymentAmountNewInCents:
        eventCustomerSubscriptionUpdated.data.object.plan.amount,
      productPaymentCycleNew:
        eventCustomerSubscriptionUpdated.data.object.plan.interval,
      closeDate: 1326853478,
      invoiceTotalOldInCents: mockOldInvoice.total,
      productMetadata: {
        emailIconURL:
          eventCustomerSubscriptionUpdated.data.object.plan.metadata
            .emailIconURL,
        successActionButtonURL:
          eventCustomerSubscriptionUpdated.data.object.plan.metadata
            .successActionButtonURL,
        'product:termsOfServiceURL': termsOfServiceURL,
        'product:privacyNoticeURL': privacyNoticeURL,
        productOrder: '0',
      },
    };

    beforeEach(() => {
      mockAllAbbrevPlans.unshift(
        {
          ...eventCustomerSubscriptionUpdated.data.previous_attributes.plan,
          plan_id:
            eventCustomerSubscriptionUpdated.data.previous_attributes.plan.id,
          product_id: expectedBaseUpdateDetails.productId,
          plan_metadata:
            eventCustomerSubscriptionUpdated.data.previous_attributes.plan
              .metadata,
        },
        {
          ...eventCustomerSubscriptionUpdated.data.object.plan,
          plan_id: eventCustomerSubscriptionUpdated.data.object.plan.id,
          product_id: expectedBaseUpdateDetails.productIdNew,
          plan_metadata:
            eventCustomerSubscriptionUpdated.data.object.plan.metadata,
        }
      );
    });

    describe('extractSubscriptionUpdateEventDetailsForEmail', () => {
      const mockReactivationDetails = 'mockReactivationDetails';
      const mockCancellationDetails = 'mockCancellationDetails';
      const mockUpgradeDowngradeDetails = 'mockUpgradeDowngradeDetails';

      beforeEach(() => {
        sandbox.stub(stripeHelper, 'getInvoice').resolves(mockOldInvoice);
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

      it('calls the expected helper method for cancellation, with retrieveUpcoming error', async () => {
        const error = new Error('Stripe error');
        error.type = 'StripeInvalidRequestError';
        error.code = 'invoice_upcoming_none';
        mockStripe.invoices.retrieveUpcoming = sinon.stub().rejects(error);
        const event = deepCopy(eventCustomerSubscriptionUpdated);
        event.data.object.cancel_at_period_end = true;
        event.data.previous_attributes = {
          cancel_at_period_end: false,
          latest_invoice: 'mock_latest_invoice_id',
        };
        const result =
          await stripeHelper.extractSubscriptionUpdateEventDetailsForEmail(
            event
          );
        assert.equal(result, mockCancellationDetails);
        assertOnlyExpectedHelperCalledWith(
          'extractSubscriptionUpdateCancellationDetailsForEmail',
          event.data.object,
          expectedBaseUpdateDetails,
          mockInvoice,
          undefined
        );
      });

      it('rejects if invoices.retrieveUpcoming errors with unexpected error', async () => {
        const error = new Error('Stripe error');
        error.type = 'unexpected';
        mockStripe.invoices.retrieveUpcoming = sinon.stub().rejects(error);
        const event = deepCopy(eventCustomerSubscriptionUpdated);
        event.data.object.cancel_at_period_end = true;
        event.data.previous_attributes = {
          cancel_at_period_end: false,
          latest_invoice: 'mock_latest_invoice_id',
        };
        try {
          await stripeHelper.extractSubscriptionUpdateEventDetailsForEmail(
            event
          );
        } catch (err) {
          assert.equal(err.type, 'unexpected');
        }
        assert.isTrue(
          stripeHelper['extractSubscriptionUpdateCancellationDetailsForEmail']
            .notCalled
        );
      });

      it('calls the expected helper method for cancellation', async () => {
        const mockInvoiceUpcomingWithData = {
          ...mockInvoiceUpcoming,
          lines: {
            data: [{ type: 'invoiceitem' }],
          },
        };
        mockStripe.invoices.retrieveUpcoming = sinon
          .stub()
          .resolves(mockInvoiceUpcomingWithData);
        const event = deepCopy(eventCustomerSubscriptionUpdated);
        event.data.object.cancel_at_period_end = true;
        event.data.previous_attributes = {
          cancel_at_period_end: false,
          latest_invoice: 'mock_latest_invoice_id',
        };
        const result =
          await stripeHelper.extractSubscriptionUpdateEventDetailsForEmail(
            event
          );
        assert.equal(result, mockCancellationDetails);
        assertOnlyExpectedHelperCalledWith(
          'extractSubscriptionUpdateCancellationDetailsForEmail',
          event.data.object,
          expectedBaseUpdateDetails,
          mockInvoice,
          mockInvoiceUpcomingWithData
        );
      });

      it('calls the expected helper method for reactivation', async () => {
        const event = deepCopy(eventCustomerSubscriptionUpdated);
        event.data.object.cancel_at_period_end = false;
        event.data.previous_attributes = {
          cancel_at_period_end: true,
          latest_invoice: 'mock_latest_invoice_id',
        };
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

      it('calls the helper method when latest_invoice is not present', async () => {
        const expected = {
          ...expectedBaseUpdateDetails,
          invoiceTotalOldInCents: undefined,
        };
        const event = deepCopy(eventCustomerSubscriptionUpdated);
        event.data.object.cancel_at_period_end = false;
        event.data.previous_attributes = {
          cancel_at_period_end: true,
          latest_invoice: undefined,
        };
        const result =
          await stripeHelper.extractSubscriptionUpdateEventDetailsForEmail(
            event
          );
        assert.equal(result, mockReactivationDetails);
        assertOnlyExpectedHelperCalledWith(
          'extractSubscriptionUpdateReactivationDetailsForEmail',
          event.data.object,
          expected
        );
      });

      it('calls the expected helper method for upgrade or downgrade', async () => {
        const event = deepCopy(eventCustomerSubscriptionUpdated);
        event.data.object.cancel_at_period_end = false;
        event.data.previous_attributes.cancel_at_period_end = false;
        event.data.previous_attributes.latest_invoice =
          'mock_latest_invoice_id';
        const result =
          await stripeHelper.extractSubscriptionUpdateEventDetailsForEmail(
            event
          );
        assert.equal(result, mockUpgradeDowngradeDetails);
        const oldPlan = {
          ...event.data.object.plan,
          ...event.data.previous_attributes.plan,
        };
        assertOnlyExpectedHelperCalledWith(
          'extractSubscriptionUpdateUpgradeDowngradeDetailsForEmail',
          event.data.object,
          expectedBaseUpdateDetails,
          mockInvoice,
          undefined,
          oldPlan
        );
      });

      it('calls the expected helper method for upgrade or downgrade if previously cancelled', async () => {
        const event = deepCopy(eventCustomerSubscriptionUpdated);
        event.data.object.cancel_at_period_end = false;
        event.data.previous_attributes.cancel_at_period_end = true;
        event.data.previous_attributes.latest_invoice =
          'mock_latest_invoice_id';
        const result =
          await stripeHelper.extractSubscriptionUpdateEventDetailsForEmail(
            event
          );
        assert.equal(result, mockUpgradeDowngradeDetails);
        const oldPlan = {
          ...event.data.object.plan,
          ...event.data.previous_attributes.plan,
        };
        assertOnlyExpectedHelperCalledWith(
          'extractSubscriptionUpdateUpgradeDowngradeDetailsForEmail',
          event.data.object,
          expectedBaseUpdateDetails,
          mockInvoice,
          undefined,
          oldPlan
        );
      });

      it('includes the Firestore based plan config when available', async () => {
        const mockPlanConfig = { firestore: 'yes' };
        sandbox
          .stub(stripeHelper, 'maybeGetPlanConfig')
          .resolves(mockPlanConfig);
        const event = deepCopy(eventCustomerSubscriptionUpdated);
        event.data.object.cancel_at_period_end = true;
        event.data.previous_attributes = {
          cancel_at_period_end: false,
          latest_invoice: 'mock_latest_invoice_id',
        };
        const result =
          await stripeHelper.extractSubscriptionUpdateEventDetailsForEmail(
            event
          );
        assert.equal(result, mockCancellationDetails);
        assertOnlyExpectedHelperCalledWith(
          'extractSubscriptionUpdateCancellationDetailsForEmail',
          event.data.object,
          { ...expectedBaseUpdateDetails, planConfig: mockPlanConfig },
          mockInvoice,
          undefined
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
      const commonTest =
        (upcomingInvoice = undefined, expectedPaymentProratedInCents = 0) =>
        async () => {
          const event = deepCopy(eventCustomerSubscriptionUpdated);
          const productIdOld = event.data.previous_attributes.plan.product;
          const productIdNew = event.data.object.plan.product;

          const baseDetails = {
            ...expectedBaseUpdateDetails,
            productIdNew,
            productNameNew,
            productIconURLNew,
            productMetadata: {
              ...expectedBaseUpdateDetails.productMetadata,
              emailIconURL: productIconURLNew,
              successActionButtonURL: productDownloadURLNew,
            },
          };

          mockAllAbbrevProducts.push(
            {
              product_id: productIdOld,
              product_name: productNameOld,
              product_metadata: {
                ...mockProduct.metadata,
                emailIconUrl: productIconURLOld,
                successActionButtonURL: productDownloadURLOld,
              },
            },
            {
              product_id: productIdNew,
              product_name: productNameNew,
              product_metadata: {
                ...mockProduct.metadata,
                emailIconUrl: productIconURLNew,
                successActionButtonURL: productDownloadURLNew,
              },
            }
          );
          mockAllAbbrevPlans.unshift(
            {
              ...event.data.previous_attributes.plan,
              plan_id: event.data.previous_attributes.plan.id,
              product_id: productIdOld,
              plan_metadata: event.data.previous_attributes.plan.metadata,
            },
            {
              ...event.data.object.plan,
              plan_id: event.data.object.plan.id,
              product_id: productIdNew,
              plan_metadata: event.data.object.plan.metadata,
            }
          );

          const result =
            await stripeHelper.extractSubscriptionUpdateUpgradeDowngradeDetailsForEmail(
              event.data.object,
              baseDetails,
              mockInvoice,
              upcomingInvoice,
              event.data.previous_attributes.plan
            );

          assert.deepEqual(result, {
            ...baseDetails,
            productIdNew,
            updateType: SUBSCRIPTION_UPDATE_TYPES.UPGRADE,
            productIdOld,
            productNameOld,
            productIconURLOld,
            productPaymentCycleOld:
              event.data.previous_attributes.plan.interval,
            paymentAmountOldCurrency:
              event.data.previous_attributes.plan.currency,
            paymentAmountOldInCents: baseDetails.invoiceTotalOldInCents,
            paymentAmountNewCurrency: upcomingInvoice.currency,
            paymentAmountNewInCents: upcomingInvoice.total,
            paymentProratedCurrency: mockInvoice.currency,
            paymentProratedInCents: mockInvoice.amount_due,
            invoiceNumber: mockInvoice.number,
            invoiceId: mockInvoice.id,
          });
        };

      it(
        'extracts expected details for a subscription upgrade',
        commonTest({
          currency: 'usd',
          total: 1234,
        })
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
          productMetadata: {
            ...expectedBaseUpdateDetails.productMetadata,
            emailIconURL: productIconURLNew,
            successActionButtonURL: productDownloadURLNew,
          },
        };

        mockAllAbbrevProducts.push(
          {
            product_id: productIdOld,
            product_name: productNameOld,
            product_metadata: {
              ...mockProduct.metadata,
              emailIconUrl: productIconURLOld,
              successActionButtonURL: productDownloadURLOld,
            },
          },
          {
            product_id: productIdNew,
            product_name: productNameNew,
            product_metadata: {
              ...mockProduct.metadata,
              emailIconUrl: productIconURLNew,
              successActionButtonURL: productDownloadURLNew,
            },
          }
        );

        mockAllAbbrevPlans.unshift(
          {
            ...event.data.previous_attributes.plan,
            plan_id: event.data.previous_attributes.plan.id,
            product_id: productIdOld,
            plan_metadata: event.data.previous_attributes.plan.metadata,
          },
          {
            ...event.data.object.plan,
            plan_id: event.data.object.plan.id,
            product_id: productIdNew,
            plan_metadata: event.data.object.plan.metadata,
          }
        );

        const result =
          await stripeHelper.extractSubscriptionUpdateUpgradeDowngradeDetailsForEmail(
            event.data.object,
            baseDetails,
            mockInvoice,
            undefined,
            event.data.previous_attributes.plan
          );

        assert.equal(
          result.productPaymentCycleOld,
          result.productPaymentCycleNew
        );
      });

      it(
        'extracts expected details for a subscription upgrade with pending invoice items',
        commonTest({
          currency: 'usd',
          total: 1234,
          lines: {
            data: [
              { type: 'invoiceitem', amount: -500 },
              { type: 'invoiceitem', amount: 2500 },
            ],
          },
        })
      );
    });

    describe('extractSubscriptionUpdateReactivationDetailsForEmail', () => {
      const { card } = mockCharge.payment_method_details;
      const defaultExpected = {
        updateType: SUBSCRIPTION_UPDATE_TYPES.REACTIVATION,
        email,
        uid,
        productId,
        planId,
        planConfig: {},
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
          brand: 'Mastercard',
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
            mockInvoice,
            undefined
          );
        const subscription = event.data.object;
        assert.deepEqual(result, {
          updateType: SUBSCRIPTION_UPDATE_TYPES.CANCELLATION,
          email,
          uid,
          productId,
          planId,
          planConfig: {},
          planEmailIconURL: productIconURLNew,
          productName,
          invoiceDate: new Date(mockInvoice.created * 1000),
          invoiceTotalInCents: mockInvoice.total,
          invoiceTotalCurrency: mockInvoice.currency,
          serviceLastActiveDate: new Date(
            subscription.current_period_end * 1000
          ),
          productMetadata: expectedBaseUpdateDetails.productMetadata,
          showOutstandingBalance: false,
        });
      });

      it('extracts expected details for a subscription cancellation with pending invoice items', async () => {
        const mockUpcomingInvoice = {
          total: '40839',
          currency: 'usd',
          created: 1666968725952,
        };
        const event = deepCopy(eventCustomerSubscriptionUpdated);
        const result =
          await stripeHelper.extractSubscriptionUpdateCancellationDetailsForEmail(
            event.data.object,
            expectedBaseUpdateDetails,
            mockInvoice,
            mockUpcomingInvoice
          );
        const subscription = event.data.object;
        assert.deepEqual(result, {
          updateType: SUBSCRIPTION_UPDATE_TYPES.CANCELLATION,
          email,
          uid,
          productId,
          planId,
          planConfig: {},
          planEmailIconURL: productIconURLNew,
          productName,
          invoiceDate: new Date(mockUpcomingInvoice.created * 1000),
          invoiceTotalInCents: mockUpcomingInvoice.total,
          invoiceTotalCurrency: mockUpcomingInvoice.currency,
          serviceLastActiveDate: new Date(
            subscription.current_period_end * 1000
          ),
          productMetadata: expectedBaseUpdateDetails.productMetadata,
          showOutstandingBalance: true,
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
        customer.id,
        true
      );
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripeFirestore.retrieveCustomerSubscriptions,
        customer.id,
        undefined
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
        customer.id,
        true
      );
      sinon.assert.calledOnceWithExactly(
        stripeHelper.stripeFirestore.retrieveCustomerSubscriptions,
        customer.id,
        undefined
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
        subscription1.id,
        true
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
        invoicePaidSubscriptionCreate.customer,
        true
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

    for (const hasCurrency of [true, false]) {
      for (const type of [
        'customer.subscription.created',
        'customer.subscription.updated',
      ]) {
        it(`handles ${type} operations with currency: ${hasCurrency}`, async () => {
          const event = deepCopy(eventSubscriptionUpdated);
          event.type = type;
          delete event.data.previous_attributes;
          stripeHelper.stripe.subscriptions.retrieve = sandbox
            .stub()
            .resolves(subscription1);
          const customer = deepCopy(newCustomer);
          if (hasCurrency) {
            customer.currency = 'usd';
          }
          stripeHelper.expandResource = sandbox.stub().resolves(customer);
          stripeFirestore.retrieveSubscription = sandbox.stub().resolves({});
          stripeFirestore.insertSubscriptionRecordWithBackfill = sandbox
            .stub()
            .resolves({});
          stripeFirestore.fetchAndInsertCustomer = sandbox.stub().resolves({});
          await stripeHelper.processWebhookEventToFirestore(event);
          if (!hasCurrency) {
            sinon.assert.calledOnceWithExactly(
              stripeHelper.stripeFirestore.fetchAndInsertCustomer,
              subscription1.customer
            );
          } else {
            sinon.assert.calledOnceWithExactly(
              stripeHelper.stripeFirestore.insertSubscriptionRecordWithBackfill,
              subscription1
            );
          }
          sinon.assert.calledOnceWithExactly(
            stripeHelper.stripe.subscriptions.retrieve,
            event.data.object.id
          );
        });
      }
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

      it(`ignores ${type} operations with no customer attached to event`, async () => {
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

      it(`ignores ${type} operations with no customer attached to stripe payment method`, async () => {
        const event = deepCopy(eventPaymentMethodAttached);
        stripeHelper.stripe.paymentMethods.retrieve = sandbox
          .stub()
          .resolves({ ...paymentMethodAttach, customer: null });
        stripeFirestore.retrievePaymentMethod = sandbox.stub().resolves({});
        stripeFirestore.insertPaymentMethodRecordWithBackfill = sandbox.stub();
        await stripeHelper.processWebhookEventToFirestore(event);
        sinon.assert.notCalled(
          stripeHelper.stripeFirestore.insertPaymentMethodRecordWithBackfill
        );
        sinon.assert.calledOnceWithExactly(
          stripeHelper.stripe.paymentMethods.retrieve,
          event.data.object.id
        );
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

    it('ignores the deleted stripe customer error when handling a payment method update event', async () => {
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

    it('ignores the firestore record not found error when handling a payment method update event', async () => {
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
            FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND
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
    const mockInvoice = { status: 'paid' };
    let getLatestInvoicesForActiveSubscriptionsStub;
    let getPaymentAttemptsStub;

    beforeEach(() => {
      sandbox.stub(stripeHelper, 'fetchCustomer').resolves(customer);
      sandbox
        .stub(stripeHelper, 'extractBillingDetails')
        .resolves(billingDetails);
      sandbox
        .stub(stripeHelper, 'getCustomerPaypalAgreement')
        .returns(billingAgreementId);
      sandbox
        .stub(stripeHelper, 'hasSubscriptionRequiringPaymentMethod')
        .returns(true);
      getLatestInvoicesForActiveSubscriptionsStub = sandbox
        .stub(stripeHelper, 'getLatestInvoicesForActiveSubscriptions')
        .resolves([mockInvoice]);
      sandbox
        .stub(stripeHelper, 'hasOpenInvoiceWithPaymentAttempts')
        .resolves(true);
      getPaymentAttemptsStub = sandbox
        .stub(stripeHelper, 'getPaymentAttempts')
        .returns(0);
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
        .resolves(billingDetails);

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
      const openInvoice = { status: 'open' };
      getLatestInvoicesForActiveSubscriptionsStub.resolves([openInvoice]);
      getPaymentAttemptsStub.returns(1);
      const actual = await stripeHelper.getBillingDetailsAndSubscriptions(
        'uid'
      );

      assert.deepEqual(actual, {
        customerId: customer.id,
        subscriptions: [],
        billing_agreement_id: billingAgreementId,
        paypal_payment_error: PAYPAL_PAYMENT_ERROR_FUNDING_SOURCE,
        ...billingDetails,
      });
      sinon.assert.calledOnceWithExactly(
        stripeHelper.hasOpenInvoiceWithPaymentAttempts,
        customer
      );
    });

    it('excludes funding source error state with open invoices but no payment attempts', async () => {
      const openInvoice = { status: 'open' };
      getLatestInvoicesForActiveSubscriptionsStub.resolves([openInvoice]);
      stripeHelper.hasOpenInvoiceWithPaymentAttempts.restore();
      sandbox
        .stub(stripeHelper, 'hasOpenInvoiceWithPaymentAttempts')
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
        stripeHelper.hasOpenInvoiceWithPaymentAttempts,
        customer
      );
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
      stripeHelper.hasSubscriptionRequiringPaymentMethod.restore();
      sandbox
        .stub(stripeHelper, 'hasSubscriptionRequiringPaymentMethod')
        .returns(false);

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
    const sourceId = eventCustomerSourceExpiring.data.object.id;
    const card = {
      id: sourceId,
      brand: 'visa',
      exp_month: 8,
      exp_year: new Date().getFullYear(),
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
    const mockPaymentMethod = {
      card,
    };

    beforeEach(() => {
      sandbox.stub(stripeHelper, 'getPaymentProvider').returns('stripe');
    });

    it('returns the correct payment provider', async () => {
      const customer = { id: 'cus_xyz', invoice_settings: {} };
      const actual = await stripeHelper.extractBillingDetails(customer);

      assert.deepEqual(actual, paymentProvider);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.getPaymentProvider,
        customer
      );
    });

    it('returns the card details from the default payment method', async () => {
      const customer = {
        id: 'cus_xyz',
        invoice_settings,
      };

      const actual = await stripeHelper.extractBillingDetails(customer);

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

    it('returns the card details from default source', async () => {
      sandbox.stub(stripeHelper, 'expandResource').resolves(mockPaymentMethod);
      const customer = {
        id: 'cus_xyz',
        default_source: card.id,
        invoice_settings: {
          default_payment_method: null,
        },
        sources: { data: [source] },
      };

      const actual = await stripeHelper.extractBillingDetails(customer);
      assert.deepEqual(actual, {
        ...paymentProvider,
        billing_name: mockPaymentMethod.card.name,
        payment_type: mockPaymentMethod.card.funding,
        last4: mockPaymentMethod.card.last4,
        exp_month: mockPaymentMethod.card.exp_month,
        exp_year: mockPaymentMethod.card.exp_year,
        brand: mockPaymentMethod.card.brand,
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
        { customerId: customer1.id, options: expectedAddressArg }
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
        { customerId: customer1.id, options: expectedAddressArg }
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

  describe('IAP helpers', () => {
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
          [STRIPE_PRICE_METADATA.APP_STORE_PRODUCT_IDS]:
            'cooking.with.Foxkeh,skydiving.with.foxkeh',
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

    describe('priceToIapIdentifiers', () => {
      it('formats Play skus from price metadata, including transforming them to lowercase', () => {
        const result = stripeHelper.priceToIapIdentifiers(
          mockPrice,
          MozillaSubscriptionTypes.IAP_GOOGLE
        );
        assert.deepEqual(result, ['testsku', 'testsku2']);
      });

      it('formats App Store productIds from price metadata, including transforming them to lowercase', () => {
        const result = stripeHelper.priceToIapIdentifiers(
          mockPrice,
          MozillaSubscriptionTypes.IAP_APPLE
        );
        assert.deepEqual(result, [
          'cooking.with.foxkeh',
          'skydiving.with.foxkeh',
        ]);
      });

      it('handles empty price metadata', () => {
        const price = {
          ...mockPrice,
          plan_metadata: {},
        };
        const result = stripeHelper.priceToIapIdentifiers(
          price,
          MozillaSubscriptionTypes.IAP_GOOGLE
        );
        assert.deepEqual(result, []);
      });
    });

    describe('iapPurchasesToPriceIds', () => {
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

        subPurchase = PlayStoreSubscriptionPurchase.fromApiResponse(
          apiResponse,
          'testPackage',
          'testToken',
          'testSku',
          Date.now()
        );
      });

      it('returns price ids for the Play subscription purchase', async () => {
        const result = await stripeHelper.iapPurchasesToPriceIds([subPurchase]);
        assert.deepEqual(result, [priceId]);
        sinon.assert.calledOnce(stripeHelper.allAbbrevPlans);
      });

      it('returns price ids for the App Store subscription purchase', async () => {
        const apiResponse = deepCopy(appStoreApiResponse);
        const { originalTransactionId, status } = apiResponse;
        const decodedTransactionInfo = deepCopy(transactionInfo);
        const decodedRenewalInfo = deepCopy(renewalInfo);
        const verifiedAt = Date.now();
        subPurchase = AppStoreSubscriptionPurchase.fromApiResponse(
          apiResponse,
          status,
          decodedTransactionInfo,
          decodedRenewalInfo,
          originalTransactionId,
          verifiedAt
        );
        const result = await stripeHelper.iapPurchasesToPriceIds([subPurchase]);
        assert.deepEqual(result, [priceId]);
        sinon.assert.calledOnce(stripeHelper.allAbbrevPlans);
      });

      it('returns no price ids for unknown subscription purchase', async () => {
        subPurchase.sku = 'wrongSku';
        const result = await stripeHelper.iapPurchasesToPriceIds([subPurchase]);
        assert.deepEqual(result, []);
        sinon.assert.calledOnce(stripeHelper.allAbbrevPlans);
      });
    });

    describe('addPriceInfoToIapPurchases', () => {
      let mockPlayPurchase;
      let mockAppStorePurchase;

      beforeEach(() => {
        mockPlayPurchase = {
          auto_renewing: true,
          expiry_time_millis: Date.now(),
          package_name: 'org.mozilla.cooking.with.foxkeh',
          sku: 'testSku',
        };
        mockAppStorePurchase = {
          autoRenewStatus: 1,
          productId: 'skydiving.with.foxkeh',
          bundleId: 'hmm',
        };
      });

      it('adds matching product info to a Play Store subscription purchase', async () => {
        const expected = {
          ...mockPlayPurchase,
          price_id: priceId,
          product_id: productId,
          product_name: productName,
        };
        const result = await stripeHelper.addPriceInfoToIapPurchases(
          [mockPlayPurchase],
          MozillaSubscriptionTypes.IAP_GOOGLE
        );
        assert.deepEqual([expected], result);
      });

      it('adds matching product info to an App Store subscription purchase', async () => {
        const expected = {
          ...mockAppStorePurchase,
          price_id: priceId,
          product_id: productId,
          product_name: productName,
        };
        const result = await stripeHelper.addPriceInfoToIapPurchases(
          [mockAppStorePurchase],
          MozillaSubscriptionTypes.IAP_APPLE
        );
        assert.deepEqual([expected], result);
      });

      it('returns an empty list if no matching product ids are found', async () => {
        const mockPlayPurchase1 = {
          ...mockPlayPurchase,
          sku: 'notMatchingSku',
        };
        const result = await stripeHelper.addPriceInfoToIapPurchases(
          [mockPlayPurchase1],
          MozillaSubscriptionTypes.IAP_GOOGLE
        );
        assert.isEmpty(result);
      });
    });
  });

  describe('maybeGetPlanConfig', () => {
    it('returns an empty object when config manager is not available', async () => {
      stripeHelper.paymentConfigManager = undefined;
      const actual = await stripeHelper.maybeGetPlanConfig('testo');
      assert.deepEqual(actual, {});
    });

    it('returns an empty object when a config doc is not found', async () => {
      stripeHelper.paymentConfigManager = {
        getMergedPlanConfiguration: sandbox.stub().resolves(undefined),
      };
      const actual = await stripeHelper.maybeGetPlanConfig('testo');
      sinon.assert.calledOnceWithExactly(
        stripeHelper.paymentConfigManager.getMergedPlanConfiguration,
        'testo'
      );
      assert.deepEqual(actual, {});
    });

    it('returns the config from the config manager', async () => {
      const planConfig = { fizz: 'wibble' };
      stripeHelper.paymentConfigManager = {
        getMergedPlanConfiguration: sandbox.stub().resolves(planConfig),
      };
      const actual = await stripeHelper.maybeGetPlanConfig('testo');
      assert.deepEqual(actual, planConfig);
    });
  });

  describe('isCustomerStripeTaxEligible', () => {
    it('returns true for a taxable customer', () => {
      const actual = stripeHelper.isCustomerStripeTaxEligible({
        tax: {
          automatic_tax: 'supported',
        },
      });

      assert.equal(actual, true);
    });

    it('returns true for a customer in a not-collecting location', () => {
      const actual = stripeHelper.isCustomerStripeTaxEligible({
        tax: {
          automatic_tax: 'not_collecting',
        },
      });

      assert.equal(actual, true);
    });

    it('returns false for a customer in a unrecognized location', () => {
      const actual = stripeHelper.isCustomerStripeTaxEligible({
        tax: {
          automatic_tax: 'unrecognized_location',
        },
      });

      assert.equal(actual, false);
    });
  });

  describe('removeFirestoreCustomer', () => {
    it('completes successfully and returns array of deleted paths', async () => {
      const expected = ['/path', '/path/subpath'];
      stripeFirestore.removeCustomerRecursive = sandbox
        .stub()
        .resolves(expected);
      const actual = await stripeHelper.removeFirestoreCustomer('uid');
      assert.equal(actual, expected);
    });

    it('does not report error to sentry and rejects with error', async () => {
      sandbox.stub(Sentry, 'captureException');
      const expectedError = new Error('bad things');
      stripeFirestore.removeCustomerRecursive = sandbox
        .stub()
        .rejects(expectedError);
      try {
        await stripeHelper.removeFirestoreCustomer('uid');
      } catch (error) {
        assert.equal(error.message, expectedError.message);
        sinon.assert.notCalled(Sentry.captureException);
      }
    });

    it('reports error to sentry and rejects with error', async () => {
      sandbox.stub(Sentry, 'captureException');
      const primaryError = new Error('not good');
      const expectedError = new StripeFirestoreMultiError([primaryError]);
      stripeFirestore.removeCustomerRecursive = sandbox
        .stub()
        .rejects(expectedError);
      try {
        await stripeHelper.removeFirestoreCustomer('uid');
      } catch (error) {
        assert.equal(error.message, expectedError.message);
        sinon.assert.calledOnceWithExactly(
          Sentry.captureException,
          expectedError
        );
      }
    });
  });
});
