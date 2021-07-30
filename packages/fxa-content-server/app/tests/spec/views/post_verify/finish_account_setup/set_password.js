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
import View from 'views/post_verify/finish_account_setup/set_password';
import WindowMock from '../../../../mocks/window';
import $ from 'jquery';

describe('views/post_verify/finish_account_setup/set_password', () => {
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
    windowMock.location.search =
      '?email=a@asdf.com&productName=123&token=e39ed2d69690c9392d74fb8a98603c426002eb3f25215c71fc7085ff74c31f34&code=90cf17f3b75c1b76d79500bc1499caac&redirectUrl=https://www.mozilla.org/en-US/products/vpn/';

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
      window: windowMock,
    });

    sinon.stub(view, 'getAccount').callsFake(() => account);

    sinon
      .stub(account, 'checkEmailExists')
      .callsFake(() => Promise.resolve(true));

    sinon
      .stub(account, 'isPasswordResetComplete')
      .callsFake(() => Promise.resolve(false));

    sinon
      .stub(view, '_createPasswordWithStrengthBalloonView')
      .callsFake(() => ({
        afterRender() {},
        on() {},
      }));

    return view.render().then(() => $('#container').html(view.$el));
  });

  afterEach(function () {
    metrics.destroy();
    view.remove();
    view.destroy();
  });

  describe('render', () => {
    it('renders the view', () => {
      assert.lengthOf(view.$('#fxa-account-setup-set-password-header'), 1);
      assert.equal(view.$('#email').text(), 'a@a.com');
      assert.lengthOf(view.$('#password'), 1);
      assert.lengthOf(view.$('#vpassword'), 1);
      assert.lengthOf(view.$('button[type=submit]'), 1);
    });
  });

  describe('with non-existent email', () => {
    beforeEach(() => {
      account.checkEmailExists.restore();
      sinon
        .stub(account, 'checkEmailExists')
        .callsFake(() => Promise.resolve(false));
      sinon.spy(view, 'navigate');
      sinon.spy(view, 'logError');
      return view.render().then(() => $('#container').html(view.$el));
    });

    it('should redirect to `/`', () => {
      assert.isTrue(
        view.navigate.calledWith('/', {}, { clearQueryParams: true })
      );
      assert.isTrue(view.logError.calledWith(sinon.match.has('errno', 1023)));
    });
  });

  describe('with invalid params', () => {
    beforeEach(() => {
      sinon.spy(view, 'logError');
    });

    it('invalid code', async () => {
      view._verificationInfo.set('code', 'invalid');
      await view.render();
      assert.lengthOf(view.$('#fxa-account-setup-set-damaged-header'), 1);
      assert.isTrue(view.logError.calledWith(sinon.match.has('errno', 1026)));
    });

    it('invalid redirectUrl', async () => {
      view._verificationInfo.set('redirectUrl', 'invalid');
      await view.render();
      assert.lengthOf(view.$('#fxa-account-setup-set-damaged-header'), 1);
      assert.isTrue(view.logError.calledWith(sinon.match.has('errno', 1026)));
    });

    it('invalid token', async () => {
      view._verificationInfo.set('token', 'invalid');
      await view.render();
      assert.lengthOf(view.$('#fxa-account-setup-set-damaged-header'), 1);
      assert.isTrue(view.logError.calledWith(sinon.match.has('errno', 1026)));
    });
  });

  describe('with used password reset code', () => {
    beforeEach(() => {
      account.isPasswordResetComplete.restore();
      sinon
        .stub(account, 'isPasswordResetComplete')
        .callsFake(() => Promise.resolve(true));
      sinon.spy(view, 'navigateAway');
      sinon.spy(view, 'logError');
    });
    it('should call redirectUrl', async () => {
      await view.render();
      assert.isTrue(
        view.navigateAway.calledWith(
          'https://www.mozilla.org/en-US/products/vpn/'
        )
      );
      assert.isTrue(view.logError.calledWith(sinon.match.has('errno', 1025)));
    });
  });

  describe('submit', () => {
    describe('success', () => {
      beforeEach(() => {
        sinon
          .stub(user, 'completeAccountPasswordReset')
          .callsFake(() => Promise.resolve(true));
        sinon.spy(view, 'navigateAway');
        view.$('#password').val('password');
        view.$('#vpassword').val('password');
        return view.submit();
      });
      it('set password and navigates to redirectUrl', () => {
        assert.isTrue(
          view.navigateAway.calledWith(
            'https://www.mozilla.org/en-US/products/vpn/'
          )
        );
      });
    });

    describe('errors', async () => {
      it('with error', async () => {
        const error = new Error('failed');
        sinon.spy(view, 'logError');
        sinon
          .stub(user, 'completeAccountPasswordReset')
          .callsFake(() => Promise.reject(error));
        try {
          await view.submit();
          assert.fail('should have failed');
        } catch (err) {
          assert.isTrue(view.logError.calledWith(error));
        }
      });

      it('with invalid passwords', async () => {
        sinon.spy(view, 'logError');
        view.$('#password').val('password1');
        view.$('#vpassword').val('password2');
        view.showValidationErrorsEnd();

        assert.isTrue(view.logError.calledWith(sinon.match.has('errno', 1004)));
      });
    });
  });
});
