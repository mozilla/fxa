/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'underscore',
  'jquery',
  'views/sign_up',
  'lib/session',
  'lib/fxa-client',
  '../../mocks/router',
  '../../lib/helpers'
],
function (chai, _, $, View, Session, FxaClient, RouterMock, TestHelpers) {
  /*global describe, beforeEach, afterEach, it*/
  var assert = chai.assert;
  var wrapAssertion = TestHelpers.wrapAssertion;

  describe('views/sign_up', function () {
    var view, router, email;

    beforeEach(function () {
      Session.clear();
      email = 'testuser.' + Math.random() + '@testuser.com';
      document.cookie = 'tooyoung=1; expires=Thu, 01-Jan-1970 00:00:01 GMT';
      router = new RouterMock();
      view = new View({
        router: router
      });
      view.render();

      $('#container').append(view.el);
    });

    afterEach(function () {
      Session.clear();
      view.remove();
      view.destroy();
      view = null;
      router = null;
      document.cookie = 'tooyoung=1; expires=Thu, 01-Jan-1970 00:00:01 GMT';
    });

    describe('render', function () {
      it('prefills email if one is stored in Session (user comes from signin with new account)', function () {
        Session.set('prefillEmail', 'testuser@testuser.com');
        view.render();

        assert.equal(view.$('[type=email]').val(), 'testuser@testuser.com');
      });
    });

    describe('isValid', function () {
      it('returns true if email, password, and age are all valid', function () {
        view.$('[type=email]').val(email);
        view.$('[type=password]').val('password');
        $('#fxa-age-year').val('1960');

        assert.isTrue(view.isValid());
      });

      it('returns false if email is empty', function () {
        $('[type=email]').val('');
        $('[type=password]').val('password');
        $('#fxa-age-year').val('1960');

        assert.isFalse(view.isValid());
      });

      it('returns false if email is not an email address', function () {
        $('[type=email]').val('testuser');
        $('[type=password]').val('password');
        $('#fxa-age-year').val('1960');

        assert.isFalse(view.isValid());
      });

      it('returns false if email contain one part TLD', function () {
        $('[type=email]').val('a@b');
        $('[type=password]').val('password');
        $('#fxa-age-year').val('1960');

        assert.isFalse(view.isValid());
      });

      it('returns true if email contain two part TLD', function () {
        $('[type=email]').val('a@b.c');
        $('[type=password]').val('password');
        $('#fxa-age-year').val('1960');

        assert.isTrue(view.isValid());
      });

      it('returns true if email contain three part TLD', function () {
        $('[type=email]').val('a@b.c.d');
        $('[type=password]').val('password');
        $('#fxa-age-year').val('1960');

        assert.isTrue(view.isValid());
      });

      it('returns false if local side of email === 0 chars', function () {
        var email = '@testuser.com';
        $('[type=email]').val(email);
        $('[type=password]').val('password');
        $('#fxa-age-year').val('1960');

        assert.isFalse(view.isValid());
      });

      it('returns false if local side of email > 64 chars', function () {
        var email = '';
        do {
          email += 'a';
        } while (email.length < 65);

        email += '@testuser.com';
        $('[type=email]').val(email);
        $('[type=password]').val('password');
        $('#fxa-age-year').val('1960');

        assert.isFalse(view.isValid());
      });

      it('returns true if local side of email === 64 chars', function () {
        var email = '';
        do {
          email += 'a';
        } while (email.length < 64);

        email += '@testuser.com';
        $('[type=email]').val(email);
        $('[type=password]').val('password');
        $('#fxa-age-year').val('1960');

        assert.isTrue(view.isValid());
      });

      it('returns false if domain side of email === 0 chars', function () {
        var email = 'testuser@';
        $('[type=email]').val(email);
        $('[type=password]').val('password');
        $('#fxa-age-year').val('1960');

        assert.isFalse(view.isValid());
      });

      it('returns false if domain side of email > 255 chars', function () {
        var domain = 'testuser.com';
        do {
          domain += 'a';
        } while (domain.length < 256);

        var email = 'testuser@' + domain;
        $('[type=email]').val(email);
        $('[type=password]').val('password');
        $('#fxa-age-year').val('1960');

        assert.isFalse(view.isValid());
      });

      it('returns true if domain side of email === 254 chars', function () {
        var domain = 'testuser.com';
        do {
          domain += 'a';
        } while (domain.length < 254);
        var email = 'a@' + domain;
        $('[type=email]').val(email);
        $('[type=password]').val('password');
        $('#fxa-age-year').val('1960');

        assert.isTrue(view.isValid());
      });

      it('returns false total length > 256 chars', function () {
        var domain = 'testuser.com';
        do {
          domain += 'a';
        } while (domain.length < 254);

        // ab@ + 254 characters = 257 chars
        var email = 'ab@' + domain;
        $('[type=email]').val(email);
        $('[type=password]').val('password');
        $('#fxa-age-year').val('1960');

        assert.isFalse(view.isValid());
      });

      it('returns true if total length === 256 chars', function () {
        var email = 'testuser@testuser.com';
        do {
          email += 'a';
        } while (email.length < 256);

        $('[type=email]').val(email);
        $('[type=password]').val('password');
        $('#fxa-age-year').val('1960');

        assert.isTrue(view.isValid());
      });

      it('returns false if password is empty', function () {
        $('[type=email]').val(email);
        $('#fxa-age-year').val('1960');

        assert.isFalse(view.isValid());
      });

      it('returns false if password is invalid', function () {
        $('[type=email]').val(email);
        $('[type=password]').val('passwor');
        $('#fxa-age-year').val('1960');

        assert.isFalse(view.isValid());
      });

      it('returns false if age is invalid', function () {
        $('[type=email]').val(email);
        $('[type=password]').val('password');

        assert.isFalse(view.isValid());
      });
    });

    describe('showValidationErrors', function() {
      it('shows an error if the email is invalid', function (done) {
        view.$('[type=email]').val('testuser');
        view.$('[type=password]').val('password');
        view.$('#fxa-age-year').val('1990');

        view.on('validation_error', function(which, msg) {
          wrapAssertion(function () {
            assert.ok(msg);
          }, done);
        });

        view.showValidationErrors();
      });

      it('shows an error if the password is invalid', function (done) {
        view.$('[type=email]').val('testuser@testuser.com');
        view.$('[type=password]').val('passwor');
        view.$('#fxa-age-year').val('1990');

        view.on('validation_error', function(which, msg) {
          wrapAssertion(function () {
            assert.ok(msg);
          }, done);
        });

        view.showValidationErrors();
      });

      it('shows an error if no year is selected', function (done) {
        view.$('[type=email]').val('testuser@testuser.com');
        view.$('[type=password]').val('passwor');

        view.on('validation_error', function(which, msg) {
          wrapAssertion(function () {
            assert.ok(msg);
          }, done);
        });

        view.showValidationErrors();
      });
    });

    describe('submit', function () {
      it('sends the user to confirm screen if form filled out, >= 14 years ago', function (done) {
        $('[type=email]').val(email);
        $('[type=password]').val('password');

        var nowYear = (new Date()).getFullYear();
        $('#fxa-age-year').val(nowYear - 14);

        router.on('navigate', function () {
          wrapAssertion(function () {
            assert.equal(router.page, 'confirm');
          }, done);
        });
        view.submit();
      });

      it('submits form if user presses enter on the year', function (done) {
        $('[type=email]').val(email);
        $('[type=password]').val('password');

        var nowYear = (new Date()).getFullYear();
        $('#fxa-age-year').val(nowYear - 14);

        router.on('navigate', function () {
          wrapAssertion(function () {
            assert.equal(router.page, 'confirm');
          }, done);
        });

        // submit using the enter key
        var e = jQuery.Event('keydown', { which: 13 });
        $('#fxa-age-year').trigger(e);
      });

      it('sends the user to cannot_create_account screen if user selects <= 13 years ago', function (done) {
        $('[type=email]').val(email);
        $('[type=password]').val('password');

        var nowYear = (new Date()).getFullYear();
        $('#fxa-age-year').val(nowYear - 13);

        router.on('navigate', function () {
          wrapAssertion(function () {
            assert.equal(router.page, 'cannot_create_account');
          }, done);
        });
        view.submit();
      });

      it('sends user to cannot_create_account when visiting sign up if they have already been sent there', function (done) {
        $('[type=email]').val(email);
        $('[type=password]').val('password');

        var nowYear = (new Date()).getFullYear();
        $('#fxa-age-year').val(nowYear - 13);

        view.submit();
        assert.equal(router.page, 'cannot_create_account');

        // simulate user re-visiting the /signup page after being rejected
        var revisitRouter = new RouterMock();

        revisitRouter.on('navigate', function () {
          wrapAssertion(function () {
            assert.equal(revisitRouter.page, 'cannot_create_account');
          }, done);
        });

        var revisitView = new View({
          router: revisitRouter
        });
        revisitView.render();
      });

      it('signs user in if they enter already existing account with correct password', function (done) {
        var password = 'password';
        var client = new FxaClient();
        client.signUp(email, password)
              .then(function () {
                $('[type=email]').val(email);
                $('[type=password]').val(password);

                var nowYear = (new Date()).getFullYear();
                $('#fxa-age-year').val(nowYear - 14);

                router.on('navigate', function () {
                  wrapAssertion(function () {
                    assert.equal(router.page, 'confirm');
                  }, done);
                });
                view.submit();
              });
      });

      it('shows message allowing the user to sign in if user enters existing verified account with incorrect password', function (done) {
        var client = new FxaClient();
        client.signUp(email, 'password', { preVerified: true })
              .then(function () {
                $('[type=email]').val(email);
                $('[type=password]').val('incorrect');

                var nowYear = (new Date()).getFullYear();
                $('#fxa-age-year').val(nowYear - 14);

                view.on('error', function (msg) {
                  wrapAssertion(function () {
                    assert.ok(msg.indexOf('/signin') > -1);
                  }, done);
                });
                view.submit();
              });
      });

      it('re-signs up unverified user with new password', function (done) {
        var client = new FxaClient();
        client.signUp(email, 'password')
              .then(function () {
                $('[type=email]').val(email);
                $('[type=password]').val('incorrect');

                var nowYear = (new Date()).getFullYear();
                $('#fxa-age-year').val(nowYear - 14);

                router.on('navigate', function () {
                  wrapAssertion(function () {
                    assert.equal(router.page, 'confirm');
                  }, done);
                });
                view.submit();
              });
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
        assert.equal($('[type=password]').attr('type'), 'password');
      });
    });
  });
});


