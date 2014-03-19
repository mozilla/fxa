/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'jquery',
  'views/delete_account',
  'lib/fxa-client',
  'lib/session',
  '../../mocks/router',
  '../../lib/helpers'
],
function (chai, $, View, FxaClient, Session, RouterMock, TestHelpers) {
  /*global describe, beforeEach, afterEach, it*/
  var assert = chai.assert;
  var wrapAssertion = TestHelpers.wrapAssertion;

  describe('views/delete_account', function () {
    var view, router, email, password = 'password';

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
      it('redirects to signin', function (done) {
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
          .then(function () {
            view.render();

            $('body').append(view.el);
          });
      });

      describe('isValid', function () {
        it('returns true if password is filled out', function () {
          $('form input[type=password]').val(password);

          assert.equal(view.isValid(), true);
        });

        it('returns false if password is too short', function () {
          $('form input[type=password]').val('passwor');

          assert.equal(view.isValid(), false);
        });

        it('displays user email in session', function () {
          assert.equal($('.prefill').text(), email);
        });
      });

      describe('showValidationErrors', function() {
        it('shows an error if the password is invalid', function (done) {
          view.$('[type=email]').val('testuser@testuser.com');
          view.$('[type=password]').val('passwor');

          view.on('validation_error', function(which, msg) {
            wrapAssertion(function() {
              assert.ok(msg);
            }, done);
          });

          view.showValidationErrors();
        });
      });

      describe('submit', function () {
        it('deletes the users account, redirect to signup', function (done) {
          $('form input[type=email]').val(email);
          $('form input[type=password]').val(password);

          router.on('navigate', function (newPage) {
            wrapAssertion(function() {
              assert.equal(newPage, 'signup');
            }, done);
          });

          view.submit();
        });
      });

    });
  });
});


