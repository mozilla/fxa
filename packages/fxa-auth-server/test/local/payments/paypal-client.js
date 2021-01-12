/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const nock = require('nock');

const {
  PayPalClient,
  PAYPAL_SANDBOX_API,
  PAYPAL_LIVE_API,
} = require('../../../lib/payments/paypal-client');

const ERROR_RESPONSE =
  'TIMESTAMP=2011%2d11%2d15T20%3a27%3a02Z&CORRELATIONID=5be53331d9700&ACK=Failure&VERSION=78%2e0&BUILD=000000&L_ERRORCODE0=15005&L_SHORTMESSAGE0=Processor%20Decline&L_LONGMESSAGE0=This%20transaction%20cannot%20be%20processed%2e&L_SEVERITYCODE0=Error&L_ERRORPARAMID0=ProcessorResponse&L_ERRORPARAMVALUE0=0051&AMT=10%2e40&CURRENCYCODE=USD&AVSCODE=X&CVV2MATCH=M';

describe('PayPalClient', () => {
  const expectedPayload =
    'NAME=Robert%20Moore&COMPANY=R.%20H.%20Moore%20%26%20Associates&USER=user&METHOD=BillAgreementUpdate&PWD=pwd&SIGNATURE=sig&VERSION=204';
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
    it('succeeds', async () => {
      nock('https://api-3t.sandbox.paypal.com')
        .post('/nvp', expectedPayload)
        .reply(
          200,
          'NAME=Robert%20Moore&COMPANY=R.%20H.%20Moore%20%26%20Associates'
        );
      const expectedObject = {
        NAME: 'Robert Moore',
        COMPANY: 'R. H. Moore & Associates',
      };
      const result = await client.doRequest(
        'BillAgreementUpdate',
        expectedObject
      );
      assert.deepEqual(result, expectedObject);
    });

    it('fails', async () => {
      nock('https://api-3t.sandbox.paypal.com')
        .post('/nvp', expectedPayload)
        .reply(500, 'ERROR');
      nock('https://api-3t.sandbox.paypal.com')
        .post('/nvp', expectedPayload)
        .reply(
          200,
          'NAME=Robert%20Moore&COMPANY=R.%20H.%20Moore%20%26%20Associates'
        );
      const expectedObject = {
        NAME: 'Robert Moore',
        COMPANY: 'R. H. Moore & Associates',
      };
      const result = await client.doRequest(
        'BillAgreementUpdate',
        expectedObject
      );
      assert.deepEqual(result, expectedObject);
    });
  });
});
