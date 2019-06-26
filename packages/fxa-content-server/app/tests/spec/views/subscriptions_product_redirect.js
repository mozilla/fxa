/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import Account from 'models/account';
import { assert } from 'chai';
import sinon from 'sinon';
import User from 'models/user';
import View from 'views/subscriptions_product_redirect';
import Notifier from 'lib/channels/notifier';
import WindowMock from '../../mocks/window';
import PaymentServer from 'lib/payment-server';

const PRODUCT_ID = 'pk_8675309';
const SEARCH_QUERY = '?plan_id=plk_12345';

describe('views/subscriptions_product_redirect', function () {
  let account;
  let user;
  let view;
  let windowMock;
  let config;
  let notifier;

  function render() {
    return view.render()
      .then(() => view.afterVisible());
  }

  beforeEach(function () {
    user = new User();
    account = new Account();
    notifier = new Notifier();
    windowMock = new WindowMock();
    windowMock.location.search = SEARCH_QUERY;

    config = {
      subscriptions: {
        managementClientId: 'MOCK_CLIENT_ID',
        managementScopes: 'MOCK_SCOPES',
        managementTokenTTL: 900,
        managementUrl: 'http://example.com',
      }
    };

    sinon.stub(user, 'sessionStatus').callsFake(() => Promise.resolve(account));

    view = new View({
      config,
      currentPage: `subscriptions/product/${PRODUCT_ID}`,
      notifier,
      user,
      window: windowMock,
    });

    sinon.stub(view, 'getSignedInAccount').callsFake(() => account);

    sinon.stub(PaymentServer, 'navigateToPaymentServer')
      .callsFake(() => Promise.resolve(true));

    return render();
  });

  afterEach(function () {
    PaymentServer.navigateToPaymentServer.restore();
    $(view.el).remove();
    view.destroy();
    view = null;
  });

  describe('render', () => {
    it('renders correctly', () => {
      assert.lengthOf(view.$('.subscriptions-redirect'), 1);
    });

    it('calls PaymentServer.navigateToPaymentServer as expected', () => {
      assert.deepEqual(
        PaymentServer.navigateToPaymentServer.args,
        [
          [
            view,
            config.subscriptions,
            `products/${PRODUCT_ID}${SEARCH_QUERY}`
          ]
        ]
      );
    });
  });
});
