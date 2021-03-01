/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const nock = require('nock');
const sinon = require('sinon');

const {
  PayPalClient,
  PayPalClientError,
  PAYPAL_SANDBOX_BASE,
  PAYPAL_SANDBOX_IPN_BASE,
  PAYPAL_NVP_ROUTE,
  PAYPAL_IPN_ROUTE,
  PAYPAL_SANDBOX_API,
  PAYPAL_LIVE_API,
  PLACEHOLDER_URL,
} = require('../../../lib/payments/paypal-client');

const ERROR_RESPONSE =
  'TIMESTAMP=2011%2d11%2d15T20%3a27%3a02Z&CORRELATIONID=5be53331d9700&ACK=Failure&VERSION=78%2e0&BUILD=000000&L_ERRORCODE0=15005&L_SHORTMESSAGE0=Processor%20Decline&L_LONGMESSAGE0=This%20transaction%20cannot%20be%20processed%2e&L_SEVERITYCODE0=Error&L_ERRORPARAMID0=ProcessorResponse&L_ERRORPARAMVALUE0=0051&AMT=10%2e40&CURRENCYCODE=USD&AVSCODE=X&CVV2MATCH=M';
const successfulSetExpressCheckoutResponse = require('./fixtures/paypal/set_express_checkout_success.json');
const unSuccessfulSetExpressCheckoutResponse = require('./fixtures/paypal/set_express_checkout_failure.json');
const successfulDoReferenceTransactionResponse = require('./fixtures/paypal/do_reference_transaction_success.json');
const unSuccessfulDoReferenceTransactionResponse = require('./fixtures/paypal/do_reference_transaction_failure.json');
const searchTransactionResponse = require('./fixtures/paypal/transaction_search_success.json');
const sampleIpnMessage = require('./fixtures/paypal/sample_ipn_message.json')
  .message;

const sandbox = sinon.createSandbox();

