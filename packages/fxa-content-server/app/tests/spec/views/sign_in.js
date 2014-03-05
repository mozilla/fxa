/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'jquery',
  'views/sign_in',
  'lib/session',
  'lib/fxa-client',
  '../../mocks/window',
  '../../mocks/router',
  '../../lib/helpers'
],
function (chai, $, View, Session, FxaClient,
  WindowMock, RouterMock, testHelpers) {
  /*global describe, beforeEach, afterEach, it*/
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
              .then(null, function (err) {
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

    describe('showValidationErrors', function () {
      it('shows an error if the email is invalid', function (done) {
        view.$('[type=email]').val('testuser');
        view.$('[type=password]').val('password');

        view.on('validation_error', function (which, msg) {
          assert.ok(msg);
          done();
        });

        view.showValidationErrors();
      });

      it('shows an error if the password is invalid', function (done) {
        view.$('[type=email]').val('testuser@testuser.com');
        view.$('[type=password]').val('passwor');

        view.on('validation_error', function (which, msg) {
          assert.ok(msg);
          done();
        });

        view.showValidationErrors();
      });
    });

    describe('resetPasswordNow', function () {
      var client;

      beforeEach(function (done) {
        var clientWrapper = new FxaClient();
        clientWrapper._getClientAsync()
                .then(function (_client) {
                  client = _client;
                  // create spies that can be used to check
                  // parameters that are passed to the Fxaclient
                  testHelpers.addFxaClientSpy(client);
                  done();
                });
      });

      afterEach(function () {
        // return the client to its original state.
        testHelpers.removeFxaClientSpy(client);
      });

      it('only works from /force_auth', function () {
        view.resetPasswordNow();

        assert.isFalse(client.passwordForgotSendCode.called);
      });
    });
  });

  describe('missing email address when calling /force_auth', function () {
    var view, windowMock;

    beforeEach(function () {
      windowMock = new WindowMock();
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

    it('prints an error message', function () {
      windowMock.location.search = '';

      assert.notEqual(view.$('.error').text(), '');
    });
  });

  describe('/force_auth with email', function () {
    var view, windowMock, router, email;

    beforeEach(function () {
      email = 'testuser.' + Math.random() + '@testuser.com';
      windowMock = new WindowMock();
      windowMock.location.search = '?email=' + encodeURIComponent(email);
      router = new RouterMock();

      view = new View({
        forceAuth: true,
        window: windowMock,
        router: router
      });
      view.render();
      $('#container').html(view.el);
    });

    afterEach(function () {
      view.remove();
      view.destroy();
      windowMock = router = view = null;
      $('#container').empty();
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

    it('forgot password request redirects directly to confirm_reset_password', function (done) {
      var password = 'password';
      var client = new FxaClient();
      var event = $.Event('click');
      client.signUp(email, password)
            .then(function () {
              // the call to client.signUp clears Session.
              // These fields are reset to complete the test.
              Session.set('forceAuth', true);
              Session.set('forceEmail', email);
              router.on('navigate', function () {
                assert.equal(router.page, 'confirm_reset_password');

                assert.isTrue(event.isDefaultPrevented());
                assert.isTrue(event.isPropagationStopped());

                done();
              });

              view.resetPasswordNow(event);
            })
            .then(null, function (err) {
              assert.fail(String(err));
              done();
            });
    });
  });

});


