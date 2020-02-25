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
import SentryMetrics from 'lib/sentry';
import sinon from 'sinon';
import User from 'models/user';
import View from 'views/post_verify/account_recovery/save_recovery_key';
import WindowMock from '../../../../mocks/window';
import $ from 'jquery';

describe('views/post_verify/account_recovery/save_recovery_key', () => {
  let account;
  let broker;
  let metrics;
  let model;
  let notifier;
  let relier;
  let sentryMetrics;
  let user;
  let view;
  let windowMock;

  beforeEach(() => {
    windowMock = new WindowMock();
    relier = new Relier({
      window: windowMock,
    });
    broker = new BaseBroker({
      relier,
      window: windowMock,
    });
    account = new Account({
      email: 'a@a.com',
      uid: 'uid',
    });
    model = new Backbone.Model({
      account,
      recoveryKey: 'somekey',
      recoveryKeyId: 'somekeyid',
    });
    notifier = _.extend({}, Backbone.Events);
    sentryMetrics = new SentryMetrics();
    metrics = new Metrics({ notifier, sentryMetrics });
    user = new User();
    view = new View({
      broker,
      metrics,
      model,
      notifier,
      relier,
      user,
    });

    sinon.stub(view, 'getSignedInAccount').callsFake(() => account);

    return view.render().then(() => $('#container').html(view.$el));
  });

  afterEach(function() {
    metrics.destroy();
    view.remove();
    view.destroy();
  });

  describe('render', () => {
    it('renders the view', () => {
      assert.lengthOf(view.$('#fxa-save-recovery-key-header'), 1);
      assert.lengthOf(view.$('.primary-button'), 1);
      assert.lengthOf(view.$('.graphic-download-option'), 1);
      assert.lengthOf(view.$('.graphic-copy-option'), 1);
      assert.lengthOf(view.$('.graphic-print-option'), 1);
    });

    describe('without an account', () => {
      beforeEach(() => {
        account = new Account({});
        sinon.spy(view, 'navigate');
        return view.render();
      });

      it('redirects to the email first page', () => {
        assert.isTrue(view.navigate.calledWith('/'));
      });
    });
  });

  describe('click done', () => {
    describe('success', () => {
      beforeEach(() => {
        sinon.spy(view, 'navigate');
        return view.submit();
      });

      it('navigates to confirm page', () => {
        assert.isTrue(
          view.navigate.calledWith(
            '/post_verify/account_recovery/confirm_recovery_key',
            {
              recoveryKey: 'somekey',
              recoveryKeyId: 'somekeyid',
            }
          )
        );
      });
    });
  });
});
