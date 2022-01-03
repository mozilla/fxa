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
const { AuthLogger, AppConfig } = require('../../../../lib/types');
const buildRoutes = require('../../../../lib/routes/subscriptions');

const ACCOUNT_LOCALE = 'en-US';
const { OAUTH_SCOPE_SUBSCRIPTIONS } = require('fxa-shared/oauth/constants');
const { CapabilityService } = require('../../../../lib/payments/capability');
const { PlayBilling } = require('../../../../lib/payments/google-play');
const TEST_EMAIL = 'test@email.com';
const UID = uuid.v4({}, Buffer.alloc(16)).toString('hex');
const MOCK_SCOPES = ['profile:email', OAUTH_SCOPE_SUBSCRIPTIONS];

let log,
  config,
  customs,
  currencyHelper,
  request,
  payPalHelper,
  token,
  stripeHelper,
  profile,
  push;

function runTest(routePath, requestOptions) {
  const db = mocks.mockDB({
    uid: UID,
    email: TEST_EMAIL,
    locale: ACCOUNT_LOCALE,
  });
  const routes = buildRoutes(
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
  const defaultRequestOptions = {
    method: 'POST',
    auth: {
      credentials: {
        scope: MOCK_SCOPES,
        user: `${UID}`,
        email: `${TEST_EMAIL}`,
      },
    },
  };
  const authDbModule = require('fxa-shared/db/models/auth');
  const accountCustomer = { stripeCustomerId: 'accountCustomer' };
  const paypalAgreementId = 'testo';

  beforeEach(() => {
    config = {
      authFirestore: {
        enabled: false,
      },
      subscriptions: {
        enabled: true,
        paypalNvpSigCredentials: {
          enabled: true,
        },
      },
      currenciesToCountries: {
        USD: ['US', 'CA', 'GB'],
      },
      support: {
        ticketPayloadLimit: 131072,
      },
    };
    currencyHelper = new CurrencyHelper(config);
    log = mocks.mockLog();
    customs = mocks.mockCustoms();
    token = uuid.v4();
    Container.set(AppConfig, config);
    Container.set(AuthLogger, log);
    Container.set(PlayBilling, {});
    stripeHelper = sinon.createStubInstance(StripeHelper);
    Container.set(StripeHelper, stripeHelper);
    payPalHelper = sinon.createStubInstance(PayPalHelper);
    payPalHelper.currencyHelper = currencyHelper;
    Container.set(PayPalHelper, payPalHelper);
    profile = {};
    Container.set(CapabilityService, {});
    push = {};
  });

  afterEach(() => {
    Container.reset();
  });

  describe('POST /oauth/subscriptions/paypal-checkout', () => {
    beforeEach(() => {
      payPalHelper.getCheckoutToken = sinon.fake.resolves(token);
    });

    it('should call PayPalHelper.getCheckoutToken and return token in an object', async () => {
      const response = await runTest(
        '/oauth/subscriptions/paypal-checkout',
        defaultRequestOptions
      );
      sinon.assert.calledOnce(payPalHelper.getCheckoutToken);
      assert.deepEqual(response, { token });
    });

    it('should log the call', async () => {
      await runTest(
        '/oauth/subscriptions/paypal-checkout',
        defaultRequestOptions
      );
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
      await runTest(
        '/oauth/subscriptions/paypal-checkout',
        defaultRequestOptions
      );
      sinon.assert.calledOnceWithExactly(
        customs.check,
        request,
        TEST_EMAIL,
        'getCheckoutToken'
      );
    });
  });

  describe('POST /oauth/subscriptions/active/new-paypal', () => {
    let plan, customer, subscription, promotionCode;

    beforeEach(() => {
      stripeHelper.cancelSubscription = sinon.fake.resolves({});
      stripeHelper.taxRateByCountryCode = sinon.fake.resolves({
        id: 'tr-1234',
      });
      payPalHelper.cancelBillingAgreement = sinon.fake.resolves({});
      profile.deleteCache = sinon.fake.resolves({});
      push.notifyProfileUpdated = sinon.fake.resolves({});
      plan = deepCopy(planFixture);
      customer = deepCopy(customerFixture);
      subscription = deepCopy(subscription2);
      subscription.latest_invoice = deepCopy(openInvoice);
      stripeHelper.fetchCustomer = sinon.fake.resolves(customer);
      stripeHelper.findPlanById = sinon.fake.resolves(plan);
      payPalHelper.createBillingAgreement = sinon.fake.resolves('B-test');
      payPalHelper.agreementDetails = sinon.fake.resolves({
        countryCode: 'CA',
      });
      stripeHelper.customerTaxId = sinon.fake.returns(undefined);
      stripeHelper.addTaxIdToCustomer = sinon.fake.resolves({});
      stripeHelper.createSubscriptionWithPaypal =
        sinon.fake.resolves(subscription);
      stripeHelper.updateCustomerPaypalAgreement =
        sinon.fake.resolves(customer);
      promotionCode = { coupon: { id: 'test-coupon' } };
      stripeHelper.findValidPromoCode = sinon.fake.resolves(promotionCode);
    });

    describe('existing PayPal subscriber with no billing agreement on record', () => {
      it('throws a missing PayPal billing agreement error', async () => {
        const c = deepCopy(customer);
        c.subscriptions.data[0].collection_method = 'send_invoice';
        stripeHelper.fetchCustomer = sinon.fake.resolves(c);
        stripeHelper.getCustomerPaypalAgreement = sinon.fake.returns(undefined);

        try {
          await runTest(
            '/oauth/subscriptions/active/new-paypal',
            defaultRequestOptions
          );
          assert.fail('Should have thrown an error');
        } catch (err) {
          assert.deepEqual(err, error.missingPaypalBillingAgreement(c.id));
        }
      });
    });

    describe('new customer with no PayPal token', () => {
      it('throws a missing PayPal payment token error', async () => {
        authDbModule.getAccountCustomerByUid =
          sinon.fake.resolves(accountCustomer);
        stripeHelper.getCustomerPaypalAgreement = sinon.fake.returns(undefined);

        try {
          await runTest(
            '/oauth/subscriptions/active/new-paypal',
            defaultRequestOptions
          );
          assert.fail('Should have thrown an error');
        } catch (err) {
          assert.deepEqual(err, error.missingPaypalPaymentToken(customer.id));
        }
      });
    });

    describe('existing PayPal customer with a PayPal token', () => {
      it('throws a billing agreement already exists error', async () => {
        const c = deepCopy(customer);
        c.subscriptions.data[0].collection_method = 'send_invoice';
        stripeHelper.fetchCustomer = sinon.fake.resolves(c);
        authDbModule.getAccountCustomerByUid =
          sinon.fake.resolves(accountCustomer);
        stripeHelper.getCustomerPaypalAgreement =
          sinon.fake.returns(paypalAgreementId);

        try {
          await runTest('/oauth/subscriptions/active/new-paypal', {
            ...defaultRequestOptions,
            payload: { token },
          });
          assert.fail('Should have thrown an error');
        } catch (err) {
          assert.deepEqual(err, error.billingAgreementExists(customer.id));
        }
      });
    });

    describe('new subscription with a PayPal payment token', () => {
      beforeEach(() => {
        authDbModule.getAccountCustomerByUid =
          sinon.fake.resolves(accountCustomer);
        stripeHelper.updateCustomerPaypalAgreement = sinon.fake.resolves({});
        payPalHelper.processInvoice = sinon.fake.resolves({});
        payPalHelper.processZeroInvoice = sinon.fake.resolves({});
      });

      it('should run a charge successfully', async () => {
        const requestOptions = deepCopy(defaultRequestOptions);
        requestOptions.geo = {
          location: {
            countryCode: 'CA',
            city: 'Toronto',
            state: 'Ontario',
          },
        };
        const actual = await runTest('/oauth/subscriptions/active/new-paypal', {
          ...requestOptions,
          payload: { token },
        });
        assert.deepEqual(actual, {
          sourceCountry: 'CA',
          subscription: filterSubscription(subscription),
        });
        sinon.assert.calledOnce(stripeHelper.fetchCustomer);
        sinon.assert.calledOnce(payPalHelper.createBillingAgreement);
        sinon.assert.calledOnce(payPalHelper.agreementDetails);
        sinon.assert.calledOnce(stripeHelper.createSubscriptionWithPaypal);
        sinon.assert.calledOnce(stripeHelper.updateCustomerPaypalAgreement);
        sinon.assert.calledOnce(payPalHelper.processInvoice);
        sinon.assert.calledOnce(stripeHelper.taxRateByCountryCode);
        sinon.assert.calledOnce(stripeHelper.customerTaxId);
        sinon.assert.calledOnce(stripeHelper.addTaxIdToCustomer);
        sinon.assert.notCalled(stripeHelper.findValidPromoCode);
        sinon.assert.calledWithExactly(
          stripeHelper.createSubscriptionWithPaypal,
          {
            customer,
            priceId: undefined,
            couponId: undefined,
            subIdempotencyKey: undefined,
            taxRateId: 'tr-1234',
          }
        );
        sinon.assert.calledOnceWithExactly(
          authDbModule.getAccountCustomerByUid,
          UID
        );
        sinon.assert.calledOnceWithExactly(
          stripeHelper.updateCustomerBillingAddress,
          accountCustomer.stripeCustomerId,
          {
            city: 'Toronto',
            country: 'CA',
            line1: undefined,
            line2: undefined,
            postalCode: undefined,
            state: 'Ontario',
          }
        );
      });

      it('should run a charge successfully with coupon', async () => {
        const actual = await runTest('/oauth/subscriptions/active/new-paypal', {
          ...defaultRequestOptions,
          payload: { token, promotionCode: 'test-promo' },
        });
        assert.deepEqual(actual, {
          sourceCountry: 'CA',
          subscription: filterSubscription(subscription),
        });
        sinon.assert.calledOnce(stripeHelper.fetchCustomer);
        sinon.assert.calledOnce(payPalHelper.createBillingAgreement);
        sinon.assert.calledOnce(payPalHelper.agreementDetails);
        sinon.assert.calledOnce(stripeHelper.createSubscriptionWithPaypal);
        sinon.assert.calledOnce(stripeHelper.updateCustomerPaypalAgreement);
        sinon.assert.calledOnce(payPalHelper.processInvoice);
        sinon.assert.calledOnce(stripeHelper.taxRateByCountryCode);
        sinon.assert.calledOnce(stripeHelper.customerTaxId);
        sinon.assert.calledOnce(stripeHelper.addTaxIdToCustomer);
        sinon.assert.calledWithExactly(
          stripeHelper.findValidPromoCode,
          'test-promo',
          undefined
        );
        sinon.assert.calledWithExactly(
          stripeHelper.createSubscriptionWithPaypal,
          {
            customer,
            priceId: undefined,
            couponId: 'test-coupon',
            subIdempotencyKey: undefined,
            taxRateId: 'tr-1234',
          }
        );
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

      it('should skip a zero charge successfully', async () => {
        subscription.latest_invoice.amount_due = 0;
        const actual = await runTest('/oauth/subscriptions/active/new-paypal', {
          ...defaultRequestOptions,
          payload: { token },
        });
        assert.deepEqual(actual, {
          sourceCountry: 'CA',
          subscription: filterSubscription(subscription),
        });
        sinon.assert.calledOnce(stripeHelper.fetchCustomer);
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
      });

      it('should throw an error if invalid promotion code', async () => {
        stripeHelper.findValidPromoCode = sinon.fake.rejects(
          error.invalidPromoCode('invalid-promo')
        );
        try {
          await runTest('/oauth/subscriptions/active/new-paypal', {
            ...defaultRequestOptions,
            payload: { token, promotionCode: 'invalid-promo' },
          });
          assert.fail('Should have thrown an error');
        } catch (err) {
          assert.equal(err.message, 'Invalid promotion code');
        }
        sinon.assert.calledWithExactly(
          stripeHelper.findValidPromoCode,
          'invalid-promo',
          undefined
        );
      });

      it('should throw an error if planCurrency does not match billingAgreement country', async () => {
        payPalHelper.agreementDetails = sinon.fake.resolves({
          countryCode: 'AS',
        });
        try {
          await runTest('/oauth/subscriptions/active/new-paypal', {
            ...defaultRequestOptions,
            payload: { token },
          });
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
      });

      it('should throw an error if billingAgreement country does not match planCurrency', async () => {
        plan.currency = 'eur';
        stripeHelper.findPlanById = sinon.fake.resolves(plan);
        try {
          await runTest('/oauth/subscriptions/active/new-paypal', {
            ...defaultRequestOptions,
            payload: { token },
          });
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
          await runTest('/oauth/subscriptions/active/new-paypal', {
            ...defaultRequestOptions,
            payload: { token },
          });
          assert.fail('Should have thrown an error');
        } catch (err) {
          assert.deepEqual(err, error.paymentFailed());
          sinon.assert.calledOnce(stripeHelper.cancelSubscription);
          sinon.assert.calledOnce(payPalHelper.cancelBillingAgreement);
        }
      });
    });

    describe('new subscription with an existing billing agreement', () => {
      beforeEach(() => {
        const c = {
          ...customer,
          address: {
            country: 'GD',
          },
          metadata: {
            ...customer.metadata,
            paypalAgreementId,
          },
        };
        c.subscriptions.data[0].collection_method = 'send_invoice';
        stripeHelper.fetchCustomer = sinon.fake.resolves(c);
        stripeHelper.getCustomerPaypalAgreement =
          sinon.fake.returns(paypalAgreementId);
        payPalHelper.processInvoice = sinon.fake.resolves({});
        stripeHelper.updateCustomerPaypalAgreement = sinon.fake.resolves({});
      });

      it('should run a charge successfully', async () => {
        const actual = await runTest(
          '/oauth/subscriptions/active/new-paypal',
          defaultRequestOptions
        );

        sinon.assert.notCalled(payPalHelper.createBillingAgreement);
        sinon.assert.notCalled(payPalHelper.agreementDetails);
        sinon.assert.notCalled(stripeHelper.updateCustomerPaypalAgreement);
        sinon.assert.notCalled(stripeHelper.updateCustomerBillingAddress);
        sinon.assert.notCalled(stripeHelper.findValidPromoCode);
        sinon.assert.calledOnce(stripeHelper.taxRateByCountryCode);
        sinon.assert.calledOnce(stripeHelper.customerTaxId);
        sinon.assert.calledOnce(stripeHelper.addTaxIdToCustomer);
        sinon.assert.calledWithExactly(
          stripeHelper.createSubscriptionWithPaypal,
          {
            customer: {
              ...customer,
              address: {
                country: 'GD',
              },
              metadata: {
                ...customer.metadata,
                paypalAgreementId,
              },
            },
            priceId: undefined,
            couponId: undefined,
            subIdempotencyKey: undefined,
            taxRateId: 'tr-1234',
          }
        );

        assert.deepEqual(actual, {
          sourceCountry: 'GD',
          subscription: filterSubscription(subscription),
        });
        sinon.assert.calledOnce(stripeHelper.fetchCustomer);
        sinon.assert.calledOnce(stripeHelper.createSubscriptionWithPaypal);
        sinon.assert.calledOnce(payPalHelper.processInvoice);
      });

      it('should run a charge successfully with a coupon', async () => {
        const requestOptions = deepCopy(defaultRequestOptions);
        requestOptions.payload = { promotionCode: 'test-promo' };
        const actual = await runTest(
          '/oauth/subscriptions/active/new-paypal',
          requestOptions
        );

        sinon.assert.notCalled(payPalHelper.createBillingAgreement);
        sinon.assert.notCalled(payPalHelper.agreementDetails);
        sinon.assert.notCalled(stripeHelper.updateCustomerPaypalAgreement);
        sinon.assert.notCalled(stripeHelper.updateCustomerBillingAddress);
        sinon.assert.calledWithExactly(
          stripeHelper.findValidPromoCode,
          'test-promo',
          undefined
        );
        sinon.assert.calledOnce(stripeHelper.taxRateByCountryCode);
        sinon.assert.calledOnce(stripeHelper.customerTaxId);
        sinon.assert.calledOnce(stripeHelper.addTaxIdToCustomer);
        sinon.assert.calledWithExactly(
          stripeHelper.createSubscriptionWithPaypal,
          {
            customer: {
              ...customer,
              address: {
                country: 'GD',
              },
              metadata: {
                ...customer.metadata,
                paypalAgreementId,
              },
            },
            priceId: undefined,
            couponId: 'test-coupon',
            subIdempotencyKey: undefined,
            taxRateId: 'tr-1234',
          }
        );

        assert.deepEqual(actual, {
          sourceCountry: 'GD',
          subscription: filterSubscription(subscription),
        });
        sinon.assert.calledOnce(stripeHelper.fetchCustomer);
        sinon.assert.calledOnce(stripeHelper.createSubscriptionWithPaypal);
        sinon.assert.calledOnce(payPalHelper.processInvoice);
      });

      it('should skip a zero charge successfully', async () => {
        subscription.latest_invoice.amount_due = 0;
        payPalHelper.processZeroInvoice = sinon.fake.resolves({});
        const actual = await runTest(
          '/oauth/subscriptions/active/new-paypal',
          defaultRequestOptions
        );
        assert.deepEqual(actual, {
          sourceCountry: 'GD',
          subscription: filterSubscription(subscription),
        });
        sinon.assert.calledOnce(payPalHelper.processZeroInvoice);
      });

      it('should throw an error if the invoice processing fails', async () => {
        payPalHelper.processInvoice = sinon.fake.rejects(error.paymentFailed());
        try {
          await runTest(
            '/oauth/subscriptions/active/new-paypal',
            defaultRequestOptions
          );
          assert.fail('Should have thrown an error');
        } catch (err) {
          assert.deepEqual(err, error.paymentFailed());
          sinon.assert.calledOnce(stripeHelper.cancelSubscription);
          sinon.assert.notCalled(payPalHelper.cancelBillingAgreement);
        }
      });
    });
  });

  describe('POST /oauth/subscriptions/paymentmethod/billing-agreement', () => {
    let plan, customer, subscription, invoices;

    beforeEach(() => {
      invoices = [];

      async function* genInvoice() {
        for (const invoice of invoices) {
          yield invoice;
        }
      }

      authDbModule.getAccountCustomerByUid =
        sinon.fake.resolves(accountCustomer);
      stripeHelper.getCustomerPaypalAgreement = sinon.fake.returns(undefined);
      stripeHelper.fetchOpenInvoices.returns(genInvoice());
      profile.deleteCache = sinon.fake.resolves({});
      push.notifyProfileUpdated = sinon.fake.resolves({});
      plan = deepCopy(planFixture);
      customer = deepCopy(customerFixture);
      subscription = deepCopy(subscription2);
      subscription.collection_method = 'send_invoice';
      subscription.latest_invoice = deepCopy(openInvoice);
      customer.subscriptions.data = [subscription];
      stripeHelper.fetchCustomer = sinon.fake.resolves(customer);
      stripeHelper.findPlanById = sinon.fake.resolves(plan);
      payPalHelper.createBillingAgreement = sinon.fake.resolves('B-test');
      payPalHelper.agreementDetails = sinon.fake.resolves({
        countryCode: 'CA',
      });
      stripeHelper.updateCustomerPaypalAgreement =
        sinon.fake.resolves(customer);
    });

    it('should update the billing agreement and process invoice', async () => {
      const requestOptions = deepCopy(defaultRequestOptions);
      requestOptions.geo = {
        location: {
          countryCode: 'CA',
          city: 'Toronto',
          state: 'Ontario',
        },
      };
      invoices.push(subscription.latest_invoice);
      subscription.latest_invoice.subscription = subscription;
      const actual = await runTest(
        '/oauth/subscriptions/paymentmethod/billing-agreement',
        requestOptions
      );
      assert.deepEqual(actual, filterCustomer(customer));
      sinon.assert.calledOnce(stripeHelper.fetchCustomer);
      sinon.assert.calledOnce(payPalHelper.createBillingAgreement);
      sinon.assert.calledOnce(payPalHelper.agreementDetails);
      sinon.assert.calledOnce(stripeHelper.updateCustomerPaypalAgreement);
      sinon.assert.calledOnce(stripeHelper.fetchOpenInvoices);
      sinon.assert.calledOnce(stripeHelper.getCustomerPaypalAgreement);
      sinon.assert.calledOnce(payPalHelper.processInvoice);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.updateCustomerBillingAddress,
        accountCustomer.stripeCustomerId,
        {
          city: 'Toronto',
          country: 'CA',
          line1: undefined,
          line2: undefined,
          postalCode: undefined,
          state: 'Ontario',
        }
      );
    });

    it('should update the billing agreement and process zero invoice', async () => {
      subscription.latest_invoice.amount_due = 0;
      invoices.push(subscription.latest_invoice);
      subscription.latest_invoice.subscription = subscription;
      payPalHelper.processZeroInvoice = sinon.fake.resolves({});
      const actual = await runTest(
        '/oauth/subscriptions/paymentmethod/billing-agreement',
        defaultRequestOptions
      );
      assert.deepEqual(actual, filterCustomer(customer));
      sinon.assert.calledOnce(stripeHelper.fetchCustomer);
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
        '/oauth/subscriptions/paymentmethod/billing-agreement',
        defaultRequestOptions
      );
      assert.deepEqual(actual, filterCustomer(customer));
      sinon.assert.calledOnce(stripeHelper.fetchCustomer);
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
        await runTest(
          '/oauth/subscriptions/paymentmethod/billing-agreement',
          defaultRequestOptions
        );
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
        await runTest(
          '/oauth/subscriptions/paymentmethod/billing-agreement',
          defaultRequestOptions
        );
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
