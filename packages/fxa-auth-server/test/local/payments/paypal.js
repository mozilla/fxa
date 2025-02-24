/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const { StatsD } = require('hot-shots');
const sinon = require('sinon');
const { Container } = require('typedi');

const {
  PayPalClient,
  PayPalClientError,
  PayPalNVPError,
  RefundType,
  objectToNVP,
  nvpToObject,
} = require('@fxa/payments/paypal');
const { PayPalHelper, RefusedError } = require('../../../lib/payments/paypal');
const { mockLog } = require('../../mocks');
const error = require('../../../lib/error');
const successfulSetExpressCheckoutResponse = require('./fixtures/paypal/set_express_checkout_success.json');
const successfulDoReferenceTransactionResponse = require('./fixtures/paypal/do_reference_transaction_success.json');
const successfulRefundTransactionResponse = require('./fixtures/paypal/refund_transaction_success.json');
const failedDoReferenceTransactionResponse = require('./fixtures/paypal/do_reference_transaction_failure.json');
const successfulBAUpdateResponse = require('./fixtures/paypal/ba_update_success.json');
const searchTransactionResponse = require('./fixtures/paypal/transaction_search_success.json');
const eventCustomerSourceExpiring = require('./fixtures/stripe/event_customer_source_expiring.json');
const sampleIpnMessage = require('./fixtures/paypal/sample_ipn_message.json');
const { StripeHelper } = require('../../../lib/payments/stripe');
const { CurrencyHelper } = require('../../../lib/payments/currencies');
const {
  PAYPAL_BILLING_AGREEMENT_INVALID,
  PAYPAL_APP_ERRORS,
  PAYPAL_RETRY_ERRORS,
} = require('../../../lib/payments/paypal/error-codes');
const { RefundError } = require('../../../lib/payments/paypal/helper');

