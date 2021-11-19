/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };
const uuid = require('uuid');
const mocks = require('../../../mocks');
const error = require('../../../../lib/error');
const Sentry = require('@sentry/node');
const {
  StripeHelper,
  SUBSCRIPTION_UPDATE_TYPES,
} = require('../../../../lib/payments/stripe');
const moment = require('moment');
const authDbModule = require('fxa-shared/db/models/auth');

const {
  StripeWebhookHandler,
} = require('../../../../lib/routes/subscriptions/stripe-webhook');

const customerFixture = require('../../payments/fixtures/stripe/customer1.json');
const subscriptionCreated = require('../../payments/fixtures/stripe/subscription_created.json');
const subscriptionCreatedIncomplete = require('../../payments/fixtures/stripe/subscription_created_incomplete.json');
const subscriptionDeleted = require('../../payments/fixtures/stripe/subscription_deleted.json');
const subscriptionUpdated = require('../../payments/fixtures/stripe/subscription_updated.json');
const subscriptionUpdatedFromIncomplete = require('../../payments/fixtures/stripe/subscription_updated_from_incomplete.json');
const eventInvoiceCreated = require('../../payments/fixtures/stripe/event_invoice_created.json');
const eventInvoicePaid = require('../../payments/fixtures/stripe/event_invoice_paid.json');
const eventInvoicePaymentFailed = require('../../payments/fixtures/stripe/event_invoice_payment_failed.json');
const eventCustomerUpdated = require('../../payments/fixtures/stripe/event_customer_updated.json');
const eventCustomerSubscriptionUpdated = require('../../payments/fixtures/stripe/event_customer_subscription_updated.json');
const eventCustomerSourceExpiring = require('../../payments/fixtures/stripe/event_customer_source_expiring.json');
const eventProductUpdated = require('../../payments/fixtures/stripe/product_updated_event.json');
const eventPlanUpdated = require('../../payments/fixtures/stripe/plan_updated_event.json');
const eventCreditNoteCreated = require('../../payments/fixtures/stripe/event_credit_note_created.json');
const { default: Container } = require('typedi');
const { PayPalHelper } = require('../../../../lib/payments/paypal');
const { CapabilityService } = require('../../../../lib/payments/capability');
const { CurrencyHelper } = require('../../../../lib/payments/currencies');
const { asyncIterable } = require('../../../mocks');

let config, log, db, customs, push, mailer, profile, mockCapabilityService;

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
function deepCopy(object) {
  return JSON.parse(JSON.stringify(object));
}

