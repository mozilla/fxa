/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'underscore';
import { assert } from 'chai';
import Account from 'models/account';
import Backbone from 'backbone';
import BaseBroker from 'models/auth_brokers/base';
import Metrics from 'lib/metrics';
import Relier from 'models/reliers/relier';
import sinon from 'sinon';
import User from 'models/user';
import View from 'views/push/confirm_login';
import WindowMock from '../../../mocks/window';
import $ from 'jquery';

describe('views/push/confirm_login', () => {
  let account;
  let broker;
  let metrics;
  let model;
  let notifier;
  let relier;
  let user;
  let view;
  let windowMock;
  const ua = {
    uaBrowser: 'Firefox',
    uaOS: 'OSX',
  };

  beforeEach(() => {
    windowMock = new WindowMock();

    relier = new Relier({
      window: windowMock,
    });

    broker = new BaseBroker({
      relier: relier,
      window: windowMock,
    });

    account = new Account({
      email: 'a@a.com',
      uid: 'uid',
    });

    model = new Backbone.Model({
      account,
    });

    notifier = _.extend({}, Backbone.Events);
    metrics = new Metrics({ notifier });

    user = new User();

    view = new View({
      broker,
      metrics,
      model,
      notifier,
      relier,
      user,
      window: windowMock,
      ua,
      ip: '123.123.123.123',
      code: 'validCode',
    });

    sinon.stub(view, 'getSignedInAccount').callsFake(() => account);

    return view.render().then(() => $('#container').html(view.$el));
  });

  afterEach(() => {
    metrics.destroy();
    view.remove();
    view.destroy();
    view = metrics = null;
  });

  describe('render', () => {
    it('renders the view', () => {
      assert.lengthOf(view.$('#fxa-push-confirm-login-header'), 1);
      assert.include(
        view.$('.verification-message').text(),
        'please confirm this sign-in'
      );
      assert.lengthOf(view.$('#submit-btn'), 1);
      assert.lengthOf(view.$('#change-password'), 1);
      assert.include(view.$('.push-confirm-login-device').text(), 'Firefox');
      assert.include(
        view.$('.push-confirm-login-device').text(),
        '123.123.123.123'
      );
      assert.include(
        view.$('.push-confirm-login-device').text(),
        'Location unknown'
      );
    });
  });

  describe('submit', () => {
    describe('success', () => {
      beforeEach(() => {
        sinon.stub(account, 'verifySignUp').callsFake(() => Promise.resolve());
        sinon.spy(view, 'navigate');

        return view.submit();
      });

      it('calls correct methods', () => {
        assert.isTrue(
          account.verifySignUp.calledWith('validCode'),
          'verify with correct code'
        );
        assert.isTrue(view.navigate.calledOnceWith('/push/completed'));
      });
    });
  });
});
