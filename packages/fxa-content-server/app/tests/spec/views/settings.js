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
  '../../lib/helpers'
],
function (chai, _, $, View, RouterMock, TestHelpers) {
  var assert = chai.assert;
  var wrapAssertion = TestHelpers.wrapAssertion;

  describe('views/settings', function () {
    var view, router, email;

    beforeEach(function () {
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

        return view.fxaClient.signUp(email, 'password')
          .then(function() {
            view.render();

            $('body').append(view.el);
          });
      });

      describe('submit', function () {
        it('signs the user out, redirects to signin page', function (done) {
          router.on('navigate', function (newPage) {
            wrapAssertion(function() {
              assert.equal(newPage, 'signin');
            }, done);
          });

          view.submit();
        });
      });
    });
  });
});


