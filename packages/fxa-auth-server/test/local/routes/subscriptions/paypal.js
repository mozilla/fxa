/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const { Container } = require('typedi');
const assert = { ...sinon.assert, ...require('chai').assert };
const { filterCustomer } = require('fxa-shared/subscriptions/stripe');

const error = require('../../../../lib/error');
const { getRoute } = require('../../../routes_helpers');
const mocks = require('../../../mocks');
const { PayPalHelper } = require('../../../../lib/payments/paypal');
const uuid = require('uuid');
const { StripeHelper } = require('../../../../lib/payments/stripe');
const customerFixture = require('../../payments/fixtures/stripe/customer1.json');
const planFixture = require('../../payments/fixtures/stripe/plan1.json');
const subscription2 = require('../../payments/fixtures/stripe/subscription2.json');
const openInvoice = require('../../payments/fixtures/stripe/invoice_open.json');
const { filterSubscription } = require('fxa-shared/subscriptions/stripe');
const { CurrencyHelper } = require('../../../../lib/payments/currencies');

const ACCOUNT_LOCALE = 'en-US';
const SUBSCRIPTIONS_MANAGEMENT_SCOPE =
  'https://identity.mozilla.com/account/subscriptions';
const TEST_EMAIL = 'test@email.com';
const UID = uuid.v4({}, Buffer.alloc(16)).toString('hex');
const MOCK_SCOPES = ['profile:email', SUBSCRIPTIONS_MANAGEMENT_SCOPE];

let log,
  config,
  customs,
  currencyHelper,
  request,
  payPalHelper,
  token,
  stripeHelper,
  requestOptions,
  profile,
  push;
/** @type sinon.SinonSandbox */
let sandbox;

