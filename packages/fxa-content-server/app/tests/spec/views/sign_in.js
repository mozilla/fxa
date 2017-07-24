/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const Account = require('models/account');
  const { assert } = require('chai');
  const AuthErrors = require('lib/auth-errors');
  const Backbone = require('backbone');
  const Broker = require('models/auth_brokers/base');
  const Constants = require('lib/constants');
  const FormPrefill = require('models/form-prefill');
  const Metrics = require('lib/metrics');
  const Notifier = require('lib/channels/notifier');
  const p = require('lib/promise');
  const Relier = require('models/reliers/relier');
  const Session = require('lib/session');
  const sinon = require('sinon');
  const Translator = require('lib/translator');
  const { createEmail, isEventLogged, wrapAssertion } = require('../../lib/helpers');
  const User = require('models/user');
  const View = require('views/sign_in');
  const WindowMock = require('../../mocks/window');

  describe('views/sign_in', () => {
    let broker;
    let email;
    let formPrefill;
    let metrics;
    let model;
    let notifier;
    let relier;
    let user;
    let view;
    let translator;
    let windowMock;

    beforeEach(() => {
      email = createEmail();
      formPrefill = new FormPrefill();
      model = new Backbone.Model();
      notifier = new Notifier();
      metrics = new Metrics({
        notifier,
        sentryMetrics: {
          captureException () {}
        }
      });
      relier = new Relier();
      windowMock = new WindowMock();
      translator = new Translator({forceEnglish: true});

      broker = new Broker({
        relier: relier
      });

      user = new User({
        metrics,
        notifier
      });

      Session.clear();


      initView();

      $('body').attr('data-flow-id', 'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103');
      $('body').attr('data-flow-begin', '42');

      return view.render();
    });

    afterEach(() => {
      metrics.destroy();
      metrics = null;

      view.remove();
      view.destroy();

      view = null;
    });

    function initView () {
      view = new View({
        broker: broker,
        formPrefill: formPrefill,
        metrics: metrics,
        model: model,
        notifier: notifier,
        relier: relier,
        translator: translator,
        user: user,
        viewName: 'signin',
        window: windowMock
      });
    }

    describe('render', () => {
      it('prefills email and password if stored in formPrefill (user comes from signup with existing account)', () => {
        formPrefill.set('email', 'testuser@testuser.com');
        formPrefill.set('password', 'prefilled password');

        initView();
        return view.render()
            .then(() => {
              assert.ok(view.$('#fxa-signin-header').length);
              assert.equal(view.$('[type=email]').val(), 'testuser@testuser.com');
              assert.equal(view.$('[type=email]').attr('spellcheck'), 'false');
              assert.equal(view.$('[type=password]').val(), 'prefilled password');
            });
      });

      it('Shows serviceName from the relier', () => {
        relier.isSync = () => true;
        const serviceName = 'another awesome service by Mozilla';
        relier.set('serviceName', serviceName);

        // initialize a new view to set the service name
        initView();
        return view.render()
            .then(() => {
              assert.include(view.$('#fxa-signin-header').text(), serviceName);
            });
      });

      it('shows a prefilled email and password field of cached session', () => {
        sinon.stub(view, 'getAccount', () => {
          return user.initAccount({
            email: 'a@a.com',
            sessionToken: 'abc123'
          });
        });
        return view.render()
            .then(() => {
              assert.ok(view.$('#fxa-signin-header').length);
              assert.equal(view.$('.prefillEmail').html(), 'a@a.com');
              assert.equal(view.$('[type=password]').val(), '');
            });
      });

      it('prefills email with email from relier if prefillEmail is not set', () => {
        relier.set('email', 'testuser@testuser.com');

        initView();
        return view.render()
            .then(() => {
              assert.equal(view.$('[type=email]').val(), 'testuser@testuser.com');
            });
      });

      describe('with a cached account whose accessToken is invalidated after render', () => {
        beforeEach(() => {
          initView();

          const account = user.initAccount({
            accessToken: 'access token',
            email: 'a@a.com',
            sessionToken: 'session token',
            sessionTokenContext: Constants.SYNC_SERVICE
          });

          sinon.stub(view, '_suggestedAccount', () => account);
          sinon.stub(view, 'displayAccountProfileImage', () => p());
          sinon.spy(view, 'render');

          return view.render()
            .then(() => view.afterVisible())
            .then(() => {
              account.set({
                accessToken: null,
                sessionToken: null,
                sessionTokenContext: null
              });
            });
        });

        it('re-renders, keeps the original email, forces user to enter password', () => {
          assert.equal(view.render.callCount, 2);
          assert.equal(view.$('.prefillEmail').text(), 'a@a.com');
          assert.equal(view.$('input[type=email]').val(), 'a@a.com');
          assert.lengthOf(view.$('input[type=password]'), 1);
        });
      });
    });

    describe('destroy', () => {
      beforeEach(() => {
        initView();

        const account = user.initAccount({
          accessToken: 'access token',
          email: 'a@a.com',
          sessionToken: 'session token',
          sessionTokenContext: Constants.SYNC_SERVICE
        });

        sinon.stub(view, '_suggestedAccount', () => account);
        sinon.stub(view, 'displayAccountProfileImage', () => p());
        sinon.spy(view, 'render');

        return view.render()
          .then(() => view.afterVisible())
          .then(() => view.destroy())
          .then(() => {
            account.set({
              accessToken: null,
              sessionToken: null,
              sessionTokenContext: null
            });
          });
      });

      it('does not re-render once destroyed if the accessToken is invalidated', () => {
        assert.equal(view.render.callCount, 1);
      });
    });

    describe('migration', () => {
      it('does not display migration message if no migration', () => {
        initView();

        return view.render()
          .then(() => {
            assert.lengthOf(view.$('#sync-migration'), 0);
          });
      });

      it('displays migration message if isSyncMigration returns true', () => {
        initView();
        sinon.stub(view, 'isSyncMigration', () => true);

        return view.render()
          .then(() => {
            assert.equal(view.$('#sync-migration').html(), 'Migrate your sync data by signing in to your Firefox&nbsp;Account.');
            view.isSyncMigration.restore();
          });
      });

      it('does not display migration message if isSyncMigration returns false', () => {
        initView();
        sinon.stub(view, 'isSyncMigration', () => false);

        return view.render()
          .then(() => {
            assert.lengthOf(view.$('#sync-migration'), 0);
            view.isSyncMigration.restore();
          });
      });
    });

    describe('isValid', () => {
      it('returns true if both email and password are valid', () => {
        view.$('[type=email]').val('testuser@testuser.com');
        view.$('[type=password]').val('password');
        assert.isTrue(view.isValid());
      });

      it('returns false if email is invalid', () => {
        view.$('[type=email]').val('testuser');
        view.$('[type=password]').val('password');
        assert.isFalse(view.isValid());
      });

      it('returns false if password is invalid', () => {
        view.$('[type=email]').val('testuser@testuser.com');
        view.$('[type=password]').val('passwor');
        assert.isFalse(view.isValid());
      });
    });

    describe('submit', () => {
      beforeEach(() => {
        view.enableForm();

        view.$('[type=email]').val(email);
        view.$('[type=password]').val('password');
      });

      describe('with a user that successfully signs in', () => {
        beforeEach(() => {
          sinon.stub(view, 'signIn', () => p());

          return view.submit();
        });

        it('delegates to view.signIn', () => {
          assert.isTrue(view.signIn.calledOnce);

          const args = view.signIn.args[0];
          const account = args[0];
          assert.instanceOf(account, Account);
          const password = args[1];
          assert.equal(password, 'password');
        });
      });

      describe('with a reset account', () => {
        beforeEach(() => {
          sinon.stub(view, 'signIn', () => {
            return p.reject(AuthErrors.toError('ACCOUNT_RESET'));
          });

          sinon.spy(view, 'notifyOfResetAccount');

          return view.submit();
        });

        it('notifies the user of the reset account', () => {
          assert.isTrue(view.notifyOfResetAccount.called);
          const args = view.notifyOfResetAccount.args[0];
          const account = args[0];
          assert.instanceOf(account, Account);
        });
      });

      describe('with a user that cancels login', () => {
        beforeEach(() => {
          sinon.stub(view, 'signIn', () => {
            return p.reject(AuthErrors.toError('USER_CANCELED_LOGIN'));
          });

          return view.submit();
        });

        it('logs, but does not display the error', () => {
          assert.isTrue(isEventLogged(metrics, 'signin.canceled'));
          assert.isFalse(view.isErrorVisible());
        });
      });

      describe('with an unknown account', () => {
        beforeEach(() => {
          broker.setCapability('signup', true);

          sinon.stub(view, 'signIn', () => {
            return p.reject(AuthErrors.toError('UNKNOWN_ACCOUNT'));
          });

          sinon.spy(view, 'unsafeDisplayError');

          return view.submit();
        });

        it('shows a link to the signup page', () => {
          const err = view.unsafeDisplayError.args[0][0];
          assert.isTrue(AuthErrors.is(err, 'UNKNOWN_ACCOUNT'));
          assert.include(err.forceMessage, '/signup');
        });
      });

      describe('other errors', () => {
        let err;

        beforeEach(() => {
          sinon.stub(view, 'signIn', () => {
            return p.reject(AuthErrors.toError('INVALID_JSON'));
          });

          sinon.spy(view, 'displayError');

          return view.validateAndSubmit()
            .then(assert.fail, function (_err) {
              err = _err;
            });
        });

        it('are displayed', () => {
          const displayedError = view.displayError.args[0][0];
          assert.strictEqual(err, displayedError);
          assert.isTrue(AuthErrors.is(err, 'INVALID_JSON'));
        });
      });
    });

    describe('showValidationErrors', () => {
      it('shows an error if the email is invalid', function (done) {
        view.$('[type=email]').val('testuser');
        view.$('[type=password]').val('password');

        view.on('validation_error', function (which, msg) {
          wrapAssertion(() => {
            assert.ok(msg);
          }, done);
        });

        view.showValidationErrors();
      });

      it('shows an error if the password is invalid', function (done) {
        view.$('[type=email]').val('testuser@testuser.com');
        view.$('[type=password]').val('passwor');

        view.on('validation_error', function (which, msg) {
          wrapAssertion(() => {
            assert.ok(msg);
          }, done);
        });

        view.showValidationErrors();
      });
    });

    describe('useLoggedInAccount', () => {
      it('shows an error if session is expired', () => {
        sinon.stub(view, 'getAccount', () => {
          return user.initAccount({
            email: 'a@a.com',
            sessionToken: 'abc123',
            uid: 'foo'
          });
        });

        return view.useLoggedInAccount()
          .then(() => {
            assert.isTrue(view._isErrorVisible);
            // do not show email input
            assert.notOk(view.$('#email').length);
            // show password input
            assert.ok(view.$('#password').length);
            assert.equal(view.$('.error').text(), 'Session expired. Sign in to continue.');
          });
      });

      it('signs in with a valid session', () => {
        const account = user.initAccount({
          email: 'a@a.com',
          sessionToken: 'abc123'
        });
        sinon.stub(view, 'getAccount', () => account);
        sinon.stub(user, 'signInAccount', (account) => {
          account.set('verified', true);
          return p(account);
        });

        return view.useLoggedInAccount()
          .then(() => {
            assert.isTrue(user.signInAccount.calledWith(account));
            assert.equal(view.$('.error').text(), '');
            assert.notOk(view._isErrorVisible);
          });
      });
    });

    describe('useDifferentAccount', () => {
      it('can switch to signin with the useDifferentAccount button', () => {
        let account = user.initAccount({
          email: 'a@a.com',
          sessionToken: 'abc123',
          uid: 'foo'
        });
        sinon.stub(view, 'getAccount', () => account);
        sinon.stub(user, 'removeAllAccounts', () => {
          account = user.initAccount();
        });

        return view.useLoggedInAccount()
          .then(() => {
            assert.ok(view.$('.use-different').length, 'has use different button');
            return view.useDifferentAccount();
          })
          .then(() => {
            assert.ok(view.$('.email').length, 'should show email input');
            assert.ok(view.$('.password').length, 'should show password input');

            assert.equal(view.$('.email').val(), '', 'should have an empty email input');
            assert.isTrue(isEventLogged(metrics,
                              'signin.use-different-account'));
          });
      });
    });

    describe('_suggestedAccount', () => {
      it('can suggest the user based on session variables', () => {
        let chooserAccount = user.initAccount({});

        sinon.stub(user, 'getChooserAccount', () => chooserAccount);

        assert.isTrue(view._suggestedAccount().isDefault(), 'null when no account set');

        formPrefill.set('email', 'a@a.com');
        chooserAccount = user.initAccount({ email: 'b@b.com', sessionToken: 'abc123' });
        assert.isTrue(view._suggestedAccount().isDefault(), 'null when prefill does not match');

        delete view.prefillEmail;
        chooserAccount = user.initAccount({ email: 'a@a.com', sessionToken: 'abc123' });
        assert.equal(view._suggestedAccount().get('email'), 'a@a.com');
      });

      it('initializes getAccount from user.getChooserAccount', () => {
        const account = user.initAccount({
          email: 'a@a.com',
          sessionToken: 'abc123'
        });
        sinon.stub(user, 'getChooserAccount', () => account);

        return view.render()
          .then(() => {
            assert.equal(view.getAccount(), account);
          });
      });

      it('shows if there is the same email in relier', () => {
        relier.set('email', 'a@a.com');
        const account = user.initAccount({
          accessToken: 'foo',
          email: 'a@a.com',
          sessionToken: 'abc123',
          sessionTokenContext: Constants.SESSION_TOKEN_USED_FOR_SYNC,
          verified: true
        });

        const imgUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQYV2P4DwABAQEAWk1v8QAAAABJRU5ErkJggg==';

        sinon.stub(user, 'getChooserAccount', () => account);

        metrics.events.clear();
        return view.render()
          .then(() => {
            sinon.stub(account, 'getAvatar', () => p({ avatar: imgUrl, id: 'bar' }));
            return view.afterVisible();
          })
          .then(() => {
            assert.notOk(view.$('.password').length, 'should not show password input');
            assert.ok(view.$('.avatar-view img').length, 'should show suggested avatar');
            assert.isTrue(isEventLogged(metrics, 'signin.ask-password.skipped'));
            const askPasswordEvents = metrics.getFilteredData().events.filter(function (event) {
              return event.type === 'signin.ask-password.skipped';
            });
            assert.equal(askPasswordEvents.length, 1, 'event should only be logged once');
          });
      });

      it('does not show if there is an email in relier that does not match', () => {
        relier.set('email', 'b@b.com');
        const account = user.initAccount({
          accessToken: 'foo',
          email: 'a@a.com',
          sessionToken: 'abc123',
          sessionTokenContext: Constants.SESSION_TOKEN_USED_FOR_SYNC,
          verified: true
        });

        sinon.stub(user, 'getChooserAccount', () => account);

        return view.render()
          .then(() => {
            assert.equal(view.$('.email').attr('type'), 'email', 'should show email input');
            assert.ok(view.$('.password').length, 'should show password input');
            assert.isTrue(isEventLogged(metrics, 'signin.ask-password.shown.account-unknown'));
          });
      });

      it('does not show if the relier overrules cached credentials', () => {
        sinon.stub(relier, 'allowCachedCredentials', () => false);
        relier.set('email', 'a@a.com');

        sinon.stub(user, 'getChooserAccount', () => {
          return user.initAccount({
            accessToken: 'foo',
            email: 'a@a.com',
            sessionToken: 'abc123',
            sessionTokenContext: Constants.SESSION_TOKEN_USED_FOR_SYNC,
            verified: true
          });
        });

        return view.render()
          .then(() => {
            assert.equal(view.$('input[type=email]').length, 1, 'should show email input');
            assert.equal(view.$('input[type=password]').length, 1, 'should show password input');
            assert.isTrue(isEventLogged(metrics, 'signin.ask-password.shown.account-unknown'));
          });
      });
    });

    describe('_suggestedAccountAskPassword', () => {
      it('asks for password right away if the relier wants keys (Sync)', () => {
        const account = user.initAccount({
          accessToken: 'foo',
          email: 'a@a.com',
          sessionToken: 'abc123',
          sessionTokenContext: Constants.SESSION_TOKEN_USED_FOR_SYNC,
          verified: true
        });

        sinon.stub(view, 'getAccount', () => account);
        sinon.stub(relier, 'wantsKeys', () => true);

        return view.render()
          .then(() => {
            assert.isTrue(view.$('.email').hasClass('hidden'), 'should not show email input');
            assert.ok(view.$('.password').length, 'should show password input');
            assert.isTrue(isEventLogged(metrics, 'signin.ask-password.shown.keys-required'));
          });
      });

      it('does not ask for password right away if service is not sync', () => {
        const account = user.initAccount({
          accessToken: 'foo',
          email: 'a@a.com',
          sessionToken: 'abc123',
          sessionTokenContext: Constants.SESSION_TOKEN_USED_FOR_SYNC,
          verified: true
        });

        sinon.stub(view, 'getAccount', () => account);
        relier.set('service', 'loop');

        return view.render()
          .then(() => {
            assert.ok(view.$('.avatar-view').length, 'should show suggested avatar');
            assert.notOk(view.$('.password').length, 'should not show password input');
            assert.isTrue(isEventLogged(metrics, 'signin.ask-password.skipped'));
          });
      });

      it('asks for the password if the stored session is not from sync', () => {
        const account = user.initAccount({
          accessToken: 'foo',
          email: 'a@a.com',
          sessionToken: 'abc123',
          verified: true
        });

        sinon.stub(view, 'getAccount', () => account);
        relier.set('service', 'loop');

        return view.render()
          .then(() => {
            assert.isTrue(view.$('.email').hasClass('hidden'), 'should not show email input');
            assert.ok(view.$('.password').length, 'should show password input');
            assert.isTrue(isEventLogged(metrics, 'signin.ask-password.shown.session-from-web'));
          });
      });

      it('asks for the password if the prefill email is different', () => {
        const account = user.initAccount({
          accessToken: 'foo',
          email: 'a@a.com',
          sessionToken: 'abc123',
          sessionTokenContext: Constants.SESSION_TOKEN_USED_FOR_SYNC,
          verified: true
        });

        sinon.stub(view, 'getAccount', () => account);
        sinon.stub(view, 'getPrefillEmail', () => 'b@b.com');
        relier.set('service', 'loop');

        return view.render()
          .then(() => {
            assert.isTrue(view.$('.email').hasClass('hidden'), 'should not show email input');
            assert.ok(view.$('.password').length, 'should show password input');
            assert.isTrue(isEventLogged(metrics, 'signin.ask-password.shown.email-mismatch'));
          });
      });

      it('asks for the password when re-rendered due to an expired session', () => {
        const account = user.initAccount({
          accessToken: 'foo',
          email: 'a@a.com',
          sessionToken: 'abc123',
          sessionTokenContext: Constants.SESSION_TOKEN_USED_FOR_SYNC,
          verified: true
        });

        sinon.stub(view, 'getAccount', () => account);
        relier.set('service', 'loop');

        view.chooserAskForPassword = true;
        return view.render()
          .then(() => {
            assert.isTrue(view.$('.email').hasClass('hidden'), 'should not show email input');
            assert.ok(view.$('.password').length, 'should show password input');
            assert.isTrue(isEventLogged(metrics, 'signin.ask-password.shown.session-expired'));
          });
      });
    });

    describe('_signIn', () => {
      it('throws on an empty account', () => {
        return view._signIn().then(assert.fail, function (err) {
          assert.isTrue(AuthErrors.is(err, 'UNEXPECTED_ERROR'));
        });
      });

      it('throws on an empty account', () => {
        const account = user.initAccount({
          email: 'a@a.com'
        });

        return view._signIn(account).then(assert.fail, function (err) {
          assert.isTrue(AuthErrors.is(err, 'UNEXPECTED_ERROR'));
        });
      });
    });

    describe('beforeDestroy', () => {
      it('saves the form info to formPrefill', () => {
        view.$('.email').val('testuser@testuser.com');
        view.$('.password').val('password');

        view.beforeDestroy();

        assert.equal(formPrefill.get('email'), 'testuser@testuser.com');
        assert.equal(formPrefill.get('password'), 'password');
      });
    });

    describe('afterRender', () => {
      beforeEach(() => {
        sinon.spy(notifier, 'trigger');
        return view.afterRender();
      });

      it('called notifier.trigger correctly', () => {
        assert.equal(notifier.trigger.callCount, 2);
        assert.equal(notifier.trigger.args[0][0], 'flow.initialize');
        assert.equal(notifier.trigger.args[1][0], 'flow.event');
        assert.deepEqual(notifier.trigger.args[1][1], { event: 'begin', once: true, viewName: undefined });
      });

      it('logs the begin event', () => {
        assert.isTrue(isEventLogged(metrics, 'flow.begin'));
      });
    });

    describe('flowEvents', () => {
      it('logs the engage event (click)', () => {
        assert.isFalse(isEventLogged(metrics, 'flow.signin.engage'));
        view.$('input').trigger('click');
        assert.isTrue(isEventLogged(metrics, 'flow.signin.engage'));
      });

      it('logs the engage event (input)', () => {
        assert.isFalse(isEventLogged(metrics, 'flow.signin.engage'));
        view.$('input').trigger('input');
        assert.isTrue(isEventLogged(metrics, 'flow.signin.engage'));
      });

      it('logs the engage event (keyup)', () => {
        assert.isFalse(isEventLogged(metrics, 'flow.signin.engage'));
        view.$('input').trigger({
          type: 'keyup',
          which: 9
        });
        assert.isTrue(isEventLogged(metrics, 'flow.signin.engage'));
      });

      it('logs the create-account event', () => {
        assert.isFalse(isEventLogged(metrics, 'flow.signin.create-account'));
        view.$('[data-flow-event="create-account"]').click();
        assert.isFalse(isEventLogged(metrics, 'flow.signin.engage'));
        assert.isTrue(isEventLogged(metrics, 'flow.signin.create-account'));
      });

      it('logs the forgot-password event', () => {
        assert.isFalse(isEventLogged(metrics, 'flow.signin.forgot-password'));
        view.$('[data-flow-event="forgot-password"]').click();
        assert.isFalse(isEventLogged(metrics, 'flow.signin.engage'));
        assert.isTrue(isEventLogged(metrics, 'flow.signin.forgot-password'));
      });

      it('logs the submit event', () => {
        $('#container').html(view.$el);

        view.$('#submit-btn').click();
        assert.isFalse(isEventLogged(metrics, 'flow.signin.submit'));
        view.enableForm();
        view.$('#submit-btn').click();
        assert.isTrue(isEventLogged(metrics, 'flow.signin.submit'));
      });
    });

    it('logs the number of stored accounts on creation', () => {
      sinon.stub(user, 'logNumStoredAccounts', () => {});

      initView();

      assert.isTrue(user.logNumStoredAccounts.calledOnce);
    });
  });
});
