/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'jquery',
  'p-promise',
  'views/sign_in',
  'lib/session',
  'lib/auth-errors',
  '../../mocks/window',
  '../../mocks/router',
  '../../lib/helpers'
],
function (chai, $, p, View, Session, AuthErrors, WindowMock, RouterMock, TestHelpers) {
  var assert = chai.assert;
  var wrapAssertion = TestHelpers.wrapAssertion;

  describe('views/sign_in', function () {
    var view, email, routerMock;

    beforeEach(function () {
      email = 'testuser.' + Math.random() + '@testuser.com';
      routerMock = new RouterMock();
      view = new View({
        router: routerMock
      });
      return view.render()
          .then(function () {
            $('#container').html(view.el);
          });
    });

    afterEach(function () {
      view.remove();
      view.destroy();
    });

    describe('render', function () {
      it('prefills email and password if stored in Session (user comes from signup with existing account)', function () {
        Session.set('prefillEmail', 'testuser@testuser.com');
        Session.set('prefillPassword', 'prefilled password');
        return view.render()
            .then(function () {
              assert.ok($('#fxa-signin-header').length);
              assert.equal(view.$('[type=email]').val(), 'testuser@testuser.com');
              assert.equal(view.$('[type=password]').val(), 'prefilled password');
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
      it('redirects unverified users to the confirm page on success', function () {
        var password = 'password';
        return view.fxaClient.signUp(email, password)
              .then(function () {
                $('[type=email]').val(email);
                $('[type=password]').val(password);
                return view.submit();
              })
              .then(function () {
                assert.equal(routerMock.page, 'confirm');
              });
      });

      it('redirects verified users to the settings page on success', function () {
        var password = 'password';
        return view.fxaClient.signUp(email, password, { preVerified: true })
              .then(function () {
                $('[type=email]').val(email);
                $('[type=password]').val(password);
                return view.submit();
              })
              .then(function () {
                assert.equal(routerMock.page, 'settings');
              });
      });

      it('does nothing if user cancels login', function () {
        view.fxaClient.signIn = function () {
          return p()
              .then(function () {
                throw AuthErrors.toError('USER_CANCELED_LOGIN');
              });
        };
        $('[type=email]').val(email);
        $('[type=password]').val('password');
        return view.submit()
          .then(function () {
            assert.isFalse(view.isErrorVisible());
          });
      });

      it('rejects promise with incorrect password message on incorrect password', function () {
        return view.fxaClient.signUp(email, 'password')
              .then(function () {
                $('[type=email]').val(email);
                $('[type=password]').val('incorrect');
                return view.submit();
              })
              .then(function () {
                assert(false, 'unexpected success');
              }, function (err) {
                assert.ok(err.message.indexOf('Incorrect') > -1);
              });
      });

      it('shows message allowing the user to sign up if user enters unknown account', function () {
        $('[type=email]').val(email);
        $('[type=password]').val('incorrect');

        return view.submit()
            .then(function(msg) {
              assert.ok(msg.indexOf('/signup') > -1);
            });
      });
    });

    describe('showValidationErrors', function () {
      it('shows an error if the email is invalid', function (done) {
        view.$('[type=email]').val('testuser');
        view.$('[type=password]').val('password');

        view.on('validation_error', function (which, msg) {
          wrapAssertion(function () {
            assert.ok(msg);
          }, done);
        });

        view.showValidationErrors();
      });

      it('shows an error if the password is invalid', function (done) {
        view.$('[type=email]').val('testuser@testuser.com');
        view.$('[type=password]').val('passwor');

        view.on('validation_error', function (which, msg) {
          wrapAssertion(function () {
            assert.ok(msg);
          }, done);
        });

        view.showValidationErrors();
      });
    });

    describe('resetPasswordIfKnownValidEmail', function () {
      it('goes to the confirm_reset_password page if user types a valid, known email', function () {
        var password = 'password';
        return view.fxaClient.signUp(email, password, { preVerified: true })
              .then(function () {
                $('[type=email]').val(email);
                return view.resetPasswordIfKnownValidEmail();
              })
              .then(function () {
                assert.equal(routerMock.page, 'confirm_reset_password');
              });
      });

      it('allows the user to sign up if user types a valid, unknown email', function () {
        $('[type=email]').val(email);
        return view.resetPasswordIfKnownValidEmail()
            .then(function () {
              assert.ok(view.$('.error a[href="/signup"]').length);
            });
      });

      it('goes to the reset_password screen if a blank email', function () {
        $('[type=email]').val('');
        return view.resetPasswordIfKnownValidEmail()
            .then(function () {
              assert.ok(routerMock.page, 'reset_password');
            });
      });

      it('goes to the reset_password screen if an invalid email', function () {
        $('[type=email]').val('partial');
        return view.resetPasswordIfKnownValidEmail()
            .then(function () {
              assert.ok(routerMock.page, 'reset_password');
            });
      });

      it('shows an error if any other error', function () {
        view.fxaClient.passwordReset = function() {
          return p().then(function () {
            throw new Error('this is an error');
          });
        };

        $('[type=email]').val(email);
        return view.resetPasswordIfKnownValidEmail()
            .then(function () {
              assert.isTrue(view.isErrorVisible());
            });

      });
    });
  });
});


