/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const { assert } = require('chai');
  const VerificationReasons = require('lib/verification-reasons');
  const FxaClient = require('lib/fxa-client');
  const Notifier = require('lib/channels/notifier');
  const OAuthBroker = require('models/auth_brokers/oauth');
  const p = require('lib/promise');
  const Session = require('lib/session');
  const sinon = require('sinon');
  const SyncRelier = require('models/reliers/sync');
  const View = require('views/ready');
  const WindowMock = require('../../mocks/window');

  describe('views/ready', function () {
    let broker;
    let fxaClient;
    let metrics;
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
        window: windowMock
      });
      broker = new OAuthBroker({
        relier: relier,
        session: Session,
        window: windowMock
      });
      fxaClient = new FxaClient();
      notifier = new Notifier();

      metrics = {
        flush: sinon.spy(p),
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
        notifier: notifier,
        relier: relier,
        type: type,
        viewName: 'ready',
        window: windowMock
      });
    }

    describe('render', function () {
      beforeEach(function () {
        createDeps();
      });

      afterEach(function () {
        view.remove();
        view.destroy();
      });

      var expectedHeaders = {
        FORCE_AUTH: '#fxa-force-auth-complete-header',
        PASSWORD_RESET: '#fxa-reset-password-complete-header',
        SIGN_IN: '#fxa-sign-in-complete-header',
        SIGN_UP: '#fxa-sign-up-complete-header'
      };

      for (var type in expectedHeaders) {
        it('renders the correct header for `' + type + '`', function (type) {
          createView(VerificationReasons[type]);
          return view.render()
            .then(function () {
              assert.ok(view.$(expectedHeaders[type]).length);
            });
        }.bind(null, type));
      }

      it('shows service name if available', function () {
        createView(VerificationReasons.SIGN_UP);
        relier.set('serviceName', 'Firefox Sync');

        return view.render()
          .then(function () {
            var html = view.$('section').text();
            assert.include(html, 'Firefox Sync');
          });
      });

      // regression test for #1216
      it('does not show service name if service is defined but serviceName is not', function () {
        createView(VerificationReasons.SIGN_UP);
        sinon.stub(view, 'setInitialContext', (context) => {
          context.set('service', 'sync');
        });

        return view.render()
          .then(function () {
            assert.ok(view.$('.account-ready-generic').length);
          });
      });

      it('shows the marketing campaign if supported by broker', function () {
        broker.setCapability('emailVerificationMarketingSnippet', true);

        relier.set('service', 'sync');
        createView(VerificationReasons.SIGN_UP);

        sinon.spy(view, 'logFlowEvent');

        return view.render()
          .then(function () {
            assert.lengthOf(view.$('.marketing-link'), 2);

            // ensure clicks on the marketing links work as expected.
            $('#container').html(view.$el);

            view.$('.marketing-link-ios').click();
            assert.isTrue(metrics.logMarketingClick.calledOnce);
            assert.equal(metrics.logMarketingClick.args[0][0], 'spring-2015-android-ios-sync');
            assert.isTrue(view.logFlowEvent.calledOnce);
            assert.isTrue(view.logFlowEvent.calledWith('link.app-store.ios', 'ready'));

            view.$('.marketing-link-android').click();
            assert.isTrue(metrics.logMarketingClick.calledTwice);
            assert.equal(metrics.logMarketingClick.args[1][0], 'spring-2015-android-ios-sync');
            assert.isTrue(view.logFlowEvent.calledTwice);
            assert.isTrue(view.logFlowEvent.calledWith('link.app-store.android', 'ready'));
          });
      });

      it('does not show marketing if the broker does not support it', function () {
        broker.setCapability('emailVerificationMarketingSnippet', false);

        createView(VerificationReasons.SIGN_UP);

        return view.render()
          .then(function () {
            assert.equal(view.$('.marketing').length, 0);
            assert.equal(view.$('.os-general').length, 0);
          });
      });
    });
  });
});
