/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { default as Container } from 'typedi';

const uuid = require('uuid');
const mocks = require('../../../test/mocks');
const { AppError: error } = require('@fxa/accounts/errors');
const Sentry = require('@sentry/node');
const sentryModule = require('../../sentry');
const {
  StripeHelper,
  SUBSCRIPTION_UPDATE_TYPES,
  CUSTOMER_RESOURCE,
} = require('../../payments/stripe');
const moment = require('moment');
const authDbModule = require('fxa-shared/db/models/auth');

const { StripeWebhookHandler } = require('./stripe-webhook');

const customerFixture = require('../../../test/local/payments/fixtures/stripe/customer1.json');
const invoiceFixture = require('../../../test/local/payments/fixtures/stripe/invoice_paid.json');
const subscriptionCreated = require('../../../test/local/payments/fixtures/stripe/subscription_created.json');
const subscriptionCreatedIncomplete = require('../../../test/local/payments/fixtures/stripe/subscription_created_incomplete.json');
const subscriptionDeleted = require('../../../test/local/payments/fixtures/stripe/subscription_deleted.json');
const subscriptionReplaced = require('../../../test/local/payments/fixtures/stripe/subscription_replaced.json');
const subscriptionUpdated = require('../../../test/local/payments/fixtures/stripe/subscription_updated.json');
const subscriptionUpdatedFromIncomplete = require('../../../test/local/payments/fixtures/stripe/subscription_updated_from_incomplete.json');
const eventInvoiceCreated = require('../../../test/local/payments/fixtures/stripe/event_invoice_created.json');
const eventInvoicePaid = require('../../../test/local/payments/fixtures/stripe/event_invoice_paid.json');
const eventInvoicePaymentFailed = require('../../../test/local/payments/fixtures/stripe/event_invoice_payment_failed.json');
const eventInvoiceUpcoming = require('../../../test/local/payments/fixtures/stripe/event_invoice_upcoming.json');
const eventCouponCreated = require('../../../test/local/payments/fixtures/stripe/event_coupon_created.json');
const eventCustomerUpdated = require('../../../test/local/payments/fixtures/stripe/event_customer_updated.json');
const eventCustomerSubscriptionUpdated = require('../../../test/local/payments/fixtures/stripe/event_customer_subscription_updated.json');
const eventCustomerSourceExpiring = require('../../../test/local/payments/fixtures/stripe/event_customer_source_expiring.json');
const eventProductUpdated = require('../../../test/local/payments/fixtures/stripe/product_updated_event.json');
const eventPlanUpdated = require('../../../test/local/payments/fixtures/stripe/plan_updated_event.json');
const eventCreditNoteCreated = require('../../../test/local/payments/fixtures/stripe/event_credit_note_created.json');
const eventTaxRateCreated = require('../../../test/local/payments/fixtures/stripe/event_tax_rate_created.json');
const eventTaxRateUpdated = require('../../../test/local/payments/fixtures/stripe/event_tax_rate_created.json');
const { PayPalHelper } = require('../../payments/paypal/helper');
const { CapabilityService } = require('../../payments/capability');
const { CurrencyHelper } = require('../../payments/currencies');
const { asyncIterable } = require('../../../test/mocks');
const { RefusedError } = require('../../payments/paypal/error');
const { RefundType } = require('@fxa/payments/paypal');
const {
  FirestoreStripeErrorBuilder,
  FirestoreStripeError,
} = require('fxa-shared/payments/stripe-firestore');

let config: any,
  log: any,
  db: any,
  customs: any,
  push: any,
  mailer: any,
  profile: any,
  mockCapabilityService: any;

const ACCOUNT_LOCALE = 'en-US';
const TEST_EMAIL = 'test@email.com';
const UID = uuid.v4({}, Buffer.alloc(16)).toString('hex');

const MOCK_CLIENT_ID = '3c49430b43dfba77';
const MOCK_TTL = 3600;

/**
 * To prevent the modification of the test objects loaded, which can impact other tests referencing the object,
 * a deep copy of the object can be created which uses the test object as a template
 *
 * @param {Object} object
 */
function deepCopy(object: any) {
  return JSON.parse(JSON.stringify(object));
}

