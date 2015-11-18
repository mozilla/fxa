/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var Able = require('lib/able');
  var AuthErrors = require('lib/auth-errors');
  var Broker = require('models/auth_brokers/base');
  var chai = require('chai');
  var CoppaAgeInput = require('views/coppa/coppa-age-input');
  var EphemeralMessages = require('lib/ephemeral-messages');
  var ExperimentInterface = require('lib/experiment');
  var FormPrefill = require('models/form-prefill');
  var FxaClient = require('lib/fxa-client');
  var Metrics = require('lib/metrics');
  var Notifier = require('lib/channels/notifier');
  var p = require('lib/promise');
  var Relier = require('models/reliers/sync');
  var Session = require('lib/session');
  var sinon = require('sinon');
  var TestHelpers = require('../../lib/helpers');
  var User = require('models/user');
  var View = require('views/sign_up');
  var WindowMock = require('../../mocks/window');

  var assert = chai.assert;

  describe('views/sign_up', function () {
    var able;
    var broker;
    var coppa;
    var email;
    var ephemeralMessages;
    var formPrefill;
    var fxaClient;
    var metrics;
    var notifier;
    var relier;
    var user;
    var view;

    function fillOutSignUp(email, password, isCoppaValid) {
      view.$('[type=email]').val(email);
      view.$('[type=password]').val(password);

      sinon.stub(coppa, 'isValid', function () {
        return isCoppaValid;
      });

      view.enableSubmitIfValid();
    }

    function createView(options) {
      options = options || {};

      var viewOpts = {
        able: options.able || able,
        broker: broker,
        coppa: coppa,
        ephemeralMessages: ephemeralMessages,
        formPrefill: formPrefill,
        fxaClient: fxaClient,
        metrics: metrics,
        notifier: notifier,
        relier: relier,
        user: user,
        viewName: 'signup'
      };

      if (options.window) {
        viewOpts.window = options.window;
      }
      view = new View(viewOpts);
    }

    beforeEach(function () {
      document.cookie = 'tooyoung=1; expires=Thu, 01-Jan-1970 00:00:01 GMT';

      able = new Able();
      coppa = new CoppaAgeInput();
      email = TestHelpers.createEmail();
      ephemeralMessages = new EphemeralMessages();
      formPrefill = new FormPrefill();
      fxaClient = new FxaClient();
      metrics = new Metrics();
      notifier = new Notifier();
      relier = new Relier();

      broker = new Broker({
        relier: relier
      });

      user = new User({
        fxaClient: fxaClient
      });

      createView();

      return view.render()
        .then(function () {
          $('#container').html(view.el);
        });
    });

    afterEach(function () {
      metrics.destroy();

      view.remove();
      view.destroy();
      document.cookie = 'tooyoung=1; expires=Thu, 01-Jan-1970 00:00:01 GMT';

      view = metrics = null;
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

      it('shows syncCheckbox experiment treatment', function () {
        relier.set('service', 'sync');
        Session.clear();
        sinon.stub(view, 'isInExperiment', function () {
          return true;
        });

        sinon.stub(view, 'isInExperimentGroup', function () {
          return true;
        });

        return view.render()
          .then(function () {
            assert.equal(view.$('#customize-sync.customize-sync-top').length, 1);
            assert.isFalse(view.$('#customize-sync.customize-sync-top').is(':checked'));
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

      it('displays a message if isMigration returns true', function () {
        sinon.stub(view, 'isMigration', function (arg) {
          return true;
        });

        return view.render()
          .then(function () {
            assert.equal(view.$('.info.nudge').html(), 'Migrate your sync data by creating a new Firefox&nbsp;Account.');
            view.isMigration.restore();
          });
      });

      it('does not display a message if isMigration returns false', function () {
        sinon.stub(view, 'isMigration', function (arg) {
          return false;
        });

        return view.render()
          .then(function () {
            assert.lengthOf(view.$('.info.nudge'), 0);
            view.isMigration.restore();
          });
      });

      it('sends users to /signin if signup is disabled', function () {
        sinon.stub(view, 'isSignupDisabled', function () {
          return true;
        });

        sinon.stub(view, 'navigate', sinon.spy());
        sinon.stub(view, 'getSignupDisabledReason', function () {
          return AuthErrors.toError('IOS_SIGNUP_DISABLED');
        });

        return view.render()
          .then(function () {
            assert.isTrue(view.navigate.calledWith('signin'));
            var err = view.navigate.args[0][1].error;
            assert.isTrue(AuthErrors.is(err, 'IOS_SIGNUP_DISABLED'));
          });
      });
    });

    describe('afterVisible', function () {
      it('shows a tooltip on the email element if ephemeralMessages.bouncedEmail is set', function (done) {
        sinon.spy(view, 'showValidationError');
        ephemeralMessages.set('bouncedEmail', 'testuser@testuser.com');

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

      it('loads the password strength checker if enabled', function () {
        sinon.stub(view, 'isPasswordStrengthCheckEnabled', function () {
          return true;
        });

        sinon.stub(view, 'getPasswordStrengthChecker', function () {
          return true;
        });

        return view.render()
          .then(function () {
            return view.afterVisible();
          })
          .then(function () {
            assert.isTrue(view.getPasswordStrengthChecker.called);
          });
      });
    });

    describe('isValid', function () {
      it('returns true if email, password, and age are all valid', function () {
        fillOutSignUp(email, 'password', true);
        assert.isTrue(view.isValid());
      });

      it('returns false if email is empty', function () {
        fillOutSignUp('', 'password', true);
        assert.isFalse(view.isValid());
      });

      it('returns false if email is not an email address', function () {
        fillOutSignUp('testuser', 'password', true);
        assert.isFalse(view.isValid());
      });

      it('returns false if email is the same as the bounced email', function () {
        ephemeralMessages.set('bouncedEmail', 'testuser@testuser.com');

        return view.render()
          .then(function () {
            return view.afterVisible();
          })
          .then(function () {
            fillOutSignUp('testuser@testuser.com', 'password', true);
          })
          .then(function () {
            assert.isFalse(view.isValid());
          });
      });

      it('returns true if email contains a one part TLD', function () {
        fillOutSignUp('a@b', 'password', true);
        assert.isTrue(view.isValid());
      });

      it('returns true if email contains a two part TLD', function () {
        fillOutSignUp('a@b.c', 'password', true);
        assert.isTrue(view.isValid());
      });

      it('returns true if email contain three part TLD', function () {
        fillOutSignUp('a@b.c.d', 'password', true);
        assert.isTrue(view.isValid());
      });

      it('returns false if local side of email === 0 chars', function () {
        fillOutSignUp('@testuser.com', 'password', true);
        assert.isFalse(view.isValid());
      });

      it('returns false if local side of email > 64 chars', function () {
        var email = '';
        do {
          email += 'a';
        } while (email.length < 65);

        email += '@testuser.com';
        fillOutSignUp(email, 'password', true);
        assert.isFalse(view.isValid());
      });

      it('returns true if local side of email === 64 chars', function () {
        var email = '';
        do {
          email += 'a';
        } while (email.length < 64);

        email += '@testuser.com';
        fillOutSignUp(email, 'password', true);
        assert.isTrue(view.isValid());
      });

      it('returns false if domain side of email === 0 chars', function () {
        fillOutSignUp('testuser@', 'password', true);
        assert.isFalse(view.isValid());
      });

      it('returns false if domain side of email > 255 chars', function () {
        var domain = 'testuser.com';
        do {
          domain += 'a';
        } while (domain.length < 256);

        fillOutSignUp('testuser@' + domain, 'password', true);
        assert.isFalse(view.isValid());
      });

      it('returns true if domain side of email === 254 chars', function () {
        var domain = 'testuser.com';
        do {
          domain += 'a';
        } while (domain.length < 254);

        fillOutSignUp('a@' + domain, 'password', true);
        assert.isTrue(view.isValid());
      });

      it('returns false total length > 256 chars', function () {
        var domain = 'testuser.com';
        do {
          domain += 'a';
        } while (domain.length < 254);

        // ab@ + 254 characters = 257 chars
        fillOutSignUp('ab@' + domain, 'password', true);
        assert.isFalse(view.isValid());
      });

      it('returns true if total length === 256 chars', function () {
        var email = 'testuser@testuser.com';
        do {
          email += 'a';
        } while (email.length < 256);

        fillOutSignUp(email, 'password', true);
        assert.isTrue(view.isValid());
      });

      it('returns false if password is empty', function () {
        fillOutSignUp(email, '', true);
        assert.isFalse(view.isValid());
      });

      it('returns false if password is invalid', function () {
        fillOutSignUp(email, 'passwor', true);
        assert.isFalse(view.isValid());
      });

      it('returns false if COPPA view returns false', function () {
        fillOutSignUp(email, 'password', false);
        assert.isFalse(view.isValid());
      });
    });

    describe('showValidationErrors', function () {
      it('shows an error if the email is invalid', function () {
        fillOutSignUp('testuser', 'password', true);

        sinon.spy(view, 'showValidationError');

        view.showValidationErrors();

        assert.isTrue(view.showValidationError.called);
      });

      it('shows an error if the email is the same as the bounced email', function () {
        ephemeralMessages.set('bouncedEmail', 'testuser@testuser.com');

        return view.render()
          .then(function () {
            fillOutSignUp('testuser@testuser.com', 'password', true);

            sinon.spy(view, 'showValidationError');
            view.showValidationErrors();
            assert.isTrue(
              view.showValidationError.calledWith('input[type=email]'));
          });

      });

      it('shows an error if the user provides a @firefox.com email', function () {
        fillOutSignUp('user@firefox.com', 'password', true);

        sinon.spy(view, 'showValidationError');
        view.showValidationErrors();

        assert.isTrue(view.showValidationError.called);

        var err = AuthErrors.toError('DIFFERENT_EMAIL_REQUIRED_FIREFOX_DOMAIN');
        err.context = 'signup';
        assert.isTrue(TestHelpers.isErrorLogged(metrics, err));
      });

      it('shows an error if the password is invalid', function () {
        fillOutSignUp('testuser@testuser.com', 'passwor', true);

        sinon.spy(view, 'showValidationError');

        view.showValidationErrors();
        assert.isTrue(view.showValidationError.called);
      });

      it('calls coppa\'s showValidationErrors if no other errors', function () {
        fillOutSignUp('testuser@testuser.com', 'password', true);

        sinon.spy(coppa, 'showValidationError');
        view.showValidationErrors();

        assert.isTrue(coppa.showValidationError.called);
      });
    });

    describe('submit', function () {
      it('clears formPrefill information on successful sign in', function () {
        sinon.stub(user, 'signUpAccount', function (account) {
          return p(account);
        });

        sinon.stub(view, '_isUserOldEnough', function () {
          return true;
        });

        sinon.stub(view, 'navigate', function () { });

        formPrefill.set('email', email);
        formPrefill.set('password', 'password');

        return view.submit()
          .then(function () {
            assert.isFalse(formPrefill.has('email'));
            assert.isFalse(formPrefill.has('password'));
          });
      });

      it('sends the user to `/confirm` if form filled out, not pre-verified, passes COPPA', function () {
        var password = 'password';

        fillOutSignUp(email, password, true);
        sinon.spy(user, 'initAccount');

        sinon.stub(user, 'signUpAccount', function (account) {
          account.set('verified', false);
          account.set('customizeSync', true);
          return p(account);
        });

        sinon.spy(view, 'navigate');

        sinon.stub(coppa, 'isUserOldEnough', function () {
          return true;
        });

        return view.submit()
          .then(function () {
            var account = user.initAccount.returnValues[0];

            assert.equal(view.navigate.args[0][0], 'confirm');
            assert.isTrue(view.navigate.args[0][1].data.account.get('customizeSync'));
            assert.isTrue(user.signUpAccount.calledWith(account, relier));
            assert.isTrue(TestHelpers.isEventLogged(metrics,
                              'signup.success'));
          });
      });

      it('notifies the broker if form filled out, pre-verified, passes COPPA', function () {
        relier.set('preVerifyToken', 'preverifytoken');
        var password = 'password';
        fillOutSignUp(email, password, true);

        sinon.stub(user, 'signUpAccount', function (account) {
          account.set('verified', true);
          account.set('customizeSync', true);
          return p(account);
        });

        sinon.stub(broker, 'afterSignIn', function (account) {
          assert.isTrue(account.get('customizeSync'), 'customizeSync option is passed to broker');
          return p();
        });

        sinon.stub(coppa, 'isUserOldEnough', function () {
          return true;
        });

        return view.submit()
            .then(function () {
              assert.isTrue(user.signUpAccount.called);
              assert.isTrue(broker.afterSignIn.called);
            });
      });

      it('sends the user to /cannot_create_account if user does not pass COPPA', function () {

        fillOutSignUp(email, 'password', true);

        sinon.stub(coppa, 'isUserOldEnough', function () {
          return false;
        });
        sinon.spy(view, 'navigate');

        return view.submit()
          .then(function () {
            assert.isTrue(view.navigate.calledWith('cannot_create_account'));
          });
      });

      it('sends user to cannot_create_account when visiting sign up if they have already been sent there', function () {
        fillOutSignUp(email, 'password', true);

        var revisitView = new View({
          able: able,
          fxaClient: fxaClient,
          notifier: notifier,
          relier: relier
        });

        sinon.stub(coppa, 'isUserOldEnough', function () {
          return false;
        });

        sinon.spy(view, 'navigate');
        sinon.spy(revisitView, 'navigate');

        return view.submit()
            .then(function () {
              assert.isTrue(view.navigate.calledOnce);
              assert.isTrue(view.navigate.calledWith('cannot_create_account'));
            })
            .then(function () {
              // simulate user re-visiting the /signup page after being rejected
              return revisitView.render();
            }).then(function () {
              assert.isTrue(revisitView.navigate.calledOnce);
              assert.isTrue(revisitView.navigate.calledWith('cannot_create_account'));
            });
      });

      it('shows message allowing the user to sign in if user enters existing verified account', function () {
        sinon.stub(user, 'signUpAccount', function () {
          return p.reject(AuthErrors.toError('ACCOUNT_ALREADY_EXISTS'));
        });

        fillOutSignUp(email, 'incorrect', true);

        sinon.stub(coppa, 'isUserOldEnough', function () {
          return true;
        });

        return view.submit()
          .then(function (msg) {
            assert.include(msg, '/signin');
            assert.isTrue(view.isErrorVisible());
          });
      });

      it('re-signs up unverified user with new password', function () {

        sinon.stub(user, 'signUpAccount', function (account) {
          return p(account);
        });

        fillOutSignUp(email, 'incorrect', true);

        sinon.stub(coppa, 'isUserOldEnough', function () {
          return true;
        });

        sinon.spy(view, 'navigate');

        return view.submit()
            .then(function () {
              assert.isTrue(view.navigate.calledWith('confirm'));
            });
      });

      it('logs, but does not display an error if user cancels signup', function () {
        sinon.stub(broker, 'beforeSignIn', function () {
          return p.reject(AuthErrors.toError('USER_CANCELED_LOGIN'));
        });

        fillOutSignUp(email, 'password', true);

        sinon.stub(coppa, 'isUserOldEnough', function () {
          return true;
        });

        return view.submit()
          .then(function () {
            assert.isTrue(broker.beforeSignIn.calledWith(email));

            assert.isFalse(view.isErrorVisible());
            assert.isTrue(TestHelpers.isEventLogged(metrics,
                'login.canceled'));
          });
      });

      it('re-throws any other errors for display', function () {
        sinon.stub(user, 'signUpAccount', function () {
          return p.reject(AuthErrors.toError('SERVER_BUSY'));
        });

        fillOutSignUp(email, 'password', true);

        sinon.stub(coppa, 'isUserOldEnough', function () {
          return true;
        });

        return view.submit()
          .then(null, function (err) {
            // The errorback will not be called if the submit
            // succeeds, but the following callback always will
            // be. To ensure the errorback was called, pass
            // the error along and check its type.
            return err;
          })
          .then(function (err) {
            assert.isTrue(AuthErrors.is(err, 'SERVER_BUSY'));
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
              fillOutSignUp(email, 'password', true);

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
      it('works when able chooses treatment', function (done) {
        sinon.stub(view, 'isInExperiment', function () {
          return true;
        });
        sinon.stub(view, 'isInExperimentGroup', function () {
          return true;
        });
        view.$('.email').val('testuser@gnail.com');
        view.onEmailBlur();
        setTimeout(function () {
          assert.equal($('.tooltip-suggest').text(), 'Did you mean gmail.com?✕');
          done();
        }, 50);
      });

      it('does not show when able chooses control', function (done) {
        view.experiments.able = new Able();
        sinon.stub(view, 'isInExperiment', function () {
          return true;
        });
        sinon.stub(view, 'isInExperimentGroup', function () {
          return false;
        });

        view.experiments.chooseExperiments();
        view.$('.email').val('testuser@gnail.com');
        view.onEmailBlur();
        setTimeout(function () {
          assert.equal($('.tooltip-suggest').length, 0);
          done();
        }, 50);
      });

      it('accepts window parameter override', function (done) {
        var windowMock = new WindowMock();
        windowMock.location.search = '?forceVerificationExperiment=mailcheck&forceExperimentGroup=treatment';
        windowMock.navigator.userAgent = 'mocha';
        var mockAble = new Able();
        sinon.stub(mockAble, 'choose', function (name, data) {
          if (name === 'chooseAbExperiment') {
            return 'mailcheck';
          }
          assert.equal(name, 'mailcheck');
          assert.equal(data.forceExperimentGroup, 'treatment');
          done();

          return 'treatment';
        });

        view.experiments = new ExperimentInterface({
          able: mockAble,
          metrics: metrics,
          notifier: notifier,
          user: user,
          window: windowMock
        });
        view.experiments.chooseExperiments();
        view.$('.email').val('testuser@gnail.com');
        view.onEmailBlur();
      });

      it('measures how successful our mailcheck suggestion is', function () {
        var windowMock = new WindowMock();
        windowMock.navigator.userAgent = 'mocha';
        var mockAble = new Able();
        sinon.stub(mockAble, 'choose', function (name) {
          if (name === 'chooseAbExperiment') {
            return 'mailcheck';
          }

          return 'treatment';
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
        fillOutSignUp('testuser@gnail.com', 'password', true);
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
            assert.isFalse(TestHelpers.isEventLogged(metrics, 'experiment.treatment.mailcheck.corrected'), 'is not useful');
            // user fixes value manually
            view.$('.email').val('testuser@gmail.com');

            return view.submit()
              .then(function () {
                assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.mailcheck.corrected'), 'is useful');
              });
          });
      });

      it('suggests emails via a tooltip', function (done) {
        view.$('.email').val('testuser@gnail.com');
        view.onEmailBlur();
        // wait for tooltip
        setTimeout(function () {
          assert.equal($('.tooltip-suggest').text(), 'Did you mean gmail.com?✕');
          // there is exactly 3 elements with tabindex in the page
          assert.equal($('[tabindex]').length, 3);
          // the first element with tabindex is the span containing the website name
          assert.equal($('.tooltip-suggest span:first').get(0), $('[tabindex="1"]').get(0));
          // the second element with tabindex is the span containing the dismiss button
          assert.equal($('.tooltip-suggest .dismiss').get(0), $('[tabindex="2"]').get(0));
          done();
        }, 50);
      });

      it('suggests emails via a tooltip in the automated browser', function (done) {
        createView();
        var container =  $('#container');
        var autoBrowser = sinon.stub(view.broker, 'isAutomatedBrowser', function () {
          return true;
        });
        var suggestEmail = sinon.stub(view, 'onEmailBlur', function () {
          autoBrowser.restore();
          suggestEmail.restore();
          done();
        });

        return view.render()
          .then(function () {
            view.afterVisible();
            container.html(view.el);
            container.find('input[type=password]').trigger('click');
          });
      });
    });

    describe('onPasswordBlur', function () {
      beforeEach(function () {
        sinon.spy(view, 'checkPasswordStrength');
      });

      it('calls checkPasswordStrength with provided password', function () {
        var password = 'somerandomvalue';
        view.$('.password').val(password);
        view.onPasswordBlur();
        assert.isTrue(view.checkPasswordStrength.calledWith(password));
      });
    });

  });
});

