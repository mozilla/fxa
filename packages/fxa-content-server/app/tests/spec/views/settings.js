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
  '../../mocks/router'
],
function (mocha, chai, _, $, View, RouterMock) {
  var assert = chai.assert;

  describe('views/settings', function () {
    var view, router, email;

    beforeEach(function () {
      email = 'testuser.' + Math.random() + '@testuser.com';
      document.cookie = 'tooyoung=1; expires=Thu, 01-Jan-1970 00:00:01 GMT';
      sessionStorage.removeItem('tooYoung');
      router = new RouterMock();
      view = new View({
        router: router
      });
      view.render();

      $('body').append(view.el);
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
      it('changes from old to new password', function () {
        $('#old_password').val('password');
        $('#new_password').val('new_password');

        view.changePassword();
      });
    });

    describe('signOut', function () {
      it('signs the user out', function () {
        router.on('navigate', function (newPage) {
          assert.equal(newPage, 'signin');
          done();
        });

        view.signOut();
      });
    });
  });
});


