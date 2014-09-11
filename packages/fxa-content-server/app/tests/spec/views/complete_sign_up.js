/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'lib/promise',
  'views/complete_sign_up',
  'lib/auth-errors',
  'lib/metrics',
  'lib/constants',
  'lib/fxa-client',
  'models/reliers/relier',
  '../../mocks/router',
  '../../mocks/window',
  '../../lib/helpers'
],
function (chai, p, View, AuthErrors, Metrics, Constants, FxaClient, Relier, RouterMock, WindowMock, TestHelpers) {
  var assert = chai.assert;

  describe('views/complete_sign_up', function () {
    var view;
    var routerMock;
    var windowMock;
    var verificationError;
    var metrics;
    var fxaClient;
    var relier;
    var validCode = TestHelpers.createRandomHexString(Constants.CODE_LENGTH);
    var validUid = TestHelpers.createRandomHexString(Constants.UID_LENGTH);

    function testShowsExpiredScreen(search) {
      windowMock.location.search = search || '?code=' + validCode + '&uid=' + validUid;
      return view.render()
          .then(function () {
            assert.ok(view.$('#fxa-verification-link-expired-header').length);
          });
    }

    function testShowsDamagedScreen(search) {
      windowMock.location.search = search || '?code=' + validCode + '&uid=' + validUid;
      return view.render()
          .then(function () {
            assert.ok(view.$('#fxa-verification-link-damaged-header').length);
          });
    }

    function testEventLogged(eventName) {
      assert.isTrue(TestHelpers.isEventLogged(metrics, eventName));
    }

    beforeEach(function () {
      routerMock = new RouterMock();
      windowMock = new WindowMock();
      metrics = new Metrics();
      relier = new Relier();
      fxaClient = new FxaClient({
        relier: relier
      });

      view = new View({
        router: routerMock,
        window: windowMock,
        metrics: metrics,
        fxaClient: fxaClient,
        relier: relier
      });

      verificationError = null;
      view.fxaClient.verifyCode = function () {
        view.fxaClient.verifyCode.called = true;
        return p().then(function () {
          if (verificationError) {
            throw verificationError;
          }
        });
      };
      view.fxaClient.verifyCode.called = false;
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

      it('UNKNOWN_ACCOUNT error displays the verification link damaged screen', function () {
        verificationError = AuthErrors.toError('UNKNOWN_ACCOUNT', 'who are you?');
        return testShowsExpiredScreen()
            .then(function () {
              testEventLogged('complete_sign_up.link_expired');
            })
            .then(function () {
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

        verificationError = new Error('verification error');
        return view.render()
            .then(function () {
              assert.isTrue(view.fxaClient.verifyCode.called);
              assert.ok(view.$('#fxa-verification-error-header').length);
              assert.equal(view.$('.error').text(), 'verification error');
            });
      });

      it('redirects to /signup_complete if verification successful', function () {
        windowMock.location.search = '?code=' + validCode + '&uid=' + validUid;

        return view.render()
            .then(function () {
              assert.isTrue(view.fxaClient.verifyCode.called);
              assert.equal(routerMock.page, 'signup_complete');
            });
      });

    });
  });
});



