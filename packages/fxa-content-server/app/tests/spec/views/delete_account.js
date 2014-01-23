/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'mocha',
  'chai',
  'underscore',
  'jquery',
  'views/delete_account',
  'lib/fxa-client',
  'lib/session',
  '../../mocks/router'
],
function (mocha, chai, _, $, View, FxaClient, Session, RouterMock) {
  /*global describe, beforeEach, afterEach, it*/
  var assert = chai.assert;

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
          assert.equal(newPage, 'signin');
          done();
        });

        var isRendered = view.render();
        assert.isFalse(isRendered);
      });
    });

    describe('with session', function () {
      beforeEach(function (done) {
        email = 'testuser.' + Math.random() + '@testuser.com';

        var client = new FxaClient();
        client.signUp(email, 'password')
          .then(function () {
            view.render();

            $('body').append(view.el);
            done();
          });
      });

      describe('isValid', function () {
        it('returns true if email and password are filled out', function () {
          $('form input[type=email]').val(email);
          $('form input[type=password]').val(password);

          assert.equal(view.isValid(), true);
        });

        it('returns false if not an email', function () {
          $('form input[type=email]').val('notanemail');
          $('form input[type=password]').val(password);

          assert.equal(view.isValid(), false);
        });

        it('returns false if password is too short', function () {
          $('form input[type=email]').val(email);
          $('form input[type=password]').val('passwor');

          assert.equal(view.isValid(), false);
        });
      });

      describe('deleteAccount', function () {
        it('deletes the users account, redirect to signup', function (done) {
          $('form input[type=email]').val(email);
          $('form input[type=password]').val(password);

          router.on('navigate', function (newPage) {
            assert.equal(newPage, 'signup');
            done();
          });

          view.deleteAccount();
        });
      });
    });
  });
});


