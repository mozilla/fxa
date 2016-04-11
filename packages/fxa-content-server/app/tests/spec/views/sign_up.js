/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var Able = require('lib/able');
  var Account = require('models/account');
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
      describe('if signup is disabled', function () {
        beforeEach(function () {
          sinon.stub(view, 'isSignupDisabled', function () {
            return true;
          });
          sinon.spy(view, 'navigate');

          return view.render();
        });

        it('navigates to the signin screen', function () {
          assert.isTrue(view.navigate.calledWith('signin'));
        });
      });

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
        sandbox.spy(view, 'displayErrorUnsafe');
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
            assert.equal(notifier.trigger.callCount, 1);

            assert.equal(notifier.trigger.thisValues[0], notifier);
            var args = notifier.trigger.args[0];
            assert.lengthOf(args, 3);
            assert.equal(args[0], 'signup.submit');
          });

          it('does not display any errors', function () {
            assert.isFalse(view.displayError.called);
            assert.isFalse(view.displayErrorUnsafe.called);
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
              assert.equal(notifier.trigger.callCount, 1);

              assert.equal(notifier.trigger.thisValues[0], notifier);
              var args = notifier.trigger.args[0];
              assert.lengthOf(args, 3);
              assert.equal(args[0], 'signup.submit');
            });

            it('fails with the correct error', function () {
              assert.isTrue(AuthErrors.is(failed, 'AGE_REQUIRED'));
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
              assert.equal(notifier.trigger.callCount, 3);

              assert.equal(notifier.trigger.thisValues[0], notifier);
              var args = notifier.trigger.args[0];
              assert.lengthOf(args, 3);
              assert.equal(args[0], 'signup.submit');

              assert.equal(notifier.trigger.thisValues[1], notifier);
              args = notifier.trigger.args[1];
              assert.lengthOf(args, 3);
              assert.equal(args[0], 'signup.tooyoung');

              assert.equal(notifier.trigger.thisValues[1], notifier);
              args = notifier.trigger.args[2];
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

            it('does not display any errors', function () {
              assert.isFalse(view.displayError.called);
              assert.isFalse(view.displayErrorUnsafe.called);
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
            assert.equal(notifier.trigger.callCount, 1);

            assert.equal(notifier.trigger.thisValues[0], notifier);
            var args = notifier.trigger.args[0];
            assert.lengthOf(args, 3);
            assert.equal(args[0], 'signup.submit');
          });

          it('calls view.displayErrorUnsafe correctly', function () {
            assert.equal(view.displayErrorUnsafe.callCount, 1);
            var args = view.displayErrorUnsafe.args[0];
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
            assert.isFalse(view.displayErrorUnsafe.called);
          });

          it('calls view.logEvent correctly', function () {
            assert.equal(view.logEvent.callCount, 1);
            assert.equal(view.logEvent.thisValues[0], view);
            var args = view.logEvent.args[0];
            assert.lengthOf(args, 1);
            assert.equal(args[0], 'login.canceled');
          });
        });

        describe('signin fails with a locked out account', function () {
          beforeEach(function () {
            sinon.stub(view, 'signIn', function () {
              return p.reject(AuthErrors.toError('ACCOUNT_LOCKED'));
            });

            sinon.spy(view, 'notifyOfLockedAccount');

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

          it('notifies the user of the locked account', function () {
            assert.isTrue(view.notifyOfLockedAccount.called);
            var args = view.notifyOfLockedAccount.args[0];
            var account = args[0];
            assert.instanceOf(account, Account);
            var lockedAccountPassword = args[1];
            assert.equal(lockedAccountPassword, 'password');
          });
        });

        describe('signin failse with a reset accont', function () {
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
            assert.equal(notifier.trigger.callCount, 1);

            assert.equal(notifier.trigger.thisValues[0], notifier);
            var args = notifier.trigger.args[0];
            assert.lengthOf(args, 3);
            assert.equal(args[0], 'signup.submit');
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
            assert.isFalse(view.displayErrorUnsafe.called);
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
            assert.isFalse(view.displayErrorUnsafe.called);
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
            assert.isFalse(view.displayErrorUnsafe.called);
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

