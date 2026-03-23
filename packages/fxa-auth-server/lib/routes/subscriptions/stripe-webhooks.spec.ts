/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sinon from 'sinon';
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
  let sandbox: sinon.SinonSandbox;
  let StripeWebhookHandlerInstance: any;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    mockCapabilityService = {
      stripeUpdate: sandbox.stub().resolves({}),
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
      deleteCache: sinon.spy(async (uid: any) => ({})),
    });
    mailer = mocks.mockMailer();

    db = mocks.mockDB({
      uid: UID,
      email: TEST_EMAIL,
      locale: ACCOUNT_LOCALE,
    });
    const stripeHelperMock = sandbox.createStubInstance(StripeHelper);
    const paypalHelperMock = sandbox.createStubInstance(PayPalHelper);
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

    sandbox.stub(authDbModule, 'getUidAndEmailByStripeCustomerId').resolves({
      uid: UID,
      email: TEST_EMAIL,
    });
  });

  afterEach(() => {
    Container.reset();
    sandbox.restore();
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
      StripeWebhookHandlerInstance.stripeHelper.fetchPlansByProductId.returns(
        asyncIterable(deepCopy(validPlanList))
      );
      StripeWebhookHandlerInstance.stripeHelper.fetchProductById.returns({
        product_id: validProduct.data.object.id,
        product_name: validProduct.data.object.name,
        product_metadata: validProduct.data.object.metadata,
      });
      StripeWebhookHandlerInstance.stripeHelper.expandResource.resolves({});
      StripeWebhookHandlerInstance.stripeHelper.getCard.resolves({});
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
          handlerStubs[handlerName] = sandbox
            .stub(StripeWebhookHandlerInstance, handlerName)
            .resolves();
        }
        scopeContextSpy = sinon.fake();
        scopeExtraSpy = sinon.fake();
        scopeSpy = {
          setContext: scopeContextSpy,
          setExtra: scopeExtraSpy,
        };
        sandbox.replace(Sentry, 'withScope', (fn: any) => fn(scopeSpy));
      });

      const assertNamedHandlerCalled = (expectedHandlerName: string | null = null) => {
        for (const handlerName of handlerNames) {
          const shouldCall =
            expectedHandlerName && handlerName === expectedHandlerName;
          expect(
            handlerStubs[handlerName][shouldCall ? 'called' : 'notCalled']
          ).toBe(true);
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
          StripeWebhookHandlerInstance.stripeHelper.constructWebhookEvent.returns(
            createdEvent
          );
          await StripeWebhookHandlerInstance.handleWebhookEvent(request);
          assertNamedHandlerCalled(expectedHandlerName);
          if (expectSentry) {
            expect(scopeContextSpy.notCalled).toBe(false);
          } else {
            expect(scopeContextSpy.notCalled).toBe(true);
          }
          if (expectedHandlerName === 'handleCustomerSourceExpiringEvent') {
            sinon.assert.calledOnce(
              StripeWebhookHandlerInstance.stripeHelper.getCard
            );
          } else {
            expect(
              StripeWebhookHandlerInstance.stripeHelper.expandResource
                .calledOnce
            ).toBe(expectExpandResource);
          }
        });

      describe('ignorable errors', () => {
        const commonIgnorableErrorTest = (expectedError: any) => async () => {
          const fixture = deepCopy(eventCustomerSourceExpiring);
          handlerStubs.handleCustomerSourceExpiringEvent.throws(expectedError);
          StripeWebhookHandlerInstance.stripeHelper.constructWebhookEvent.returns(
            fixture
          );
          let errorThrown: any = null;
          try {
            await StripeWebhookHandlerInstance.handleWebhookEvent(request);
            sinon.assert.calledWith(
              StripeWebhookHandlerInstance.log.error,
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
          StripeWebhookHandlerInstance.stripeHelper.constructWebhookEvent.returns(
            fixture
          );
        });

        it('should throw with FirestoreStripeErrorBuilder if no customerId is provided', async () => {
          const expectedError = new FirestoreStripeErrorBuilder(
            'testError',
            FirestoreStripeError.FIRESTORE_SUBSCRIPTION_NOT_FOUND
          );
          handlerStubs.handleCustomerSourceExpiringEvent.throws(expectedError);
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
          handlerStubs.handleCustomerSourceExpiringEvent.throws(handlerError);
          sandbox
            .stub(StripeWebhookHandlerInstance, 'checkIfAccountExists')
            .rejects(expectedError);

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
          handlerStubs.handleCustomerSourceExpiringEvent.throws(expectedError);
          sandbox
            .stub(StripeWebhookHandlerInstance, 'checkIfAccountExists')
            .resolves(true);
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
          handlerStubs.handleCustomerSourceExpiringEvent.throws(expectedError);
          sandbox
            .stub(StripeWebhookHandlerInstance, 'checkIfAccountExists')
            .resolves(false);
          try {
            await StripeWebhookHandlerInstance.handleWebhookEvent(request);
          } catch (err) {
            errorThrown = err;
          }
          sinon.assert.calledWith(
            StripeWebhookHandlerInstance.log.error,
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
          StripeWebhookHandlerInstance.stripeHelper.constructWebhookEvent.returns(
            event
          );
          await StripeWebhookHandlerInstance.handleWebhookEvent(request);
          assertNamedHandlerCalled();
          expect(scopeContextSpy.calledOnce).toBe(true);
        });

        it('does not call sentry or expand resource for event payment_method.detached', async () => {
          const event = deepCopy(subscriptionCreated);
          event.type = 'payment_method.detached';
          StripeWebhookHandlerInstance.stripeHelper.constructWebhookEvent.returns(
            event
          );
          StripeWebhookHandlerInstance.stripeHelper.processWebhookEventToFirestore =
            sinon.stub().resolves(true);
          await StripeWebhookHandlerInstance.handleWebhookEvent(request);
          assertNamedHandlerCalled();
          expect(
            StripeWebhookHandlerInstance.stripeHelper.expandResource.calledOnce
          ).toBe(false);
          sinon.assert.notCalled(scopeContextSpy);
        });

        it('does not call sentry if handled by firestore', async () => {
          const event = deepCopy(subscriptionCreated);
          event.type = 'firestore.document.created';
          StripeWebhookHandlerInstance.stripeHelper.constructWebhookEvent.returns(
            event
          );
          StripeWebhookHandlerInstance.stripeHelper.processWebhookEventToFirestore =
            sinon.stub().resolves(true);
          await StripeWebhookHandlerInstance.handleWebhookEvent(request);
          assertNamedHandlerCalled();
          sinon.assert.notCalled(scopeContextSpy);
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
          sandbox.stub(sentryMod, 'reportSentryError').returns({});
          StripeWebhookHandlerInstance.stripeHelper.getCoupon.resolves(coupon);
          await StripeWebhookHandlerInstance.handleCouponEvent({}, event);
          sinon.assert.notCalled(sentryMod.reportSentryError);
        });

        it(`reports an error for invalid coupon on ${eventType}`, async () => {
          const event = deepCopy(eventCouponCreated);
          event.type = eventType;
          const coupon = deepCopy(event.data.object);
          const sentryMod = require('../../sentry');
          coupon.applies_to = { products: ['productOhNo'] };
          sandbox.stub(sentryMod, 'reportSentryError').returns({});
          StripeWebhookHandlerInstance.stripeHelper.getCoupon.resolves(coupon);
          await StripeWebhookHandlerInstance.handleCouponEvent({}, event);
          sinon.assert.calledOnce(sentryMod.reportSentryError);
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

        sinon.assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.db.accountRecord,
          customerFixture.email
        );
        sinon.assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper.createLocalCustomer,
          UID,
          customerFixture
        );
      });
    });

    describe('handleCustomerUpdatedEvent', () => {
      it('removes the customer if the account exists', async () => {
        const authDb = require('fxa-shared/db/models/auth');
        const account = { email: customerFixture.email };
        sandbox.stub(authDb.Account, 'findByUid').resolves(account);
        await StripeWebhookHandlerInstance.handleCustomerUpdatedEvent(
          {},
          {
            data: { object: customerFixture },
            type: 'customer.updated',
          }
        );
        sinon.assert.calledOnceWithExactly(
          authDb.Account.findByUid,
          customerFixture.metadata.userid,
          { include: ['emails'] }
        );
      });

      it('reports sentry error with no customer found', async () => {
        const authDb = require('fxa-shared/db/models/auth');
        const sentryMod = require('../../sentry');
        sandbox.stub(sentryMod, 'reportSentryError').returns({});
        sandbox.stub(authDb.Account, 'findByUid').resolves(null);
        await StripeWebhookHandlerInstance.handleCustomerUpdatedEvent(
          {},
          {
            data: { object: customerFixture },
            type: 'customer.updated',
            request: {},
          }
        );
        sinon.assert.calledOnce(sentryMod.reportSentryError);
      });

      it('does not report error with no customer if the customer was deleted', async () => {
        const authDb = require('fxa-shared/db/models/auth');
        const sentryMod = require('../../sentry');
        sandbox.stub(sentryMod, 'reportSentryError').returns({});
        sandbox.stub(authDb.Account, 'findByUid').resolves(null);
        const customer = deepCopy(customerFixture);
        customer.deleted = true;
        await StripeWebhookHandlerInstance.handleCustomerUpdatedEvent(
          {},
          {
            data: { object: customer },
            type: 'customer.updated',
          }
        );
        sinon.assert.notCalled(sentryMod.reportSentryError);
      });

      it('does not report error with no customer if the account does not exist but it was an api call', async () => {
        const authDb = require('fxa-shared/db/models/auth');
        sandbox.stub(sentryModule, 'reportSentryError').returns({});
        sandbox.stub(authDb.Account, 'findByUid').resolves(null);
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
        sinon.assert.notCalled(sentryModule.reportSentryError);
      });
    });

    describe('handleProductWebhookEvent', () => {
      let scopeContextSpy: any, scopeSpy: any, captureMessageSpy: any;
      beforeEach(() => {
        captureMessageSpy = sinon.fake();
        scopeContextSpy = sinon.fake();
        scopeSpy = {
          setContext: scopeContextSpy,
        };
        sandbox.replace(Sentry, 'withScope', (fn: any) => fn(scopeSpy));
        sandbox.replace(Sentry, 'captureMessage', captureMessageSpy);
        StripeWebhookHandlerInstance.stripeHelper.allProducts.resolves([]);
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
        StripeWebhookHandlerInstance.stripeHelper.fetchAllPlans.resolves(
          allPlans
        );
        StripeWebhookHandlerInstance.stripeHelper.fetchPlansByProductId.resolves(
          [invalidPlan]
        );
        await StripeWebhookHandlerInstance.handleProductWebhookEvent(
          {},
          updatedEvent
        );

        sinon.assert.calledOnce(scopeContextSpy);
        sinon.assert.calledOnce(captureMessageSpy);

        sinon.assert.calledOnce(
          StripeWebhookHandlerInstance.stripeHelper.fetchAllPlans
        );
        sinon.assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper.fetchPlansByProductId,
          updatedEvent.data.object.id
        );
        sinon.assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper.updateAllProducts,
          [updatedEvent.data.object]
        );
        sinon.assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper.updateAllPlans,
          validPlanList
        );
      });

      it('does not throw a sentry error if the update event data is valid', async () => {
        const updatedEvent = deepCopy(eventProductUpdated);
        StripeWebhookHandlerInstance.stripeHelper.fetchAllPlans.resolves(
          validPlanList
        );
        StripeWebhookHandlerInstance.stripeHelper.fetchPlansByProductId.resolves(
          validPlanList
        );
        await StripeWebhookHandlerInstance.handleProductWebhookEvent(
          {},
          updatedEvent
        );

        expect(scopeContextSpy.notCalled).toBe(true);
      });

      it('updates the cached products and remove the plans on a product.deleted', async () => {
        const deletedEvent = {
          ...deepCopy(eventProductUpdated),
          type: 'product.deleted',
        };
        StripeWebhookHandlerInstance.stripeHelper.fetchAllPlans.resolves(
          validPlanList
        );
        StripeWebhookHandlerInstance.stripeHelper.fetchPlansByProductId.resolves(
          validPlanList
        );
        await StripeWebhookHandlerInstance.handleProductWebhookEvent(
          {},
          deletedEvent
        );
        sinon.assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper.updateAllProducts,
          [deletedEvent.data.object]
        );
        sinon.assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper.updateAllPlans,
          []
        );
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
        StripeWebhookHandlerInstance.stripeHelper.fetchAllPlans.resolves(
          allPlans
        );
        StripeWebhookHandlerInstance.stripeHelper.fetchPlansByProductId.resolves(
          allPlans
        );
        StripeWebhookHandlerInstance.stripeHelper.fetchPlansByProductId.resolves(
          allPlans
        );
        await StripeWebhookHandlerInstance.handleProductWebhookEvent(
          {},
          updatedEvent
        );
        sinon.assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper.updateAllPlans,
          allPlans
        );
      });

      it('updates the cached plans to include any valid plans missing from the cache', async () => {
        const updatedEvent = deepCopy(eventProductUpdated);
        StripeWebhookHandlerInstance.stripeHelper.updateAllPlans.resolves();
        StripeWebhookHandlerInstance.stripeHelper.fetchAllPlans.resolves(
          validPlanList
        );
        StripeWebhookHandlerInstance.stripeHelper.fetchPlansByProductId.resolves(
          []
        );
        await StripeWebhookHandlerInstance.handleProductWebhookEvent(
          {},
          updatedEvent
        );

        expect(scopeContextSpy.notCalled).toBe(true);

        sinon.assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper.updateAllPlans,
          validPlanList
        );
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
        captureMessageSpy = sinon.fake();
        scopeContextSpy = sinon.fake();
        scopeExtraSpy = sinon.fake();
        scopeSpy = {
          setContext: scopeContextSpy,
          setExtra: scopeExtraSpy,
        };
        sandbox.replace(Sentry, 'withScope', (fn: any) => fn(scopeSpy));
        sandbox.replace(Sentry, 'captureMessage', captureMessageSpy);
        StripeWebhookHandlerInstance.stripeHelper.allPlans.resolves([plan]);
      });

      it('throws a sentry error if the update event data is invalid', async () => {
        const updatedEvent = deepCopy(eventPlanUpdated);
        updatedEvent.data.object.metadata = {
          'product:termsOfServiceDownloadURL':
            'https://FAIL.net/legal/mozilla_vpn_tos',
        };
        StripeWebhookHandlerInstance.stripeHelper.fetchProductById.resolves({
          ...validProduct.data.object,
        });

        await StripeWebhookHandlerInstance.handlePlanCreatedOrUpdatedEvent(
          {},
          updatedEvent
        );

        expect(scopeContextSpy.called).toBe(true);
        expect(captureMessageSpy.called).toBe(true);
        sinon.assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper.fetchProductById,
          validProduct.data.object.id
        );
        sinon.assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper.updateAllPlans,
          []
        );
      });

      it('does not throw a sentry error if the update event data is valid', async () => {
        const updatedEvent = deepCopy(eventPlanUpdated);
        StripeWebhookHandlerInstance.stripeHelper.fetchProductById.resolves(
          validProduct.data.object
        );
        await StripeWebhookHandlerInstance.handlePlanCreatedOrUpdatedEvent(
          {},
          updatedEvent
        );

        expect(scopeContextSpy.notCalled).toBe(true);
        expect(captureMessageSpy.notCalled).toBe(true);
        sinon.assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper.updateAllPlans,
          [plan]
        );
      });

      it('logs and throws sentry error if product is not found', async () => {
        const productId = 'nonExistantProduct';
        const updatedEvent = deepCopy(eventPlanUpdated);
        updatedEvent.data.object.product = productId;
        StripeWebhookHandlerInstance.stripeHelper.fetchProductById.returns(
          undefined
        );
        await StripeWebhookHandlerInstance.handlePlanCreatedOrUpdatedEvent(
          {},
          updatedEvent
        );

        sinon.assert.calledOnce(StripeWebhookHandlerInstance.log.error);
        expect(scopeContextSpy.called).toBe(true);
        expect(captureMessageSpy.called).toBe(true);
        sinon.assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper.fetchProductById,
          productId
        );
        sinon.assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper.updateAllPlans,
          []
        );
      });
    });

    describe('handlePlanDeletedEvent', () => {
      it('deletes the plan from the cache', async () => {
        StripeWebhookHandlerInstance.stripeHelper.allPlans.resolves([
          validPlan.data.object,
        ]);
        const planDeletedEvent = { ...eventPlanUpdated, type: 'plan.deleted' };
        await StripeWebhookHandlerInstance.handlePlanDeletedEvent(
          {},
          planDeletedEvent
        );
        sinon.assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper.updateAllPlans,
          []
        );
      });
    });

    describe('handleTaxRateCreatedOrUpdatedEvent', () => {
      const taxRate = deepCopy(eventTaxRateCreated.data.object);

      beforeEach(() => {
        StripeWebhookHandlerInstance.stripeHelper.allTaxRates.resolves([
          taxRate,
        ]);
        StripeWebhookHandlerInstance.stripeHelper.updateAllTaxRates.resolves();
      });

      it('adds a new tax rate on tax_rate.created', async () => {
        const createdEvent = deepCopy(eventTaxRateCreated);
        StripeWebhookHandlerInstance.stripeHelper.allTaxRates.resolves([]);
        await StripeWebhookHandlerInstance.handleTaxRateCreatedOrUpdatedEvent(
          {},
          createdEvent
        );

        sinon.assert.calledOnce(
          StripeWebhookHandlerInstance.stripeHelper.allTaxRates
        );
        sinon.assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper.updateAllTaxRates,
          [taxRate]
        );
      });

      it('updates an existing tax rate on tax_rate.updated', async () => {
        const updatedEvent = deepCopy(eventTaxRateUpdated);
        const updatedTaxRate = updatedEvent.data.object;

        await StripeWebhookHandlerInstance.handleTaxRateCreatedOrUpdatedEvent(
          {},
          updatedEvent
        );

        sinon.assert.calledOnce(
          StripeWebhookHandlerInstance.stripeHelper.allTaxRates
        );
        sinon.assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper.updateAllTaxRates,
          [updatedTaxRate]
        );
      });
    });

    describe('handleSubscriptionUpdatedEvent', () => {
      let sendSubscriptionUpdatedEmailStub: any;

      beforeEach(() => {
        sendSubscriptionUpdatedEmailStub = sandbox
          .stub(StripeWebhookHandlerInstance, 'sendSubscriptionUpdatedEmail')
          .resolves({ uid: UID, email: TEST_EMAIL });
      });

      afterEach(() => {
        StripeWebhookHandlerInstance.sendSubscriptionUpdatedEmail.restore();
      });

      it('emits a notification when transitioning from "incomplete" to "active/trialing"', async () => {
        const updatedEvent = deepCopy(subscriptionUpdatedFromIncomplete);
        await StripeWebhookHandlerInstance.handleSubscriptionUpdatedEvent(
          {},
          updatedEvent
        );
        sinon.assert.calledWithExactly(mockCapabilityService.stripeUpdate, {
          sub: updatedEvent.data.object,
          uid: UID,
        });
        sinon.assert.calledWith(sendSubscriptionUpdatedEmailStub, updatedEvent);
      });

      it('emits a notification for any subscription state change', async () => {
        const updatedEvent = deepCopy(subscriptionUpdated);
        await StripeWebhookHandlerInstance.handleSubscriptionUpdatedEvent(
          {},
          updatedEvent
        );
        sinon.assert.calledWithExactly(mockCapabilityService.stripeUpdate, {
          sub: updatedEvent.data.object,
          uid: UID,
        });
        sinon.assert.calledWith(sendSubscriptionUpdatedEmailStub, updatedEvent);
      });

      it('reports a sentry error with an eventId if sendSubscriptionUpdatedEmail fails', async () => {
        const updatedEvent = deepCopy(subscriptionUpdated);
        const fakeAppError = { output: { payload: {} } };
        const fakeAppErrorWithEventId = {
          output: {
            payload: {
              eventId: updatedEvent.id,
            },
          },
        };
        const sentryMod = require('../../sentry');
        sandbox.stub(sentryMod, 'reportSentryError').returns({});
        sendSubscriptionUpdatedEmailStub.rejects(fakeAppError);
        await StripeWebhookHandlerInstance.handleSubscriptionUpdatedEvent(
          {},
          updatedEvent
        );
        sinon.assert.calledWith(sendSubscriptionUpdatedEmailStub, updatedEvent);
        sinon.assert.calledWith(
          sentryMod.reportSentryError,
          fakeAppErrorWithEventId
        );
      });

      it('ignores errors from email sending if the customer was deleted', async () => {
        const updatedEvent = deepCopy(subscriptionUpdated);
        const fakeAppError = {
          output: { payload: {} },
          errno: error.ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER,
        };
        const sentryMod = require('../../sentry');
        sandbox.stub(sentryMod, 'reportSentryError').returns({});
        sendSubscriptionUpdatedEmailStub.rejects(fakeAppError);
        await StripeWebhookHandlerInstance.handleSubscriptionUpdatedEvent(
          {},
          updatedEvent
        );
        sinon.assert.calledWith(sendSubscriptionUpdatedEmailStub, updatedEvent);
        sinon.assert.notCalled(sentryMod.reportSentryError);
      });
    });

    describe('handleSubscriptionDeletedEvent', () => {
      it('sends email and emits a notification when a subscription is deleted', async () => {
        StripeWebhookHandlerInstance.stripeHelper.expandResource.resolves(
          customerFixture
        );
        const deletedEvent = deepCopy(subscriptionDeleted);
        const sendSubscriptionDeletedEmailStub = sandbox
          .stub(StripeWebhookHandlerInstance, 'sendSubscriptionDeletedEmail')
          .resolves({ uid: UID, email: TEST_EMAIL });
        const account = { email: customerFixture.email };
        sandbox.stub(authDbModule.Account, 'findByUid').resolves(account);
        await StripeWebhookHandlerInstance.handleSubscriptionDeletedEvent(
          {},
          deletedEvent
        );
        sinon.assert.calledWith(mockCapabilityService.stripeUpdate, {
          sub: deletedEvent.data.object,
          uid: customerFixture.metadata.userid,
        });
        sinon.assert.calledWith(
          sendSubscriptionDeletedEmailStub,
          deletedEvent.data.object
        );
        sinon.assert.notCalled(authDbModule.getUidAndEmailByStripeCustomerId);
        sinon.assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper.expandResource,
          deletedEvent.data.object.customer,
          CUSTOMER_RESOURCE
        );
        sinon.assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.paypalHelper
            .conditionallyRemoveBillingAgreement,
          customerFixture
        );
      });

      it('sends subscriptionReplaced email if metadata includes redundantCancellation', async () => {
        const mockCustomer = deepCopy(customerFixture);
        StripeWebhookHandlerInstance.stripeHelper.expandResource.resolves(
          mockCustomer
        );
        const deletedEvent = deepCopy(subscriptionReplaced);
        const account = {
          email: customerFixture.email,
          emails: customerFixture.email,
          locale: 'en',
        };
        sandbox.stub(authDbModule.Account, 'findByUid').resolves(account);
        const mockInvoice = deepCopy(invoiceFixture);
        StripeWebhookHandlerInstance.stripeHelper.extractSubscriptionDeletedEventDetailsForEmail.resolves(
          mockInvoice
        );
        StripeWebhookHandlerInstance.mailer.sendSubscriptionReplacedEmail =
          sandbox.stub();
        await StripeWebhookHandlerInstance.handleSubscriptionDeletedEvent(
          {},
          deletedEvent
        );
        sinon.assert.calledWith(mockCapabilityService.stripeUpdate, {
          sub: deletedEvent.data.object,
          uid: customerFixture.metadata.userid,
        });
        sinon.assert.notCalled(authDbModule.getUidAndEmailByStripeCustomerId);
        sinon.assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.paypalHelper
            .conditionallyRemoveBillingAgreement,
          customerFixture
        );
        sinon.assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper
            .extractSubscriptionDeletedEventDetailsForEmail,
          deletedEvent.data.object
        );
        sinon.assert.calledWith(
          StripeWebhookHandlerInstance.mailer.sendSubscriptionReplacedEmail,
          account.emails,
          account,
          {
            acceptLanguage: account.locale,
            ...mockInvoice,
          }
        );
      });

      it('does not conditionally delete without customer record', async () => {
        const deletedEvent = deepCopy(subscriptionDeleted);
        StripeWebhookHandlerInstance.stripeHelper.expandResource.resolves();
        const sendSubscriptionDeletedEmailStub = sandbox
          .stub(StripeWebhookHandlerInstance, 'sendSubscriptionDeletedEmail')
          .resolves({ uid: UID, email: TEST_EMAIL });
        await StripeWebhookHandlerInstance.handleSubscriptionDeletedEvent(
          {},
          deletedEvent
        );
        sinon.assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper.expandResource,
          deletedEvent.data.object.customer,
          CUSTOMER_RESOURCE
        );
        sinon.assert.notCalled(sendSubscriptionDeletedEmailStub);
        sinon.assert.notCalled(
          StripeWebhookHandlerInstance.paypalHelper
            .conditionallyRemoveBillingAgreement
        );
      });

      it('does not send an email to an unverified PayPal user', async () => {
        const deletedEvent = deepCopy(subscriptionDeleted);
        deletedEvent.data.object.collection_method = 'send_invoice';
        StripeWebhookHandlerInstance.stripeHelper.expandResource.resolves(
          customerFixture
        );
        StripeWebhookHandlerInstance.db.account = sandbox.stub().resolves({
          email: customerFixture.email,
          verifierSetAt: 0,
        });
        const sendSubscriptionDeletedEmailStub = sandbox
          .stub(StripeWebhookHandlerInstance, 'sendSubscriptionDeletedEmail')
          .resolves({ uid: UID, email: TEST_EMAIL });
        await StripeWebhookHandlerInstance.handleSubscriptionDeletedEvent(
          {},
          deletedEvent
        );
        sinon.assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper.expandResource,
          deletedEvent.data.object.customer,
          CUSTOMER_RESOURCE
        );
        sinon.assert.notCalled(sendSubscriptionDeletedEmailStub);
      });

      it('does send an email when it cannot find the account because it was deleted', async () => {
        StripeWebhookHandlerInstance.stripeHelper.expandResource.resolves(
          customerFixture
        );
        const deletedEvent = deepCopy(subscriptionDeleted);
        const sendSubscriptionDeletedEmailStub = sandbox
          .stub(StripeWebhookHandlerInstance, 'sendSubscriptionDeletedEmail')
          .resolves({ uid: UID, email: TEST_EMAIL });
        sandbox.stub(authDbModule.Account, 'findByUid').resolves(null);
        await StripeWebhookHandlerInstance.handleSubscriptionDeletedEvent(
          {},
          deletedEvent
        );
        sinon.assert.calledWith(mockCapabilityService.stripeUpdate, {
          sub: deletedEvent.data.object,
          uid: customerFixture.metadata.userid,
        });
        sinon.assert.calledWith(
          sendSubscriptionDeletedEmailStub,
          deletedEvent.data.object
        );
        sinon.assert.notCalled(authDbModule.getUidAndEmailByStripeCustomerId);
        sinon.assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper.expandResource,
          deletedEvent.data.object.customer,
          CUSTOMER_RESOURCE
        );
        sinon.assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.paypalHelper
            .conditionallyRemoveBillingAgreement,
          customerFixture
        );
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
          emitMetricsEvent: sandbox
            .stub()
            .resolves(mockSubscriptionEndedEventDetails),
        };
        const subscriptionEndedEvent = deepCopy(subscriptionDeleted);

        StripeWebhookHandlerInstance.stripeHelper.expandResource.resolves(
          mockCustomerFixture
        );

        sandbox
          .stub(StripeWebhookHandlerInstance, 'sendSubscriptionDeletedEmail')
          .resolves({ uid: UID, email: TEST_EMAIL });

        sandbox.stub(authDbModule.Account, 'findByUid').resolves(account);

        const getSubscriptionEndedEventDetailsStub = sandbox
          .stub(
            StripeWebhookHandlerInstance,
            'getSubscriptionEndedEventDetails'
          )
          .resolves(mockSubscriptionEndedEventDetails);

        await StripeWebhookHandlerInstance.handleSubscriptionDeletedEvent(
          req,
          subscriptionEndedEvent
        );

        sinon.assert.calledOnceWithExactly(
          getSubscriptionEndedEventDetailsStub,
          mockSubscriptionEndedEventDetails.uid,
          mockSubscriptionEndedEventDetails.provider_event_id,
          mockCustomerFixture,
          subscriptionEnded
        );

        expect(
          req.emitMetricsEvent.calledOnceWithExactly(
            'subscription.ended',
            mockSubscriptionEndedEventDetails
          )
        ).toBe(true);
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
        sinon.assert.notCalled(
          StripeWebhookHandlerInstance.stripeHelper.expandResource
        );
      });

      it('stops if the invoice is not paypal payable', async () => {
        const invoiceCreatedEvent = deepCopy(eventInvoiceCreated);
        invoiceCreatedEvent.data.object.status = 'draft';
        StripeWebhookHandlerInstance.stripeHelper.invoicePayableWithPaypal.resolves(
          false
        );
        StripeWebhookHandlerInstance.stripeHelper.finalizeInvoice.resolves({});
        const result =
          await StripeWebhookHandlerInstance.handleInvoiceCreatedEvent(
            {},
            invoiceCreatedEvent
          );
        expect(result).toBeUndefined();
        sinon.assert.notCalled(
          StripeWebhookHandlerInstance.stripeHelper.expandResource
        );
        sinon.assert.notCalled(
          StripeWebhookHandlerInstance.stripeHelper.finalizeInvoice
        );
      });

      it('stops if the invoice is not in draft', async () => {
        const invoiceCreatedEvent = deepCopy(eventInvoiceCreated);
        StripeWebhookHandlerInstance.stripeHelper.invoicePayableWithPaypal.resolves(
          true
        );
        StripeWebhookHandlerInstance.stripeHelper.finalizeInvoice.resolves({});
        const result =
          await StripeWebhookHandlerInstance.handleInvoiceCreatedEvent(
            {},
            invoiceCreatedEvent
          );
        expect(result).toBeUndefined();
        sinon.assert.notCalled(
          StripeWebhookHandlerInstance.stripeHelper.expandResource
        );
        sinon.assert.notCalled(
          StripeWebhookHandlerInstance.stripeHelper.finalizeInvoice
        );
      });

      it('logs if the billing agreement was cancelled', async () => {
        const invoiceCreatedEvent = deepCopy(eventInvoiceCreated);
        invoiceCreatedEvent.data.object.status = 'draft';
        StripeWebhookHandlerInstance.stripeHelper.invoicePayableWithPaypal.resolves(
          true
        );
        StripeWebhookHandlerInstance.stripeHelper.finalizeInvoice.resolves({});
        StripeWebhookHandlerInstance.stripeHelper.getCustomerPaypalAgreement.returns(
          'test-ba'
        );
        StripeWebhookHandlerInstance.paypalHelper.updateStripeNameFromBA.rejects(
          {
            errno: 998,
          }
        );
        StripeWebhookHandlerInstance.log.error = sinon.fake.returns({});
        const result =
          await StripeWebhookHandlerInstance.handleInvoiceCreatedEvent(
            {},
            invoiceCreatedEvent
          );
        expect(result).toEqual({});
        sinon.assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.log.error,
          `handleInvoiceCreatedEvent - Billing agreement (id: test-ba) was cancelled.`,
          {
            request: {},
            customer: {},
          }
        );
        sinon.assert.calledWith(
          StripeWebhookHandlerInstance.stripeHelper.invoicePayableWithPaypal,
          invoiceCreatedEvent.data.object
        );
        sinon.assert.calledWith(
          StripeWebhookHandlerInstance.stripeHelper.finalizeInvoice,
          invoiceCreatedEvent.data.object
        );
        sinon.assert.calledWith(
          StripeWebhookHandlerInstance.paypalHelper.updateStripeNameFromBA,
          {},
          'test-ba'
        );
        sinon.assert.calledWith(
          StripeWebhookHandlerInstance.stripeHelper.getCustomerPaypalAgreement,
          {}
        );
      });

      it('finalizes invoices for invoice subscriptions', async () => {
        const invoiceCreatedEvent = deepCopy(eventInvoiceCreated);
        invoiceCreatedEvent.data.object.status = 'draft';
        StripeWebhookHandlerInstance.stripeHelper.invoicePayableWithPaypal.resolves(
          true
        );
        StripeWebhookHandlerInstance.stripeHelper.finalizeInvoice.resolves({});
        StripeWebhookHandlerInstance.stripeHelper.getCustomerPaypalAgreement.returns(
          'test-ba'
        );
        StripeWebhookHandlerInstance.paypalHelper.updateStripeNameFromBA.resolves(
          {}
        );
        const result =
          await StripeWebhookHandlerInstance.handleInvoiceCreatedEvent(
            {},
            invoiceCreatedEvent
          );
        expect(result).toEqual({});
        sinon.assert.calledWith(
          StripeWebhookHandlerInstance.stripeHelper.invoicePayableWithPaypal,
          invoiceCreatedEvent.data.object
        );
        sinon.assert.calledWith(
          StripeWebhookHandlerInstance.stripeHelper.finalizeInvoice,
          invoiceCreatedEvent.data.object
        );
        sinon.assert.calledWith(
          StripeWebhookHandlerInstance.paypalHelper.updateStripeNameFromBA,
          {},
          'test-ba'
        );
        sinon.assert.calledWith(
          StripeWebhookHandlerInstance.stripeHelper.getCustomerPaypalAgreement,
          {}
        );
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
        StripeWebhookHandlerInstance.stripeHelper.expandResource =
          sinon.fake.resolves({});
        const result = await StripeWebhookHandlerInstance.handleCreditNoteEvent(
          {},
          invoiceCreditNoteEvent
        );
        expect(result).toBeUndefined();
        sinon.assert.notCalled(
          StripeWebhookHandlerInstance.stripeHelper.expandResource
        );
      });

      it('doesnt run if its not manual invoice or out of band credit note', async () => {
        const sentryMod = require('../../sentry');
        sandbox.stub(sentryMod, 'reportSentryError').returns({});
        StripeWebhookHandlerInstance.paypalHelper = {};
        invoice.collection_method = 'charge_automatically';
        StripeWebhookHandlerInstance.stripeHelper.expandResource =
          sinon.fake.resolves(invoice);
        StripeWebhookHandlerInstance.stripeHelper.getInvoicePaypalTransactionId =
          sinon.fake.resolves({});
        const result = await StripeWebhookHandlerInstance.handleCreditNoteEvent(
          {},
          invoiceCreditNoteEvent
        );
        expect(result).toBeUndefined();
        sinon.assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper.expandResource,
          invoiceCreditNoteEvent.data.object.invoice,
          'invoices'
        );
        sinon.assert.notCalled(
          StripeWebhookHandlerInstance.stripeHelper
            .getInvoicePaypalTransactionId
        );
        sinon.assert.calledOnce(sentryMod.reportSentryError);
      });

      it('doesnt run or error report if its not manual invoice and not out of band', async () => {
        const sentryMod = require('../../sentry');
        sandbox.stub(sentryMod, 'reportSentryError').returns({});
        StripeWebhookHandlerInstance.paypalHelper = {};
        invoice.collection_method = 'charge_automatically';
        StripeWebhookHandlerInstance.stripeHelper.expandResource =
          sinon.fake.resolves(invoice);
        StripeWebhookHandlerInstance.stripeHelper.getInvoicePaypalTransactionId =
          sinon.fake.resolves({});
        invoiceCreditNoteEvent.data.object.out_of_band_amount = null;
        const result = await StripeWebhookHandlerInstance.handleCreditNoteEvent(
          {},
          invoiceCreditNoteEvent
        );
        expect(result).toBeUndefined();
        sinon.assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper.expandResource,
          invoiceCreditNoteEvent.data.object.invoice,
          'invoices'
        );
        sinon.assert.notCalled(
          StripeWebhookHandlerInstance.stripeHelper
            .getInvoicePaypalTransactionId
        );
        sinon.assert.notCalled(sentryMod.reportSentryError);
      });

      it('doesnt issue refund without a paypal transaction to refund', async () => {
        StripeWebhookHandlerInstance.paypalHelper = {};
        invoice.collection_method = 'send_invoice';
        invoiceCreditNoteEvent.data.object.out_of_band_amount = 500;
        StripeWebhookHandlerInstance.stripeHelper.expandResource =
          sinon.fake.resolves(invoice);
        StripeWebhookHandlerInstance.stripeHelper.getInvoicePaypalTransactionId =
          sinon.fake.returns(null);
        StripeWebhookHandlerInstance.log.error = sinon.fake.returns({});
        const result = await StripeWebhookHandlerInstance.handleCreditNoteEvent(
          {},
          invoiceCreditNoteEvent
        );
        expect(result).toBeUndefined();
        sinon.assert.calledWithMatch(
          StripeWebhookHandlerInstance.stripeHelper.expandResource,
          invoiceCreditNoteEvent.data.object.invoice,
          'invoices'
        );
        sinon.assert.callCount(
          StripeWebhookHandlerInstance.stripeHelper.expandResource,
          1
        );
        sinon.assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.log.error,
          'handleCreditNoteEvent',
          {
            invoiceId: invoice.id,
            message:
              'Credit note issued on invoice without a PayPal transaction id.',
          }
        );
        sinon.assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper
            .getInvoicePaypalTransactionId,
          invoice
        );
      });

      it('logs an error if the amount doesnt match the invoice amount', async () => {
        StripeWebhookHandlerInstance.paypalHelper = {
          issueRefund: sinon.fake.resolves(undefined),
        };
        invoice.collection_method = 'send_invoice';
        invoiceCreditNoteEvent.data.object.out_of_band_amount = 500;
        invoice.amount_due = 900;
        StripeWebhookHandlerInstance.stripeHelper.expandResource =
          sinon.fake.resolves(invoice);
        StripeWebhookHandlerInstance.stripeHelper.getInvoicePaypalTransactionId =
          sinon.fake.returns('tx-1234');
        StripeWebhookHandlerInstance.log.error = sinon.fake.returns({});
        const result = await StripeWebhookHandlerInstance.handleCreditNoteEvent(
          {},
          invoiceCreditNoteEvent
        );
        expect(result).toBeUndefined();
        sinon.assert.calledWithMatch(
          StripeWebhookHandlerInstance.stripeHelper.expandResource,
          invoiceCreditNoteEvent.data.object.invoice,
          'invoices'
        );
        sinon.assert.callCount(
          StripeWebhookHandlerInstance.stripeHelper.expandResource,
          1
        );
        sinon.assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.paypalHelper.issueRefund,
          invoice,
          'tx-1234',
          RefundType.Partial,
          500
        );
        sinon.assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper
            .getInvoicePaypalTransactionId,
          invoice
        );
      });

      it('issues refund when all checks are successful', async () => {
        StripeWebhookHandlerInstance.paypalHelper = {};
        invoice.collection_method = 'send_invoice';
        invoiceCreditNoteEvent.data.object.out_of_band_amount = 500;
        invoice.amount_due = 500;
        StripeWebhookHandlerInstance.stripeHelper.expandResource =
          sinon.fake.resolves(invoice);
        StripeWebhookHandlerInstance.stripeHelper.getInvoicePaypalTransactionId =
          sinon.fake.returns('tx-1234');
        StripeWebhookHandlerInstance.log.error = sinon.fake.returns({});
        StripeWebhookHandlerInstance.paypalHelper.issueRefund =
          sinon.fake.resolves({});
        const result = await StripeWebhookHandlerInstance.handleCreditNoteEvent(
          {},
          invoiceCreditNoteEvent
        );
        expect(result).toBeUndefined();
        sinon.assert.calledWithMatch(
          StripeWebhookHandlerInstance.stripeHelper.expandResource,
          invoiceCreditNoteEvent.data.object.invoice,
          'invoices'
        );
        sinon.assert.callCount(
          StripeWebhookHandlerInstance.stripeHelper.expandResource,
          1
        );
        sinon.assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper
            .getInvoicePaypalTransactionId,
          invoice
        );
        sinon.assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.paypalHelper.issueRefund,
          invoice,
          'tx-1234',
          RefundType.Full,
          undefined
        );
      });

      it('updates the invoice to report refused refund if paypal refuses to refund', async () => {
        const sentryMod = require('../../sentry');
        sandbox.stub(sentryMod, 'reportSentryError').returns({});
        StripeWebhookHandlerInstance.paypalHelper = {};
        invoice.collection_method = 'send_invoice';
        invoiceCreditNoteEvent.data.object.out_of_band_amount = 500;
        invoice.amount_due = 500;
        StripeWebhookHandlerInstance.stripeHelper.expandResource =
          sinon.fake.resolves(invoice);
        StripeWebhookHandlerInstance.stripeHelper.getInvoicePaypalTransactionId =
          sinon.fake.returns('tx-1234');
        StripeWebhookHandlerInstance.stripeHelper.updateInvoiceWithPaypalRefundReason =
          sinon.fake.resolves({});
        StripeWebhookHandlerInstance.log.error = sinon.fake.returns({});
        const refusedError = new RefusedError(
          'Transaction refused',
          'This transaction already has a chargeback filed',
          '10009'
        );
        StripeWebhookHandlerInstance.paypalHelper.issueRefund =
          sinon.fake.rejects(refusedError);
        const result = await StripeWebhookHandlerInstance.handleCreditNoteEvent(
          {},
          invoiceCreditNoteEvent
        );
        expect(result).toBeUndefined();
        sinon.assert.calledWithMatch(
          StripeWebhookHandlerInstance.stripeHelper.expandResource,
          invoiceCreditNoteEvent.data.object.invoice,
          'invoices'
        );
        sinon.assert.callCount(
          StripeWebhookHandlerInstance.stripeHelper.expandResource,
          1
        );
        sinon.assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper
            .getInvoicePaypalTransactionId,
          invoice
        );
        sinon.assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.paypalHelper.issueRefund,
          invoice,
          'tx-1234',
          RefundType.Full,
          undefined
        );
        sinon.assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper
            .updateInvoiceWithPaypalRefundReason,
          invoice,
          'This transaction already has a chargeback filed'
        );
        refusedError.output = { payload: { invoiceId: invoice.id } };
        sinon.assert.calledOnceWithExactly(sentryMod.reportSentryError, refusedError, {});
        sinon.assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.log.error,
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
        const sendSubscriptionInvoiceEmailStub = sandbox
          .stub(StripeWebhookHandlerInstance, 'sendSubscriptionInvoiceEmail')
          .resolves(true);
        const account = { email: customerFixture.email };
        sandbox.stub(authDbModule.Account, 'findByUid').resolves(account);
        StripeWebhookHandlerInstance.stripeHelper.expandResource.resolves(
          customer
        );
        await StripeWebhookHandlerInstance.handleInvoicePaidEvent(
          {},
          paidEvent
        );
        sinon.assert.calledWith(
          sendSubscriptionInvoiceEmailStub,
          paidEvent.data.object
        );
      });

      it('reports a sentry error for a deleted customer', async () => {
        const paidEvent = deepCopy(eventInvoicePaid);
        const customer = deepCopy(customerFixture);
        customer.deleted = true;
        const sentryMod = require('../../sentry');
        sandbox.stub(sentryMod, 'reportSentryError').returns({});
        const sendSubscriptionInvoiceEmailStub = sandbox
          .stub(StripeWebhookHandlerInstance, 'sendSubscriptionInvoiceEmail')
          .resolves(true);
        StripeWebhookHandlerInstance.stripeHelper.expandResource.resolves(
          customer
        );
        await StripeWebhookHandlerInstance.handleInvoicePaidEvent(
          {},
          paidEvent
        );
        sinon.assert.notCalled(sendSubscriptionInvoiceEmailStub);
        sinon.assert.calledOnce(sentryMod.reportSentryError);
        const thrownErr = sentryMod.reportSentryError.getCalls()[0].args[0];
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
        sandbox.stub(sentryMod, 'reportSentryError').returns({});
        const sendSubscriptionInvoiceEmailStub = sandbox
          .stub(StripeWebhookHandlerInstance, 'sendSubscriptionInvoiceEmail')
          .resolves(true);
        StripeWebhookHandlerInstance.stripeHelper.expandResource.resolves(
          customer
        );
        await StripeWebhookHandlerInstance.handleInvoicePaidEvent(
          {},
          paidEvent
        );
        sinon.assert.notCalled(sendSubscriptionInvoiceEmailStub);
        sinon.assert.calledOnce(sentryMod.reportSentryError);
        const thrownErr = sentryMod.reportSentryError.getCalls()[0].args[0];
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
        sandbox.stub(sentryMod, 'reportSentryError').returns({});
        const sendSubscriptionInvoiceEmailStub = sandbox
          .stub(StripeWebhookHandlerInstance, 'sendSubscriptionInvoiceEmail')
          .resolves(true);
        StripeWebhookHandlerInstance.stripeHelper.expandResource.resolves(
          customer
        );
        sandbox.stub(authDbModule.Account, 'findByUid').resolves(null);
        await StripeWebhookHandlerInstance.handleInvoicePaidEvent(
          {},
          paidEvent
        );
        sinon.assert.notCalled(sendSubscriptionInvoiceEmailStub);
        sinon.assert.calledOnce(sentryMod.reportSentryError);
        const thrownErr = sentryMod.reportSentryError.getCalls()[0].args[0];
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
        sendSubscriptionPaymentFailedEmailStub = sandbox
          .stub(
            StripeWebhookHandlerInstance,
            'sendSubscriptionPaymentFailedEmail'
          )
          .resolves(true);
        StripeWebhookHandlerInstance.stripeHelper.expandResource.resolves(
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
        sinon.assert.calledWith(
          sendSubscriptionPaymentFailedEmailStub,
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
        sinon.assert.notCalled(sendSubscriptionPaymentFailedEmailStub);
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
        sendSubscriptionPaymentExpiredEmailStub = sandbox
          .stub(
            StripeWebhookHandlerInstance,
            'sendSubscriptionPaymentExpiredEmail'
          )
          .resolves(true);
        StripeWebhookHandlerInstance.stripeHelper.expandResource
          .onCall(0)
          .resolves(mockCustomer);
        StripeWebhookHandlerInstance.stripeHelper.expandResource
          .onCall(1)
          .resolves(mockPaymentMethod);
      });

      it('does nothing, when customer is deleted', async () => {
        StripeWebhookHandlerInstance.stripeHelper.expandResource
          .onCall(0)
          .resolves({ ...mockCustomer, deleted: true });
        await StripeWebhookHandlerInstance.handleInvoiceUpcomingEvent(
          {},
          eventInvoiceUpcoming
        );
        sinon.assert.callCount(
          StripeWebhookHandlerInstance.stripeHelper.expandResource,
          1
        );
        sinon.assert.notCalled(sendSubscriptionPaymentExpiredEmailStub);
      });

      it('does nothing, invoice settings doesnt exist because payment method is Paypal', async () => {
        StripeWebhookHandlerInstance.stripeHelper.expandResource
          .onCall(0)
          .resolves({ ...mockCustomer, invoice_settings: null });
        await StripeWebhookHandlerInstance.handleInvoiceUpcomingEvent(
          {},
          eventInvoiceUpcoming
        );
        sinon.assert.callCount(
          StripeWebhookHandlerInstance.stripeHelper.expandResource,
          1
        );
        sinon.assert.notCalled(sendSubscriptionPaymentExpiredEmailStub);
      });

      it('reports Sentry Error and return, when payment method doesnt have a card', async () => {
        const sentryMod = require('../../sentry');
        sandbox.stub(sentryMod, 'reportSentryError').returns({});
        await StripeWebhookHandlerInstance.handleInvoiceUpcomingEvent(
          {},
          eventInvoiceUpcoming
        );
        sinon.assert.callCount(
          StripeWebhookHandlerInstance.stripeHelper.expandResource,
          2
        );
        sinon.assert.notCalled(
          StripeWebhookHandlerInstance.stripeHelper.formatSubscriptionsForEmails
        );
        sinon.assert.notCalled(sendSubscriptionPaymentExpiredEmailStub);
        sinon.assert.calledOnce(sentryMod.reportSentryError);
      });

      it('does nothing, when credit card is expiring in the future', async () => {
        StripeWebhookHandlerInstance.stripeHelper.expandResource
          .onCall(1)
          .resolves({
            card: {
              exp_month: new Date().getMonth() + 1,
              exp_year: new Date().getFullYear() + 1,
            },
          });
        await StripeWebhookHandlerInstance.handleInvoiceUpcomingEvent(
          {},
          eventInvoiceUpcoming
        );
        sinon.assert.callCount(
          StripeWebhookHandlerInstance.stripeHelper.expandResource,
          2
        );
        sinon.assert.notCalled(
          StripeWebhookHandlerInstance.stripeHelper.formatSubscriptionsForEmails
        );
        sinon.assert.notCalled(sendSubscriptionPaymentExpiredEmailStub);
      });

      it('reports Sentry Error and return, when customer doesnt have active subscriptions', async () => {
        const sentryMod = require('../../sentry');
        sandbox.stub(sentryMod, 'reportSentryError').returns({});
        StripeWebhookHandlerInstance.stripeHelper.formatSubscriptionsForEmails.resolves(
          []
        );
        StripeWebhookHandlerInstance.stripeHelper.expandResource
          .onCall(1)
          .resolves({
            card: {
              exp_month: new Date().getMonth() + 1,
              exp_year: new Date().getFullYear(),
            },
          });
        await StripeWebhookHandlerInstance.handleInvoiceUpcomingEvent(
          {},
          eventInvoiceUpcoming
        );
        sinon.assert.callCount(
          StripeWebhookHandlerInstance.stripeHelper.expandResource,
          2
        );
        sinon.assert.called(
          StripeWebhookHandlerInstance.stripeHelper.formatSubscriptionsForEmails
        );
        sinon.assert.notCalled(sendSubscriptionPaymentExpiredEmailStub);
        sinon.assert.calledOnce(sentryMod.reportSentryError);
      });

      it('sends an email when default payment credit card expires the current month', async () => {
        StripeWebhookHandlerInstance.stripeHelper.expandResource
          .onCall(1)
          .resolves({
            card: {
              exp_month: new Date().getMonth() + 1,
              exp_year: new Date().getFullYear(),
            },
          });
        StripeWebhookHandlerInstance.stripeHelper.formatSubscriptionsForEmails.resolves(
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
        sinon.assert.callCount(
          StripeWebhookHandlerInstance.stripeHelper.expandResource,
          2
        );
        sinon.assert.called(
          StripeWebhookHandlerInstance.stripeHelper.formatSubscriptionsForEmails
        );
        sinon.assert.called(sendSubscriptionPaymentExpiredEmailStub);
      });

      it('sends an email when default payment credit card expires before the current month', async () => {
        StripeWebhookHandlerInstance.stripeHelper.expandResource
          .onCall(1)
          .resolves({
            card: {
              exp_month: new Date().getMonth() + 1,
              exp_year: new Date().getFullYear() - 1,
            },
          });
        StripeWebhookHandlerInstance.stripeHelper.formatSubscriptionsForEmails.resolves(
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
        sinon.assert.callCount(
          StripeWebhookHandlerInstance.stripeHelper.expandResource,
          2
        );
        sinon.assert.called(
          StripeWebhookHandlerInstance.stripeHelper.formatSubscriptionsForEmails
        );
        sinon.assert.called(sendSubscriptionPaymentExpiredEmailStub);
      });
    });

    describe('handleSubscriptionCreatedEvent', () => {
      it('emits a notification when a new subscription is "active" or "trialing"', async () => {
        const createdEvent = deepCopy(subscriptionCreated);
        await StripeWebhookHandlerInstance.handleSubscriptionCreatedEvent(
          {},
          createdEvent
        );
        sinon.assert.calledWith(mockCapabilityService.stripeUpdate, {
          sub: createdEvent.data.object,
        });
      });

      it('does not emit a notification for incomplete new subscriptions', async () => {
        const createdEvent = deepCopy(subscriptionCreatedIncomplete);
        await StripeWebhookHandlerInstance.handleSubscriptionCreatedEvent(
          {},
          createdEvent
        );
        sinon.assert.notCalled(authDbModule.getUidAndEmailByStripeCustomerId);
        sinon.assert.notCalled(mockCapabilityService.stripeUpdate);
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
      StripeWebhookHandlerInstance.db.account = sandbox
        .stub()
        .resolves(mockAccount);
      StripeWebhookHandlerInstance.mailer.sendSubscriptionPaymentExpiredEmail =
        sandbox.stub();

      await StripeWebhookHandlerInstance.sendSubscriptionPaymentExpiredEmail(
        mockSourceDetails
      );

      sinon.assert.calledOnceWithExactly(
        StripeWebhookHandlerInstance.db.account,
        UID
      );
      sinon.assert.calledOnceWithExactly(
        StripeWebhookHandlerInstance.mailer.sendSubscriptionPaymentExpiredEmail,
        [TEST_EMAIL],
        mockAccount,
        {
          acceptLanguage: ACCOUNT_LOCALE,
          ...mockSourceDetails,
        }
      );
    });

    it('send email using email on account', async () => {
      const mockSourceDetailsNullEmail = {
        ...mockSourceDetails,
        email: null,
      };
      StripeWebhookHandlerInstance.db.account = sandbox
        .stub()
        .resolves(mockAccount);
      StripeWebhookHandlerInstance.mailer.sendSubscriptionPaymentExpiredEmail =
        sandbox.stub();

      await StripeWebhookHandlerInstance.sendSubscriptionPaymentExpiredEmail(
        mockSourceDetailsNullEmail
      );

      sinon.assert.calledOnceWithExactly(
        StripeWebhookHandlerInstance.db.account,
        UID
      );
      sinon.assert.calledOnceWithExactly(
        StripeWebhookHandlerInstance.mailer.sendSubscriptionPaymentExpiredEmail,
        [TEST_EMAIL],
        mockAccount,
        {
          acceptLanguage: ACCOUNT_LOCALE,
          ...mockSourceDetails,
        }
      );
    });
  });

  describe('sendSubscriptionPaymentFailedEmail', () => {
    it('sends the payment failed email', async () => {
      const invoice = deepCopy(eventInvoicePaymentFailed.data.object);

      const mockInvoiceDetails = { uid: '1234', test: 'fake' };
      StripeWebhookHandlerInstance.stripeHelper.extractInvoiceDetailsForEmail.resolves(
        mockInvoiceDetails
      );

      const mockAccount = { emails: 'fakeemails', locale: 'fakelocale' };
      StripeWebhookHandlerInstance.db.account = sinon.spy(
        async () => mockAccount
      );

      await StripeWebhookHandlerInstance.sendSubscriptionPaymentFailedEmail(
        invoice
      );
      sinon.assert.calledWith(
        StripeWebhookHandlerInstance.mailer.sendSubscriptionPaymentFailedEmail,
        mockAccount.emails,
        mockAccount,
        {
          acceptLanguage: mockAccount.locale,
          ...mockInvoiceDetails,
          email: (mockAccount as any).primaryEmail,
        }
      );
    });
  });

  describe('sendSubscriptionInvoiceEmail', () => {
    const commonSendSubscriptionInvoiceEmailTest =
      (expectedMethodName: string, billingReason: string, verifierSetAt = Date.now()) =>
      async () => {
        const invoice = eventInvoicePaid.data.object;

        invoice.billing_reason = billingReason;

        const mockInvoiceDetails = { uid: '1234', test: 'fake' };
        StripeWebhookHandlerInstance.stripeHelper.extractInvoiceDetailsForEmail.resolves(
          mockInvoiceDetails
        );

        const mockAccount: any = {
          emails: 'fakeemails',
          locale: 'fakelocale',
          verifierSetAt,
        };
        StripeWebhookHandlerInstance.db.account = sinon.spy(
          async () => mockAccount
        );

        await StripeWebhookHandlerInstance.sendSubscriptionInvoiceEmail(
          invoice
        );
        sinon.assert.calledWith(
          StripeWebhookHandlerInstance.mailer[expectedMethodName],
          mockAccount.emails,
          mockAccount,
          {
            acceptLanguage: mockAccount.locale,
            ...mockInvoiceDetails,
            email: mockAccount.primaryEmail,
          }
        );
        if (expectedMethodName === 'sendSubscriptionFirstInvoiceEmail') {
          if (verifierSetAt) {
            sinon.assert.calledWith(
              StripeWebhookHandlerInstance.mailer.sendDownloadSubscriptionEmail,
              mockAccount.emails,
              mockAccount,
              {
                acceptLanguage: mockAccount.locale,
                ...mockInvoiceDetails,
                email: mockAccount.primaryEmail,
              }
            );
          } else {
            expect(
              StripeWebhookHandlerInstance.mailer.sendDownloadSubscriptionEmail
                .notCalled
            ).toBe(true);
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
      'sends the initial invoice email for a newly created subscription with passwordless account',
      commonSendSubscriptionInvoiceEmailTest(
        'sendSubscriptionFirstInvoiceEmail',
        'subscription_create',
        0
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
      StripeWebhookHandlerInstance.stripeHelper.extractInvoiceDetailsForEmail.resolves(
        mockInvoiceDetails
      );

      const mockAccount = {
        emails: 'fakeemails',
        locale: 'fakelocale',
        verifierSetAt: Date.now(),
      };
      StripeWebhookHandlerInstance.db.account = sinon.spy(
        async () => mockAccount
      );

      await StripeWebhookHandlerInstance.sendSubscriptionInvoiceEmail(invoice);

      expect(
        StripeWebhookHandlerInstance.mailer.sendSubscriptionFirstInvoiceEmail
          .notCalled
      ).toBe(true);
      expect(
        StripeWebhookHandlerInstance.mailer
          .sendSubscriptionSubsequentInvoiceEmail.notCalled
      ).toBe(true);
      expect(
        StripeWebhookHandlerInstance.mailer.sendDownloadSubscriptionEmail
          .notCalled
      ).toBe(true);
    });
  });

  describe('sendSubscriptionUpdatedEmail', () => {
    const commonSendSubscriptionUpdatedEmailTest = (updateType: any) => async () => {
      const event = deepCopy(eventCustomerSubscriptionUpdated);

      const mockDetails = {
        uid: '1234',
        test: 'fake',
        updateType,
      };
      StripeWebhookHandlerInstance.stripeHelper.extractSubscriptionUpdateEventDetailsForEmail.resolves(
        mockDetails
      );

      const mockAccount = { emails: 'fakeemails', locale: 'fakelocale' };
      StripeWebhookHandlerInstance.db.account = sinon.spy(
        async () => mockAccount
      );

      await StripeWebhookHandlerInstance.sendSubscriptionUpdatedEmail(event);

      const expectedMethodName = ({
        [SUBSCRIPTION_UPDATE_TYPES.UPGRADE]: 'sendSubscriptionUpgradeEmail',
        [SUBSCRIPTION_UPDATE_TYPES.DOWNGRADE]: 'sendSubscriptionDowngradeEmail',
        [SUBSCRIPTION_UPDATE_TYPES.REACTIVATION]:
          'sendSubscriptionReactivationEmail',
        [SUBSCRIPTION_UPDATE_TYPES.CANCELLATION]:
          'sendSubscriptionCancellationEmail',
      } as any)[updateType];

      sinon.assert.calledWith(
        StripeWebhookHandlerInstance.mailer[expectedMethodName],
        mockAccount.emails,
        mockAccount,
        {
          acceptLanguage: mockAccount.locale,
          ...mockDetails,
        }
      );
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
        StripeWebhookHandlerInstance.stripeHelper.checkSubscriptionPastDue.returns(
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
        StripeWebhookHandlerInstance.stripeHelper.extractInvoiceDetailsForEmail.resolves(
          mockInvoiceDetails
        );
        StripeWebhookHandlerInstance.stripeHelper.expandResource.resolves({
          id: 'in_1GB4aHKb9q6OnNsLC9pbVY5a',
        });

        const mockAccount = { emails: 'fakeemails', locale: 'fakelocale' };
        StripeWebhookHandlerInstance.db.account = sinon.spy(async (data: any) => {
          if (options.accountFound) {
            return mockAccount;
          }
          throw error.unknownAccount();
        });

        await StripeWebhookHandlerInstance.sendSubscriptionDeletedEmail(
          subscription
        );

        if (shouldSendSubscriptionFailedPaymentsCancellationEmail()) {
          sinon.assert.calledWith(
            StripeWebhookHandlerInstance.stripeHelper
              .extractInvoiceDetailsForEmail,
            { id: subscription.latest_invoice }
          );
          sinon.assert.calledWith(
            StripeWebhookHandlerInstance.mailer
              .sendSubscriptionFailedPaymentsCancellationEmail,
            mockAccount.emails,
            mockAccount,
            {
              acceptLanguage: mockAccount.locale,
              ...mockInvoiceDetails,
              email: (mockAccount as any).primaryEmail,
            }
          );
        } else {
          sinon.assert.notCalled(
            StripeWebhookHandlerInstance.mailer
              .sendSubscriptionFailedPaymentsCancellationEmail
          );
        }

        if (shouldSendAccountDeletedEmail()) {
          const fakeAccount = {
            email: mockInvoiceDetails.email,
            uid: mockInvoiceDetails.uid,
            emails: [{ email: mockInvoiceDetails.email, isPrimary: true }],
          };
          sinon.assert.calledWith(
            StripeWebhookHandlerInstance.mailer
              .sendSubscriptionAccountDeletionEmail,
            fakeAccount.emails,
            fakeAccount,
            mockInvoiceDetails
          );
        } else {
          sinon.assert.notCalled(
            StripeWebhookHandlerInstance.mailer
              .sendSubscriptionAccountDeletionEmail
          );
        }

        if (shouldSendCancellationEmail()) {
          sinon.assert.calledWith(
            StripeWebhookHandlerInstance.mailer
              .sendSubscriptionCancellationEmail,
            mockAccount.emails,
            mockAccount,
            {
              acceptLanguage: mockAccount.locale,
              ...mockInvoiceDetails,
              showOutstandingBalance: options.hasOutstandingBalance,
              cancelAtEnd: subscription.cancel_at_period_end,
              isFreeTrialCancellation: false,
              email: (mockAccount as any).primaryEmail,
            }
          );
        } else {
          sinon.assert.notCalled(
            StripeWebhookHandlerInstance.mailer
              .sendSubscriptionCancellationEmail
          );
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
      StripeWebhookHandlerInstance.stripeHelper.expandResource.resolves(
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
