/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import { assert } from 'chai';
import * as uuid from 'uuid';
import sinon from 'sinon';
import { Container } from 'typedi';
import mocks from '../../../mocks';
import error from '../../../../lib/error';
import completedMerchantPaymentNotification from '../fixtures/merch_pmt_completed.json';
import pendingMerchantPaymentNotification from '../fixtures/merch_pmt_pending.json';
import billingAgreementCancelNotification from '../fixtures/mp_cancel_successful.json';
import proxyquireModule from "proxyquire";
const proxyquire = proxyquireModule.noPreserveCache();

const sandbox = sinon.createSandbox();

const dbStub = {
  getPayPalBAByBAId: sandbox.stub(),
  Account: {},
  updatePayPalBA: sandbox.stub(),
};

const { PayPalNotificationHandler } = proxyquire(
  '../../../../lib/routes/subscriptions/paypal-notifications',
  { 'fxa-shared/db/models/auth': dbStub }
);
import { PayPalHelper } from '../../../../lib/payments/paypal/helper';
import { CapabilityService } from '../../../../lib/payments/capability';

import { RefundType } from '@fxa/payments/paypal';
import { SUBSCRIPTIONS_RESOURCE } from '../../../../lib/payments/stripe';

const ACCOUNT_LOCALE = 'en-US';
const TEST_EMAIL = 'test@email.com';
const UID = uuid.v4({}, Buffer.alloc(16)).toString('hex');

