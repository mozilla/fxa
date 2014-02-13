/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'mocha',
  'chai',
  'views/sign_in',
  'lib/session',
  'lib/fxa-client',
  '../../mocks/window',
  '../../mocks/router'
],
function (mocha, chai, View, Session, FxaClient, WindowMock, RouterMock) {
  var assert = chai.assert;

  describe('views/sign_in', function () {
    var view, email, router;

    beforeEach(function () {
      Session.clear();
      email = 'testuser.' + Math.random() + '@testuser.com';
      router = new RouterMock();
      view = new View({
        router: router
      });
      view.render();
      $('#container').html(view.el);
    });

    afterEach(function () {
      Session.clear();
      view.remove();
      view.destroy();
    });

    describe('render', function () {
      it('prefills email if one is stored in Session (user comes from signup with existing account)', function () {
        Session.set('prefillEmail', 'testuser@testuser.com');
        view.render();

        assert.ok($('#fxa-signin-header').length);
        assert.equal(view.$('[type=email]').val(), 'testuser@testuser.com');
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

    describe('isValid', function () {
      it('returns true if both email and password are valid', function () {
        view.$('[type=email]').val('testuser@testuser.com');
        view.$('[type=password]').val('password');
        assert.isTrue(view.isValid());
      });

      it('returns false if email is invalid', function () {
        view.$('[type=email]').val('testuser');
        view.$('[type=password]').val('password');
        assert.isFalse(view.isValid());
      });

      it('returns false if password is invalid', function () {
        view.$('[type=email]').val('testuser@testuser.com');
        view.$('[type=password]').val('passwor');
        assert.isFalse(view.isValid());
      });
    });

    describe('submit', function () {
      it('signs the user in on success', function (done) {
        var password = 'password';
        var client = new FxaClient();
        client.signUp(email, password)
              .then(function () {
                $('[type=email]').val(email);
                $('[type=password]').val(password);

                router.on('navigate', function () {
                  assert.equal(router.page, 'confirm');
                  done();
                });
                view.submit();
              })
              .then(null, function(err) {
                assert.fail(String(err));
                done();
              });
      });

      it('show incorrect password message on incorrect password', function (done) {
        var client = new FxaClient();
        client.signUp(email, 'password')
              .then(function () {
                $('[type=email]').val(email);
                $('[type=password]').val('incorrect');

                view.on('error', function (msg) {
                  assert.ok(msg.indexOf('Incorrect') > -1);
                  done();
                });
                view.submit();
              });
      });

      it('shows message allowing the user to sign up if user enters unknown account', function (done) {
        $('[type=email]').val(email);
        $('[type=password]').val('incorrect');

        view.on('error', function (msg) {
          assert.ok(msg.indexOf('/signup') > -1);
          done();
        });
        view.submit();
      });
    });

    describe('showValidationErrors', function() {
      it('shows an error if the email is invalid', function (done) {
        view.$('[type=email]').val('testuser');
        view.$('[type=password]').val('password');

        view.on('validation_error', function(which, msg) {
          assert.ok(msg);
          done();
        });

        view.showValidationErrors();
      });

      it('shows an error if the password is invalid', function (done) {
        view.$('[type=email]').val('testuser@testuser.com');
        view.$('[type=password]').val('passwor');

        view.on('validation_error', function(which, msg) {
          assert.ok(msg);
          done();
        });

        view.showValidationErrors();
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

      assert.notEqual(view.$('.error').text(), '');
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
      assert.equal(view.$('.error').text(), '');
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


