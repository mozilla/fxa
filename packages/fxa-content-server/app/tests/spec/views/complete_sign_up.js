/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'sinon',
  'lib/promise',
  'views/complete_sign_up',
  'lib/auth-errors',
  'lib/metrics',
  'lib/constants',
  'lib/fxa-client',
  'models/reliers/relier',
  'models/auth_brokers/base',
  'models/user',
  '../../mocks/router',
  '../../mocks/window',
  '../../lib/helpers'
],
function (chai, sinon, p, View, AuthErrors, Metrics, Constants,
      FxaClient, Relier, Broker, User, RouterMock, WindowMock, TestHelpers) {
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

    function initView () {
      view = new View({
        router: routerMock,
        window: windowMock,
        metrics: metrics,
        user: user,
        fxaClient: fxaClient,
        relier: relier,
        broker: broker,
        screenName: 'verify_email'
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
        uid: validUid
      });

      initView();
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
              testEventLogged('complete_sign_up.link_damaged');
            })
            .then(function () {
              assert.isFalse(view.fxaClient.verifyCode.called);
            });
      });

      it('shows an error if code is not available on the URL', function () {
        return testShowsDamagedScreen('?uid=' + validUid)
            .then(function () {
              testEventLogged('complete_sign_up.link_damaged');
            })
            .then(function () {
              assert.isFalse(view.fxaClient.verifyCode.called);
            });
      });

      it('INVALID_PARAMETER error displays the verification link damaged screen', function () {
        verificationError = AuthErrors.toError('INVALID_PARAMETER', 'code');
        return testShowsDamagedScreen()
            .then(function () {
              testEventLogged('complete_sign_up.link_damaged');
            })
            .then(function () {
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
              testEventLogged('complete_sign_up.link_expired');
            })
            .then(function () {
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
              testEventLogged('complete_sign_up.link_expired');
            })
            .then(function () {
              assert.equal(view.$('#resend').length, 0);
              assert.isTrue(view.fxaClient.verifyCode.called);
            });
      });

      it('INVALID_VERIFICATION_CODE error displays the verification link damaged screen', function () {
        verificationError = AuthErrors.toError('INVALID_VERIFICATION_CODE', 'this isn\'t a lottery');
        return testShowsDamagedScreen()
            .then(function () {
              assert.isTrue(view.fxaClient.verifyCode.called);
            });
      });

      it('all other server errors are displayed', function () {
        windowMock.location.search = '?code=' + validCode + '&uid=' + validUid;
        initView();

        verificationError = new Error('verification error');
        return view.render()
            .then(function () {
              assert.isTrue(view.fxaClient.verifyCode.calledWith(validUid, validCode));
              assert.ok(view.$('#fxa-verification-error-header').length);
              assert.equal(view.$('.error').text(), 'verification error');
            });
      });

      it('redirects to /signup_complete if verification successful and broker does not halt', function () {
        windowMock.location.search = '?code=' + validCode + '&uid=' + validUid;
        sinon.spy(broker, 'afterCompleteSignUp');
        initView();
        sinon.stub(view, 'getAccount', function () {
          return account;
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

      it('halts if the broker says halt', function () {
        windowMock.location.search = '?code=' + validCode + '&uid=' + validUid;
        sinon.stub(broker, 'afterCompleteSignUp', function () {
          return p({ halt: true });
        });

        initView();
        return view.render()
            .then(function () {
              assert.isTrue(view.fxaClient.verifyCode.calledWith(validUid, validCode));
              assert.notEqual(routerMock.page, 'signup_complete');
              assert.isTrue(broker.afterCompleteSignUp.called);
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
        return view.render()
          .then(function () {
            return view.submit();
          })
          .then(function () {
            testEventLogged('complete_sign_up.resend');
          })
          .then(function () {
            assert.isTrue(user.getAccountByUid.calledWith(validUid), 'getAccountByUid');
            assert.isTrue(user.getAccountByEmail.calledWith('a@a.com'), 'getAccountByEmail');

            assert.isTrue(view.fxaClient.signUpResend.calledWith(relier, 'new token'), 'signUpResend');
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



