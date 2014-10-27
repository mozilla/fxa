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
  'models/form-prefill',
  'models/auth_brokers/base',
  '../../mocks/window',
  '../../mocks/router',
  '../../lib/helpers'
],
function (chai, $, sinon, p, View, Session, AuthErrors, Metrics, FxaClient,
      Constants, Relier, User, FormPrefill, Broker, WindowMock, RouterMock,
      TestHelpers) {
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
    var formPrefill;

    beforeEach(function () {
      email = TestHelpers.createEmail();

      Session.clear();

      routerMock = new RouterMock();
      windowMock = new WindowMock();
      metrics = new Metrics();
      relier = new Relier();
      broker = new Broker();
      user = new User();
      fxaClient = new FxaClient();
      formPrefill = new FormPrefill();

      initView();

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

    function initView () {
      view = new View({
        router: routerMock,
        metrics: metrics,
        window: windowMock,
        fxaClient: fxaClient,
        user: user,
        relier: relier,
        broker: broker,
        screenName: 'signin',
        formPrefill: formPrefill
      });
    }

    describe('render', function () {
      it('prefills email and password if stored in formPrefill (user comes from signup with existing account)', function () {
        formPrefill.set('email', 'testuser@testuser.com');
        formPrefill.set('password', 'prefilled password');

        initView();
        return view.render()
            .then(function () {
              assert.ok(view.$('#fxa-signin-header').length);
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
        initView();
        return view.render()
            .then(function () {
              assert.include(view.$('#fxa-signin-header').text(), serviceName);
            });
      });

      it('shows a prefilled email and password field of cached session', function () {
        sinon.stub(view, 'getAccount', function () {
          return user.initAccount({
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

      it('prefills email with email from relier if Session.prefillEmail is not set', function () {
        relier.set('email', 'testuser@testuser.com');

        initView();
        return view.render()
            .then(function () {
              assert.equal(view.$('[type=email]').val(), 'testuser@testuser.com');
            });
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
          return p({ verified: false, sessionToken: sessionToken });
        });
        sinon.stub(view.fxaClient, 'signUpResend', function () {
          return p();
        });
        sinon.stub(user, 'setSignedInAccount', function () {
          return p();
        });

        var password = 'password';
        $('[type=email]').val(email);
        $('[type=password]').val(password);

        return view.submit()
          .then(function () {
            assert.equal(routerMock.page, 'confirm');
            assert.isTrue(user.setSignedInAccount.called);
            assert.isTrue(view.fxaClient.signIn.calledWith(
                email, password, relier));
            assert.isTrue(view.fxaClient.signUpResend.calledWith(
                relier, sessionToken));
          });
      });

      it('notifies the broker when a verified user signs in', function () {
        sinon.stub(view.fxaClient, 'signIn', function () {
          return p({
            verified: true
          });
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

      it('shows error message to locked out users', function () {
        sinon.stub(view.fxaClient, 'signIn', function () {
          return p.reject(AuthErrors.toError('ACCOUNT_LOCKED'));
        });

        var password = 'password';
        $('[type=email]').val(email);
        $('[type=password]').val(password);
        return view.submit()
          .then(function () {
            assert.isTrue(view.isErrorVisible());
            assert.include(view.$('.error').text().toLowerCase(), 'locked');
            var err = view._normalizeError(AuthErrors.toError('ACCOUNT_LOCKED'));
            assert.isTrue(TestHelpers.isErrorLogged(metrics, err));
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

        sinon.stub(view.fxaClient, 'signIn', function () {
          return p.reject(AuthErrors.toError('UNKNOWN_ACCOUNT'));
        });

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

    describe('useLoggedInAccount', function () {
      it('shows an error if session is expired', function () {

        sinon.stub(view, 'getAccount', function () {
          return user.initAccount({
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
        var account = user.initAccount({
          sessionToken: 'abc123',
          email: 'a@a.com'
        });
        sinon.stub(view, 'getAccount', function () {
          return account;
        });

        view.fxaClient.recoveryEmailStatus = function () {
          return p({ verified: true });
        };

        sinon.stub(user, 'setSignedInAccount', function () {
          return p();
        });

        return view.useLoggedInAccount()
          .then(function () {
            assert.isTrue(user.setSignedInAccount.calledWith(account));
            assert.equal(view.$('.error').text(), '');
            assert.notOk(view._isErrorVisible);
          });
      });
    });

    describe('useDifferentAccount', function () {
      it('can switch to signin with the useDifferentAccount button', function () {
        var account = user.initAccount({
          sessionToken: 'abc123',
          email: 'a@a.com'
        });
        sinon.stub(view, 'getAccount', function () {
          return account;
        });
        sinon.stub(user, 'removeAllAccounts', function () {
          account = user.initAccount();
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
          return user.initAccount({ sessionToken: 'abc123' });
        });
        assert.isTrue(view._suggestedAccount().isEmpty(), 'null when no email set');


        user.getChooserAccount.restore();
        sinon.stub(user, 'getChooserAccount', function () {
          return user.initAccount({ email: 'a@a.com' });
        });
        assert.isTrue(view._suggestedAccount().isEmpty(), 'null when no session token set');

        user.getChooserAccount.restore();
        formPrefill.set('email', 'a@a.com');
        sinon.stub(user, 'getChooserAccount', function () {
          return user.initAccount({ sessionToken: 'abc123', email: 'b@b.com' });
        });
        assert.isTrue(view._suggestedAccount().isEmpty(), 'null when prefill does not match');

        delete view.prefillEmail;
        user.getChooserAccount.restore();
        sinon.stub(user, 'getChooserAccount', function () {
          return user.initAccount({ sessionToken: 'abc123', email: 'a@a.com' });
        });
        assert.equal(view._suggestedAccount().get('email'), 'a@a.com');

      });

      it('initializes getAccount from user.getChooserAccount', function () {
        var account = user.initAccount({
          sessionToken: 'abc123',
          email: 'a@a.com'
        });
        sinon.stub(user, 'getChooserAccount', function () {
          return account;
        });

        return view.render()
          .then(function () {
            assert.equal(view.getAccount(), account);
          });
      });

      it('shows if there is the same email in relier', function () {
        relier.set('email', 'a@a.com');
        var account = user.initAccount({
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

      it('does not show if there is an email in relier that does not match', function () {
        relier.set('email', 'b@b.com');
        var account = user.initAccount({
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

      it('does not show if the relier overrules cached credentials', function () {
        sinon.stub(relier, 'allowCachedCredentials', function () {
          return false;
        });

        relier.set('email', 'a@a.com');

        sinon.stub(user, 'getChooserAccount', function () {
          return user.initAccount({
            sessionToken: 'abc123',
            email: 'a@a.com',
            sessionTokenContext: Constants.FX_DESKTOP_CONTEXT,
            verified: true,
            accessToken: 'foo'
          });
        });

        return view.render()
          .then(function () {
            assert.equal(view.$('input[type=email]').length, 1, 'should show email input');
            assert.equal(view.$('input[type=password]').length, 1, 'should show password input');
          });
      });
    });

    describe('_suggestedAccountAskPassword', function () {
      it('asks for password right away if service is sync', function () {
        relier.isSync = function () {
          return true;
        };
        var account = user.initAccount({
          sessionToken: 'abc123',
          email: 'a@a.com',
          sessionTokenContext: Constants.FX_DESKTOP_CONTEXT,
          verified: true,
          accessToken: 'foo'
        });

        sinon.stub(view, 'getAccount', function () {
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
        var account = user.initAccount({
          sessionToken: 'abc123',
          email: 'a@a.com',
          sessionTokenContext: Constants.FX_DESKTOP_CONTEXT,
          verified: true,
          accessToken: 'foo'
        });

        sinon.stub(view, 'getAccount', function () {
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

    describe('_signIn', function () {
      it('throws on an empty account', function () {
        return view._signIn().then(assert.fail, function (err) {
          assert.isTrue(AuthErrors.is(err, 'UNEXPECTED_ERROR'));
        });
      });

      it('throws on an empty account', function () {
        var account = user.initAccount({
          email: 'a@a.com'
        });

        return view._signIn(account).then(assert.fail, function (err) {
          assert.isTrue(AuthErrors.is(err, 'UNEXPECTED_ERROR'));
        });
      });
    });

    describe('beforeDestroy', function () {
      it('saves the form info to formPrefill', function () {
        view.$('.email').val('testuser@testuser.com');
        view.$('.password').val('password');

        view.beforeDestroy();

        assert.equal(formPrefill.get('email'), 'testuser@testuser.com');
        assert.equal(formPrefill.get('password'), 'password');
      });
    });

  });
});