describe('PayPalNotificationHandler', () => {
  let config;
  let customs;
  let db;
  /** @type { PayPalNotificationHandler } */
  let handler;
  let log;
  let mailer;
  let paypalHelper;
  let profile;
  let push;
  let stripeHelper;
  /** @type sinon.SinonSandbox */

  beforeEach(() => {
    config = {
      authFirestore: {
        enabled: false,
      },
      subscriptions: {
        enabled: true,
        stripeApiKey: 'sk_test_1234',
        paypalNvpSigCredentials: {
          enabled: false,
        },
      },
    };

    log = mocks.mockLog();
    customs = mocks.mockCustoms();

    db = mocks.mockDB({
      uid: UID,
      email: TEST_EMAIL,
      locale: ACCOUNT_LOCALE,
    });

    push = mocks.mockPush();
    mailer = mocks.mockMailer();

    profile = mocks.mockProfile({
      deleteCache: sinon.spy(async (uid) => ({})),
    });

    stripeHelper = {};
    paypalHelper = {};

    Container.set(PayPalHelper, paypalHelper);
    Container.set(CapabilityService, {});

    handler = new PayPalNotificationHandler(
      log,
      db,
      config,
      customs,
      push,
      mailer,
      profile,
      stripeHelper
    );
  });

  afterEach(() => {
    Container.reset();
    sandbox.reset();
  });

  describe('handleIpnEvent', () => {
    it('handles a request successfully', () => {
      handler.verifyAndDispatchEvent = sinon.fake.returns({});
      const result = handler.handleIpnEvent({});
      sinon.assert.calledOnceWithExactly(handler.verifyAndDispatchEvent, {});
      assert.deepEqual(result, {});
    });
  });

  describe('verifyAndDispatchEvent', () => {
    it('handles a merch_pmt request successfully', async () => {
      const request = {
        payload: 'samplepayload',
      };
      const ipnMessage = {
        txn_type: 'merch_pmt',
      };
      paypalHelper.verifyIpnMessage = sinon.fake.resolves(true);
      paypalHelper.extractIpnMessage = sinon.fake.returns(ipnMessage);
      handler.handleMerchPayment = sinon.fake.resolves({});
      const result = await handler.verifyAndDispatchEvent(request);
      assert.deepEqual(result, {});
      sinon.assert.calledOnce(paypalHelper.verifyIpnMessage);
      sinon.assert.calledOnce(paypalHelper.extractIpnMessage);
      sinon.assert.calledOnceWithExactly(
        handler.handleMerchPayment,
        ipnMessage
      );
    });

    it('handles a mp_cancel request successfully', async () => {
      const request = {
        payload: 'samplepayload',
      };
      const ipnMessage = {
        txn_type: 'mp_cancel',
      };
      paypalHelper.verifyIpnMessage = sinon.fake.resolves(true);
      paypalHelper.extractIpnMessage = sinon.fake.returns(ipnMessage);
      handler.handleMpCancel = sinon.fake.resolves({});
      const result = await handler.verifyAndDispatchEvent(request);
      assert.deepEqual(result, {});
      sinon.assert.calledOnce(paypalHelper.verifyIpnMessage);
      sinon.assert.calledOnce(paypalHelper.extractIpnMessage);
      sinon.assert.calledOnceWithExactly(handler.handleMpCancel, ipnMessage);
    });

    it('handles an unknown IPN request successfully', async () => {
      const request = {
        payload: 'samplepayload',
      };
      const ipnMessage = {
        txn_type: 'other',
      };
      paypalHelper.verifyIpnMessage = sinon.fake.resolves(true);
      paypalHelper.extractIpnMessage = sinon.fake.returns(ipnMessage);
      handler.handleMerchPayment = sinon.fake.resolves({});
      const result = await handler.verifyAndDispatchEvent(request);
      assert.deepEqual(result, false);
      sinon.assert.calledOnce(paypalHelper.verifyIpnMessage);
      sinon.assert.calledOnce(paypalHelper.extractIpnMessage);
      sinon.assert.calledWithExactly(log.info, 'Unhandled Ipn message', {
        payload: ipnMessage,
      });
    });

    it('handles an excluded IPN request successfully', async () => {
      const request = {
        payload: 'samplepayload',
      };
      const ipnMessage = {
        txn_type: 'mp_signup',
      };
      paypalHelper.verifyIpnMessage = sinon.fake.resolves(true);
      paypalHelper.extractIpnMessage = sinon.fake.returns(ipnMessage);
      handler.handleMerchPayment = sinon.fake.resolves({});
      const result = await handler.verifyAndDispatchEvent(request);
      assert.deepEqual(result, false);
      sinon.assert.calledOnce(paypalHelper.verifyIpnMessage);
      sinon.assert.calledOnce(paypalHelper.extractIpnMessage);
    });

    it('handles an invalid request successfully', async () => {
      const request = {
        payload: 'samplepayload',
      };
      paypalHelper.verifyIpnMessage = sinon.fake.resolves(false);
      const result = await handler.verifyAndDispatchEvent(request);
      assert.deepEqual(result, false);
      sinon.assert.calledOnce(paypalHelper.verifyIpnMessage);
      sinon.assert.calledOnce(log.error);
    });
  });

  describe('handleSuccessfulPayment', () => {
    const ipnTransactionId = 'ipn_id_123';
    const validMessage = {
      txn_id: ipnTransactionId,
    };
    const validInvoice = {
      metadata: {
        paypalTransactionId: ipnTransactionId,
      },
      subscription: {
        status: 'active',
      },
    };
    const paidInvoice = { status: 'paid' };
    const refundReturn = undefined;

    beforeEach(() => {
      stripeHelper.getInvoicePaypalTransactionId =
        sinon.fake.returns(ipnTransactionId);
      stripeHelper.payInvoiceOutOfBand = sinon.fake.resolves(paidInvoice);
      paypalHelper.issueRefund = sinon.fake.resolves(refundReturn);
    });

    it('should update invoice to paid', async () => {
      const invoice = validInvoice;
      const message = validMessage;

      const result = await handler.handleSuccessfulPayment(invoice, message);

      assert.deepEqual(result, paidInvoice);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.payInvoiceOutOfBand,
        invoice
      );
      sinon.assert.notCalled(paypalHelper.issueRefund);
    });

    it('should update Invoice with paypalTransactionId if not already there', async () => {
      const invoice = {
        subscription: {
          status: 'active',
        },
      };
      const message = validMessage;
      stripeHelper.getInvoicePaypalTransactionId =
        sinon.fake.returns(undefined);
      stripeHelper.updateInvoiceWithPaypalTransactionId =
        sinon.fake.resolves(validInvoice);

      const result = await handler.handleSuccessfulPayment(invoice, message);

      assert.deepEqual(result, paidInvoice);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.updateInvoiceWithPaypalTransactionId,
        invoice,
        ipnTransactionId
      );
      sinon.assert.calledOnceWithExactly(
        stripeHelper.payInvoiceOutOfBand,
        invoice
      );
      sinon.assert.notCalled(paypalHelper.issueRefund);
    });

    it('should throw an error when paypalTransactionId and IPN txn_id dont match', async () => {
      const invoice = validInvoice;
      const message = {
        txn_id: 'notcorrect',
      };

      try {
        await handler.handleSuccessfulPayment(invoice, message);
        assert.fail('Error should throw error with transactionId not matching');
      } catch (err) {
        assert.deepEqual(
          err,
          error.internalValidationError('handleSuccessfulPayment', {
            message:
              'Invoice paypalTransactionId does not match Paypal IPN txn_id',
            invoiceId: invoice.id,
            paypalIPNTxnId: message.txn_id,
          })
        );
        sinon.assert.notCalled(stripeHelper.payInvoiceOutOfBand);
        sinon.assert.notCalled(paypalHelper.issueRefund);
      }
    });

    it('should not expand subscription and refund the invoice if the subscription has status canceled', async () => {
      const invoice = {
        metadata: {
          paypalTransactionId: ipnTransactionId,
        },
        subscription: {
          status: 'canceled',
        },
      };
      const message = validMessage;
      stripeHelper.expandResource = sinon.spy();

      const result = await handler.handleSuccessfulPayment(invoice, message);

      assert.deepEqual(result, refundReturn);
      sinon.assert.calledOnceWithExactly(
        paypalHelper.issueRefund,
        invoice,
        validMessage.txn_id,
        RefundType.Full
      );
      sinon.assert.notCalled(stripeHelper.expandResource);
      sinon.assert.notCalled(stripeHelper.payInvoiceOutOfBand);
    });

    it('should expand subscription and refund the invoice if the subscription has status canceled', async () => {
      const invoice = {
        metadata: {
          paypalTransactionId: ipnTransactionId,
        },
        subscription: 'sub_id',
      };
      const message = validMessage;
      stripeHelper.expandResource = sinon.fake.resolves({ status: 'canceled' });

      const result = await handler.handleSuccessfulPayment(invoice, message);

      assert.deepEqual(result, refundReturn);
      sinon.assert.calledOnceWithExactly(
        paypalHelper.issueRefund,
        invoice,
        validMessage.txn_id,
        RefundType.Full
      );
      sinon.assert.calledOnceWithExactly(
        stripeHelper.expandResource,
        invoice.subscription,
        SUBSCRIPTIONS_RESOURCE
      );
      sinon.assert.notCalled(stripeHelper.payInvoiceOutOfBand);
    });
  });

  describe('handleMerchPayment', () => {
    const message = {
      txn_type: 'merch_pmt',
      invoice: 'inv_000',
    };
    it('receives IPN message with successful payment status', async () => {
      const invoice = { status: 'open' };
      const paidInvoice = { status: 'paid' };
      stripeHelper.getInvoice = sinon.fake.resolves(invoice);
      handler.handleSuccessfulPayment = sinon.fake.resolves(paidInvoice);

      const result = await handler.handleMerchPayment(
        completedMerchantPaymentNotification
      );
      assert.deepEqual(result, paidInvoice);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.getInvoice,
        completedMerchantPaymentNotification.invoice
      );
      sinon.assert.calledOnceWithExactly(
        handler.handleSuccessfulPayment,
        invoice,
        completedMerchantPaymentNotification
      );
    });

    it('receives IPN message with pending payment status', async () => {
      const invoice = { status: 'open' };
      stripeHelper.getInvoice = sinon.fake.resolves(invoice);
      const result = await handler.handleMerchPayment(
        pendingMerchantPaymentNotification
      );
      assert.deepEqual(result, undefined);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.getInvoice,
        pendingMerchantPaymentNotification.invoice
      );
    });

    it('receives IPN message with unsuccessful payment status and no idempotency key', async () => {
      const invoice = { status: 'open' };
      const deniedMessage = {
        ...message,
        payment_status: 'Denied',
        custom: '',
      };
      stripeHelper.getInvoice = sinon.fake.resolves(invoice);
      try {
        await handler.handleMerchPayment(deniedMessage);
        assert.fail('Error should throw no idempotency key response.');
      } catch (err) {
        assert.deepEqual(
          err,
          error.internalValidationError('handleMerchPayment', {
            message: 'No idempotency key on PayPal transaction',
          })
        );
      }
      sinon.assert.calledOnceWithExactly(
        stripeHelper.getInvoice,
        message.invoice
      );
      sinon.assert.calledOnce(log.error);
    });

    it('receives IPN message with unexpected payment status', async () => {
      const invoice = { status: 'open' };
      stripeHelper.getInvoice = sinon.fake.resolves(invoice);
      try {
        await handler.handleMerchPayment({
          ...message,
        });
        assert.fail(
          'Error should throw invoice not in correct status response.'
        );
      } catch (err) {
        assert.deepEqual(
          err,
          error.internalValidationError('handleMerchPayment', {
            message: 'Unexpected PayPal payment status',
            transactionResponse: message.payment_status,
          })
        );
      }
      sinon.assert.calledOnceWithExactly(
        stripeHelper.getInvoice,
        message.invoice
      );
      sinon.assert.calledOnce(log.error);
    });

    it('receives IPN message with invoice not found', async () => {
      stripeHelper.getInvoice = sinon.fake.resolves(undefined);
      try {
        await handler.handleMerchPayment(message);
        assert.fail('Error should throw invoice not found response.');
      } catch (err) {
        assert.deepEqual(
          err,
          error.internalValidationError('handleMerchPayment', {
            message: 'Invoice not found',
          })
        );
      }
      sinon.assert.calledOnceWithExactly(
        stripeHelper.getInvoice,
        message.invoice
      );
      sinon.assert.calledOnce(log.error);
    });

    it('receives IPN message with invoice not in draft or open status', async () => {
      const invoice = { status: null };
      stripeHelper.getInvoice = sinon.fake.resolves(invoice);
      const result = await handler.handleMerchPayment(message);
      assert.deepEqual(result, undefined);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.getInvoice,
        message.invoice
      );
    });

    it('successfully refunds completed transaction with invoice in uncollectible status', async () => {
      const invoice = { status: 'uncollectible' };
      stripeHelper.getInvoice = sinon.fake.resolves(invoice);
      paypalHelper.issueRefund = sinon.fake.resolves(undefined);

      const result = await handler.handleMerchPayment(
        completedMerchantPaymentNotification
      );
      assert.deepEqual(result, undefined);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.getInvoice,
        message.invoice
      );
      sinon.assert.calledOnceWithExactly(
        paypalHelper.issueRefund,
        invoice,
        completedMerchantPaymentNotification.txn_id,
        RefundType.Full
      );
    });

    it('unsuccessfully refunds completed transaction with invoice in uncollectible status', async () => {
      const invoice = { status: 'uncollectible' };
      stripeHelper.getInvoice = sinon.fake.resolves(invoice);
      paypalHelper.issueRefund = sinon.fake.throws(
        error.internalValidationError('Fake', {})
      );
      try {
        await handler.handleMerchPayment(completedMerchantPaymentNotification);
        assert.fail(
          'Error should throw PayPal refund transaction unsuccessful.'
        );
      } catch (err) {
        assert.instanceOf(err, error);
        assert.equal(err.message, 'An internal validation check failed.');
      }
      sinon.assert.calledOnceWithExactly(
        stripeHelper.getInvoice,
        message.invoice
      );
      sinon.assert.calledOnceWithExactly(
        paypalHelper.issueRefund,
        invoice,
        completedMerchantPaymentNotification.txn_id,
        RefundType.Full
      );
    });
  });

  describe('removeBillingAgreement', () => {
    const ipnBillingAgreement = {
      billingAgreementId: 'ipn_ba_id_123',
    };
    const account = {
      uid: 'account_id_123',
    };
    const customer = {
      id: 'customer_id_123',
    };
    it('should removeCustomerPaypalAgreement when IPN and Customer BA ID match', async () => {
      stripeHelper.removeCustomerPaypalAgreement = sinon.fake.resolves();
      stripeHelper.getCustomerPaypalAgreement = sinon.fake.returns(
        ipnBillingAgreement.billingAgreementId
      );

      const result = await handler.removeBillingAgreement(
        customer,
        ipnBillingAgreement,
        account
      );

      assert.isUndefined(result);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.removeCustomerPaypalAgreement,
        account.uid,
        customer.id,
        ipnBillingAgreement.billingAgreementId
      );
    });

    it('should only update the database BA if the IPN and Customer BA ID dont match', async () => {
      dbStub.updatePayPalBA.resolves();
      stripeHelper.getCustomerPaypalAgreement = sinon.fake.returns(undefined);

      const result = await handler.removeBillingAgreement(
        customer,
        ipnBillingAgreement,
        account
      );

      assert.isUndefined(result);
      sinon.assert.calledOnceWithMatch(
        dbStub.updatePayPalBA,
        account.uid,
        ipnBillingAgreement.billingAgreementId
      );
    });
  });

  describe('handleMpCancel', () => {
    const billingAgreement = {
      billingAgreementId: 'abc',
      status: 'Active',
      uid: '123',
    };
    const account = {
      stripeCustomerId: '321',
      uid: '123',
      email: '123@test.com',
      locale: ACCOUNT_LOCALE,
    };
    const customer = { id: '321' };
    const subscriptions = {
      data: [{ cancel_at_period_end: false, status: 'active' }],
    };

    it('receives IPN message with successful billing agreement cancelled and email sent', async () => {
      const fetchCustomer = {
        ...customer,
        subscriptions,
      };
      dbStub.getPayPalBAByBAId.resolves(billingAgreement);
      dbStub.Account.findByUid = sandbox.stub().resolves(account);
      stripeHelper.fetchCustomer = sinon.fake.resolves(fetchCustomer);
      handler.removeBillingAgreement = sinon.stub().resolves();
      stripeHelper.getPaymentProvider = sinon.fake.resolves('paypal');

      const result = await handler.handleMpCancel(
        billingAgreementCancelNotification
      );

      assert.isUndefined(result);
      sinon.assert.calledOnceWithExactly(
        dbStub.getPayPalBAByBAId,
        billingAgreementCancelNotification.mp_id
      );
      sinon.assert.calledOnceWithExactly(
        dbStub.Account.findByUid,
        billingAgreement.uid,
        { include: ['emails'] }
      );
      sinon.assert.calledOnceWithExactly(
        stripeHelper.fetchCustomer,
        account.uid,
        ['subscriptions']
      );
      sinon.assert.calledOnceWithExactly(
        handler.removeBillingAgreement,
        fetchCustomer,
        billingAgreement,
        account
      );
      sinon.assert.calledOnceWithExactly(
        stripeHelper.getPaymentProvider,
        fetchCustomer
      );
    });

    it('receives IPN message with billing agreement not found', async () => {
      dbStub.getPayPalBAByBAId.resolves(undefined);

      const result = await handler.handleMpCancel(
        billingAgreementCancelNotification
      );

      assert.isUndefined(result);
      sinon.assert.calledOnceWithExactly(
        dbStub.getPayPalBAByBAId,
        billingAgreementCancelNotification.mp_id
      );
      sinon.assert.calledOnce(log.error);
    });

    it('receives IPN message for billing agreement already cancelled', async () => {
      dbStub.getPayPalBAByBAId.resolves({
        ...billingAgreement,
        status: 'Cancelled',
      });

      const result = await handler.handleMpCancel(
        billingAgreementCancelNotification
      );

      assert.isUndefined(result);
      sinon.assert.calledOnceWithExactly(
        dbStub.getPayPalBAByBAId,
        billingAgreementCancelNotification.mp_id
      );
      sinon.assert.calledOnce(log.error);
    });

    it('receives IPN message for billing agreement with no FXA account', async () => {
      dbStub.getPayPalBAByBAId.resolves(billingAgreement);
      dbStub.Account.findByUid = sandbox.stub().resolves(null);

      const result = await handler.handleMpCancel(
        billingAgreementCancelNotification
      );

      assert.isUndefined(result);
      sinon.assert.calledOnceWithExactly(
        dbStub.getPayPalBAByBAId,
        billingAgreementCancelNotification.mp_id
      );
      sinon.assert.calledOnceWithExactly(
        dbStub.Account.findByUid,
        billingAgreement.uid,
        { include: ['emails'] }
      );
      sinon.assert.calledOnce(log.error);
    });

    it('receives IPN message for billing agreement with no Stripe customer', async () => {
      dbStub.getPayPalBAByBAId.resolves(billingAgreement);
      dbStub.Account.findByUid = sinon.stub().resolves(account);
      stripeHelper.fetchCustomer = sinon.fake.resolves(undefined);

      const result = await handler.handleMpCancel(
        billingAgreementCancelNotification
      );

      assert.isUndefined(result);
      sinon.assert.calledOnceWithExactly(
        dbStub.getPayPalBAByBAId,
        billingAgreementCancelNotification.mp_id
      );
      sinon.assert.calledOnceWithExactly(
        dbStub.Account.findByUid,
        billingAgreement.uid,
        { include: ['emails'] }
      );
      sinon.assert.calledOnceWithExactly(
        stripeHelper.fetchCustomer,
        account.uid,
        ['subscriptions']
      );
      sinon.assert.calledOnce(log.error);
    });

    it('receives IPN message for inactive subscription and email not sent', async () => {
      const fetchCustomer = {
        ...customer,
        subscriptions: undefined,
      };
      dbStub.getPayPalBAByBAId.resolves(billingAgreement);
      dbStub.Account.findByUid = sandbox.stub().resolves(account);
      stripeHelper.fetchCustomer = sinon.fake.resolves(fetchCustomer);
      handler.removeBillingAgreement = sinon.stub().resolves();
      stripeHelper.getPaymentProvider = sinon.fake.resolves('paypal');

      const result = await handler.handleMpCancel(
        billingAgreementCancelNotification
      );

      assert.isUndefined(result);
      sinon.assert.calledOnceWithExactly(
        dbStub.getPayPalBAByBAId,
        billingAgreementCancelNotification.mp_id
      );
      sinon.assert.calledOnceWithExactly(
        dbStub.Account.findByUid,
        billingAgreement.uid,
        { include: ['emails'] }
      );
      sinon.assert.calledOnceWithExactly(
        stripeHelper.fetchCustomer,
        account.uid,
        ['subscriptions']
      );
      sinon.assert.calledOnceWithExactly(
        handler.removeBillingAgreement,
        fetchCustomer,
        billingAgreement,
        account
      );
      sinon.assert.calledOnceWithExactly(
        stripeHelper.getPaymentProvider,
        fetchCustomer
      );
    });

    it('sends an email', async () => {
      const mockCustomer = {
        ...customer,
        subscriptions,
      };
      const mockFormattedSubs = { productId: 'quux' };
      const mockAcct = { ...account, emails: [account.email, 'bar@baz.gd'] };
      dbStub.getPayPalBAByBAId.resolves(billingAgreement);
      dbStub.Account.findByUid = sandbox.stub().resolves(mockAcct);
      stripeHelper.fetchCustomer = sinon.fake.resolves(mockCustomer);
      handler.removeBillingAgreement = sinon.stub().resolves();
      stripeHelper.getPaymentProvider = sinon.fake.returns('paypal');
      stripeHelper.formatSubscriptionsForEmails =
        sinon.fake.resolves(mockFormattedSubs);
      mailer.sendSubscriptionPaymentProviderCancelledEmail =
        sinon.fake.resolves();

      await handler.handleMpCancel(billingAgreementCancelNotification);

      sinon.assert.calledOnceWithExactly(
        stripeHelper.formatSubscriptionsForEmails,
        mockCustomer
      );
      sinon.assert.calledOnceWithExactly(
        mailer.sendSubscriptionPaymentProviderCancelledEmail,
        mockAcct.emails,
        mockAcct,
        {
          uid: mockAcct.uid,
          email: mockAcct.email,
          acceptLanguage: mockAcct.locale,
          subscriptions: mockFormattedSubs,
        }
      );

      sandbox.restore();
    });
  });
});