describe('PayPalClient', () => {
  /** @type {PayPalClient} */
  let client;

  beforeEach(() => {
    client = new PayPalClient({
      user: 'user',
      sandbox: true,
      pwd: 'pwd',
      signature: 'sig',
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('constructor', () => {
    it('uses sandbox', () => {
      assert.equal(client.url, PAYPAL_SANDBOX_API);
    });

    it('uses live', () => {
      client = new PayPalClient({
        user: 'user',
        sandbox: false,
        pwd: 'pwd',
        signature: 'sig',
      });
      assert.equal(client.url, PAYPAL_LIVE_API);
    });
  });

  it('objectToNVP', () => {
    const obj = { NAME: 'Robert Moore', COMPANY: 'R. H. Moore & Associates' };
    const result = client.objectToNVP(obj);
    assert.equal(
      result,
      'NAME=Robert%20Moore&COMPANY=R.%20H.%20Moore%20%26%20Associates'
    );
  });

  it('nvpToObject', () => {
    const result = client.nvpToObject(ERROR_RESPONSE);
    assert.deepEqual(result, {
      ACK: 'Failure',
      AMT: '10.40',
      AVSCODE: 'X',
      BUILD: '000000',
      CORRELATIONID: '5be53331d9700',
      CURRENCYCODE: 'USD',
      CVV2MATCH: 'M',
      L: [
        {
          ERRORCODE: '15005',
          ERRORPARAMID: 'ProcessorResponse',
          ERRORPARAMVALUE: '0051',
          LONGMESSAGE: 'This transaction cannot be processed.',
          SEVERITYCODE: 'Error',
          SHORTMESSAGE: 'Processor Decline',
        },
      ],
      TIMESTAMP: '2011-11-15T20:27:02Z',
      VERSION: '78.0',
    });
  });

  describe('doRequest', () => {
    const userNameRequestData = {
      NAME: 'Robert Moore',
      COMPANY: 'R. H. Moore & Associates',
    };
    const userNameSuccessResponseData = {
      NAME: 'Robert Moore',
      COMPANY: 'R. H. Moore & Associates',
      ACK: 'Success',
    };
    let expectedPayload;

    before(() => {
      expectedPayload = client.objectToNVP({
        ...userNameRequestData,
        USER: 'user',
        METHOD: 'BillAgreementUpdate',
        PWD: 'pwd',
        SIGNATURE: 'sig',
        VERSION: '204',
      });
    });

    it('succeeds', async () => {
      nock(PAYPAL_SANDBOX_BASE)
        .post(PAYPAL_NVP_ROUTE, expectedPayload)
        .reply(200, client.objectToNVP(userNameSuccessResponseData));
      const result = await client.doRequest(
        'BillAgreementUpdate',
        userNameRequestData
      );
      assert.deepEqual(result, userNameSuccessResponseData);
    });

    it('emits an event on success', async () => {
      const event = {};
      client.on('response', (response) => Object.assign(event, response));
      nock(PAYPAL_SANDBOX_BASE)
        .post(PAYPAL_NVP_ROUTE, expectedPayload)
        .reply(200, client.objectToNVP(userNameSuccessResponseData));
      const result = await client.doRequest(
        'BillAgreementUpdate',
        userNameRequestData
      );
      assert.deepEqual(result, userNameSuccessResponseData);
      assert.deepNestedInclude(event, {
        method: 'BillAgreementUpdate',
        version: '204',
      });
    });

    it('emits an event on error', async () => {
      const event = {};
      client.on('response', (response) => Object.assign(event, response));
      nock(PAYPAL_SANDBOX_BASE)
        .post(PAYPAL_NVP_ROUTE, expectedPayload)
        .reply(500, 'ERROR');
      nock(PAYPAL_SANDBOX_BASE)
        .post(PAYPAL_NVP_ROUTE, expectedPayload)
        .reply(500, 'ERROR');
      nock(PAYPAL_SANDBOX_BASE)
        .post(PAYPAL_NVP_ROUTE, expectedPayload)
        .reply(500, 'ERROR');
      nock(PAYPAL_SANDBOX_BASE)
        .post(PAYPAL_NVP_ROUTE, expectedPayload)
        .reply(500, 'ERROR');
      try {
        await client.doRequest('BillAgreementUpdate', userNameRequestData);
        assert.fail('Request should have thrown an error.');
      } catch (err) {
        assert.instanceOf(err, Error);
        assert.equal(err.message, 'Internal Server Error');
        assert.deepNestedInclude(event, {
          method: 'BillAgreementUpdate',
          version: '204',
        });
        assert.deepNestedInclude(event.error, { status: 500 });
      }
    });

    it('retries after a failure', async () => {
      nock(PAYPAL_SANDBOX_BASE)
        .post(PAYPAL_NVP_ROUTE, expectedPayload)
        .reply(500, 'ERROR');
      nock(PAYPAL_SANDBOX_BASE)
        .post(PAYPAL_NVP_ROUTE, expectedPayload)
        .reply(200, client.objectToNVP(userNameSuccessResponseData));
      const result = await client.doRequest(
        'BillAgreementUpdate',
        userNameRequestData
      );
      assert.deepEqual(result, userNameSuccessResponseData);
    });

    it('throws an Internal Serever Error on fourth error', async () => {
      // This is case where a service is down in some spectacular way
      // and so pRetry runs out of tries.
      nock(PAYPAL_SANDBOX_BASE)
        .post(PAYPAL_NVP_ROUTE, expectedPayload)
        .reply(500, 'ERROR');
      nock(PAYPAL_SANDBOX_BASE)
        .post(PAYPAL_NVP_ROUTE, expectedPayload)
        .reply(500, 'ERROR');
      nock(PAYPAL_SANDBOX_BASE)
        .post(PAYPAL_NVP_ROUTE, expectedPayload)
        .reply(500, 'ERROR');
      nock(PAYPAL_SANDBOX_BASE)
        .post(PAYPAL_NVP_ROUTE, expectedPayload)
        .reply(500, 'ERROR');
      try {
        await client.doRequest('BillAgreementUpdate', userNameRequestData);
        assert.fail('Request should have thrown an error.');
      } catch (err) {
        assert.instanceOf(err, Error);
        assert.equal(err.message, 'Internal Server Error');
      }
    });

    it('throws a PayPalClientError on PayPal Failure response', async () => {
      nock(PAYPAL_SANDBOX_BASE)
        .post(PAYPAL_NVP_ROUTE, expectedPayload)
        .reply(200, ERROR_RESPONSE);
      try {
        await client.doRequest('BillAgreementUpdate', userNameRequestData);
        assert.fail('Request should have thrown an error.');
      } catch (err) {
        assert.instanceOf(err, PayPalClientError);
        assert.equal(err.name, 'PayPalClientError');
        assert.include(err.raw, 'ACK=Failure');
        assert.equal(err.data.ACK, 'Failure');
      }
    });
  });

  describe('setExpressCheckout', () => {
    const defaultData = {
      CANCELURL: PLACEHOLDER_URL,
      L_BILLINGAGREEMENTDESCRIPTION0: 'Mozilla',
      L_BILLINGTYPE0: 'MerchantInitiatedBilling',
      NOSHIPPING: 1,
      PAYMENTREQUEST_0_AMT: '0',
      PAYMENTREQUEST_0_CURRENCYCODE: 'USD',
      PAYMENTREQUEST_0_PAYMENTACTION: 'AUTHORIZATION',
      RETURNURL: PLACEHOLDER_URL,
    };

    const defaultOptions = {
      currencyCode: 'USD',
    };

    it('calls api with correct method and data', () => {
      client.doRequest = sandbox.fake.resolves(
        successfulSetExpressCheckoutResponse
      );
      client.setExpressCheckout(defaultOptions);
      sinon.assert.calledOnceWithExactly(
        client.doRequest,
        'SetExpressCheckout',
        defaultData
      );
    });

    it('if request unsuccessful, throws PayPalClientError', async () => {
      const expectedPayload = {
        ...defaultData,
        USER: 'user',
        METHOD: 'SetExpressCheckout',
        PWD: 'pwd',
        SIGNATURE: 'sig',
        VERSION: '204',
      };
      nock(PAYPAL_SANDBOX_BASE)
        .post(PAYPAL_NVP_ROUTE, client.objectToNVP(expectedPayload))
        .reply(200, client.objectToNVP(unSuccessfulSetExpressCheckoutResponse));
      try {
        await client.setExpressCheckout(defaultOptions);
        assert.fail('Request should have thrown an error.');
      } catch (err) {
        assert.instanceOf(err, PayPalClientError);
        assert.equal(err.name, 'PayPalClientError');
        assert.include(err.raw, 'ACK=Failure');
        assert.equal(err.data.ACK, 'Failure');
        assert.equal(err.errorCode, 81100);
      }
    });

    it('calls api with requested currency', async () => {
      client.doRequest = sandbox.fake.resolves(
        successfulSetExpressCheckoutResponse
      );
      const currency = 'EUR';
      await client.setExpressCheckout({
        currencyCode: currency,
      });
      sinon.assert.calledOnceWithExactly(
        client.doRequest,
        'SetExpressCheckout',
        {
          ...defaultData,
          PAYMENTREQUEST_0_CURRENCYCODE: currency,
        }
      );
    });

    it('calls upper cases requested currency', async () => {
      client.doRequest = sandbox.fake.resolves(
        successfulSetExpressCheckoutResponse
      );
      await client.setExpressCheckout({
        currencyCode: 'eur',
      });
      sinon.assert.calledOnceWithExactly(
        client.doRequest,
        'SetExpressCheckout',
        {
          ...defaultData,
          PAYMENTREQUEST_0_CURRENCYCODE: 'EUR',
        }
      );
    });
  });

  describe('createBillingAgreement', () => {
    const defaultData = {
      token: 'insert_token_value_here',
    };

    const expectedResponse = {
      BILLINGAGREEMENTID: 'B-7FB31251F28061234',
      ACK: 'Success',
    };

    it('calls API with valid token', async () => {
      client.doRequest = sandbox.fake.resolves(expectedResponse);
      await client.createBillingAgreement(defaultData);
      sinon.assert.calledOnceWithExactly(
        client.doRequest,
        'CreateBillingAgreement',
        defaultData
      );
    });
  });

  describe('doReferenceTransaction', () => {
    const defaultData = {
      AMT: '5.99',
      CURRENCYCODE: 'USD',
      CUSTOM: 'in_asdf-12',
      INVNUM: 'in_asdf',
      IPADDRESS: '127.0.0.1',
      MSGSUBID: 'in_asdf-12',
      PAYMENTACTION: 'Sale',
      PAYMENTTYPE: 'instant',
      REFERENCEID: 'B-BILLINGAGREEMENTID',
    };

    it('calls api with correct method and data', async () => {
      client.doRequest = sandbox.fake.resolves(
        successfulDoReferenceTransactionResponse
      );
      await client.doReferenceTransaction({
        amount: defaultData.AMT,
        billingAgreementId: defaultData.REFERENCEID,
        currencyCode: defaultData.CURRENCYCODE,
        idempotencyKey: defaultData.MSGSUBID,
        invoiceNumber: defaultData.INVNUM,
        ipaddress: defaultData.IPADDRESS,
      });
      sinon.assert.calledOnceWithExactly(
        client.doRequest,
        'DoReferenceTransaction',
        defaultData
      );
    });

    it('calls api with requested amount', async () => {
      client.doRequest = sandbox.fake.resolves(
        successfulDoReferenceTransactionResponse
      );
      const amt = '44.55';
      await client.doReferenceTransaction({
        amount: amt,
        billingAgreementId: defaultData.REFERENCEID,
        currencyCode: defaultData.CURRENCYCODE,
        idempotencyKey: defaultData.MSGSUBID,
        invoiceNumber: defaultData.INVNUM,
        ipaddress: defaultData.IPADDRESS,
      });
      sinon.assert.calledOnceWithExactly(
        client.doRequest,
        'DoReferenceTransaction',
        {
          ...defaultData,
          AMT: amt,
        }
      );
    });

    it('calls api with requested referenceID', async () => {
      client.doRequest = sandbox.fake.resolves(
        successfulDoReferenceTransactionResponse
      );
      const ref = 'B-123588';
      await client.doReferenceTransaction({
        amount: defaultData.AMT,
        billingAgreementId: ref,
        currencyCode: defaultData.CURRENCYCODE,
        idempotencyKey: defaultData.MSGSUBID,
        invoiceNumber: defaultData.INVNUM,
        ipaddress: defaultData.IPADDRESS,
      });
      sinon.assert.calledOnceWithExactly(
        client.doRequest,
        'DoReferenceTransaction',
        {
          ...defaultData,
          REFERENCEID: ref,
        }
      );
    });

    it('calls api with requested currency', async () => {
      client.doRequest = sandbox.fake.resolves(
        successfulDoReferenceTransactionResponse
      );
      const currency = 'EUR';
      await client.doReferenceTransaction({
        amount: defaultData.AMT,
        billingAgreementId: defaultData.REFERENCEID,
        currencyCode: currency,
        idempotencyKey: defaultData.MSGSUBID,
        invoiceNumber: defaultData.INVNUM,
        ipaddress: defaultData.IPADDRESS,
      });
      sinon.assert.calledOnceWithExactly(
        client.doRequest,
        'DoReferenceTransaction',
        {
          ...defaultData,
          CURRENCYCODE: currency,
        }
      );
    });

    it('if request unsuccessful, throws PayPalClientError', async () => {
      const expectedPayload = {
        ...defaultData,
        USER: 'user',
        METHOD: 'DoReferenceTransaction',
        PWD: 'pwd',
        SIGNATURE: 'sig',
        VERSION: '204',
      };
      nock(PAYPAL_SANDBOX_BASE)
        .post(PAYPAL_NVP_ROUTE, client.objectToNVP(expectedPayload))
        .reply(
          200,
          client.objectToNVP(unSuccessfulDoReferenceTransactionResponse)
        );
      try {
        await client.doReferenceTransaction({
          amount: defaultData.AMT,
          billingAgreementId: defaultData.REFERENCEID,
          currencyCode: defaultData.CURRENCYCODE,
          idempotencyKey: defaultData.MSGSUBID,
          invoiceNumber: defaultData.INVNUM,
          ipaddress: defaultData.IPADDRESS,
        });
        assert.fail('Request should have thrown an error.');
      } catch (err) {
        assert.instanceOf(err, PayPalClientError);
        assert.equal(err.name, 'PayPalClientError');
        assert.include(err.raw, 'ACK=Failure');
        assert.equal(err.data.ACK, 'Failure');
        assert.equal(err.errorCode, 11451);
      }
    });
  });

  describe('ipnVerify', () => {
    it('calls API with valid message', async () => {
      const verifyPayload = 'cmd=_notify-validate&' + sampleIpnMessage;
      nock(PAYPAL_SANDBOX_IPN_BASE)
        .post(PAYPAL_IPN_ROUTE, verifyPayload)
        .reply(200, 'VERIFIED');
      const result = await client.ipnVerify(sampleIpnMessage);
      assert.equal(result, 'VERIFIED');
    });
  });

  describe('transactionSearch', () => {
    it('calls API with valid message', async () => {
      client.doRequest = sandbox.fake.resolves(searchTransactionResponse);
      const response = await client.transactionSearch({
        startDate: new Date('2010-09-02'),
        invoice: 'inv-000',
      });
      assert.equal(response, searchTransactionResponse);
    });
  });
});
