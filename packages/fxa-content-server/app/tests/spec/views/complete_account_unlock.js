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

    function testErrorLogged(error) {
      var normalizedError = view._normalizeError(error);
      assert.isTrue(TestHelpers.isErrorLogged(metrics, normalizedError));
    }

    function testShowsExpiredScreen() {
      assert.ok(view.$('#fxa-account-unlock-link-expired-header').length);
      testErrorLogged(AuthErrors.toError('EXPIRED_VERIFICATION_LINK'));
    }

    function testShowsDamagedScreen() {
      assert.ok(view.$('#fxa-account-unlock-link-damaged-header').length);
      testErrorLogged(AuthErrors.toError('DAMAGED_VERIFICATION_LINK'));
    }

    function initView (search) {
      windowMock.location.search = search;

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

      sinon.spy(view, 'navigate');

      return view.render();
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
    });

    afterEach(function () {
      metrics.destroy();

      view.remove();
      view.destroy();

      view = windowMock = metrics = null;
    });

    describe('render', function () {
      describe('missing uid', function () {
        beforeEach(function () {
          return initView(Url.objToSearchString({
            code: validCode
          }));
        });

        it('does not delegate to the fxaClient', function () {
          assert.isFalse(view.fxaClient.completeAccountUnlock.called);
        });

        it('displays the link damaged screen', function () {
          testShowsDamagedScreen();
        });
      });

      describe('invalid uid', function () {
        beforeEach(function () {
          return initView(Url.objToSearchString({
            code: validCode,
            uid: invalidUid
          }));
        });

        it('does not delegate to the fxaClient', function () {
          assert.isFalse(view.fxaClient.completeAccountUnlock.called);
        });

        it('displays the link damaged screen', function () {
          testShowsDamagedScreen();
        });
      });

      describe('missing code', function () {
        beforeEach(function () {
          return initView(Url.objToSearchString({
            uid: validUid
          }));
        });

        it('does not delegate to the fxaClient', function () {
          assert.isFalse(view.fxaClient.completeAccountUnlock.called);
        });

        it('displays the link damaged screen', function () {
          testShowsDamagedScreen();
        });
      });

      describe('invalid code', function () {
        beforeEach(function () {
          return initView(Url.objToSearchString({
            code: invalidCode,
            uid: validUid
          }));
        });

        it('does not delegate to the fxaClient', function () {
          assert.isFalse(view.fxaClient.completeAccountUnlock.called);
        });

        it('displays the link damaged screen', function () {
          testShowsDamagedScreen();
        });
      });

      describe('INVALID_PARAMETER error', function () {
        beforeEach(function () {
          accountUnlockError = AuthErrors.toError('INVALID_PARAMETER', 'code');
          return initView(Url.objToSearchString({
            code: validCode,
            uid: validUid
          }));
        });

        it('displays the link damaged screen', function () {
          testShowsDamagedScreen();
        });
      });

      describe('UNKNOWN_ACCOUNT error', function () {
        beforeEach(function () {
          accountUnlockError = AuthErrors.toError(
              'UNKNOWN_ACCOUNT', 'who are you?');

          return initView(Url.objToSearchString({
            code: validCode,
            uid: validUid
          }));
        });

        it('displays the link expired screen', function () {
          testShowsExpiredScreen();
        });
      });

      describe('INVALID_VERIFICATION_CODE error', function () {
        beforeEach(function () {
          accountUnlockError = AuthErrors.toError(
              'INVALID_VERIFICATION_CODE', 'this isn\'t a lottery');
          return initView(Url.objToSearchString({
            code: validCode,
            uid: validUid
          }));
        });

        it('displays the verification linked damaged screen', function () {
        });
      });

      describe('all other errors', function () {
        beforeEach(function () {
          accountUnlockError = new Error('account-unlock error');

          return initView(Url.objToSearchString({
            code: validCode,
            uid: validUid
          }));
        });

        it('are displayed verbatim', function () {
          assert.ok(view.$('#fxa-account-unlock-error-header').length);
          assert.equal(view.$('.error').text(), 'account-unlock error');
        });
      });

      describe('success', function () {
        beforeEach(function () {
          return initView(Url.objToSearchString({
            code: validCode,
            uid: validUid
          }));
        });

        it('delegates to the fxaClient', function () {
          assert.isTrue(
            view.fxaClient.completeAccountUnlock.calledWith(
              validUid, validCode));
        });

        it('notifies the broker', function () {
          assert.isTrue(broker.afterCompleteAccountUnlock.called);
          var account = broker.afterCompleteAccountUnlock.args[0][0];
          assert.equal(account.get('uid'), validUid);
        });

        it('redirects to `/account_unlock_complete', function () {
          assert.isTrue(view.navigate.calledWith('account_unlock_complete'));
        });

        it('logs a success event', function () {
          assert.isTrue(TestHelpers.isEventLogged(
              metrics, 'complete-account-unlock.verification.success'));
        });
      });
    });
  });
});
