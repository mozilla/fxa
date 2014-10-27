/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'sinon',
  'views/ready',
  'lib/session',
  'lib/fxa-client',
  'lib/promise',
  'models/reliers/fx-desktop',
  'models/auth_brokers/oauth',
  '../../mocks/window'
],
function (chai, sinon, View, Session, FxaClient, p, FxDesktopRelier,
      OAuthBroker, WindowMock) {
  var assert = chai.assert;

  describe('views/ready', function () {
    var view;
    var windowMock;
    var fxaClient;
    var relier;
    var broker;

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

      view = new View({
        window: windowMock,
        fxaClient: fxaClient,
        relier: relier,
        broker: broker
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
    });
  });
});



