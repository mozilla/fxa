/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'mocha',
  'chai',
  'views/sign_in',
  '../../mocks/window'
],
function (mocha, chai, View, WindowMock) {
  var assert = chai.assert;

  describe('views/sign_in', function () {
    var view;

    beforeEach(function () {
      view = new View();
      view.render();
      $('#container').html(view.el);
    });

    afterEach(function () {
      view.remove();
      view.destroy();
    });

    describe('constructor creates it', function () {
      it('is drawn', function () {
        assert.ok($('#fxa-signin-header').length);
      });
    });

    describe('updatePasswordVisibility', function () {
      it('pw field set to text when clicked', function () {
        $('.show-password').click();
        assert.equal($('.password').attr('type'), 'text');
      });

      it('pw field set to password when clicked again', function () {
        $('.show-password').click();
        $('.show-password').click();
        assert.equal($('.password').attr('type'), 'password');
      });
    });
  });

  describe('views/sign_in used for /force_auth without email', function () {
    var view, windowMock;

    beforeEach(function () {
      windowMock = new WindowMock;
      windowMock.location.search = '';

      view = new View({ forceAuth: true, window: windowMock });
      view.render();
      $('#container').html(view.el);
    });

    afterEach(function () {
      view.remove();
      view.destroy();
      windowMock = view = null;
    });

    it('prints an error message', function() {
      windowMock.location.search = '';

      assert.notEqual($('.error').text(), '');
    });
  });

  describe('views/sign_in used for /force_auth?email="testuser@testuser.com"', function () {
    var view, windowMock;

    beforeEach(function () {
      windowMock = new WindowMock;
      windowMock.location.search = '?email=testuser@testuser.com';

      view = new View({ forceAuth: true, window: windowMock });
      view.render();
      $('#container').html(view.el);
    });

    afterEach(function () {
      view.remove();
      view.destroy();
      windowMock = view = null;
    });


    it('does not print an error message', function () {
      assert.equal($('.error').text(), '');
    });

    it('does not allow the email to be edited', function () {
      assert.equal($('input[type=email]').length, 0);
    });

    it('user cannot create an account', function () {
      assert.equal($('a[href="/signup"]').length, 0);
    });

    it('isValid is successful when the password is filled out', function () {
      $('.password').val('password');
      assert.isTrue(view.isValid());
    });
  });

});


