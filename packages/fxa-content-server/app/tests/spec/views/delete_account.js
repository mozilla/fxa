/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'jquery',
  'views/delete_account',
  '../../mocks/router',
  '../../lib/helpers'
],
function (chai, $, View, RouterMock, TestHelpers) {
  /*global describe, beforeEach, afterEach, it*/
  var assert = chai.assert;
  var wrapAssertion = TestHelpers.wrapAssertion;

  describe('views/delete_account', function () {
    var view, routerMock, email, password = 'password';

    beforeEach(function () {
      routerMock = new RouterMock();
      view = new View({
        router: routerMock
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
        email = 'testuser.' + Math.random() + '@testuser.com';

        return view.fxaClient.signUp(email, 'password')
          .then(function () {
            return view.render();
          })
          .then(function () {
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
        it('deletes the users account, redirect to signup', function () {
          $('form input[type=email]').val(email);
          $('form input[type=password]').val(password);

          return view.submit()
              .then(function () {
                assert.equal(routerMock.page, 'signup');
              });
        });
      });

    });
  });
});


