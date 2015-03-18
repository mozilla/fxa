/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'underscore',
  'jquery',
  'moment',
  'sinon',
  'lib/promise',
  'views/sign_up',
  'views/coppa/coppa-date-picker',
  'lib/session',
  'lib/auth-errors',
  'lib/metrics',
  'lib/fxa-client',
  'lib/ephemeral-messages',
  'lib/mailcheck',
  'models/reliers/fx-desktop',
  'models/auth_brokers/base',
  'models/user',
  'models/form-prefill',
  '../../mocks/router',
  '../../lib/helpers'
],
function (chai, _, $, moment, sinon, p, View, Coppa, Session, AuthErrors, Metrics,
      FxaClient, EphemeralMessages, mailcheck, Relier, Broker, User, FormPrefill,
      RouterMock, TestHelpers) {
  var assert = chai.assert;

  describe('views/sign_up', function () {
    var view;
    var router;
    var email;
    var metrics;
    var fxaClient;
    var relier;
    var broker;
    var ephemeralMessages;
    var user;
    var formPrefill;
    var coppa;

    function fillOutSignUp(email, password, isCoppaValid) {
      view.$('[type=email]').val(email);
      view.$('[type=password]').val(password);

      sinon.stub(coppa, 'isValid', function () {
        return isCoppaValid;
      });

      view.enableSubmitIfValid();
    }

    function createView() {
      view = new View({
        router: router,
        metrics: metrics,
        fxaClient: fxaClient,
        user: user,
        relier: relier,
        broker: broker,
        ephemeralMessages: ephemeralMessages,
        screenName: 'signup',
        formPrefill: formPrefill,
        coppa: coppa
      });
    }

    beforeEach(function () {
      email = TestHelpers.createEmail();
      document.cookie = 'tooyoung=1; expires=Thu, 01-Jan-1970 00:00:01 GMT';
      router = new RouterMock();

      metrics = new Metrics();
      relier = new Relier();
      broker = new Broker();
      fxaClient = new FxaClient();
      ephemeralMessages = new EphemeralMessages();
      user = new User();
      formPrefill = new FormPrefill();
      coppa = new Coppa();

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

      view = router = metrics = null;
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

      it('checks `customize sync` checkbox for sync relier that forces it to true', function () {
        relier.set('service', 'sync');
        relier.set('customizeSync', true);

        return view.render()
            .then(function () {
              assert.isTrue(view.$('#customize-sync').is(':checked'));
            });
      });

      it('Shows serviceName', function () {
        var serviceName = 'my service name';
        relier.set('serviceName', serviceName);

        return view.render()
            .then(function () {
              assert.include(view.$('#fxa-signup-header').text(), serviceName);
            });
      });
    });

    describe('afterVisible', function () {
      it('shows a tooltip on the email element if ephemeralMessages.bouncedEmail is set', function () {
        sinon.spy(view, 'showValidationError');
        ephemeralMessages.set('bouncedEmail', 'testuser@testuser.com');


        return view.render()
          .then(function () {
            return view.afterVisible();
          })
          .then(function () {
            assert.isTrue(view.showValidationError.called);
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
      it('sends the user to `/confirm` if form filled out, not pre-verified, passes COPPA', function () {
        var password = 'password';

        fillOutSignUp(email, password, true);

        sinon.stub(view.fxaClient, 'signUp', function () {
          return p({
            verified: false,
            customizeSync: true
          });
        });

        sinon.spy(view, 'navigate');

        sinon.stub(coppa, 'isUserOldEnough', function () {
          return true;
        });

        return view.submit()
          .then(function () {
            assert.equal(view.navigate.args[0][0], 'confirm');
            assert.isTrue(view.navigate.args[0][1].data.account.get('customizeSync'));
            assert.isTrue(view.fxaClient.signUp.calledWith(
                email, password, relier));
            assert.isTrue(TestHelpers.isEventLogged(metrics,
                              'signup.success'));
          });
      });

      it('notifies the broker if form filled out, pre-verified, passes COPPA', function () {
        relier.set('preVerifyToken', 'preverifytoken');
        var password = 'password';
        fillOutSignUp(email, password, true);

        sinon.stub(view.fxaClient, 'signUp', function () {
          return p({
            verified: true,
            customizeSync: true
          });
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
              assert.isTrue(broker.afterSignIn.called);
            });
      });

      it('sends the user to /cannot_create_account if user does not pass COPPA', function () {

        fillOutSignUp(email, 'password', true);

        sinon.stub(coppa, 'isUserOldEnough', function () {
          return false;
        });

        return view.submit()
          .then(function () {
            assert.equal(router.page, 'cannot_create_account');
          });
      });

      it('sends user to cannot_create_account when visiting sign up if they have already been sent there', function () {
        fillOutSignUp(email, 'password', true);

        var revisitRouter = new RouterMock();
        var revisitView = new View({
          router: revisitRouter,
          relier: relier,
          fxaClient: fxaClient
        });

        sinon.stub(coppa, 'isUserOldEnough', function () {
          return false;
        });

        return view.submit()
            .then(function () {
              assert.equal(router.page, 'cannot_create_account');
            })
            .then(function () {
              // simulate user re-visiting the /signup page after being rejected
              return revisitView.render();
            }).then(function () {
              assert.equal(revisitRouter.page, 'cannot_create_account');
            });
      });

      it('shows message allowing the user to sign in if user enters existing verified account', function () {
        sinon.stub(view.fxaClient, 'signUp', function () {
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

        sinon.stub(view.fxaClient, 'signUp', function () {
          return p({});
        });

        sinon.stub(view.fxaClient, 'signIn', function () {
          return p({
            verified: false
          });
        });

        fillOutSignUp(email, 'incorrect', true);

        sinon.stub(coppa, 'isUserOldEnough', function () {
          return true;
        });

        return view.submit()
            .then(function () {
              assert.equal(router.page, 'confirm');
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
        sinon.stub(view.fxaClient, 'signUp', function () {
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

          sinon.stub(view.fxaClient, 'signUp', function () {
            return p({
              verified: true
            });
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
              assert.isTrue(view.fxaClient.signUp.calledWith(email, 'password', relier,
                { customizeSync: true }), 'fxa client params');
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
      it('suggests emails via a tooltip', function (done) {
        view.suggestEmail = function () {
          mailcheck(view.$('.email'), metrics, translator, 'mailcheck=1');
        };

        view.$('.email').val('testuser@gnail.com');
        view.suggestEmail();
        // wait for tooltip
        setTimeout(function () {
          assert.equal($('.tooltip-suggest').text(), 'Did you mean gmail.com?✕');
          done();
        }, 50);
      });
    });
  });
});