describe('PayPalHelper', () => {
  /** @type PayPalHelper */
  let paypalHelper;
  let mockStripeHelper;

  const chargeId = 'ch_1GVm24BVqmGyQTMaUhRAfUmA';
  const sourceId = eventCustomerSourceExpiring.data.object.id;
  const mockInvoice = {
    id: 'inv_0000000000',
    number: '1234567',
    charge: chargeId,
    default_source: { id: sourceId },
    total: 1234,
    currency: 'usd',
    period_end: 1587426018,
    customer_shipping: { address: { country: 'US' } },
    lines: {
      data: [
        {
          period: { end: 1590018018 },
        },
      ],
    },
  };

  const mockCustomer = {
    invoice_settings: {
      default_payment_method: {},
    },
    metadata: {
      userid: 'test1234',
    },
  };

  const mockConfig = {
    currenciesToCountries: { ZAR: ['AS', 'CA'] },
  };

  /**
   * To prevent the modification of the test objects loaded, which can impact other tests referencing the object,
   * a deep copy of the object can be created which uses the test object as a template
   *
   * @param {Object} object
   */
  function deepCopy(object) {
    return JSON.parse(JSON.stringify(object));
  }

  beforeEach(() => {
    // Make StripeHelper
    mockStripeHelper = {};
    Container.set(StripeHelper, mockStripeHelper);
    // Make StatsD
    const statsd = { increment: sinon.spy(), timing: sinon.spy() };
    Container.set(StatsD, statsd);
    // Make PayPalClient
    const paypalClient = new PayPalClient(
      {
        user: 'user',
        sandbox: true,
        pwd: 'pwd',
        signature: 'sig',
      },
      statsd
    );
    Container.set(PayPalClient, paypalClient);
    // Make currencyHelper
    const currencyHelper = new CurrencyHelper(mockConfig);
    Container.set(CurrencyHelper, currencyHelper);
    // Make PayPalHelper
    paypalHelper = new PayPalHelper({ log: mockLog });
  });

  afterEach(() => {
    Container.reset();
  });

  describe('constructor', () => {
    it('sets client, statsd, logger, and currencyHelper', () => {
      const statsd = { increment: sinon.spy(), timing: sinon.spy() };
      const paypalClient = new PayPalClient(
        {
          user: 'user',
          sandbox: true,
          pwd: 'pwd',
          signature: 'sig',
        },
        statsd
      );
      Container.set(PayPalClient, paypalClient);
      Container.set(StatsD, statsd);

      const pph = new PayPalHelper({ log: mockLog, config: mockConfig });
      assert.equal(pph.client, paypalClient);
      assert.equal(pph.log, mockLog);
      assert.equal(pph.metrics, statsd);

      const expectedCurrencyHelper = new CurrencyHelper(mockConfig);
      assert.deepEqual(pph.currencyHelper, expectedCurrencyHelper);
    });
  });

  describe('generateIdempotencyKey', () => {
    const invoiceId = 'inv_000';
    const paymentAttempt = 0;

    it('successfully creates an idempotency key', async () => {
      const result = paypalHelper.generateIdempotencyKey(
        invoiceId,
        paymentAttempt
      );
      assert.equal(result, invoiceId + '-' + paymentAttempt);
    });
  });

  describe('generateIdempotencyKey', () => {
    const invoiceId = 'inv_000';
    const paymentAttempt = 0;

    it('successfully parses an idempotency key', async () => {
      const result = paypalHelper.parseIdempotencyKey(
        invoiceId + '-' + paymentAttempt
      );
      assert.deepEqual(result, {
        invoiceId,
        paymentAttempt: paymentAttempt + 1,
      });
    });
  });

  describe('getCheckoutToken', () => {
    const validOptions = { currencyCode: 'USD' };

    it('it returns the token from doRequest', async () => {
      paypalHelper.client.doRequest = sinon.fake.resolves(
        successfulSetExpressCheckoutResponse
      );
      const token = await paypalHelper.getCheckoutToken(validOptions);
      assert.equal(token, successfulSetExpressCheckoutResponse.TOKEN);
    });

    it('if doRequest unsuccessful, throws an error', async () => {
      const nvpError = new PayPalNVPError(
        'Fake',
        {},
        { message: 'oh no', errorCode: 123 }
      );
      paypalHelper.client.doRequest = sinon.fake.throws(
        new PayPalClientError([nvpError], 'hi', {})
      );
      try {
        await paypalHelper.getCheckoutToken(validOptions);
        assert.fail('Request should have thrown an error.');
      } catch (err) {
        assert.instanceOf(err, PayPalClientError);
        assert.equal(err.name, 'PayPalClientError');
      }
    });

    it('calls setExpressCheckout with passed options', async () => {
      paypalHelper.client.setExpressCheckout = sinon.fake.resolves(
        successfulSetExpressCheckoutResponse
      );
      const currencyCode = 'EUR';
      await paypalHelper.getCheckoutToken({ currencyCode });
      sinon.assert.calledOnceWithExactly(
        paypalHelper.client.setExpressCheckout,
        { currencyCode }
      );
    });
  });

  describe('createBillingAgreement', () => {
    const validOptions = {
      token: 'insert_token_value_here',
    };

    const expectedResponse = {
      BILLINGAGREEMENTID: 'B-7FB31251F28061234',
      ACK: 'Success',
    };

    it('calls createBillingAgreement with passed options', async () => {
      paypalHelper.client.createBillingAgreement =
        sinon.fake.resolves(expectedResponse);
      const response = await paypalHelper.createBillingAgreement(validOptions);
      sinon.assert.calledOnceWithExactly(
        paypalHelper.client.createBillingAgreement,
        validOptions
      );
      assert.equal(response, 'B-7FB31251F28061234');
    });
  });

  describe('chargeCustomer', () => {
    const validOptions = {
      amountInCents: 1099,
      billingAgreementId: 'B-12345',
      currencyCode: 'usd',
      countryCode: 'US',
      invoiceNumber: 'in_asdf',
      idempotencyKey: ' in_asdf-0',
    };

    it('calls doReferenceTransaction with options and amount converted to string', async () => {
      paypalHelper.client.doReferenceTransaction = sinon.fake.resolves(
        successfulDoReferenceTransactionResponse
      );
      await paypalHelper.chargeCustomer(validOptions);
      const expectedOptions = {
        amount:
          paypalHelper.currencyHelper.getPayPalAmountStringFromAmountInCents(
            validOptions.amountInCents
          ),
        billingAgreementId: validOptions.billingAgreementId,
        invoiceNumber: validOptions.invoiceNumber,
        idempotencyKey: validOptions.idempotencyKey,
        currencyCode: validOptions.currencyCode,
        countryCode: validOptions.countryCode,
      };
      assert.ok(
        paypalHelper.client.doReferenceTransaction.calledOnceWith(
          expectedOptions
        )
      );
    });

    it('it returns the data from doRequest', async () => {
      const expectedResponse = {
        amount: '1555555.99',
        avsCode: '',
        cvv2Match: '',
        orderTime: '2021-01-25T17:02:15Z',
        parentTransactionId: 'PAYID-MAHPTFI9KG0531222783101E',
        paymentStatus: 'Completed',
        paymentType: 'instant',
        pendingReason: 'None',
        reasonCode: 'None',
        transactionId: '51E835834L664664K',
        transactionType: 'merchtpmt',
      };
      paypalHelper.client.doRequest = sinon.fake.resolves(
        successfulDoReferenceTransactionResponse
      );
      const response = await paypalHelper.chargeCustomer(validOptions);
      assert.deepEqual(response, expectedResponse);
    });

    it('calls doReferenceTransaction with taxAmount option and taxAmount converted to string', async () => {
      const options = deepCopy(validOptions);
      options.taxAmountInCents = '500';
      paypalHelper.client.doReferenceTransaction = sinon.fake.resolves(
        successfulDoReferenceTransactionResponse
      );
      await paypalHelper.chargeCustomer(options);
      const expectedOptions = {
        amount:
          paypalHelper.currencyHelper.getPayPalAmountStringFromAmountInCents(
            options.amountInCents
          ),
        billingAgreementId: options.billingAgreementId,
        invoiceNumber: options.invoiceNumber,
        idempotencyKey: options.idempotencyKey,
        currencyCode: options.currencyCode,
        countryCode: options.countryCode,
        taxAmount:
          paypalHelper.currencyHelper.getPayPalAmountStringFromAmountInCents(
            options.taxAmountInCents
          ),
      };
      assert.ok(
        paypalHelper.client.doReferenceTransaction.calledOnceWith(
          expectedOptions
        )
      );
    });

    it('if doRequest unsuccessful, throws an error', async () => {
      const nvpError = new PayPalNVPError(
        'Fake',
        {},
        { message: 'oh no', errorCode: 123 }
      );
      paypalHelper.client.doRequest = sinon.fake.throws(
        new PayPalClientError([nvpError], 'hi', {})
      );
      try {
        await paypalHelper.chargeCustomer(validOptions);
        assert.fail('Request should have thrown an error.');
      } catch (err) {
        assert.instanceOf(err, PayPalClientError);
        assert.equal(err.name, 'PayPalClientError');
      }
    });
  });

  describe('refundTransaction', () => {
    const defaultData = {
      MSGSUBID: 'in_asdf',
      TRANSACTIONID: '9EG80664Y1384290G',
      REFUNDTYPE: 'Full',
    };

    it('refunds entire transaction', async () => {
      paypalHelper.client.doRequest = sinon.fake.resolves(
        successfulRefundTransactionResponse
      );
      const response = await paypalHelper.refundTransaction({
        idempotencyKey: defaultData.MSGSUBID,
        transactionId: defaultData.TRANSACTIONID,
        refundType: RefundType.Full,
      });
      assert.deepEqual(response, {
        pendingReason: successfulRefundTransactionResponse.PENDINGREASON,
        refundStatus: successfulRefundTransactionResponse.REFUNDSTATUS,
        refundTransactionId:
          successfulRefundTransactionResponse.REFUNDTRANSACTIONID,
      });
      sinon.assert.calledOnceWithExactly(
        paypalHelper.client.doRequest,
        'RefundTransaction',
        defaultData
      );
    });

    it('refunds partial transaction', async () => {
      paypalHelper.client.doRequest = sinon.fake.resolves(
        successfulRefundTransactionResponse
      );
      const response = await paypalHelper.refundTransaction({
        idempotencyKey: defaultData.MSGSUBID,
        transactionId: defaultData.TRANSACTIONID,
        refundType: RefundType.Partial,
        amount: 123,
      });
      assert.deepEqual(response, {
        pendingReason: successfulRefundTransactionResponse.PENDINGREASON,
        refundStatus: successfulRefundTransactionResponse.REFUNDSTATUS,
        refundTransactionId:
          successfulRefundTransactionResponse.REFUNDTRANSACTIONID,
      });
      sinon.assert.calledOnceWithExactly(
        paypalHelper.client.doRequest,
        'RefundTransaction',
        { ...defaultData, REFUNDTYPE: 'Partial', AMT: '1.23' }
      );
    });

    it('throws a RefusedError when a refund is refused', async () => {
      const nvpError = new PayPalNVPError(
        'Fake',
        {
          ACK: 'Failure',
          L: [
            {
              ERRORCODE: '10009',
              SHORTMESSAGE: 'Transaction refused',
              LONGMESSAGE: 'This transaction already has a chargeback filed',
            },
          ],
        },
        {
          message: 'This transaction already has a chargeback filed',
          errorCode: 10009,
        }
      );
      paypalHelper.client.refundTransaction = sinon.fake.rejects(
        new PayPalClientError([nvpError], 'hi', {
          ACK: 'Failure',
          L: [
            {
              ERRORCODE: '10009',
              SHORTMESSAGE: 'Transaction refused',
              LONGMESSAGE: 'This transaction already has a chargeback filed',
            },
          ],
        })
      );
      try {
        await paypalHelper.refundTransaction({
          idempotencyKey: defaultData.MSGSUBID,
          transactionId: defaultData.TRANSACTIONID,
        });
        assert.fail('Request should have thrown an error.');
      } catch (err) {
        assert.instanceOf(err, RefusedError);
        assert.equal(err.message, 'Transaction refused');
        assert.equal(err.errorCode, '10009');
      }
    });
  });

  describe('issueRefund', () => {
    const invoice = { id: 'inv_025-abc-3' };
    const transactionId = '9EG80664Y1384290G';

    it('successfully refunds completed transaction', async () => {
      mockStripeHelper.updateInvoiceWithPaypalRefundTransactionId =
        sinon.fake.resolves({});
      paypalHelper.refundTransaction = sinon.fake.resolves({
        pendingReason: successfulRefundTransactionResponse.PENDINGREASON,
        refundStatus: successfulRefundTransactionResponse.REFUNDSTATUS,
        refundTransactionId:
          successfulRefundTransactionResponse.REFUNDTRANSACTIONID,
      });
      const result = await paypalHelper.issueRefund(
        invoice,
        transactionId,
        RefundType.Full
      );

      assert.deepEqual(result, undefined);
      sinon.assert.calledOnceWithExactly(paypalHelper.refundTransaction, {
        idempotencyKey: invoice.id,
        transactionId: transactionId,
        refundType: RefundType.Full,
        amount: undefined,
      });
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.updateInvoiceWithPaypalRefundTransactionId,
        invoice,
        successfulRefundTransactionResponse.REFUNDTRANSACTIONID
      );
    });

    it('unsuccessfully refunds completed transaction', async () => {
      mockStripeHelper.updateInvoiceWithPaypalRefundTransactionId =
        sinon.fake.resolves({});
      paypalHelper.refundTransaction = sinon.fake.resolves({
        pendingReason: successfulRefundTransactionResponse.PENDINGREASON,
        refundStatus: 'None',
        refundTransactionId:
          successfulRefundTransactionResponse.REFUNDTRANSACTIONID,
      });
      paypalHelper.log = { error: sinon.fake.returns({}) };

      try {
        await paypalHelper.issueRefund(invoice, transactionId, RefundType.Full);
        assert.fail(
          'Error should throw PayPal refund transaction unsuccessful.'
        );
      } catch (err) {
        assert.deepEqual(
          err,
          error.internalValidationError('issueRefund', {
            message: 'PayPal refund transaction unsuccessful',
          })
        );
      }
      sinon.assert.calledOnceWithExactly(paypalHelper.refundTransaction, {
        idempotencyKey: invoice.id,
        transactionId: transactionId,
        refundType: RefundType.Full,
        amount: undefined,
      });
    });
  });

  describe('refundInvoices', () => {
    const validInvoice = {
      id: 'id1',
      collection_method: 'send_invoice',
      created: Date.now(),
    };
    beforeEach(() => {
      paypalHelper.log = {
        debug: sinon.fake.returns({}),
        info: sinon.fake.returns({}),
        error: sinon.fake.returns({}),
      };
      paypalHelper.refundInvoice = sinon.fake.resolves();
    });
    it('returns empty array if no payPalInvoices exist', async () => {
      await paypalHelper.refundInvoices([{ collection_method: 'notpaypal' }]);
      sinon.assert.notCalled(paypalHelper.refundInvoice);
    });

    it('returns on empty array input', async () => {
      await paypalHelper.refundInvoices([]);
      sinon.assert.notCalled(paypalHelper.refundInvoice);
    });

    it('calls refundInvoice for each invoice', async () => {
      await paypalHelper.refundInvoices([validInvoice]);
      sinon.assert.calledOnceWithExactly(
        paypalHelper.refundInvoice,
        validInvoice
      );
    });
  });

  describe('refundInvoice', () => {
    const validInvoice = {
      id: 'id1',
      collection_method: 'send_invoice',
      created: Date.now(),
    };
    beforeEach(() => {
      paypalHelper.log = {
        debug: sinon.fake.returns({}),
        info: sinon.fake.returns({}),
        error: sinon.fake.returns({}),
      };
      paypalHelper.issueRefund = sinon.fake.resolves();
    });

    it('does not refund when created date older than 180 days', async () => {
      const expectedErrorMessage =
        'Invoice created outside of maximum refund period';
      try {
        await paypalHelper.refundInvoice({
          id: validInvoice.id,
          collection_method: 'send_invoice',
          created: Math.floor(
            new Date().setDate(new Date().getDate() - 200) / 1000
          ),
        });

        sinon.assert.fail('Method did not throw error.');
      } catch (e) {
        sinon.assert.match(
          e,
          sinon.match
            .instanceOf(RefundError)
            .and(sinon.match.has('message', expectedErrorMessage))
        );
      }
      sinon.assert.notCalled(paypalHelper.issueRefund);
      sinon.assert.calledWithExactly(
        paypalHelper.log.error,
        'PayPalHelper.refundInvoice',
        {
          error: sinon.match
            .instanceOf(RefundError)
            .and(sinon.match.has('message', expectedErrorMessage)),
          invoiceId: validInvoice.id,
        }
      );
    });

    it('throws error if transactionId is missing', async () => {
      const expectedErrorMessage = 'Missing transactionId';
      mockStripeHelper.getInvoicePaypalTransactionId =
        sinon.fake.returns(undefined);
      try {
        await paypalHelper.refundInvoice(validInvoice);

        sinon.assert.fail('Method did not throw error.');
      } catch (e) {
        sinon.assert.match(
          e,
          sinon.match
            .instanceOf(RefundError)
            .and(sinon.match.has('message', expectedErrorMessage))
        );
      }
      sinon.assert.notCalled(paypalHelper.issueRefund);
      sinon.assert.calledWithExactly(
        paypalHelper.log.error,
        'PayPalHelper.refundInvoice',
        {
          error: sinon.match
            .instanceOf(RefundError)
            .and(sinon.match.has('message', expectedErrorMessage)),
          invoiceId: validInvoice.id,
        }
      );
    });

    it('throws error if refundTransactionId exists', async () => {
      const expectedErrorMessage = 'Invoice already refunded with PayPal';
      mockStripeHelper.getInvoicePaypalTransactionId = sinon.fake.returns(123);
      mockStripeHelper.getInvoicePaypalRefundTransactionId =
        sinon.fake.returns(123);
      try {
        await paypalHelper.refundInvoice(validInvoice);

        sinon.assert.fail('Method did not throw error.');
      } catch (e) {
        sinon.assert.match(
          e,
          sinon.match
            .instanceOf(RefundError)
            .and(sinon.match.has('message', expectedErrorMessage))
        );
      }
      sinon.assert.calledOnce(mockStripeHelper.getInvoicePaypalTransactionId);
      sinon.assert.calledOnce(
        mockStripeHelper.getInvoicePaypalRefundTransactionId
      );
      sinon.assert.notCalled(paypalHelper.issueRefund);
      sinon.assert.calledWithExactly(
        paypalHelper.log.error,
        'PayPalHelper.refundInvoice',
        {
          error: sinon.match
            .instanceOf(RefundError)
            .and(sinon.match.has('message', expectedErrorMessage)),
          invoiceId: validInvoice.id,
        }
      );
    });

    it('throws error from issueRefund', async () => {
      const expectedError = new RefusedError('Helper error');
      mockStripeHelper.getInvoicePaypalTransactionId = sinon.fake.returns(123);
      mockStripeHelper.getInvoicePaypalRefundTransactionId =
        sinon.fake.returns(undefined);
      paypalHelper.issueRefund = sinon.fake.rejects(expectedError);
      try {
        await paypalHelper.refundInvoice(validInvoice);

        sinon.assert.fail('Method did not throw error.');
      } catch (e) {
        sinon.assert.match(
          e,
          sinon.match
            .instanceOf(RefusedError)
            .and(sinon.match.has('message', 'Helper error'))
        );
      }
      sinon.assert.calledWithExactly(
        paypalHelper.log.error,
        'PayPalHelper.refundInvoice',
        {
          error: sinon.match
            .instanceOf(RefusedError)
            .and(sinon.match.has('message', 'Helper error')),
          invoiceId: validInvoice.id,
        }
      );
    });

    it('refunds successfully', async () => {
      const expectedInvoiceResults = {
        invoiceId: validInvoice.id,
        priceId: 'priceId1',
        total: 400,
        currency: 'usd',
      };
      mockStripeHelper.getInvoicePaypalTransactionId =
        sinon.fake.returns('123');
      mockStripeHelper.getInvoicePaypalRefundTransactionId =
        sinon.fake.returns(undefined);
      mockStripeHelper.getPriceIdFromInvoice = sinon.fake.returns(
        expectedInvoiceResults.priceId
      );
      await paypalHelper.refundInvoice({
        ...validInvoice,
        ...expectedInvoiceResults,
      });
      sinon.assert.calledOnceWithExactly(
        paypalHelper.log.info,
        'refundInvoice',
        expectedInvoiceResults
      );
      sinon.assert.notCalled(paypalHelper.log.error);
    });
  });

  describe('cancelBillingAgreement', () => {
    it('cancels an agreement', async () => {
      paypalHelper.client.doRequest = sinon.fake.resolves(
        successfulBAUpdateResponse
      );
      const response = await paypalHelper.cancelBillingAgreement('test');
      assert.isNull(response);
    });

    it('ignores paypal client errors', async () => {
      const nvpError = new PayPalNVPError(
        'Fake',
        {},
        { message: 'oh no', errorCode: 123 }
      );
      paypalHelper.client.doRequest = sinon.fake.throws(
        new PayPalClientError([nvpError], 'hi', {})
      );
      const response = await paypalHelper.cancelBillingAgreement('test');
      assert.isNull(response);
    });
  });

  describe('searchTransactions', () => {
    it('returns the data from doRequest', async () => {
      paypalHelper.client.doRequest = sinon.fake.resolves(
        searchTransactionResponse
      );
      const expectedResponse = [
        {
          amount: '5.99',
          currencyCode: 'USD',
          email: 'sb-ufoot5037790@personal.example.com',
          feeAmount: '-0.47',
          name: 'John Doe',
          netAmount: '5.52',
          status: 'Under Review',
          timestamp: '2021-02-11T17:38:28Z',
          transactionId: '2TA09271XC591854A',
          type: 'Payment',
        },
        {
          amount: '5.99',
          currencyCode: 'USD',
          email: 'sb-ufoot5037790@personal.example.com',
          feeAmount: '-0.47',
          name: 'John Doe',
          netAmount: '5.52',
          status: 'Under Review',
          timestamp: '2021-02-11T17:38:23Z',
          transactionId: '7WW53923D67853628',
          type: 'Payment',
        },
        {
          amount: '5.99',
          currencyCode: 'USD',
          email: 'sb-ufoot5037790@personal.example.com',
          feeAmount: '-0.47',
          name: 'John Doe',
          netAmount: '5.52',
          status: 'Under Review',
          timestamp: '2021-02-11T17:31:05Z',
          transactionId: '22N88933SF2815829',
          type: 'Payment',
        },
      ];
      const response = await paypalHelper.searchTransactions({
        startDate: new Date(),
        invoice: 'inv-001',
      });
      assert.deepEqual(response, expectedResponse);
    });
  });

  describe('verifyIpnMessage', () => {
    it('validates IPN message', async () => {
      paypalHelper.client.ipnVerify = sinon.fake.resolves('VERIFIED');
      const response = await paypalHelper.verifyIpnMessage(
        sampleIpnMessage.message
      );
      sinon.assert.calledOnceWithExactly(
        paypalHelper.client.ipnVerify,
        sampleIpnMessage.message
      );
      assert.isTrue(response);
    });

    it('invalidates IPN message', async () => {
      paypalHelper.client.ipnVerify = sinon.fake.resolves('INVALID');
      const response = await paypalHelper.verifyIpnMessage('invalid=True');
      sinon.assert.calledOnceWithExactly(
        paypalHelper.client.ipnVerify,
        'invalid=True'
      );
      assert.isFalse(response);
    });
  });

  describe('extractIpnMessage', () => {
    it('extracts IPN message from payload', () => {
      const msg = paypalHelper.extractIpnMessage(sampleIpnMessage.message);
      assert.deepEqual(msg, {
        address_city: 'San Jose',
        address_country: 'United States',
        address_country_code: 'US',
        address_name: 'Test User',
        address_state: 'CA',
        address_status: 'confirmed',
        address_street: '1 Main St',
        address_zip: '95131',
        charset: 'windows-1252',
        custom: '',
        first_name: 'Test',
        handling_amount: '0.00',
        item_name: '',
        item_number: '',
        last_name: 'User',
        mc_currency: 'USD',
        mc_fee: '0.88',
        mc_gross: '19.95',
        notify_version: '2.6',
        payer_email: 'gpmac_1231902590_per@paypal.com',
        payer_id: 'LPLWNMTBWMFAY',
        payer_status: 'verified',
        payment_date: '20:12:59 Jan 13, 2009 PST',
        payment_fee: '0.88',
        payment_gross: '19.95',
        payment_status: 'Completed',
        payment_type: 'instant',
        protection_eligibility: 'Eligible',
        quantity: '1',
        receiver_email: 'gpmac_1231902686_biz@paypal.com',
        receiver_id: 'S8XGHLYDW9T3S',
        residence_country: 'US',
        shipping: '0.00',
        tax: '0.00',
        test_ipn: '1',
        transaction_subject: '',
        txn_id: '61E67681CH3238416',
        txn_type: 'express_checkout',
        verify_sign: 'AtkOfCXbDm2hu0ZELryHFjY-Vb7PAUvS6nMXgysbElEn9v-1XcmSoGtf',
      });
    });
  });

  describe('conditionallyRemoveBillingAgreement', () => {
    it('returns false with no billing agreement found', async () => {
      mockStripeHelper.getCustomerPaypalAgreement =
        sinon.fake.returns(undefined);
      const result = await paypalHelper.conditionallyRemoveBillingAgreement(
        mockCustomer
      );
      assert.isFalse(result);
    });

    it('returns false with no paypal subscriptions', async () => {
      mockStripeHelper.getCustomerPaypalAgreement =
        sinon.fake.returns('ba-test');
      mockCustomer.subscriptions = {
        data: [{ status: 'active', collection_method: 'send_invoice' }],
      };
      const result = await paypalHelper.conditionallyRemoveBillingAgreement(
        mockCustomer
      );
      assert.isFalse(result);
    });

    it('returns true if it cancelled and removed the billing agreement', async () => {
      mockStripeHelper.getCustomerPaypalAgreement =
        sinon.fake.returns('ba-test');
      mockCustomer.subscriptions = { data: [] };
      paypalHelper.cancelBillingAgreement = sinon.fake.resolves({});
      mockStripeHelper.removeCustomerPaypalAgreement = sinon.fake.resolves({});
      const result = await paypalHelper.conditionallyRemoveBillingAgreement(
        mockCustomer
      );
      assert.isTrue(result);
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.getCustomerPaypalAgreement,
        mockCustomer
      );
      sinon.assert.calledOnceWithExactly(
        paypalHelper.cancelBillingAgreement,
        'ba-test'
      );
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.removeCustomerPaypalAgreement,
        mockCustomer.metadata.userid,
        mockCustomer.id,
        'ba-test'
      );
    });
  });

  describe('updateStripeNameFromBA', () => {
    it('updates the name on the stripe customer', async () => {
      mockStripeHelper.updateCustomerBillingAddress = sinon.fake.resolves({});
      paypalHelper.agreementDetails = sinon.fake.resolves({
        firstName: 'Test',
        lastName: 'User',
      });
      const result = await paypalHelper.updateStripeNameFromBA(
        mockCustomer,
        'mock-agreement-id'
      );
      assert.deepEqual(result, {});
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.updateCustomerBillingAddress,
        { customerId: mockCustomer.id, name: 'Test User' }
      );
      sinon.assert.calledOnce(paypalHelper.metrics.increment);
    });

    it('throws error if billing agreement status is cancelled', async () => {
      mockStripeHelper.updateCustomerBillingAddress = sinon.fake.resolves({});
      paypalHelper.agreementDetails = sinon.fake.resolves({
        firstName: 'Test',
        lastName: 'User',
        status: 'cancelled',
      });

      try {
        await paypalHelper.updateStripeNameFromBA(
          mockCustomer,
          'mock-agreement-id'
        );
        assert.fail('Error should throw billing agreement was cancelled.');
      } catch (err) {
        assert.deepEqual(
          err,
          error.internalValidationError('updateStripeNameFromBA', {
            message: 'Billing agreement was cancelled.',
          })
        );
      }
    });
  });

  describe('processZeroInvoice', () => {
    it('finalize invoice that with no amount set to zero', async () => {
      mockStripeHelper.finalizeInvoice = sinon.fake.resolves({});
      mockStripeHelper.payInvoiceOutOfBand = sinon.fake.resolves({});
      const response = await paypalHelper.processZeroInvoice(mockInvoice);
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.finalizeInvoice,
        mockInvoice
      );
      assert.deepEqual(response, {});
    });
  });

  describe('processInvoice', () => {
    const agreementId = 'agreement-id';
    const paymentAttempts = 0;
    const transactionId = 'transaction-id';

    beforeEach(() => {
      mockStripeHelper.getCustomerPaypalAgreement =
        sinon.fake.returns(agreementId);
      mockStripeHelper.getPaymentAttempts = sinon.fake.returns(paymentAttempts);
      paypalHelper.chargeCustomer = sinon.fake.resolves({
        paymentStatus: 'Completed',
        transactionId,
      });
      mockStripeHelper.updateInvoiceWithPaypalTransactionId =
        sinon.fake.resolves({ transactionId });
      mockStripeHelper.payInvoiceOutOfBand = sinon.fake.resolves({});
      mockStripeHelper.updatePaymentAttempts = sinon.fake.resolves({});
    });

    it('runs a open invoice successfully', async () => {
      const validInvoice = {
        ...mockInvoice,
        status: 'open',
        amount_due: 499,
        currency: 'eur',
      };

      const response = await paypalHelper.processInvoice({
        customer: mockCustomer,
        invoice: validInvoice,
        ipaddress: '127.0.0.1',
      });
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.getCustomerPaypalAgreement,
        mockCustomer
      );
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.getPaymentAttempts,
        validInvoice
      );
      sinon.assert.calledOnceWithExactly(paypalHelper.chargeCustomer, {
        amountInCents: validInvoice.amount_due,
        billingAgreementId: agreementId,
        currencyCode: validInvoice.currency,
        countryCode: validInvoice.customer_shipping.address.country,
        invoiceNumber: validInvoice.id,
        idempotencyKey: paypalHelper.generateIdempotencyKey(
          validInvoice.id,
          paymentAttempts
        ),
        ipaddress: '127.0.0.1',
      });
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.updateInvoiceWithPaypalTransactionId,
        validInvoice,
        transactionId
      );
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.payInvoiceOutOfBand,
        validInvoice
      );
      assert.deepEqual(response, [{ transactionId }, {}]);
    });

    it('runs a open invoice successfully with tax added', async () => {
      const validInvoice = {
        ...mockInvoice,
        status: 'open',
        amount_due: 499,
        currency: 'eur',
        tax: 500,
      };

      const response = await paypalHelper.processInvoice({
        customer: mockCustomer,
        invoice: validInvoice,
        ipaddress: '127.0.0.1',
      });
      sinon.assert.calledOnceWithExactly(paypalHelper.chargeCustomer, {
        amountInCents: validInvoice.amount_due,
        billingAgreementId: agreementId,
        currencyCode: validInvoice.currency,
        countryCode: validInvoice.customer_shipping.address.country,
        invoiceNumber: validInvoice.id,
        idempotencyKey: paypalHelper.generateIdempotencyKey(
          validInvoice.id,
          paymentAttempts
        ),
        ipaddress: '127.0.0.1',
        taxAmountInCents: validInvoice.tax,
      });
      assert.deepEqual(response, [{ transactionId }, {}]);
    });

    it('runs a draft invoice successfully', async () => {
      const validInvoice = {
        ...mockInvoice,
        status: 'draft',
        amount_due: 499,
      };

      mockStripeHelper.finalizeInvoice = sinon.fake.resolves({});

      const response = await paypalHelper.processInvoice({
        customer: mockCustomer,
        invoice: validInvoice,
      });
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.getCustomerPaypalAgreement,
        mockCustomer
      );
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.getPaymentAttempts,
        validInvoice
      );
      sinon.assert.calledOnceWithExactly(paypalHelper.chargeCustomer, {
        amountInCents: validInvoice.amount_due,
        billingAgreementId: agreementId,
        currencyCode: validInvoice.currency,
        countryCode: validInvoice.customer_shipping.address.country,
        invoiceNumber: validInvoice.id,
        idempotencyKey: paypalHelper.generateIdempotencyKey(
          validInvoice.id,
          paymentAttempts
        ),
      });
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.finalizeInvoice,
        validInvoice
      );
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.updateInvoiceWithPaypalTransactionId,
        validInvoice,
        transactionId
      );
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.payInvoiceOutOfBand,
        validInvoice
      );
      assert.deepEqual(response, [{ transactionId }, {}]);
    });

    it('runs invoice payment was Pending or In-Progress', async () => {
      const validInvoice = {
        ...mockInvoice,
        status: 'open',
        amount_due: 499,
      };
      paypalHelper.chargeCustomer = sinon.fake.resolves({
        paymentStatus: 'Pending',
        transactionId,
      });

      const response = await paypalHelper.processInvoice({
        customer: mockCustomer,
        invoice: validInvoice,
      });
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.getCustomerPaypalAgreement,
        mockCustomer
      );
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.getPaymentAttempts,
        validInvoice
      );
      sinon.assert.calledOnceWithExactly(paypalHelper.chargeCustomer, {
        amountInCents: validInvoice.amount_due,
        billingAgreementId: agreementId,
        currencyCode: validInvoice.currency,
        countryCode: validInvoice.customer_shipping.address.country,
        invoiceNumber: validInvoice.id,
        idempotencyKey: paypalHelper.generateIdempotencyKey(
          validInvoice.id,
          paymentAttempts
        ),
      });
      assert.equal(response, undefined);
    });

    it('throws error on invoice payment responded with Denied, Failed, Voided, or Expired', async () => {
      const validInvoice = {
        ...mockInvoice,
        status: 'open',
        amount_due: 499,
      };
      paypalHelper.chargeCustomer = sinon.fake.resolves({
        paymentStatus: 'Denied',
        transactionId,
      });

      try {
        await paypalHelper.processInvoice({
          customer: mockCustomer,
          invoice: validInvoice,
        });
        assert.fail(
          'Error should throw unexpected PayPal transaction response.'
        );
      } catch (err) {
        assert.deepEqual(err, error.paymentFailed());
      }
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.getCustomerPaypalAgreement,
        mockCustomer
      );
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.getPaymentAttempts,
        validInvoice
      );
      sinon.assert.calledOnceWithExactly(paypalHelper.chargeCustomer, {
        amountInCents: validInvoice.amount_due,
        billingAgreementId: agreementId,
        currencyCode: validInvoice.currency,
        countryCode: validInvoice.customer_shipping.address.country,
        invoiceNumber: validInvoice.id,
        idempotencyKey: paypalHelper.generateIdempotencyKey(
          validInvoice.id,
          paymentAttempts
        ),
      });
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.updatePaymentAttempts,
        validInvoice
      );
    });

    it('logs and throws error on invoice payment responded with unexpected PayPal payment status', async () => {
      const paymentStatus = 'Unexpected';
      const validInvoice = {
        ...mockInvoice,
        status: 'open',
        amount_due: 499,
      };
      paypalHelper.log = { error: sinon.fake.returns({}) };
      paypalHelper.chargeCustomer = sinon.fake.resolves({
        paymentStatus,
        transactionId,
      });

      try {
        await paypalHelper.processInvoice({
          customer: mockCustomer,
          invoice: validInvoice,
        });
        assert.fail(
          'Error should throw unexpected PayPal transaction response.'
        );
      } catch (err) {
        assert.deepEqual(
          err,
          error.internalValidationError('processInvoice', {
            message: 'Unexpected PayPal transaction response.',
            transactionResponse: paymentStatus,
          })
        );
      }
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.getCustomerPaypalAgreement,
        mockCustomer
      );
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.getPaymentAttempts,
        validInvoice
      );
      sinon.assert.calledOnceWithExactly(paypalHelper.chargeCustomer, {
        amountInCents: validInvoice.amount_due,
        billingAgreementId: agreementId,
        currencyCode: validInvoice.currency,
        countryCode: validInvoice.customer_shipping.address.country,
        invoiceNumber: validInvoice.id,
        idempotencyKey: paypalHelper.generateIdempotencyKey(
          validInvoice.id,
          paymentAttempts
        ),
      });
    });

    it('throws error for invoice without PayPal Billing Agreement ID', async () => {
      mockStripeHelper.getCustomerPaypalAgreement =
        sinon.fake.returns(undefined);

      try {
        await paypalHelper.processInvoice({
          customer: mockCustomer,
          invoice: mockInvoice,
        });
        assert.fail('Error should throw agreement ID not found.');
      } catch (err) {
        assert.deepEqual(
          err,
          error.internalValidationError('processInvoice', {
            message: 'Agreement ID not found.',
          })
        );
      }
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.getCustomerPaypalAgreement,
        mockCustomer
      );
    });

    it('throws error for invoice not on draft or open status', async () => {
      const validInvoice = {
        ...mockInvoice,
        status: 'paid',
      };

      try {
        await paypalHelper.processInvoice({
          customer: mockCustomer,
          invoice: validInvoice,
        });
        assert.fail('Error should throw invoice in invalid state.');
      } catch (err) {
        assert.deepEqual(
          err,
          error.internalValidationError('processInvoice', {
            message: 'Invoice in invalid state.',
          })
        );
      }
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.getCustomerPaypalAgreement,
        mockCustomer
      );
    });

    describe('throw auth-server error', () => {
      let validInvoice;

      function makeFailedErr(errCode) {
        const failedResponse = deepCopy(failedDoReferenceTransactionResponse);
        failedResponse.L_ERRORCODE0 = errCode;
        const rawString = objectToNVP(failedResponse);
        const parsedNvpObject = nvpToObject(rawString);
        const nvpError = new PayPalNVPError(rawString, parsedNvpObject, {
          message: parsedNvpObject.L[0].LONGMESSAGE,
          errorCode: parseInt(parsedNvpObject.L[0].ERRORCODE),
        });
        const throwErr = new PayPalClientError(
          [nvpError],
          rawString,
          parsedNvpObject
        );
        paypalHelper.chargeCustomer = sinon.fake.rejects(throwErr);
        return throwErr;
      }

      beforeEach(() => {
        validInvoice = {
          ...mockInvoice,
          status: 'open',
          amount_due: 499,
        };
        mockStripeHelper.getCustomerPaypalAgreement =
          sinon.fake.returns(agreementId);
        mockStripeHelper.getPaymentAttempts =
          sinon.fake.returns(paymentAttempts);
        mockStripeHelper.updatePaymentAttempts = sinon.fake.returns({});
        paypalHelper.log = { error: sinon.fake.returns({}) };
      });

      it('payment failed error on invalid billing agreement', async () => {
        const throwErr = makeFailedErr(PAYPAL_BILLING_AGREEMENT_INVALID);
        try {
          await paypalHelper.processInvoice({
            customer: mockCustomer,
            invoice: validInvoice,
          });
          assert.fail('Error should throw invoice in invalid state.');
        } catch (err) {
          const failErr = error.paymentFailed();
          failErr.jse_cause = throwErr;
          assert.deepEqual(err, failErr);
        }
        sinon.assert.calledOnceWithExactly(
          mockStripeHelper.getCustomerPaypalAgreement,
          mockCustomer
        );
      });

      it('backend service failure on paypal app error', async () => {
        const throwErr = makeFailedErr(PAYPAL_APP_ERRORS[1]);
        try {
          await paypalHelper.processInvoice({
            customer: mockCustomer,
            invoice: validInvoice,
          });
          assert.fail('Error should throw invoice in invalid state.');
        } catch (err) {
          const failErr = error.backendServiceFailure(
            'paypal',
            'transaction',
            {
              errData: throwErr.data,
              code: throwErr.getPrimaryError().errorCode,
            },
            throwErr
          );
          assert.deepEqual(err, failErr);
        }
        sinon.assert.calledOnceWithExactly(
          mockStripeHelper.getCustomerPaypalAgreement,
          mockCustomer
        );
      });

      it('retry error on paypal retryable error', async () => {
        makeFailedErr(PAYPAL_RETRY_ERRORS[1]);
        try {
          await paypalHelper.processInvoice({
            customer: mockCustomer,
            invoice: validInvoice,
          });
          assert.fail('Error should throw invoice in invalid state.');
        } catch (err) {
          const failErr = error.serviceUnavailable();
          assert.deepEqual(err, failErr);
        }
        sinon.assert.calledOnceWithExactly(
          mockStripeHelper.getCustomerPaypalAgreement,
          mockCustomer
        );
      });

      it('backend error on no paypal error code', async () => {
        const throwErr = makeFailedErr();
        try {
          await paypalHelper.processInvoice({
            customer: mockCustomer,
            invoice: validInvoice,
          });
          assert.fail('Error should throw invoice in invalid state.');
        } catch (err) {
          const failErr = error.backendServiceFailure(
            'paypal',
            'transaction',
            {
              errData: throwErr.data,
              message: 'Error with no errorCode is not expected',
            },
            throwErr
          );
          assert.deepEqual(err, failErr);
        }
        sinon.assert.calledOnceWithExactly(
          mockStripeHelper.getCustomerPaypalAgreement,
          mockCustomer
        );
      });

      it('internal validation error on unexpected paypal error code', async () => {
        const throwErr = makeFailedErr(992929291992392);
        try {
          await paypalHelper.processInvoice({
            customer: mockCustomer,
            invoice: validInvoice,
          });
          assert.fail('Error should throw invoice in invalid state.');
        } catch (err) {
          const failErr = error.internalValidationError(
            'paypalCodeHandler',
            {
              code: 992929291992392,
              errData: throwErr.data,
            },
            throwErr
          );
          assert.deepEqual(err, failErr);
        }
        sinon.assert.calledOnceWithExactly(
          mockStripeHelper.getCustomerPaypalAgreement,
          mockCustomer
        );
      });

      it('skips auth-server error on batchProcessing service failure on paypal app error', async () => {
        const throwErr = makeFailedErr(PAYPAL_APP_ERRORS[1]);
        try {
          await paypalHelper.processInvoice({
            customer: mockCustomer,
            invoice: validInvoice,
            batchProcessing: true,
          });
          assert.fail('Error should throw invoice in invalid state.');
        } catch (err) {
          assert.deepEqual(err, throwErr);
        }
        sinon.assert.calledOnceWithExactly(
          mockStripeHelper.getCustomerPaypalAgreement,
          mockCustomer
        );
      });
    });
  });
});
