/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var AuthErrors = require('lib/auth-errors');
  var Broker = require('models/auth_brokers/base');
  var chai = require('chai');
  var Constants = require('lib/constants');
  var FxaClient = require('lib/fxa-client');
  var Metrics = require('lib/metrics');
  var Notifier = require('lib/channels/notifier');
  var p = require('lib/promise');
  var Relier = require('models/reliers/relier');
  var sinon = require('sinon');
  var TestHelpers = require('../../lib/helpers');
  var Url = require('lib/url');
  var User = require('models/user');
  var View = require('views/complete_account_unlock');
  var WindowMock = require('../../mocks/window');

  var assert = chai.assert;

  describe('views/complete_account_unlock', function () {
    var accountUnlockError;
    var broker;
    var fxaClient;
    var metrics;
    var notifier;
    var relier;
    var user;
    var view;
    var windowMock;

    var invalidCode = TestHelpers.createRandomHexString(Constants.CODE_LENGTH - 1);
    var invalidUid = TestHelpers.createRandomHexString(Constants.UID_LENGTH - 1);
    var validCode = TestHelpers.createRandomHexString(Constants.CODE_LENGTH);
    var validUid = TestHelpers.createRandomHexString(Constants.UID_LENGTH);

    function testShowsExpiredScreen(search) {
      windowMock.location.search = search;
      initView();
      return view.render()
        .then(function () {
          assert.ok(view.$('#fxa-account-unlock-link-expired-header').length);
          testErrorLogged(AuthErrors.toError('EXPIRED_VERIFICATION_LINK'));
        });
    }

    function testShowsDamagedScreen(search) {
      windowMock.location.search = search;
      initView();
      return view.render()
        .then(function () {
          assert.ok(view.$('#fxa-account-unlock-link-damaged-header').length);
          testErrorLogged(AuthErrors.toError('DAMAGED_VERIFICATION_LINK'));
        });
    }

    function testErrorLogged(error) {
      var normalizedError = view._normalizeError(error);
      assert.isTrue(TestHelpers.isErrorLogged(metrics, normalizedError));
    }

    function initView () {
      view = new View({
        broker: broker,
        fxaClient: fxaClient,
        metrics: metrics,
        notifier: notifier,
        relier: relier,
        user: user,
        viewName: 'complete-account-unlock',
        window: windowMock
      });
    }

    beforeEach(function () {
      broker = new Broker();
      fxaClient = new FxaClient();
      metrics = new Metrics();
      notifier = new Notifier();
      relier = new Relier();
      user = new User();
      windowMock = new WindowMock();

      accountUnlockError = null;
      sinon.stub(fxaClient, 'completeAccountUnlock', function () {
        if (accountUnlockError) {
          return p.reject(accountUnlockError);
        } else {
          return p();
        }
      });

      sinon.spy(broker, 'afterCompleteAccountUnlock');

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
          code: validCode,
          uid: invalidUid
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
          code: invalidCode,
          uid: validUid
        }))
        .then(function () {
          assert.isFalse(view.fxaClient.completeAccountUnlock.called);
        });
      });

      it('INVALID_PARAMETER error displays the verification link damaged screen', function () {
        accountUnlockError = AuthErrors.toError('INVALID_PARAMETER', 'code');
        return testShowsDamagedScreen(Url.objToSearchString({
          code: validCode,
          uid: validUid
        }))
        .then(function () {
          assert.isTrue(view.fxaClient.completeAccountUnlock.called);
        });
      });

      it('UNKNOWN_ACCOUNT error displays the verification link expired screen', function () {
        accountUnlockError = AuthErrors.toError(
            'UNKNOWN_ACCOUNT', 'who are you?');
        return testShowsExpiredScreen(Url.objToSearchString({
          code: validCode,
          uid: validUid
        }))
        .then(function () {
          assert.isTrue(view.fxaClient.completeAccountUnlock.called);
        });
      });

      it('INVALID_VERIFICATION_CODE error displays the verification link damaged screen', function () {
        accountUnlockError = AuthErrors.toError(
            'INVALID_VERIFICATION_CODE', 'this isn\'t a lottery');
        return testShowsDamagedScreen(Url.objToSearchString({
          code: validCode,
          uid: validUid
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

        sinon.spy(view, 'navigate');

        return view.render()
          .then(function () {
            assert.isTrue(view.fxaClient.completeAccountUnlock.calledWith(validUid, validCode));
            assert.isTrue(broker.afterCompleteAccountUnlock.called);
            assert.isTrue(view.navigate.calledWith('account_unlock_complete'));
            assert.isTrue(TestHelpers.isEventLogged(
                    metrics, 'complete-account-unlock.verification.success'));
          });
      });
    });
  });
});
