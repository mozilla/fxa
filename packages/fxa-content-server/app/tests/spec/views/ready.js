/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var Able = require('lib/able');
  var chai = require('chai');
  var FxaClient = require('lib/fxa-client');
  var OAuthBroker = require('models/auth_brokers/oauth');
  var p = require('lib/promise');
  var Session = require('lib/session');
  var sinon = require('sinon');
  var SyncRelier = require('models/reliers/sync');
  var View = require('views/ready');
  var WindowMock = require('../../mocks/window');

  var assert = chai.assert;

  describe('views/ready', function () {
    var view;
    var windowMock;
    var fxaClient;
    var relier;
    var broker;
    var able;
    var metrics;

    function createDeps() {
      windowMock = new WindowMock();
      relier = new SyncRelier({
        window: windowMock
      });
      broker = new OAuthBroker({
        relier: relier,
        session: Session,
        window: windowMock
      });
      fxaClient = new FxaClient();

      able = new Able();
      metrics = {
        flush: sinon.spy(p),
        logMarketingImpression: function () {}
      };
    }

    function createView(type) {
      view = new View({
        able: able,
        broker: broker,
        fxaClient: fxaClient,
        metrics: metrics,
        relier: relier,
        type: type,
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
        'account_unlock': '#fxa-account-unlock-complete-header',
        'force_auth': '#fxa-force-auth-complete-header',
        'reset_password': '#fxa-reset-password-complete-header',
        'sign_in': '#fxa-sign-in-complete-header',
        'sign_up': '#fxa-sign-up-complete-header'
      };

      for (var type in expectedHeaders) {
        it('renders the correct header for `' + type + '`', function (type) {
          createView(type);
          return view.render()
            .then(function () {
              assert.ok(view.$(expectedHeaders[type]).length);
            });
        }.bind(null, type));
      }

      it('shows service name if available', function () {
        createView('sign_up');
        relier.set('serviceName', 'Firefox Sync');

        return view.render()
          .then(function () {
            var html = view.$('section').text();
            assert.include(html, 'Firefox Sync');
          });
      });

      // regression test for #1216
      it('does not show service name if service is defined but serviceName is not', function () {
        createView('sign_up');
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

      it('shows some form of marketing for english speakers if capability is supported', function () {
        Session.set('language', 'en');
        relier.set('service', 'sync');
        sinon.stub(broker, 'hasCapability', function (type) {
          if (type === 'emailVerificationMarketingSnippet') {
            return true;
          }
        });

        createView('sign_up');
        return view.render()
          .then(function () {
            assert.equal(view.$('.marketing').length, 1);
          });
      });

      it('shows the spring 2015 snippet if the campaign has started', function () {
        sinon.stub(able, 'choose', function () {
          return true;
        });
        sinon.stub(broker, 'hasCapability', function (type) {
          if (type === 'emailVerificationMarketingSnippet') {
            return true;
          }
        });

        relier.set('service', 'sync');
        createView('sign_up');

        return view.render()
          .then(function () {
            assert.isTrue(able.choose.calledWith('springCampaign2015'));
            assert.ok(view.$('.os-general').length);
          });
      });

      it('does not show marketing if the broker does not support it', function () {
        sinon.stub(broker, 'hasCapability', function (type) {
          if (type === 'emailVerificationMarketingSnippet') {
            return false;
          }
        });

        createView('sign_up');

        return view.render()
          .then(function () {
            assert.equal(view.$('.marketing').length, 0);
            assert.equal(view.$('.os-general').length, 0);
          });
      });

      it('formats the service name correctly depending on the always redirect param', function () {
        createView('sign_up');
        var serviceName = 'Find My Device';
        var redirectUri = 'https://find.firefox.com';
        relier.set('redirectUri', redirectUri);
        relier.set('serviceName', serviceName);
        assert.isFalse(view.context().shouldShowProceedButton);

        relier.set('verificationRedirect', 'always');
        assert.isTrue(view.context().shouldShowProceedButton);

        relier.set('redirectUri', 'urn:ietf:wg:oauth:2.0:fx:webchannel');
        assert.isFalse(view.context().shouldShowProceedButton);

        relier.set('redirectUri', null);
        assert.isFalse(view.context().shouldShowProceedButton);
      });

      it('shows the `proceed` button for verification_redirect', function () {
        relier.set('serviceName', 'Find My Device');
        relier.set('redirectUri', 'https://find.firefox.com');
        relier.set('verificationRedirect', 'always');

        relier.isSync = sinon.spy(function () {
          return false;
        });

        createView('sign_up');

        return view.render()
          .then(function () {
            assert.ok(view.$('#proceed').length);
          });
      });

      it('shows the `sync preferences` button for supporting brokers', function () {
        relier.isSync = sinon.spy(function () {
          return true;
        });

        sinon.stub(broker, 'hasCapability', function (type) {
          if (type === 'syncPreferencesNotification') {
            return true;
          }
        });

        createView('sign_up');
        return view.render()
          .then(function () {
            assert.ok(view.$('#sync-preferences').length);
          });
      });
    });

    describe('submit', function () {
      beforeEach(function () {
        createDeps();
      });

      afterEach(function () {
        view.remove();
        view.destroy();
      });

      it('for `proceed` - submit metrics, redirect to verification_redirect', function () {
        var redirectUri = 'https://find.firefox.com';

        relier.set('redirectUri', redirectUri);
        relier.set('verificationRedirect', 'always');

        relier.isSync = sinon.spy(function () {
          return false;
        });

        createView('sign_up');

        return view.submit().then(function () {
          assert.isTrue(metrics.flush.calledOnce);
          assert.lengthOf(metrics.flush.getCall(0).args, 0);
          assert.equal(windowMock.location.href, redirectUri);
        });
      });

      it('for `sync preferences` - submit metrics, notify broker', function () {
        relier.isSync = sinon.spy(function () {
          return true;
        });

        sinon.stub(broker, 'hasCapability', function (type) {
          if (type === 'syncPreferencesNotification') {
            return true;
          }
        });

        broker.openSyncPreferences = sinon.spy(function () {
          return p();
        });

        createView('sign_up');

        return view.submit().then(function () {
          assert.isTrue(metrics.flush.calledOnce);
          assert.isTrue(broker.openSyncPreferences.called);
        });
      });

    });
  });
});