function runTest(routePath) {
  const db = mocks.mockDB({
    uid: UID,
    email: TEST_EMAIL,
    locale: ACCOUNT_LOCALE,
  });
  const routes = require('../../../../lib/routes/subscriptions')(
    log,
    db,
    config,
    customs,
    push,
    {}, // mailer
    profile,
    stripeHelper
  );
  const route = getRoute(routes, routePath, requestOptions.method || 'GET');
  request = mocks.mockRequest(requestOptions);
  return route.handler(request);
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

/**
 * Paypal integration tests
 */
describe('subscriptions payPalRoutes', () => {
  requestOptions = {
    method: 'POST',
    auth: {
      credentials: {
        scope: MOCK_SCOPES,
        user: `${UID}`,
        email: `${TEST_EMAIL}`,
      },
    },
  };

  beforeEach(() => {
    config = {
      subscriptions: {
        enabled: true,
        paypalNvpSigCredentials: {
          enabled: true,
        },
      },
      currenciesToCountries: {
        USD: ['US', 'CA', 'GB'],
      },
    };
    currencyHelper = new CurrencyHelper(config);
    sinon.createSandbox();
    log = mocks.mockLog();
    customs = mocks.mockCustoms();
    token = uuid.v4();
    stripeHelper = sinon.createStubInstance(StripeHelper);
    Container.set(StripeHelper, stripeHelper);
    payPalHelper = sinon.createStubInstance(PayPalHelper);
    payPalHelper.currencyHelper = currencyHelper;
    Container.set(PayPalHelper, payPalHelper);
    profile = {};
    push = {};
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('POST /oauth/subscriptions/paypal-checkout', () => {
    beforeEach(() => {
      payPalHelper.getCheckoutToken = sinon.fake.resolves(token);
    });

    it('should call PayPalHelper.getCheckoutToken and return token in an object', async () => {
      const response = await runTest('/oauth/subscriptions/paypal-checkout');
      sinon.assert.calledOnce(payPalHelper.getCheckoutToken);
      assert.deepEqual(response, { token });
    });

    it('should log the call', async () => {
      await runTest('/oauth/subscriptions/paypal-checkout');
      sinon.assert.calledOnceWithExactly(
        log.begin,
        'subscriptions.getCheckoutToken',
        request
      );
      sinon.assert.calledOnceWithExactly(
        log.info,
        'subscriptions.getCheckoutToken.success',
        { token: token }
      );
    });

    it('should do a customs check', async () => {
      await runTest('/oauth/subscriptions/paypal-checkout');
      sinon.assert.calledOnceWithExactly(
        customs.check,
        request,
        TEST_EMAIL,
        'getCheckoutToken'
      );
    });
  });

  describe('POST /oauth/subscriptions/active/new-paypal', () => {
    let plan, customer, subscription;
    const accountCustomer = { stripeCustomerId: 'accountCustomer' };

    beforeEach(() => {
      stripeHelper.refreshCachedCustomer = sinon.fake.resolves({});
      stripeHelper.cancelSubscription = sinon.fake.resolves({});
      payPalHelper.cancelBillingAgreement = sinon.fake.resolves({});
      profile.deleteCache = sinon.fake.resolves({});
      push.notifyProfileUpdated = sinon.fake.resolves({});
      plan = deepCopy(planFixture);
      customer = deepCopy(customerFixture);
      subscription = deepCopy(subscription2);
      subscription.latest_invoice = deepCopy(openInvoice);
      stripeHelper.customer = sinon.fake.resolves(customer);
      stripeHelper.findPlanById = sinon.fake.resolves(plan);
      payPalHelper.createBillingAgreement = sinon.fake.resolves('B-test');
      payPalHelper.agreementDetails = sinon.fake.resolves({
        countryCode: 'CA',
      });
      stripeHelper.createSubscriptionWithPaypal = sinon.fake.resolves(
        subscription
      );
      stripeHelper.updateCustomerPaypalAgreement = sinon.fake.resolves(
        customer
      );
    });

    it('should run a charge successfully', async () => {
      payPalHelper.processInvoice = sinon.fake.resolves({});
      sandbox = sinon.createSandbox();
      const authDbModule = require('fxa-shared/db/models/auth');
      sandbox
        .stub(authDbModule, 'getAccountCustomerByUid')
        .resolves(accountCustomer);
      stripeHelper.updateCustomerPaypalAgreement = sinon.fake.resolves({});
      const actual = await runTest('/oauth/subscriptions/active/new-paypal');
      assert.deepEqual(actual, {
        sourceCountry: 'CA',
        subscription: filterSubscription(subscription),
      });
      sinon.assert.calledOnce(stripeHelper.customer);
      sinon.assert.calledOnce(payPalHelper.createBillingAgreement);
      sinon.assert.calledOnce(payPalHelper.agreementDetails);
      sinon.assert.calledOnce(stripeHelper.createSubscriptionWithPaypal);
      sinon.assert.calledOnce(stripeHelper.updateCustomerPaypalAgreement);
      sinon.assert.calledOnce(payPalHelper.processInvoice);
      sinon.assert.calledOnceWithExactly(
        authDbModule.getAccountCustomerByUid,
        UID
      );
      sinon.assert.calledOnceWithExactly(
        stripeHelper.updateCustomerBillingAddress,
        accountCustomer.stripeCustomerId,
        {
          city: undefined,
          country: 'CA',
          line1: undefined,
          line2: undefined,
          postalCode: undefined,
          state: undefined,
        }
      );

      sandbox.restore();
    });

    it('should skip a zero charge successfully', async () => {
      subscription.latest_invoice.amount_due = 0;
      sandbox = sinon.createSandbox();
      const authDbModule = require('fxa-shared/db/models/auth');
      sandbox
        .stub(authDbModule, 'getAccountCustomerByUid')
        .resolves(accountCustomer);
      stripeHelper.updateCustomerPaypalAgreement = sinon.fake.resolves({});
      payPalHelper.processZeroInvoice = sinon.fake.resolves({});
      const actual = await runTest('/oauth/subscriptions/active/new-paypal');
      assert.deepEqual(actual, {
        sourceCountry: 'CA',
        subscription: filterSubscription(subscription),
      });
      sinon.assert.calledOnce(stripeHelper.customer);
      sinon.assert.calledOnce(payPalHelper.createBillingAgreement);
      sinon.assert.calledOnce(payPalHelper.agreementDetails);
      sinon.assert.calledOnce(stripeHelper.createSubscriptionWithPaypal);
      sinon.assert.calledOnce(stripeHelper.updateCustomerPaypalAgreement);
      sinon.assert.calledOnce(payPalHelper.processZeroInvoice);
      sinon.assert.calledOnceWithExactly(
        authDbModule.getAccountCustomerByUid,
        UID
      );
      sinon.assert.calledOnceWithExactly(
        stripeHelper.updateCustomerBillingAddress,
        accountCustomer.stripeCustomerId,
        {
          city: undefined,
          country: 'CA',
          line1: undefined,
          line2: undefined,
          postalCode: undefined,
          state: undefined,
        }
      );

      sandbox.restore();
    });

    it('should throw an error if planCurrency does not match billingAgreement country', async () => {
      sandbox = sinon.createSandbox();
      const authDbModule = require('fxa-shared/db/models/auth');
      sandbox
        .stub(authDbModule, 'getAccountCustomerByUid')
        .resolves(accountCustomer);
      stripeHelper.updateCustomerPaypalAgreement = sinon.fake.resolves({});
      payPalHelper.processInvoice = sinon.fake.resolves({});
      payPalHelper.agreementDetails = sinon.fake.resolves({
        countryCode: 'AS',
      });
      try {
        await runTest('/oauth/subscriptions/active/new-paypal');
        assert.fail('Should have thrown an error');
      } catch (err) {
        assert.equal(
          err.message,
          'Funding source country does not match plan currency.'
        );
      }
      sinon.assert.calledOnceWithExactly(
        authDbModule.getAccountCustomerByUid,
        UID
      );
      sinon.assert.calledOnceWithExactly(
        stripeHelper.updateCustomerBillingAddress,
        accountCustomer.stripeCustomerId,
        {
          city: undefined,
          country: 'AS',
          line1: undefined,
          line2: undefined,
          postalCode: undefined,
          state: undefined,
        }
      );

      sandbox.restore();
    });

    it('should throw an error if billingAgreement country does not match planCurrency', async () => {
      sandbox = sinon.createSandbox();
      const authDbModule = require('fxa-shared/db/models/auth');
      sandbox
        .stub(authDbModule, 'getAccountCustomerByUid')
        .resolves(accountCustomer);
      stripeHelper.updateCustomerPaypalAgreement = sinon.fake.resolves({});
      payPalHelper.processInvoice = sinon.fake.resolves({});
      plan.currency = 'eur';
      stripeHelper.findPlanById = sinon.fake.resolves(plan);
      try {
        await runTest('/oauth/subscriptions/active/new-paypal');
        assert.fail('Should have thrown an error');
      } catch (err) {
        assert.equal(
          err.message,
          'Funding source country does not match plan currency.'
        );
      }
      sinon.assert.calledOnceWithExactly(
        authDbModule.getAccountCustomerByUid,
        UID
      );
      sinon.assert.calledOnceWithExactly(
        stripeHelper.updateCustomerBillingAddress,
        accountCustomer.stripeCustomerId,
        {
          city: undefined,
          country: 'CA',
          line1: undefined,
          line2: undefined,
          postalCode: undefined,
          state: undefined,
        }
      );
    });

    it('should throw an error if the invoice processing fails', async () => {
      payPalHelper.processInvoice = sinon.fake.rejects(error.paymentFailed());
      try {
        await runTest('/oauth/subscriptions/active/new-paypal');
        assert.fail('Should have thrown an error');
      } catch (err) {
        assert.deepEqual(err, error.paymentFailed());
        sinon.assert.calledOnce(stripeHelper.cancelSubscription);
        sinon.assert.calledOnce(payPalHelper.cancelBillingAgreement);
      }
    });
  });

  describe('POST /oauth/subscriptions/paymentmethod/billing-agreement', () => {
    let plan, customer, subscription, invoices;

    beforeEach(() => {
      stripeHelper.refreshCachedCustomer = sinon.fake.resolves({});
      invoices = [];

      async function* genInvoice() {
        for (const invoice of invoices) {
          yield invoice;
        }
      }

      stripeHelper.fetchOpenInvoices.returns(genInvoice());
      stripeHelper.getCustomerPaypalAgreement = sinon.fake.returns(undefined);
      profile.deleteCache = sinon.fake.resolves({});
      push.notifyProfileUpdated = sinon.fake.resolves({});
      plan = deepCopy(planFixture);
      customer = deepCopy(customerFixture);
      subscription = deepCopy(subscription2);
      subscription.collection_method = 'send_invoice';
      subscription.latest_invoice = deepCopy(openInvoice);
      customer.subscriptions.data = [subscription];
      stripeHelper.customer = sinon.fake.resolves(customer);
      stripeHelper.findPlanById = sinon.fake.resolves(plan);
      payPalHelper.createBillingAgreement = sinon.fake.resolves('B-test');
      payPalHelper.agreementDetails = sinon.fake.resolves({
        countryCode: 'CA',
      });
      stripeHelper.updateCustomerPaypalAgreement = sinon.fake.resolves(
        customer
      );
    });

    it('should update the billing agreement and process invoice', async () => {
      invoices.push(subscription.latest_invoice);
      subscription.latest_invoice.subscription = subscription;
      const actual = await runTest(
        '/oauth/subscriptions/paymentmethod/billing-agreement'
      );
      assert.deepEqual(actual, filterCustomer(customer));
      sinon.assert.calledOnce(stripeHelper.customer);
      sinon.assert.calledOnce(payPalHelper.createBillingAgreement);
      sinon.assert.calledOnce(payPalHelper.agreementDetails);
      sinon.assert.calledOnce(stripeHelper.updateCustomerPaypalAgreement);
      sinon.assert.calledOnce(stripeHelper.fetchOpenInvoices);
      sinon.assert.calledOnce(stripeHelper.getCustomerPaypalAgreement);
      sinon.assert.calledOnce(payPalHelper.processInvoice);
    });

    it('should update the billing agreement and process zero invoice', async () => {
      subscription.latest_invoice.amount_due = 0;
      invoices.push(subscription.latest_invoice);
      subscription.latest_invoice.subscription = subscription;
      payPalHelper.processZeroInvoice = sinon.fake.resolves({});
      const actual = await runTest(
        '/oauth/subscriptions/paymentmethod/billing-agreement'
      );
      assert.deepEqual(actual, filterCustomer(customer));
      sinon.assert.calledOnce(stripeHelper.customer);
      sinon.assert.calledOnce(payPalHelper.createBillingAgreement);
      sinon.assert.calledOnce(payPalHelper.agreementDetails);
      sinon.assert.calledOnce(stripeHelper.updateCustomerPaypalAgreement);
      sinon.assert.calledOnce(stripeHelper.fetchOpenInvoices);
      sinon.assert.calledOnce(stripeHelper.getCustomerPaypalAgreement);
      sinon.assert.calledOnce(payPalHelper.processZeroInvoice);
      sinon.assert.notCalled(payPalHelper.processInvoice);
    });

    it('should update the billing agreement', async () => {
      const actual = await runTest(
        '/oauth/subscriptions/paymentmethod/billing-agreement'
      );
      assert.deepEqual(actual, filterCustomer(customer));
      sinon.assert.calledOnce(stripeHelper.customer);
      sinon.assert.calledOnce(payPalHelper.createBillingAgreement);
      sinon.assert.calledOnce(payPalHelper.agreementDetails);
      sinon.assert.calledOnce(stripeHelper.updateCustomerPaypalAgreement);
      sinon.assert.calledOnce(stripeHelper.fetchOpenInvoices);
      sinon.assert.calledOnce(stripeHelper.getCustomerPaypalAgreement);
      sinon.assert.notCalled(payPalHelper.processInvoice);
    });

    it('should throw an error if billingAgreement country does not match planCurrency', async () => {
      customer.currency = 'eur';
      stripeHelper.findPlanById = sinon.fake.resolves(plan);
      try {
        await runTest('/oauth/subscriptions/paymentmethod/billing-agreement');
        assert.fail('Should have thrown an error');
      } catch (err) {
        assert.equal(
          err.message,
          'Funding source country does not match plan currency.'
        );
      }
    });

    it('should throw an error if theres no paypal subscription', async () => {
      customer.subscriptions.data = [];
      try {
        await runTest('/oauth/subscriptions/paymentmethod/billing-agreement');
        assert.fail('Should have thrown an error');
      } catch (err) {
        assert.equal(
          err.output.payload.data.message,
          'User is missing paypal subscriptions or currency value.'
        );
      }
    });
  });
});
