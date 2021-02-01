/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const { Container } = require('typedi');
const assert = { ...sinon.assert, ...require('chai').assert };
const { getRoute } = require('../../../routes_helpers');
const mocks = require('../../../mocks');
const { PayPalHelper } = require('../../../../lib/payments/paypal');
const uuid = require('uuid');

const SUBSCRIPTIONS_MANAGEMENT_SCOPE =
  'https://identity.mozilla.com/account/subscriptions';
const TEST_EMAIL = 'test@email.com';
const UID = uuid.v4({}, Buffer.alloc(16)).toString('hex');
const MOCK_SCOPES = ['profile:email', SUBSCRIPTIONS_MANAGEMENT_SCOPE];

let log, customs, request, payPalHelper;

function runTest(routePath, requestOptions) {
  const config = {
    subscriptions: {
      enabled: true,
      paypalNvpSigCredentials: {
        enabled: true,
      },
    },
  };
  const db = mocks.mockDB({
    uid: UID,
    email: TEST_EMAIL,
  });
  const routes = require('../../../../lib/routes/subscriptions')(
    log,
    db,
    config,
    customs,
    {}, // push
    {}, // mailer
    {}, // profile
    {} // stripeHelper
  );
  const route = getRoute(routes, routePath, requestOptions.method || 'GET');
  request = mocks.mockRequest(requestOptions);
  return route.handler(request);
}

/**
 * Paypal integration tests
 */
describe('subscriptions payPalRoutes', () => {
  let token;
  const requestOptions = {
    method: 'POST',
    auth: {
      credentials: {
        scope: MOCK_SCOPES,
        user: `${UID}`,
        email: `${TEST_EMAIL}`,
      },
    },
  };

  beforeEach(() => {
    sinon.createSandbox();
    log = mocks.mockLog();
    customs = mocks.mockCustoms();
    token = uuid.v4();
    payPalHelper = Container.get(PayPalHelper);
    payPalHelper.getCheckoutToken = sinon.fake.resolves(token);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('POST /oauth/subscriptions/paypal-checkout', () => {
    it('should call PayPalHelper.getCheckoutToken and return token in an object', async () => {
      const response = await runTest(
        '/oauth/subscriptions/paypal-checkout',
        requestOptions,
        payPalHelper
      );
      sinon.assert.calledOnce(payPalHelper.getCheckoutToken);
      assert.deepEqual(response, { token });
    });

    it('should log the call', async () => {
      await runTest(
        '/oauth/subscriptions/paypal-checkout',
        requestOptions,
        payPalHelper
      );
      sinon.assert.calledOnceWithExactly(
        log.begin,
        'subscriptions.getCheckoutToken',
        request
      );
      sinon.assert.calledOnceWithExactly(
        log.info,
        'subscriptions.getCheckoutToken.success',
        { token: token }
      );
    });

    it('should do a customs check', async () => {
      await runTest(
        '/oauth/subscriptions/paypal-checkout',
        requestOptions,
        payPalHelper
      );
      sinon.assert.calledOnceWithExactly(
        customs.check,
        request,
        TEST_EMAIL,
        'getCheckoutToken'
      );
    });
  });
});
