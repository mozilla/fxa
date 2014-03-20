/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'underscore',
  'jquery',
  'views/settings',
  'lib/fxa-client',
  'lib/session',
  '../../mocks/router',
  '../../lib/helpers'
],
function (chai, _, $, View, FxaClient, Session, RouterMock, TestHelpers) {
  var assert = chai.assert;
  var wrapAssertion = TestHelpers.wrapAssertion;

  describe('views/settings', function () {
    var view, router, email;

    beforeEach(function () {
      Session.clear();
      router = new RouterMock();
      view = new View({
        router: router
      });
    });

    afterEach(function () {
      $(view.el).remove();
      view.destroy();
      view = null;
      router = null;
    });

    describe('with no session', function () {
      it('redirects to signin', function(done) {
        router.on('navigate', function (newPage) {
          wrapAssertion(function() {
            assert.equal(newPage, 'signin');
          }, done);
        });

        var isRendered = view.render();
        assert.isFalse(isRendered);
      });
    });

    describe('with session', function () {
      beforeEach(function () {
        email = 'testuser.' + Math.random() + '@testuser.com';

        var client = new FxaClient();
        return client.signUp(email, 'password')
          .then(function() {
            view.render();

            $('body').append(view.el);
          });
      });

      describe('signOut', function () {
        it('signs the user out, redirects to signin page', function (done) {
          router.on('navigate', function (newPage) {
            wrapAssertion(function() {
              assert.equal(newPage, 'signin');
            }, done);
          });

          view.signOut();
        });
      });
    });
  });
});


