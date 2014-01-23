/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'mocha',
  'chai',
  'underscore',
  'jquery',
  'views/settings',
  'lib/fxa-client',
  '../../mocks/router'
],
function (mocha, chai, _, $, View, FxaClient, RouterMock) {
  var assert = chai.assert;

  describe('views/settings', function () {
    var view, router, email;

    beforeEach(function (done) {
      email = 'testuser.' + Math.random() + '@testuser.com';

      var client = new FxaClient();
      client.signUp(email, 'password')
        .then(function() {
          document.cookie = 'tooyoung=1; expires=Thu, 01-Jan-1970 00:00:01 GMT';
          router = new RouterMock();
          view = new View({
            router: router
          });
          view.render();

          $('body').append(view.el);
          done();
        });
    });

    afterEach(function () {
      $(view.el).remove();
      view.destroy();
      view = null;
      router = null;
      document.cookie = 'tooyoung=1; expires=Thu, 01-Jan-1970 00:00:01 GMT';
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

        assert.equal(view.isValid(), false);
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
      it('changes from old to new password', function (done) {
        $('#old_password').val('password');
        $('#new_password').val('new_password');

        router.on('navigate', function (newPage) {
          assert.equal(newPage, 'signin');
          done();
        });

        view.changePassword();
      });
    });

    describe('signOut', function () {
      it('signs the user out', function (done) {
        router.on('navigate', function (newPage) {
          assert.equal(newPage, 'signin');
          done();
        });

        view.signOut();
      });
    });
  });
});


