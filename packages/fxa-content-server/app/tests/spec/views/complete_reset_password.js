/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'p-promise',
  'lib/auth-errors',
  'lib/metrics',
  'views/complete_reset_password',
  '../../mocks/router',
  '../../mocks/window',
  '../../lib/helpers'
],
function (chai, p, AuthErrors, Metrics, View, RouterMock, WindowMock, TestHelpers) {
  var assert = chai.assert;
  var wrapAssertion = TestHelpers.wrapAssertion;

  describe('views/complete_reset_password', function () {
    var view, routerMock, windowMock, isPasswordResetComplete, metrics;

    function testEventLogged(eventName) {
      assert.isTrue(TestHelpers.isEventLogged(metrics, eventName));
    }

    beforeEach(function () {
      routerMock = new RouterMock();
      windowMock = new WindowMock();
      metrics = new Metrics();

      windowMock.location.search = '?code=dea0fae1abc2fab3bed4dec5eec6ace7&email=testuser@testuser.com&token=feed';

      view = new View({
        router: routerMock,
        window: windowMock,
        metrics: metrics
      });

      // mock in isPasswordResetComplete
      isPasswordResetComplete = false;
      view.fxaClient.isPasswordResetComplete = function () {
        return p(isPasswordResetComplete);
      };

      return view.render()
          .then(function () {
            $('#container').html(view.el);
          });
    });

    afterEach(function () {
      metrics.destroy();

      view.remove();
      view.destroy();

      view = windowMock = metrics = null;
    });

    describe('render', function () {
      it('shows form if token, code and email are all present', function () {
        assert.ok(view.$('#fxa-complete-reset-password-header').length);
      });

      it('shows malformed screen if the token is missing', function () {
        windowMock.location.search = '?code=faea&email=testuser@testuser.com';
        return view.render()
            .then(function () {
              testEventLogged('complete_reset_password:link_damaged');
            })
            .then(function () {
              assert.ok(view.$('#fxa-verification-link-damaged-header').length);
            });
      });

      it('shows malformed screen if the code is missing', function () {
        windowMock.location.search = '?token=feed&email=testuser@testuser.com';
        return view.render()
            .then(function () {
              testEventLogged('complete_reset_password:link_damaged');
            })
            .then(function () {
              assert.ok(view.$('#fxa-verification-link-damaged-header').length);
            });
      });

      it('shows malformed screen if the email is missing', function () {
        windowMock.location.search = '?token=feed&code=dea0fae1abc2fab3bed4dec5eec6ace7';
        return view.render()
            .then(function () {
              testEventLogged('complete_reset_password:link_damaged');
            })
            .then(function () {
              assert.ok(view.$('#fxa-verification-link-damaged-header').length);
            });
      });

      it('shows the expired screen if the token has already been verified', function () {
        isPasswordResetComplete = true;
        return view.render()
            .then(function () {
              testEventLogged('complete_reset_password:link_expired');
            })
            .then(function () {
              assert.ok(view.$('#fxa-verification-link-expired-header').length);
            });
      });
    });

    describe('updatePasswordVisibility', function () {
      it('pw field set to text when clicked', function () {
        $('.show-password').click();
        assert.equal($('#password').attr('type'), 'text');
        assert.equal($('#vpassword').attr('type'), 'text');
      });

      it('pw field set to password when clicked again', function () {
        $('.show-password').click();
        $('.show-password').click();
        assert.equal($('#password').attr('type'), 'password');
        assert.equal($('#vpassword').attr('type'), 'password');
      });
    });

    describe('isValid', function () {
      it('returns true if password & vpassword valid and the same', function () {
        view.$('#password').val('password');
        view.$('#vpassword').val('password');
        assert.isTrue(view.isValid());
      });

      it('returns false if password & vpassword are different', function () {
        view.$('#password').val('password');
        view.$('#vpassword').val('other_password');
        assert.isFalse(view.isValid());
      });

      it('returns false if password invalid', function () {
        view.$('#password').val('passwor');
        view.$('#vpassword').val('password');
        assert.isFalse(view.isValid());
      });

      it('returns false if vpassword invalid', function () {
        view.$('#password').val('password');
        view.$('#vpassword').val('passwor');
        assert.isFalse(view.isValid());
      });
    });

    describe('showValidationErrors', function() {
      it('shows an error if the password is invalid', function (done) {
        view.$('#password').val('passwor');
        view.$('#vpassword').val('password');

        view.on('validation_error', function(which, msg) {
          wrapAssertion(function() {
            assert.ok(msg);
          }, done);
        });

        view.showValidationErrors();
      });

      it('shows an error if the vpassword is invalid', function (done) {
        view.$('#password').val('password');
        view.$('#vpassword').val('passwor');

        view.on('validation_error', function(which, msg) {
          wrapAssertion(function() {
            assert.ok(msg);
          }, done);
        });

        view.showValidationErrors();
      });
    });

    describe('validateAndSubmit', function() {
      it('shows an error if passwords are different', function () {
        view.$('#password').val('password1');
        view.$('#vpassword').val('password2');

        return view.validateAndSubmit()
            .then(function () {
              assert(false, 'unexpected success');
            }, function () {
              assert.ok(view.$('.error').text().length);
            });
      });

      it('redirects to reset_password_complete if all is well', function () {
        view.$('[type=password]').val('password');

        view.fxaClient.completePasswordReset = function () {
          return p(true);
        };
        return view.validateAndSubmit()
            .then(function () {
              assert.equal(routerMock.page, 'reset_password_complete');
            });
      });

      it('reload view to allow user to resend an email on INVALID_TOKEN error', function () {
        view.$('[type=password]').val('password');

        view.fxaClient.completePasswordReset = function () {
          return p()
              .then(function () {
                throw AuthErrors.toError('INVALID_TOKEN', 'invalid token, man');
              });
        };
        // isPasswordResetComplete needs to be overridden as well for when
        // render is re-loaded the token needs to be expired.
        view.fxaClient.isPasswordResetComplete = function () {
          return p()
              .then(function () {
                return true;
              });
        };
        return view.validateAndSubmit()
            .then(function () {
              assert.ok(view.$('#fxa-verification-link-expired-header').length);
            });
      });

      it('shows error message if server returns an error', function () {
        view.$('[type=password]').val('password');

        view.fxaClient.completePasswordReset = function () {
          return p()
              .then(function () {
                throw new Error('uh oh');
              });
        };
        return view.validateAndSubmit()
            .then(function () {
              assert(false, 'unexpected success');
            }, function () {
              assert.ok(view.$('.error').text().length);
            });
      });
    });

    describe('resendResetEmail', function() {
      it('redirects to /confirm_reset_password if auth server is happy', function () {
        view.fxaClient.passwordReset = function (email) {
          assert.equal(email, 'testuser@testuser.com');
          return p(true);
        };

        return view.resendResetEmail()
            .then(function () {
              assert.equal(routerMock.page, 'confirm_reset_password');
            });
      });

      it('shows server response as an error otherwise', function () {
        view.fxaClient.passwordReset = function (email) {
          return p()
              .then(function () {
                throw new Error('server error');
              });
        };

        return view.resendResetEmail()
            .then(function () {
              assert.equal(view.$('.error').text(), 'server error');
            });
      });
    });
  });
});
