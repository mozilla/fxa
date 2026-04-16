/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';
import {
  filterCustomer,
  filterSubscription,
} from 'fxa-shared/subscriptions/stripe';
import { AppError as error } from '@fxa/accounts/errors';
import { PayPalHelper } from '../../payments/paypal/helper';
import * as uuid from 'uuid';
import { StripeHelper } from '../../payments/stripe';
import { CurrencyHelper } from '../../payments/currencies';
import { AuthLogger, AppConfig } from '../../types';
import { SubscriptionEligibilityResult } from 'fxa-shared/subscriptions/types';
import { OAUTH_SCOPE_SUBSCRIPTIONS } from 'fxa-shared/oauth/constants';
import { CapabilityService } from '../../payments/capability';
import { PlaySubscriptions } from '../../payments/iap/google-play/subscriptions';
import { AppStoreSubscriptions } from '../../payments/iap/apple-app-store/subscriptions';
import { PlayBilling } from '../../payments/iap/google-play';

const deleteAccountIfUnverifiedStub = jest.fn();
const buildTaxAddressStub = jest.fn();

jest.mock('../utils/account', () => ({
  deleteAccountIfUnverified: deleteAccountIfUnverifiedStub,
}));

jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  buildTaxAddress: buildTaxAddressStub,
}));

const { getRoute } = require('../../../test/routes_helpers');
const mocks = require('../../../test/mocks');
const customerFixture = require('../../../test/local/payments/fixtures/stripe/customer1.json');
const planFixture = require('../../../test/local/payments/fixtures/stripe/plan1.json');
const subscription2 = require('../../../test/local/payments/fixtures/stripe/subscription2.json');
const openInvoice = require('../../../test/local/payments/fixtures/stripe/invoice_open.json');
const buildRoutes = require('.').default;

const ACCOUNT_LOCALE = 'en-US';
const TEST_EMAIL = 'test@email.com';
const UID = uuid.v4({}, Buffer.alloc(16)).toString('hex');
const MOCK_SCOPES = ['profile:email', OAUTH_SCOPE_SUBSCRIPTIONS];

let log: any,
  config: any,
  customs: any,
  currencyHelper: any,
  request: any,
  payPalHelper: any,
  token: any,
  stripeHelper: any,
  capabilityService: any,
  profile: any,
  push: any;

