/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import sinon from 'sinon';
import Account from 'models/account';
import PaymentServer from 'lib/payment-server';

describe('lib/payment-server-redirect', () => {
  var account;
  var view;
  var tokenMock;
  var config;

  beforeEach(function () {
    account = new Account();
    config = {
      subscriptions: {
        managementClientId: 'MOCK_CLIENT_ID',
        managementScopes: 'MOCK_SCOPES',
        managementTokenTTL: 1800,
        managementUrl: 'http://example.com',
      },
    };
    tokenMock = {
      get: () => 'MOCK_TOKEN',
    };
    sinon
      .stub(account, 'createOAuthToken')
      .callsFake(() => Promise.resolve(tokenMock));
    view = {
      getSignedInAccount: sinon.stub().callsFake(() => account),
      navigateAway: sinon.spy(),
      metrics: {
        getFlowEventMetadata: sinon.spy(() => ({
          deviceId: 'biz',
          flowBeginTime: 4321,
          flowId: 'foo',
        })),
      },
    };
  });

  it('redirects as expected', () => {
    const REDIRECT_PATH = 'example/path';
    return PaymentServer.navigateToPaymentServer(
      view,
      config.subscriptions,
      REDIRECT_PATH
    ).then(() => {
      assert.lengthOf(view.getSignedInAccount.args, 1);
      assert.deepEqual(
        account.createOAuthToken.args[0],
        [
          config.subscriptions.managementClientId,
          {
            scope: config.subscriptions.managementScopes,
            ttl: config.subscriptions.managementTokenTTL,
          },
        ],
        'should make the correct call to account.createOAuthToken'
      );
      assert.strictEqual(
        view.navigateAway.args[0][0],
        `${config.subscriptions.managementUrl}/${REDIRECT_PATH}?device_id=biz&flow_begin_time=4321&flow_id=foo#accessToken=MOCK_TOKEN`,
        'should make the correct call to navigateAway'
      );
    });
  });

  it('redirects as expected with query string', () => {
    const REDIRECT_PATH = 'example/path';
    return PaymentServer.navigateToPaymentServer(
      view,
      config.subscriptions,
      REDIRECT_PATH,
      { foo: 'bar', fizz: '', quuz: '&buzz', buzz: null }
    ).then(() => {
      assert.strictEqual(
        view.navigateAway.args[0][0],
        `${config.subscriptions.managementUrl}/${REDIRECT_PATH}?device_id=biz&flow_begin_time=4321&flow_id=foo&foo=bar&quuz=%26buzz#accessToken=MOCK_TOKEN`,
        'should make the correct call to navigateAway'
      );
    });
  });
});
