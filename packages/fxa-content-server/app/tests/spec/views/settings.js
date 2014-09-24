/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'underscore',
  'jquery',
  'views/settings',
  '../../mocks/router',
  '../../lib/helpers',
  'lib/session',
  'lib/constants',
  'lib/fxa-client',
  'models/reliers/relier'
],
function (chai, _, $, View, RouterMock, TestHelpers, Session, Constants,
      FxaClient, Relier) {
  var assert = chai.assert;

  describe('views/settings', function () {
    var view;
    var routerMock;
    var email;
    var fxaClient;
    var relier;

    beforeEach(function () {
      routerMock = new RouterMock();
      relier = new Relier();
      fxaClient = new FxaClient({
        relier: relier
      });

      view = new View({
        router: routerMock,
        fxaClient: fxaClient
      });
    });

    afterEach(function () {
      $(view.el).remove();
      view.destroy();
      view = null;
      routerMock = null;
    });

    describe('with no session', function () {
      it('redirects to signin', function () {
        return view.render()
            .then(function () {
              assert.equal(routerMock.page, 'signin');
            });
      });
    });

    describe('with session', function () {
      beforeEach(function () {
        email = TestHelpers.createEmail();

        return view.fxaClient.signUp(email, 'password', { preVerified: true })
          .then(function () {
            return view.render();
          })
          .then(function () {
            $('body').append(view.el);
          });
      });

      it('shows the settings page', function () {
        assert.ok(view.$('#fxa-settings-header').length);
      });

      describe('submit', function () {
        it('signs the user out, redirects to signin page', function () {
          return view.submit()
              .then(function () {
                assert.equal(routerMock.page, 'signin');
              });
        });
      });

      describe('desktop context', function () {
        it('does not show sign out link', function () {
          Session.set('sessionTokenContext', Constants.FX_DESKTOP_CONTEXT);

          return view.render()
            .then(function () {
              assert.equal(view.$('#signout').length, 0);
            });
        });
      });
    });
  });
});