function runTest(routePath: string, requestOptions: any) {
  const db = mocks.mockDB({
    uid: UID,
    email: TEST_EMAIL,
    locale: ACCOUNT_LOCALE,
    verifierSetAt: requestOptions.verifierSetAt,
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
 */
function deepCopy(object: any) {
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
        unsupportedLocations: ['CN'],
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
    stripeHelper = {} as any;
    for (
      let p = StripeHelper.prototype;
      p && p !== Object.prototype;
      p = Object.getPrototypeOf(p)
    ) {
      Object.getOwnPropertyNames(p).forEach((m) => {
        if (m !== 'constructor' && !stripeHelper[m])
          stripeHelper[m] = jest.fn();
      });
    }
    Container.set(StripeHelper, stripeHelper);
    payPalHelper = {} as any;
    for (
      let p = PayPalHelper.prototype;
      p && p !== Object.prototype;
      p = Object.getPrototypeOf(p)
    ) {
      Object.getOwnPropertyNames(p).forEach((m) => {
        if (m !== 'constructor' && !payPalHelper[m])
          payPalHelper[m] = jest.fn();
      });
    }
    payPalHelper.currencyHelper = currencyHelper;
    Container.set(PayPalHelper, payPalHelper);
    profile = {};
    capabilityService = {} as any;
    for (
      let p = CapabilityService.prototype;
      p && p !== Object.prototype;
      p = Object.getPrototypeOf(p)
    ) {
      Object.getOwnPropertyNames(p).forEach((m) => {
        if (m !== 'constructor' && !capabilityService[m])
          capabilityService[m] = jest.fn();
      });
    }
    Container.set(CapabilityService, capabilityService);
    push = {};
    Container.set(PlaySubscriptions, {});
    Container.set(AppStoreSubscriptions, {});
    mocks.mockPriceManager();
    mocks.mockProductConfigurationManager();
  });

  afterEach(() => {
    Container.reset();
  });

  describe('POST /oauth/subscriptions/paypal-checkout', () => {
    beforeEach(() => {
      payPalHelper.getCheckoutToken = jest.fn().mockResolvedValue(token);
    });

    it('should call PayPalHelper.getCheckoutToken and return token in an object', async () => {
      const response = await runTest(
        '/oauth/subscriptions/paypal-checkout',
        defaultRequestOptions
      );
      expect(payPalHelper.getCheckoutToken).toHaveBeenCalledTimes(1);
      expect(response).toEqual({ token });
    });

    it('should log the call', async () => {
      await runTest(
        '/oauth/subscriptions/paypal-checkout',
        defaultRequestOptions
      );
      expect(log.begin).toHaveBeenCalledTimes(1);
      expect(log.begin).toHaveBeenCalledWith(
        'subscriptions.getCheckoutToken',
        request
      );
      expect(log.info).toHaveBeenCalledTimes(1);
      expect(log.info).toHaveBeenCalledWith(
        'subscriptions.getCheckoutToken.success',
        { token: token }
      );
    });

    it('should do a customs check', async () => {
      await runTest(
        '/oauth/subscriptions/paypal-checkout',
        defaultRequestOptions
      );
      expect(customs.checkAuthenticated).toHaveBeenCalledTimes(1);
      expect(customs.checkAuthenticated).toHaveBeenCalledWith(
        request,
        UID,
        TEST_EMAIL,
        'getCheckoutToken'
      );
    });
  });

  describe('POST /oauth/subscriptions/active/new-paypal', () => {
    let plan: any, customer: any, subscription: any, promotionCode: any;

    beforeEach(() => {
      stripeHelper.findCustomerSubscriptionByPlanId = jest
        .fn()
        .mockReturnValue(undefined);
      capabilityService.getPlanEligibility = jest.fn().mockResolvedValue({
        subscriptionEligibilityResult: SubscriptionEligibilityResult.CREATE,
      });
      stripeHelper.cancelSubscription = jest.fn().mockResolvedValue({});
      payPalHelper.cancelBillingAgreement = jest.fn().mockResolvedValue({});
      profile.deleteCache = jest.fn().mockResolvedValue({});
      push.notifyProfileUpdated = jest.fn().mockResolvedValue({});
      plan = deepCopy(planFixture);
      customer = deepCopy(customerFixture);
      subscription = deepCopy(subscription2);
      subscription.latest_invoice = deepCopy(openInvoice);
      stripeHelper.fetchCustomer = jest.fn().mockResolvedValue(customer);
      stripeHelper.findAbbrevPlanById = jest.fn().mockResolvedValue(plan);
      payPalHelper.createBillingAgreement = jest
        .fn()
        .mockResolvedValue('B-test');
      payPalHelper.agreementDetails = jest.fn().mockResolvedValue({
        firstName: 'Test',
        lastName: 'User',
        countryCode: 'CA',
      });
      stripeHelper.customerTaxId = jest.fn().mockReturnValue(undefined);
      stripeHelper.addTaxIdToCustomer = jest.fn().mockResolvedValue({});
      stripeHelper.createSubscriptionWithPaypal = jest
        .fn()
        .mockResolvedValue(subscription);
      stripeHelper.updateCustomerPaypalAgreement = jest
        .fn()
        .mockResolvedValue(customer);
      promotionCode = { coupon: { id: 'test-coupon' } };
      stripeHelper.findValidPromoCode = jest
        .fn()
        .mockResolvedValue(promotionCode);
      buildTaxAddressStub.mockReturnValue({
        countryCode: 'US',
        postalCode: '92841',
      });
    });

    afterEach(() => {
      buildTaxAddressStub.mockReset();
      deleteAccountIfUnverifiedStub.mockReset();
    });

    describe('existing PayPal subscriber with no billing agreement on record', () => {
      it('throws a missing PayPal billing agreement error', async () => {
        const c = deepCopy(customer);
        c.subscriptions.data[0].collection_method = 'send_invoice';
        stripeHelper.fetchCustomer = jest.fn().mockResolvedValue(c);
        stripeHelper.getCustomerPaypalAgreement = jest
          .fn()
          .mockReturnValue(undefined);

        try {
          await runTest(
            '/oauth/subscriptions/active/new-paypal',
            defaultRequestOptions
          );
          throw new Error('Should have thrown an error');
        } catch (err: any) {
          expect(err).toEqual(error.missingPaypalBillingAgreement(c.id));
        }
      });
    });

    describe('new customer with no PayPal token', () => {
      it('throws a missing PayPal payment token error', async () => {
        authDbModule.getAccountCustomerByUid = jest
          .fn()
          .mockResolvedValue(accountCustomer);
        stripeHelper.getCustomerPaypalAgreement = jest
          .fn()
          .mockReturnValue(undefined);

        try {
          await runTest(
            '/oauth/subscriptions/active/new-paypal',
            defaultRequestOptions
          );
          throw new Error('Should have thrown an error');
        } catch (err: any) {
          expect(err).toEqual(error.missingPaypalPaymentToken(customer.id));
        }
      });

      describe('deleteAccountIfUnverified', () => {
        it('calls deleteAccountIfUnverified', async () => {
          const requestOptions = deepCopy(defaultRequestOptions);
          requestOptions.verifierSetAt = 0;
          stripeHelper.fetchCustomer = jest.fn().mockImplementation(() => {
            throw error.backendServiceFailure();
          });
          deleteAccountIfUnverifiedStub.mockReturnValue(null);

          try {
            await runTest('/oauth/subscriptions/active/new-paypal', {
              ...requestOptions,
              payload: { token },
            });
            throw new Error(
              'Create subscription with wrong planCurrency should fail.'
            );
          } catch (err: any) {
            expect(err.errno).toBe(error.ERRNO.BACKEND_SERVICE_FAILURE);
            expect(deleteAccountIfUnverifiedStub).toHaveBeenCalledTimes(1);
          }
        });

        it('ignores account exists error from deleteAccountIfUnverified', async () => {
          const requestOptions = deepCopy(defaultRequestOptions);
          requestOptions.verifierSetAt = 0;
          stripeHelper.fetchCustomer = jest.fn().mockImplementation(() => {
            throw error.backendServiceFailure();
          });
          deleteAccountIfUnverifiedStub.mockImplementation(() => {
            throw error.accountExists(undefined);
          });

          try {
            await runTest('/oauth/subscriptions/active/new-paypal', {
              ...requestOptions,
              payload: { token },
            });
            throw new Error(
              'Create subscription with wrong planCurrency should fail.'
            );
          } catch (err: any) {
            expect(err.errno).toBe(error.ERRNO.BACKEND_SERVICE_FAILURE);
            expect(deleteAccountIfUnverifiedStub).toHaveBeenCalledTimes(1);
          }
        });

        it('ignores verified email error from deleteAccountIfUnverified', async () => {
          const requestOptions = deepCopy(defaultRequestOptions);
          requestOptions.verifierSetAt = 0;
          stripeHelper.fetchCustomer = jest.fn().mockImplementation(() => {
            throw error.backendServiceFailure();
          });
          deleteAccountIfUnverifiedStub.mockImplementation(() => {
            throw error.verifiedSecondaryEmailAlreadyExists();
          });

          try {
            await runTest('/oauth/subscriptions/active/new-paypal', {
              ...requestOptions,
              payload: { token },
            });
            throw new Error(
              'Create subscription with wrong planCurrency should fail.'
            );
          } catch (err: any) {
            expect(err.errno).toBe(error.ERRNO.BACKEND_SERVICE_FAILURE);
            expect(deleteAccountIfUnverifiedStub).toHaveBeenCalledTimes(1);
          }
        });
      });
    });

    describe('customer that is has an incomplete subscription', () => {
      it('throws a user is already subscribed to product error', async () => {
        capabilityService.getPlanEligibility = jest
          .fn()
          .mockResolvedValue(SubscriptionEligibilityResult.UPGRADE);

        try {
          await runTest('/oauth/subscriptions/active/new-paypal', {
            ...defaultRequestOptions,
            payload: { token },
          });
          throw new Error('Should have thrown an error');
        } catch (err: any) {
          expect(err).toEqual(error.userAlreadySubscribedToProduct());
        }
      });
    });

    describe('customer that is ineligible for product', () => {
      it('throws a user is already subscribed to product error', async () => {
        capabilityService.getPlanEligibility = jest
          .fn()
          .mockResolvedValue(SubscriptionEligibilityResult.UPGRADE);

        try {
          await runTest('/oauth/subscriptions/active/new-paypal', {
            ...defaultRequestOptions,
            payload: { token },
          });
          throw new Error('Should have thrown an error');
        } catch (err: any) {
          expect(err).toEqual(error.userAlreadySubscribedToProduct());
        }
      });

      it('should cleanup incomplete subscriptions', async () => {
        stripeHelper.findCustomerSubscriptionByPlanId = jest
          .fn()
          .mockReturnValue({
            status: 'incomplete',
          });
        capabilityService.getPlanEligibility = jest
          .fn()
          .mockResolvedValue(SubscriptionEligibilityResult.UPGRADE);

        try {
          await runTest('/oauth/subscriptions/active/new-paypal', {
            ...defaultRequestOptions,
            payload: { token },
          });
        } catch (err: any) {
          expect(stripeHelper.cancelSubscription).toHaveBeenCalledTimes(1);
        }
      });
    });

    describe('existing PayPal customer with a PayPal token', () => {
      it('throws a billing agreement already exists error', async () => {
        const c = deepCopy(customer);
        c.subscriptions.data[0].collection_method = 'send_invoice';
        stripeHelper.fetchCustomer = jest.fn().mockResolvedValue(c);
        authDbModule.getAccountCustomerByUid = jest
          .fn()
          .mockResolvedValue(accountCustomer);
        stripeHelper.getCustomerPaypalAgreement = jest
          .fn()
          .mockReturnValue(paypalAgreementId);

        try {
          await runTest('/oauth/subscriptions/active/new-paypal', {
            ...defaultRequestOptions,
            payload: { token },
          });
          throw new Error('Should have thrown an error');
        } catch (err: any) {
          expect(err).toEqual(error.billingAgreementExists(customer.id));
        }
      });
    });

    describe('new subscription with a PayPal payment token', () => {
      beforeEach(() => {
        authDbModule.getAccountCustomerByUid = jest
          .fn()
          .mockResolvedValue(accountCustomer);
        stripeHelper.updateCustomerPaypalAgreement = jest
          .fn()
          .mockResolvedValue({});
        stripeHelper.isCustomerTaxableWithSubscriptionCurrency = jest
          .fn()
          .mockReturnValue(true);
        payPalHelper.processInvoice = jest.fn().mockResolvedValue({});
        payPalHelper.processZeroInvoice = jest.fn().mockResolvedValue({});
      });

      function assertChargedSuccessfully(actual: any) {
        expect(actual).toEqual({
          sourceCountry: 'CA',
          subscription: filterSubscription(subscription),
        });
        expect(stripeHelper.fetchCustomer).toHaveBeenCalledTimes(1);
        expect(payPalHelper.createBillingAgreement).toHaveBeenCalledTimes(1);
        expect(payPalHelper.agreementDetails).toHaveBeenCalledTimes(1);
        expect(stripeHelper.createSubscriptionWithPaypal).toHaveBeenCalledTimes(
          1
        );
        expect(
          stripeHelper.updateCustomerPaypalAgreement
        ).toHaveBeenCalledTimes(1);
        expect(payPalHelper.processInvoice).toHaveBeenCalledTimes(1);
      }

      it('should run a charge successfully', async () => {
        const requestOptions = deepCopy(defaultRequestOptions);
        requestOptions.geo = {
          location: {
            countryCode: 'CA',
            state: 'Ontario',
          },
        };
        const actual = await runTest('/oauth/subscriptions/active/new-paypal', {
          ...requestOptions,
          payload: { token },
        });
        assertChargedSuccessfully(actual);
        expect(stripeHelper.findValidPromoCode).not.toHaveBeenCalled();
        expect(stripeHelper.createSubscriptionWithPaypal).toHaveBeenCalledWith({
          customer,
          priceId: undefined,
          promotionCode: undefined,
          subIdempotencyKey: undefined,
          automaticTax: true,
        });
      });

      it('should run a charge successfully with coupon', async () => {
        const requestOptions = deepCopy(defaultRequestOptions);
        requestOptions.geo = {
          location: {
            countryCode: 'CA',
            state: 'Ontario',
          },
        };
        const actual = await runTest('/oauth/subscriptions/active/new-paypal', {
          ...requestOptions,
          payload: { token, promotionCode: 'test-promo' },
        });
        assertChargedSuccessfully(actual);
        expect(stripeHelper.findValidPromoCode).toHaveBeenCalledWith(
          'test-promo',
          undefined
        );
        expect(stripeHelper.createSubscriptionWithPaypal).toHaveBeenCalledWith({
          customer,
          priceId: undefined,
          promotionCode,
          subIdempotencyKey: undefined,
          automaticTax: true,
        });
      });

      it('should run a charge with automatic tax in unsupported region successfully', async () => {
        const requestOptions = deepCopy(defaultRequestOptions);
        requestOptions.geo = {
          location: {
            countryCode: 'CA',
            state: 'Ontario',
          },
        };
        stripeHelper.isCustomerTaxableWithSubscriptionCurrency = jest
          .fn()
          .mockReturnValue(false);
        const actual = await runTest('/oauth/subscriptions/active/new-paypal', {
          ...requestOptions,
          payload: { token },
        });
        assertChargedSuccessfully(actual);
        expect(stripeHelper.findValidPromoCode).not.toHaveBeenCalled();
        expect(stripeHelper.createSubscriptionWithPaypal).toHaveBeenCalledWith({
          customer,
          priceId: undefined,
          promotionCode: undefined,
          subIdempotencyKey: undefined,
          automaticTax: false,
        });
      });

      it('should skip a zero charge successfully', async () => {
        subscription.latest_invoice.amount_due = 0;
        const actual = await runTest('/oauth/subscriptions/active/new-paypal', {
          ...defaultRequestOptions,
          payload: { token },
        });
        expect(actual).toEqual({
          sourceCountry: 'CA',
          subscription: filterSubscription(subscription),
        });
        expect(stripeHelper.fetchCustomer).toHaveBeenCalledTimes(1);
        expect(payPalHelper.createBillingAgreement).toHaveBeenCalledTimes(1);
        expect(payPalHelper.agreementDetails).toHaveBeenCalledTimes(1);
        expect(stripeHelper.createSubscriptionWithPaypal).toHaveBeenCalledTimes(
          1
        );
        expect(
          stripeHelper.updateCustomerPaypalAgreement
        ).toHaveBeenCalledTimes(1);
        expect(payPalHelper.processZeroInvoice).toHaveBeenCalledTimes(1);
      });

      it('throws an error if customer is in unsupported location', async () => {
        const requestOptions = deepCopy(defaultRequestOptions);
        requestOptions.geo = {
          location: {
            countryCode: 'CN',
          },
        };

        buildTaxAddressStub.mockReturnValue({ countryCode: 'CN' });

        try {
          await runTest('/oauth/subscriptions/active/new-paypal', {
            ...requestOptions,
            payload: { token },
          });
          throw new Error('Should have thrown an error');
        } catch (err: any) {
          expect(err.message).toBe(
            'Location is not supported according to our Terms of Service.'
          );
        }
      });

      it('should throw an error if invalid promotion code', async () => {
        stripeHelper.findValidPromoCode = jest
          .fn()
          .mockRejectedValue(error.invalidPromoCode('invalid-promo'));
        try {
          await runTest('/oauth/subscriptions/active/new-paypal', {
            ...defaultRequestOptions,
            payload: { token, promotionCode: 'invalid-promo' },
          });
          throw new Error('Should have thrown an error');
        } catch (err: any) {
          expect(err.message).toBe('Invalid promotion code');
        }
        expect(stripeHelper.findValidPromoCode).toHaveBeenCalledWith(
          'invalid-promo',
          undefined
        );
      });

      it('should throw an error if planCurrency does not match billingAgreement country', async () => {
        payPalHelper.agreementDetails = jest.fn().mockResolvedValue({
          firstName: 'Test',
          lastName: 'User',
          countryCode: 'AS',
        });
        try {
          await runTest('/oauth/subscriptions/active/new-paypal', {
            ...defaultRequestOptions,
            payload: { token },
          });
          throw new Error('Should have thrown an error');
        } catch (err: any) {
          expect(err.message).toBe(
            'Funding source country does not match plan currency.'
          );
        }
      });

      it('should throw an error if billingAgreement country does not match planCurrency', async () => {
        plan.currency = 'eur';
        stripeHelper.findAbbrevPlanById = jest.fn().mockResolvedValue(plan);
        try {
          await runTest('/oauth/subscriptions/active/new-paypal', {
            ...defaultRequestOptions,
            payload: { token },
          });
          throw new Error('Should have thrown an error');
        } catch (err: any) {
          expect(err.message).toBe(
            'Funding source country does not match plan currency.'
          );
        }
      });

      it('should throw an error if the invoice processing fails', async () => {
        payPalHelper.processInvoice = jest
          .fn()
          .mockRejectedValue(error.paymentFailed());
        try {
          await runTest('/oauth/subscriptions/active/new-paypal', {
            ...defaultRequestOptions,
            payload: { token },
          });
          throw new Error('Should have thrown an error');
        } catch (err: any) {
          expect(err).toEqual(error.paymentFailed());
          expect(stripeHelper.cancelSubscription).toHaveBeenCalledTimes(1);
          expect(payPalHelper.cancelBillingAgreement).toHaveBeenCalledTimes(1);
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
        stripeHelper.fetchCustomer = jest.fn().mockResolvedValue(c);
        stripeHelper.isCustomerTaxableWithSubscriptionCurrency = jest
          .fn()
          .mockReturnValue(true);
        stripeHelper.getCustomerPaypalAgreement = jest
          .fn()
          .mockReturnValue(paypalAgreementId);
        payPalHelper.processInvoice = jest.fn().mockResolvedValue({});
        stripeHelper.updateCustomerPaypalAgreement = jest
          .fn()
          .mockResolvedValue({});
      });

      it('should run a charge successfully', async () => {
        const actual = await runTest(
          '/oauth/subscriptions/active/new-paypal',
          defaultRequestOptions
        );

        expect(payPalHelper.createBillingAgreement).not.toHaveBeenCalled();
        expect(payPalHelper.agreementDetails).not.toHaveBeenCalled();
        expect(
          stripeHelper.updateCustomerPaypalAgreement
        ).not.toHaveBeenCalled();
        expect(stripeHelper.findValidPromoCode).not.toHaveBeenCalled();
        expect(stripeHelper.customerTaxId).toHaveBeenCalledTimes(1);
        expect(stripeHelper.addTaxIdToCustomer).toHaveBeenCalledTimes(1);
        expect(stripeHelper.createSubscriptionWithPaypal).toHaveBeenCalledWith({
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
          promotionCode: undefined,
          subIdempotencyKey: undefined,
          automaticTax: true,
        });

        expect(actual).toEqual({
          sourceCountry: 'GD',
          subscription: filterSubscription(subscription),
        });
        expect(stripeHelper.fetchCustomer).toHaveBeenCalledTimes(1);
        expect(stripeHelper.createSubscriptionWithPaypal).toHaveBeenCalledTimes(
          1
        );
        expect(payPalHelper.processInvoice).toHaveBeenCalledTimes(1);
      });

      it('should run a charge successfully with a coupon', async () => {
        const requestOptions = deepCopy(defaultRequestOptions);
        requestOptions.payload = { promotionCode: 'test-promo' };
        const actual = await runTest(
          '/oauth/subscriptions/active/new-paypal',
          requestOptions
        );

        expect(payPalHelper.createBillingAgreement).not.toHaveBeenCalled();
        expect(payPalHelper.agreementDetails).not.toHaveBeenCalled();
        expect(
          stripeHelper.updateCustomerPaypalAgreement
        ).not.toHaveBeenCalled();
        expect(stripeHelper.findValidPromoCode).toHaveBeenCalledWith(
          'test-promo',
          undefined
        );
        expect(stripeHelper.customerTaxId).toHaveBeenCalledTimes(1);
        expect(stripeHelper.addTaxIdToCustomer).toHaveBeenCalledTimes(1);
        expect(stripeHelper.createSubscriptionWithPaypal).toHaveBeenCalledWith({
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
          promotionCode,
          subIdempotencyKey: undefined,
          automaticTax: true,
        });

        expect(actual).toEqual({
          sourceCountry: 'GD',
          subscription: filterSubscription(subscription),
        });
        expect(stripeHelper.fetchCustomer).toHaveBeenCalledTimes(1);
        expect(stripeHelper.createSubscriptionWithPaypal).toHaveBeenCalledTimes(
          1
        );
        expect(payPalHelper.processInvoice).toHaveBeenCalledTimes(1);
      });

      it('should skip a zero charge successfully', async () => {
        subscription.latest_invoice.amount_due = 0;
        payPalHelper.processZeroInvoice = jest.fn().mockResolvedValue({});
        const actual = await runTest(
          '/oauth/subscriptions/active/new-paypal',
          defaultRequestOptions
        );
        expect(actual).toEqual({
          sourceCountry: 'GD',
          subscription: filterSubscription(subscription),
        });
        expect(payPalHelper.processZeroInvoice).toHaveBeenCalledTimes(1);
      });

      it('should throw an error if the invoice processing fails', async () => {
        payPalHelper.processInvoice = jest
          .fn()
          .mockRejectedValue(error.paymentFailed());
        try {
          await runTest(
            '/oauth/subscriptions/active/new-paypal',
            defaultRequestOptions
          );
          throw new Error('Should have thrown an error');
        } catch (err: any) {
          expect(err).toEqual(error.paymentFailed());
          expect(stripeHelper.cancelSubscription).toHaveBeenCalledTimes(1);
          expect(payPalHelper.cancelBillingAgreement).not.toHaveBeenCalled();
        }
      });
    });
  });

  describe('POST /oauth/subscriptions/paymentmethod/billing-agreement', () => {
    let plan: any, customer: any, subscription: any, invoices: any[];

    beforeEach(() => {
      invoices = [];

      async function* genInvoice() {
        for (const invoice of invoices) {
          yield invoice;
        }
      }

      authDbModule.getAccountCustomerByUid = jest
        .fn()
        .mockResolvedValue(accountCustomer);
      stripeHelper.getCustomerPaypalAgreement = jest
        .fn()
        .mockReturnValue(undefined);
      stripeHelper.fetchOpenInvoices.mockReturnValue(genInvoice());
      profile.deleteCache = jest.fn().mockResolvedValue({});
      push.notifyProfileUpdated = jest.fn().mockResolvedValue({});
      plan = deepCopy(planFixture);
      customer = deepCopy(customerFixture);
      subscription = deepCopy(subscription2);
      subscription.collection_method = 'send_invoice';
      subscription.latest_invoice = deepCopy(openInvoice);
      customer.subscriptions.data = [subscription];
      stripeHelper.fetchCustomer = jest.fn().mockResolvedValue(customer);
      stripeHelper.findAbbrevPlanById = jest.fn().mockResolvedValue(plan);
      payPalHelper.createBillingAgreement = jest
        .fn()
        .mockResolvedValue('B-test');
      payPalHelper.agreementDetails = jest.fn().mockResolvedValue({
        firstName: 'Test',
        lastName: 'User',
        countryCode: 'CA',
      });
      stripeHelper.updateCustomerPaypalAgreement = jest
        .fn()
        .mockResolvedValue(customer);
    });

    it('should update the billing agreement and process invoice', async () => {
      const requestOptions = deepCopy(defaultRequestOptions);
      requestOptions.geo = {
        location: {
          countryCode: 'CA',
          state: 'Ontario',
        },
      };
      invoices.push(subscription.latest_invoice);
      subscription.latest_invoice.subscription = subscription;
      const actual = await runTest(
        '/oauth/subscriptions/paymentmethod/billing-agreement',
        requestOptions
      );
      expect(actual).toEqual(filterCustomer(customer));
      expect(stripeHelper.fetchCustomer).toHaveBeenCalledTimes(1);
      expect(payPalHelper.createBillingAgreement).toHaveBeenCalledTimes(1);
      expect(payPalHelper.agreementDetails).toHaveBeenCalledTimes(1);
      expect(stripeHelper.updateCustomerPaypalAgreement).toHaveBeenCalledTimes(
        1
      );
      expect(stripeHelper.fetchOpenInvoices).toHaveBeenCalledTimes(1);
      expect(stripeHelper.getCustomerPaypalAgreement).toHaveBeenCalledTimes(1);
      expect(payPalHelper.processInvoice).toHaveBeenCalledTimes(1);
    });

    it('should update the billing agreement and process zero invoice', async () => {
      subscription.latest_invoice.amount_due = 0;
      invoices.push(subscription.latest_invoice);
      subscription.latest_invoice.subscription = subscription;
      payPalHelper.processZeroInvoice = jest.fn().mockResolvedValue({});
      const actual = await runTest(
        '/oauth/subscriptions/paymentmethod/billing-agreement',
        defaultRequestOptions
      );
      expect(actual).toEqual(filterCustomer(customer));
      expect(stripeHelper.fetchCustomer).toHaveBeenCalledTimes(1);
      expect(payPalHelper.createBillingAgreement).toHaveBeenCalledTimes(1);
      expect(payPalHelper.agreementDetails).toHaveBeenCalledTimes(1);
      expect(stripeHelper.updateCustomerPaypalAgreement).toHaveBeenCalledTimes(
        1
      );
      expect(stripeHelper.fetchOpenInvoices).toHaveBeenCalledTimes(1);
      expect(stripeHelper.getCustomerPaypalAgreement).toHaveBeenCalledTimes(1);
      expect(payPalHelper.processZeroInvoice).toHaveBeenCalledTimes(1);
      expect(payPalHelper.processInvoice).not.toHaveBeenCalled();
    });

    it('should update the billing agreement', async () => {
      const actual = await runTest(
        '/oauth/subscriptions/paymentmethod/billing-agreement',
        defaultRequestOptions
      );
      expect(actual).toEqual(filterCustomer(customer));
      expect(stripeHelper.fetchCustomer).toHaveBeenCalledTimes(1);
      expect(payPalHelper.createBillingAgreement).toHaveBeenCalledTimes(1);
      expect(payPalHelper.agreementDetails).toHaveBeenCalledTimes(1);
      expect(stripeHelper.updateCustomerPaypalAgreement).toHaveBeenCalledTimes(
        1
      );
      expect(stripeHelper.fetchOpenInvoices).toHaveBeenCalledTimes(1);
      expect(stripeHelper.getCustomerPaypalAgreement).toHaveBeenCalledTimes(1);
      expect(payPalHelper.processInvoice).not.toHaveBeenCalled();
    });

    it('should throw an error if billingAgreement country does not match planCurrency', async () => {
      customer.currency = 'eur';
      stripeHelper.findAbbrevPlanById = jest.fn().mockResolvedValue(plan);
      try {
        await runTest(
          '/oauth/subscriptions/paymentmethod/billing-agreement',
          defaultRequestOptions
        );
        throw new Error('Should have thrown an error');
      } catch (err: any) {
        expect(err.message).toBe(
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
        throw new Error('Should have thrown an error');
      } catch (err: any) {
        expect(err.output.payload.data.message).toBe(
          'User is missing paypal subscriptions or currency value.'
        );
      }
    });
  });
});
