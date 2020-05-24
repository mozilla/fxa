/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import Notifier from 'lib/channels/notifier';
import ProfileClient from 'lib/profile-client';
import sinon from 'sinon';
import TestHelpers from '../../../lib/helpers';
import View from 'views/settings/subscription';
import PaymentServer from 'lib/payment-server';
import User from 'models/user';

describe('views/settings/subscription', function () {
  var view;
  var account;
  var config;
  var UID = TestHelpers.createUid();

  beforeEach(function () {
    config = {
      subscriptions: {
        managementClientId: 'MOCK_CLIENT_ID',
        managementScopes: 'MOCK_SCOPES',
        managementTokenTTL: 1800,
        managementUrl: 'http://example.com',
      },
    };

    view = new View({ config });
    const notifier = new Notifier();
    const profileClient = new ProfileClient();

    const user = new User({
      notifier: notifier,
      profileClient: profileClient,
    });

    account = user.initAccount({
      email: 'a@a.com',
      sessionToken: 'abc123',
      uid: UID,
      verified: true,
    });
    sinon.stub(view, 'beforeRender').returns(account);

    sinon
      .stub(PaymentServer, 'navigateToPaymentServer')
      .callsFake(() => Promise.resolve(true));
  });

  afterEach(function () {
    PaymentServer.navigateToPaymentServer.restore();
    view.beforeRender.restore();
    $(view.el).remove();
    view.destroy();
    view = null;
  });

  describe('render', () => {
    it('renders an empty container when there are no active subscriptions', () => {
      sinon.stub(account, 'hasSubscriptions').resolves(false);
      view.render().then(() => {
        assert.lengthOf(view.$('#manage-subscription'), 0);
      });
      account.hasSubscriptions.restore();
    });

    it('renders the content when there are active subscriptions', () => {
      sinon.stub(account, 'hasSubscriptions').resolves(true);
      view.render().then(() => {
        assert.lengthOf(view.$('#manage-subscription'), 1);
      });
      account.hasSubscriptions.restore();
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
