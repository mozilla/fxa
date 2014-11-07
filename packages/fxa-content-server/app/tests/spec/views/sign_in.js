/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'jquery',
  'sinon',
  'lib/promise',
  'views/sign_in',
  'lib/session',
  'lib/auth-errors',
  'lib/metrics',
  'lib/fxa-client',
  'lib/constants',
  'models/reliers/relier',
  'models/user',
  'models/auth_brokers/base',
  '../../mocks/window',
  '../../mocks/router',
  '../../lib/helpers'
],
function (chai, $, sinon, p, View, Session, AuthErrors, Metrics, FxaClient,
      Constants, Relier, User, Broker, WindowMock, RouterMock, TestHelpers) {
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
    var broker;
    var user;

    beforeEach(function () {
      email = TestHelpers.createEmail();

      Session.clear();

      routerMock = new RouterMock();
      windowMock = new WindowMock();
      windowMock.location.pathname = 'signin';
      metrics = new Metrics();
      relier = new Relier();
      broker = new Broker();
      user = new User();
      fxaClient = new FxaClient();

      view = new View({
        router: routerMock,
        metrics: metrics,
        window: windowMock,
        fxaClient: fxaClient,
        user: user,
        relier: relier,
        broker: broker
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
          user: user,
          relier: relier,
          broker: broker
        });
        return view.render()
            .then(function () {
              assert.include(view.$('#fxa-signin-header').text(), serviceName);
            });
      });

      it('shows a prefilled email and password field of cached session', function () {
        sinon.stub(user, 'getChooserAccount', function () {
          return user.createAccount({
            email: 'a@a.com',
            sessionToken: 'abc123'
          });
        });
        return view.render()
            .then(function () {
              assert.ok($('#fxa-signin-header').length);
              assert.equal(view.$('.prefill').html(), 'a@a.com');
              assert.equal(view.$('[type=password]').val(), '');
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
        var sessionToken = 'abc123';

        sinon.stub(view.fxaClient, 'signIn', function () {
          return p(user.createAccount({ verified: false }));
        });

        sinon.stub(view.fxaClient, 'signUpResend', function () {
          return p();
        });

        sinon.stub(view, 'currentAccount', function () {
          return user.createAccount({
            sessionToken: sessionToken
          });
        });

        var password = 'password';
        $('[type=email]').val(email);
        $('[type=password]').val(password);

        return view.submit()
          .then(function () {
            assert.equal(routerMock.page, 'confirm');
            assert.isTrue(view.fxaClient.signIn.calledWith(
                email, password, relier, user));
            assert.isTrue(view.fxaClient.signUpResend.calledWith(
                relier, sessionToken));
          });
      });

      it('notifies the broker when a verified user signs in', function () {
        sinon.stub(view.fxaClient, 'signIn', function () {
          return p(user.createAccount({
            verified: true
          }));
        });

        var password = 'password';
        $('[type=email]').val(email);
        $('[type=password]').val(password);
        sinon.stub(broker, 'afterSignIn', function () {
          return p();
        });

        return view.submit()
          .then(function () {
            assert.isTrue(TestHelpers.isEventLogged(metrics,
                              'signin.success'));
            assert.isTrue(broker.afterSignIn.calledWith());
          });
      });

      it('logs an error if user cancels login', function () {
        sinon.stub(broker, 'beforeSignIn', function () {
          return p.reject(AuthErrors.toError('USER_CANCELED_LOGIN'));
        });

        $('[type=email]').val(email);
        $('[type=password]').val('password');
        return view.submit()
          .then(function () {
            assert.isTrue(broker.beforeSignIn.calledWith(email));
            assert.isFalse(view.isErrorVisible());

            assert.isTrue(TestHelpers.isEventLogged(metrics,
                              'signin.canceled'));
          });
      });

      it('rejects promise with incorrect password message on incorrect password', function () {
        sinon.stub(view.fxaClient, 'signIn', function () {
          return p.reject(AuthErrors.toError('INCORRECT_PASSWORD'));
        });

        $('[type=email]').val(email);
        $('[type=password]').val('incorrect');
        return view.submit()
          .then(assert.fail, function (err) {
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

        view.fxaClient.signIn = function () {
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
      it('shows an error if session is expired', function () {
        sinon.stub(user, 'getChooserAccount', function () {
          return user.createAccount({
            sessionToken: 'abc123',
            email: 'a@a.com'
          });
        });

        return view.useLoggedInAccount()
          .then(function () {
            assert.isTrue(view._isErrorVisible);
            // do not show email input
            assert.notOk(view.$('#email').length);
            // show password input
            assert.ok(view.$('#password').length);
            assert.equal(view.$('.error').text(), 'Session expired. Sign in to continue.');
          });
      });

      it('signs in with a valid session', function () {
        sinon.stub(user, 'getChooserAccount', function () {
          return user.createAccount({
            sessionToken: 'abc123',
            email: 'a@a.com'
          });
        });

        view.fxaClient.recoveryEmailStatus = function () {
          return p({ verified: true });
        };

        return view.useLoggedInAccount()
          .then(function () {
            assert.equal(view.$('.error').text(), '');
            assert.notOk(view._isErrorVisible);
          });
      });
    });

    describe('useDifferentAccount', function () {
      it('can switch to signin with the useDifferentAccount button', function () {
        var account = user.createAccount({
          sessionToken: 'abc123',
          email: 'a@a.com'
        });
        sinon.stub(user, 'getChooserAccount', function () {
          return account;
        });
        sinon.stub(user, 'removeAllAccounts', function () {
          account = user.createAccount();
        });

        return view.useLoggedInAccount()
          .then(function () {
            assert.ok(view.$('.use-different').length, 'has use different button');
            return view.useDifferentAccount();
          })
          .then(function () {
            assert.ok(view.$('.email').length, 'should show email input');
            assert.ok(view.$('.password').length, 'should show password input');

            assert.equal(view.$('.email').val(), '', 'should have an empty email input');
          });
      });
    });

    describe('_suggestedAccount', function () {
      it('can suggest the user based on session variables', function () {
        assert.isTrue(view._suggestedAccount().isEmpty(), 'null when no account set');

        sinon.stub(user, 'getChooserAccount', function () {
          return user.createAccount({ sessionToken: 'abc123' });
        });
        assert.isTrue(view._suggestedAccount().isEmpty(), 'null when no email set');


        user.getChooserAccount.restore();
        sinon.stub(user, 'getChooserAccount', function () {
          return user.createAccount({ email: 'a@a.com' });
        });
        assert.isTrue(view._suggestedAccount().isEmpty(), 'null when no session token set');

        user.getChooserAccount.restore();
        view.prefillEmail = 'a@a.com';
        sinon.stub(user, 'getChooserAccount', function () {
          return user.createAccount({ sessionToken: 'abc123', email: 'b@b.com' });
        });
        assert.isTrue(view._suggestedAccount().isEmpty(), 'null when prefill does not match');

        delete view.prefillEmail;
        user.getChooserAccount.restore();
        sinon.stub(user, 'getChooserAccount', function () {
          return user.createAccount({ sessionToken: 'abc123', email: 'a@a.com' });
        });
        assert.equal(view._suggestedAccount().get('email'), 'a@a.com');

      });

      it('does shows if there is the same email in query params', function () {
        windowMock.location.search = '?email=a@a.com';
        var account = user.createAccount({
          sessionToken: 'abc123',
          email: 'a@a.com',
          sessionTokenContext: Constants.FX_DESKTOP_CONTEXT,
          verified: true,
          accessToken: 'foo'
        });

        sinon.stub(user, 'getChooserAccount', function () {
          return account;
        });

        return view.render()
          .then(function () {
            sinon.stub(account, 'getAvatar', function () {
              return p({ avatar: 'foo', id: 'bar' });
            });
            return view.afterVisible();
          })
          .then(function () {
            assert.notOk(view.$('.password').length, 'should not show password input');
            assert.ok(view.$('.avatar-view').length, 'should show suggested avatar');
          });
      });

      it('does not show if there is an email in query params that does not match', function () {
        windowMock.location.search = '?email=b@b.com';
        var account = user.createAccount({
          sessionToken: 'abc123',
          email: 'a@a.com',
          sessionTokenContext: Constants.FX_DESKTOP_CONTEXT,
          verified: true,
          accessToken: 'foo'
        });

        sinon.stub(user, 'getChooserAccount', function () {
          return account;
        });

        return view.render()
          .then(function () {
            assert.equal(view.$('.email')[0].type, 'email', 'should show email input');
            assert.ok(view.$('.password').length, 'should show password input');
          });
      });
    });

    describe('_suggestedAccountAskPassword', function () {
      it('asks for password right away if service is sync', function () {
        relier.isSync = function () {
          return true;
        };
        var account = user.createAccount({
          sessionToken: 'abc123',
          email: 'a@a.com',
          sessionTokenContext: Constants.FX_DESKTOP_CONTEXT,
          verified: true,
          accessToken: 'foo'
        });

        sinon.stub(user, 'getChooserAccount', function () {
          return account;
        });

        relier.set('service', 'sync');

        return view.render()
          .then(function () {
            assert.equal($('.email')[0].type, 'hidden', 'should not show email input');
            assert.ok($('.password').length, 'should show password input');
          });
      });

      it('does not ask for password right away if service is not sync', function () {
        var account = user.createAccount({
          sessionToken: 'abc123',
          email: 'a@a.com',
          sessionTokenContext: Constants.FX_DESKTOP_CONTEXT,
          verified: true,
          accessToken: 'foo'
        });

        sinon.stub(user, 'getChooserAccount', function () {
          return account;
        });

        relier.set('service', 'loop');

        return view.render()
          .then(function () {
            assert.ok($('.avatar-view').length, 'should show suggested avatar');
            assert.notOk($('.password').length, 'should show password input');
          });
      });
    });

  });
});
