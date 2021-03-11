/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const uuid = require('uuid');
const sinon = require('sinon');
const { Container } = require('typedi');

const mocks = require('../../../mocks');

const error = require('../../../../lib/error');
const completedMerchantPaymentNotification = require('../fixtures/merch_pmt_completed.json');
const pendingMerchantPaymentNotification = require('../fixtures/merch_pmt_pending.json');
const billingAgreementCancelNotification = require('../fixtures/mp_cancel_successful.json');
const {
  PayPalNotificationHandler,
} = require('../../../../lib/routes/subscriptions/paypal-notifications');
const { PayPalHelper } = require('../../../../lib/payments/paypal');

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
  let sandbox;

  beforeEach(() => {
    config = {
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
    sinon.restore();
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

    it('handles an unknown request successfully', async () => {
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
      sinon.assert.calledWithExactly(log.debug, 'Unhandled Ipn message', {
        payload: ipnMessage,
      });
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

  describe('handleMerchPayment', () => {
    const message = {
      txn_type: 'merch_pmt',
      invoice: 'inv_000',
    };
    it('receives IPN message with successful payment status', async () => {
      const invoice = { status: 'open' };
      const paidInvoice = { status: 'paid' };
      stripeHelper.getInvoice = sinon.fake.resolves(invoice);
      stripeHelper.payInvoiceOutOfBand = sinon.fake.resolves(paidInvoice);
      const result = await handler.handleMerchPayment(
        completedMerchantPaymentNotification
      );
      assert.deepEqual(result, paidInvoice);
      sinon.assert.calledOnceWithExactly(
        stripeHelper.getInvoice,
        completedMerchantPaymentNotification.invoice
      );
      sinon.assert.calledOnceWithExactly(
        stripeHelper.payInvoiceOutOfBand,
        invoice
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
        completedMerchantPaymentNotification.txn_id
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
        completedMerchantPaymentNotification.txn_id
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
    };
    const customer = { id: '321' };
    const subscriptions = {
      data: [{ cancel_at_period_end: false, status: 'active' }],
    };

    it('receives IPN message with successful billing agreement cancelled and email sent', async () => {
      sandbox = sinon.createSandbox();

      const authDbModule = require('fxa-shared/db/models/auth');
      sandbox
        .stub(authDbModule, 'getPayPalBAByBAId')
        .resolves(billingAgreement);
      sandbox.stub(authDbModule, 'accountByUid').resolves(account);
      stripeHelper.customer = sinon.fake.resolves({
        ...customer,
        subscriptions,
      });
      stripeHelper.removeCustomerPaypalAgreement = sinon.fake.resolves({});
      stripeHelper.getPaymentProvider = sinon.fake.resolves('paypal');

      const result = await handler.handleMpCancel(
        billingAgreementCancelNotification
      );

      assert.isUndefined(result);
      sinon.assert.calledOnceWithExactly(
        authDbModule.getPayPalBAByBAId,
        billingAgreementCancelNotification.mp_id
      );
      sinon.assert.calledOnceWithExactly(
        authDbModule.accountByUid,
        billingAgreement.uid
      );
      sinon.assert.calledOnceWithExactly(stripeHelper.customer, {
        uid: account.uid,
        email: account.email,
      });
      sinon.assert.calledOnceWithExactly(
        stripeHelper.removeCustomerPaypalAgreement,
        account.uid,
        customer.id,
        billingAgreement.billingAgreementId
      );
      sinon.assert.calledOnceWithExactly(stripeHelper.getPaymentProvider, {
        ...customer,
        subscriptions,
      });

      sandbox.restore();
    });

    it('receives IPN message with billing agreement not found', async () => {
      sandbox = sinon.createSandbox();

      const authDbModule = require('fxa-shared/db/models/auth');
      sandbox.stub(authDbModule, 'getPayPalBAByBAId').resolves(undefined);

      const result = await handler.handleMpCancel(
        billingAgreementCancelNotification
      );

      assert.isUndefined(result);
      sinon.assert.calledOnceWithExactly(
        authDbModule.getPayPalBAByBAId,
        billingAgreementCancelNotification.mp_id
      );
      sinon.assert.calledOnce(log.error);

      sandbox.restore();
    });

    it('receives IPN message for billing agreement already cancelled', async () => {
      sandbox = sinon.createSandbox();

      const authDbModule = require('fxa-shared/db/models/auth');
      sandbox
        .stub(authDbModule, 'getPayPalBAByBAId')
        .returns({ ...billingAgreement, status: 'Cancelled' });

      const result = await handler.handleMpCancel(
        billingAgreementCancelNotification
      );

      assert.isUndefined(result);
      sinon.assert.calledOnceWithExactly(
        authDbModule.getPayPalBAByBAId,
        billingAgreementCancelNotification.mp_id
      );

      sandbox.restore();
    });

    it('receives IPN message for billing agreement with no FXA account', async () => {
      sandbox = sinon.createSandbox();

      const authDbModule = require('fxa-shared/db/models/auth');
      sandbox
        .stub(authDbModule, 'getPayPalBAByBAId')
        .resolves(billingAgreement);
      sandbox.stub(authDbModule, 'accountByUid').resolves(undefined);

      const result = await handler.handleMpCancel(
        billingAgreementCancelNotification
      );

      assert.isUndefined(result);
      sinon.assert.calledOnceWithExactly(
        authDbModule.getPayPalBAByBAId,
        billingAgreementCancelNotification.mp_id
      );
      sinon.assert.calledOnceWithExactly(
        authDbModule.accountByUid,
        billingAgreement.uid
      );
      sinon.assert.calledOnce(log.error);

      sandbox.restore();
    });

    it('receives IPN message for billing agreement with no Stripe customer', async () => {
      sandbox = sinon.createSandbox();

      const authDbModule = require('fxa-shared/db/models/auth');
      sandbox
        .stub(authDbModule, 'getPayPalBAByBAId')
        .resolves(billingAgreement);
      sandbox.stub(authDbModule, 'accountByUid').resolves(account);
      stripeHelper.customer = sinon.fake.resolves(undefined);

      const result = await handler.handleMpCancel(
        billingAgreementCancelNotification
      );

      assert.isUndefined(result);
      sinon.assert.calledOnceWithExactly(
        authDbModule.getPayPalBAByBAId,
        billingAgreementCancelNotification.mp_id
      );
      sinon.assert.calledOnceWithExactly(
        authDbModule.accountByUid,
        billingAgreement.uid
      );
      sinon.assert.calledOnceWithExactly(stripeHelper.customer, {
        uid: account.uid,
        email: account.email,
      });
      sinon.assert.calledOnce(log.error);

      sandbox.restore();
    });

    it('receives IPN message for inactive subscription and email not sent', async () => {
      sandbox = sinon.createSandbox();

      const authDbModule = require('fxa-shared/db/models/auth');
      sandbox
        .stub(authDbModule, 'getPayPalBAByBAId')
        .resolves(billingAgreement);
      sandbox.stub(authDbModule, 'accountByUid').resolves(account);
      stripeHelper.customer = sinon.fake.resolves({
        ...customer,
        subscriptions: undefined,
      });
      stripeHelper.removeCustomerPaypalAgreement = sinon.fake.resolves({});
      stripeHelper.getPaymentProvider = sinon.fake.resolves('paypal');

      const result = await handler.handleMpCancel(
        billingAgreementCancelNotification
      );

      assert.isUndefined(result);
      sinon.assert.calledOnceWithExactly(
        authDbModule.getPayPalBAByBAId,
        billingAgreementCancelNotification.mp_id
      );
      sinon.assert.calledOnceWithExactly(
        authDbModule.accountByUid,
        billingAgreement.uid
      );
      sinon.assert.calledOnceWithExactly(stripeHelper.customer, {
        uid: account.uid,
        email: account.email,
      });
      sinon.assert.calledOnceWithExactly(
        stripeHelper.removeCustomerPaypalAgreement,
        account.uid,
        customer.id,
        billingAgreement.billingAgreementId
      );
      sinon.assert.calledOnceWithExactly(stripeHelper.getPaymentProvider, {
        ...customer,
        subscriptions: undefined,
      });

      sandbox.restore();
    });
  });
});
