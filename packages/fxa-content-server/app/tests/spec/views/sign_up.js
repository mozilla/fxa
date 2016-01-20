/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var Able = require('lib/able');
  var AuthErrors = require('lib/auth-errors');
  var Backbone = require('backbone');
  var Broker = require('models/auth_brokers/base');
  var chai = require('chai');
  var CoppaAgeInput = require('views/coppa/coppa-age-input');
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
    var formPrefill;
    var fxaClient;
    var metrics;
    var model;
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
        formPrefill: formPrefill,
        fxaClient: fxaClient,
        metrics: metrics,
        model: model,
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
      formPrefill = new FormPrefill();
      fxaClient = new FxaClient();
      metrics = new Metrics();
      model = new Backbone.Model();
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
    });

    describe('migration', function () {
      it('does not display migration message if no migration', function () {
        return view.render()
          .then(function () {
            assert.lengthOf(view.$('.info.nudge'), 0);
          });
      });

      it('displays migration message if isSyncMigration returns true', function () {
        sinon.stub(view, 'isSyncMigration', function () {
          return true;
        });

        return view.render()
          .then(function () {
            assert.equal(view.$('.info.nudge').html(), 'Migrate your sync data by creating a new Firefox&nbsp;Account.');
            view.isSyncMigration.restore();
          });
      });

      it('does not display migration message if isSyncMigration returns false', function () {
        sinon.stub(view, 'isSyncMigration', function () {
          return false;
        });

        return view.render()
          .then(function () {
            assert.lengthOf(view.$('.info.nudge'), 0);
            view.isSyncMigration.restore();
          });
      });

      it('displays migration message if isAmoMigration returns true', function () {
        sinon.stub(view, 'isAmoMigration', function () {
          return true;
        });

        return view.render()
          .then(function () {
            assert.equal(view.$('.info.nudge').html(), 'Have an account with a different email? <a href="/signin">Sign in</a>');
            view.isAmoMigration.restore();
          });
      });

      it('does not display migration message if isAmoMigration returns false', function () {
        sinon.stub(view, 'isAmoMigration', function () {
          return false;
        });

        return view.render()
          .then(function () {
            assert.lengthOf(view.$('.info.nudge'), 0);
            view.isAmoMigration.restore();
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
        model.set('bouncedEmail', 'testuser@testuser.com');

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

      it('returns true if COPPA view returns false', function () {
        fillOutSignUp(email, 'password', false);
        assert.isTrue(view.isValid());
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
        model.set('bouncedEmail', 'testuser@testuser.com');

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

      it('shows an error if the user provides an email that ends with @firefox', function () {
        fillOutSignUp('user@firefox', 'password', true);

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

      it('does not call coppa\'s showValidationErrors if no other errors', function () {
        fillOutSignUp('testuser@testuser.com', 'password', true);

        sinon.spy(coppa, 'showValidationError');
        view.showValidationErrors();

        assert.isFalse(coppa.showValidationError.called);
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
            assert.isTrue(view.navigate.args[0][1].account.get('customizeSync'));
            assert.isTrue(user.signUpAccount.calledWith(account, password, relier));
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

      describe('COPPA is not valid', function () {
        var failed;

        beforeEach(function () {
          fillOutSignUp(email, 'password', true);

          sinon.stub(coppa, 'isUserOldEnough', function () {
            return false;
          });
          sinon.stub(view, 'getStringifiedResumeToken', function () {
            return 'resume token';
          });
          sinon.stub(user, 'signUpAccount', function (account) {
            return p(account);
          });
          sinon.stub(view, 'invokeBrokerMethod', function () {
            return p();
          });
          sinon.stub(view, 'onSignUpSuccess', function () {
            return p();
          });
          sinon.stub(view, 'onSignInSuccess', function () {
            return p();
          });
          failed = false;
        });

        afterEach(function () {
          coppa.isUserOldEnough.restore();
          view.getStringifiedResumeToken.restore();
          user.signUpAccount.restore();
          view.invokeBrokerMethod.restore();
          view.onSignUpSuccess.restore();
          view.onSignInSuccess.restore();
        });

        describe('sign-in succeeds', function () {
          beforeEach(function () {
            sinon.stub(user, 'signInAccount', function () {
              return p();
            });
            return view.submit()
              .fail(function (err) {
                failed = err;
              });
          });

          afterEach(function () {
            user.signInAccount.restore();
          });

          it('does not call user.signUpAccount', function () {
            assert.equal(user.signUpAccount.callCount, 0);
          });

          it('calls user.signInAccount correctly', function () {
            assert.equal(user.signInAccount.callCount, 1);
            assert.equal(user.signInAccount.thisValues[0], user);
            var args = user.signInAccount.args[0];
            assert.lengthOf(args, 4);
            assert.isObject(args[0]);
            assert.equal(args[1], 'password');
            assert.equal(args[2], view.relier);
            assert.isObject(args[3]);
            assert.equal(args[3].resume, 'resume token');
          });

          it('calls view.invokeBrokerMethod correctly', function () {
            assert.equal(view.invokeBrokerMethod.callCount, 1);
            assert.equal(view.invokeBrokerMethod.thisValues[0], view);
            var args = view.invokeBrokerMethod.args[0];
            assert.lengthOf(args, 2);
            assert.equal(args[0], 'beforeSignIn');
          });

          it('does not call view.onSignUpSuccess', function () {
            assert.equal(view.onSignUpSuccess.callCount, 0);
          });

          it('calls view.onSignInSuccess correctly', function () {
            assert.equal(view.onSignInSuccess.callCount, 1);
            assert.equal(view.onSignInSuccess.thisValues[0], view);
            var args = view.onSignInSuccess.args[0];
            assert.lengthOf(args, 2);
            assert.equal(args[0], user.signInAccount.args[0][0]);
            assert.isUndefined(args[1]);
          });

          it('does not fail', function () {
            assert.isFalse(failed);
          });
        });

        describe('sign-in fails with UNKNOWN_ACCOUNT', function () {
          beforeEach(function () {
            sinon.stub(user, 'signInAccount', function () {
              return p.reject(AuthErrors.toError('UNKNOWN_ACCOUNT'));
            });
            sinon.spy(notifier, 'trigger');
            sinon.spy(view, 'navigate');
            sinon.spy(view, 'displayError');
          });

          afterEach(function () {
            user.signInAccount.restore();
            notifier.trigger.reset();
            view.navigate.reset();
            view.displayError.reset();
          });

          describe('COPPA has no value', function () {
            beforeEach(function () {
              sinon.stub(coppa, 'hasValue', function () {
                return false;
              });
              return view.submit()
                .fail(function (err) {
                  failed = err;
                });
            });

            afterEach(function () {
              coppa.hasValue.restore();
            });

            it('does not call user.signUpAccount', function () {
              assert.equal(user.signUpAccount.callCount, 0);
            });

            it('calls user.signInAccount', function () {
              assert.equal(user.signInAccount.callCount, 1);
            });

            it('calls view.invokeBrokerMethod', function () {
              assert.equal(view.invokeBrokerMethod.callCount, 1);
            });

            it('does not call view.onSignUpSuccess', function () {
              assert.equal(view.onSignUpSuccess.callCount, 0);
            });

            it('does not call view.onSignInSuccess', function () {
              assert.equal(view.onSignInSuccess.callCount, 0);
            });

            it('does not call notifier.trigger', function () {
              assert.equal(notifier.trigger.callCount, 0);
            });

            it('does not call view.navigate', function () {
              assert.equal(view.navigate.callCount, 0);
            });

            it('calls view.displayError correctly', function () {
              assert.equal(view.displayError.callCount, 1);
              assert.equal(view.displayError.thisValues[0], view);
              var args = view.displayError.args[0];
              assert.lengthOf(args, 1);
              assert.equal(args[0], 'You must enter your age to sign up');
            });

            it('does not fail', function () {
              assert.isFalse(failed);
            });
          });

          describe('COPPA is too young', function () {
            beforeEach(function () {
              sinon.stub(coppa, 'hasValue', function () {
                return true;
              });
              return view.submit()
                .fail(function (err) {
                  failed = err;
                });
            });

            afterEach(function () {
              coppa.hasValue.restore();
            });

            it('does not call user.signUpAccount', function () {
              assert.equal(user.signUpAccount.callCount, 0);
            });

            it('calls user.signInAccount', function () {
              assert.equal(user.signInAccount.callCount, 1);
            });

            it('calls view.invokeBrokerMethod', function () {
              assert.equal(view.invokeBrokerMethod.callCount, 1);
            });

            it('does not call view.onSignUpSuccess', function () {
              assert.equal(view.onSignUpSuccess.callCount, 0);
            });

            it('does not call view.onSignInSuccess', function () {
              assert.equal(view.onSignInSuccess.callCount, 0);
            });

            it('calls notifier.trigger correctly', function () {
              assert.equal(notifier.trigger.callCount, 2);

              assert.equal(notifier.trigger.thisValues[0], notifier);
              var args = notifier.trigger.args[0];
              assert.lengthOf(args, 3);
              assert.equal(args[0], 'signup.tooyoung');

              assert.equal(notifier.trigger.thisValues[1], notifier);
              args = notifier.trigger.args[1];
              assert.lengthOf(args, 3);
              assert.equal(args[0], 'navigate');
            });

            it('calls view.navigate correctly', function () {
              assert.equal(view.navigate.callCount, 1);
              assert.equal(view.navigate.thisValues[0], view);
              var args = view.navigate.args[0];
              assert.lengthOf(args, 1);
              assert.equal(args[0], 'cannot_create_account');
            });

            it('does not call view.displayError', function () {
              assert.equal(view.displayError.callCount, 0);
            });

            it('does not fail', function () {
              assert.isFalse(failed);
            });
          });
        });

        describe('sign-in fails with INCORRECT_PASSWORD', function () {
          var error;

          beforeEach(function () {
            error = AuthErrors.toError('INCORRECT_PASSWORD');
            sinon.stub(user, 'signInAccount', function () {
              return p.reject(error);
            });
            sinon.spy(notifier, 'trigger');
            sinon.spy(view, 'navigate');
            sinon.spy(view, 'displayError');
            return view.submit()
              .fail(function (err) {
                failed = err;
              });
          });

          afterEach(function () {
            user.signInAccount.restore();
            notifier.trigger.reset();
            view.navigate.reset();
            view.displayError.reset();
          });

          it('does not call user.signUpAccount', function () {
            assert.equal(user.signUpAccount.callCount, 0);
          });

          it('calls user.signInAccount', function () {
            assert.equal(user.signInAccount.callCount, 1);
          });

          it('calls view.invokeBrokerMethod', function () {
            assert.equal(view.invokeBrokerMethod.callCount, 1);
          });

          it('does not call view.onSignUpSuccess', function () {
            assert.equal(view.onSignUpSuccess.callCount, 0);
          });

          it('does not call view.onSignInSuccess', function () {
            assert.equal(view.onSignInSuccess.callCount, 0);
          });

          it('calls notifier.trigger correctly', function () {
            assert.equal(notifier.trigger.callCount, 1);
            assert.equal(notifier.trigger.thisValues[0], notifier);
            var args = notifier.trigger.args[0];
            assert.lengthOf(args, 3);
            assert.equal(args[0], 'navigate');
          });

          it('calls view.navigate correctly', function () {
            assert.equal(view.navigate.callCount, 1);
            assert.equal(view.navigate.thisValues[0], view);
            var args = view.navigate.args[0];
            assert.lengthOf(args, 2);
            assert.equal(args[0], '/signin');
            assert.isObject(args[1]);
            assert.lengthOf(Object.keys(args[1]), 1);
            assert.equal(args[1].error, error);
          });

          it('does not call view.displayError', function () {
            assert.equal(view.displayError.callCount, 0);
          });

          it('does not fail', function () {
            assert.isFalse(failed);
          });
        });

        describe('sign-in fails with some other error', function () {
          beforeEach(function () {
            sinon.stub(user, 'signInAccount', function () {
              return p.reject(AuthErrors.toError('UNEXPECTED_ERROR'));
            });
            sinon.spy(notifier, 'trigger');
            sinon.spy(view, 'navigate');
            sinon.spy(view, 'displayError');
            return view.submit()
              .fail(function (err) {
                failed = err;
              });
          });

          afterEach(function () {
            user.signInAccount.restore();
            notifier.trigger.reset();
            view.navigate.reset();
            view.displayError.reset();
          });

          it('does not call user.signUpAccount', function () {
            assert.equal(user.signUpAccount.callCount, 0);
          });

          it('calls user.signInAccount', function () {
            assert.equal(user.signInAccount.callCount, 1);
          });

          it('calls view.invokeBrokerMethod', function () {
            assert.equal(view.invokeBrokerMethod.callCount, 1);
          });

          it('does not call view.onSignUpSuccess', function () {
            assert.equal(view.onSignUpSuccess.callCount, 0);
          });

          it('does not call view.onSignInSuccess', function () {
            assert.equal(view.onSignInSuccess.callCount, 0);
          });

          it('does not call notifier.trigger', function () {
            assert.equal(notifier.trigger.callCount, 0);
          });

          it('does not call view.navigate', function () {
            assert.equal(view.navigate.callCount, 0);
          });

          it('does not call view.displayError', function () {
            assert.equal(view.displayError.callCount, 0);
          });

          it('fails correctly', function () {
            assert.isTrue(AuthErrors.is(failed, 'UNEXPECTED_ERROR'));
          });
        });
      });

      describe('COPPA is valid', function () {
        var account;
        var failed;

        beforeEach(function () {
          fillOutSignUp(email, 'password', true);

          sinon.stub(coppa, 'isUserOldEnough', function () {
            return true;
          });
          sinon.stub(view, 'getStringifiedResumeToken', function () {
            return 'resume token';
          });
          sinon.stub(user, 'signInAccount', function (a) {
            account = a;
            return p(account);
          });
          sinon.stub(view, 'invokeBrokerMethod', function () {
            return p();
          });
          sinon.stub(view, 'onSignInSuccess', function () {
            return p();
          });
          sinon.stub(view, 'onSignUpSuccess', function () {
            return p();
          });
          sinon.spy(view, 'displayErrorUnsafe');
          sinon.spy(view, 'logEvent');
          sinon.spy(view, 'navigate');
          failed = false;
        });

        afterEach(function () {
          coppa.isUserOldEnough.restore();
          view.getStringifiedResumeToken.restore();
          user.signInAccount.restore();
          view.invokeBrokerMethod.restore();
          view.onSignInSuccess.restore();
          view.onSignUpSuccess.restore();
          view.displayErrorUnsafe.reset();
          view.logEvent.reset();
          view.navigate.reset();
        });

        describe('sign-up succeeds', function () {
          beforeEach(function () {
            sinon.stub(user, 'signUpAccount', function () {
              return p();
            });
            return view.submit()
              .fail(function (err) {
                failed = err;
              });
          });

          afterEach(function () {
            user.signUpAccount.restore();
          });

          it('does not call user.signInAccount', function () {
            assert.equal(user.signInAccount.callCount, 0);
          });

          it('calls user.signUpAccount correctly', function () {
            assert.equal(user.signUpAccount.callCount, 1);
            assert.equal(user.signUpAccount.thisValues[0], user);
            var args = user.signUpAccount.args[0];
            assert.lengthOf(args, 4);
            assert.isObject(args[0]);
            assert.equal(args[1], 'password');
            assert.equal(args[2], view.relier);
            assert.isObject(args[3]);
            assert.equal(args[3].resume, 'resume token');
          });

          it('does not call view.onSignInSuccess', function () {
            assert.equal(view.onSignInSuccess.callCount, 0);
          });

          it('calls view.invokeBrokerMethod correctly', function () {
            assert.equal(view.invokeBrokerMethod.callCount, 2);

            assert.equal(view.invokeBrokerMethod.thisValues[0], view);
            var args = view.invokeBrokerMethod.args[0];
            assert.lengthOf(args, 2);
            assert.equal(args[0], 'beforeSignIn');

            assert.equal(view.invokeBrokerMethod.thisValues[1], view);
            args = view.invokeBrokerMethod.args[1];
            assert.lengthOf(args, 2);
            assert.equal(args[0], 'afterSignUp');
            assert.equal(args[1], account);
          });

          it('calls view.onSignUpSuccess correctly', function () {
            assert.equal(view.onSignUpSuccess.callCount, 1);
            assert.equal(view.onSignUpSuccess.thisValues[0], view);
            var args = view.onSignUpSuccess.args[0];
            assert.lengthOf(args, 2);
            assert.equal(args[0], user.signUpAccount.args[0][0]);
            assert.isUndefined(args[1]);
          });

          it('does not call view.displayErrorUnsafe', function () {
            assert.equal(view.displayErrorUnsafe.callCount, 0);
          });

          it('does not call view.logEvent', function () {
            assert.equal(view.logEvent.callCount, 0);
          });

          it('does not fail', function () {
            assert.isFalse(failed);
          });
        });

        describe('sign-up fails with INCORRECT_PASSWORD', function () {
          var error;

          beforeEach(function () {
            error = AuthErrors.toError('INCORRECT_PASSWORD');
            sinon.stub(user, 'signUpAccount', function () {
              return p.reject(error);
            });
            return view.submit()
              .fail(function (err) {
                failed = err;
              });
          });

          afterEach(function () {
            user.signUpAccount.restore();
          });

          it('does not call user.signInAccount', function () {
            assert.equal(user.signInAccount.callCount, 0);
          });

          it('calls user.signUpAccount', function () {
            assert.equal(user.signUpAccount.callCount, 1);
          });

          it('calls view.invokeBrokerMethod', function () {
            assert.equal(view.invokeBrokerMethod.callCount, 1);
          });

          it('does not call view.onSignInSuccess', function () {
            assert.equal(view.onSignInSuccess.callCount, 0);
          });

          it('does not call view.onSignUpSuccess', function () {
            assert.equal(view.onSignUpSuccess.callCount, 0);
          });

          it('does not call view.displayErrorUnsafe', function () {
            assert.equal(view.displayErrorUnsafe.callCount, 0);
          });

          it('calls view.navigate correctly', function () {
            assert.equal(view.navigate.callCount, 1);
            assert.equal(view.navigate.thisValues[0], view);
            var args = view.navigate.args[0];
            assert.lengthOf(args, 2);
            assert.equal(args[0], '/signin');
            assert.isObject(args[1]);
            assert.lengthOf(Object.keys(args[1]), 1);
            assert.equal(args[1].error, error);
          });

          it('does not call view.logEvent', function () {
            assert.equal(view.logEvent.callCount, 0);
          });

          it('does not fail', function () {
            assert.isFalse(failed);
          });
        });

        describe('sign-up fails with USER_CANCELED_LOGIN', function () {
          beforeEach(function () {
            sinon.stub(user, 'signUpAccount', function () {
              return p.reject(AuthErrors.toError('USER_CANCELED_LOGIN'));
            });
            return view.submit()
              .fail(function (err) {
                failed = err;
              });
          });

          afterEach(function () {
            user.signUpAccount.restore();
          });

          it('does not call user.signInAccount', function () {
            assert.equal(user.signInAccount.callCount, 0);
          });

          it('calls user.signUpAccount', function () {
            assert.equal(user.signUpAccount.callCount, 1);
          });

          it('calls view.invokeBrokerMethod', function () {
            assert.equal(view.invokeBrokerMethod.callCount, 1);
          });

          it('does not call view.onSignInSuccess', function () {
            assert.equal(view.onSignInSuccess.callCount, 0);
          });

          it('does not call view.onSignUpSuccess', function () {
            assert.equal(view.onSignUpSuccess.callCount, 0);
          });

          it('does not call view.displayErrorUnsafe', function () {
            assert.equal(view.displayErrorUnsafe.callCount, 0);
          });

          it('calls view.logEvent correctly', function () {
            assert.equal(view.logEvent.callCount, 1);
            assert.equal(view.logEvent.thisValues[0], view);
            var args = view.logEvent.args[0];
            assert.lengthOf(args, 1);
            assert.equal(args[0], 'login.canceled');
          });

          it('does not fail', function () {
            assert.isFalse(failed);
          });
        });

        describe('sign-up fails with some other error', function () {
          beforeEach(function () {
            sinon.stub(user, 'signUpAccount', function () {
              return p.reject(AuthErrors.toError('UNEXPECTED_ERROR'));
            });
            return view.submit()
              .fail(function (err) {
                failed = err;
              });
          });

          afterEach(function () {
            user.signUpAccount.restore();
          });

          it('does not call user.signInAccount', function () {
            assert.equal(user.signInAccount.callCount, 0);
          });

          it('calls user.signUpAccount', function () {
            assert.equal(user.signUpAccount.callCount, 1);
          });

          it('calls view.invokeBrokerMethod', function () {
            assert.equal(view.invokeBrokerMethod.callCount, 1);
          });

          it('does not call view.onSignInSuccess', function () {
            assert.equal(view.onSignInSuccess.callCount, 0);
          });

          it('does not call view.onSignUpSuccess', function () {
            assert.equal(view.onSignUpSuccess.callCount, 0);
          });

          it('does not call view.displayErrorUnsafe', function () {
            assert.equal(view.displayErrorUnsafe.callCount, 0);
          });

          it('does not call view.logEvent', function () {
            assert.equal(view.logEvent.callCount, 0);
          });

          it('fails correctly', function () {
            assert.isTrue(AuthErrors.is(failed, 'UNEXPECTED_ERROR'));
          });
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

        sinon.stub(user, 'signInAccount', function () {
          throw AuthErrors.toError('UNKNOWN_ACCOUNT');
        });
        sinon.stub(coppa, 'isUserOldEnough', function () {
          return false;
        });
        sinon.stub(coppa, 'hasValue', function () {
          return true;
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
  });
});

