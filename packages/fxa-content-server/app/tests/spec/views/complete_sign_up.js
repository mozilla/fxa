/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'sinon',
  'lib/promise',
  'views/complete_sign_up',
  'lib/auth-errors',
  'lib/metrics',
  'lib/constants',
  'lib/fxa-client',
  'lib/marketing-email-errors',
  'models/reliers/relier',
  'models/auth_brokers/base',
  'models/user',
  'models/notifications',
  '../../mocks/router',
  '../../mocks/window',
  '../../lib/helpers'
],
function (chai, sinon, p, View, AuthErrors, Metrics, Constants,
      FxaClient, MarketingEmailErrors, Relier, Broker, User, Notifications, RouterMock,
      WindowMock, TestHelpers) {
  'use strict';

  var assert = chai.assert;

  describe('views/complete_sign_up', function () {
    var view;
    var routerMock;
    var windowMock;
    var verificationError;
    var metrics;
    var fxaClient;
    var relier;
    var broker;
    var user;
    var notifications;
    var account;
    var validCode = TestHelpers.createRandomHexString(Constants.CODE_LENGTH);
    var validUid = TestHelpers.createRandomHexString(Constants.UID_LENGTH);

    function testShowsExpiredScreen(search) {
      windowMock.location.search = search || '?code=' + validCode + '&uid=' + validUid;
      initView();
      return view.render()
        .then(function () {
          assert.ok(view.$('#fxa-verification-link-expired-header').length);
        });
    }

    function testShowsDamagedScreen(search) {
      windowMock.location.search = search || '?code=' + validCode + '&uid=' + validUid;
      initView();
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
        router: routerMock,
        window: windowMock,
        metrics: metrics,
        user: user,
        fxaClient: fxaClient,
        relier: relier,
        broker: broker,
        screenName: 'complete_sign_up',
        account: account,
        notifications: notifications
      });
    }

    beforeEach(function () {
      routerMock = new RouterMock();
      windowMock = new WindowMock();
      metrics = new Metrics();
      relier = new Relier();
      broker = new Broker();
      fxaClient = new FxaClient();
      user = new User();
      notifications = new Notifications();

      verificationError = null;
      sinon.stub(fxaClient, 'verifyCode', function () {
        if (verificationError) {
          return p.reject(verificationError);
        } else {
          return p();
        }
      });

      account = user.initAccount({
        sessionToken: 'foo',
        email: 'a@a.com',
        uid: validUid,
        fxaClient: fxaClient
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

    describe('render', function () {
      it('shows an error if uid is not available on the URL', function () {
        return testShowsDamagedScreen('?code=' + validCode)
            .then(function () {
              testErrorLogged(AuthErrors.toError('DAMAGED_VERIFICATION_LINK'));
              assert.isFalse(view.fxaClient.verifyCode.called);
            });
      });

      it('shows an error if code is not available on the URL', function () {
        return testShowsDamagedScreen('?uid=' + validUid)
            .then(function () {
              testErrorLogged(AuthErrors.toError('DAMAGED_VERIFICATION_LINK'));
              assert.isFalse(view.fxaClient.verifyCode.called);
            });
      });

      it('INVALID_PARAMETER error displays the verification link damaged screen', function () {
        verificationError = AuthErrors.toError('INVALID_PARAMETER', 'code');
        return testShowsDamagedScreen()
            .then(function () {
              testErrorLogged(AuthErrors.toError('DAMAGED_VERIFICATION_LINK'));
              assert.isTrue(view.fxaClient.verifyCode.called);
            });
      });

      it('UNKNOWN_ACCOUNT error displays the verification link expired screen with resend link', function () {
        verificationError = AuthErrors.toError('UNKNOWN_ACCOUNT', 'who are you?');
        sinon.stub(user, 'getAccountByEmail', function () {
          return user.initAccount({
            sessionToken: 'abc123'
          });
        });
        return testShowsExpiredScreen()
            .then(function () {
              testErrorLogged(AuthErrors.toError('EXPIRED_VERIFICATION_LINK'));
              assert.equal(view.$('#resend').length, 1);
              assert.isTrue(view.fxaClient.verifyCode.called);
            });
      });

      it('UNKNOWN_ACCOUNT error displays the verification link damaged screen with no resend link', function () {
        verificationError = AuthErrors.toError('UNKNOWN_ACCOUNT', 'who are you?');
        sinon.stub(user, 'getAccountByEmail', function () {
          return user.initAccount();
        });
        return testShowsExpiredScreen()
            .then(function () {
              testErrorLogged(AuthErrors.toError('EXPIRED_VERIFICATION_LINK'));
              assert.equal(view.$('#resend').length, 0);
              assert.isTrue(view.fxaClient.verifyCode.called);
            });
      });

      it('INVALID_VERIFICATION_CODE error displays the verification link damaged screen', function () {
        verificationError = AuthErrors.toError('INVALID_VERIFICATION_CODE', 'this isn\'t a lottery');
        return testShowsDamagedScreen()
            .then(function () {
              assert.isTrue(view.fxaClient.verifyCode.called);
              testErrorLogged(AuthErrors.toError('DAMAGED_VERIFICATION_LINK'));
            });
      });

      it('all other server errors are logged and displayed', function () {
        verificationError = AuthErrors.toError('UNEXPECTED_ERROR');
        return view.render()
          .then(function () {
            assert.isTrue(view.fxaClient.verifyCode.calledWith(validUid, validCode));
            assert.ok(view.$('#fxa-verification-error-header').length);
            assert.equal(view.$('.error').text(), 'Unexpected error');
            testErrorLogged(verificationError);
          });
      });

      it('non-direct-access redirects to /signup_complete access if verification successful and broker does not halt', function () {
        sinon.spy(broker, 'afterCompleteSignUp');
        sinon.stub(relier, 'isDirectAccess', function () {
          return false;
        });

        return view.render()
          .then(function () {
            assert.isTrue(view.fxaClient.verifyCode.calledWith(validUid, validCode));
            assert.equal(routerMock.page, 'signup_complete');
            assert.isTrue(broker.afterCompleteSignUp.calledWith(account));
            assert.isTrue(TestHelpers.isEventLogged(
                    metrics, 'complete_sign_up.verification.success'));
          });
      });

      it('direct-access redirects to /settings if verification successful, sessionToken is still valid, and broker does not halt', function () {
        sinon.spy(broker, 'afterCompleteSignUp');
        sinon.stub(relier, 'isDirectAccess', function () {
          return true;
        });

        sinon.stub(account, 'isSignedIn', function () {
          return p(true);
        });

        return view.render()
          .then(function () {
            assert.equal(routerMock.page, 'settings');
          });
      });

      it('direct-access redirects to /signup_complete if verification successful, sessionToken is invalid, and broker does not halt', function () {
        sinon.spy(broker, 'afterCompleteSignUp');
        sinon.stub(relier, 'isDirectAccess', function () {
          return true;
        });

        sinon.stub(account, 'isSignedIn', function () {
          return p(false);
        });

        return view.render()
          .then(function () {
            assert.equal(routerMock.page, 'signup_complete');
          });
      });

      it('halts if the broker says halt', function () {
        sinon.stub(broker, 'afterCompleteSignUp', function () {
          return p({ halt: true });
        });

        return view.render()
          .then(function () {
            assert.isTrue(view.fxaClient.verifyCode.calledWith(validUid, validCode));
            assert.notEqual(routerMock.page, 'signup_complete');
            assert.isTrue(broker.afterCompleteSignUp.called);
          });
      });

      it('opts the user in to email marketing if needed', function () {
        account.set('needsOptedInToMarketingEmail', true);

        var mockEmailPrefs = {
          optIn: sinon.spy(function () {
            return p();
          })
        };

        sinon.stub(account, 'getMarketingEmailPrefs', function () {
          return mockEmailPrefs;
        });

        sinon.stub(user, 'setAccount', function () {
          // do nothing
        });

        return view.render()
          .then(function () {
            assert.isTrue(user.setAccount.calledWith(account));
            assert.isTrue(account.getMarketingEmailPrefs.called);
            assert.isTrue(mockEmailPrefs.optIn.called);
          });
      });

      it('does not stop the verification if email optin failed', function () {
        account.set('needsOptedInToMarketingEmail', true);

        var basketError = MarketingEmailErrors.toError('USAGE_ERROR');
        var mockEmailPrefs = {
          optIn: sinon.spy(function () {
            return p.reject(basketError);
          })
        };

        sinon.stub(account, 'getMarketingEmailPrefs', function () {
          return mockEmailPrefs;
        });

        sinon.stub(user, 'setAccount', function () {
          // do nothing
        });

        sinon.spy(view, 'logError');

        return view.render()
          .then(function () {
            assert.isTrue(user.setAccount.calledWith(account));
            assert.isTrue(account.getMarketingEmailPrefs.called);
            assert.isTrue(mockEmailPrefs.optIn.called);
            assert.isTrue(view.logError.calledWith(basketError));
          });
      });
    });

    describe('submit - attempt to resend the verification email', function () {
      beforeEach(function () {
        account = user.initAccount({
          sessionToken: 'foo',
          email: 'a@a.com',
          uid: validUid
        });
      });

      it('displays a success message on success', function () {
        sinon.stub(view.fxaClient, 'signUpResend', function () {
          return p();
        });
        windowMock.location.search = '?code=' + validCode + '&uid=' + validUid;

        sinon.stub(user, 'getAccountByUid', function () {
          return account;
        });

        sinon.stub(user, 'getAccountByEmail', function () {
          return user.initAccount({
            sessionToken: 'new token',
            email: 'a@a.com',
            uid: validUid
          });
        });

        initView();

        sinon.stub(view, 'getStringifiedResumeToken', function () {
          return 'resume token';
        });

        return view.render()
          .then(function () {
            return view.submit();
          })
          .then(function () {
            testEventLogged('complete_sign_up.resend');
            assert.isTrue(user.getAccountByUid.calledWith(validUid), 'getAccountByUid');
            assert.isTrue(user.getAccountByEmail.calledWith('a@a.com'), 'getAccountByEmail');

            assert.isTrue(view.fxaClient.signUpResend.calledWith(
              relier,
              'new token',
              {
                resume: 'resume token'
              }
            ), 'signUpResend');
            assert.isTrue(view.isSuccessVisible(), 'success');
          });
      });

      it('sends the user to the signup page if the resend token is invalid', function () {
        sinon.stub(view.fxaClient, 'signUpResend', function () {
          return p.reject(AuthErrors.toError('INVALID_TOKEN'));
        });

        return view.submit()
          .then(function () {
            assert.equal(routerMock.page, 'signup');
          });
      });

      it('throws other errors for display', function () {
        sinon.stub(view.fxaClient, 'signUpResend', function () {
          return p.reject(AuthErrors.toError('UNEXPECTED_ERROR'));
        });

        return view.submit()
          .then(assert.fail, function (err) {
            assert.isTrue(AuthErrors.is(err, 'UNEXPECTED_ERROR'));
          });
      });
    });
  });
});
