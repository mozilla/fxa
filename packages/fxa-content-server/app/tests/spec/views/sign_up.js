/* This Source Code Form is subject to the terms of the Mozilla Public
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const Able = require('lib/able');
  const Account = require('models/account');
  const { assert } = require('chai');
  const AuthErrors = require('lib/auth-errors');
  const Backbone = require('backbone');
  const Broker = require('models/auth_brokers/base');
  const CoppaAgeInput = require('views/coppa/coppa-age-input');
  const ExperimentInterface = require('lib/experiment');
  const FormPrefill = require('models/form-prefill');
  const FxaClient = require('lib/fxa-client');
  const Metrics = require('lib/metrics');
  const Notifier = require('lib/channels/notifier');
  const p = require('lib/promise');
  const Relier = require('models/reliers/sync');
  const Session = require('lib/session');
  const sinon = require('sinon');
  const TestHelpers = require('../../lib/helpers');
  const Translator = require('lib/translator');
  const User = require('models/user');
  const View = require('views/sign_up');
  const WindowMock = require('../../mocks/window');

  describe('views/sign_up', function () {
    var able;
    var broker;
    var coppa;
    var email;
    var formPrefill;
    var fxaClient;
    var metrics;
    var model;
    var notifier;
    var relier;
    var translator;
    var user;
    var view;

    function fillOutSignUp(email, password) {
      view.$('[type=email]').val(email);
      view.$('[type=password]').val(password);

      view.enableSubmitIfValid();
    }

    function createView(options) {
      options = options || {};

      var viewOpts = {
        able: options.able || able,
        broker: broker,
        coppa: coppa,
        formPrefill: formPrefill,
        fxaClient: fxaClient,
        metrics: metrics,
        model: model,
        notifier: notifier,
        relier: relier,
        translator: translator,
        user: user,
        viewName: 'signup'
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

    beforeEach(function () {
      document.cookie = 'tooyoung=1; expires=Thu, 01-Jan-1970 00:00:01 GMT';

      able = new Able();
      coppa = new CoppaAgeInput();
      email = TestHelpers.createEmail();
      formPrefill = new FormPrefill();
      fxaClient = new FxaClient();
      model = new Backbone.Model();
      notifier = new Notifier();
      metrics = new Metrics({
        notifier,
        sentryMetrics: {
          captureException () {}
        }
      });
      relier = new Relier();
      translator = new Translator({forceEnglish: true});

      broker = new Broker({
        relier: relier
      });

      user = new User({
        fxaClient: fxaClient
      });

      createView();

      $('body').attr('data-flow-id', 'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103');
      $('body').attr('data-flow-begin', '42');

      return view.render()
        .then(function () {
          $('#container').html(view.el);
        });
    });

    afterEach(function () {
      metrics.destroy();
      metrics = null;

      view.remove();
      view.destroy();
      view = null;

      document.cookie = 'tooyoung=1; expires=Thu, 01-Jan-1970 00:00:01 GMT';
    });

    describe('render', function () {
      it('prefills email, password if stored in formPrefill (user comes from signup with existing account)', function () {
        formPrefill.set('email', 'testuser@testuser.com');
        formPrefill.set('password', 'prefilled password');

        createView();

        return view.render()
          .then(function () {
            assert.ok(view.$('#fxa-signup-header').length);
            assert.equal(view.$('[type=email]').val(), 'testuser@testuser.com');
            assert.equal(view.$('[type=email]').attr('spellcheck'), 'false');
            assert.equal(view.$('[type=password]').val(), 'prefilled password');
          });
      });

      describe('with model.forceEmail', function () {
        beforeEach(function () {
          model.set('forceEmail', 'testuser@testuser.com');

          return view.render();
        });

        it('shows a readonly email', function () {
          var $emailInputEl = view.$('[type=email]');
          assert.equal($emailInputEl.val(), 'testuser@testuser.com');
          assert.isTrue($emailInputEl.hasClass('hidden'));

          assert.equal(view.$('.prefillEmail').text(), 'testuser@testuser.com');
        });

        it('does not allow `signin`', function () {
          assert.equal(view.$('.sign-in').length, 0);
        });
      });

      it('prefills email with email from the relier if formPrefill.email is not set', function () {
        relier.set('email', 'testuser@testuser.com');

        return view.render()
          .then(function () {
            assert.equal(view.$('[type=email]').val(), 'testuser@testuser.com');
          });
      });

      it('shows unchecked `customize sync` checkbox when service is sync even after session is cleared', function () {
        relier.set('service', 'sync');
        Session.clear();

        return view.render()
          .then(function () {
            assert.equal(view.$('#customize-sync').length, 1);
            assert.isFalse(view.$('#customize-sync').is(':checked'));
          });
      });

      it('checks `customize sync` checkbox for sync relier that forces it to true', function () {
        relier.set('service', 'sync');
        relier.set('customizeSync', true);

        return view.render()
          .then(function () {
            assert.isTrue(view.$('#customize-sync').is(':checked'));
          });
      });

      it('uses input COPPA', function () {
        view._coppa = null;
        return view.render()
          .then(function () {
            $('#container').html(view.el);
          }).then(function () {
            assert.ok(view.$el.find('#age').length);
          });
      });

      it('shows serviceName', function () {
        var serviceName = 'my service name';
        relier.set('serviceName', serviceName);

        return view.render()
          .then(function () {
            assert.include(view.$('#fxa-signup-header').text(), serviceName);
          });
      });

      describe('email opt in', function () {
        it('is visible if enabled', function () {
          sinon.stub(able, 'choose', function () {
            return true;
          });

          return view.render()
            .then(function () {
              assert.isTrue(able.choose.calledWith('communicationPrefsVisible'));
              assert.equal(view.$('#marketing-email-optin').length, 1);
            });
        });

        it('is not visible if disabled', function () {
          sinon.stub(able, 'choose', function () {
            return false;
          });

          return view.render()
            .then(function () {
              assert.isTrue(able.choose.calledWith('communicationPrefsVisible'));
              assert.equal(view.$('#marketing-email-optin').length, 0);
            });
        });
      });
    });

    describe('sync suggestion', function () {

      it('displays sync suggestion message if no migration', function () {
        createView();
        relier.set('service', null);

        sinon.spy(view.metrics, 'logEvent');

        return view.render()
          .then(function () {
            assert.lengthOf(view.$('#suggest-sync'), 1);

            const $suggestSyncEl = view.$('#suggest-sync');
            assert.include($suggestSyncEl.text(), 'Looking for Firefox Sync?');
            assert.include($suggestSyncEl.text(), 'Get started here');

            const $getStartedEl = $suggestSyncEl.find('a');
            assert.equal($getStartedEl.attr('rel'), 'noopener noreferrer');

            assert.isTrue(TestHelpers.isEventLogged(metrics, 'signup.sync-suggest.visible'), 'enrolled');
          });
      });

      it('does not have sync auth supported', function () {
        createView();
        relier.set('service', null);
        sinon.stub(view, 'isSyncAuthSupported', () => false);
        return view.render()
          .then(function () {
            const $getStartedEl = view.$('#suggest-sync').find('a');
            assert.equal($getStartedEl.attr('href'),
              'https://mozilla.org/firefox/sync?' +
              'utm_source=fx-website&utm_medium=fx-accounts&' +
              'utm_campaign=fx-signup&utm_content=fx-sync-get-started');
          });
      });

      it('has sync auth supported on Firefox for Desktop', function () {
        createView();
        relier.set('service', null);
        sinon.stub(view, 'isSyncAuthSupported', () => true);
        sinon.stub(view, 'getUserAgent', () => {
          return {
            isFirefoxAndroid: () => false,
            isFirefoxDesktop: () => true,
          };
        });
        return view.render()
          .then(function () {
            const $getStartedEl = view.$('#suggest-sync').find('a');
            assert.equal($getStartedEl.attr('href'),
              view.window.location.origin +
              '/signup?context=fx_desktop_v3&entrypoint=fxa%3Asignup&service=sync');
          });
      });

      it('has sync auth supported on Firefox for Android', function () {
        createView();
        relier.set('service', null);
        sinon.stub(view, 'isSyncAuthSupported', () => true);
        sinon.stub(view, 'getUserAgent', () => {
          return {
            isFirefoxAndroid: () => true,
            isFirefoxDesktop: () => false,
          };
        });
        return view.render()
          .then(function () {
            const $getStartedEl = view.$('#suggest-sync').find('a');
            assert.equal($getStartedEl.attr('href'),
              view.window.location.origin +
              '/signup?context=fx_fennec_v1&entrypoint=fxa%3Asignup&service=sync');
          });
      });

      it('can be dismissed', function () {
        createView();
        relier.set('service', null);

        return view.render()
          .then(function () {
            $('#container').html(view.el);
            assert.isTrue(view.$('#suggest-sync').is(':visible'), 'visible');
            view.onSuggestSyncDismiss();
            assert.isFalse(view.$('#suggest-sync').is(':visible'), 'hidden');
          });
      });

      it('does not display sync suggestion message if there is a relier service', function () {
        relier.set('service', 'sync');

        return view.render()
          .then(function () {
            assert.lengthOf(view.$('#suggest-sync'), 0);
          });
      });
    });

    describe('migration', function () {
      it('does not display migration message if no migration', function () {
        return view.render()
          .then(() => {
            assert.lengthOf(view.$('#amo-migration'), 0);
            assert.lengthOf(view.$('#sync-migration'), 0);
            assert.lengthOf(view.$('#suggest-sync'), 1);
          });
      });

      it('displays migration message if isSyncMigration returns true', function () {
        sinon.stub(view, 'isSyncMigration', () => true);

        return view.render()
          .then(() => {
            assert.lengthOf(view.$('#sync-migration'), 1);
          });
      });

      it('does not display migration message if isSyncMigration returns false', function () {
        sinon.stub(view, 'isSyncMigration', () => false);

        return view.render()
          .then(() => {
            assert.lengthOf(view.$('#sync-migration'), 0);
          });
      });

      it('displays migration message if isAmoMigration returns true', function () {
        sinon.stub(view, 'isAmoMigration', () => true);

        return view.render()
          .then(() => {
            assert.lengthOf(view.$('#amo-migration'), 1);
          });
      });

      it('does not display migration message if isAmoMigration returns false', function () {
        sinon.stub(view, 'isAmoMigration', () => false);

        return view.render()
          .then(() => {
            assert.lengthOf(view.$('#amo-migration'), 0);
          });
      });
    });

    describe('afterVisible', function () {
      it('shows a tooltip on the email element if model.bouncedEmail is set', function (done) {
        sinon.spy(view, 'showValidationError');
        model.set('bouncedEmail', 'testuser@testuser.com');

        return view.render()
          .then(function () {
            return view.afterVisible();
          })
          .then(function () {
            assert.isTrue(view.showValidationError.called);
            setTimeout(function () {
              assert.isTrue(view.$('input[type="email"]').hasClass('invalid'));
              done();
            }, 50);
          });
      });

      it('focuses the email element by default', function (done) {
        $('html').addClass('no-touch');
        TestHelpers.requiresFocus(function () {
          view.render()
            .then(function () {

              view.$('input[type="email"]').one('focus', function () {
                done();
              });

              view.afterVisible();
            });
        }, done);
      });
    });

    describe('isValid', function () {
      it('returns true if email and password are valid', function () {
        fillOutSignUp(email, 'password');
        assert.isTrue(view.isValid());
      });

      it('returns false if email is empty', function () {
        fillOutSignUp('', 'password');
        assert.isFalse(view.isValid());
      });

      it('returns false if email is not an email address', function () {
        fillOutSignUp('testuser', 'password');
        assert.isFalse(view.isValid());
      });

      it('returns false if email is the same as the bounced email', function () {
        model.set('bouncedEmail', 'testuser@testuser.com');

        return view.render()
          .then(function () {
            return view.afterVisible();
          })
          .then(function () {
            fillOutSignUp('testuser@testuser.com', 'password');
          })
          .then(function () {
            assert.isFalse(view.isValid());
          });
      });

      it('returns false if email contains a one part TLD', function () {
        fillOutSignUp('a@b', 'password');
        assert.isFalse(view.isValid());
      });

      it('returns true if email contains a two part TLD', function () {
        fillOutSignUp('a@b.c', 'password');
        assert.isTrue(view.isValid());
      });

      it('returns true if email contain three part TLD', function () {
        fillOutSignUp('a@b.c.d', 'password');
        assert.isTrue(view.isValid());
      });

      it('returns false if local side of email === 0 chars', function () {
        fillOutSignUp('@testuser.com', 'password');
        assert.isFalse(view.isValid());
      });

      it('returns false if local side of email > 64 chars', function () {
        var email = '';
        do {
          email += 'a';
        } while (email.length < 65);

        email += '@testuser.com';
        fillOutSignUp(email, 'password');
        assert.isFalse(view.isValid());
      });

      it('returns true if local side of email === 64 chars', function () {
        var email = '';
        do {
          email += 'a';
        } while (email.length < 64);

        email += '@testuser.com';
        fillOutSignUp(email, 'password');
        assert.isTrue(view.isValid());
      });

      it('returns false if domain side of email === 0 chars', function () {
        fillOutSignUp('testuser@', 'password');
        assert.isFalse(view.isValid());
      });

      it('returns false if domain side of email > 255 chars', function () {
        var domain = 'testuser.com';
        do {
          domain += 'a';
        } while (domain.length < 256);

        fillOutSignUp('testuser@' + domain, 'password');
        assert.isFalse(view.isValid());
      });

      it('returns true if domain side of email === 254 chars', function () {
        var domain = 'testuser.com';
        do {
          domain += 'a';
        } while (domain.length < 254);

        fillOutSignUp('a@' + domain, 'password');
        assert.isTrue(view.isValid());
      });

      it('returns false total length > 256 chars', function () {
        var domain = 'testuser.com';
        do {
          domain += 'a';
        } while (domain.length < 254);

        // ab@ + 254 characters = 257 chars
        fillOutSignUp('ab@' + domain, 'password');
        assert.isFalse(view.isValid());
      });

      it('returns true if total length === 256 chars', function () {
        var email = 'testuser@testuser.com';
        do {
          email += 'a';
        } while (email.length < 256);

        fillOutSignUp(email, 'password');
        assert.isTrue(view.isValid());
      });

      it('returns false if password is empty', function () {
        fillOutSignUp(email, '');
        assert.isFalse(view.isValid());
      });

      it('returns false if password is invalid', function () {
        fillOutSignUp(email, 'passwor');
        assert.isFalse(view.isValid());
      });

      it('returns true if COPPA view returns false', function () {
        fillOutSignUp(email, 'password');
        assert.isTrue(view.isValid());
      });
    });

    describe('showValidationErrors', function () {
      it('shows an error if the email is invalid', function () {
        fillOutSignUp('testuser', 'password');

        sinon.spy(view, 'showValidationError');

        view.showValidationErrors();

        assert.isTrue(view.showValidationError.called);
      });

      it('shows an error if the email is the same as the bounced email', function () {
        model.set('bouncedEmail', 'testuser@testuser.com');

        return view.render()
          .then(function () {
            fillOutSignUp('testuser@testuser.com', 'password');

            sinon.spy(view, 'showValidationError');
            view.showValidationErrors();
            assert.isTrue(
              view.showValidationError.calledWith('input[type=email]'));
          });

      });

      it('shows an error if the user provides a @firefox.com email', function () {
        fillOutSignUp('user@firefox.com', 'password');

        sinon.spy(view, 'showValidationError');
        view.showValidationErrors();

        assert.isTrue(view.showValidationError.called);

        var err = AuthErrors.toError('DIFFERENT_EMAIL_REQUIRED_FIREFOX_DOMAIN');
        err.context = 'signup';
        assert.isTrue(TestHelpers.isErrorLogged(metrics, err));
      });

      it('shows an error if the password is invalid', function () {
        fillOutSignUp('testuser@testuser.com', 'passwor');

        sinon.spy(view, 'showValidationError');

        view.showValidationErrors();
        assert.isTrue(view.showValidationError.called);
      });

      it('does not call coppa\'s showValidationErrors if no other errors', function () {
        fillOutSignUp('testuser@testuser.com', 'password');

        sinon.spy(coppa, 'showValidationError');
        view.showValidationErrors();

        assert.isFalse(coppa.showValidationError.called);
      });
    });

    describe('submit', function () {
      var failed;
      var sandbox;

      beforeEach(function () {
        sandbox = sinon.sandbox.create();

        sandbox.spy(notifier, 'trigger');

        sandbox.spy(view, 'displayError');
        sandbox.spy(view, 'unsafeDisplayError');
        sandbox.spy(view, 'logEvent');
        sandbox.spy(view, 'navigate');

        failed = false;
      });

      afterEach(function () {
        sandbox.restore();
      });

      describe('COPPA is not valid', function () {
        beforeEach(function () {
          fillOutSignUp(email, 'password');

          sandbox.stub(coppa, 'isUserOldEnough', function () {
            return false;
          });

          sandbox.stub(view, 'signUp', function () {
            return p();
          });
        });

        describe('signin succeeds', function () {
          beforeEach(function () {
            sandbox.stub(view, 'signIn', function () {
              return p();
            });

            return view.submit();
          });

          it('does not call view.signUp', function () {
            assert.isFalse(view.signUp.called);
          });

          it('calls view.signIn correctly', function () {
            assert.equal(view.signIn.callCount, 1);

            var args = view.signIn.args[0];
            assert.instanceOf(args[0], Account);
            assert.equal(args[1], 'password');
          });

          it('calls notifier.trigger correctly', function () {
            assert.equal(notifier.trigger.callCount, 2);

            testExpectTriggered(0, 'form.enabled');
            testExpectTriggered(1, 'signup.submit');
          });

          it('does not display any errors', function () {
            assert.isFalse(view.displayError.called);
            assert.isFalse(view.unsafeDisplayError.called);
          });
        });

        describe('signin fails with UNKNOWN_ACCOUNT', function () {
          beforeEach(function () {
            sandbox.stub(view, 'signIn', function () {
              return p.reject(AuthErrors.toError('UNKNOWN_ACCOUNT'));
            });
          });

          describe('COPPA has no value', function () {
            beforeEach(function () {
              sandbox.stub(coppa, 'hasValue', function () {
                return false;
              });
              sandbox.stub(view, 'showValidationError', function () { });
              return view.submit();
            });

            it('does not call view.signUp', function () {
              assert.isFalse(view.signUp.called);
            });

            it('calls view.signIn correctly', function () {
              assert.equal(view.signIn.callCount, 1);

              var args = view.signIn.args[0];
              assert.instanceOf(args[0], Account);
              assert.equal(args[1], 'password');
            });

            it('calls notifier.trigger correctly', function () {
              assert.equal(notifier.trigger.callCount, 2);

              testExpectTriggered(0, 'form.enabled');
              testExpectTriggered(1, 'signup.submit');
            });

            it('display an error message', function () {
              assert.isTrue(view.showValidationError.called);
            });
          });

          describe('COPPA is too young', function () {
            beforeEach(function () {
              sandbox.stub(coppa, 'hasValue', function () {
                return true;
              });

              return view.submit();
            });

            it('does not call view.signUp', function () {
              assert.isFalse(view.signUp.called);
            });

            it('calls view.signIn correctly', function () {
              assert.equal(view.signIn.callCount, 1);

              var args = view.signIn.args[0];
              assert.instanceOf(args[0], Account);
              assert.equal(args[1], 'password');
            });

            it('calls notifier.trigger correctly', function () {
              assert.equal(notifier.trigger.callCount, 4);

              testExpectTriggered(0, 'form.enabled');
              testExpectTriggered(1, 'signup.submit');
              testExpectTriggered(2, 'signup.tooyoung');
              testExpectTriggered(3, 'navigate');
            });

            it('calls view.navigate correctly', function () {
              assert.equal(view.navigate.callCount, 1);
              assert.equal(view.navigate.thisValues[0], view);
              var args = view.navigate.args[0];
              assert.lengthOf(args, 1);
              assert.equal(args[0], 'cannot_create_account');
            });

            it('does not display any errors', function () {
              assert.isFalse(view.displayError.called);
              assert.isFalse(view.unsafeDisplayError.called);
            });

            describe('when the user revisits', function () {
              var revisitView;
              beforeEach(function () {
                revisitView = new View({
                  able: able,
                  fxaClient: fxaClient,
                  notifier: notifier,
                  relier: relier
                });

                sinon.spy(revisitView, 'navigate');

                // simulate user re-visiting the /signup
                // page after being rejected
                return revisitView.render();
              });

              it('immediately sends them to `cannot_create_account`', function () {
                assert.isTrue(revisitView.navigate.calledOnce);
                assert.isTrue(revisitView.navigate.calledWith('cannot_create_account'));
              });
            });
          });
        });

        describe('signin fails with INCORRECT_PASSWORD', function () {
          beforeEach(function () {
            sandbox.stub(view, 'signIn', function () {
              return p.reject(AuthErrors.toError('INCORRECT_PASSWORD'));
            });

            return view.submit();
          });

          it('does not call view.signUp', function () {
            assert.isFalse(view.signUp.called);
          });

          it('calls view.signIn correctly', function () {
            assert.equal(view.signIn.callCount, 1);

            var args = view.signIn.args[0];
            assert.instanceOf(args[0], Account);
            assert.equal(args[1], 'password');
          });

          it('calls notifier.trigger correctly', function () {
            assert.equal(notifier.trigger.callCount, 2);

            testExpectTriggered(0, 'form.enabled');
            testExpectTriggered(1, 'signup.submit');
          });

          it('calls view.unsafeDisplayError correctly', function () {
            assert.equal(view.unsafeDisplayError.callCount, 1);
            var args = view.unsafeDisplayError.args[0];
            assert.lengthOf(args, 1);
            var error = args[0];
            assert.include(error.forceMessage, 'href="/signin"');
            assert.isTrue(AuthErrors.is(error, 'INCORRECT_PASSWORD'));
          });
        });

        describe('signin fails with USER_CANCELED_LOGIN', function () {
          beforeEach(function () {
            sinon.stub(view, 'signIn', function () {
              return p.reject(AuthErrors.toError('USER_CANCELED_LOGIN'));
            });

            return view.submit();
          });

          it('does not call view.signUp', function () {
            assert.isFalse(view.signUp.called);
          });

          it('calls view.signIn correctly', function () {
            assert.equal(view.signIn.callCount, 1);

            var args = view.signIn.args[0];
            assert.instanceOf(args[0], Account);
            assert.equal(args[1], 'password');
          });

          it('does not display any errors', function () {
            assert.isFalse(view.displayError.called);
            assert.isFalse(view.unsafeDisplayError.called);
          });

          it('calls view.logEvent correctly', function () {
            assert.equal(view.logEvent.callCount, 1);
            assert.equal(view.logEvent.thisValues[0], view);
            var args = view.logEvent.args[0];
            assert.lengthOf(args, 1);
            assert.equal(args[0], 'login.canceled');
          });
        });

        describe('signin fails with a reset account', function () {
          beforeEach(function () {
            sinon.stub(view, 'signIn', function () {
              return p.reject(AuthErrors.toError('ACCOUNT_RESET'));
            });

            sinon.spy(view, 'notifyOfResetAccount');

            return view.submit();
          });

          it('does not call view.signUp', function () {
            assert.isFalse(view.signUp.called);
          });

          it('calls view.signIn correctly', function () {
            assert.equal(view.signIn.callCount, 1);

            var args = view.signIn.args[0];
            assert.instanceOf(args[0], Account);
            assert.equal(args[1], 'password');
          });

          it('notifies the user of the reset account', function () {
            assert.isTrue(view.notifyOfResetAccount.called);
            var args = view.notifyOfResetAccount.args[0];
            var account = args[0];
            assert.instanceOf(account, Account);
          });
        });

        describe('signin fails with some other error', function () {
          beforeEach(function () {
            sandbox.stub(view, 'signIn', function () {
              return p.reject(AuthErrors.toError('UNEXPECTED_ERROR'));
            });

            return view.submit()
              .fail(function (err) {
                failed = err;
              });
          });

          it('does not call view.signUp', function () {
            assert.isFalse(view.signUp.called);
          });

          it('calls view.signIn correctly', function () {
            assert.equal(view.signIn.callCount, 1);

            var args = view.signIn.args[0];
            assert.instanceOf(args[0], Account);
            assert.equal(args[1], 'password');
          });

          it('calls notifier.trigger correctly', function () {
            assert.equal(notifier.trigger.callCount, 2);

            testExpectTriggered(0, 'form.enabled');
            testExpectTriggered(1, 'signup.submit');
          });

          it('fails correctly', function () {
            assert.isTrue(AuthErrors.is(failed, 'UNEXPECTED_ERROR'));
          });
        });
      });

      describe('COPPA is valid', function () {
        beforeEach(function () {
          fillOutSignUp(email, 'password');

          sandbox.stub(coppa, 'isUserOldEnough', function () {
            return true;
          });

          sinon.stub(view, 'signIn', function () {
            return p();
          });
        });

        describe('signup succeeds', function () {
          beforeEach(function () {
            sinon.stub(view, 'signUp', function () {
              return p();
            });

            return view.submit();
          });

          it('does not call view.signIn', function () {
            assert.isFalse(view.signIn.called);
          });

          it('calls view.signUp correctly', function () {
            assert.equal(view.signUp.callCount, 1);

            var args = view.signUp.args[0];
            assert.instanceOf(args[0], Account);
            assert.equal(args[1], 'password');
          });

          it('does not display any errors', function () {
            assert.isFalse(view.displayError.called);
            assert.isFalse(view.unsafeDisplayError.called);
          });
        });

        describe('signup fails with ACCOUNT_ALREADY_EXISTS', function () {
          beforeEach(function () {
            sinon.stub(view, 'signUp', function () {
              return p.reject(AuthErrors.toError('ACCOUNT_ALREADY_EXISTS'));
            });

            return view.submit();
          });

          it('calls view.signUp correctly', function () {
            assert.equal(view.signUp.callCount, 1);

            var args = view.signUp.args[0];
            assert.instanceOf(args[0], Account);
            assert.equal(args[1], 'password');
          });

          it('calls view.signIn correctly', function () {
            assert.equal(view.signIn.callCount, 1);

            var args = view.signIn.args[0];
            assert.instanceOf(args[0], Account);
            assert.equal(args[1], 'password');
          });
        });

        describe('signup fails with USER_CANCELED_LOGIN', function () {
          beforeEach(function () {
            sinon.stub(view, 'signUp', function () {
              return p.reject(AuthErrors.toError('USER_CANCELED_LOGIN'));
            });

            return view.submit();
          });

          it('calls view.signUp correctly', function () {
            assert.equal(view.signUp.callCount, 1);

            var args = view.signUp.args[0];
            assert.instanceOf(args[0], Account);
            assert.equal(args[1], 'password');
          });

          it('does not call view.signIn', function () {
            assert.isFalse(view.signIn.called);
          });

          it('does not display any errors', function () {
            assert.isFalse(view.displayError.called);
            assert.isFalse(view.unsafeDisplayError.called);
          });

          it('calls view.logEvent correctly', function () {
            assert.equal(view.logEvent.callCount, 1);
            assert.equal(view.logEvent.thisValues[0], view);
            var args = view.logEvent.args[0];
            assert.lengthOf(args, 1);
            assert.equal(args[0], 'login.canceled');
          });
        });

        describe('signup fails with some other error', function () {
          beforeEach(function () {
            sinon.stub(view, 'signUp', function () {
              return p.reject(AuthErrors.toError('UNEXPECTED_ERROR'));
            });

            return view.submit()
              .fail(function (err) {
                failed = err;
              });
          });

          it('calls view.signUp correctly', function () {
            assert.equal(view.signUp.callCount, 1);

            var args = view.signUp.args[0];
            assert.instanceOf(args[0], Account);
            assert.equal(args[1], 'password');
          });

          it('does not call view.signIn', function () {
            assert.isFalse(view.signIn.called);
          });

          it('does not display any errors', function () {
            assert.isFalse(view.displayError.called);
            assert.isFalse(view.unsafeDisplayError.called);
          });

          it('fails correctly', function () {
            assert.isTrue(AuthErrors.is(failed, 'UNEXPECTED_ERROR'));
          });
        });
      });

      describe('customizeSync', function () {
        function setupCustomizeSyncTest(service, isCustomizeSyncChecked) {
          relier.set('service', service);
          relier.set('customizeSync', isCustomizeSyncChecked);

          sinon.stub(relier, 'isSync', function () {
            return service === 'sync';
          });

          sinon.stub(relier, 'isCustomizeSyncChecked', function () {
            return isCustomizeSyncChecked;
          });

          sinon.stub(user, 'signUpAccount', function (account) {
            account.set('verified', true);
            return p(account);
          });

          sinon.stub(broker, 'afterSignIn', function () {
            return p();
          });

          return view.render()
            .then(function () {
              fillOutSignUp(email, 'password');

              sinon.stub(coppa, 'isUserOldEnough', function () {
                return true;
              });

              return view.submit();
            });
        }

        it('passes the customize sync option to the fxa-client', function () {
          return setupCustomizeSyncTest('sync', true)
            .then(function () {
              assert.isTrue(user.signUpAccount.args[0][0].get('customizeSync'), 'fxa client params');
            });
        });

        it('passes customize sync option to the experiment', function () {
          sinon.spy(view.notifier, 'trigger');
          sinon.stub(view, 'isInExperiment', function () {
            return true;
          });
          sinon.stub(view, 'isInExperimentGroup', function () {
            return true;
          });

          return setupCustomizeSyncTest('sync', true)
            .then(function () {
              assert.isTrue(view.notifier.trigger.called);
            });
        });

        it('does not log `signup.customizeSync.*` if not sync', function () {
          return setupCustomizeSyncTest('hello')
            .then(function () {
              assert.isFalse(TestHelpers.isEventLogged(metrics,
                'signup.customizeSync.true'));
              assert.isFalse(TestHelpers.isEventLogged(metrics,
                'signup.customizeSync.false'));
            });
        });

        it('logs `signup.customizeSync.false` if customize sync is not checked', function () {
          return setupCustomizeSyncTest('sync', false)
            .then(function () {
              assert.isFalse(TestHelpers.isEventLogged(metrics,
                'signup.customizeSync.true'));
              assert.isTrue(TestHelpers.isEventLogged(metrics,
                'signup.customizeSync.false'));
            });
        });

        it('logs `signup.customizeSync.true` if customize sync is checked', function () {
          return setupCustomizeSyncTest('sync', true)
            .then(function () {
              assert.isTrue(TestHelpers.isEventLogged(metrics,
                'signup.customizeSync.true'));
            });
        });

        it('checkbox is visible for `service=sync`', function () {
          return setupCustomizeSyncTest('sync', true)
            .then(function () {
              assert.isTrue(view.$el.find('#customize-sync').length > 0);
            });
        });

        it('checkbox is not visible if no `chooseWhatToSyncCheckbox` capability', function () {
          broker.setCapability('chooseWhatToSyncCheckbox', false);
          view.context();
          return setupCustomizeSyncTest('sync', true)
            .then(function () {
              assert.isFalse(view.$el.find('#customize-sync').length > 0);
            });
        });

      });
    });

    describe('destroy', function () {
      it('saves the form info to formPrefill', function () {
        view.$('.email').val('testuser@testuser.com');
        view.$('.password').val('password');

        view.destroy();

        assert.equal(formPrefill.get('email'), 'testuser@testuser.com');
        assert.equal(formPrefill.get('password'), 'password');
      });
    });

    describe('suggestEmail', function () {
      it('measures how successful our mailcheck suggestion is', function () {
        var windowMock = new WindowMock();
        windowMock.navigator.userAgent = 'mocha';
        var mockAble = new Able();
        sinon.stub(mockAble, 'choose', function (name) {
          if (name === 'mailcheck') {
            return 'treatment';
          }

          return false;
        });
        view.experiments = new ExperimentInterface({
          able: mockAble,
          metrics: metrics,
          notifier: notifier,
          user: user,
          window: windowMock
        });
        view.experiments.chooseExperiments();
        // user puts wrong email first
        fillOutSignUp('testuser@gnail.com', 'password');
        // mailcheck runs
        view.onEmailBlur();
        sinon.spy(user, 'initAccount');
        sinon.stub(user, 'signUpAccount', function (account) {
          return p(account);
        });

        sinon.spy(view, 'navigate');
        sinon.stub(coppa, 'isUserOldEnough', function () {
          return true;
        });

        return view.submit()
          .then(function () {
            assert.isFalse(TestHelpers.isEventLogged(metrics, 'mailcheck.corrected'), 'is not useful');
            // user fixes value manually
            view.$('.email').val('testuser@gmail.com');

            return view.submit()
              .then(function () {
                assert.isTrue(TestHelpers.isEventLogged(metrics, 'mailcheck.corrected'), 'is useful');
              });
          });
      });

      it('suggests emails via a tooltip', function () {
        view.$('.email').val('testuser@gnail.com');
        view.onEmailBlur();
        // wait for tooltip
        return p().delay(50).then(() => {
          assert.equal($('.tooltip-suggest').text(), 'Did you mean gmail.com?✕');
          // there are exactly 3 elements with tabindex in the page (show
          // password button has not been added to the page).
          assert.equal($('[tabindex]').length, 3);
          // the first element with tabindex is the span containing the website name
          assert.equal($('.tooltip-suggest span:first').get(0), $('[tabindex="1"]').get(0));
          // the second element with tabindex is the span containing the dismiss button
          assert.equal($('.tooltip-suggest .dismiss').get(0), $('[tabindex="2"]').get(0));
        });
      });

      it('suggests emails via a tooltip in the automated browser', function (done) {
        createView();
        var container = $('#container');
        var autoBrowser = sinon.stub(view.broker, 'isAutomatedBrowser', function () {
          return true;
        });

        var suggestEmail = sinon.stub(view, 'onEmailBlur', function () {
          autoBrowser.restore();
          suggestEmail.restore();
          done();
        });

        view.render()
          .then(function () {
            view.afterVisible();
            container.html(view.el);
            container.find('input[type=password]').trigger('click');
          });
      });
    });

    describe('onAmoSignIn', function () {
      beforeEach(function () {
        relier.set('email', email);
        view.$('input[type=email]').val(email);

        // simulate what happens when the user clicks the AMO sign in link
        view.onAmoSignIn();
        view.beforeDestroy();
      });

      // these two fields are cleared to prevent the email
      // from being displayed on the signin screen.
      it('unsets the email on the relier', function () {
        assert.isFalse(relier.has('email'));
      });

      it('sets an empty email on formPrefill', function () {
        assert.equal(formPrefill.get('email'), '');
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
        assert.deepEqual(notifier.trigger.args[1][1], { event: 'begin', once: true, viewName: undefined });
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
          which: 9
        });
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'flow.signup.engage'));
      });

      it('logs the have-account event', () => {
        assert.isFalse(TestHelpers.isEventLogged(metrics, 'flow.signup.have-account'));
        view.$('[data-flow-event="have-account"]').click();
        assert.isFalse(TestHelpers.isEventLogged(metrics, 'flow.signup.engage'));
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'flow.signup.have-account'));
      });

      it('logs the submit event', () => {
        view.$('#submit-btn').click();
        assert.isFalse(TestHelpers.isEventLogged(metrics, 'flow.signup.submit'));
        view.enableForm();
        view.$('#submit-btn').click();
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'flow.signup.submit'));
      });

      it('logs the link.signin event', () => {
        // Without the _flusthMetricsThenRedirect override, the test
        // causes the page to redirect.
        sinon.stub(view, 'isSyncSuggestionEnabled', () => true);
        sinon.stub(view, '_flushMetricsThenRedirect', () => p());
        return view.render()
          .then(() => {
            assert.isFalse(TestHelpers.isEventLogged(metrics, 'flow.signup.link.signin'));
            assert.lengthOf(view.$('a[data-flow-event="link.signin"]'), 1);
            view.$('a[data-flow-event="link.signin"]').click();
            assert.isTrue(TestHelpers.isEventLogged(metrics, 'flow.signup.link.signin'));
          });
      });
    });
  });
});
