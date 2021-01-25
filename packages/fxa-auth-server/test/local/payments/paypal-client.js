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
  PAYPAL_NVP_ROUTE,
  PAYPAL_SANDBOX_API,
  PAYPAL_LIVE_API,
  PLACEHOLDER_URL,
} = require('../../../lib/payments/paypal-client');

const ERROR_RESPONSE =
  'TIMESTAMP=2011%2d11%2d15T20%3a27%3a02Z&CORRELATIONID=5be53331d9700&ACK=Failure&VERSION=78%2e0&BUILD=000000&L_ERRORCODE0=15005&L_SHORTMESSAGE0=Processor%20Decline&L_LONGMESSAGE0=This%20transaction%20cannot%20be%20processed%2e&L_SEVERITYCODE0=Error&L_ERRORPARAMID0=ProcessorResponse&L_ERRORPARAMVALUE0=0051&AMT=10%2e40&CURRENCYCODE=USD&AVSCODE=X&CVV2MATCH=M';
const successfulSetExpressCheckoutResponse = require('./fixtures/paypal/set_express_checkout_success.json');
const unSuccessfulSetExpressCheckoutResponse = require('./fixtures/paypal/set_express_checkout_failure.json');

describe('PayPalClient', () => {
  let client;

  beforeEach(() => {
    client = new PayPalClient({
      user: 'user',
      sandbox: true,
      pwd: 'pwd',
      signature: 'sig',
    });
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
    let sandbox;
    const defaultData = {
      PAYMENTREQUEST_0_AMT: '0',
      RETURNURL: PLACEHOLDER_URL,
      CANCELURL: PLACEHOLDER_URL,
      L_BILLINGTYPE0: 'MerchantInitiatedBilling',
    };

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(function () {
      sandbox.restore();
    });

    it('calls api with correct method and data', () => {
      client.doRequest = sandbox.fake.resolves(
        successfulSetExpressCheckoutResponse
      );
      client.setExpressCheckout();
      assert.ok(
        client.doRequest.calledOnceWithExactly(
          'SetExpressCheckout',
          defaultData
        )
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
        await client.setExpressCheckout();
        assert.fail('Request should have thrown an error.');
      } catch (err) {
        assert.instanceOf(err, PayPalClientError);
        assert.equal(err.name, 'PayPalClientError');
        assert.include(err.raw, 'ACK=Failure');
        assert.equal(err.data.ACK, 'Failure');
      }
    });
  });
});
