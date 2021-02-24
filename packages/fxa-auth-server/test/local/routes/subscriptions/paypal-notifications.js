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

  beforeEach(() => {
    config = {
      subscriptions: {
        enabled: true,
        stripeApiKey: 'sk_test_1234',
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
  });
});
