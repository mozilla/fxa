/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import Backbone from 'backbone';
import VerificationReasons from 'lib/verification-reasons';
import FxaClient from 'lib/fxa-client';
import Notifier from 'lib/channels/notifier';
import OAuthBroker from 'models/auth_brokers/oauth-redirect';
import Session from 'lib/session';
import sinon from 'sinon';
import SyncRelier from 'models/reliers/sync';
import View from 'views/ready';
import WindowMock from '../../mocks/window';

describe('views/ready', function() {
  let broker;
  let fxaClient;
  let metrics;
  let model;
  let notifier;
  let relier;
  let view;
  let windowMock;

  function createDeps() {
    windowMock = new WindowMock();
    // set a known userAgent that will display both buttons to begin with.
    windowMock.navigator.userAgent =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:50.0) Gecko/20100101 Firefox/50.0';

    relier = new SyncRelier({
      window: windowMock,
    });
    broker = new OAuthBroker({
      relier: relier,
      session: Session,
      window: windowMock,
    });
    fxaClient = new FxaClient();
    model = new Backbone.Model({});
    notifier = new Notifier();

    metrics = {
      flush: sinon.spy(Promise.resolve),
      logMarketingClick: sinon.spy(),
      logMarketingImpression: sinon.spy(),
    };
  }

  function createView(type, lang) {
    view = new View({
      broker: broker,
      fxaClient: fxaClient,
      lang: lang,
      metrics: metrics,
      model,
      notifier: notifier,
      relier: relier,
      type: type,
      viewName: 'ready',
      window: windowMock,
    });

    sinon.stub(view, 'getSignedInAccount').callsFake(() => {});
  }

  describe('render', function() {
    beforeEach(function() {
      createDeps();
    });

    afterEach(function() {
      view.remove();
      view.destroy();
    });

    var expectedHeaders = {
      FORCE_AUTH: '#fxa-force-auth-complete-header',
      PASSWORD_RESET: '#fxa-reset-password-complete-header',
      SIGN_IN: '#fxa-sign-in-complete-header',
      SIGN_UP: '#fxa-sign-up-complete-header',
      SUCCESSFUL_OAUTH: '#fxa-oauth-success-header',
    };

    for (var type in expectedHeaders) {
      it(
        'renders the correct header for `' + type + '`',
        function(type) {
          createView(VerificationReasons[type]);
          return view.render().then(function() {
            assert.ok(view.$(expectedHeaders[type]).length);
          });
        }.bind(null, type)
      );
    }

    it('shows service name if available', function() {
      createView(VerificationReasons.SIGN_UP);
      relier.set('serviceName', 'Firefox Sync');

      return view.render().then(function() {
        var html = view.$('section').text();
        assert.include(html, 'Firefox Sync');
      });
    });

    // regression test for #1216
    it('does not show service name if service is defined but serviceName is not', function() {
      createView(VerificationReasons.SIGN_UP);
      sinon.stub(view, 'setInitialContext').callsFake(context => {
        context.set('service', 'sync');
      });

      return view.render().then(function() {
        assert.ok(view.$('.account-ready-generic').length);
      });
    });

    it('shows the marketing campaign if supported by broker', function() {
      broker.setCapability('emailVerificationMarketingSnippet', true);

      relier.set('service', 'sync');
      createView(VerificationReasons.SIGN_UP);

      sinon.spy(view, 'logFlowEvent');

      return view.render().then(function() {
        assert.lengthOf(view.$('.marketing-link'), 2);

        // ensure clicks on the marketing links work as expected.
        $('#container').html(view.$el);

        view.$('.marketing-link-ios').click();
        assert.isTrue(metrics.logMarketingClick.calledOnce);
        assert.equal(
          metrics.logMarketingClick.args[0][0],
          'spring-2015-android-ios-sync'
        );
        assert.isTrue(view.logFlowEvent.calledOnce);
        assert.isTrue(
          view.logFlowEvent.calledWith('link.app-store.ios', 'ready')
        );

        view.$('.marketing-link-android').click();
        assert.isTrue(metrics.logMarketingClick.calledTwice);
        assert.equal(
          metrics.logMarketingClick.args[1][0],
          'spring-2015-android-ios-sync'
        );
        assert.isTrue(view.logFlowEvent.calledTwice);
        assert.isTrue(
          view.logFlowEvent.calledWith('link.app-store.android', 'ready')
        );
      });
    });

    it('does not show marketing if the broker does not support it', function() {
      broker.setCapability('emailVerificationMarketingSnippet', false);

      createView(VerificationReasons.SIGN_UP);

      return view.render().then(function() {
        assert.equal(view.$('.marketing').length, 0);
        assert.equal(view.$('.os-general').length, 0);
      });
    });

    it('shows the `Start browsing` for Sync', () => {
      createView(VerificationReasons.SIGN_UP);
      sinon.stub(relier, 'isSync').callsFake(() => true);

      return view.render().then(() => {
        assert.lengthOf(view.$('.btn-start-browsing'), 1);
      });
    });

    it('does not show the `Continue` for Sync', () => {
      createView(VerificationReasons.SIGN_UP);
      sinon.stub(relier, 'isSync').callsFake(() => true);

      return view.render().then(() => {
        assert.lengthOf(view.$('.btn-continue'), 0);
      });
    });

    it('does not show the `Continue` button in OAuth flows by default', () => {
      createView(VerificationReasons.SIGN_UP);
      sinon.stub(relier, 'isSync').callsFake(() => false);
      relier.set('serviceName', 'Firefox Notes');

      return view.render().then(() => {
        assert.lengthOf(view.$('.btn-continue'), 0);
      });
    });

    it('shows the `Continue` button in OAuth flows if `continueBrokerMethod` is defined', () => {
      model.set('continueBrokerMethod', 'finishOAuthFlow');
      sinon.stub(relier, 'isSync').callsFake(() => false);
      relier.set('serviceName', 'Firefox Notes');

      createView(VerificationReasons.SIGN_UP);

      return view.render().then(() => {
        assert.lengthOf(view.$('.btn-continue'), 1);
      });
    });

    it('shows `Create recovery key` if in recoveryKey `treatment`', () => {
      createView(VerificationReasons.PASSWORD_RESET);
      sinon.stub(view, 'isPasswordReset').callsFake(() => true);

      return view.render().then(() => {
        assert.lengthOf(view.$('.btn-continue'), 0);
      });
    });

    it('shows the success view for oauth', () => {
      createView(VerificationReasons.SUCCESSFUL_OAUTH);

      return view.render().then(() => {
        assert.lengthOf(view.$('#fxa-oauth-success-header'), 1);
        assert.lengthOf(view.$('.account-ready-service'), 1);
      });
    });
  });

  describe('continue', () => {
    const account = {};

    beforeEach(() => {
      createDeps();
      createView(VerificationReasons.SIGN_IN);
      model.set({
        account,
        continueBrokerMethod: 'methodName',
      });
    });

    it('invokes `continueBrokerMethod` with `account` from the model', () => {
      sinon.stub(view, 'invokeBrokerMethod').callsFake(() => Promise.resolve());

      return view.continue().then(() => {
        assert.isTrue(view.invokeBrokerMethod.calledOnce);
        assert.isTrue(
          view.invokeBrokerMethod.calledWith('methodName', account)
        );
      });
    });

    it('handles errors from the continueBrokerMethod', () => {
      const err = AuthErrors.toError('UNEXPECTED_ERROR');
      sinon
        .stub(view, 'invokeBrokerMethod')
        .callsFake(() => Promise.reject(err));
      sinon.stub(view, 'displayError');

      return view.continue().then(() => {
        assert.isTrue(view.displayError.calledOnceWith(err));
      });
    });
  });
});
