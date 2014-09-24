/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'jquery',
  'lib/promise',
  'views/sign_in',
  'lib/session',
  'lib/auth-errors',
  'lib/metrics',
  'lib/fxa-client',
  'models/reliers/relier',
  '../../mocks/window',
  '../../mocks/router',
  '../../lib/helpers'
],
function (chai, $, p, View, Session, AuthErrors, Metrics, FxaClient,
      Relier, WindowMock, RouterMock, TestHelpers) {
  var assert = chai.assert;
  var wrapAssertion = TestHelpers.wrapAssertion;

  describe('views/sign_in', function () {
    var view;
    var email;
    var routerMock;
    var metrics;
    var windowMock;
    var fxaClient;
    var relier;

    beforeEach(function () {
      email = TestHelpers.createEmail();

      Session.clear();

      routerMock = new RouterMock();
      windowMock = new WindowMock();
      metrics = new Metrics();
      relier = new Relier();
      fxaClient = new FxaClient({
        relier: relier
      });

      view = new View({
        router: routerMock,
        metrics: metrics,
        window: windowMock,
        fxaClient: fxaClient,
        relier: relier
      });

      return view.render()
          .then(function () {
            $('#container').html(view.el);
          });
    });

    afterEach(function () {
      metrics.destroy();

      view.remove();
      view.destroy();

      view = metrics = null;
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

      it('Shows serviceName from the relier', function () {
        relier.isSync = function () {
          return true;
        };
        var serviceName = 'another awesome service by Mozilla';
        relier.set('serviceName', serviceName);

        // initialize a new view to set the service name
        view = new View({
          router: routerMock,
          metrics: metrics,
          window: windowMock,
          relier: relier
        });
        return view.render()
            .then(function () {
              assert.include(view.$('#fxa-signin-header').text(), serviceName);
            });
      });
    });


    it('prefills email with email from search parameter if Session.prefillEmail is not set', function () {
      windowMock.location.search = '?email=' + encodeURIComponent('testuser@testuser.com');

      return view.render()
          .then(function () {
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

      it('logs an error if user cancels login', function () {
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

            assert.isTrue(TestHelpers.isEventLogged(metrics,
                              'login.canceled'));
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
            .then(function (msg) {
              assert.ok(msg.indexOf('/signup') > -1);
            });
      });

      it('passes other errors along', function () {
        $('[type=email]').val(email);
        $('[type=password]').val('incorrect');

        view.fxaClient.signIn = function (email) {
          return p()
              .then(function () {
                throw AuthErrors.toError('INVALID_JSON');
              });
        };

        return view.submit()
                  .then(null, function (err) {
                    // The errorback will not be called if the submit
                    // succeeds, but the following callback always will
                    // be. To ensure the errorback was called, pass
                    // the error along and check its type.
                    return err;
                  })
                  .then(function (err) {
                    assert.isTrue(AuthErrors.is(err, 'INVALID_JSON'));
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
    });

    describe('useLoggedInAccount', function () {
      it('shows an error if session is expired', function (done) {
        Session.set('cachedCredentials', {
          sessionToken: 'abc123',
          email: 'a@a.com'
        });

        return view.useLoggedInAccount()
          .then(function () {
            assert.isTrue(view._isErrorVisible);
            // do not show email input
            assert.notOk(view.$('#email').length);
            // show password input
            assert.ok(view.$('#password').length);
            assert.equal(view.$('.error').text(), 'Session expired. Sign in to continue.');
            done();
          })
          .fail(done);
      });

      it('signs in with a valid session', function (done) {
        Session.set('cachedCredentials', {
          sessionToken: 'abc123',
          email: 'a@a.com'
        });

        view.fxaClient.recoveryEmailStatus = function () {
          return p({verified: true});
        };

        return view.useLoggedInAccount()
          .then(function () {
            assert.notOk(view._isErrorVisible);
            assert.equal(view.$('.error').text(), '');
            done();
          })
          .fail(done);
      });
    });

    describe('useDifferentAccount', function () {
      it('can switch to signin with the useDifferentAccount button', function (done) {
        Session.set('cachedCredentials', {
          sessionToken: 'abc123',
          email: 'a@a.com'
        });

        return view.useLoggedInAccount()
          .then(function () {
            $('.use-different').click();
            assert.ok($('.email').length, 'should show email input');
            assert.ok($('.password').length, 'should show password input');
            done();
          })
          .fail(done);
      });
    });

    describe('_suggestedUser', function () {
      it('can suggest the user based on session variables', function () {
        assert.isNull(view._suggestedUser(), 'null when no session set');

        Session.set('cachedCredentials', {
          sessionToken: 'abc123'
        });
        assert.isNull(view._suggestedUser(), 'null when no email set');

        Session.clear();
        Session.set('cachedCredentials', {
          email: 'a@a.com'
        });
        assert.isNull(view._suggestedUser(), 'null when no session token set');

        Session.clear();
        Session.set('cachedCredentials', {
          sessionToken: 'abc123',
          email: 'a@a.com'
        });

        assert.equal(view._suggestedUser().email, 'a@a.com');
        assert.equal(view._suggestedUser().avatar, undefined);

        Session.clear();

        Session.set('cachedCredentials', {
          sessionToken: 'abc123',
          avatar: 'avatar.jpg',
          email: 'a@a.com'
        });
        assert.equal(view._suggestedUser().email, 'a@a.com');
        assert.equal(view._suggestedUser().avatar, 'avatar.jpg');

        Session.clear();
        Session.set('email', 'a@a.com');
        Session.set('sessionToken', 'abc123');

        assert.equal(view._suggestedUser().email, 'a@a.com');
      });

      it('does shows if there is the same email in query params', function (done) {
        windowMock.location.search = '?email=a@a.com';
        Session.set('cachedCredentials', {
          sessionToken: 'abc123',
          email: 'a@a.com'
        });

        return view.render()
          .then(function () {
            assert.ok($('.avatar-view').length, 'should show suggested avatar');
            assert.notOk($('.password').length, 'should not show password input');
            done();
          })
          .fail(done);
      });

      it('does not show if there is an email in query params that does not match', function (done) {
        windowMock.location.search = '?email=b@b.com';
        Session.set('cachedCredentials', {
          sessionToken: 'abc123',
          email: 'a@a.com'
        });

        return view.render()
          .then(function () {
            assert.equal($('.email')[0].type, 'email', 'should show email input');
            assert.ok($('.password').length, 'should show password input');
            done();
          })
          .fail(done);
      });
    });

    describe('_suggestedUserAskPassword', function () {
      it('asks for password right away if service is sync', function (done) {
        relier.isSync = function () {
          return true;
        };
        Session.set('cachedCredentials', {
          sessionToken: 'abc123',
          email: 'a@a.com'
        });
        relier.set('service', 'sync');

        return view.render()
          .then(function () {
            assert.equal($('.email')[0].type, 'hidden', 'should not show email input');
            assert.ok($('.password').length, 'should show password input');
            done();
          })
          .fail(done);
      });

      it('does not ask for password right away if service is not sync', function (done) {
        Session.set('cachedCredentials', {
          sessionToken: 'abc123',
          email: 'a@a.com'
        });
        relier.set('service', 'loop');

        return view.render()
          .then(function () {
            assert.ok($('.avatar-view').length, 'should show suggested avatar');
            assert.notOk($('.password').length, 'should show password input');
            done();
          })
          .fail(done);
      });
    });

  });
});
