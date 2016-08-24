/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var AuthErrors = require('lib/auth-errors');
  var Backbone = require('backbone');
  var Broker = require('models/auth_brokers/base');
  var chai = require('chai');
  var Constants = require('lib/constants');
  var VerificationReasons = require('lib/verification-reasons');
  var MarketingEmailErrors = require('lib/marketing-email-errors');
  var Metrics = require('lib/metrics');
  var Notifier = require('lib/channels/notifier');
  var p = require('lib/promise');
  var Relier = require('models/reliers/relier');
  var sinon = require('sinon');
  var TestHelpers = require('../../lib/helpers');
  var User = require('models/user');
  var View = require('views/complete_sign_up');
  var WindowMock = require('../../mocks/window');

  var assert = chai.assert;

  describe('views/complete_sign_up', function () {
    var account;
    var broker;
    var metrics;
    var notifier;
    var relier;
    var user;
    var verificationError;
    var view;
    var windowMock;

    var validCode = TestHelpers.createRandomHexString(Constants.CODE_LENGTH);
    var validUid = TestHelpers.createRandomHexString(Constants.UID_LENGTH);
    var validService = 'someValidService';
    var validReminder = 'validReminder';

    function testShowsExpiredScreen(search) {
      windowMock.location.search = search || '?code=' + validCode + '&uid=' + validUid;
      initView(account);
      return view.render()
        .then(function () {
          assert.ok(view.$('#fxa-verification-link-expired-header').length);
        });
    }

    function testShowsDamagedScreen(search) {
      windowMock.location.search = search || '?code=' + validCode + '&uid=' + validUid;
      initView(account);
      return view.render()
        .then(function () {
          assert.ok(view.$('#fxa-verification-link-damaged-header').length);
        });
    }

    function testEventLogged(eventName) {
      assert.isTrue(TestHelpers.isEventLogged(metrics, eventName));
    }

    function testErrorLogged(error) {
      var normalizedError = view._normalizeError(error);
      assert.isTrue(TestHelpers.isErrorLogged(metrics, normalizedError));
    }

    function initView (account) {
      view = new View({
        account: account,
        broker: broker,
        metrics: metrics,
        notifier: notifier,
        relier: relier,
        user: user,
        viewName: 'complete_sign_up',
        window: windowMock
      });
    }

    beforeEach(function () {
      broker = new Broker();
      metrics = new Metrics();
      notifier = new Notifier();
      relier = new Relier();
      user = new User({
        notifier: notifier
      });
      verificationError = null;
      windowMock = new WindowMock();

      account = user.initAccount({
        email: 'a@a.com',
        sessionToken: 'foo',
        uid: validUid
      });
      sinon.stub(account, 'verifySignUp', function () {
        if (verificationError) {
          return p.reject(verificationError);
        } else {
          return p();
        }
      });

      windowMock.location.search = '?code=' + validCode + '&uid=' + validUid;
      initView(account);
    });

    afterEach(function () {
      metrics.destroy();

      view.remove();
      view.destroy();

      view = windowMock = metrics = null;
    });

    describe('getAccount', function () {
      describe('if verifying in the same browser', function () {
        beforeEach(function () {
          sinon.stub(user, 'getAccountByUid', function () {
            return account;
          });

          // do not pass in an account, to simulate how the module
          // is initialized in the app. The account should be
          // fetched from the User module, which fetches it
          // from localStorage.
          initView(null);
        });

        it('uses the stored account', function () {
          assert.deepEqual(view.getAccount(), account);
        });
      });

      describe('if verifying in a second browser', function () {
        beforeEach(function () {
          sinon.stub(user, 'getAccountByUid', function () {
            // return the "default" account simulating the user verifying
            // in a second browser.
            return user.initAccount({});
          });

          // do not pass in an account, to simulate how the module
          // is initialized in the app. The account should be
          // fetched from the User module, which fetches it
          // from localStorage.
          initView(null);
        });

        it('returns an account with a `uid`', function () {
          assert.equal(view.getAccount().get('uid'), validUid);
        });
      });
    });

    describe('render', function () {
      describe('if uid is not available on the URL', function () {
        beforeEach(function () {
          return testShowsDamagedScreen('?code=' + validCode);
        });

        it('logs an error', function () {
          testErrorLogged(AuthErrors.toError('DAMAGED_VERIFICATION_LINK'));
        });

        it('does not attempt to verify the account', function () {
          assert.isFalse(account.verifySignUp.called);
        });
      });

      describe('if code is not available on the URL', function () {
        beforeEach(function () {
          return testShowsDamagedScreen('?uid=' + validUid);
        });

        it ('logs an error', function () {
          testErrorLogged(AuthErrors.toError('DAMAGED_VERIFICATION_LINK'));
        });

        it('does not attempt to verify the account', function () {
          assert.isFalse(account.verifySignUp.called);
        });
      });

      describe('if service is available in the URL', function () {
        beforeEach(function () {
          windowMock.location.search = '?code=' + validCode + '&uid=' + validUid + '&service=' + validService;
          relier = new Relier({
            window: windowMock
          });
          relier.fetch();
          initView(account);
          return view.render();
        });

        it('attempt to verify the account with service', function () {
          var args = account.verifySignUp.getCall(0).args;
          assert.isTrue(account.verifySignUp.called);
          assert.ok(args[0]);
          assert.deepEqual(args[1], {reminder: null, service: validService});
        });
      });

      describe('if reminder is available in the URL', function () {
        beforeEach(function () {
          windowMock.location.search = '?code=' + validCode + '&uid=' + validUid + '&reminder=' + validReminder;
          relier = new Relier({
            window: windowMock
          });
          relier.fetch();
          initView(account);
          return view.render();
        });

        it('attempt to verify the account with reminder', function () {
          var args = account.verifySignUp.getCall(0).args;
          assert.isTrue(account.verifySignUp.called);
          assert.ok(args[0]);
          assert.deepEqual(args[1], {reminder: validReminder, service: null});
        });
      });

      describe('if reminder and service is available in the URL', function () {
        beforeEach(function () {
          windowMock.location.search = '?code=' + validCode + '&uid=' + validUid
            + '&service=' + validService + '&reminder=' + validReminder;
          relier = new Relier({
            window: windowMock
          });
          relier.fetch();
          initView(account);
          return view.render();
        });

        it('attempt to verify the account with service and reminder', function () {
          var args = account.verifySignUp.getCall(0).args;
          assert.isTrue(account.verifySignUp.called);
          assert.ok(args[0]);
          assert.deepEqual(args[1], {reminder: validReminder, service: validService});
        });
      });

      describe('INVALID_PARAMETER error', function () {
        beforeEach(function () {
          verificationError = AuthErrors.toError('INVALID_PARAMETER', 'code');
          return testShowsDamagedScreen();
        });

        it('attempts to verify the account', function () {
          assert.isTrue(account.verifySignUp.calledWith(validCode));
        });

        it('logs the error', function () {
          testErrorLogged(AuthErrors.toError('DAMAGED_VERIFICATION_LINK'));
        });
      });

      describe('UNKNOWN_ACCOUNT error', function () {
        describe('with sessionToken available', function () {
          beforeEach(function () {
            verificationError = AuthErrors.toError('UNKNOWN_ACCOUNT', 'who are you?');
            sinon.stub(user, 'getAccountByEmail', function () {
              return user.initAccount({
                sessionToken: 'abc123'
              });
            });
            return testShowsExpiredScreen();
          });

          it('attempts to verify the account', function () {
            assert.isTrue(account.verifySignUp.calledWith(validCode));
          });

          it('displays the verification link expired screen', function () {
            testErrorLogged(AuthErrors.toError('UNKNOWN_ACCOUNT_VERIFICATION'));
          });

          it('displays a resend link', function () {
            assert.equal(view.$('#resend').length, 1);
          });
        });

        describe('without a sessionToken', function () {
          beforeEach(function () {
            verificationError = AuthErrors.toError('UNKNOWN_ACCOUNT', 'who are you?');
            sinon.stub(user, 'getAccountByEmail', function () {
              return user.initAccount();
            });
            return testShowsExpiredScreen();
          });

          it('attempts to verify the account', function () {
            assert.isTrue(account.verifySignUp.calledWith(validCode));
          });

          it('displays the link expired screen', function () {
            testErrorLogged(AuthErrors.toError('UNKNOWN_ACCOUNT_VERIFICATION'));
          });

          it('does not display a resend link', function () {
            assert.equal(view.$('#resend').length, 0);
          });
        });
      });

      describe('INVALID_VERIFICATION_CODE error', function () {
        beforeEach(function () {
          verificationError = AuthErrors.toError('INVALID_VERIFICATION_CODE', 'this isn\'t a lottery');
          return testShowsDamagedScreen();
        });

        it('attempts to verify the account', function () {
          assert.isTrue(account.verifySignUp.calledWith(validCode));
        });

        it('displays the verification link damaged screen', function () {
          testErrorLogged(AuthErrors.toError('DAMAGED_VERIFICATION_LINK'));
        });
      });

      describe('REUSED_SIGNIN_VERIFICATION_CODE error', function () {
        beforeEach(function () {
          verificationError = AuthErrors.toError('INVALID_VERIFICATION_CODE', 'this isn\'t a lottery');

          windowMock.location.search = '?code=' + validCode + '&uid=' + validUid;
          var model = new Backbone.Model();
          model.set('type', VerificationReasons.SIGN_IN);

          view = new View({
            account: account,
            broker: broker,
            metrics: metrics,
            model: model,
            notifier: notifier,
            relier: relier,
            user: user,
            window: windowMock
          });

          return view.render()
            .then(function () {
              assert.ok(view.$('#fxa-verification-link-expired-header').length);
            });
        });

        it('displays the verification link expired screen', function () {
          testErrorLogged(AuthErrors.toError('REUSED_SIGNIN_VERIFICATION_CODE'));
        });
      });

      describe('all other server errors', function () {
        beforeEach(function () {
          verificationError = AuthErrors.toError('UNEXPECTED_ERROR');
          return view.render();
        });

        it('attempts to verify the account', function () {
          assert.isTrue(account.verifySignUp.calledWith(validCode));
        });

        it('are logged', function () {
          testErrorLogged(verificationError);
        });

        it('are displayed', function () {
          assert.ok(view.$('#fxa-verification-error-header').length);
          assert.equal(view.$('.error').text(), 'Unexpected error');
        });
      });

      describe('successful verification', function () {
        describe('non-direct-access', function () {
          describe('broker does not halt', function () {
            beforeEach(function () {
              sinon.stub(relier, 'isDirectAccess', function () {
                return false;
              });

              sinon.stub(user, 'setAccount', function () {
                return p();
              });

              sinon.stub(account, 'isSignedIn', function () {
                return p(true);
              });

              sinon.stub(view, 'invokeBrokerMethod', function () {
                return p();
              });

              sinon.spy(view, 'navigate');
            });

            describe('for signup', function () {
              beforeEach(function () {
                view.model.set('type', VerificationReasons.SIGN_UP);
                return view.render();
              });

              it('verifies the code', function () {
                assert.isTrue(account.verifySignUp.calledWith(validCode));
              });

              it('notifies the broker', function () {
                assert.isTrue(view.invokeBrokerMethod.calledWith('afterCompleteSignUp'));
              });

              it('redirects to /signup_complete', function () {
                assert.isTrue(view.navigate.calledWith('signup_complete'));
              });

              it('logs success', function () {
                assert.isTrue(TestHelpers.isEventLogged(
                        metrics, 'complete_sign_up.verification.success'));
              });
            });

            describe('for signin', function () {
              beforeEach(function () {
                view.model.set('type', VerificationReasons.SIGN_IN);
                return view.render();
              });

              it('redirects to /signin_complete', function () {
                assert.isTrue(view.navigate.calledWith('signin_complete'));
              });
            });
          });
        });

        describe('direct access', function () {
          describe('sessionToken is valid', function () {
            describe('broker does not halt', function () {
              beforeEach(function () {
                sinon.stub(relier, 'isDirectAccess', function () {
                  return true;
                });

                sinon.stub(account, 'isSignedIn', function () {
                  return p(true);
                });

                sinon.stub(user, 'setAccount', function () {
                  return p();
                });

                sinon.spy(view, 'navigate');

                return view.render();
              });

              it('redirects to /settings', function () {
                assert.isTrue(view.navigate.calledWith('settings'));
              });
            });
          });

          describe('sessionToken is invalid', function () {
            describe('broker does not halt', function () {
              beforeEach(function () {
                sinon.stub(relier, 'isDirectAccess', function () {
                  return true;
                });

                sinon.stub(account, 'isSignedIn', function () {
                  return p(false);
                });

                sinon.stub(user, 'setAccount', function () {
                  return p();
                });

                sinon.spy(view, 'navigate');

                return view.render();
              });

              it('redirects to /signup_complete', function () {
                assert.isTrue(view.navigate.calledWith('signup_complete'));
              });
            });
          });
        });

        describe('email opt-in failures', function () {
          beforeEach(function () {
            verificationError = MarketingEmailErrors.toError('USAGE_ERROR');

            sinon.stub(account, 'isSignedIn', function () {
              return p(true);
            });

            sinon.stub(user, 'setAccount', function () {
              // do nothing
            });

            sinon.spy(view, 'logError');

            sinon.stub(view, 'invokeBrokerMethod', function () {
              return p();
            });

            sinon.stub(view, 'navigate', function () {
              return p();
            });

            return view.render();
          });

          it('do not prevent user verification from finishing', function () {
            assert.isTrue(view.invokeBrokerMethod.calledWith('afterCompleteSignUp', account));
          });

          it('are logged', function () {
            assert.isTrue(view.logError.calledWith(verificationError));
          });
        });
      });

    });

    describe('submit - attempt to resend the verification email', function () {
      var retrySignUpAccount;

      beforeEach(function () {
        account = user.initAccount({
          email: 'a@a.com',
          sessionToken: 'foo',
          uid: validUid
        });
      });

      describe('successful resend', function () {
        beforeEach(function () {
          retrySignUpAccount = user.initAccount({
            email: 'a@a.com',
            sessionToken: 'new token',
            uid: validUid
          });

          sinon.stub(account, 'verifySignUp', function () {
            return p();
          });

          sinon.stub(retrySignUpAccount, 'retrySignUp', function () {
            return p();
          });

          sinon.stub(user, 'getAccountByUid', function () {
            return account;
          });

          sinon.stub(user, 'getAccountByEmail', function () {
            return retrySignUpAccount;
          });

          windowMock.location.search = '?code=' + validCode + '&uid=' + validUid;
          initView();

          sinon.stub(view, 'getStringifiedResumeToken', function () {
            return 'resume token';
          });

          return view.render()
            .then(function () {
              return view.submit();
            });
        });

        it('logs the event', function () {
          testEventLogged('complete_sign_up.resend');
        });

        it('tells the account to retry signUp', function () {
          assert.isTrue(retrySignUpAccount.retrySignUp.calledWith(
            relier,
            {
              resume: 'resume token'
            }
          ));
        });

        it('shows the success message', function () {
          assert.isTrue(view.isSuccessVisible());
        });
      });

      describe('resend with invalid resend token', function () {
        beforeEach(function () {
          sinon.stub(account, 'retrySignUp', function () {
            return p.reject(AuthErrors.toError('INVALID_TOKEN'));
          });

          sinon.stub(user, 'getAccountByEmail', function () {
            return account;
          });

          sinon.spy(view, 'navigate');

          return view.submit();
        });

        it('sends the user to the /signup page', function () {
          assert.isTrue(view.navigate.calledWith('signup'));
        });
      });

      describe('other resend errors', function () {
        beforeEach(function () {
          sinon.stub(account, 'retrySignUp', function () {
            return p.reject(AuthErrors.toError('UNEXPECTED_ERROR'));
          });

          sinon.stub(user, 'getAccountByEmail', function () {
            return account;
          });
        });

        it('are re-thrown for display', function () {
          return view.submit()
            .then(assert.fail, function (err) {
              assert.isTrue(AuthErrors.is(err, 'UNEXPECTED_ERROR'));
            });
        });
      });
    });
  });
});
