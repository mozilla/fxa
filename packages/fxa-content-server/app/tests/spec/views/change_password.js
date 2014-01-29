/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'mocha',
  'chai',
  'underscore',
  'jquery',
  'views/change_password',
  'lib/fxa-client',
  'lib/session',
  '../../mocks/router'
],
function (mocha, chai, _, $, View, FxaClient, Session, RouterMock) {
  var assert = chai.assert;

  describe('views/change_password', function () {
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
          .then(function() {
            view.render();

            $('body').append(view.el);
            done();
          });
      });

      describe('isValid', function () {
        it('returns true if both old and new passwords are valid and different', function () {
          $('#old_password').val('password');
          $('#new_password').val('password2');

          assert.equal(view.isValid(), true);
        });

        it('returns true if both old and new passwords are valid and the same', function () {
          $('#old_password').val('password');
          $('#new_password').val('password');

          assert.equal(view.isValid(), true);
        });

        it('returns false if old password is too short', function () {
          $('#old_password').val('passwor');
          $('#new_password').val('password');

          assert.equal(view.isValid(), false);
        });

        it('returns false if new password is too short', function () {
          $('#old_password').val('password');
          $('#new_password').val('passwor');

          assert.equal(view.isValid(), false);
        });
      });

      describe('changePassword', function () {
        it('prints an error message if both passwords are the same', function (done) {
          $('#old_password').val('password');
          $('#new_password').val('password');

          view.on('error', function (msg) {
            assert.ok(msg);
            done();
          });

          view.changePassword();
        });

        it('changes from old to new password, redirects user to signin', function (done) {
          $('#old_password').val('password');
          $('#new_password').val('new_password');

          view.on('success', done);
          view.changePassword();
        });
      });
    });
  });
});


