/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import sinon from 'sinon';
import View from 'views/settings/subscription';
import PaymentServer from 'lib/payment-server';

describe('views/settings/subscription', function() {
  var view;
  var config;

  function render() {
    return view.render().then(() => view.afterVisible());
  }

  beforeEach(function() {
    config = {
      subscriptions: {
        managementClientId: 'MOCK_CLIENT_ID',
        managementScopes: 'MOCK_SCOPES',
        managementTokenTTL: 900,
        managementUrl: 'http://example.com',
      },
    };

    view = new View({ config });

    sinon
      .stub(PaymentServer, 'navigateToPaymentServer')
      .callsFake(() => Promise.resolve(true));

    return render();
  });

  afterEach(function() {
    PaymentServer.navigateToPaymentServer.restore();
    $(view.el).remove();
    view.destroy();
    view = null;
  });

  describe('render', () => {
    it('renders correctly', () => {
      assert.lengthOf(view.$('#manage-subscription'), 1);
    });
  });

  describe('submit', () => {
    it('calls PaymentServer.navigateToPaymentServer as expected', () => {
      return view.submit().then(() => {
        const args = PaymentServer.navigateToPaymentServer.getCall(0).args;
        assert.deepEqual(args, [view, config.subscriptions, 'subscriptions']);
      });
    });
  });
});
