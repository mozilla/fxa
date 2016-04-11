/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var Account = require('models/account');
  var AuthErrors = require('lib/auth-errors');
  var Backbone = require('backbone');
  var Broker = require('models/auth_brokers/base');
  var chai = require('chai');
  var Constants = require('lib/constants');
  var FormPrefill = require('models/form-prefill');
  var Metrics = require('lib/metrics');
  var Notifier = require('lib/channels/notifier');
  var p = require('lib/promise');
  var Relier = require('models/reliers/relier');
  var Session = require('lib/session');
  var sinon = require('sinon');
  var TestHelpers = require('../../lib/helpers');
  var User = require('models/user');
  var View = require('views/sign_in');
  var WindowMock = require('../../mocks/window');

  var assert = chai.assert;
  var wrapAssertion = TestHelpers.wrapAssertion;

  describe('views/sign_in', function () {
    var broker;
    var email;
    var formPrefill;
    var metrics;
    var model;
    var notifier;
    var relier;
    var user;
    var view;
    var windowMock;

    beforeEach(function () {
      email = TestHelpers.createEmail();
      formPrefill = new FormPrefill();
      metrics = new Metrics();
      model = new Backbone.Model();
      notifier = new Notifier();
      relier = new Relier();
      windowMock = new WindowMock();

      broker = new Broker({
        relier: relier
      });

      user = new User({
        notifier: notifier
      });

      Session.clear();


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
        broker: broker,
        formPrefill: formPrefill,
        metrics: metrics,
        model: model,
        notifier: notifier,
        relier: relier,
        user: user,
        viewName: 'signin',
        window: windowMock
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
              assert.equal(view.$('[type=email]').attr('spellcheck'), 'false');
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
              assert.equal(view.$('.prefillEmail').html(), 'a@a.com');
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

    describe('migration', function () {
      it('does not display migration message if no migration', function () {
        initView();

        return view.render()
          .then(function () {
            assert.lengthOf(view.$('.info.nudge'), 0);
          });
      });

      it('displays migration message if isSyncMigration returns true', function () {
        initView();
        sinon.stub(view, 'isSyncMigration', function () {
          return true;
        });

        return view.render()
          .then(function () {
            assert.equal(view.$('.info.nudge').html(), 'Migrate your sync data by signing in to your Firefox&nbsp;Account.');
            view.isSyncMigration.restore();
          });
      });

      it('does not display migration message if isSyncMigration returns false', function () {
        initView();
        sinon.stub(view, 'isSyncMigration', function () {
          return false;
        });

        return view.render()
          .then(function () {
            assert.lengthOf(view.$('.info.nudge'), 0);
            view.isSyncMigration.restore();
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

      describe('with a user that successfully signs in', function () {
        beforeEach(function () {
          sinon.stub(view, 'signIn', function () {
            return p();
          });

          return view.submit();
        });

        it('delegates to view.signIn', function () {
          assert.isTrue(view.signIn.calledOnce);

          var args = view.signIn.args[0];
          var account = args[0];
          assert.instanceOf(account, Account);
          var lockedAccountPassword = args[1];
          assert.equal(lockedAccountPassword, 'password');
        });
      });

      describe('with a locked out account', function () {
        beforeEach(function () {
          sinon.stub(view, 'signIn', function () {
            return p.reject(AuthErrors.toError('ACCOUNT_LOCKED'));
          });

          sinon.spy(view, 'notifyOfLockedAccount');

          return view.submit();
        });

        it('notifies the user of the locked account', function () {
          assert.isTrue(view.notifyOfLockedAccount.called);
          var args = view.notifyOfLockedAccount.args[0];
          var account = args[0];
          assert.instanceOf(account, Account);
          var lockedAccountPassword = args[1];
          assert.equal(lockedAccountPassword, 'password');
        });
      });

      describe('with a reset account', function () {
        beforeEach(function () {
          sinon.stub(view, 'signIn', function () {
            return p.reject(AuthErrors.toError('ACCOUNT_RESET'));
          });

          sinon.spy(view, 'notifyOfResetAccount');

          return view.submit();
        });

        it('notifies the user of the reset account', function () {
          assert.isTrue(view.notifyOfResetAccount.called);
          var args = view.notifyOfResetAccount.args[0];
          var account = args[0];
          assert.instanceOf(account, Account);
        });
      });

      describe('with a user that cancels login', function () {
        beforeEach(function () {
          sinon.stub(view, 'signIn', function () {
            return p.reject(AuthErrors.toError('USER_CANCELED_LOGIN'));
          });

          return view.submit();
        });

        it('logs the error', function () {
          assert.isTrue(TestHelpers.isEventLogged(metrics,
                            'signin.canceled'));
        });

        it('does not display an error', function () {
          assert.isFalse(view.isErrorVisible());
        });
      });

      describe('with an unknown account', function () {
        describe('and signup is enabled', function () {
          beforeEach(function () {
            broker.setCapability('signup', true);

            sinon.stub(view, 'signIn', function () {
              return p.reject(AuthErrors.toError('UNKNOWN_ACCOUNT'));
            });

            sinon.spy(view, 'displayErrorUnsafe');

            return view.submit();
          });

          it('shows a link to the signup page', function () {
            var err = view.displayErrorUnsafe.args[0][0];
            assert.isTrue(AuthErrors.is(err, 'UNKNOWN_ACCOUNT'));
            assert.include(err.forceMessage, '/signup');
          });
        });

        describe('and signup is disabled', function () {
          var err;

          beforeEach(function () {
            broker.setCapability('signup', false);

            sinon.stub(view, 'signIn', function () {
              return p.reject(AuthErrors.toError('UNKNOWN_ACCOUNT'));
            });

            sinon.spy(view, 'displayError');

            return view.validateAndSubmit()
              .then(assert.fail, function (_err) {
                err = _err;
              });
          });

          it('does not show the signup link', function () {
            var displayedError = view.displayError.args[0][0];
            assert.strictEqual(err, displayedError);
            assert.isTrue(AuthErrors.is(err, 'UNKNOWN_ACCOUNT'));
            assert.notInclude(AuthErrors.toMessage(err), '/signup');
          });
        });
      });

      describe('other errors', function () {
        var err;

        beforeEach(function () {
          sinon.stub(view, 'signIn', function () {
            return p.reject(AuthErrors.toError('INVALID_JSON'));
          });

          sinon.spy(view, 'displayError');

          return view.validateAndSubmit()
            .then(assert.fail, function (_err) {
              err = _err;
            });
        });

        it('are displayed', function () {
          var displayedError = view.displayError.args[0][0];
          assert.strictEqual(err, displayedError);
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
            email: 'a@a.com',
            sessionToken: 'abc123',
            uid: 'foo'
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
          email: 'a@a.com',
          sessionToken: 'abc123'
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
          email: 'a@a.com',
          sessionToken: 'abc123',
          uid: 'foo'
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
          return user.initAccount({ email: 'b@b.com', sessionToken: 'abc123' });
        });
        assert.isTrue(view._suggestedAccount().isDefault(), 'null when prefill does not match');

        delete view.prefillEmail;
        user.getChooserAccount.restore();
        sinon.stub(user, 'getChooserAccount', function () {
          return user.initAccount({ email: 'a@a.com', sessionToken: 'abc123' });
        });
        assert.equal(view._suggestedAccount().get('email'), 'a@a.com');

      });

      it('initializes getAccount from user.getChooserAccount', function () {
        var account = user.initAccount({
          email: 'a@a.com',
          sessionToken: 'abc123'
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
          accessToken: 'foo',
          email: 'a@a.com',
          sessionToken: 'abc123',
          sessionTokenContext: Constants.SESSION_TOKEN_USED_FOR_SYNC,
          verified: true
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
          accessToken: 'foo',
          email: 'a@a.com',
          sessionToken: 'abc123',
          sessionTokenContext: Constants.SESSION_TOKEN_USED_FOR_SYNC,
          verified: true
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
            accessToken: 'foo',
            email: 'a@a.com',
            sessionToken: 'abc123',
            sessionTokenContext: Constants.SESSION_TOKEN_USED_FOR_SYNC,
            verified: true
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
      it('asks for password right away if the relier wants keys (Sync)', function () {
        var account = user.initAccount({
          accessToken: 'foo',
          email: 'a@a.com',
          sessionToken: 'abc123',
          sessionTokenContext: Constants.SESSION_TOKEN_USED_FOR_SYNC,
          verified: true
        });

        sinon.stub(view, 'getAccount', function () {
          return account;
        });

        sinon.stub(relier, 'wantsKeys', function () {
          return true;
        });

        return view.render()
          .then(function () {
            assert.isTrue($('.email').hasClass('hidden'), 'should not show email input');
            assert.ok($('.password').length, 'should show password input');
            assert.isTrue(TestHelpers.isEventLogged(metrics, 'signin.ask-password.shown.keys-required'));
          });
      });

      it('does not ask for password right away if service is not sync', function () {
        var account = user.initAccount({
          accessToken: 'foo',
          email: 'a@a.com',
          sessionToken: 'abc123',
          sessionTokenContext: Constants.SESSION_TOKEN_USED_FOR_SYNC,
          verified: true
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
          accessToken: 'foo',
          email: 'a@a.com',
          sessionToken: 'abc123',
          verified: true
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
          accessToken: 'foo',
          email: 'a@a.com',
          sessionToken: 'abc123',
          sessionTokenContext: Constants.SESSION_TOKEN_USED_FOR_SYNC,
          verified: true
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
          accessToken: 'foo',
          email: 'a@a.com',
          sessionToken: 'abc123',
          sessionTokenContext: Constants.SESSION_TOKEN_USED_FOR_SYNC,
          verified: true
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
