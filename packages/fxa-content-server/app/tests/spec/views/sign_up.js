/* This Source Code Form is subject to the terms of the Mozilla Public
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import Account from 'models/account';
import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import Backbone from 'backbone';
import Broker from 'models/auth_brokers/base';
import { SIGNUP } from '../../../../tests/functional/lib/selectors';
import ExperimentGroupingRules from 'lib/experiments/grouping-rules/index';
import ExperimentInterface from 'lib/experiment';
import FormPrefill from 'models/form-prefill';
import FxaClient from 'lib/fxa-client';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import p from 'lib/promise';
import Relier from 'models/reliers/sync';
import sinon from 'sinon';
import TestHelpers from '../../lib/helpers';
import Translator from 'lib/translator';
import User from 'models/user';
import View from 'views/sign_up';
import WindowMock from '../../mocks/window';

const Selectors = SIGNUP;

describe('views/sign_up', function() {
  var broker;
  var email;
  var experimentGroupingRules;
  var formPrefill;
  var fxaClient;
  var metrics;
  var model;
  var notifier;
  var relier;
  var translator;
  var user;
  var view;

  function fillOutSignUp(email, password, passwordConfirm) {
    view.$('[type=email]').val(email);
    view.$('#password').val(password);

    if (arguments.length < 3) {
      passwordConfirm = password;
    }
    view.$(Selectors.VPASSWORD).val(passwordConfirm);
  }

  function createView(options) {
    options = options || {};

    var viewOpts = {
      broker: broker,
      experimentGroupingRules:
        options.experimentGroupingRules || experimentGroupingRules,
      formPrefill: formPrefill,
      fxaClient: fxaClient,
      metrics: metrics,
      model: model,
      notifier: notifier,
      relier: relier,
      translator: translator,
      user: user,
      viewName: 'signup',
    };

    if (options.window) {
      viewOpts.window = options.window;
    }
    view = new View(viewOpts);
  }

  function testExpectTriggered(callIndex, expectedMessage) {
    assert.equal(notifier.trigger.thisValues[callIndex], notifier);
    var args = notifier.trigger.args[callIndex];
    assert.lengthOf(args, 3);
    assert.equal(args[0], expectedMessage);
  }

  function enableExperiments() {
    const windowMock = new WindowMock();
    windowMock.navigator.userAgent = 'mocha';

    view.experiments = new ExperimentInterface({
      experimentGroupingRules,
      metrics,
      notifier,
      user,
      window: windowMock,
    });
    view.experiments.chooseExperiments();
  }

  beforeEach(function() {
    document.cookie = 'tooyoung=1; expires=Thu, 01-Jan-1970 00:00:01 GMT';

    experimentGroupingRules = new ExperimentGroupingRules();
    email = TestHelpers.createEmail();
    formPrefill = new FormPrefill();
    fxaClient = new FxaClient();
    model = new Backbone.Model();
    notifier = new Notifier();
    metrics = new Metrics({
      notifier,
      sentryMetrics: {
        captureException() {},
      },
    });
    relier = new Relier();
    translator = new Translator({ forceEnglish: true });

    broker = new Broker({
      relier: relier,
    });

    user = new User({
      fxaClient: fxaClient,
    });

    createView();

    $('body').attr(
      'data-flow-id',
      'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103'
    );
    $('body').attr('data-flow-begin', '42');

    return view.render();
  });

  afterEach(function() {
    metrics.destroy();
    metrics = null;

    view.remove();
    view.destroy();
    view = null;

    document.cookie = 'tooyoung=1; expires=Thu, 01-Jan-1970 00:00:01 GMT';
  });

  describe('render', function() {
    it('prefills email, password if stored in formPrefill (user comes from signup with existing account)', function() {
      formPrefill.set('email', 'testuser@testuser.com');
      formPrefill.set('password', 'prefilled password');

      createView();

      return view.render().then(function() {
        assert.ok(view.$('#fxa-signup-header').length);
        assert.equal(view.$('[type=email]').val(), 'testuser@testuser.com');
        assert.equal(view.$('[type=email]').attr('spellcheck'), 'false');
        assert.equal(view.$('[type=password]').val(), 'prefilled password');
        assert.lengthOf(view.$(Selectors.FIREFOX_FAMILY_SERVICES), 0);
      });
    });

    it('positions password help tooltip on first password field', function() {
      createView();
      return view.render().then(() => {
        view.highlightSignupPasswordHelper({
          target: '#password',
        });
        assert.equal(view.$('.input-help-balloon').css('top'), '-78px');
      });
    });

    it('positions password help tooltip on the second password field', function() {
      createView();
      return view.render().then(() => {
        view.highlightSignupPasswordHelper({
          target: Selectors.VPASSWORD,
        });
        assert.equal(view.$('.input-help-balloon').css('top'), '-10px');
      });
    });

    describe('with model.forceEmail', function() {
      beforeEach(function() {
        model.set('forceEmail', 'testuser@testuser.com');

        return view.render();
      });

      it('shows a readonly email', function() {
        var $emailInputEl = view.$('[type=email]');
        assert.equal($emailInputEl.val(), 'testuser@testuser.com');
        assert.isTrue($emailInputEl.hasClass('hidden'));

        assert.equal(view.$('.prefillEmail').text(), 'testuser@testuser.com');
      });

      it('does not allow `signin`', function() {
        assert.equal(view.$('.sign-in').length, 0);
      });
    });

    it('prefills email with email from the relier if formPrefill.email is not set', function() {
      relier.set('email', 'testuser@testuser.com');

      return view.render().then(function() {
        assert.equal(view.$('[type=email]').val(), 'testuser@testuser.com');
      });
    });

    it('renders COPPA', function() {
      assert.ok(view.$el.find('#age').length);
    });

    it('shows serviceName', function() {
      var serviceName = 'my service name';
      relier.set('serviceName', serviceName);

      return view.render().then(function() {
        assert.include(view.$('#fxa-signup-header').text(), serviceName);
      });
    });

    describe('email opt in', function() {
      it('has one newsletter if not trailhead', function() {
        sinon.stub(experimentGroupingRules, 'choose').callsFake(function() {
          return true;
        });

        return view.render().then(function() {
          assert.isTrue(
            experimentGroupingRules.choose.calledWith(
              'communicationPrefsVisible'
            )
          );
          assert.equal(view.$(Selectors.MARKETING_EMAIL_OPTIN).length, 1);
        });
      });

      it('has 3 newsletters for trailhead', () => {
        sinon.stub(experimentGroupingRules, 'choose').callsFake(function() {
          return true;
        });

        sinon.stub(view, 'isTrailhead').callsFake(() => true);
        return view.render().then(() => {
          assert.lengthOf(view.$(Selectors.MARKETING_EMAIL_OPTIN), 3);
        });
      });

      it('is not visible if disabled', function() {
        sinon.stub(experimentGroupingRules, 'choose').callsFake(function() {
          return false;
        });

        return view.render().then(function() {
          assert.isTrue(
            experimentGroupingRules.choose.calledWith(
              'communicationPrefsVisible'
            )
          );
          assert.equal(view.$(Selectors.MARKETING_EMAIL_OPTIN).length, 0);
        });
      });
    });

    describe('password confirm', function() {
      it('is visible', function() {
        return view.render().then(function() {
          assert.equal(view.$(Selectors.VPASSWORD).length, 1);
        });
      });
    });

    it('renders the firefox-family services for trailhead', () => {
      relier.set('style', 'trailhead');

      return view.render().then(() => {
        assert.lengthOf(view.$(Selectors.FIREFOX_FAMILY_SERVICES), 1);
      });
    });
  });

  describe('afterVisible', function() {
    it('shows a tooltip on the email element if model.bouncedEmail is set', function(done) {
      sinon.spy(view, 'showValidationError');
      model.set('bouncedEmail', 'testuser@testuser.com');

      view
        .render()
        .then(() => view.afterVisible())
        .then(function() {
          setTimeout(() => {
            TestHelpers.wrapAssertion(function() {
              assert.isTrue(view.showValidationError.called);
              assert.isTrue(view.$('input[type="email"]').hasClass('invalid'));
            }, done);
          }, 50);
        });
    });
  });

  describe('autofocus behavior', () => {
    it('focuses the email element if not pre-filled', () => {
      return view.render().then(() => {
        assert.ok(view.$('input[type="email"]').attr('autofocus'));
      });
    });

    it('focuses the password element if email is pre-filled', () => {
      formPrefill.set('email', 'testuser@testuser.com');
      return view.render().then(() => {
        assert.ok(view.$('input[type="password"]').attr('autofocus'));
      });
    });

    it('focuses the vpassword element if email and password are both pre-filled', () => {
      formPrefill.set('email', 'testuser@testuser.com');
      formPrefill.set('password', 'password');
      return view.render().then(() => {
        assert.ok(view.$(Selectors.VPASSWORD).attr('autofocus'));
      });
    });

    it('focuses the age element if email, vpassword and password are pre-filled', () => {
      formPrefill.set('email', 'testuser@testuser.com');
      formPrefill.set('password', 'password');
      formPrefill.set('vpassword', 'vpassword');
      return view.render().then(() => {
        assert.ok(view.$('#age').attr('autofocus'));
      });
    });
  });

  describe('isValid', function() {
    it('returns true if email and password are valid', function() {
      fillOutSignUp(email, 'password');
      assert.isTrue(view.isValid());
    });

    it('returns false if email is empty', function() {
      fillOutSignUp('', 'password');
      assert.isFalse(view.isValid());
    });

    it('returns false if email is not an email address', function() {
      fillOutSignUp('testuser', 'password');
      assert.isFalse(view.isValid());
    });

    it('returns false if email is the same as the bounced email', function() {
      model.set('bouncedEmail', 'testuser@testuser.com');

      return view
        .render()
        .then(function() {
          return view.afterVisible();
        })
        .then(function() {
          fillOutSignUp('testuser@testuser.com', 'password');
        })
        .then(function() {
          assert.isFalse(view.isValid());
        });
    });

    it('returns false if email contains a one part TLD', function() {
      fillOutSignUp('a@b', 'password');
      assert.isFalse(view.isValid());
    });

    it('returns true if email contains a two part TLD', function() {
      fillOutSignUp('a@b.c', 'password');
      assert.isTrue(view.isValid());
    });

    it('returns true if email contain three part TLD', function() {
      fillOutSignUp('a@b.c.d', 'password');
      assert.isTrue(view.isValid());
    });

    it('returns false if local side of email === 0 chars', function() {
      fillOutSignUp('@testuser.com', 'password');
      assert.isFalse(view.isValid());
    });

    it('returns false if local side of email > 64 chars', function() {
      var email = '';
      do {
        email += 'a';
      } while (email.length < 65);

      email += '@testuser.com';
      fillOutSignUp(email, 'password');
      assert.isFalse(view.isValid());
    });

    it('returns true if local side of email === 64 chars', function() {
      var email = '';
      do {
        email += 'a';
      } while (email.length < 64);

      email += '@testuser.com';
      fillOutSignUp(email, 'password');
      assert.isTrue(view.isValid());
    });

    it('returns false if domain side of email === 0 chars', function() {
      fillOutSignUp('testuser@', 'password');
      assert.isFalse(view.isValid());
    });

    it('returns false if domain side of email > 255 chars', function() {
      var domain = 'testuser.com';
      do {
        domain += 'a';
      } while (domain.length < 256);

      fillOutSignUp('testuser@' + domain, 'password');
      assert.isFalse(view.isValid());
    });

    it('returns true if domain side of email === 254 chars', function() {
      var domain = 'testuser.com';
      do {
        domain += 'a';
      } while (domain.length < 254);

      fillOutSignUp('a@' + domain, 'password');
      assert.isTrue(view.isValid());
    });

    it('returns false total length > 256 chars', function() {
      var domain = 'testuser.com';
      do {
        domain += 'a';
      } while (domain.length < 254);

      // ab@ + 254 characters = 257 chars
      fillOutSignUp('ab@' + domain, 'password');
      assert.isFalse(view.isValid());
    });

    it('returns true if total length === 256 chars', function() {
      var email = 'testuser@testuser.com';
      do {
        email += 'a';
      } while (email.length < 256);

      fillOutSignUp(email, 'password');
      assert.isTrue(view.isValid());
    });

    it('returns false if password is empty', function() {
      fillOutSignUp(email, '');
      assert.isFalse(view.isValid());
    });

    it('returns false if password is invalid', function() {
      fillOutSignUp(email, 'passwor');
      assert.isFalse(view.isValid());
    });

    it('returns true if COPPA view returns false', function() {
      fillOutSignUp(email, 'password');
      assert.isTrue(view.isValid());
    });

    describe('password confirm', () => {
      it('returns false if confirm password is empty', function() {
        return view.render().then(() => {
          fillOutSignUp(email, 'password', '');
          assert.isFalse(view.isValid());
        });
      });

      it('returns false if confirm password does not match', function() {
        return view.render().then(() => {
          fillOutSignUp(email, 'password', 'drowssap');
          assert.isFalse(view.isValid());
        });
      });

      it('returns true if confirm password matches', function() {
        return view.render().then(() => {
          fillOutSignUp(email, 'password', 'password');
          assert.isTrue(view.isValid());
        });
      });
    });
  });

  describe('showValidationErrors', function() {
    it('shows an error if the email is invalid', function() {
      fillOutSignUp('testuser', 'password');

      sinon.spy(view, 'showValidationError');

      view.showValidationErrors();

      assert.isTrue(view.showValidationError.called);
    });

    it('shows an error if the email is the same as the bounced email', function() {
      model.set('bouncedEmail', 'testuser@testuser.com');

      return view.render().then(function() {
        fillOutSignUp('testuser@testuser.com', 'password');

        sinon.spy(view, 'showValidationError');
        view.showValidationErrors();
        assert.isTrue(view.showValidationError.calledWith('input[type=email]'));
      });
    });

    it('shows an error if the user provides a @firefox.com email', function() {
      fillOutSignUp('user@firefox.com', 'password');

      sinon.spy(view, 'showValidationError');
      view.showValidationErrors();

      assert.isTrue(view.showValidationError.called);

      var err = AuthErrors.toError('DIFFERENT_EMAIL_REQUIRED_FIREFOX_DOMAIN');
      err.context = 'signup';
      assert.isTrue(TestHelpers.isErrorLogged(metrics, err));
    });

    it('shows an error if the password is invalid', function() {
      fillOutSignUp('testuser@testuser.com', 'passwor');

      sinon.spy(view, 'showValidationError');

      view.showValidationErrors();
      assert.isTrue(view.showValidationError.called);
    });

    it('shows an error if confirm passwords do not match', () => {
      return view.render().then(() => {
        fillOutSignUp('testuser@testuser.com', 'password', 'drowssap');

        sinon.spy(view, 'showValidationError');
        sinon.spy(view, 'displayError');
        view.showValidationErrors();

        assert.isFalse(view.showValidationError.called);
        assert.isTrue(view.displayError.called);

        const err = AuthErrors.toError('PASSWORDS_DO_NOT_MATCH');
        err.context = 'signup';
        assert.isTrue(TestHelpers.isErrorLogged(metrics, err));
      });
    });
  });

  describe('submit', function() {
    var failed;
    var sandbox;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();

      sandbox.spy(notifier, 'trigger');

      sandbox.spy(view, 'displayError');
      sandbox.spy(view, 'unsafeDisplayError');
      sandbox.spy(view, 'logEvent');
      sandbox.spy(view, 'navigate');

      failed = false;
    });

    afterEach(function() {
      sandbox.restore();
    });

    describe('COPPA is not valid', function() {
      beforeEach(function() {
        fillOutSignUp(email, 'password');

        sandbox.stub(view, 'isUserOldEnough').callsFake(() => false);
        sandbox.stub(view, 'signUp').callsFake(() => Promise.resolve());
      });

      describe('signin succeeds', function() {
        beforeEach(function() {
          sandbox.stub(view, 'signIn').callsFake(() => Promise.resolve());

          return view.submit();
        });

        it('does not call view.signUp', function() {
          assert.isFalse(view.signUp.called);
        });

        it('calls view.signIn correctly', function() {
          assert.equal(view.signIn.callCount, 1);

          var args = view.signIn.args[0];
          assert.instanceOf(args[0], Account);
          assert.equal(args[1], 'password');
        });

        it('calls notifier.trigger correctly', function() {
          assert.equal(notifier.trigger.callCount, 1);

          testExpectTriggered(0, 'signup.submit');
        });

        it('does not display any errors', function() {
          assert.isFalse(view.displayError.called);
          assert.isFalse(view.unsafeDisplayError.called);
        });
      });

      describe('signin fails with UNKNOWN_ACCOUNT', function() {
        beforeEach(function() {
          sandbox.stub(view, 'signIn').callsFake(function() {
            return Promise.reject(AuthErrors.toError('UNKNOWN_ACCOUNT'));
          });
        });

        describe('COPPA has no value', function() {
          beforeEach(function() {
            sandbox.stub(view, 'coppaHasValue').callsFake(() => false);
            sandbox.stub(view, 'showValidationError').callsFake(() => {});
            return view.submit();
          });

          it('does not call view.signUp', function() {
            assert.isFalse(view.signUp.called);
          });

          it('calls view.signIn correctly', function() {
            assert.equal(view.signIn.callCount, 1);

            var args = view.signIn.args[0];
            assert.instanceOf(args[0], Account);
            assert.equal(args[1], 'password');
          });

          it('calls notifier.trigger correctly', function() {
            assert.equal(notifier.trigger.callCount, 1);

            testExpectTriggered(0, 'signup.submit');
          });

          it('display an error message', function() {
            assert.isTrue(view.showValidationError.called);
          });
        });

        describe('COPPA is too young', function() {
          beforeEach(function() {
            sandbox.stub(view, 'coppaHasValue').callsFake(() => true);

            return view.submit();
          });

          it('does not call view.signUp', function() {
            assert.isFalse(view.signUp.called);
          });

          it('calls view.signIn correctly', function() {
            assert.equal(view.signIn.callCount, 1);

            var args = view.signIn.args[0];
            assert.instanceOf(args[0], Account);
            assert.equal(args[1], 'password');
          });

          it('calls notifier.trigger correctly', function() {
            assert.equal(notifier.trigger.callCount, 3);

            testExpectTriggered(0, 'signup.submit');
            testExpectTriggered(1, 'signup.tooyoung');
            testExpectTriggered(2, 'navigate');
          });

          it('calls view.navigate correctly', function() {
            assert.equal(view.navigate.callCount, 1);
            assert.equal(view.navigate.thisValues[0], view);
            var args = view.navigate.args[0];
            assert.lengthOf(args, 1);
            assert.equal(args[0], 'cannot_create_account');
          });

          it('does not display any errors', function() {
            assert.isFalse(view.displayError.called);
            assert.isFalse(view.unsafeDisplayError.called);
          });
        });
      });

      describe('signin fails with INCORRECT_PASSWORD', function() {
        beforeEach(function() {
          sandbox.stub(view, 'signIn').callsFake(function() {
            return Promise.reject(AuthErrors.toError('INCORRECT_PASSWORD'));
          });

          return view.submit();
        });

        it('does not call view.signUp', function() {
          assert.isFalse(view.signUp.called);
        });

        it('calls view.signIn correctly', function() {
          assert.equal(view.signIn.callCount, 1);

          var args = view.signIn.args[0];
          assert.instanceOf(args[0], Account);
          assert.equal(args[1], 'password');
        });

        it('calls notifier.trigger correctly', function() {
          assert.equal(notifier.trigger.callCount, 1);

          testExpectTriggered(0, 'signup.submit');
        });

        it('calls view.unsafeDisplayError correctly', function() {
          assert.equal(view.unsafeDisplayError.callCount, 1);
          var args = view.unsafeDisplayError.args[0];
          assert.lengthOf(args, 1);
          var error = args[0];
          assert.include(error.forceMessage, 'href="/signin"');
          assert.isTrue(AuthErrors.is(error, 'INCORRECT_PASSWORD'));
        });
      });

      describe('signin fails with USER_CANCELED_LOGIN', function() {
        beforeEach(function() {
          sinon.stub(view, 'signIn').callsFake(function() {
            return Promise.reject(AuthErrors.toError('USER_CANCELED_LOGIN'));
          });

          return view.submit();
        });

        it('does not call view.signUp', function() {
          assert.isFalse(view.signUp.called);
        });

        it('calls view.signIn correctly', function() {
          assert.equal(view.signIn.callCount, 1);

          var args = view.signIn.args[0];
          assert.instanceOf(args[0], Account);
          assert.equal(args[1], 'password');
        });

        it('does not display any errors', function() {
          assert.isFalse(view.displayError.called);
          assert.isFalse(view.unsafeDisplayError.called);
        });

        it('calls view.logEvent correctly', function() {
          assert.equal(view.logEvent.callCount, 1);
          assert.equal(view.logEvent.thisValues[0], view);
          var args = view.logEvent.args[0];
          assert.lengthOf(args, 1);
          assert.equal(args[0], 'login.canceled');
        });
      });

      describe('signin fails with a reset account', function() {
        beforeEach(function() {
          sinon.stub(view, 'signIn').callsFake(function() {
            return Promise.reject(AuthErrors.toError('ACCOUNT_RESET'));
          });

          sinon.spy(view, 'notifyOfResetAccount');

          return view.submit();
        });

        it('does not call view.signUp', function() {
          assert.isFalse(view.signUp.called);
        });

        it('calls view.signIn correctly', function() {
          assert.equal(view.signIn.callCount, 1);

          var args = view.signIn.args[0];
          assert.instanceOf(args[0], Account);
          assert.equal(args[1], 'password');
        });

        it('notifies the user of the reset account', function() {
          assert.isTrue(view.notifyOfResetAccount.called);
          var args = view.notifyOfResetAccount.args[0];
          var account = args[0];
          assert.instanceOf(account, Account);
        });
      });

      describe('signin fails with some other error', function() {
        beforeEach(function() {
          sandbox.stub(view, 'signIn').callsFake(function() {
            return Promise.reject(AuthErrors.toError('UNEXPECTED_ERROR'));
          });

          return view.submit().catch(function(err) {
            failed = err;
          });
        });

        it('does not call view.signUp', function() {
          assert.isFalse(view.signUp.called);
        });

        it('calls view.signIn correctly', function() {
          assert.equal(view.signIn.callCount, 1);

          var args = view.signIn.args[0];
          assert.instanceOf(args[0], Account);
          assert.equal(args[1], 'password');
        });

        it('calls notifier.trigger correctly', function() {
          assert.equal(notifier.trigger.callCount, 1);

          testExpectTriggered(0, 'signup.submit');
        });

        it('fails correctly', function() {
          assert.isTrue(AuthErrors.is(failed, 'UNEXPECTED_ERROR'));
        });
      });
    });

    describe('COPPA is valid', function() {
      beforeEach(function() {
        fillOutSignUp(email, 'password');

        sandbox.stub(view, 'isUserOldEnough').callsFake(() => true);
        sinon.stub(view, 'signIn').callsFake(() => Promise.resolve());
      });

      describe('signup succeeds', function() {
        beforeEach(function() {
          sinon.stub(view, 'signUp').callsFake(() => Promise.resolve());
          sinon.stub(view, '_hasOptedIntoNewsletter').callsFake(() => true);

          return view.submit();
        });

        it('calls view.signUp correctly, does not display any errors', function() {
          assert.isFalse(view.signIn.called);
          assert.equal(view.signUp.callCount, 1);

          var args = view.signUp.args[0];
          const account = args[0];
          assert.instanceOf(account, Account);
          assert.equal(account.get('email'), email);
          assert.sameMembers(account.get('newsletters'), [
            'firefox-accounts-journey',
          ]);

          assert.equal(args[1], 'password');

          assert.isFalse(view.displayError.called);
          assert.isFalse(view.unsafeDisplayError.called);
        });
      });

      describe('signup succeeds, email-opt-in not visible', () => {
        beforeEach(() => {
          sinon.stub(view, 'signUp').callsFake(() => Promise.resolve());
          sinon.stub(view, 'isAnyNewsletterVisible').callsFake(() => false);

          return view.submit();
        });

        it('calls view.signUp correctly, does not display any errors', () => {
          const account = view.signUp.args[0][0];
          assert.instanceOf(account, Account);
          assert.isFalse(account.has('newsletters'));
        });
      });

      describe('signup fails with ACCOUNT_ALREADY_EXISTS', function() {
        beforeEach(function() {
          sinon.stub(view, 'signUp').callsFake(function() {
            return Promise.reject(AuthErrors.toError('ACCOUNT_ALREADY_EXISTS'));
          });

          return view.submit();
        });

        it('calls view.signUp correctly', function() {
          assert.equal(view.signUp.callCount, 1);

          var args = view.signUp.args[0];
          assert.instanceOf(args[0], Account);
          assert.equal(args[1], 'password');
        });

        it('calls view.signIn correctly', function() {
          assert.equal(view.signIn.callCount, 1);

          var args = view.signIn.args[0];
          assert.instanceOf(args[0], Account);
          assert.equal(args[1], 'password');
        });
      });

      describe('signup fails with USER_CANCELED_LOGIN', function() {
        beforeEach(function() {
          sinon.stub(view, 'signUp').callsFake(function() {
            return Promise.reject(AuthErrors.toError('USER_CANCELED_LOGIN'));
          });

          return view.submit();
        });

        it('calls view.signUp correctly', function() {
          assert.equal(view.signUp.callCount, 1);

          var args = view.signUp.args[0];
          assert.instanceOf(args[0], Account);
          assert.equal(args[1], 'password');
        });

        it('does not call view.signIn', function() {
          assert.isFalse(view.signIn.called);
        });

        it('does not display any errors', function() {
          assert.isFalse(view.displayError.called);
          assert.isFalse(view.unsafeDisplayError.called);
        });

        it('calls view.logEvent correctly', function() {
          assert.equal(view.logEvent.callCount, 1);
          assert.equal(view.logEvent.thisValues[0], view);
          var args = view.logEvent.args[0];
          assert.lengthOf(args, 1);
          assert.equal(args[0], 'login.canceled');
        });
      });

      describe('signup fails with some other error', function() {
        beforeEach(function() {
          sinon.stub(view, 'signUp').callsFake(function() {
            return Promise.reject(AuthErrors.toError('UNEXPECTED_ERROR'));
          });

          return view.submit().catch(function(err) {
            failed = err;
          });
        });

        it('calls view.signUp correctly', function() {
          assert.equal(view.signUp.callCount, 1);

          var args = view.signUp.args[0];
          assert.instanceOf(args[0], Account);
          assert.equal(args[1], 'password');
        });

        it('does not call view.signIn', function() {
          assert.isFalse(view.signIn.called);
        });

        it('does not display any errors', function() {
          assert.isFalse(view.displayError.called);
          assert.isFalse(view.unsafeDisplayError.called);
        });

        it('fails correctly', function() {
          assert.isTrue(AuthErrors.is(failed, 'UNEXPECTED_ERROR'));
        });
      });
    });
  });

  describe('destroy', function() {
    it('saves the form info to formPrefill', function() {
      view.$('.email').val('testuser@testuser.com');
      view.$('.password').val('password');

      view.destroy();

      assert.equal(formPrefill.get('email'), 'testuser@testuser.com');
      assert.equal(formPrefill.get('password'), 'password');
    });
  });

  describe('suggestEmail', function() {
    it('measures how successful our mailcheck suggestion is', function() {
      sinon.stub(experimentGroupingRules, 'choose').callsFake(function(name) {
        if (name === 'mailcheck') {
          return 'treatment';
        }

        return false;
      });
      enableExperiments();
      sinon.stub(view, 'signUp').callsFake(() => Promise.resolve());
      // user puts wrong email first
      fillOutSignUp('testuser@gnail.com', 'password');
      // mailcheck runs
      view.onEmailBlur();
      sinon.spy(user, 'initAccount');

      sinon.stub(view, 'isUserOldEnough').callsFake(() => true);

      return view.submit().then(function() {
        assert.isFalse(
          TestHelpers.isEventLogged(metrics, 'mailcheck.corrected'),
          'is not useful'
        );
        // user fixes value manually
        view.$('.email').val('testuser@gmail.com');

        return view.submit().then(function() {
          assert.isTrue(
            TestHelpers.isEventLogged(metrics, 'mailcheck.corrected'),
            'is useful'
          );
        });
      });
    });

    it('suggests emails via a tooltip', function() {
      $('#container').html(view.el);
      view.$('.email').val('testuser@gnail.com');
      view.onEmailBlur();
      // wait for tooltip
      return p.delay(50).then(() => {
        assert.equal($('.tooltip-suggest').text(), 'Did you mean gmail.com?✕');
        // there are exactly 7 elements with tabindex in the page
        assert.equal($('[tabindex]').length, 7);
        // the first element with tabindex is the span containing the website name
        assert.equal(
          $('.tooltip-suggest span:first').get(0),
          $('[tabindex="1"]').get(0)
        );
        // the second element with tabindex is the span containing the dismiss button
        assert.equal(
          $('.tooltip-suggest .dismiss').get(0),
          $('[tabindex="2"]').get(0)
        );
      });
    });

    it('suggests emails via a tooltip in the automated browser', function(done) {
      createView();
      var container = $('#container');
      var autoBrowser = sinon
        .stub(view.broker, 'isAutomatedBrowser')
        .callsFake(function() {
          return true;
        });

      var suggestEmail = sinon.stub(view, 'onEmailBlur').callsFake(function() {
        autoBrowser.restore();
        suggestEmail.restore();
        done();
      });

      view.render().then(function() {
        view.afterVisible();
        container.html(view.el);
        container.find('input[type=password]').trigger('click');
      });
    });
  });

  describe('flow events', () => {
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
      assert.isTrue(TestHelpers.isEventLogged(metrics, 'flow.begin'));
    });

    it('logs the engage event (click)', () => {
      assert.isFalse(TestHelpers.isEventLogged(metrics, 'flow.signup.engage'));
      view.$('input').trigger('click');
      assert.isTrue(TestHelpers.isEventLogged(metrics, 'flow.signup.engage'));
    });

    it('logs the engage event (input)', () => {
      assert.isFalse(TestHelpers.isEventLogged(metrics, 'flow.signup.engage'));
      view.$('input').trigger('input');
      assert.isTrue(TestHelpers.isEventLogged(metrics, 'flow.signup.engage'));
    });

    it('logs the engage event (keyup)', () => {
      assert.isFalse(TestHelpers.isEventLogged(metrics, 'flow.signup.engage'));
      view.$('input').trigger({
        type: 'keyup',
        which: 9,
      });
      assert.isTrue(TestHelpers.isEventLogged(metrics, 'flow.signup.engage'));
    });

    it('logs the have-account event', () => {
      assert.isFalse(
        TestHelpers.isEventLogged(metrics, 'flow.signup.have-account')
      );
      view.$('[data-flow-event="have-account"]').click();
      assert.isFalse(TestHelpers.isEventLogged(metrics, 'flow.signup.engage'));
      assert.isTrue(
        TestHelpers.isEventLogged(metrics, 'flow.signup.have-account')
      );
    });

    it('logs the submit event', () => {
      $('#container').html(view.el);
      view.$('#submit-btn').click();
      assert.isTrue(TestHelpers.isEventLogged(metrics, 'flow.signup.submit'));
    });
  });
});