describe('StripeWebhookHandler', () => {
  let StripeWebhookHandlerInstance: any;

  beforeEach(() => {
    mockCapabilityService = {
      stripeUpdate: jest.fn().mockResolvedValue({}),
    };

    config = {
      authFirestore: {
        enabled: false,
      },
      subscriptions: {
        enabled: true,
        managementClientId: MOCK_CLIENT_ID,
        managementTokenTTL: MOCK_TTL,
        stripeApiKey: 'sk_test_1234',
        paypalNvpSigCredentials: {
          enabled: true,
        },
        productConfigsFirestore: { enabled: false },
        unsupportedLocations: [],
      },
    };

    log = mocks.mockLog();
    customs = mocks.mockCustoms();
    profile = mocks.mockProfile({
      deleteCache: jest.fn(async (uid: any) => ({})),
    });
    mailer = mocks.mockMailer();

    db = mocks.mockDB({
      uid: UID,
      email: TEST_EMAIL,
      locale: ACCOUNT_LOCALE,
    });
    const stripeHelperMock: any = {};
    for (
      let p = StripeHelper.prototype;
      p && p !== Object.prototype;
      p = Object.getPrototypeOf(p)
    ) {
      Object.getOwnPropertyNames(p).forEach((m) => {
        if (m !== 'constructor' && !stripeHelperMock[m])
          stripeHelperMock[m] = jest.fn();
      });
    }
    const paypalHelperMock: any = {};
    for (
      let p = PayPalHelper.prototype;
      p && p !== Object.prototype;
      p = Object.getPrototypeOf(p)
    ) {
      Object.getOwnPropertyNames(p).forEach((m) => {
        if (m !== 'constructor' && !paypalHelperMock[m])
          paypalHelperMock[m] = jest.fn();
      });
    }
    Container.set(CurrencyHelper, {});
    Container.set(PayPalHelper, paypalHelperMock);
    Container.set(StripeHelper, stripeHelperMock);
    Container.set(CapabilityService, mockCapabilityService);

    StripeWebhookHandlerInstance = new StripeWebhookHandler(
      log,
      db,
      config,
      customs,
      push,
      mailer,
      profile,
      stripeHelperMock
    );

    jest
      .spyOn(authDbModule, 'getUidAndEmailByStripeCustomerId')
      .mockResolvedValue({
        uid: UID,
        email: TEST_EMAIL,
      });
  });

  afterEach(() => {
    Container.reset();
    jest.restoreAllMocks();
  });

  describe('stripe webhooks', () => {
    const validPlan = deepCopy(eventPlanUpdated);
    const plan1 = deepCopy(validPlan.data.object);
    const plan2 = deepCopy(validPlan.data.object);
    plan2.id = 'plan_123';
    const validPlanList = [plan1, plan2].map((p: any) => ({
      ...p,
      product: eventProductUpdated.data.object,
    }));
    const validProduct = deepCopy(eventProductUpdated);

    beforeEach(() => {
      StripeWebhookHandlerInstance.stripeHelper.fetchPlansByProductId.mockReturnValue(
        asyncIterable(deepCopy(validPlanList))
      );
      StripeWebhookHandlerInstance.stripeHelper.fetchProductById.mockReturnValue(
        {
          product_id: validProduct.data.object.id,
          product_name: validProduct.data.object.name,
          product_metadata: validProduct.data.object.metadata,
        }
      );
      StripeWebhookHandlerInstance.stripeHelper.expandResource.mockResolvedValue(
        {}
      );
      StripeWebhookHandlerInstance.stripeHelper.getCard.mockResolvedValue({});
    });

    describe('handleWebhookEvent', () => {
      let scopeContextSpy: any, scopeExtraSpy: any, scopeSpy: any;
      const request = {
        payload: {},
        headers: {
          'stripe-signature': 'stripe_123',
        },
      };
      const handlerNames = [
        'handleCouponEvent',
        'handleCustomerCreatedEvent',
        'handleSubscriptionCreatedEvent',
        'handleSubscriptionUpdatedEvent',
        'handleSubscriptionDeletedEvent',
        'handleCustomerUpdatedEvent',
        'handleCustomerSourceExpiringEvent',
        'handleProductWebhookEvent',
        'handlePlanCreatedOrUpdatedEvent',
        'handlePlanDeletedEvent',
        'handleCreditNoteEvent',
        'handleInvoicePaidEvent',
        'handleInvoicePaymentFailedEvent',
        'handleInvoiceCreatedEvent',
        'handleInvoiceUpcomingEvent',
        'handleTaxRateCreatedOrUpdatedEvent',
      ];
      const handlerStubs: any = {};

      beforeEach(() => {
        for (const handlerName of handlerNames) {
          handlerStubs[handlerName] = jest
            .spyOn(StripeWebhookHandlerInstance, handlerName)
            .mockResolvedValue(undefined);
        }
        scopeContextSpy = jest.fn();
        scopeExtraSpy = jest.fn();
        scopeSpy = {
          setContext: scopeContextSpy,
          setExtra: scopeExtraSpy,
        };
        jest
          .spyOn(Sentry, 'withScope')
          .mockImplementation((fn: any) => fn(scopeSpy));
      });

      const assertNamedHandlerCalled = (
        expectedHandlerName: string | null = null
      ) => {
        for (const handlerName of handlerNames) {
          const shouldCall =
            expectedHandlerName && handlerName === expectedHandlerName;
          if (shouldCall) {
            expect(handlerStubs[handlerName]).toHaveBeenCalled();
          } else {
            expect(handlerStubs[handlerName]).not.toHaveBeenCalled();
          }
        }
      };

      const itOnlyCallsThisHandler = (
        expectedHandlerName: string,
        event: any,
        expectSentry = false,
        expectExpandResource = true
      ) =>
        it(`only calls ${expectedHandlerName}`, async () => {
          const createdEvent = deepCopy(event);
          StripeWebhookHandlerInstance.stripeHelper.constructWebhookEvent.mockReturnValue(
            createdEvent
          );
          await StripeWebhookHandlerInstance.handleWebhookEvent(request);
          assertNamedHandlerCalled(expectedHandlerName);
          if (expectSentry) {
            expect(scopeContextSpy).toHaveBeenCalled();
          } else {
            expect(scopeContextSpy).not.toHaveBeenCalled();
          }
          if (expectedHandlerName === 'handleCustomerSourceExpiringEvent') {
            expect(
              StripeWebhookHandlerInstance.stripeHelper.getCard
            ).toHaveBeenCalledTimes(1);
          } else {
            if (expectExpandResource) {
              expect(
                StripeWebhookHandlerInstance.stripeHelper.expandResource
              ).toHaveBeenCalledTimes(1);
            } else {
              expect(
                StripeWebhookHandlerInstance.stripeHelper.expandResource
              ).not.toHaveBeenCalled();
            }
          }
        });

      describe('ignorable errors', () => {
        const commonIgnorableErrorTest = (expectedError: any) => async () => {
          const fixture = deepCopy(eventCustomerSourceExpiring);
          handlerStubs.handleCustomerSourceExpiringEvent.mockImplementation(
            () => {
              throw expectedError;
            }
          );
          StripeWebhookHandlerInstance.stripeHelper.constructWebhookEvent.mockReturnValue(
            fixture
          );
          let errorThrown: any = null;
          try {
            await StripeWebhookHandlerInstance.handleWebhookEvent(request);
            expect(StripeWebhookHandlerInstance.log.error).toHaveBeenCalledWith(
              'subscriptions.handleWebhookEvent.failure',
              { error: expectedError }
            );
          } catch (err) {
            errorThrown = err;
          }
          expect(errorThrown).toBeNull();
        };

        it(
          'ignores emailBouncedHard',
          commonIgnorableErrorTest(error.emailBouncedHard(42))
        );

        it(
          'ignores emailComplaint',
          commonIgnorableErrorTest(error.emailComplaint(42))
        );

        it(
          'ignores missingSubscriptionForSourceError',
          commonIgnorableErrorTest(
            error.missingSubscriptionForSourceError(
              'extractSourceDetailsForEmail'
            )
          )
        );
      });

      describe('FirestoreStripeErrorBuilder errors', () => {
        beforeEach(() => {
          const fixture = deepCopy(eventCustomerSourceExpiring);
          StripeWebhookHandlerInstance.stripeHelper.constructWebhookEvent.mockReturnValue(
            fixture
          );
        });

        it('should throw with FirestoreStripeErrorBuilder if no customerId is provided', async () => {
          const expectedError = new FirestoreStripeErrorBuilder(
            'testError',
            FirestoreStripeError.FIRESTORE_SUBSCRIPTION_NOT_FOUND
          );
          handlerStubs.handleCustomerSourceExpiringEvent.mockImplementation(
            () => {
              throw expectedError;
            }
          );
          try {
            await StripeWebhookHandlerInstance.handleWebhookEvent(request);
            throw new Error('handleWebhookEvent should throw an error');
          } catch (err) {
            expect(err).toEqual(expectedError);
          }
        });

        it('should throw with error from checkIfAccountExists if it rejects', async () => {
          const handlerError = new FirestoreStripeErrorBuilder(
            'testError',
            FirestoreStripeError.FIRESTORE_SUBSCRIPTION_NOT_FOUND,
            'cus_123'
          );
          const expectedError = new Error('UnknownError');
          handlerStubs.handleCustomerSourceExpiringEvent.mockImplementation(
            () => {
              throw handlerError;
            }
          );
          jest
            .spyOn(StripeWebhookHandlerInstance, 'checkIfAccountExists')
            .mockRejectedValue(expectedError);

          try {
            await StripeWebhookHandlerInstance.handleWebhookEvent(request);
            throw new Error('handleWebhookEvent should throw an error');
          } catch (err) {
            expect(err).toEqual(expectedError);
          }
        });

        it('should throw error if accountExists true', async () => {
          const expectedError = new FirestoreStripeErrorBuilder(
            'testError',
            FirestoreStripeError.FIRESTORE_SUBSCRIPTION_NOT_FOUND,
            'cus_123'
          );
          handlerStubs.handleCustomerSourceExpiringEvent.mockImplementation(
            () => {
              throw expectedError;
            }
          );
          jest
            .spyOn(StripeWebhookHandlerInstance, 'checkIfAccountExists')
            .mockResolvedValue(true);
          try {
            await StripeWebhookHandlerInstance.handleWebhookEvent(request);
            throw new Error('handleWebhookEvent should throw an error');
          } catch (err) {
            expect(err).toEqual(expectedError);
          }
        });

        it('should ignore error if accountExists false', async () => {
          let errorThrown: any = null;
          const expectedError = new FirestoreStripeErrorBuilder(
            'testError',
            FirestoreStripeError.FIRESTORE_SUBSCRIPTION_NOT_FOUND,
            'cus_123'
          );
          handlerStubs.handleCustomerSourceExpiringEvent.mockImplementation(
            () => {
              throw expectedError;
            }
          );
          jest
            .spyOn(StripeWebhookHandlerInstance, 'checkIfAccountExists')
            .mockResolvedValue(false);
          try {
            await StripeWebhookHandlerInstance.handleWebhookEvent(request);
          } catch (err) {
            errorThrown = err;
          }
          expect(StripeWebhookHandlerInstance.log.error).toHaveBeenCalledWith(
            'subscriptions.handleWebhookEvent.failure',
            { error: expectedError }
          );
          expect(errorThrown).toBeNull();
        });
      });

      describe('when the event.type is coupon.created', () => {
        itOnlyCallsThisHandler('handleCouponEvent', {
          data: { object: { id: 'coupon_123', object: 'coupon' } },
          type: 'coupon.created',
        });

        itOnlyCallsThisHandler(
          'handleCouponEvent',
          {
            data: { object: { id: 'coupon_123' } },
            type: 'coupon.created',
          },
          true,
          false
        );
      });

      describe('when the event.type is coupon.updated', () => {
        itOnlyCallsThisHandler('handleCouponEvent', {
          data: { object: { id: 'coupon_123', object: 'coupon' } },
          type: 'coupon.updated',
        });
      });

      describe('when the event.type is customer.created', () => {
        itOnlyCallsThisHandler('handleCustomerCreatedEvent', {
          data: { object: customerFixture },
          type: 'customer.created',
        });
      });

      describe('when the event.type is customer.subscription.created', () => {
        itOnlyCallsThisHandler(
          'handleSubscriptionCreatedEvent',
          subscriptionCreated
        );
      });

      describe('when the event.type is customer.subscription.updated', () => {
        itOnlyCallsThisHandler(
          'handleSubscriptionUpdatedEvent',
          subscriptionUpdated
        );
      });

      describe('when the event.type is customer.updated', () => {
        itOnlyCallsThisHandler(
          'handleCustomerUpdatedEvent',
          eventCustomerUpdated
        );
      });

      describe('when the event.type is customer.subscription.deleted', () => {
        itOnlyCallsThisHandler(
          'handleSubscriptionDeletedEvent',
          subscriptionDeleted
        );
      });

      describe('when the event.type is customer.source.expiring', () => {
        itOnlyCallsThisHandler(
          'handleCustomerSourceExpiringEvent',
          eventCustomerSourceExpiring
        );
      });

      describe('when the event.type is product.updated', () => {
        itOnlyCallsThisHandler(
          'handleProductWebhookEvent',
          eventProductUpdated,
          false,
          false
        );
      });

      describe('when the event.type is plan.updated', () => {
        itOnlyCallsThisHandler(
          'handlePlanCreatedOrUpdatedEvent',
          eventPlanUpdated,
          false,
          false
        );
      });

      describe('when the event.type is credit_note.created', () => {
        itOnlyCallsThisHandler('handleCreditNoteEvent', eventCreditNoteCreated);
      });

      describe('when the event.type is invoice.paid', () => {
        itOnlyCallsThisHandler('handleInvoicePaidEvent', eventInvoicePaid);
      });

      describe('when the event.type is invoice.payment_failed', () => {
        itOnlyCallsThisHandler(
          'handleInvoicePaymentFailedEvent',
          eventInvoicePaymentFailed
        );
      });

      describe('when the event.type is invoice.created', () => {
        itOnlyCallsThisHandler(
          'handleInvoiceCreatedEvent',
          eventInvoiceCreated
        );
      });

      describe('when the event.type is invoice.upcoming', () => {
        itOnlyCallsThisHandler(
          'handleInvoiceUpcomingEvent',
          eventInvoiceUpcoming,
          false,
          false
        );
      });

      describe('when the event.type is tax_rate.created', () => {
        itOnlyCallsThisHandler(
          'handleTaxRateCreatedOrUpdatedEvent',
          eventTaxRateCreated
        );
      });

      describe('when the event.type is tax_rate.updated', () => {
        itOnlyCallsThisHandler(
          'handleTaxRateCreatedOrUpdatedEvent',
          eventTaxRateUpdated
        );
      });

      describe('when the event.type is something else', () => {
        it('only calls sentry', async () => {
          const event = deepCopy(subscriptionCreated);
          event.type = 'application_fee.refunded';
          StripeWebhookHandlerInstance.stripeHelper.constructWebhookEvent.mockReturnValue(
            event
          );
          await StripeWebhookHandlerInstance.handleWebhookEvent(request);
          assertNamedHandlerCalled();
          expect(scopeContextSpy).toHaveBeenCalledTimes(1);
        });

        it('does not call sentry or expand resource for event payment_method.detached', async () => {
          const event = deepCopy(subscriptionCreated);
          event.type = 'payment_method.detached';
          StripeWebhookHandlerInstance.stripeHelper.constructWebhookEvent.mockReturnValue(
            event
          );
          StripeWebhookHandlerInstance.stripeHelper.processWebhookEventToFirestore =
            jest.fn().mockResolvedValue(true);
          await StripeWebhookHandlerInstance.handleWebhookEvent(request);
          assertNamedHandlerCalled();
          expect(
            StripeWebhookHandlerInstance.stripeHelper.expandResource
          ).not.toHaveBeenCalled();
          expect(scopeContextSpy).not.toHaveBeenCalled();
        });

        it('does not call sentry if handled by firestore', async () => {
          const event = deepCopy(subscriptionCreated);
          event.type = 'firestore.document.created';
          StripeWebhookHandlerInstance.stripeHelper.constructWebhookEvent.mockReturnValue(
            event
          );
          StripeWebhookHandlerInstance.stripeHelper.processWebhookEventToFirestore =
            jest.fn().mockResolvedValue(true);
          await StripeWebhookHandlerInstance.handleWebhookEvent(request);
          assertNamedHandlerCalled();
          expect(scopeContextSpy).not.toHaveBeenCalled();
        });
      });
    });

    describe('handleCouponEvents', () => {
      for (const eventType of ['coupon.created', 'coupon.updated']) {
        it(`allows a valid coupon on ${eventType}`, async () => {
          const event = deepCopy(eventCouponCreated);
          event.type = eventType;
          const coupon = deepCopy(event.data.object);
          const sentryMod = require('../../sentry');
          coupon.applies_to = { products: [] };
          jest.spyOn(sentryMod, 'reportSentryError').mockReturnValue({});
          StripeWebhookHandlerInstance.stripeHelper.getCoupon.mockResolvedValue(
            coupon
          );
          await StripeWebhookHandlerInstance.handleCouponEvent({}, event);
          expect(sentryMod.reportSentryError).not.toHaveBeenCalled();
        });

        it(`reports an error for invalid coupon on ${eventType}`, async () => {
          const event = deepCopy(eventCouponCreated);
          event.type = eventType;
          const coupon = deepCopy(event.data.object);
          const sentryMod = require('../../sentry');
          coupon.applies_to = { products: ['productOhNo'] };
          jest.spyOn(sentryMod, 'reportSentryError').mockReturnValue({});
          StripeWebhookHandlerInstance.stripeHelper.getCoupon.mockResolvedValue(
            coupon
          );
          await StripeWebhookHandlerInstance.handleCouponEvent({}, event);
          expect(sentryMod.reportSentryError).toHaveBeenCalledTimes(1);
        });
      }
    });

    describe('handleCustomerCreatedEvent', () => {
      it('creates a local db record with the account uid', async () => {
        await StripeWebhookHandlerInstance.handleCustomerCreatedEvent(
          {},
          {
            data: { object: customerFixture },
            type: 'customer.created',
          }
        );

        expect(
          StripeWebhookHandlerInstance.db.accountRecord
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.db.accountRecord
        ).toHaveBeenCalledWith(customerFixture.email);
        expect(
          StripeWebhookHandlerInstance.stripeHelper.createLocalCustomer
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.stripeHelper.createLocalCustomer
        ).toHaveBeenCalledWith(UID, customerFixture);
      });
    });

    describe('handleCustomerUpdatedEvent', () => {
      it('removes the customer if the account exists', async () => {
        const authDb = require('fxa-shared/db/models/auth');
        const account = { email: customerFixture.email };
        jest.spyOn(authDb.Account, 'findByUid').mockResolvedValue(account);
        await StripeWebhookHandlerInstance.handleCustomerUpdatedEvent(
          {},
          {
            data: { object: customerFixture },
            type: 'customer.updated',
          }
        );
        expect(authDb.Account.findByUid).toHaveBeenCalledTimes(1);
        expect(authDb.Account.findByUid).toHaveBeenCalledWith(
          customerFixture.metadata.userid,
          { include: ['emails'] }
        );
      });

      it('reports sentry error with no customer found', async () => {
        const authDb = require('fxa-shared/db/models/auth');
        const sentryMod = require('../../sentry');
        jest.spyOn(sentryMod, 'reportSentryError').mockReturnValue({});
        jest.spyOn(authDb.Account, 'findByUid').mockResolvedValue(null);
        await StripeWebhookHandlerInstance.handleCustomerUpdatedEvent(
          {},
          {
            data: { object: customerFixture },
            type: 'customer.updated',
            request: {},
          }
        );
        expect(sentryMod.reportSentryError).toHaveBeenCalledTimes(1);
      });

      it('does not report error with no customer if the customer was deleted', async () => {
        const authDb = require('fxa-shared/db/models/auth');
        const sentryMod = require('../../sentry');
        jest.spyOn(sentryMod, 'reportSentryError').mockReturnValue({});
        jest.spyOn(authDb.Account, 'findByUid').mockResolvedValue(null);
        const customer = deepCopy(customerFixture);
        customer.deleted = true;
        await StripeWebhookHandlerInstance.handleCustomerUpdatedEvent(
          {},
          {
            data: { object: customer },
            type: 'customer.updated',
          }
        );
        expect(sentryMod.reportSentryError).not.toHaveBeenCalled();
      });

      it('does not report error with no customer if the account does not exist but it was an api call', async () => {
        const authDb = require('fxa-shared/db/models/auth');
        jest.spyOn(sentryModule, 'reportSentryError').mockReturnValue({});
        jest.spyOn(authDb.Account, 'findByUid').mockResolvedValue(null);
        const customer = deepCopy(customerFixture);
        await StripeWebhookHandlerInstance.handleCustomerUpdatedEvent(
          {},
          {
            data: { object: customer },
            type: 'customer.updated',
            request: {
              id: 'someid',
            },
          }
        );
        expect(sentryModule.reportSentryError).not.toHaveBeenCalled();
      });
    });

    describe('handleProductWebhookEvent', () => {
      let scopeContextSpy: any, scopeSpy: any, captureMessageSpy: any;
      beforeEach(() => {
        captureMessageSpy = jest.fn();
        scopeContextSpy = jest.fn();
        scopeSpy = {
          setContext: scopeContextSpy,
        };
        jest
          .spyOn(Sentry, 'withScope')
          .mockImplementation((fn: any) => fn(scopeSpy));
        jest
          .spyOn(Sentry, 'captureMessage')
          .mockImplementation(captureMessageSpy);
        StripeWebhookHandlerInstance.stripeHelper.allProducts.mockResolvedValue(
          []
        );
      });

      it('throws a sentry error if the update event data is invalid', async () => {
        const updatedEvent = deepCopy(eventProductUpdated);
        updatedEvent.data.object.id = 'anotherone';
        updatedEvent.data.object.metadata['product:termsOfServiceDownloadURL'] =
          'https://FAIL.cdn.mozilla.net/legal/mozilla_vpn_tos';
        const invalidPlan = {
          ...validPlan.data.object,
          metadata: {},
          product: updatedEvent.data.object,
        };
        const allPlans = [...validPlanList, invalidPlan];
        StripeWebhookHandlerInstance.stripeHelper.fetchAllPlans.mockResolvedValue(
          allPlans
        );
        StripeWebhookHandlerInstance.stripeHelper.fetchPlansByProductId.mockResolvedValue(
          [invalidPlan]
        );
        await StripeWebhookHandlerInstance.handleProductWebhookEvent(
          {},
          updatedEvent
        );

        expect(scopeContextSpy).toHaveBeenCalledTimes(1);
        expect(captureMessageSpy).toHaveBeenCalledTimes(1);

        expect(
          StripeWebhookHandlerInstance.stripeHelper.fetchAllPlans
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.stripeHelper.fetchPlansByProductId
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.stripeHelper.fetchPlansByProductId
        ).toHaveBeenCalledWith(updatedEvent.data.object.id);
        expect(
          StripeWebhookHandlerInstance.stripeHelper.updateAllProducts
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.stripeHelper.updateAllProducts
        ).toHaveBeenCalledWith([updatedEvent.data.object]);
        expect(
          StripeWebhookHandlerInstance.stripeHelper.updateAllPlans
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.stripeHelper.updateAllPlans
        ).toHaveBeenCalledWith(validPlanList);
      });

      it('does not throw a sentry error if the update event data is valid', async () => {
        const updatedEvent = deepCopy(eventProductUpdated);
        StripeWebhookHandlerInstance.stripeHelper.fetchAllPlans.mockResolvedValue(
          validPlanList
        );
        StripeWebhookHandlerInstance.stripeHelper.fetchPlansByProductId.mockResolvedValue(
          validPlanList
        );
        await StripeWebhookHandlerInstance.handleProductWebhookEvent(
          {},
          updatedEvent
        );

        expect(scopeContextSpy).not.toHaveBeenCalled();
      });

      it('updates the cached products and remove the plans on a product.deleted', async () => {
        const deletedEvent = {
          ...deepCopy(eventProductUpdated),
          type: 'product.deleted',
        };
        StripeWebhookHandlerInstance.stripeHelper.fetchAllPlans.mockResolvedValue(
          validPlanList
        );
        StripeWebhookHandlerInstance.stripeHelper.fetchPlansByProductId.mockResolvedValue(
          validPlanList
        );
        await StripeWebhookHandlerInstance.handleProductWebhookEvent(
          {},
          deletedEvent
        );
        expect(
          StripeWebhookHandlerInstance.stripeHelper.updateAllProducts
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.stripeHelper.updateAllProducts
        ).toHaveBeenCalledWith([deletedEvent.data.object]);
        expect(
          StripeWebhookHandlerInstance.stripeHelper.updateAllPlans
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.stripeHelper.updateAllPlans
        ).toHaveBeenCalledWith([]);
      });

      it('update all plans when Firestore product config feature flag is set to true', async () => {
        config.subscriptions.productConfigsFirestore.enabled = true;
        const updatedEvent = deepCopy(eventProductUpdated);
        const invalidPlan = {
          ...validPlan.data.object,
          metadata: {},
          product: updatedEvent.data.object,
        };
        const allPlans = [...validPlanList, invalidPlan];
        StripeWebhookHandlerInstance.stripeHelper.fetchAllPlans.mockResolvedValue(
          allPlans
        );
        StripeWebhookHandlerInstance.stripeHelper.fetchPlansByProductId.mockResolvedValue(
          allPlans
        );
        await StripeWebhookHandlerInstance.handleProductWebhookEvent(
          {},
          updatedEvent
        );
        expect(
          StripeWebhookHandlerInstance.stripeHelper.updateAllPlans
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.stripeHelper.updateAllPlans
        ).toHaveBeenCalledWith(allPlans);
      });

      it('updates the cached plans to include any valid plans missing from the cache', async () => {
        const updatedEvent = deepCopy(eventProductUpdated);
        StripeWebhookHandlerInstance.stripeHelper.updateAllPlans.mockResolvedValue(
          undefined
        );
        StripeWebhookHandlerInstance.stripeHelper.fetchAllPlans.mockResolvedValue(
          validPlanList
        );
        StripeWebhookHandlerInstance.stripeHelper.fetchPlansByProductId.mockResolvedValue(
          []
        );
        await StripeWebhookHandlerInstance.handleProductWebhookEvent(
          {},
          updatedEvent
        );

        expect(scopeContextSpy).not.toHaveBeenCalled();

        expect(
          StripeWebhookHandlerInstance.stripeHelper.updateAllPlans
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.stripeHelper.updateAllPlans
        ).toHaveBeenCalledWith(validPlanList);
      });
    });

    describe('handlePlanCreatedOrUpdatedEvent', () => {
      let scopeContextSpy: any,
        scopeExtraSpy: any,
        scopeSpy: any,
        captureMessageSpy: any;
      const plan = {
        ...validPlan.data.object,
        product: validProduct.data.object,
      };

      beforeEach(() => {
        captureMessageSpy = jest.fn();
        scopeContextSpy = jest.fn();
        scopeExtraSpy = jest.fn();
        scopeSpy = {
          setContext: scopeContextSpy,
          setExtra: scopeExtraSpy,
        };
        jest
          .spyOn(Sentry, 'withScope')
          .mockImplementation((fn: any) => fn(scopeSpy));
        jest
          .spyOn(Sentry, 'captureMessage')
          .mockImplementation(captureMessageSpy);
        StripeWebhookHandlerInstance.stripeHelper.allPlans.mockResolvedValue([
          plan,
        ]);
      });

      it('throws a sentry error if the update event data is invalid', async () => {
        const updatedEvent = deepCopy(eventPlanUpdated);
        updatedEvent.data.object.metadata = {
          'product:termsOfServiceDownloadURL':
            'https://FAIL.net/legal/mozilla_vpn_tos',
        };
        StripeWebhookHandlerInstance.stripeHelper.fetchProductById.mockResolvedValue(
          {
            ...validProduct.data.object,
          }
        );

        await StripeWebhookHandlerInstance.handlePlanCreatedOrUpdatedEvent(
          {},
          updatedEvent
        );

        expect(scopeContextSpy).toHaveBeenCalled();
        expect(captureMessageSpy).toHaveBeenCalled();
        expect(
          StripeWebhookHandlerInstance.stripeHelper.fetchProductById
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.stripeHelper.fetchProductById
        ).toHaveBeenCalledWith(validProduct.data.object.id);
        expect(
          StripeWebhookHandlerInstance.stripeHelper.updateAllPlans
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.stripeHelper.updateAllPlans
        ).toHaveBeenCalledWith([]);
      });

      it('does not throw a sentry error if the update event data is valid', async () => {
        const updatedEvent = deepCopy(eventPlanUpdated);
        StripeWebhookHandlerInstance.stripeHelper.fetchProductById.mockResolvedValue(
          validProduct.data.object
        );
        await StripeWebhookHandlerInstance.handlePlanCreatedOrUpdatedEvent(
          {},
          updatedEvent
        );

        expect(scopeContextSpy).not.toHaveBeenCalled();
        expect(captureMessageSpy).not.toHaveBeenCalled();
        expect(
          StripeWebhookHandlerInstance.stripeHelper.updateAllPlans
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.stripeHelper.updateAllPlans
        ).toHaveBeenCalledWith([plan]);
      });

      it('logs and throws sentry error if product is not found', async () => {
        const productId = 'nonExistantProduct';
        const updatedEvent = deepCopy(eventPlanUpdated);
        updatedEvent.data.object.product = productId;
        StripeWebhookHandlerInstance.stripeHelper.fetchProductById.mockReturnValue(
          undefined
        );
        await StripeWebhookHandlerInstance.handlePlanCreatedOrUpdatedEvent(
          {},
          updatedEvent
        );

        expect(StripeWebhookHandlerInstance.log.error).toHaveBeenCalledTimes(1);
        expect(scopeContextSpy).toHaveBeenCalled();
        expect(captureMessageSpy).toHaveBeenCalled();
        expect(
          StripeWebhookHandlerInstance.stripeHelper.fetchProductById
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.stripeHelper.fetchProductById
        ).toHaveBeenCalledWith(productId);
        expect(
          StripeWebhookHandlerInstance.stripeHelper.updateAllPlans
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.stripeHelper.updateAllPlans
        ).toHaveBeenCalledWith([]);
      });
    });

    describe('handlePlanDeletedEvent', () => {
      it('deletes the plan from the cache', async () => {
        StripeWebhookHandlerInstance.stripeHelper.allPlans.mockResolvedValue([
          validPlan.data.object,
        ]);
        const planDeletedEvent = { ...eventPlanUpdated, type: 'plan.deleted' };
        await StripeWebhookHandlerInstance.handlePlanDeletedEvent(
          {},
          planDeletedEvent
        );
        expect(
          StripeWebhookHandlerInstance.stripeHelper.updateAllPlans
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.stripeHelper.updateAllPlans
        ).toHaveBeenCalledWith([]);
      });
    });

    describe('handleTaxRateCreatedOrUpdatedEvent', () => {
      const taxRate = deepCopy(eventTaxRateCreated.data.object);

      beforeEach(() => {
        StripeWebhookHandlerInstance.stripeHelper.allTaxRates.mockResolvedValue(
          [taxRate]
        );
        StripeWebhookHandlerInstance.stripeHelper.updateAllTaxRates.mockResolvedValue(
          undefined
        );
      });

      it('adds a new tax rate on tax_rate.created', async () => {
        const createdEvent = deepCopy(eventTaxRateCreated);
        StripeWebhookHandlerInstance.stripeHelper.allTaxRates.mockResolvedValue(
          []
        );
        await StripeWebhookHandlerInstance.handleTaxRateCreatedOrUpdatedEvent(
          {},
          createdEvent
        );

        expect(
          StripeWebhookHandlerInstance.stripeHelper.allTaxRates
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.stripeHelper.updateAllTaxRates
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.stripeHelper.updateAllTaxRates
        ).toHaveBeenCalledWith([taxRate]);
      });

      it('updates an existing tax rate on tax_rate.updated', async () => {
        const updatedEvent = deepCopy(eventTaxRateUpdated);
        const updatedTaxRate = updatedEvent.data.object;

        await StripeWebhookHandlerInstance.handleTaxRateCreatedOrUpdatedEvent(
          {},
          updatedEvent
        );

        expect(
          StripeWebhookHandlerInstance.stripeHelper.allTaxRates
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.stripeHelper.updateAllTaxRates
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.stripeHelper.updateAllTaxRates
        ).toHaveBeenCalledWith([updatedTaxRate]);
      });
    });

    describe('handleSubscriptionUpdatedEvent', () => {
      let sendSubscriptionUpdatedEmailStub: any;

      beforeEach(() => {
        sendSubscriptionUpdatedEmailStub = jest
          .spyOn(StripeWebhookHandlerInstance, 'sendSubscriptionUpdatedEmail')
          .mockResolvedValue({ uid: UID, email: TEST_EMAIL });
      });

      afterEach(() => {
        StripeWebhookHandlerInstance.sendSubscriptionUpdatedEmail.mockRestore();
      });

      it('emits a notification when transitioning from "incomplete" to "active/trialing"', async () => {
        const updatedEvent = deepCopy(subscriptionUpdatedFromIncomplete);
        await StripeWebhookHandlerInstance.handleSubscriptionUpdatedEvent(
          {},
          updatedEvent
        );
        expect(mockCapabilityService.stripeUpdate).toHaveBeenCalledWith({
          sub: updatedEvent.data.object,
          uid: UID,
        });
        expect(sendSubscriptionUpdatedEmailStub).toHaveBeenCalledWith(
          updatedEvent
        );
      });

      it('emits a notification for any subscription state change', async () => {
        const updatedEvent = deepCopy(subscriptionUpdated);
        await StripeWebhookHandlerInstance.handleSubscriptionUpdatedEvent(
          {},
          updatedEvent
        );
        expect(mockCapabilityService.stripeUpdate).toHaveBeenCalledWith({
          sub: updatedEvent.data.object,
          uid: UID,
        });
        expect(sendSubscriptionUpdatedEmailStub).toHaveBeenCalledWith(
          updatedEvent
        );
      });

      it('reports a sentry error with an eventId if sendSubscriptionUpdatedEmail fails', async () => {
        const updatedEvent = deepCopy(subscriptionUpdated);
        const fakeAppError = { output: { payload: {} } };
        const sentryMod = require('../../sentry');
        jest.spyOn(sentryMod, 'reportSentryError').mockReturnValue({});
        sendSubscriptionUpdatedEmailStub.mockRejectedValue(fakeAppError);
        await StripeWebhookHandlerInstance.handleSubscriptionUpdatedEvent(
          {},
          updatedEvent
        );
        expect(sendSubscriptionUpdatedEmailStub).toHaveBeenCalledWith(
          updatedEvent
        );
        const sentryCall = sentryMod.reportSentryError.mock.calls[0];
        expect(sentryCall[0].output.payload.eventId).toBe(updatedEvent.id);
      });

      it('ignores errors from email sending if the customer was deleted', async () => {
        const updatedEvent = deepCopy(subscriptionUpdated);
        const fakeAppError = {
          output: { payload: {} },
          errno: error.ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER,
        };
        const sentryMod = require('../../sentry');
        jest.spyOn(sentryMod, 'reportSentryError').mockReturnValue({});
        sendSubscriptionUpdatedEmailStub.mockRejectedValue(fakeAppError);
        await StripeWebhookHandlerInstance.handleSubscriptionUpdatedEvent(
          {},
          updatedEvent
        );
        expect(sendSubscriptionUpdatedEmailStub).toHaveBeenCalledWith(
          updatedEvent
        );
        expect(sentryMod.reportSentryError).not.toHaveBeenCalled();
      });
    });

    describe('handleSubscriptionDeletedEvent', () => {
      it('sends email and emits a notification when a subscription is deleted', async () => {
        StripeWebhookHandlerInstance.stripeHelper.expandResource.mockResolvedValue(
          customerFixture
        );
        const deletedEvent = deepCopy(subscriptionDeleted);
        const sendSubscriptionDeletedEmailStub = jest
          .spyOn(StripeWebhookHandlerInstance, 'sendSubscriptionDeletedEmail')
          .mockResolvedValue({ uid: UID, email: TEST_EMAIL });
        const account = { email: customerFixture.email };
        jest
          .spyOn(authDbModule.Account, 'findByUid')
          .mockResolvedValue(account);
        await StripeWebhookHandlerInstance.handleSubscriptionDeletedEvent(
          {},
          deletedEvent
        );
        expect(mockCapabilityService.stripeUpdate).toHaveBeenCalledWith({
          sub: deletedEvent.data.object,
          uid: customerFixture.metadata.userid,
        });
        expect(sendSubscriptionDeletedEmailStub).toHaveBeenCalledWith(
          deletedEvent.data.object
        );
        expect(
          authDbModule.getUidAndEmailByStripeCustomerId
        ).not.toHaveBeenCalled();
        expect(
          StripeWebhookHandlerInstance.stripeHelper.expandResource
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.stripeHelper.expandResource
        ).toHaveBeenCalledWith(
          deletedEvent.data.object.customer,
          CUSTOMER_RESOURCE
        );
        expect(
          StripeWebhookHandlerInstance.paypalHelper
            .conditionallyRemoveBillingAgreement
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.paypalHelper
            .conditionallyRemoveBillingAgreement
        ).toHaveBeenCalledWith(customerFixture);
      });

      it('sends subscriptionReplaced email if metadata includes redundantCancellation', async () => {
        const mockCustomer = deepCopy(customerFixture);
        StripeWebhookHandlerInstance.stripeHelper.expandResource.mockResolvedValue(
          mockCustomer
        );
        const deletedEvent = deepCopy(subscriptionReplaced);
        const account = {
          email: customerFixture.email,
          emails: customerFixture.email,
          locale: 'en',
        };
        jest
          .spyOn(authDbModule.Account, 'findByUid')
          .mockResolvedValue(account);
        const mockInvoice = deepCopy(invoiceFixture);
        StripeWebhookHandlerInstance.stripeHelper.extractSubscriptionDeletedEventDetailsForEmail.mockResolvedValue(
          mockInvoice
        );
        StripeWebhookHandlerInstance.mailer.sendSubscriptionReplacedEmail =
          jest.fn();
        await StripeWebhookHandlerInstance.handleSubscriptionDeletedEvent(
          {},
          deletedEvent
        );
        expect(mockCapabilityService.stripeUpdate).toHaveBeenCalledWith({
          sub: deletedEvent.data.object,
          uid: customerFixture.metadata.userid,
        });
        expect(
          authDbModule.getUidAndEmailByStripeCustomerId
        ).not.toHaveBeenCalled();
        expect(
          StripeWebhookHandlerInstance.paypalHelper
            .conditionallyRemoveBillingAgreement
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.paypalHelper
            .conditionallyRemoveBillingAgreement
        ).toHaveBeenCalledWith(customerFixture);
        expect(
          StripeWebhookHandlerInstance.stripeHelper
            .extractSubscriptionDeletedEventDetailsForEmail
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.stripeHelper
            .extractSubscriptionDeletedEventDetailsForEmail
        ).toHaveBeenCalledWith(deletedEvent.data.object);
        expect(
          StripeWebhookHandlerInstance.mailer.sendSubscriptionReplacedEmail
        ).toHaveBeenCalledWith(account.emails, account, {
          acceptLanguage: account.locale,
          ...mockInvoice,
        });
      });

      it('does not conditionally delete without customer record', async () => {
        const deletedEvent = deepCopy(subscriptionDeleted);
        StripeWebhookHandlerInstance.stripeHelper.expandResource.mockResolvedValue(
          undefined
        );
        const sendSubscriptionDeletedEmailStub = jest
          .spyOn(StripeWebhookHandlerInstance, 'sendSubscriptionDeletedEmail')
          .mockResolvedValue({ uid: UID, email: TEST_EMAIL });
        await StripeWebhookHandlerInstance.handleSubscriptionDeletedEvent(
          {},
          deletedEvent
        );
        expect(
          StripeWebhookHandlerInstance.stripeHelper.expandResource
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.stripeHelper.expandResource
        ).toHaveBeenCalledWith(
          deletedEvent.data.object.customer,
          CUSTOMER_RESOURCE
        );
        expect(sendSubscriptionDeletedEmailStub).not.toHaveBeenCalled();
        expect(
          StripeWebhookHandlerInstance.paypalHelper
            .conditionallyRemoveBillingAgreement
        ).not.toHaveBeenCalled();
      });

      it('does not send an email to an unverified PayPal user', async () => {
        const deletedEvent = deepCopy(subscriptionDeleted);
        deletedEvent.data.object.collection_method = 'send_invoice';
        StripeWebhookHandlerInstance.stripeHelper.expandResource.mockResolvedValue(
          customerFixture
        );
        StripeWebhookHandlerInstance.db.account = jest.fn().mockResolvedValue({
          email: customerFixture.email,
          verifierSetAt: 0,
        });
        const sendSubscriptionDeletedEmailStub = jest
          .spyOn(StripeWebhookHandlerInstance, 'sendSubscriptionDeletedEmail')
          .mockResolvedValue({ uid: UID, email: TEST_EMAIL });
        await StripeWebhookHandlerInstance.handleSubscriptionDeletedEvent(
          {},
          deletedEvent
        );
        expect(
          StripeWebhookHandlerInstance.stripeHelper.expandResource
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.stripeHelper.expandResource
        ).toHaveBeenCalledWith(
          deletedEvent.data.object.customer,
          CUSTOMER_RESOURCE
        );
        expect(sendSubscriptionDeletedEmailStub).not.toHaveBeenCalled();
      });

      it('does send an email when it cannot find the account because it was deleted', async () => {
        StripeWebhookHandlerInstance.stripeHelper.expandResource.mockResolvedValue(
          customerFixture
        );
        const deletedEvent = deepCopy(subscriptionDeleted);
        const sendSubscriptionDeletedEmailStub = jest
          .spyOn(StripeWebhookHandlerInstance, 'sendSubscriptionDeletedEmail')
          .mockResolvedValue({ uid: UID, email: TEST_EMAIL });
        jest.spyOn(authDbModule.Account, 'findByUid').mockResolvedValue(null);
        await StripeWebhookHandlerInstance.handleSubscriptionDeletedEvent(
          {},
          deletedEvent
        );
        expect(mockCapabilityService.stripeUpdate).toHaveBeenCalledWith({
          sub: deletedEvent.data.object,
          uid: customerFixture.metadata.userid,
        });
        expect(sendSubscriptionDeletedEmailStub).toHaveBeenCalledWith(
          deletedEvent.data.object
        );
        expect(
          authDbModule.getUidAndEmailByStripeCustomerId
        ).not.toHaveBeenCalled();
        expect(
          StripeWebhookHandlerInstance.stripeHelper.expandResource
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.stripeHelper.expandResource
        ).toHaveBeenCalledWith(
          deletedEvent.data.object.customer,
          CUSTOMER_RESOURCE
        );
        expect(
          StripeWebhookHandlerInstance.paypalHelper
            .conditionallyRemoveBillingAgreement
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.paypalHelper
            .conditionallyRemoveBillingAgreement
        ).toHaveBeenCalledWith(customerFixture);
      });

      it('emits metrics event - records expected subscription ended event', async () => {
        const mockCustomerFixture = deepCopy(customerFixture);
        mockCustomerFixture.shipping = {
          address: {
            country: 'BC',
          },
        };
        const account = { email: mockCustomerFixture.email };
        const subscriptionEnded = subscriptionDeleted.data.object;
        const mockSubscriptionEndedEventDetails = {
          country_code: mockCustomerFixture.shipping.address.country,
          payment_provider: 'stripe',
          plan_id: subscriptionEnded.items.data[0].plan.id,
          product_id: subscriptionEnded.items.data[0].plan.product,
          provider_event_id: subscriptionDeleted.id,
          subscription_id: subscriptionEnded.id,
          uid: mockCustomerFixture.metadata.userid,
          voluntary_cancellation: true,
        };
        const req = {
          auth: { credentials: mockCustomerFixture.uid },
          payload: mockSubscriptionEndedEventDetails,
          emitMetricsEvent: jest
            .fn()
            .mockResolvedValue(mockSubscriptionEndedEventDetails),
        };
        const subscriptionEndedEvent = deepCopy(subscriptionDeleted);

        StripeWebhookHandlerInstance.stripeHelper.expandResource.mockResolvedValue(
          mockCustomerFixture
        );

        jest
          .spyOn(StripeWebhookHandlerInstance, 'sendSubscriptionDeletedEmail')
          .mockResolvedValue({ uid: UID, email: TEST_EMAIL });

        jest
          .spyOn(authDbModule.Account, 'findByUid')
          .mockResolvedValue(account);

        const getSubscriptionEndedEventDetailsStub = jest
          .spyOn(
            StripeWebhookHandlerInstance,
            'getSubscriptionEndedEventDetails'
          )
          .mockResolvedValue(mockSubscriptionEndedEventDetails);

        await StripeWebhookHandlerInstance.handleSubscriptionDeletedEvent(
          req,
          subscriptionEndedEvent
        );

        expect(getSubscriptionEndedEventDetailsStub).toHaveBeenCalledTimes(1);
        expect(getSubscriptionEndedEventDetailsStub).toHaveBeenCalledWith(
          mockSubscriptionEndedEventDetails.uid,
          mockSubscriptionEndedEventDetails.provider_event_id,
          mockCustomerFixture,
          subscriptionEnded
        );

        expect(req.emitMetricsEvent).toHaveBeenCalledTimes(1);
        expect(req.emitMetricsEvent).toHaveBeenCalledWith(
          'subscription.ended',
          mockSubscriptionEndedEventDetails
        );
      });
    });

    describe('handleInvoiceCreatedEvent', () => {
      it('doesnt run if paypalHelper is not present', async () => {
        const invoiceCreatedEvent = deepCopy(eventInvoiceCreated);
        // Set billing reason so this would force eval to expandResource if we
        // fail to exit early
        invoiceCreatedEvent.data.object.billing_reason = 'subscription_cycle';
        StripeWebhookHandlerInstance.paypalHelper = undefined;
        const result =
          await StripeWebhookHandlerInstance.handleInvoiceCreatedEvent(
            {},
            invoiceCreatedEvent
          );
        expect(result).toBeUndefined();
        expect(
          StripeWebhookHandlerInstance.stripeHelper.expandResource
        ).not.toHaveBeenCalled();
      });

      it('stops if the invoice is not paypal payable', async () => {
        const invoiceCreatedEvent = deepCopy(eventInvoiceCreated);
        invoiceCreatedEvent.data.object.status = 'draft';
        StripeWebhookHandlerInstance.stripeHelper.invoicePayableWithPaypal.mockResolvedValue(
          false
        );
        StripeWebhookHandlerInstance.stripeHelper.finalizeInvoice.mockResolvedValue(
          {}
        );
        const result =
          await StripeWebhookHandlerInstance.handleInvoiceCreatedEvent(
            {},
            invoiceCreatedEvent
          );
        expect(result).toBeUndefined();
        expect(
          StripeWebhookHandlerInstance.stripeHelper.expandResource
        ).not.toHaveBeenCalled();
        expect(
          StripeWebhookHandlerInstance.stripeHelper.finalizeInvoice
        ).not.toHaveBeenCalled();
      });

      it('stops if the invoice is not in draft', async () => {
        const invoiceCreatedEvent = deepCopy(eventInvoiceCreated);
        StripeWebhookHandlerInstance.stripeHelper.invoicePayableWithPaypal.mockResolvedValue(
          true
        );
        StripeWebhookHandlerInstance.stripeHelper.finalizeInvoice.mockResolvedValue(
          {}
        );
        const result =
          await StripeWebhookHandlerInstance.handleInvoiceCreatedEvent(
            {},
            invoiceCreatedEvent
          );
        expect(result).toBeUndefined();
        expect(
          StripeWebhookHandlerInstance.stripeHelper.expandResource
        ).not.toHaveBeenCalled();
        expect(
          StripeWebhookHandlerInstance.stripeHelper.finalizeInvoice
        ).not.toHaveBeenCalled();
      });

      it('logs if the billing agreement was cancelled', async () => {
        const invoiceCreatedEvent = deepCopy(eventInvoiceCreated);
        invoiceCreatedEvent.data.object.status = 'draft';
        StripeWebhookHandlerInstance.stripeHelper.invoicePayableWithPaypal.mockResolvedValue(
          true
        );
        StripeWebhookHandlerInstance.stripeHelper.finalizeInvoice.mockResolvedValue(
          {}
        );
        StripeWebhookHandlerInstance.stripeHelper.getCustomerPaypalAgreement.mockReturnValue(
          'test-ba'
        );
        StripeWebhookHandlerInstance.paypalHelper.updateStripeNameFromBA.mockRejectedValue(
          {
            errno: 998,
          }
        );
        StripeWebhookHandlerInstance.log.error = jest.fn().mockReturnValue({});
        const result =
          await StripeWebhookHandlerInstance.handleInvoiceCreatedEvent(
            {},
            invoiceCreatedEvent
          );
        expect(result).toEqual({});
        expect(StripeWebhookHandlerInstance.log.error).toHaveBeenCalledTimes(1);
        expect(StripeWebhookHandlerInstance.log.error).toHaveBeenCalledWith(
          `handleInvoiceCreatedEvent - Billing agreement (id: test-ba) was cancelled.`,
          {
            request: {},
            customer: {},
          }
        );
        expect(
          StripeWebhookHandlerInstance.stripeHelper.invoicePayableWithPaypal
        ).toHaveBeenCalledWith(invoiceCreatedEvent.data.object);
        expect(
          StripeWebhookHandlerInstance.stripeHelper.finalizeInvoice
        ).toHaveBeenCalledWith(invoiceCreatedEvent.data.object);
        expect(
          StripeWebhookHandlerInstance.paypalHelper.updateStripeNameFromBA
        ).toHaveBeenCalledWith({}, 'test-ba');
        expect(
          StripeWebhookHandlerInstance.stripeHelper.getCustomerPaypalAgreement
        ).toHaveBeenCalledWith({});
      });

      it('finalizes invoices for invoice subscriptions', async () => {
        const invoiceCreatedEvent = deepCopy(eventInvoiceCreated);
        invoiceCreatedEvent.data.object.status = 'draft';
        StripeWebhookHandlerInstance.stripeHelper.invoicePayableWithPaypal.mockResolvedValue(
          true
        );
        StripeWebhookHandlerInstance.stripeHelper.finalizeInvoice.mockResolvedValue(
          {}
        );
        StripeWebhookHandlerInstance.stripeHelper.getCustomerPaypalAgreement.mockReturnValue(
          'test-ba'
        );
        StripeWebhookHandlerInstance.paypalHelper.updateStripeNameFromBA.mockResolvedValue(
          {}
        );
        const result =
          await StripeWebhookHandlerInstance.handleInvoiceCreatedEvent(
            {},
            invoiceCreatedEvent
          );
        expect(result).toEqual({});
        expect(
          StripeWebhookHandlerInstance.stripeHelper.invoicePayableWithPaypal
        ).toHaveBeenCalledWith(invoiceCreatedEvent.data.object);
        expect(
          StripeWebhookHandlerInstance.stripeHelper.finalizeInvoice
        ).toHaveBeenCalledWith(invoiceCreatedEvent.data.object);
        expect(
          StripeWebhookHandlerInstance.paypalHelper.updateStripeNameFromBA
        ).toHaveBeenCalledWith({}, 'test-ba');
        expect(
          StripeWebhookHandlerInstance.stripeHelper.getCustomerPaypalAgreement
        ).toHaveBeenCalledWith({});
      });
    });

    describe('handleCreditNoteEvent', () => {
      let invoiceCreditNoteEvent: any;
      let invoice: any;

      beforeEach(() => {
        invoiceCreditNoteEvent = deepCopy(eventCreditNoteCreated);
        invoice = deepCopy(eventInvoicePaid).data.object;
      });

      it('doesnt run if paypalHelper is not present', async () => {
        StripeWebhookHandlerInstance.paypalHelper = undefined;
        StripeWebhookHandlerInstance.stripeHelper.expandResource = jest
          .fn()
          .mockResolvedValue({});
        const result = await StripeWebhookHandlerInstance.handleCreditNoteEvent(
          {},
          invoiceCreditNoteEvent
        );
        expect(result).toBeUndefined();
        expect(
          StripeWebhookHandlerInstance.stripeHelper.expandResource
        ).not.toHaveBeenCalled();
      });

      it('doesnt run if its not manual invoice or out of band credit note', async () => {
        const sentryMod = require('../../sentry');
        jest.spyOn(sentryMod, 'reportSentryError').mockReturnValue({});
        StripeWebhookHandlerInstance.paypalHelper = {};
        invoice.collection_method = 'charge_automatically';
        StripeWebhookHandlerInstance.stripeHelper.expandResource = jest
          .fn()
          .mockResolvedValue(invoice);
        StripeWebhookHandlerInstance.stripeHelper.getInvoicePaypalTransactionId =
          jest.fn().mockResolvedValue({});
        const result = await StripeWebhookHandlerInstance.handleCreditNoteEvent(
          {},
          invoiceCreditNoteEvent
        );
        expect(result).toBeUndefined();
        expect(
          StripeWebhookHandlerInstance.stripeHelper.expandResource
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.stripeHelper.expandResource
        ).toHaveBeenCalledWith(
          invoiceCreditNoteEvent.data.object.invoice,
          'invoices'
        );
        expect(
          StripeWebhookHandlerInstance.stripeHelper
            .getInvoicePaypalTransactionId
        ).not.toHaveBeenCalled();
        expect(sentryMod.reportSentryError).toHaveBeenCalledTimes(1);
      });

      it('doesnt run or error report if its not manual invoice and not out of band', async () => {
        const sentryMod = require('../../sentry');
        jest.spyOn(sentryMod, 'reportSentryError').mockReturnValue({});
        StripeWebhookHandlerInstance.paypalHelper = {};
        invoice.collection_method = 'charge_automatically';
        StripeWebhookHandlerInstance.stripeHelper.expandResource = jest
          .fn()
          .mockResolvedValue(invoice);
        StripeWebhookHandlerInstance.stripeHelper.getInvoicePaypalTransactionId =
          jest.fn().mockResolvedValue({});
        invoiceCreditNoteEvent.data.object.out_of_band_amount = null;
        const result = await StripeWebhookHandlerInstance.handleCreditNoteEvent(
          {},
          invoiceCreditNoteEvent
        );
        expect(result).toBeUndefined();
        expect(
          StripeWebhookHandlerInstance.stripeHelper.expandResource
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.stripeHelper.expandResource
        ).toHaveBeenCalledWith(
          invoiceCreditNoteEvent.data.object.invoice,
          'invoices'
        );
        expect(
          StripeWebhookHandlerInstance.stripeHelper
            .getInvoicePaypalTransactionId
        ).not.toHaveBeenCalled();
        expect(sentryMod.reportSentryError).not.toHaveBeenCalled();
      });

      it('doesnt issue refund without a paypal transaction to refund', async () => {
        StripeWebhookHandlerInstance.paypalHelper = {};
        invoice.collection_method = 'send_invoice';
        invoiceCreditNoteEvent.data.object.out_of_band_amount = 500;
        StripeWebhookHandlerInstance.stripeHelper.expandResource = jest
          .fn()
          .mockResolvedValue(invoice);
        StripeWebhookHandlerInstance.stripeHelper.getInvoicePaypalTransactionId =
          jest.fn().mockReturnValue(null);
        StripeWebhookHandlerInstance.log.error = jest.fn().mockReturnValue({});
        const result = await StripeWebhookHandlerInstance.handleCreditNoteEvent(
          {},
          invoiceCreditNoteEvent
        );
        expect(result).toBeUndefined();
        expect(
          StripeWebhookHandlerInstance.stripeHelper.expandResource
        ).toHaveBeenCalledWith(
          invoiceCreditNoteEvent.data.object.invoice,
          'invoices'
        );
        expect(
          StripeWebhookHandlerInstance.stripeHelper.expandResource
        ).toHaveBeenCalledTimes(1);
        expect(StripeWebhookHandlerInstance.log.error).toHaveBeenCalledTimes(1);
        expect(StripeWebhookHandlerInstance.log.error).toHaveBeenCalledWith(
          'handleCreditNoteEvent',
          {
            invoiceId: invoice.id,
            message:
              'Credit note issued on invoice without a PayPal transaction id.',
          }
        );
        expect(
          StripeWebhookHandlerInstance.stripeHelper
            .getInvoicePaypalTransactionId
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.stripeHelper
            .getInvoicePaypalTransactionId
        ).toHaveBeenCalledWith(invoice);
      });

      it('logs an error if the amount doesnt match the invoice amount', async () => {
        StripeWebhookHandlerInstance.paypalHelper = {
          issueRefund: jest.fn().mockResolvedValue(undefined),
        };
        invoice.collection_method = 'send_invoice';
        invoiceCreditNoteEvent.data.object.out_of_band_amount = 500;
        invoice.amount_due = 900;
        StripeWebhookHandlerInstance.stripeHelper.expandResource = jest
          .fn()
          .mockResolvedValue(invoice);
        StripeWebhookHandlerInstance.stripeHelper.getInvoicePaypalTransactionId =
          jest.fn().mockReturnValue('tx-1234');
        StripeWebhookHandlerInstance.log.error = jest.fn().mockReturnValue({});
        const result = await StripeWebhookHandlerInstance.handleCreditNoteEvent(
          {},
          invoiceCreditNoteEvent
        );
        expect(result).toBeUndefined();
        expect(
          StripeWebhookHandlerInstance.stripeHelper.expandResource
        ).toHaveBeenCalledWith(
          invoiceCreditNoteEvent.data.object.invoice,
          'invoices'
        );
        expect(
          StripeWebhookHandlerInstance.stripeHelper.expandResource
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.paypalHelper.issueRefund
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.paypalHelper.issueRefund
        ).toHaveBeenCalledWith(invoice, 'tx-1234', RefundType.Partial, 500);
        expect(
          StripeWebhookHandlerInstance.stripeHelper
            .getInvoicePaypalTransactionId
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.stripeHelper
            .getInvoicePaypalTransactionId
        ).toHaveBeenCalledWith(invoice);
      });

      it('issues refund when all checks are successful', async () => {
        StripeWebhookHandlerInstance.paypalHelper = {};
        invoice.collection_method = 'send_invoice';
        invoiceCreditNoteEvent.data.object.out_of_band_amount = 500;
        invoice.amount_due = 500;
        StripeWebhookHandlerInstance.stripeHelper.expandResource = jest
          .fn()
          .mockResolvedValue(invoice);
        StripeWebhookHandlerInstance.stripeHelper.getInvoicePaypalTransactionId =
          jest.fn().mockReturnValue('tx-1234');
        StripeWebhookHandlerInstance.log.error = jest.fn().mockReturnValue({});
        StripeWebhookHandlerInstance.paypalHelper.issueRefund = jest
          .fn()
          .mockResolvedValue({});
        const result = await StripeWebhookHandlerInstance.handleCreditNoteEvent(
          {},
          invoiceCreditNoteEvent
        );
        expect(result).toBeUndefined();
        expect(
          StripeWebhookHandlerInstance.stripeHelper.expandResource
        ).toHaveBeenCalledWith(
          invoiceCreditNoteEvent.data.object.invoice,
          'invoices'
        );
        expect(
          StripeWebhookHandlerInstance.stripeHelper.expandResource
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.stripeHelper
            .getInvoicePaypalTransactionId
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.stripeHelper
            .getInvoicePaypalTransactionId
        ).toHaveBeenCalledWith(invoice);
        expect(
          StripeWebhookHandlerInstance.paypalHelper.issueRefund
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.paypalHelper.issueRefund
        ).toHaveBeenCalledWith(invoice, 'tx-1234', RefundType.Full, undefined);
      });

      it('updates the invoice to report refused refund if paypal refuses to refund', async () => {
        const sentryMod = require('../../sentry');
        jest.spyOn(sentryMod, 'reportSentryError').mockReturnValue({});
        StripeWebhookHandlerInstance.paypalHelper = {};
        invoice.collection_method = 'send_invoice';
        invoiceCreditNoteEvent.data.object.out_of_band_amount = 500;
        invoice.amount_due = 500;
        StripeWebhookHandlerInstance.stripeHelper.expandResource = jest
          .fn()
          .mockResolvedValue(invoice);
        StripeWebhookHandlerInstance.stripeHelper.getInvoicePaypalTransactionId =
          jest.fn().mockReturnValue('tx-1234');
        StripeWebhookHandlerInstance.stripeHelper.updateInvoiceWithPaypalRefundReason =
          jest.fn().mockResolvedValue({});
        StripeWebhookHandlerInstance.log.error = jest.fn().mockReturnValue({});
        const refusedError = new RefusedError(
          'Transaction refused',
          'This transaction already has a chargeback filed',
          '10009'
        );
        StripeWebhookHandlerInstance.paypalHelper.issueRefund = jest
          .fn()
          .mockRejectedValue(refusedError);
        const result = await StripeWebhookHandlerInstance.handleCreditNoteEvent(
          {},
          invoiceCreditNoteEvent
        );
        expect(result).toBeUndefined();
        expect(
          StripeWebhookHandlerInstance.stripeHelper.expandResource
        ).toHaveBeenCalledWith(
          invoiceCreditNoteEvent.data.object.invoice,
          'invoices'
        );
        expect(
          StripeWebhookHandlerInstance.stripeHelper.expandResource
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.stripeHelper
            .getInvoicePaypalTransactionId
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.stripeHelper
            .getInvoicePaypalTransactionId
        ).toHaveBeenCalledWith(invoice);
        expect(
          StripeWebhookHandlerInstance.paypalHelper.issueRefund
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.paypalHelper.issueRefund
        ).toHaveBeenCalledWith(invoice, 'tx-1234', RefundType.Full, undefined);
        expect(
          StripeWebhookHandlerInstance.stripeHelper
            .updateInvoiceWithPaypalRefundReason
        ).toHaveBeenCalledTimes(1);
        expect(
          StripeWebhookHandlerInstance.stripeHelper
            .updateInvoiceWithPaypalRefundReason
        ).toHaveBeenCalledWith(
          invoice,
          'This transaction already has a chargeback filed'
        );
        refusedError.output = { payload: { invoiceId: invoice.id } };
        expect(sentryMod.reportSentryError).toHaveBeenCalledTimes(1);
        expect(sentryMod.reportSentryError).toHaveBeenCalledWith(
          refusedError,
          {}
        );
        expect(StripeWebhookHandlerInstance.log.error).toHaveBeenCalledTimes(1);
        expect(StripeWebhookHandlerInstance.log.error).toHaveBeenCalledWith(
          'handleCreditNoteEvent',
          {
            invoiceId: invoice.id,
            message: 'Paypal refund refused.',
          }
        );
      });
    });

    describe('handleInvoicePaidEvent', () => {
      it('sends email and emits a notification when an invoice payment succeeds', async () => {
        const paidEvent = deepCopy(eventInvoicePaid);
        const customer = deepCopy(customerFixture);
        const sendSubscriptionInvoiceEmailStub = jest
          .spyOn(StripeWebhookHandlerInstance, 'sendSubscriptionInvoiceEmail')
          .mockResolvedValue(true);
        const account = { email: customerFixture.email };
        jest
          .spyOn(authDbModule.Account, 'findByUid')
          .mockResolvedValue(account);
        StripeWebhookHandlerInstance.stripeHelper.expandResource.mockResolvedValue(
          customer
        );
        await StripeWebhookHandlerInstance.handleInvoicePaidEvent(
          {},
          paidEvent
        );
        expect(sendSubscriptionInvoiceEmailStub).toHaveBeenCalledWith(
          paidEvent.data.object
        );
      });

      it('reports a sentry error for a deleted customer', async () => {
        const paidEvent = deepCopy(eventInvoicePaid);
        const customer = deepCopy(customerFixture);
        customer.deleted = true;
        const sentryMod = require('../../sentry');
        jest.spyOn(sentryMod, 'reportSentryError').mockReturnValue({});
        const sendSubscriptionInvoiceEmailStub = jest
          .spyOn(StripeWebhookHandlerInstance, 'sendSubscriptionInvoiceEmail')
          .mockResolvedValue(true);
        StripeWebhookHandlerInstance.stripeHelper.expandResource.mockResolvedValue(
          customer
        );
        await StripeWebhookHandlerInstance.handleInvoicePaidEvent(
          {},
          paidEvent
        );
        expect(sendSubscriptionInvoiceEmailStub).not.toHaveBeenCalled();
        expect(sentryMod.reportSentryError).toHaveBeenCalledTimes(1);
        const thrownErr = sentryMod.reportSentryError.mock.calls[0][0];
        expect(thrownErr).toEqual(
          expect.objectContaining({
            customerId: paidEvent.data.object.customer,
            invoiceId: paidEvent.data.object.id,
          })
        );
      });

      it('reports a sentry error for a customer missing a userid', async () => {
        const paidEvent = deepCopy(eventInvoicePaid);
        const customer = deepCopy(customerFixture);
        customer.metadata = {};
        const sentryMod = require('../../sentry');
        jest.spyOn(sentryMod, 'reportSentryError').mockReturnValue({});
        const sendSubscriptionInvoiceEmailStub = jest
          .spyOn(StripeWebhookHandlerInstance, 'sendSubscriptionInvoiceEmail')
          .mockResolvedValue(true);
        StripeWebhookHandlerInstance.stripeHelper.expandResource.mockResolvedValue(
          customer
        );
        await StripeWebhookHandlerInstance.handleInvoicePaidEvent(
          {},
          paidEvent
        );
        expect(sendSubscriptionInvoiceEmailStub).not.toHaveBeenCalled();
        expect(sentryMod.reportSentryError).toHaveBeenCalledTimes(1);
        const thrownErr = sentryMod.reportSentryError.mock.calls[0][0];
        expect(thrownErr).toEqual(
          expect.objectContaining({
            customerId: paidEvent.data.object.customer,
            invoiceId: paidEvent.data.object.id,
          })
        );
      });

      it('reports a sentry error for a customer missing a firefox account', async () => {
        const paidEvent = deepCopy(eventInvoicePaid);
        const customer = deepCopy(customerFixture);
        const sentryMod = require('../../sentry');
        jest.spyOn(sentryMod, 'reportSentryError').mockReturnValue({});
        const sendSubscriptionInvoiceEmailStub = jest
          .spyOn(StripeWebhookHandlerInstance, 'sendSubscriptionInvoiceEmail')
          .mockResolvedValue(true);
        StripeWebhookHandlerInstance.stripeHelper.expandResource.mockResolvedValue(
          customer
        );
        jest.spyOn(authDbModule.Account, 'findByUid').mockResolvedValue(null);
        await StripeWebhookHandlerInstance.handleInvoicePaidEvent(
          {},
          paidEvent
        );
        expect(sendSubscriptionInvoiceEmailStub).not.toHaveBeenCalled();
        expect(sentryMod.reportSentryError).toHaveBeenCalledTimes(1);
        const thrownErr = sentryMod.reportSentryError.mock.calls[0][0];
        expect(thrownErr).toEqual(
          expect.objectContaining({
            customerId: paidEvent.data.object.customer,
            invoiceId: paidEvent.data.object.id,
            userId: customer.metadata.userid,
          })
        );
      });
    });

    describe('handleInvoicePaymentFailedEvent', () => {
      const mockSubscription = {
        id: 'test1',
        plan: { product: 'test2' },
      };
      let sendSubscriptionPaymentFailedEmailStub: any;

      beforeEach(() => {
        sendSubscriptionPaymentFailedEmailStub = jest
          .spyOn(
            StripeWebhookHandlerInstance,
            'sendSubscriptionPaymentFailedEmail'
          )
          .mockResolvedValue(true);
        StripeWebhookHandlerInstance.stripeHelper.expandResource.mockResolvedValue(
          mockSubscription
        );
      });

      it('sends email and emits a notification when an invoice payment fails', async () => {
        const paymentFailedEvent = deepCopy(eventInvoicePaymentFailed);
        paymentFailedEvent.data.object.billing_reason = 'subscription_cycle';
        await StripeWebhookHandlerInstance.handleInvoicePaymentFailedEvent(
          {},
          paymentFailedEvent
        );
        expect(sendSubscriptionPaymentFailedEmailStub).toHaveBeenCalledWith(
          paymentFailedEvent.data.object
        );
      });

      it('does not send email during subscription creation flow', async () => {
        const paymentFailedEvent = deepCopy(eventInvoicePaymentFailed);
        paymentFailedEvent.data.object.billing_reason = 'subscription_create';
        await StripeWebhookHandlerInstance.handleInvoicePaymentFailedEvent(
          {},
          paymentFailedEvent
        );
        expect(sendSubscriptionPaymentFailedEmailStub).not.toHaveBeenCalled();
      });
    });

    describe('handleInvoiceUpcomingEvent', () => {
      const mockCustomer = {
        deleted: false,
        invoice_settings: {
          default_payment_method: {
            id: 'pm_test',
          },
        },
        metadata: {
          userid: 'userid',
        },
      };
      const mockPaymentMethod = {};
      let sendSubscriptionPaymentExpiredEmailStub: any;

      beforeEach(() => {
        sendSubscriptionPaymentExpiredEmailStub = jest
          .spyOn(
            StripeWebhookHandlerInstance,
            'sendSubscriptionPaymentExpiredEmail'
          )
          .mockResolvedValue(true);
        StripeWebhookHandlerInstance.stripeHelper.expandResource
          .mockResolvedValueOnce(mockCustomer)
          .mockResolvedValueOnce(mockPaymentMethod);
      });

      it('does nothing, when customer is deleted', async () => {
        StripeWebhookHandlerInstance.stripeHelper.expandResource.mockReset();
        StripeWebhookHandlerInstance.stripeHelper.expandResource.mockResolvedValueOnce(
          { ...mockCustomer, deleted: true }
        );
        await StripeWebhookHandlerInstance.handleInvoiceUpcomingEvent(
          {},
          eventInvoiceUpcoming
        );
        expect(
          StripeWebhookHandlerInstance.stripeHelper.expandResource
        ).toHaveBeenCalledTimes(1);
        expect(sendSubscriptionPaymentExpiredEmailStub).not.toHaveBeenCalled();
      });

      it('does nothing, invoice settings doesnt exist because payment method is Paypal', async () => {
        StripeWebhookHandlerInstance.stripeHelper.expandResource.mockReset();
        StripeWebhookHandlerInstance.stripeHelper.expandResource.mockResolvedValueOnce(
          { ...mockCustomer, invoice_settings: null }
        );
        await StripeWebhookHandlerInstance.handleInvoiceUpcomingEvent(
          {},
          eventInvoiceUpcoming
        );
        expect(
          StripeWebhookHandlerInstance.stripeHelper.expandResource
        ).toHaveBeenCalledTimes(1);
        expect(sendSubscriptionPaymentExpiredEmailStub).not.toHaveBeenCalled();
      });

      it('reports Sentry Error and return, when payment method doesnt have a card', async () => {
        const sentryMod = require('../../sentry');
        jest.spyOn(sentryMod, 'reportSentryError').mockReturnValue({});
        await StripeWebhookHandlerInstance.handleInvoiceUpcomingEvent(
          {},
          eventInvoiceUpcoming
        );
        expect(
          StripeWebhookHandlerInstance.stripeHelper.expandResource
        ).toHaveBeenCalledTimes(2);
        expect(
          StripeWebhookHandlerInstance.stripeHelper.formatSubscriptionsForEmails
        ).not.toHaveBeenCalled();
        expect(sendSubscriptionPaymentExpiredEmailStub).not.toHaveBeenCalled();
        expect(sentryMod.reportSentryError).toHaveBeenCalledTimes(1);
      });

      it('does nothing, when credit card is expiring in the future', async () => {
        StripeWebhookHandlerInstance.stripeHelper.expandResource.mockReset();
        StripeWebhookHandlerInstance.stripeHelper.expandResource
          .mockResolvedValueOnce(mockCustomer)
          .mockResolvedValueOnce({
            card: {
              exp_month: new Date().getMonth() + 1,
              exp_year: new Date().getFullYear() + 1,
            },
          });
        await StripeWebhookHandlerInstance.handleInvoiceUpcomingEvent(
          {},
          eventInvoiceUpcoming
        );
        expect(
          StripeWebhookHandlerInstance.stripeHelper.expandResource
        ).toHaveBeenCalledTimes(2);
        expect(
          StripeWebhookHandlerInstance.stripeHelper.formatSubscriptionsForEmails
        ).not.toHaveBeenCalled();
        expect(sendSubscriptionPaymentExpiredEmailStub).not.toHaveBeenCalled();
      });

      it('reports Sentry Error and return, when customer doesnt have active subscriptions', async () => {
        const sentryMod = require('../../sentry');
        jest.spyOn(sentryMod, 'reportSentryError').mockReturnValue({});
        StripeWebhookHandlerInstance.stripeHelper.formatSubscriptionsForEmails.mockResolvedValue(
          []
        );
        StripeWebhookHandlerInstance.stripeHelper.expandResource.mockReset();
        StripeWebhookHandlerInstance.stripeHelper.expandResource
          .mockResolvedValueOnce(mockCustomer)
          .mockResolvedValueOnce({
            card: {
              exp_month: new Date().getMonth() + 1,
              exp_year: new Date().getFullYear(),
            },
          });
        await StripeWebhookHandlerInstance.handleInvoiceUpcomingEvent(
          {},
          eventInvoiceUpcoming
        );
        expect(
          StripeWebhookHandlerInstance.stripeHelper.expandResource
        ).toHaveBeenCalledTimes(2);
        expect(
          StripeWebhookHandlerInstance.stripeHelper.formatSubscriptionsForEmails
        ).toHaveBeenCalled();
        expect(sendSubscriptionPaymentExpiredEmailStub).not.toHaveBeenCalled();
        expect(sentryMod.reportSentryError).toHaveBeenCalledTimes(1);
      });

      it('sends an email when default payment credit card expires the current month', async () => {
        StripeWebhookHandlerInstance.stripeHelper.expandResource.mockReset();
        StripeWebhookHandlerInstance.stripeHelper.expandResource
          .mockResolvedValueOnce(mockCustomer)
          .mockResolvedValueOnce({
            card: {
              exp_month: new Date().getMonth() + 1,
              exp_year: new Date().getFullYear(),
            },
          });
        StripeWebhookHandlerInstance.stripeHelper.formatSubscriptionsForEmails.mockResolvedValue(
          [
            {
              id: 'sub1',
            },
          ]
        );
        await StripeWebhookHandlerInstance.handleInvoiceUpcomingEvent(
          {},
          eventInvoiceUpcoming
        );
        expect(
          StripeWebhookHandlerInstance.stripeHelper.expandResource
        ).toHaveBeenCalledTimes(2);
        expect(
          StripeWebhookHandlerInstance.stripeHelper.formatSubscriptionsForEmails
        ).toHaveBeenCalled();
        expect(sendSubscriptionPaymentExpiredEmailStub).toHaveBeenCalled();
      });

      it('sends an email when default payment credit card expires before the current month', async () => {
        StripeWebhookHandlerInstance.stripeHelper.expandResource.mockReset();
        StripeWebhookHandlerInstance.stripeHelper.expandResource
          .mockResolvedValueOnce(mockCustomer)
          .mockResolvedValueOnce({
            card: {
              exp_month: new Date().getMonth() + 1,
              exp_year: new Date().getFullYear() - 1,
            },
          });
        StripeWebhookHandlerInstance.stripeHelper.formatSubscriptionsForEmails.mockResolvedValue(
          [
            {
              id: 'sub1',
            },
          ]
        );
        await StripeWebhookHandlerInstance.handleInvoiceUpcomingEvent(
          {},
          eventInvoiceUpcoming
        );
        expect(
          StripeWebhookHandlerInstance.stripeHelper.expandResource
        ).toHaveBeenCalledTimes(2);
        expect(
          StripeWebhookHandlerInstance.stripeHelper.formatSubscriptionsForEmails
        ).toHaveBeenCalled();
        expect(sendSubscriptionPaymentExpiredEmailStub).toHaveBeenCalled();
      });
    });

    describe('handleSubscriptionCreatedEvent', () => {
      it('emits a notification when a new subscription is "active" or "trialing"', async () => {
        const createdEvent = deepCopy(subscriptionCreated);
        await StripeWebhookHandlerInstance.handleSubscriptionCreatedEvent(
          {},
          createdEvent
        );
        expect(mockCapabilityService.stripeUpdate).toHaveBeenCalledWith({
          sub: createdEvent.data.object,
        });
      });

      it('does not emit a notification for incomplete new subscriptions', async () => {
        const createdEvent = deepCopy(subscriptionCreatedIncomplete);
        await StripeWebhookHandlerInstance.handleSubscriptionCreatedEvent(
          {},
          createdEvent
        );
        expect(
          authDbModule.getUidAndEmailByStripeCustomerId
        ).not.toHaveBeenCalled();
        expect(mockCapabilityService.stripeUpdate).not.toHaveBeenCalled();
      });
    });
  });

  describe('sendSubscriptionPaymentExpiredEmail', () => {
    const mockAccount = {
      email: TEST_EMAIL,
      emails: [TEST_EMAIL],
      locale: ACCOUNT_LOCALE,
    };
    const mockSourceDetails = {
      uid: UID,
      email: TEST_EMAIL,
      subscriptions: [{ id: 'sub_testo' }],
    };

    it('sends the email with a list of subscriptions', async () => {
      StripeWebhookHandlerInstance.db.account = jest
        .fn()
        .mockResolvedValue(mockAccount);
      StripeWebhookHandlerInstance.mailer.sendSubscriptionPaymentExpiredEmail =
        jest.fn();

      await StripeWebhookHandlerInstance.sendSubscriptionPaymentExpiredEmail(
        mockSourceDetails
      );

      expect(StripeWebhookHandlerInstance.db.account).toHaveBeenCalledTimes(1);
      expect(StripeWebhookHandlerInstance.db.account).toHaveBeenCalledWith(UID);
      expect(
        StripeWebhookHandlerInstance.mailer.sendSubscriptionPaymentExpiredEmail
      ).toHaveBeenCalledTimes(1);
      expect(
        StripeWebhookHandlerInstance.mailer.sendSubscriptionPaymentExpiredEmail
      ).toHaveBeenCalledWith([TEST_EMAIL], mockAccount, {
        acceptLanguage: ACCOUNT_LOCALE,
        ...mockSourceDetails,
      });
    });

    it('send email using email on account', async () => {
      const mockSourceDetailsNullEmail = {
        ...mockSourceDetails,
        email: null,
      };
      StripeWebhookHandlerInstance.db.account = jest
        .fn()
        .mockResolvedValue(mockAccount);
      StripeWebhookHandlerInstance.mailer.sendSubscriptionPaymentExpiredEmail =
        jest.fn();

      await StripeWebhookHandlerInstance.sendSubscriptionPaymentExpiredEmail(
        mockSourceDetailsNullEmail
      );

      expect(StripeWebhookHandlerInstance.db.account).toHaveBeenCalledTimes(1);
      expect(StripeWebhookHandlerInstance.db.account).toHaveBeenCalledWith(UID);
      expect(
        StripeWebhookHandlerInstance.mailer.sendSubscriptionPaymentExpiredEmail
      ).toHaveBeenCalledTimes(1);
      expect(
        StripeWebhookHandlerInstance.mailer.sendSubscriptionPaymentExpiredEmail
      ).toHaveBeenCalledWith([TEST_EMAIL], mockAccount, {
        acceptLanguage: ACCOUNT_LOCALE,
        ...mockSourceDetails,
      });
    });
  });

  describe('sendSubscriptionPaymentFailedEmail', () => {
    it('sends the payment failed email', async () => {
      const invoice = deepCopy(eventInvoicePaymentFailed.data.object);

      const mockInvoiceDetails = { uid: '1234', test: 'fake' };
      StripeWebhookHandlerInstance.stripeHelper.extractInvoiceDetailsForEmail.mockResolvedValue(
        mockInvoiceDetails
      );

      const mockAccount = { emails: 'fakeemails', locale: 'fakelocale' };
      StripeWebhookHandlerInstance.db.account = jest.fn(
        async () => mockAccount
      );

      await StripeWebhookHandlerInstance.sendSubscriptionPaymentFailedEmail(
        invoice
      );
      expect(
        StripeWebhookHandlerInstance.mailer.sendSubscriptionPaymentFailedEmail
      ).toHaveBeenCalledWith(mockAccount.emails, mockAccount, {
        acceptLanguage: mockAccount.locale,
        ...mockInvoiceDetails,
        email: (mockAccount as any).primaryEmail,
      });
    });
  });

  describe('sendSubscriptionInvoiceEmail', () => {
    const commonSendSubscriptionInvoiceEmailTest =
      (
        expectedMethodName: string,
        billingReason: string,
        verifierSetAt = Date.now()
      ) =>
      async () => {
        const invoice = eventInvoicePaid.data.object;

        invoice.billing_reason = billingReason;

        const mockInvoiceDetails = { uid: '1234', test: 'fake' };
        StripeWebhookHandlerInstance.stripeHelper.extractInvoiceDetailsForEmail.mockResolvedValue(
          mockInvoiceDetails
        );

        const mockAccount: any = {
          emails: 'fakeemails',
          locale: 'fakelocale',
          verifierSetAt,
        };
        StripeWebhookHandlerInstance.db.account = jest.fn(
          async () => mockAccount
        );

        await StripeWebhookHandlerInstance.sendSubscriptionInvoiceEmail(
          invoice
        );
        expect(
          StripeWebhookHandlerInstance.mailer[expectedMethodName]
        ).toHaveBeenCalledWith(mockAccount.emails, mockAccount, {
          acceptLanguage: mockAccount.locale,
          ...mockInvoiceDetails,
          email: mockAccount.primaryEmail,
        });
        if (expectedMethodName === 'sendSubscriptionFirstInvoiceEmail') {
          if (verifierSetAt) {
            expect(
              StripeWebhookHandlerInstance.mailer.sendDownloadSubscriptionEmail
            ).toHaveBeenCalledWith(mockAccount.emails, mockAccount, {
              acceptLanguage: mockAccount.locale,
              ...mockInvoiceDetails,
              email: mockAccount.primaryEmail,
            });
          } else {
            expect(
              StripeWebhookHandlerInstance.mailer.sendDownloadSubscriptionEmail
            ).not.toHaveBeenCalled();
          }
        }
      };

    it(
      'sends the initial invoice email for a newly created subscription',
      commonSendSubscriptionInvoiceEmailTest(
        'sendSubscriptionFirstInvoiceEmail',
        'subscription_create',
        1
      )
    );

    it(
      'sends the subsequent invoice email for billing reasons besides creation',
      commonSendSubscriptionInvoiceEmailTest(
        'sendSubscriptionSubsequentInvoiceEmail',
        'subscription_cycle'
      )
    );

    it('does not send email for subscription_update billing reason', async () => {
      const invoice = eventInvoicePaid.data.object;
      invoice.billing_reason = 'subscription_update';

      const mockInvoiceDetails = { uid: '1234', test: 'fake' };
      StripeWebhookHandlerInstance.stripeHelper.extractInvoiceDetailsForEmail.mockResolvedValue(
        mockInvoiceDetails
      );

      const mockAccount = {
        emails: 'fakeemails',
        locale: 'fakelocale',
        verifierSetAt: Date.now(),
      };
      StripeWebhookHandlerInstance.db.account = jest.fn(
        async () => mockAccount
      );

      await StripeWebhookHandlerInstance.sendSubscriptionInvoiceEmail(invoice);

      expect(
        StripeWebhookHandlerInstance.mailer.sendSubscriptionFirstInvoiceEmail
      ).not.toHaveBeenCalled();
      expect(
        StripeWebhookHandlerInstance.mailer
          .sendSubscriptionSubsequentInvoiceEmail
      ).not.toHaveBeenCalled();
      expect(
        StripeWebhookHandlerInstance.mailer.sendDownloadSubscriptionEmail
      ).not.toHaveBeenCalled();
    });
  });

  describe('sendSubscriptionUpdatedEmail', () => {
    const commonSendSubscriptionUpdatedEmailTest =
      (updateType: any) => async () => {
        const event = deepCopy(eventCustomerSubscriptionUpdated);

        const mockDetails = {
          uid: '1234',
          test: 'fake',
          updateType,
        };
        StripeWebhookHandlerInstance.stripeHelper.extractSubscriptionUpdateEventDetailsForEmail.mockResolvedValue(
          mockDetails
        );

        const mockAccount = { emails: 'fakeemails', locale: 'fakelocale' };
        StripeWebhookHandlerInstance.db.account = jest.fn(
          async () => mockAccount
        );

        await StripeWebhookHandlerInstance.sendSubscriptionUpdatedEmail(event);

        const expectedMethodName = (
          {
            [SUBSCRIPTION_UPDATE_TYPES.UPGRADE]: 'sendSubscriptionUpgradeEmail',
            [SUBSCRIPTION_UPDATE_TYPES.DOWNGRADE]:
              'sendSubscriptionDowngradeEmail',
            [SUBSCRIPTION_UPDATE_TYPES.REACTIVATION]:
              'sendSubscriptionReactivationEmail',
            [SUBSCRIPTION_UPDATE_TYPES.CANCELLATION]:
              'sendSubscriptionCancellationEmail',
          } as any
        )[updateType];

        expect(
          StripeWebhookHandlerInstance.mailer[expectedMethodName]
        ).toHaveBeenCalledWith(mockAccount.emails, mockAccount, {
          acceptLanguage: mockAccount.locale,
          ...mockDetails,
        });
      };

    it(
      'sends an upgrade email on subscription upgrade',
      commonSendSubscriptionUpdatedEmailTest(SUBSCRIPTION_UPDATE_TYPES.UPGRADE)
    );

    it(
      'sends a downgrade email on subscription downgrade',
      commonSendSubscriptionUpdatedEmailTest(
        SUBSCRIPTION_UPDATE_TYPES.DOWNGRADE
      )
    );

    it(
      'sends a reactivation email on subscription reactivation',
      commonSendSubscriptionUpdatedEmailTest(
        SUBSCRIPTION_UPDATE_TYPES.REACTIVATION
      )
    );

    it(
      'sends a cancellation email on subscription cancellation',
      commonSendSubscriptionUpdatedEmailTest(
        SUBSCRIPTION_UPDATE_TYPES.CANCELLATION
      )
    );
  });

  describe('sendSubscriptionDeletedEmail', () => {
    const commonSendSubscriptionDeletedEmailTest =
      (
        options = {
          accountFound: true,
          subscriptionAlreadyCancelled: false,
          involuntaryCancellation: false,
          immediateCancellation: false,
          hasOutstandingBalance: false,
        }
      ) =>
      async () => {
        const shouldSendSubscriptionFailedPaymentsCancellationEmail = () =>
          options.accountFound &&
          !options.subscriptionAlreadyCancelled &&
          options.involuntaryCancellation;

        const shouldSendAccountDeletedEmail = () =>
          !options.accountFound &&
          !options.subscriptionAlreadyCancelled &&
          !options.involuntaryCancellation;

        const shouldSendCancellationEmail = () =>
          options.accountFound &&
          !options.subscriptionAlreadyCancelled &&
          !options.involuntaryCancellation &&
          options.immediateCancellation;

        const deletedEvent = deepCopy(subscriptionDeleted);
        const subscription = deletedEvent.data.object;

        if (options.subscriptionAlreadyCancelled) {
          subscription.metadata = {
            cancelled_for_customer_at: moment().unix(),
          };
        }
        StripeWebhookHandlerInstance.stripeHelper.checkSubscriptionPastDue.mockReturnValue(
          options.involuntaryCancellation
        );

        const mockInvoiceDetails: any = {
          uid: '1234',
          test: 'fake',
          email: 'test@example.com',
        };
        if (options.hasOutstandingBalance) {
          mockInvoiceDetails.invoiceStatus = 'draft';
        } else {
          mockInvoiceDetails.invoiceStatus = 'paid';
        }
        StripeWebhookHandlerInstance.stripeHelper.extractInvoiceDetailsForEmail.mockResolvedValue(
          mockInvoiceDetails
        );
        StripeWebhookHandlerInstance.stripeHelper.expandResource.mockResolvedValue(
          {
            id: 'in_1GB4aHKb9q6OnNsLC9pbVY5a',
          }
        );

        const mockAccount = { emails: 'fakeemails', locale: 'fakelocale' };
        StripeWebhookHandlerInstance.db.account = jest.fn(async (data: any) => {
          if (options.accountFound) {
            return mockAccount;
          }
          throw error.unknownAccount();
        });

        await StripeWebhookHandlerInstance.sendSubscriptionDeletedEmail(
          subscription
        );

        if (shouldSendSubscriptionFailedPaymentsCancellationEmail()) {
          expect(
            StripeWebhookHandlerInstance.stripeHelper
              .extractInvoiceDetailsForEmail
          ).toHaveBeenCalledWith({ id: subscription.latest_invoice });
          expect(
            StripeWebhookHandlerInstance.mailer
              .sendSubscriptionFailedPaymentsCancellationEmail
          ).toHaveBeenCalledWith(mockAccount.emails, mockAccount, {
            acceptLanguage: mockAccount.locale,
            ...mockInvoiceDetails,
            email: (mockAccount as any).primaryEmail,
          });
        } else {
          expect(
            StripeWebhookHandlerInstance.mailer
              .sendSubscriptionFailedPaymentsCancellationEmail
          ).not.toHaveBeenCalled();
        }

        if (shouldSendAccountDeletedEmail()) {
          const fakeAccount = {
            email: mockInvoiceDetails.email,
            uid: mockInvoiceDetails.uid,
            emails: [{ email: mockInvoiceDetails.email, isPrimary: true }],
          };
          expect(
            StripeWebhookHandlerInstance.mailer
              .sendSubscriptionAccountDeletionEmail
          ).toHaveBeenCalledWith(
            fakeAccount.emails,
            fakeAccount,
            mockInvoiceDetails
          );
        } else {
          expect(
            StripeWebhookHandlerInstance.mailer
              .sendSubscriptionAccountDeletionEmail
          ).not.toHaveBeenCalled();
        }

        if (shouldSendCancellationEmail()) {
          expect(
            StripeWebhookHandlerInstance.mailer
              .sendSubscriptionCancellationEmail
          ).toHaveBeenCalledWith(mockAccount.emails, mockAccount, {
            acceptLanguage: mockAccount.locale,
            ...mockInvoiceDetails,
            showOutstandingBalance: options.hasOutstandingBalance,
            cancelAtEnd: subscription.cancel_at_period_end,
            isFreeTrialCancellation: false,
            email: (mockAccount as any).primaryEmail,
          });
        } else {
          expect(
            StripeWebhookHandlerInstance.mailer
              .sendSubscriptionCancellationEmail
          ).not.toHaveBeenCalled();
        }
      };

    it(
      'does not send a cancellation email on subscription deletion',
      commonSendSubscriptionDeletedEmailTest({
        accountFound: true,
        subscriptionAlreadyCancelled: true,
        involuntaryCancellation: false,
        immediateCancellation: false,
        hasOutstandingBalance: false,
      })
    );

    it(
      'sends an account deletion specific email on subscription deletion when account is gone',
      commonSendSubscriptionDeletedEmailTest({
        accountFound: false,
        subscriptionAlreadyCancelled: false,
        involuntaryCancellation: false,
        immediateCancellation: false,
        hasOutstandingBalance: false,
      })
    );

    it(
      'does not send a cancellation email on account deletion when the subscription is already cancelled',
      commonSendSubscriptionDeletedEmailTest({
        accountFound: false,
        subscriptionAlreadyCancelled: true,
        involuntaryCancellation: false,
        immediateCancellation: false,
        hasOutstandingBalance: false,
      })
    );

    it(
      'sends a failed payment cancellation email on subscription deletion',
      commonSendSubscriptionDeletedEmailTest({
        accountFound: true,
        subscriptionAlreadyCancelled: false,
        involuntaryCancellation: true,
        immediateCancellation: false,
        hasOutstandingBalance: false,
      })
    );

    it(
      'sends a subscription cancellation email on immediate subscription cancellation',
      commonSendSubscriptionDeletedEmailTest({
        accountFound: true,
        subscriptionAlreadyCancelled: false,
        involuntaryCancellation: false,
        immediateCancellation: true,
        hasOutstandingBalance: false,
      })
    );

    it(
      'sends a subscription cancellation email on immediate subscription cancellation, showing outstanding balance',
      commonSendSubscriptionDeletedEmailTest({
        accountFound: true,
        subscriptionAlreadyCancelled: false,
        involuntaryCancellation: false,
        immediateCancellation: true,
        hasOutstandingBalance: true,
      })
    );
  });

  describe('getSubscriptionEndedEventDetails', () => {
    const mockCustomerFixture = deepCopy(customerFixture);
    mockCustomerFixture.shipping = {
      address: {
        country: 'BC',
      },
    };
    const subscriptionEndedEvent = deepCopy(subscriptionDeleted);
    const subscriptionEnded = subscriptionEndedEvent.data.object;
    subscriptionEnded.cancellation_details = {
      reason: 'cancellation_requested',
    };
    const mockInvoice = deepCopy(invoiceFixture);

    const mockSubscriptionEndedEventDetails: any = {
      country_code: mockCustomerFixture.shipping.address.country,
      payment_provider: 'stripe',
      plan_id: subscriptionEnded.items.data[0].plan.id,
      product_id: subscriptionEnded.items.data[0].plan.product,
      provider_event_id: subscriptionDeleted.id,
      subscription_id: subscriptionEnded.id,
      uid: mockCustomerFixture.metadata.userid,
      voluntary_cancellation: true,
    };

    beforeEach(() => {
      StripeWebhookHandlerInstance.stripeHelper.expandResource.mockResolvedValue(
        mockInvoice
      );
    });

    it('returns voluntary_cancellation as true', async () => {
      const result =
        await StripeWebhookHandlerInstance.getSubscriptionEndedEventDetails(
          mockCustomerFixture.metadata.userid,
          subscriptionDeleted.id,
          mockCustomerFixture,
          subscriptionEnded
        );

      const expected = mockSubscriptionEndedEventDetails;

      expect(result).toEqual(expected);
    });

    it('returns voluntary_cancellation false - Stripe', async () => {
      subscriptionEnded.cancellation_details = {
        reason: 'payment_failed',
      };
      mockSubscriptionEndedEventDetails.voluntary_cancellation = false;

      const result =
        await StripeWebhookHandlerInstance.getSubscriptionEndedEventDetails(
          mockCustomerFixture.metadata.userid,
          subscriptionDeleted.id,
          mockCustomerFixture,
          subscriptionEnded
        );

      const expected = mockSubscriptionEndedEventDetails;

      expect(result).toEqual(expected);
    });

    it('returns voluntary_cancellation false - PayPal', async () => {
      subscriptionEnded.collection_method = 'send_invoice';
      mockInvoice.status = 'uncollectible';
      mockSubscriptionEndedEventDetails.payment_provider = 'paypal';
      mockSubscriptionEndedEventDetails.voluntary_cancellation = false;

      const result =
        await StripeWebhookHandlerInstance.getSubscriptionEndedEventDetails(
          mockCustomerFixture.metadata.userid,
          subscriptionDeleted.id,
          mockCustomerFixture,
          subscriptionEnded
        );

      const expected = mockSubscriptionEndedEventDetails;

      expect(result).toEqual(expected);
    });
  });
});
