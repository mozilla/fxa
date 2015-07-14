/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'sinon',
  'views/ready',
  'lib/session',
  'lib/fxa-client',
  'lib/able',
  'lib/promise',
  'models/reliers/fx-desktop',
  'models/auth_brokers/oauth',
  '../../mocks/window'
],
function (chai, sinon, View, Session, FxaClient, Able, p, FxDesktopRelier,
      OAuthBroker, WindowMock) {
  'use strict';

  var assert = chai.assert;

  describe('views/ready', function () {
    var view;
    var windowMock;
    var fxaClient;
    var relier;
    var broker;
    var able;
    var metrics;

    function createView() {
      windowMock = new WindowMock();
      relier = new FxDesktopRelier({
        window: windowMock
      });
      broker = new OAuthBroker({
        session: Session,
        window: windowMock,
        relier: relier
      });
      fxaClient = new FxaClient();

      able = new Able();
      metrics = {
        flush: sinon.spy(p),
        logMarketingImpression: function () {}
      };
      view = new View({
        window: windowMock,
        fxaClient: fxaClient,
        relier: relier,
        broker: broker,
        able: able,
        metrics: metrics
      });
    }

    beforeEach(function () {
      createView();
    });

    afterEach(function () {
      view.remove();
      view.destroy();
      view = null;
    });

    describe('render', function () {
      it('renders with correct header for reset_password type', function () {
        view.type = 'reset_password';

        return view.render()
          .then(function () {
            assert.ok(view.$('#fxa-reset-password-complete-header').length);
          });
      });

      it('renders with correct header for sign_up type', function () {
        view.type = 'sign_up';
        return view.render()
          .then(function () {
            assert.ok(view.$('#fxa-sign-up-complete-header').length);
          });
      });

      it('renders with correct header for account_unlock type', function () {
        view.type = 'account_unlock';
        return view.render()
          .then(function () {
            assert.ok(view.$('#fxa-account-unlock-complete-header').length);
          });
      });

      it('shows service name if available', function () {
        relier.set('serviceName', 'Firefox Sync');

        return view.render()
          .then(function () {
            var html = view.$('section').text();
            assert.include(html, 'Firefox Sync');
          });
      });

      // regression test for #1216
      it('does not show service name if service is defined but serviceName is not', function () {
        view.context = function () {
          return {
            service: 'sync'
          };
        };

        return view.render()
          .then(function () {
            assert.ok(view.$('.account-ready-generic').length);
          });
      });

      it('shows some form of marketing for english speakers', function () {
        view.type = 'sign_up';
        Session.set('language', 'en');
        relier.set('service', 'sync');

        return view.render()
          .then(function () {
            assert.equal(view.$('.marketing').length, 1);
          });
      });

      it('shows the spring 2015 snippet if the campaign has started', function () {
        sinon.stub(able, 'choose', function () {
          return true;
        });

        view.type = 'sign_up';
        relier.set('service', 'sync');

        return view.render()
          .then(function () {
            assert.isTrue(able.choose.calledWith('springCampaign2015'));
            assert.ok(view.$('.os-general').length);
          });
      });

      it('formats the service name correctly depending on the always redirect param', function () {
        var serviceName = 'Find My Device';
        var redirectUri = 'https://find.firefox.com';
        view.type = 'sign_up';
        relier.set('redirectUri', redirectUri);
        relier.set('serviceName', serviceName);
        assert.isFalse(view.context().showProceedButton);
        assert.equal(view.context().redirectUri, redirectUri);

        relier.set('verificationRedirect', 'always');
        assert.isTrue(view.context().showProceedButton);

        relier.set('redirectUri', 'urn:ietf:wg:oauth:2.0:fx:webchannel');
        assert.isFalse(view.context().showProceedButton);

        relier.set('redirectUri', null);
        assert.isFalse(view.context().showProceedButton);

        // if view.type is not sign_up then should not show
        view.type = null;
        relier.set('verificationRedirect', 'always');
        assert.isFalse(view.context().showProceedButton);

      });

      it('submits with the proceed button with verification_redirect', function () {
        var redirectUri = 'https://find.firefox.com';

        view.type = 'sign_up';
        relier.set('redirectUri', redirectUri);
        relier.set('verificationRedirect', 'always');

        return view.submit().then(function () {
          assert.isTrue(metrics.flush.calledOnce);
          assert.lengthOf(metrics.flush.getCall(0).args, 0);
          assert.equal(windowMock.location.href, redirectUri);
        });
      });

    });
  });
});
