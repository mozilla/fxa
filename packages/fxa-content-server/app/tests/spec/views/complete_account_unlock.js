/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'sinon',
  'lib/promise',
  'views/complete_account_unlock',
  'lib/auth-errors',
  'lib/metrics',
  'lib/constants',
  'lib/fxa-client',
  'lib/url',
  'models/reliers/relier',
  'models/auth_brokers/base',
  'models/user',
  '../../mocks/router',
  '../../mocks/window',
  '../../lib/helpers'
],
function (chai, sinon, p, View, AuthErrors, Metrics, Constants, FxaClient,
      Url, Relier, Broker, User, RouterMock, WindowMock, TestHelpers) {
  var assert = chai.assert;

  describe('views/complete_account_unlock', function () {
    var view;
    var routerMock;
    var windowMock;
    var accountUnlockError;
    var metrics;
    var fxaClient;
    var relier;
    var broker;
    var user;
    var account;
    var validCode = TestHelpers.createRandomHexString(Constants.CODE_LENGTH);
    var invalidCode = TestHelpers.createRandomHexString(Constants.CODE_LENGTH - 1);
    var validUid = TestHelpers.createRandomHexString(Constants.UID_LENGTH);
    var invalidUid = TestHelpers.createRandomHexString(Constants.UID_LENGTH - 1);

    function testShowsExpiredScreen(search) {
      windowMock.location.search = search;
      initView();
      return view.render()
        .then(function () {
          assert.ok(view.$('#fxa-account-unlock-link-expired-header').length);
          testEventLogged('complete-account-unlock.link_expired');
        });
    }

    function testShowsDamagedScreen(search) {
      windowMock.location.search = search;
      initView();
      return view.render()
        .then(function () {
          assert.ok(view.$('#fxa-account-unlock-link-damaged-header').length);
          testEventLogged('complete-account-unlock.link_damaged');
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
        screenName: 'complete-account-unlock'
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

      accountUnlockError = null;
      sinon.stub(fxaClient, 'completeAccountUnlock', function () {
        if (accountUnlockError) {
          return p.reject(accountUnlockError);
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
        return testShowsDamagedScreen(Url.objToSearchString({
          code: validCode
        }))
        .then(function () {
          assert.isFalse(view.fxaClient.completeAccountUnlock.called);
        });
      });

      it('shows an error if uid is invalid', function () {
        return testShowsDamagedScreen(Url.objToSearchString({
          uid: invalidUid,
          code: validCode
        }))
        .then(function () {
          assert.isFalse(view.fxaClient.completeAccountUnlock.called);
        });
      });

      it('shows an error if code is not available on the URL', function () {
        return testShowsDamagedScreen(Url.objToSearchString({
          uid: validUid
        }))
        .then(function () {
          assert.isFalse(view.fxaClient.completeAccountUnlock.called);
        });
      });

      it('shows an error if code is invalid', function () {
        return testShowsDamagedScreen(Url.objToSearchString({
          uid: validUid,
          code: invalidCode
        }))
        .then(function () {
          assert.isFalse(view.fxaClient.completeAccountUnlock.called);
        });
      });

      it('INVALID_PARAMETER error displays the verification link damaged screen', function () {
        accountUnlockError = AuthErrors.toError('INVALID_PARAMETER', 'code');
        return testShowsDamagedScreen(Url.objToSearchString({
          uid: validUid,
          code: validCode
        }))
        .then(function () {
          assert.isTrue(view.fxaClient.completeAccountUnlock.called);
        });
      });

      it('UNKNOWN_ACCOUNT error displays the verification link expired screen', function () {
        accountUnlockError = AuthErrors.toError(
            'UNKNOWN_ACCOUNT', 'who are you?');
        return testShowsExpiredScreen(Url.objToSearchString({
          uid: validUid,
          code: validCode
        }))
        .then(function () {
          assert.isTrue(view.fxaClient.completeAccountUnlock.called);
        });
      });

      it('INVALID_VERIFICATION_CODE error displays the verification link damaged screen', function () {
        accountUnlockError = AuthErrors.toError(
            'INVALID_VERIFICATION_CODE', 'this isn\'t a lottery');
        return testShowsDamagedScreen(Url.objToSearchString({
          uid: validUid,
          code: validCode
        }))
        .then(function () {
          assert.isTrue(view.fxaClient.completeAccountUnlock.called);
        });
      });

      it('all other server errors are displayed verbatim', function () {
        windowMock.location.search = Url.objToSearchString({
          code: validCode,
          uid: validUid
        });
        initView();

        accountUnlockError = new Error('account-unlock error');
        return view.render()
          .then(function () {
            assert.isTrue(view.fxaClient.completeAccountUnlock.calledWith(validUid, validCode));
            assert.ok(view.$('#fxa-account-unlock-error-header').length);
            assert.equal(view.$('.error').text(), 'account-unlock error');
          });
      });

      it('redirects to /account_unlock_complete if unlock successful', function () {
        windowMock.location.search = Url.objToSearchString({
          code: validCode,
          uid: validUid
        });
        initView();

        return view.render()
          .then(function () {
            assert.isTrue(view.fxaClient.completeAccountUnlock.calledWith(validUid, validCode));
            assert.equal(routerMock.page, 'account_unlock_complete');
            assert.isTrue(TestHelpers.isEventLogged(
                    metrics, 'complete-account-unlock.verification.success'));
          });
      });
    });
  });
});



