/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'jquery',
  'sinon',
  'lib/promise',
  'views/sign_in',
  'lib/session',
  'lib/auth-errors',
  'lib/oauth-errors',
  'lib/metrics',
  'lib/fxa-client',
  'lib/constants',
  'lib/ephemeral-messages',
  'models/reliers/relier',
  'models/user',
  'models/form-prefill',
  'models/auth_brokers/base',
  '../../mocks/window',
  '../../mocks/router',
  '../../lib/helpers'
],
function (chai, $, sinon, p, View, Session, AuthErrors, OAuthErrors, Metrics,
      FxaClient, Constants, EphemeralMessages, Relier, User, FormPrefill, Broker,
      WindowMock, RouterMock, TestHelpers) {
  'use strict';

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
    var ephemeralMessages;

    beforeEach(function () {
      email = TestHelpers.createEmail();

      Session.clear();

      routerMock = new RouterMock();
      windowMock = new WindowMock();
      metrics = new Metrics();
      relier = new Relier();
      broker = new Broker({
        relier: relier
      });
      fxaClient = new FxaClient();
      user = new User({
        fxaClient: fxaClient
      });
      formPrefill = new FormPrefill();
      ephemeralMessages = new EphemeralMessages();

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
        formPrefill: formPrefill,
        ephemeralMessages: ephemeralMessages
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

      it('displays a message if isMigration returns true', function () {
        initView();
        sinon.stub(view, 'isMigration', function (arg) {
          return true;
        });

        return view.render()
          .then(function () {
            assert.equal(view.$('.info.nudge').html(), 'Migrate your sync data by signing in to your Firefox&nbsp;Account.');
            view.isMigration.restore();
          });
      });

      it('does not display a message if isMigration returns false', function () {
        initView();
        sinon.stub(view, 'isMigration', function (arg) {
          return false;
        });

        return view.render()
          .then(function () {
            assert.lengthOf(view.$('.info.nudge'), 0);
            view.isMigration.restore();
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
      beforeEach(function () {
        view.enableForm();

        $('[type=email]').val(email);
        $('[type=password]').val('password');
      });

      it('redirects users to permissions page if relier needs permissions', function () {
        sinon.spy(user, 'initAccount');
        sinon.spy(broker, 'beforeSignIn');
        var sessionToken = 'abc123';

        sinon.stub(user, 'signInAccount', function (account) {
          account.set('sessionToken', sessionToken);
          return p(account);
        });
        sinon.stub(relier, 'accountNeedsPermissions', function () {
          return true;
        });
        sinon.stub(view, 'navigate', function () { });

        return view.submit()
          .then(function () {
            var account = user.initAccount.returnValues[0];

            assert.equal(account.get('email'), email);
            assert.equal(account.get('sessionToken'), sessionToken);
            assert.isTrue(broker.beforeSignIn.calledWith(email));
            assert.isTrue(user.signInAccount.calledWith(account, relier));
            assert.isTrue(relier.accountNeedsPermissions.calledWith(account));
            assert.isTrue(view.navigate.calledWith('signin_permissions', {
              data: {
                account: account
              }
            }));
          });
      });

      it('redirects users to the page they requested before getting redirected to signin', function () {
        sinon.stub(user, 'signInAccount', function (account) {
          account.set('verified', true);
          return p(account);
        });

        ephemeralMessages.set('data', {
          redirectTo: '/settings/avatar/change'
        });

        initView();
        sinon.stub(view, 'navigate', function () { });

        return view.render()
          .then(view.submit.bind(view))
          .then(function () {
            assert.isTrue(view.navigate.calledWith('/settings/avatar/change'));
          });
      });

      it('redirects unverified users to the confirm page on success', function () {
        sinon.spy(user, 'initAccount');
        sinon.spy(broker, 'beforeSignIn');

        sinon.stub(user, 'signInAccount', function (account) {
          account.set('verified', false);
          return p(account);
        });
        sinon.stub(relier, 'accountNeedsPermissions', function () {
          return false;
        });
        sinon.stub(view, 'getStringifiedResumeToken', function () {
          // the resume token is used post email verification.
          return 'resume token';
        });

        return view.submit()
          .then(function () {
            assert.isTrue(broker.beforeSignIn.calledWith(email));
            assert.isTrue(user.signInAccount.calledWith(
              user.initAccount.returnValues[0],
              relier,
              {
                resume: 'resume token'
              }
            ));
            assert.equal(routerMock.page, 'confirm');
          });
      });

      it('notifies the broker when a verified user signs in', function () {
        sinon.spy(user, 'initAccount');
        sinon.spy(broker, 'beforeSignIn');

        sinon.stub(user, 'signInAccount', function (account) {
          account.set('verified', true);
          return p(account);
        });
        sinon.stub(relier, 'accountNeedsPermissions', function () {
          return false;
        });
        sinon.stub(broker, 'afterSignIn', function () {
          return p();
        });

        return view.submit()
          .then(function () {
            var account = user.initAccount.returnValues[0];

            assert.isTrue(broker.beforeSignIn.calledWith(email));
            assert.isTrue(user.signInAccount.calledWith(account, relier));

            assert.isTrue(TestHelpers.isEventLogged(metrics,
                              'signin.success'));
            assert.isTrue(broker.afterSignIn.calledWith(account));

            assert.equal(routerMock.page, 'settings');
          });
      });

      it('shows error message to locked out users', function () {
        sinon.stub(view.fxaClient, 'signIn', function () {
          return p.reject(AuthErrors.toError('ACCOUNT_LOCKED'));
        });

        return view.submit()
          .then(function () {
            assert.isTrue(view.isErrorVisible());
            assert.include(view.$('.error').text().toLowerCase(), 'locked');
            var err = view._normalizeError(AuthErrors.toError('ACCOUNT_LOCKED'));
            assert.isTrue(TestHelpers.isErrorLogged(metrics, err));
          });
      });

      it('shows an error message if the scope is invalid', function () {
        sinon.stub(view.fxaClient, 'signIn', function () {
          return p.reject(OAuthErrors.toError({ errno: 114 }));
        });

        // The submit handler does not special case INVALID_SCOPES and error
        // generic handling logic is done by validateAndSubmit.
        // Call validateAndSubmit to ensure the error message is displayed.
        return view.validateAndSubmit()
          .then(assert.fail, function () {
            assert.isTrue(view.isErrorVisible());
            assert.include(view.$('.error').text().toLowerCase(), 'scope');

            var err = view._normalizeError(OAuthErrors.toError('INVALID_SCOPES'));
            assert.isTrue(TestHelpers.isErrorLogged(metrics, err));
          });
      });

      it('logs an error if user cancels login', function () {
        sinon.stub(broker, 'beforeSignIn', function () {
          return p.reject(AuthErrors.toError('USER_CANCELED_LOGIN'));
        });

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

        return view.submit()
          .then(assert.fail, function (err) {
            assert.ok(err.message.indexOf('Incorrect') > -1);
          });
      });

      it('show a link to to signup page if user enters unknown account and signup is enabled', function () {
        sinon.stub(broker, 'isSignupDisabled', function () {
          return false;
        });

        sinon.stub(view.fxaClient, 'signIn', function () {
          return p.reject(AuthErrors.toError('UNKNOWN_ACCOUNT'));
        });

        return view.submit()
          .then(function (msg) {
            assert.include(msg, '/signup');
          });
      });

      it('do not show a link to signup page if user enters unknown account and signup is disabled', function () {
        sinon.stub(broker, 'isSignupDisabled', function () {
          return true;
        });

        sinon.stub(view.fxaClient, 'signIn', function () {
          return p.reject(AuthErrors.toError('UNKNOWN_ACCOUNT'));
        });

        return view.submit()
          .fail(function (err) {
            assert.notInclude(AuthErrors.toMessage(err), '/signup');
          });
      });

      it('passes other errors along', function () {
        sinon.stub(view.fxaClient, 'signIn', function () {
          return p.reject(AuthErrors.toError('INVALID_JSON'));
        });

        return view.submit()
          .then(assert.fail, function (err) {
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

        sinon.stub(user, 'signInAccount', function (account) {
          account.set('verified', true);
          return p(account);
        });

        return view.useLoggedInAccount()
          .then(function () {
            assert.isTrue(user.signInAccount.calledWith(account));
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
            assert.isTrue(TestHelpers.isEventLogged(metrics,
                              'signin.use-different-account'));
          });
      });
    });

    describe('_suggestedAccount', function () {
      it('can suggest the user based on session variables', function () {
        assert.isTrue(view._suggestedAccount().isDefault(), 'null when no account set');

        sinon.stub(user, 'getChooserAccount', function () {
          return user.initAccount({ sessionToken: 'abc123' });
        });
        assert.isTrue(view._suggestedAccount().isDefault(), 'null when no email set');

        user.getChooserAccount.restore();
        sinon.stub(user, 'getChooserAccount', function () {
          return user.initAccount({ email: 'a@a.com' });
        });
        assert.isTrue(view._suggestedAccount().isDefault(), 'null when no session token set');

        user.getChooserAccount.restore();
        formPrefill.set('email', 'a@a.com');
        sinon.stub(user, 'getChooserAccount', function () {
          return user.initAccount({ sessionToken: 'abc123', email: 'b@b.com' });
        });
        assert.isTrue(view._suggestedAccount().isDefault(), 'null when prefill does not match');

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
          sessionTokenContext: Constants.SESSION_TOKEN_USED_FOR_SYNC,
          verified: true,
          accessToken: 'foo'
        });

        var imgUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQYV2P4DwABAQEAWk1v8QAAAABJRU5ErkJggg==';

        sinon.stub(user, 'getChooserAccount', function () {
          return account;
        });

        metrics.events.clear();
        return view.render()
          .then(function () {
            sinon.stub(account, 'getAvatar', function () {
              return p({ avatar: imgUrl, id: 'bar' });
            });
            return view.afterVisible();
          })
          .then(function () {
            assert.notOk(view.$('.password').length, 'should not show password input');
            assert.ok(view.$('.avatar-view img').length, 'should show suggested avatar');
            assert.isTrue(TestHelpers.isEventLogged(metrics, 'signin.ask-password.skipped'));
            var askPasswordEvents = metrics.getFilteredData().events.filter(function (event) {
              return event.type === 'signin.ask-password.skipped';
            });
            assert.equal(askPasswordEvents.length, 1, 'event should only be logged once');
          });
      });

      it('does not show if there is an email in relier that does not match', function () {
        relier.set('email', 'b@b.com');
        var account = user.initAccount({
          sessionToken: 'abc123',
          email: 'a@a.com',
          sessionTokenContext: Constants.SESSION_TOKEN_USED_FOR_SYNC,
          verified: true,
          accessToken: 'foo'
        });

        sinon.stub(user, 'getChooserAccount', function () {
          return account;
        });

        return view.render()
          .then(function () {
            assert.equal(view.$('.email').attr('type'), 'email', 'should show email input');
            assert.ok(view.$('.password').length, 'should show password input');
            assert.isTrue(TestHelpers.isEventLogged(metrics, 'signin.ask-password.shown.account-unknown'));
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
            sessionTokenContext: Constants.SESSION_TOKEN_USED_FOR_SYNC,
            verified: true,
            accessToken: 'foo'
          });
        });

        return view.render()
          .then(function () {
            assert.equal(view.$('input[type=email]').length, 1, 'should show email input');
            assert.equal(view.$('input[type=password]').length, 1, 'should show password input');
            assert.isTrue(TestHelpers.isEventLogged(metrics, 'signin.ask-password.shown.account-unknown'));
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
          sessionTokenContext: Constants.SESSION_TOKEN_USED_FOR_SYNC,
          verified: true,
          accessToken: 'foo'
        });

        sinon.stub(view, 'getAccount', function () {
          return account;
        });

        relier.set('service', 'sync');

        return view.render()
          .then(function () {
            assert.isTrue($('.email').hasClass('hidden'), 'should not show email input');
            assert.ok($('.password').length, 'should show password input');
            assert.isTrue(TestHelpers.isEventLogged(metrics, 'signin.ask-password.shown.keys-required'));
          });
      });

      it('asks for the password if the relier wants keys', function () {
        sinon.stub(relier, 'wantsKeys', function () {
          return true;
        });

        var account = user.initAccount({
          sessionToken: 'abc123',
          email: 'a@a.com',
          sessionTokenContext: Constants.SESSION_TOKEN_USED_FOR_SYNC,
          verified: true,
          accessToken: 'foo'
        });

        sinon.stub(view, 'getAccount', function () {
          return account;
        });

        relier.set('service', 'Firefox Hello');

        return view.render()
          .then(function () {
            assert.isTrue($('.email').hasClass('hidden'), 'should not show email input');
            assert.ok($('.password').length, 'should show password input');
            assert.isTrue(TestHelpers.isEventLogged(metrics, 'signin.ask-password.shown.keys-required'));
          });
      });

      it('does not ask for password right away if service is not sync', function () {
        var account = user.initAccount({
          sessionToken: 'abc123',
          email: 'a@a.com',
          sessionTokenContext: Constants.SESSION_TOKEN_USED_FOR_SYNC,
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
            assert.notOk($('.password').length, 'should not show password input');
            assert.isTrue(TestHelpers.isEventLogged(metrics, 'signin.ask-password.skipped'));
          });
      });

      it('asks for the password if the stored session is not from sync', function () {
        var account = user.initAccount({
          sessionToken: 'abc123',
          email: 'a@a.com',
          verified: true,
          accessToken: 'foo'
        });

        sinon.stub(view, 'getAccount', function () {
          return account;
        });

        relier.set('service', 'loop');

        return view.render()
          .then(function () {
            assert.isTrue($('.email').hasClass('hidden'), 'should not show email input');
            assert.ok($('.password').length, 'should show password input');
            assert.isTrue(TestHelpers.isEventLogged(metrics, 'signin.ask-password.shown.session-from-web'));
          });
      });

      it('asks for the password if the prefill email is different', function () {
        var account = user.initAccount({
          sessionToken: 'abc123',
          email: 'a@a.com',
          verified: true,
          sessionTokenContext: Constants.SESSION_TOKEN_USED_FOR_SYNC,
          accessToken: 'foo'
        });

        sinon.stub(view, 'getAccount', function () {
          return account;
        });

        sinon.stub(view, 'getPrefillEmail', function () {
          return 'b@b.com';
        });

        relier.set('service', 'loop');

        return view.render()
          .then(function () {
            assert.isTrue($('.email').hasClass('hidden'), 'should not show email input');
            assert.ok($('.password').length, 'should show password input');
            assert.isTrue(TestHelpers.isEventLogged(metrics, 'signin.ask-password.shown.email-mismatch'));
          });
      });

      it('asks for the password when re-rendered due to an expired session', function () {
        var account = user.initAccount({
          sessionToken: 'abc123',
          email: 'a@a.com',
          sessionTokenContext: Constants.SESSION_TOKEN_USED_FOR_SYNC,
          verified: true,
          accessToken: 'foo'
        });

        sinon.stub(view, 'getAccount', function () {
          return account;
        });

        relier.set('service', 'loop');

        view.chooserAskForPassword = true;
        return view.render()
          .then(function () {
            assert.isTrue($('.email').hasClass('hidden'), 'should not show email input');
            assert.ok($('.password').length, 'should show password input');
            assert.isTrue(TestHelpers.isEventLogged(metrics, 'signin.ask-password.shown.session-expired'));
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
