/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import Backbone from 'backbone';
import Broker from 'models/auth_brokers/base';
import Constants from 'lib/constants';
import FormPrefill from 'models/form-prefill';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/relier';
import Session from 'lib/session';
import { SIGNIN } from '../../../../tests/functional/lib/selectors';
import sinon from 'sinon';
import Translator from 'lib/translator';
import helpers from '../../lib/helpers';
import User from 'models/user';
import View from 'views/sign_in';
import WindowMock from '../../mocks/window';

const { createEmail, isEventLogged, wrapAssertion } = helpers;

const Selectors = SIGNIN;

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
        captureException() {},
      },
    });
    relier = new Relier();
    windowMock = new WindowMock();
    translator = new Translator({ forceEnglish: true });

    broker = new Broker({
      relier: relier,
    });

    user = new User({
      metrics,
      notifier,
    });

    Session.clear();

    initView();

    $('body').attr(
      'data-flow-id',
      'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103'
    );
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

  function initView() {
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
      window: windowMock,
    });
  }

  describe('render', () => {
    it('Shows serviceName from the relier if not trailhead', () => {
      relier.isSync = () => true;
      const serviceName = 'another awesome service by Mozilla';
      relier.set('serviceName', serviceName);

      // initialize a new view to set the service name
      initView();
      return view.render().then(() => {
        assert.include(view.$(Selectors.HEADER).text(), serviceName);
      });
    });

    it('renders correctly for trailhead', function() {
      relier.set({
        serviceName: 'Firefox Sync',
      });

      sinon.stub(view, 'isTrailhead').callsFake(() => true);

      return view.render().then(() => {
        assert.equal(
          view.$(Selectors.SUB_HEADER).text(),
          'to your Firefox account'
        );
        assert.lengthOf(view.$(Selectors.PROGRESS_INDICATOR), 0);
      });
    });

    describe('no suggested account', () => {
      it('prefills email and password if stored in formPrefill (user comes from signup with existing account)', () => {
        formPrefill.set('email', 'testuser@testuser.com');
        formPrefill.set('password', 'prefilled password');

        initView();
        return view.render().then(() => {
          assert.ok(view.$(Selectors.HEADER).length);
          assert.equal(view.$('[type=email]').val(), 'testuser@testuser.com');
          assert.equal(view.$('[type=email]').attr('spellcheck'), 'false');
          assert.equal(view.$('[type=password]').val(), 'prefilled password');
        });
      });

      it('prefills email with email from relier if prefillEmail is not set', () => {
        relier.set('email', 'testuser@testuser.com');

        initView();
        return view.render().then(() => {
          assert.equal(view.$('[type=email]').val(), 'testuser@testuser.com');
        });
      });
    });

    describe('suggested account', () => {
      let account;

      beforeEach(() => {
        account = user.initAccount({
          accessToken: 'foo',
          email: 'a@a.com',
          sessionToken: 'abc123',
          sessionTokenContext: Constants.SESSION_TOKEN_USED_FOR_SYNC,
          verified: true,
        });
      });

      it('displays a readonly email, hidden email element if a suggested account needs password', () => {
        sinon.stub(view, 'getAccount').callsFake(() => account);
        sinon.stub(view, 'isPasswordNeededForAccount').callsFake(() => true);

        return view.render().then(() => {
          assert.equal(view.$('.prefillEmail').text(), 'a@a.com');
          const $emailEl = view.$('input[type=email]');
          assert.lengthOf($emailEl, 1);
          assert.equal($emailEl.val(), 'a@a.com');
          assert.isTrue($emailEl.hasClass('hidden'));
          assert.lengthOf(view.$('input[type=password]'), 1);
        });
      });

      it('displays no email input element, no password field if a suggested account does not need a password', () => {
        sinon.stub(view, 'getAccount').callsFake(() => account);
        sinon.stub(view, 'isPasswordNeededForAccount').callsFake(() => false);

        return view.render().then(() => {
          assert.equal(view.$('.prefillEmail').text(), 'a@a.com');
          assert.lengthOf(view.$('input[type=email]'), 0);
          assert.lengthOf(view.$('input[type=password]'), 0);
        });
      });

      it('displays an editable email if default suggested account', () => {
        sinon.stub(view, 'getAccount').callsFake(() => user.initAccount());

        return view.render().then(() => {
          const $emailEl = view.$('input[type=email]');
          assert.lengthOf($emailEl, 1);
          assert.equal($emailEl.val(), '');
        });
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
        sessionTokenContext: Constants.SYNC_SERVICE,
      });

      sinon.stub(view, 'suggestedAccount').callsFake(() => account);
      sinon
        .stub(view, 'displayAccountProfileImage')
        .callsFake(() => Promise.resolve());
      sinon.spy(view, 'render');

      return view
        .render()
        .then(() => view.afterVisible())
        .then(() => view.destroy())
        .then(() => {
          account.set({
            accessToken: null,
            sessionToken: null,
            sessionTokenContext: null,
          });
        });
    });

    it('does not re-render once destroyed if the accessToken is invalidated', () => {
      assert.equal(view.render.callCount, 1);
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
    let currentAccount;

    beforeEach(() => {
      view.$('[type=email]').val(email);
      view.$('[type=password]').val('password');

      currentAccount = null;

      sinon.stub(view, 'getAccount').callsFake(() => {
        return currentAccount;
      });

      sinon.stub(view, 'signIn').callsFake(() => Promise.resolve());
    });

    describe('with a user doing a fresh signin', () => {
      beforeEach(() => {
        currentAccount = user.initAccount({});
        return view.submit();
      });

      it('delegates to view.signIn with a new Account model', () => {
        assert.isTrue(view.signIn.calledOnce);

        const args = view.signIn.args[0];
        const account = args[0];
        assert.notEqual(account, currentAccount);
        const password = args[1];
        assert.equal(password, 'password');
      });
    });

    describe('with a user signing in to an existing session', () => {
      beforeEach(() => {
        currentAccount = user.initAccount({
          email: email,
        });
        return view.submit();
      });

      it('delegates to view.signIn with the existing Account model', () => {
        assert.isTrue(view.signIn.calledOnce);

        const args = view.signIn.args[0];
        const account = args[0];
        assert.equal(account, currentAccount);
        const password = args[1];
        assert.equal(password, 'password');
      });
    });

    describe('with a user signing in to an existing session with different email case', () => {
      beforeEach(() => {
        currentAccount = user.initAccount({
          email: email.toUpperCase(),
        });
        return view.submit();
      });

      it('delegates to view.signIn with the existing Account model', () => {
        assert.isTrue(view.signIn.calledOnce);

        const args = view.signIn.args[0];
        const account = args[0];
        assert.equal(account, currentAccount);
        const password = args[1];
        assert.equal(password, 'password');
      });
    });

    describe('with a user signing in with a new email address', () => {
      beforeEach(() => {
        currentAccount = user.initAccount({
          email: 'different-' + email,
        });
        return view.submit();
      });

      it('delegates to view.signIn with a new Account model', () => {
        assert.isTrue(view.signIn.calledOnce);

        const args = view.signIn.args[0];
        const account = args[0];
        assert.notEqual(account, currentAccount);
        const password = args[1];
        assert.equal(password, 'password');
      });
    });
  });

  describe('showValidationErrors', () => {
    it('shows an error if the email is invalid', function(done) {
      view.$('[type=email]').val('testuser');
      view.$('[type=password]').val('password');

      view.on('validation_error', function(which, msg) {
        wrapAssertion(() => {
          assert.ok(msg);
        }, done);
      });

      view.showValidationErrors();
    });

    it('shows an error if the password is invalid', function(done) {
      view.$('[type=email]').val('testuser@testuser.com');
      view.$('[type=password]').val('passwor');

      view.on('validation_error', function(which, msg) {
        wrapAssertion(() => {
          assert.ok(msg);
        }, done);
      });

      view.showValidationErrors();
    });
  });

  describe('onSignInError', () => {
    let account;

    beforeEach(() => {
      account = user.initAccount({});
    });

    it('an unknown account delegates to _suggestSignUp', () => {
      broker.setCapability('signup', true);
      sinon.stub(view, '_suggestSignUp');
      const err = AuthErrors.toError('UNKNOWN_ACCOUNT');

      view.onSignInError(account, 'password', err);

      assert.isTrue(view._suggestSignUp.calledOnce);
      assert.isTrue(view._suggestSignUp.calledWith(err));
    });

    it('when a user cancels login, the error is logged but not displayed', () => {
      view.onSignInError(
        account,
        'password',
        AuthErrors.toError('USER_CANCELED_LOGIN')
      );

      assert.isTrue(isEventLogged(metrics, 'signin.canceled'));
      assert.isFalse(view.isErrorVisible());
    });

    it('a reset account notifies the user', () => {
      sinon.spy(view, 'notifyOfResetAccount');

      view.onSignInError(
        account,
        'password',
        AuthErrors.toError('ACCOUNT_RESET')
      );

      assert.isTrue(view.notifyOfResetAccount.called);
      assert.isTrue(view.notifyOfResetAccount.calledWith(account));
    });

    it('incorrect password shows a validation error', () => {
      sinon.spy(view, 'showValidationError');
      view.onSignInError(
        account,
        'password',
        AuthErrors.toError('INCORRECT_PASSWORD')
      );

      assert.isTrue(view.showValidationError.calledOnce);
    });

    it('other errors are re-thrown', () => {
      const err = AuthErrors.toError('INVALID_JSON');
      assert.throws(() => {
        view.onSignInError(account, 'password', err);
      }, err);
    });
  });

  it('_suggestSignUp shows a link to the signup page', () => {
    sinon.spy(view, 'unsafeDisplayError');
    const err = AuthErrors.toError('UNKNOWN_ACCOUNT');

    view._suggestSignUp(err);

    assert.isTrue(view.unsafeDisplayError.calledOnce);
    assert.isTrue(view.unsafeDisplayError.calledWith(err));
    assert.include(err.forceMessage, '/signup');
  });

  describe('_signIn', () => {
    it('throws on an empty account', () => {
      return view._signIn().then(assert.fail, function(err) {
        assert.isTrue(AuthErrors.is(err, 'UNEXPECTED_ERROR'));
      });
    });

    it('throws on an empty account', () => {
      const account = user.initAccount({
        email: 'a@a.com',
      });

      return view._signIn(account).then(assert.fail, function(err) {
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
      assert.deepEqual(notifier.trigger.args[1][1], {
        event: 'begin',
        once: true,
        viewName: undefined,
      });
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
        which: 9,
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
      assert.isTrue(isEventLogged(metrics, 'flow.signin.submit'));
    });
  });

  it('logs the number of stored accounts on creation', () => {
    sinon.stub(user, 'logNumStoredAccounts').callsFake(() => {});

    initView();

    assert.isTrue(user.logNumStoredAccounts.calledOnce);
  });

  describe('useDifferentAccount', () => {
    it('clears the suggested account, logs an event, re-renders', () => {
      sinon.spy(view, 'logViewEvent');
      sinon.spy(view, 'rerender');
      sinon.spy(formPrefill, 'clear');

      view.useDifferentAccount();

      assert.isTrue(formPrefill.clear.calledOnce);
      assert.isTrue(view.logViewEvent.calledOnceWith('use-different-account'));
      assert.isTrue(view.rerender.calledOnce);
    });
  });
});
