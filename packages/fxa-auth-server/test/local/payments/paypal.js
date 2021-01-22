/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const { StatsD } = require('hot-shots');
const sinon = require('sinon');

const { mockLog } = require('../../mocks');
const { Container } = require('typedi');

const {
  PayPalClient,
  PayPalClientError,
} = require('../../../lib/payments/paypal-client');
const { PayPalHelper } = require('../../../lib/payments/paypal');

const successfulSetExpressCheckoutResponse = require('./fixtures/paypal/set_express_checkout_success.json');

describe('PayPalHelper', () => {
  /** @type PayPalHelper */
  let paypalHelper;

  beforeEach(() => {
    // Make PayPalClient
    const paypalClient = new PayPalClient({
      user: 'user',
      sandbox: true,
      pwd: 'pwd',
      signature: 'sig',
    });
    Container.set(PayPalClient, paypalClient);
    // Make StatsD
    const statsd = { increment: sinon.spy() };
    Container.set(StatsD, statsd);
    // Make PayPalHelper
    paypalHelper = new PayPalHelper({ mockLog });
  });

  describe('constructor', () => {
    it('sets client, statsd, and logger', () => {
      const paypalClient = new PayPalClient({
        user: 'user',
        sandbox: true,
        pwd: 'pwd',
        signature: 'sig',
      });
      const statsd = { increment: sinon.spy() };
      Container.set(PayPalClient, paypalClient);
      Container.set(StatsD, statsd);

      const pph = new PayPalHelper({ log: mockLog });
      assert.equal(pph.client, paypalClient);
      assert.equal(pph.log, mockLog);
      assert.equal(pph.metrics, statsd);
    });
  });

  describe('getCheckoutToken', () => {
    it('it returns the token from doRequest', async () => {
      paypalHelper.client.doRequest = sinon.fake.resolves(
        successfulSetExpressCheckoutResponse
      );
      const token = await paypalHelper.getCheckoutToken();
      assert.equal(token, successfulSetExpressCheckoutResponse.TOKEN);
    });

    it('if doRequest unsuccessful, throws an error', async () => {
      paypalHelper.client.doRequest = sinon.fake.throws(
        new PayPalClientError('Fake', {})
      );
      try {
        await paypalHelper.getCheckoutToken();
        assert.fail('Request should have thrown an error.');
      } catch (err) {
        assert.instanceOf(err, PayPalClientError);
        assert.equal(err.name, 'PayPalClientError');
      }
    });
  });
});