describe('StripeWebhookHandler', () => {
  let sandbox;
  let StripeWebhookHandlerInstance;

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
      },
    };

    log = mocks.mockLog();
    customs = mocks.mockCustoms();
    profile = mocks.mockProfile({
      deleteCache: sinon.spy(async (uid) => ({})),
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
    const validPlanList = [validPlan.data.object, validPlan.data.object].map(
      (p) => ({
        ...p,
        product: eventProductUpdated.data.object,
      })
    );
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
    });

    describe('handleWebhookEvent', () => {
      let scopeContextSpy, scopeSpy;
      const request = {
        payload: {},
        headers: {
          'stripe-signature': 'stripe_123',
        },
      };
      const handlerNames = [
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
      ];
      const handlerStubs = {};

      beforeEach(() => {
        for (const handlerName of handlerNames) {
          handlerStubs[handlerName] = sandbox
            .stub(StripeWebhookHandlerInstance, handlerName)
            .resolves();
        }
        scopeContextSpy = sinon.fake();
        scopeSpy = {
          setContext: scopeContextSpy,
        };
        sandbox.replace(Sentry, 'withScope', (fn) => fn(scopeSpy));
      });

      const assertNamedHandlerCalled = (expectedHandlerName = null) => {
        for (const handlerName of handlerNames) {
          const shouldCall =
            expectedHandlerName && handlerName === expectedHandlerName;
          assert.isTrue(
            handlerStubs[handlerName][shouldCall ? 'called' : 'notCalled'],
            `Expected to ${shouldCall ? '' : 'not '}call ${handlerName}`
          );
        }
      };

      const itOnlyCallsThisHandler = (expectedHandlerName, event) =>
        it(`only calls ${expectedHandlerName}`, async () => {
          const createdEvent = deepCopy(event);
          StripeWebhookHandlerInstance.stripeHelper.constructWebhookEvent.returns(
            createdEvent
          );
          await StripeWebhookHandlerInstance.handleWebhookEvent(request);
          assertNamedHandlerCalled(expectedHandlerName);
          assert.isTrue(
            scopeContextSpy.notCalled,
            'Expected to not call Sentry'
          );
        });

      describe('ignorable errors', () => {
        const commonIgnorableErrorTest = (expectedError) => async () => {
          const fixture = deepCopy(eventCustomerSourceExpiring);
          handlerStubs.handleCustomerSourceExpiringEvent.throws(expectedError);
          StripeWebhookHandlerInstance.stripeHelper.constructWebhookEvent.returns(
            fixture
          );
          let errorThrown = null;
          try {
            await StripeWebhookHandlerInstance.handleWebhookEvent(request);
            assert.calledWith(
              StripeWebhookHandlerInstance.log.error,
              'subscriptions.handleWebhookEvent.failure',
              { error: expectedError }
            );
          } catch (err) {
            errorThrown = err;
          }
          assert.isNull(errorThrown);
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
          eventProductUpdated
        );
      });

      describe('when the event.type is plan.updated', () => {
        itOnlyCallsThisHandler(
          'handlePlanCreatedOrUpdatedEvent',
          eventPlanUpdated
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

      describe('when the event.type is something else', () => {
        it('only calls sentry', async () => {
          const event = deepCopy(subscriptionCreated);
          event.type = 'application_fee.refunded';
          StripeWebhookHandlerInstance.stripeHelper.constructWebhookEvent.returns(
            event
          );
          await StripeWebhookHandlerInstance.handleWebhookEvent(request);
          assertNamedHandlerCalled();
          assert.isTrue(scopeContextSpy.calledOnce, 'Expected to call Sentry');
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

    describe('handleCustomerCreatedEvent', () => {
      it('creates a local db record with the account uid', async () => {
        await StripeWebhookHandlerInstance.handleCustomerCreatedEvent(
          {},
          {
            data: { object: customerFixture },
            type: 'customer.created',
          }
        );

        assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.db.accountRecord,
          customerFixture.email
        );
        assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper.createLocalCustomer,
          UID,
          customerFixture
        );
      });
    });

    describe('handleCustomerUpdatedEvent', () => {
      it('removes the customer if the account exists', async () => {
        const authDbModule = require('fxa-shared/db/models/auth');
        const account = { email: customerFixture.email };
        sandbox.stub(authDbModule.Account, 'findByUid').resolves(account);
        await StripeWebhookHandlerInstance.handleCustomerUpdatedEvent(
          {},
          {
            data: { object: customerFixture },
            type: 'customer.updated',
          }
        );
        assert.calledOnceWithExactly(
          authDbModule.Account.findByUid,
          customerFixture.metadata.userid,
          { include: ['emails'] }
        );
      });

      it('reports sentry error with no customer found', async () => {
        const authDbModule = require('fxa-shared/db/models/auth');
        const sentryModule = require('../../../../lib/sentry');
        sandbox.stub(sentryModule, 'reportSentryError').returns({});
        sandbox.stub(authDbModule.Account, 'findByUid').resolves(null);
        await StripeWebhookHandlerInstance.handleCustomerUpdatedEvent(
          {},
          {
            data: { object: customerFixture },
            type: 'customer.updated',
          }
        );
        assert.calledOnce(sentryModule.reportSentryError);
      });
    });

    describe('handleProductWebhookEvent', () => {
      let scopeContextSpy, scopeSpy, captureMessageSpy;
      beforeEach(() => {
        captureMessageSpy = sinon.fake();
        scopeContextSpy = sinon.fake();
        scopeSpy = {
          setContext: scopeContextSpy,
        };
        sandbox.replace(Sentry, 'withScope', (fn) => fn(scopeSpy));
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

        assert.calledOnce(scopeContextSpy);
        assert.calledOnce(captureMessageSpy);

        assert.calledOnce(
          StripeWebhookHandlerInstance.stripeHelper.fetchAllPlans
        );
        assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper.fetchPlansByProductId,
          updatedEvent.data.object.id
        );
        assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper.updateAllProducts,
          [updatedEvent.data.object]
        );
        assert.calledOnceWithExactly(
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

        assert.isTrue(
          scopeContextSpy.notCalled,
          'Expected not to call Sentry.withScope'
        );
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
        assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper.updateAllProducts,
          [deletedEvent.data.object]
        );
        assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper.updateAllPlans,
          []
        );
      });
    });

    describe('handlePlanCreatedOrUpdatedEvent', () => {
      let scopeContextSpy, scopeSpy, captureMessageSpy;
      const plan = {
        ...validPlan.data.object,
        product: validProduct.data.object,
      };

      beforeEach(() => {
        captureMessageSpy = sinon.fake();
        scopeContextSpy = sinon.fake();
        scopeSpy = {
          setContext: scopeContextSpy,
        };
        sandbox.replace(Sentry, 'withScope', (fn) => fn(scopeSpy));
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

        assert.isTrue(
          scopeContextSpy.called,
          'Expected to call Sentry.withScope'
        );
        assert.isTrue(
          captureMessageSpy.called,
          'Expected to call Sentry.captureMessage'
        );
        assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper.fetchProductById,
          validProduct.data.object.id
        );
        assert.calledOnceWithExactly(
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

        assert.isTrue(
          scopeContextSpy.notCalled,
          'Expected not to call Sentry.withScope'
        );
        assert.isTrue(
          captureMessageSpy.notCalled,
          'Expected not to call Sentry.captureMessage'
        );
        assert.calledOnceWithExactly(
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

        assert.calledOnce(StripeWebhookHandlerInstance.log.error);
        assert.isTrue(
          scopeContextSpy.called,
          'Expected to call Sentry.withScope'
        );
        assert.isTrue(
          captureMessageSpy.called,
          'Expected to call Sentry.captureMessage'
        );
        assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper.fetchProductById,
          productId
        );
        assert.calledOnceWithExactly(
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
        assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper.updateAllPlans,
          []
        );
      });
    });

    describe('handleSubscriptionUpdatedEvent', () => {
      let sendSubscriptionUpdatedEmailStub;

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
        assert.calledWithExactly(mockCapabilityService.stripeUpdate, {
          sub: updatedEvent.data.object,
          uid: UID,
        });
        assert.calledWith(sendSubscriptionUpdatedEmailStub, updatedEvent);
      });

      it('does not emit a notification for any other subscription state change', async () => {
        const updatedEvent = deepCopy(subscriptionUpdated);
        await StripeWebhookHandlerInstance.handleSubscriptionUpdatedEvent(
          {},
          updatedEvent
        );
        assert.calledWith(sendSubscriptionUpdatedEmailStub, updatedEvent);
        assert.notCalled(mockCapabilityService.stripeUpdate);
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
        const sentryModule = require('../../../../lib/sentry');
        sandbox.stub(sentryModule, 'reportSentryError').returns({});
        sendSubscriptionUpdatedEmailStub.rejects(fakeAppError);
        await StripeWebhookHandlerInstance.handleSubscriptionUpdatedEvent(
          {},
          updatedEvent
        );
        assert.calledWith(sendSubscriptionUpdatedEmailStub, updatedEvent);
        assert.calledWith(
          sentryModule.reportSentryError,
          fakeAppErrorWithEventId
        );
      });
    });

    describe('handleSubscriptionDeletedEvent', () => {
      it('sends email and emits a notification when a subscription is deleted', async () => {
        StripeWebhookHandlerInstance.stripeHelper.fetchCustomer.resolves(
          customerFixture
        );
        const deletedEvent = deepCopy(subscriptionDeleted);
        const sendSubscriptionDeletedEmailStub = sandbox
          .stub(StripeWebhookHandlerInstance, 'sendSubscriptionDeletedEmail')
          .resolves({ uid: UID, email: TEST_EMAIL });
        await StripeWebhookHandlerInstance.handleSubscriptionDeletedEvent(
          {},
          deletedEvent
        );
        assert.calledWith(mockCapabilityService.stripeUpdate, {
          sub: deletedEvent.data.object,
          uid: UID,
        });
        assert.calledWith(
          sendSubscriptionDeletedEmailStub,
          deletedEvent.data.object
        );
        assert.notCalled(authDbModule.getUidAndEmailByStripeCustomerId);
        assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper.fetchCustomer,
          UID,
          ['subscriptions']
        );
        assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.paypalHelper
            .conditionallyRemoveBillingAgreement,
          customerFixture
        );
      });

      it('does not conditionally delete without customer record', async () => {
        const deletedEvent = deepCopy(subscriptionDeleted);
        const sendSubscriptionDeletedEmailStub = sandbox
          .stub(StripeWebhookHandlerInstance, 'sendSubscriptionDeletedEmail')
          .resolves({ uid: UID, email: TEST_EMAIL });
        await StripeWebhookHandlerInstance.handleSubscriptionDeletedEvent(
          {},
          deletedEvent
        );
        assert.calledWith(
          sendSubscriptionDeletedEmailStub,
          deletedEvent.data.object
        );
        assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper.fetchCustomer,
          UID,
          ['subscriptions']
        );
        assert.notCalled(
          StripeWebhookHandlerInstance.paypalHelper
            .conditionallyRemoveBillingAgreement
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
        assert.isUndefined(result);
        assert.notCalled(
          StripeWebhookHandlerInstance.stripeHelper.expandResource
        );
      });

      it('stops if the invoice is not paypal payable', async () => {
        const invoiceCreatedEvent = deepCopy(eventInvoiceCreated);
        StripeWebhookHandlerInstance.stripeHelper.invoicePayableWithPaypal.resolves(
          false
        );
        StripeWebhookHandlerInstance.stripeHelper.finalizeInvoice.resolves({});
        const result =
          await StripeWebhookHandlerInstance.handleInvoiceCreatedEvent(
            {},
            invoiceCreatedEvent
          );
        assert.isUndefined(result);
        assert.notCalled(
          StripeWebhookHandlerInstance.stripeHelper.expandResource
        );
        assert.notCalled(
          StripeWebhookHandlerInstance.stripeHelper.finalizeInvoice
        );
      });

      it('finalizes invoices for invoice subscriptions', async () => {
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
        assert.deepEqual(result, {});
        assert.calledWith(
          StripeWebhookHandlerInstance.stripeHelper.invoicePayableWithPaypal,
          invoiceCreatedEvent.data.object
        );
        assert.calledWith(
          StripeWebhookHandlerInstance.stripeHelper.finalizeInvoice,
          invoiceCreatedEvent.data.object
        );
      });
    });

    describe('handleCreditNoteEvent', () => {
      let invoiceCreditNoteEvent;
      let invoice;

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
        assert.isUndefined(result);
        assert.notCalled(
          StripeWebhookHandlerInstance.stripeHelper.expandResource
        );
      });

      it('doesnt run if its not manual invoice or out of band credit note', async () => {
        const sentryModule = require('../../../../lib/sentry');
        sandbox.stub(sentryModule, 'reportSentryError').returns({});
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
        assert.isUndefined(result);
        assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper.expandResource,
          invoiceCreditNoteEvent.data.object.invoice,
          'invoices'
        );
        assert.notCalled(
          StripeWebhookHandlerInstance.stripeHelper
            .getInvoicePaypalTransactionId
        );
        assert.calledOnce(sentryModule.reportSentryError);
      });

      it('doesnt run or error report if its not manual invoice and not out of band', async () => {
        const sentryModule = require('../../../../lib/sentry');
        sandbox.stub(sentryModule, 'reportSentryError').returns({});
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
        assert.isUndefined(result);
        assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper.expandResource,
          invoiceCreditNoteEvent.data.object.invoice,
          'invoices'
        );
        assert.notCalled(
          StripeWebhookHandlerInstance.stripeHelper
            .getInvoicePaypalTransactionId
        );
        assert.notCalled(sentryModule.reportSentryError);
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
        assert.isUndefined(result);
        assert.calledWithMatch(
          StripeWebhookHandlerInstance.stripeHelper.expandResource,
          invoiceCreditNoteEvent.data.object.invoice,
          'invoices'
        );
        assert.callCount(
          StripeWebhookHandlerInstance.stripeHelper.expandResource,
          1
        );
        assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.log.error,
          'handleCreditNoteEvent',
          {
            invoiceId: invoice.id,
            message:
              'Credit note issued on invoice without a PayPal transaction id.',
          }
        );
        assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper
            .getInvoicePaypalTransactionId,
          invoice
        );
      });

      it('logs an error if the amount doesnt match the invoice amount', async () => {
        StripeWebhookHandlerInstance.paypalHelper = {};
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
        assert.isUndefined(result);
        assert.calledWithMatch(
          StripeWebhookHandlerInstance.stripeHelper.expandResource,
          invoiceCreditNoteEvent.data.object.invoice,
          'invoices'
        );
        assert.callCount(
          StripeWebhookHandlerInstance.stripeHelper.expandResource,
          1
        );
        assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.log.error,
          'handleCreditNoteEvent',
          {
            invoiceId: invoice.id,
            message: 'Credit note does not match invoice amount.',
          }
        );
        assert.calledOnceWithExactly(
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
        assert.isUndefined(result);
        assert.calledWithMatch(
          StripeWebhookHandlerInstance.stripeHelper.expandResource,
          invoiceCreditNoteEvent.data.object.invoice,
          'invoices'
        );
        assert.callCount(
          StripeWebhookHandlerInstance.stripeHelper.expandResource,
          1
        );
        assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.stripeHelper
            .getInvoicePaypalTransactionId,
          invoice
        );
        assert.calledOnceWithExactly(
          StripeWebhookHandlerInstance.paypalHelper.issueRefund,
          invoice,
          'tx-1234'
        );
      });
    });

    describe('handleInvoicePaidEvent', () => {
      it('sends email and emits a notification when an invoice payment succeeds', async () => {
        const PaidEvent = deepCopy(eventInvoicePaid);
        const sendSubscriptionInvoiceEmailStub = sandbox
          .stub(StripeWebhookHandlerInstance, 'sendSubscriptionInvoiceEmail')
          .resolves(true);
        const mockSubscription = {
          id: 'test1',
          plan: { product: 'test2' },
        };
        StripeWebhookHandlerInstance.stripeHelper.expandResource.resolves(
          mockSubscription
        );
        await StripeWebhookHandlerInstance.handleInvoicePaidEvent(
          {},
          PaidEvent
        );
        assert.calledWith(
          sendSubscriptionInvoiceEmailStub,
          PaidEvent.data.object
        );
      });
    });

    describe('handleInvoicePaymentFailedEvent', () => {
      const mockSubscription = {
        id: 'test1',
        plan: { product: 'test2' },
      };
      let sendSubscriptionPaymentFailedEmailStub;

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
        assert.calledWith(
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
        assert.notCalled(sendSubscriptionPaymentFailedEmailStub);
      });
    });

    describe('handleSubscriptionCreatedEvent', () => {
      it('emits a notification when a new subscription is "active" or "trialing"', async () => {
        const createdEvent = deepCopy(subscriptionCreated);
        await StripeWebhookHandlerInstance.handleSubscriptionCreatedEvent(
          {},
          createdEvent
        );
        assert.calledWith(mockCapabilityService.stripeUpdate, {
          sub: createdEvent.data.object,
        });
      });

      it('does not emit a notification for incomplete new subscriptions', async () => {
        const createdEvent = deepCopy(subscriptionCreatedIncomplete);
        await StripeWebhookHandlerInstance.handleSubscriptionCreatedEvent(
          {},
          createdEvent
        );
        assert.notCalled(authDbModule.getUidAndEmailByStripeCustomerId);
        assert.notCalled(mockCapabilityService.stripeUpdate);
      });
    });
  });

  describe('sendSubscriptionPaymentExpiredEmail', () => {
    const mockSource = {};
    const mockAccount = {
      emails: TEST_EMAIL,
      locale: ACCOUNT_LOCALE,
    };

    it('sends the email with a list of subscriptions', async () => {
      StripeWebhookHandlerInstance.db.account = sandbox
        .stub()
        .resolves(mockAccount);
      StripeWebhookHandlerInstance.mailer.sendMultiSubscriptionsPaymentExpiredEmail =
        sandbox.stub();
      StripeWebhookHandlerInstance.mailer.sendSubscriptionPaymentExpiredEmail =
        sandbox.stub();
      const mockCustomer = { uid: UID, subscriptions: [{ id: 'sub_testo' }] };
      StripeWebhookHandlerInstance.stripeHelper.extractSourceDetailsForEmail.resolves(
        mockCustomer
      );

      await StripeWebhookHandlerInstance.sendSubscriptionPaymentExpiredEmail(
        mockSource
      );

      assert.calledOnceWithExactly(
        StripeWebhookHandlerInstance.stripeHelper.extractSourceDetailsForEmail,
        mockSource
      );
      assert.calledOnceWithExactly(
        StripeWebhookHandlerInstance.db.account,
        UID
      );
      sinon.assert.calledOnceWithExactly(
        StripeWebhookHandlerInstance.mailer.sendSubscriptionPaymentExpiredEmail,
        TEST_EMAIL,
        { emails: TEST_EMAIL, locale: ACCOUNT_LOCALE },
        {
          acceptLanguage: ACCOUNT_LOCALE,
          ...mockCustomer,
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
        async (data) => mockAccount
      );

      await StripeWebhookHandlerInstance.sendSubscriptionPaymentFailedEmail(
        invoice
      );
      assert.calledWith(
        StripeWebhookHandlerInstance.mailer.sendSubscriptionPaymentFailedEmail,
        mockAccount.emails,
        mockAccount,
        {
          acceptLanguage: mockAccount.locale,
          ...mockInvoiceDetails,
        }
      );
    });
  });

  describe('sendSubscriptionInvoiceEmail', () => {
    const commonSendSubscriptionInvoiceEmailTest =
      (expectedMethodName, billingReason, verifierSetAt = Date.now()) =>
      async () => {
        const invoice = deepCopy(eventInvoicePaid.data.object);
        invoice.billing_reason = billingReason;

        const mockInvoiceDetails = { uid: '1234', test: 'fake' };
        StripeWebhookHandlerInstance.stripeHelper.extractInvoiceDetailsForEmail.resolves(
          mockInvoiceDetails
        );

        const mockAccount = {
          emails: 'fakeemails',
          locale: 'fakelocale',
          verifierSetAt,
        };
        StripeWebhookHandlerInstance.db.account = sinon.spy(
          async (data) => mockAccount
        );

        await StripeWebhookHandlerInstance.sendSubscriptionInvoiceEmail(
          invoice
        );
        assert.calledWith(
          StripeWebhookHandlerInstance.mailer[expectedMethodName],
          mockAccount.emails,
          mockAccount,
          {
            acceptLanguage: mockAccount.locale,
            ...mockInvoiceDetails,
          }
        );
        if (expectedMethodName === 'sendSubscriptionFirstInvoiceEmail') {
          if (verifierSetAt) {
            assert.calledWith(
              StripeWebhookHandlerInstance.mailer.sendDownloadSubscriptionEmail,
              mockAccount.emails,
              mockAccount,
              {
                acceptLanguage: mockAccount.locale,
                ...mockInvoiceDetails,
              }
            );
          } else {
            assert.isTrue(
              StripeWebhookHandlerInstance.mailer.sendDownloadSubscriptionEmail
                .notCalled
            );
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
  });

  describe('sendSubscriptionUpdatedEmail', () => {
    const commonSendSubscriptionUpdatedEmailTest = (updateType) => async () => {
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
        async (data) => mockAccount
      );

      await StripeWebhookHandlerInstance.sendSubscriptionUpdatedEmail(event);

      const expectedMethodName = {
        [SUBSCRIPTION_UPDATE_TYPES.UPGRADE]: 'sendSubscriptionUpgradeEmail',
        [SUBSCRIPTION_UPDATE_TYPES.DOWNGRADE]: 'sendSubscriptionDowngradeEmail',
        [SUBSCRIPTION_UPDATE_TYPES.REACTIVATION]:
          'sendSubscriptionReactivationEmail',
        [SUBSCRIPTION_UPDATE_TYPES.CANCELLATION]:
          'sendSubscriptionCancellationEmail',
      }[updateType];

      assert.calledWith(
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

        const deletedEvent = deepCopy(subscriptionDeleted);
        const subscription = deletedEvent.data.object;

        if (options.subscriptionAlreadyCancelled) {
          subscription.metadata = {
            cancelled_for_customer_at: moment().unix(),
          };
        }

        const mockInvoiceDetails = {
          uid: '1234',
          test: 'fake',
          email: 'test@example.com',
        };
        StripeWebhookHandlerInstance.stripeHelper.extractInvoiceDetailsForEmail.resolves(
          mockInvoiceDetails
        );
        StripeWebhookHandlerInstance.stripeHelper.expandResource.resolves({
          id: 'in_1GB4aHKb9q6OnNsLC9pbVY5a',
        });

        const mockAccount = { emails: 'fakeemails', locale: 'fakelocale' };
        StripeWebhookHandlerInstance.db.account = sinon.spy(async (data) => {
          if (options.accountFound) {
            return mockAccount;
          }
          throw error.unknownAccount();
        });

        await StripeWebhookHandlerInstance.sendSubscriptionDeletedEmail(
          subscription
        );

        assert.calledWith(
          StripeWebhookHandlerInstance.stripeHelper
            .extractInvoiceDetailsForEmail,
          { id: subscription.latest_invoice }
        );

        if (shouldSendSubscriptionFailedPaymentsCancellationEmail()) {
          assert.calledWith(
            StripeWebhookHandlerInstance.mailer
              .sendSubscriptionFailedPaymentsCancellationEmail,
            mockAccount.emails,
            mockAccount,
            {
              acceptLanguage: mockAccount.locale,
              ...mockInvoiceDetails,
            }
          );
        } else {
          assert.notCalled(
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
          assert.calledWith(
            StripeWebhookHandlerInstance.mailer
              .sendSubscriptionAccountDeletionEmail,
            fakeAccount.emails,
            fakeAccount,
            mockInvoiceDetails
          );
        } else {
          assert.notCalled(
            StripeWebhookHandlerInstance.mailer
              .sendSubscriptionAccountDeletionEmail
          );
        }
      };

    it(
      'does not send a cancellation email on subscription deletion',
      commonSendSubscriptionDeletedEmailTest({
        accountFound: true,
        subscriptionAlreadyCancelled: true,
        involuntaryCancellation: false,
      })
    );

    it(
      'sends an account deletion specific email on subscription deletion when account is gone',
      commonSendSubscriptionDeletedEmailTest({
        accountFound: false,
        subscriptionAlreadyCancelled: false,
        involuntaryCancellation: false,
      })
    );

    it(
      'does not send a cancellation email on account deletion when the subscription is already cancelled',
      commonSendSubscriptionDeletedEmailTest({
        accountFound: false,
        subscriptionAlreadyCancelled: true,
        involuntaryCancellation: false,
      })
    );

    it(
      'sends a failed payment cancellation email on subscription deletion',
      commonSendSubscriptionDeletedEmailTest({
        accountFound: true,
        subscriptionAlreadyCancelled: false,
        involuntaryCancellation: true,
      })
    );
  });
});
