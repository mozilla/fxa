/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as uuid from 'uuid';
import { Container } from 'typedi';

const dbStub = {
  getPayPalBAByBAId: jest.fn(),
  Account: {} as any,
  updatePayPalBA: jest.fn(),
};

jest.mock('fxa-shared/db/models/auth', () => dbStub);

const mocks = require('../../../test/mocks');

const { AppError: error } = require('@fxa/accounts/errors');
const completedMerchantPaymentNotification = require('../../../test/local/routes/fixtures/merch_pmt_completed.json');
const pendingMerchantPaymentNotification = require('../../../test/local/routes/fixtures/merch_pmt_pending.json');
const billingAgreementCancelNotification = require('../../../test/local/routes/fixtures/mp_cancel_successful.json');

const { PayPalNotificationHandler } = require('./paypal-notifications');
const { PayPalHelper } = require('../../payments/paypal/helper');
const { CapabilityService } = require('../../payments/capability');

const { RefundType } = require('@fxa/payments/paypal');
const { SUBSCRIPTIONS_RESOURCE } = require('../../payments/stripe');

const ACCOUNT_LOCALE = 'en-US';
const TEST_EMAIL = 'test@email.com';
const UID = uuid.v4({}, Buffer.alloc(16)).toString('hex');

describe('PayPalNotificationHandler', () => {
  let config: any;
  let customs: any;
  let db: any;
  let handler: any;
  let log: any;
  let mailer: any;
  let paypalHelper: any;
  let profile: any;
  let push: any;
  let stripeHelper: any;

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
        unsupportedLocations: [],
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
      deleteCache: jest.fn(async (uid: any) => ({})),
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
    jest.clearAllMocks();
  });

  describe('handleIpnEvent', () => {
    it('handles a request successfully', () => {
      handler.verifyAndDispatchEvent = jest.fn().mockReturnValue({});
      const result = handler.handleIpnEvent({});
      expect(handler.verifyAndDispatchEvent).toHaveBeenCalledTimes(1);
      expect(handler.verifyAndDispatchEvent).toHaveBeenCalledWith({});
      expect(result).toEqual({});
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
      paypalHelper.verifyIpnMessage = jest.fn().mockResolvedValue(true);
      paypalHelper.extractIpnMessage = jest.fn().mockReturnValue(ipnMessage);
      handler.handleMerchPayment = jest.fn().mockResolvedValue({});
      const result = await handler.verifyAndDispatchEvent(request);
      expect(result).toEqual({});
      expect(paypalHelper.verifyIpnMessage).toHaveBeenCalledTimes(1);
      expect(paypalHelper.extractIpnMessage).toHaveBeenCalledTimes(1);
      expect(handler.handleMerchPayment).toHaveBeenCalledTimes(1);
      expect(handler.handleMerchPayment).toHaveBeenCalledWith(ipnMessage);
    });

    it('handles a mp_cancel request successfully', async () => {
      const request = {
        payload: 'samplepayload',
      };
      const ipnMessage = {
        txn_type: 'mp_cancel',
      };
      paypalHelper.verifyIpnMessage = jest.fn().mockResolvedValue(true);
      paypalHelper.extractIpnMessage = jest.fn().mockReturnValue(ipnMessage);
      handler.handleMpCancel = jest.fn().mockResolvedValue({});
      const result = await handler.verifyAndDispatchEvent(request);
      expect(result).toEqual({});
      expect(paypalHelper.verifyIpnMessage).toHaveBeenCalledTimes(1);
      expect(paypalHelper.extractIpnMessage).toHaveBeenCalledTimes(1);
      expect(handler.handleMpCancel).toHaveBeenCalledTimes(1);
      expect(handler.handleMpCancel).toHaveBeenCalledWith(ipnMessage);
    });

    it('handles an unknown IPN request successfully', async () => {
      const request = {
        payload: 'samplepayload',
      };
      const ipnMessage = {
        txn_type: 'other',
      };
      paypalHelper.verifyIpnMessage = jest.fn().mockResolvedValue(true);
      paypalHelper.extractIpnMessage = jest.fn().mockReturnValue(ipnMessage);
      handler.handleMerchPayment = jest.fn().mockResolvedValue({});
      const result = await handler.verifyAndDispatchEvent(request);
      expect(result).toEqual(false);
      expect(paypalHelper.verifyIpnMessage).toHaveBeenCalledTimes(1);
      expect(paypalHelper.extractIpnMessage).toHaveBeenCalledTimes(1);
      expect(log.info).toHaveBeenCalledWith('Unhandled Ipn message', {
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
      paypalHelper.verifyIpnMessage = jest.fn().mockResolvedValue(true);
      paypalHelper.extractIpnMessage = jest.fn().mockReturnValue(ipnMessage);
      handler.handleMerchPayment = jest.fn().mockResolvedValue({});
      const result = await handler.verifyAndDispatchEvent(request);
      expect(result).toEqual(false);
      expect(paypalHelper.verifyIpnMessage).toHaveBeenCalledTimes(1);
      expect(paypalHelper.extractIpnMessage).toHaveBeenCalledTimes(1);
    });

    it('handles an invalid request successfully', async () => {
      const request = {
        payload: 'samplepayload',
      };
      paypalHelper.verifyIpnMessage = jest.fn().mockResolvedValue(false);
      const result = await handler.verifyAndDispatchEvent(request);
      expect(result).toEqual(false);
      expect(paypalHelper.verifyIpnMessage).toHaveBeenCalledTimes(1);
      expect(log.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleSuccessfulPayment', () => {
    const ipnTransactionId = 'ipn_id_123';
    const validMessage = {
      txn_id: ipnTransactionId,
    };
    const validInvoice = {
      id: 'inv_123',
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
      stripeHelper.getInvoicePaypalTransactionId = jest
        .fn()
        .mockReturnValue(ipnTransactionId);
      stripeHelper.payInvoiceOutOfBand = jest
        .fn()
        .mockResolvedValue(paidInvoice);
      paypalHelper.issueRefund = jest.fn().mockResolvedValue(refundReturn);
    });

    it('should update invoice to paid', async () => {
      const invoice = validInvoice;
      const message = validMessage;

      const result = await handler.handleSuccessfulPayment(invoice, message);

      expect(result).toEqual(paidInvoice);
      expect(stripeHelper.payInvoiceOutOfBand).toHaveBeenCalledTimes(1);
      expect(stripeHelper.payInvoiceOutOfBand).toHaveBeenCalledWith(invoice);
      expect(paypalHelper.issueRefund).not.toHaveBeenCalled();
    });

    it('should update Invoice with paypalTransactionId if not already there', async () => {
      const invoice = {
        subscription: {
          status: 'active',
        },
      };
      const message = validMessage;
      stripeHelper.getInvoicePaypalTransactionId = jest
        .fn()
        .mockReturnValue(undefined);
      stripeHelper.updateInvoiceWithPaypalTransactionId = jest
        .fn()
        .mockResolvedValue(validInvoice);

      const result = await handler.handleSuccessfulPayment(invoice, message);

      expect(result).toEqual(paidInvoice);
      expect(
        stripeHelper.updateInvoiceWithPaypalTransactionId
      ).toHaveBeenCalledTimes(1);
      expect(
        stripeHelper.updateInvoiceWithPaypalTransactionId
      ).toHaveBeenCalledWith(invoice, ipnTransactionId);
      expect(stripeHelper.payInvoiceOutOfBand).toHaveBeenCalledTimes(1);
      expect(stripeHelper.payInvoiceOutOfBand).toHaveBeenCalledWith(invoice);
      expect(paypalHelper.issueRefund).not.toHaveBeenCalled();
    });

    it('should throw an error when paypalTransactionId and IPN txn_id dont match', async () => {
      const invoice = validInvoice;
      const message = {
        txn_id: 'notcorrect',
      };

      try {
        await handler.handleSuccessfulPayment(invoice, message);
        throw new Error(
          'Error should throw error with transactionId not matching'
        );
      } catch (err: any) {
        expect(err).toEqual(
          error.internalValidationError('handleSuccessfulPayment', {
            message:
              'Invoice paypalTransactionId does not match Paypal IPN txn_id',
            invoiceId: invoice.id,
            paypalIPNTxnId: message.txn_id,
          })
        );
        expect(stripeHelper.payInvoiceOutOfBand).not.toHaveBeenCalled();
        expect(paypalHelper.issueRefund).not.toHaveBeenCalled();
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
      stripeHelper.expandResource = jest.fn();

      const result = await handler.handleSuccessfulPayment(invoice, message);

      expect(result).toEqual(refundReturn);
      expect(paypalHelper.issueRefund).toHaveBeenCalledTimes(1);
      expect(paypalHelper.issueRefund).toHaveBeenCalledWith(
        invoice,
        validMessage.txn_id,
        RefundType.Full
      );
      expect(stripeHelper.expandResource).not.toHaveBeenCalled();
      expect(stripeHelper.payInvoiceOutOfBand).not.toHaveBeenCalled();
    });

    it('should expand subscription and refund the invoice if the subscription has status canceled', async () => {
      const invoice = {
        metadata: {
          paypalTransactionId: ipnTransactionId,
        },
        subscription: 'sub_id',
      };
      const message = validMessage;
      stripeHelper.expandResource = jest
        .fn()
        .mockResolvedValue({ status: 'canceled' });

      const result = await handler.handleSuccessfulPayment(invoice, message);

      expect(result).toEqual(refundReturn);
      expect(paypalHelper.issueRefund).toHaveBeenCalledTimes(1);
      expect(paypalHelper.issueRefund).toHaveBeenCalledWith(
        invoice,
        validMessage.txn_id,
        RefundType.Full
      );
      expect(stripeHelper.expandResource).toHaveBeenCalledTimes(1);
      expect(stripeHelper.expandResource).toHaveBeenCalledWith(
        invoice.subscription,
        SUBSCRIPTIONS_RESOURCE
      );
      expect(stripeHelper.payInvoiceOutOfBand).not.toHaveBeenCalled();
    });
  });

  describe('handleMerchPayment', () => {
    const message = {
      txn_type: 'merch_pmt',
      invoice: 'inv_000',
      payment_status: 'Completed',
    };
    it('receives IPN message with successful payment status', async () => {
      const invoice = { status: 'open' };
      const paidInvoice = { status: 'paid' };
      stripeHelper.getInvoice = jest.fn().mockResolvedValue(invoice);
      handler.handleSuccessfulPayment = jest
        .fn()
        .mockResolvedValue(paidInvoice);

      const result = await handler.handleMerchPayment(
        completedMerchantPaymentNotification
      );
      expect(result).toEqual(paidInvoice);
      expect(stripeHelper.getInvoice).toHaveBeenCalledTimes(1);
      expect(stripeHelper.getInvoice).toHaveBeenCalledWith(
        completedMerchantPaymentNotification.invoice
      );
      expect(handler.handleSuccessfulPayment).toHaveBeenCalledTimes(1);
      expect(handler.handleSuccessfulPayment).toHaveBeenCalledWith(
        invoice,
        completedMerchantPaymentNotification
      );
    });

    it('receives IPN message with pending payment status', async () => {
      const invoice = { status: 'open' };
      stripeHelper.getInvoice = jest.fn().mockResolvedValue(invoice);
      const result = await handler.handleMerchPayment(
        pendingMerchantPaymentNotification
      );
      expect(result).toEqual(undefined);
      expect(stripeHelper.getInvoice).toHaveBeenCalledTimes(1);
      expect(stripeHelper.getInvoice).toHaveBeenCalledWith(
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
      stripeHelper.getInvoice = jest.fn().mockResolvedValue(invoice);
      try {
        await handler.handleMerchPayment(deniedMessage);
        throw new Error('Error should throw no idempotency key response.');
      } catch (err: any) {
        expect(err).toEqual(
          error.internalValidationError('handleMerchPayment', {
            message: 'No idempotency key on PayPal transaction',
          })
        );
      }
      expect(stripeHelper.getInvoice).toHaveBeenCalledTimes(1);
      expect(stripeHelper.getInvoice).toHaveBeenCalledWith(message.invoice);
      expect(log.error).toHaveBeenCalledTimes(1);
    });

    it('receives IPN message with unexpected payment status', async () => {
      const invoice = { status: 'open' };
      stripeHelper.getInvoice = jest.fn().mockResolvedValue(invoice);
      try {
        await handler.handleMerchPayment({
          ...message,
          payment_status: undefined,
        });
        throw new Error(
          'Error should throw invoice not in correct status response.'
        );
      } catch (err: any) {
        expect(err).toEqual(
          error.internalValidationError('handleMerchPayment', {
            message: 'Unexpected PayPal payment status',
            transactionResponse: undefined,
          })
        );
      }
      expect(stripeHelper.getInvoice).toHaveBeenCalledTimes(1);
      expect(stripeHelper.getInvoice).toHaveBeenCalledWith(message.invoice);
      expect(log.error).toHaveBeenCalledTimes(1);
    });

    it('receives IPN message with invoice not found', async () => {
      stripeHelper.getInvoice = jest.fn().mockResolvedValue(undefined);
      try {
        await handler.handleMerchPayment(message);
        throw new Error('Error should throw invoice not found response.');
      } catch (err: any) {
        expect(err).toEqual(
          error.internalValidationError('handleMerchPayment', {
            message: 'Invoice not found',
          })
        );
      }
      expect(stripeHelper.getInvoice).toHaveBeenCalledTimes(1);
      expect(stripeHelper.getInvoice).toHaveBeenCalledWith(message.invoice);
      expect(log.error).toHaveBeenCalledTimes(1);
    });

    it('receives IPN message with invoice not in draft or open status', async () => {
      const invoice = { status: null };
      stripeHelper.getInvoice = jest.fn().mockResolvedValue(invoice);
      const result = await handler.handleMerchPayment(message);
      expect(result).toEqual(undefined);
      expect(stripeHelper.getInvoice).toHaveBeenCalledTimes(1);
      expect(stripeHelper.getInvoice).toHaveBeenCalledWith(message.invoice);
    });

    it('successfully refunds completed transaction with invoice in uncollectible status', async () => {
      const invoice = { status: 'uncollectible' };
      stripeHelper.getInvoice = jest.fn().mockResolvedValue(invoice);
      paypalHelper.issueRefund = jest.fn().mockResolvedValue(undefined);

      const result = await handler.handleMerchPayment(
        completedMerchantPaymentNotification
      );
      expect(result).toEqual(undefined);
      expect(stripeHelper.getInvoice).toHaveBeenCalledTimes(1);
      expect(stripeHelper.getInvoice).toHaveBeenCalledWith(message.invoice);
      expect(paypalHelper.issueRefund).toHaveBeenCalledTimes(1);
      expect(paypalHelper.issueRefund).toHaveBeenCalledWith(
        invoice,
        completedMerchantPaymentNotification.txn_id,
        RefundType.Full
      );
    });

    it('unsuccessfully refunds completed transaction with invoice in uncollectible status', async () => {
      const invoice = { status: 'uncollectible' };
      stripeHelper.getInvoice = jest.fn().mockResolvedValue(invoice);
      paypalHelper.issueRefund = jest.fn().mockImplementation(() => {
        throw error.internalValidationError('Fake', {});
      });
      try {
        await handler.handleMerchPayment(completedMerchantPaymentNotification);
        throw new Error(
          'Error should throw PayPal refund transaction unsuccessful.'
        );
      } catch (err: any) {
        expect(err).toBeInstanceOf(error);
        expect(err.message).toBe('An internal validation check failed.');
      }
      expect(stripeHelper.getInvoice).toHaveBeenCalledTimes(1);
      expect(stripeHelper.getInvoice).toHaveBeenCalledWith(message.invoice);
      expect(paypalHelper.issueRefund).toHaveBeenCalledTimes(1);
      expect(paypalHelper.issueRefund).toHaveBeenCalledWith(
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
      stripeHelper.removeCustomerPaypalAgreement = jest
        .fn()
        .mockResolvedValue(undefined);
      stripeHelper.getCustomerPaypalAgreement = jest
        .fn()
        .mockReturnValue(ipnBillingAgreement.billingAgreementId);

      const result = await handler.removeBillingAgreement(
        customer,
        ipnBillingAgreement,
        account
      );

      expect(result).toBeUndefined();
      expect(stripeHelper.removeCustomerPaypalAgreement).toHaveBeenCalledTimes(
        1
      );
      expect(stripeHelper.removeCustomerPaypalAgreement).toHaveBeenCalledWith(
        account.uid,
        customer.id,
        ipnBillingAgreement.billingAgreementId
      );
    });

    it('should only update the database BA if the IPN and Customer BA ID dont match', async () => {
      dbStub.updatePayPalBA.mockResolvedValue();
      stripeHelper.getCustomerPaypalAgreement = jest
        .fn()
        .mockReturnValue(undefined);

      const result = await handler.removeBillingAgreement(
        customer,
        ipnBillingAgreement,
        account
      );

      expect(result).toBeUndefined();
      expect(dbStub.updatePayPalBA).toHaveBeenCalledTimes(1);
      expect(dbStub.updatePayPalBA.mock.calls[0][0]).toBe(account.uid);
      expect(dbStub.updatePayPalBA.mock.calls[0][1]).toBe(
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
      dbStub.getPayPalBAByBAId.mockResolvedValue(billingAgreement);
      dbStub.Account.findByUid = jest.fn().mockResolvedValue(account);
      stripeHelper.fetchCustomer = jest.fn().mockResolvedValue(fetchCustomer);
      handler.removeBillingAgreement = jest.fn().mockResolvedValue();
      stripeHelper.getPaymentProvider = jest.fn().mockResolvedValue('paypal');
      stripeHelper.formatSubscriptionsForEmails = jest.fn().mockReturnValue([]);

      const result = await handler.handleMpCancel(
        billingAgreementCancelNotification
      );

      expect(result).toBeUndefined();
      expect(dbStub.getPayPalBAByBAId).toHaveBeenCalledTimes(1);
      expect(dbStub.getPayPalBAByBAId).toHaveBeenCalledWith(
        billingAgreementCancelNotification.mp_id
      );
      expect(dbStub.Account.findByUid).toHaveBeenCalledTimes(1);
      expect(dbStub.Account.findByUid).toHaveBeenCalledWith(
        billingAgreement.uid,
        { include: ['emails'] }
      );
      expect(stripeHelper.fetchCustomer).toHaveBeenCalledTimes(1);
      expect(stripeHelper.fetchCustomer).toHaveBeenCalledWith(account.uid, [
        'subscriptions',
      ]);
      expect(handler.removeBillingAgreement).toHaveBeenCalledTimes(1);
      expect(handler.removeBillingAgreement).toHaveBeenCalledWith(
        fetchCustomer,
        billingAgreement,
        account
      );
      expect(stripeHelper.getPaymentProvider).toHaveBeenCalledTimes(1);
      expect(stripeHelper.getPaymentProvider).toHaveBeenCalledWith(
        fetchCustomer
      );
    });

    it('receives IPN message with billing agreement not found', async () => {
      dbStub.getPayPalBAByBAId.mockResolvedValue(undefined);

      const result = await handler.handleMpCancel(
        billingAgreementCancelNotification
      );

      expect(result).toBeUndefined();
      expect(dbStub.getPayPalBAByBAId).toHaveBeenCalledTimes(1);
      expect(dbStub.getPayPalBAByBAId).toHaveBeenCalledWith(
        billingAgreementCancelNotification.mp_id
      );
      expect(log.error).toHaveBeenCalledTimes(1);
    });

    it('receives IPN message for billing agreement already cancelled', async () => {
      dbStub.getPayPalBAByBAId.mockResolvedValue({
        ...billingAgreement,
        status: 'Cancelled',
      });

      const result = await handler.handleMpCancel(
        billingAgreementCancelNotification
      );

      expect(result).toBeUndefined();
      expect(dbStub.getPayPalBAByBAId).toHaveBeenCalledTimes(1);
      expect(dbStub.getPayPalBAByBAId).toHaveBeenCalledWith(
        billingAgreementCancelNotification.mp_id
      );
      expect(log.error).toHaveBeenCalledTimes(1);
    });

    it('receives IPN message for billing agreement with no FXA account', async () => {
      dbStub.getPayPalBAByBAId.mockResolvedValue(billingAgreement);
      dbStub.Account.findByUid = jest.fn().mockResolvedValue(null);

      const result = await handler.handleMpCancel(
        billingAgreementCancelNotification
      );

      expect(result).toBeUndefined();
      expect(dbStub.getPayPalBAByBAId).toHaveBeenCalledTimes(1);
      expect(dbStub.getPayPalBAByBAId).toHaveBeenCalledWith(
        billingAgreementCancelNotification.mp_id
      );
      expect(dbStub.Account.findByUid).toHaveBeenCalledTimes(1);
      expect(dbStub.Account.findByUid).toHaveBeenCalledWith(
        billingAgreement.uid,
        { include: ['emails'] }
      );
      expect(log.error).toHaveBeenCalledTimes(1);
    });

    it('receives IPN message for billing agreement with no Stripe customer', async () => {
      dbStub.getPayPalBAByBAId.mockResolvedValue(billingAgreement);
      dbStub.Account.findByUid = jest.fn().mockResolvedValue(account);
      stripeHelper.fetchCustomer = jest.fn().mockResolvedValue(undefined);

      const result = await handler.handleMpCancel(
        billingAgreementCancelNotification
      );

      expect(result).toBeUndefined();
      expect(dbStub.getPayPalBAByBAId).toHaveBeenCalledTimes(1);
      expect(dbStub.getPayPalBAByBAId).toHaveBeenCalledWith(
        billingAgreementCancelNotification.mp_id
      );
      expect(dbStub.Account.findByUid).toHaveBeenCalledTimes(1);
      expect(dbStub.Account.findByUid).toHaveBeenCalledWith(
        billingAgreement.uid,
        { include: ['emails'] }
      );
      expect(stripeHelper.fetchCustomer).toHaveBeenCalledTimes(1);
      expect(stripeHelper.fetchCustomer).toHaveBeenCalledWith(account.uid, [
        'subscriptions',
      ]);
      expect(log.error).toHaveBeenCalledTimes(1);
    });

    it('receives IPN message for inactive subscription and email not sent', async () => {
      const fetchCustomer = {
        ...customer,
        subscriptions: undefined,
      };
      dbStub.getPayPalBAByBAId.mockResolvedValue(billingAgreement);
      dbStub.Account.findByUid = jest.fn().mockResolvedValue(account);
      stripeHelper.fetchCustomer = jest.fn().mockResolvedValue(fetchCustomer);
      handler.removeBillingAgreement = jest.fn().mockResolvedValue();
      stripeHelper.getPaymentProvider = jest.fn().mockResolvedValue('paypal');

      const result = await handler.handleMpCancel(
        billingAgreementCancelNotification
      );

      expect(result).toBeUndefined();
      expect(dbStub.getPayPalBAByBAId).toHaveBeenCalledTimes(1);
      expect(dbStub.getPayPalBAByBAId).toHaveBeenCalledWith(
        billingAgreementCancelNotification.mp_id
      );
      expect(dbStub.Account.findByUid).toHaveBeenCalledTimes(1);
      expect(dbStub.Account.findByUid).toHaveBeenCalledWith(
        billingAgreement.uid,
        { include: ['emails'] }
      );
      expect(stripeHelper.fetchCustomer).toHaveBeenCalledTimes(1);
      expect(stripeHelper.fetchCustomer).toHaveBeenCalledWith(account.uid, [
        'subscriptions',
      ]);
      expect(handler.removeBillingAgreement).toHaveBeenCalledTimes(1);
      expect(handler.removeBillingAgreement).toHaveBeenCalledWith(
        fetchCustomer,
        billingAgreement,
        account
      );
      expect(await stripeHelper.getPaymentProvider).toHaveBeenCalledTimes(1);
      expect(await stripeHelper.getPaymentProvider).toHaveBeenCalledWith(
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
      dbStub.getPayPalBAByBAId.mockResolvedValue(billingAgreement);
      dbStub.Account.findByUid = jest.fn().mockResolvedValue(mockAcct);
      stripeHelper.fetchCustomer = jest.fn().mockResolvedValue(mockCustomer);
      handler.removeBillingAgreement = jest.fn().mockResolvedValue();
      stripeHelper.getPaymentProvider = jest.fn().mockReturnValue('paypal');
      stripeHelper.formatSubscriptionsForEmails = jest
        .fn()
        .mockResolvedValue(mockFormattedSubs);
      mailer.sendSubscriptionPaymentProviderCancelledEmail = jest
        .fn()
        .mockResolvedValue(undefined);

      await handler.handleMpCancel(billingAgreementCancelNotification);

      expect(stripeHelper.formatSubscriptionsForEmails).toHaveBeenCalledTimes(
        1
      );
      expect(stripeHelper.formatSubscriptionsForEmails).toHaveBeenCalledWith(
        mockCustomer
      );
      expect(
        mailer.sendSubscriptionPaymentProviderCancelledEmail
      ).toHaveBeenCalledTimes(1);
      expect(
        mailer.sendSubscriptionPaymentProviderCancelledEmail
      ).toHaveBeenCalledWith(mockAcct.emails, mockAcct, {
        uid: mockAcct.uid,
        email: mockAcct.email,
        acceptLanguage: mockAcct.locale,
        subscriptions: mockFormattedSubs,
      });

      jest.restoreAllMocks();
    });
  });
});
