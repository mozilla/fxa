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

  beforeEach(function() {
    account = new Account();
    config = {
      subscriptions: {
        managementClientId: 'MOCK_CLIENT_ID',
        managementScopes: 'MOCK_SCOPES',
        managementTokenTTL: 900,
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
    };
  });

  it('redirects as expected', () => {
    const REDIRECT_PATH = 'example/path';
    PaymentServer.navigateToPaymentServer(
      view,
      config.subscriptions,
      REDIRECT_PATH
    ).then(() => {
      assert.lengthOf(view.getSignedInAccount.args, 1);
      assert.deepEqual(
        account.createOAuthToken.args[0],
        [
          config.subscriptions.managementScopes,
          {
            //eslint-disable-next-line camelcase
            client_id: config.subscriptions.managementClientId,
            ttl: config.subscriptions.managementTokenTTL,
          },
        ],
        'should make the correct call to account.createOAuthToken'
      );
      assert.deepEqual(
        view.navigateAway.args[0][0],
        `${config.subscriptions.managementUrl}/${REDIRECT_PATH}#accessToken=MOCK_TOKEN`,
        'should make the correct call to navigateAway'
      );
    });
  });
});
