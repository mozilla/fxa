/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const uuid = require('uuid');
const sinon = require('sinon');
const { Container } = require('typedi');

const mocks = require('../../../mocks');

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
});
