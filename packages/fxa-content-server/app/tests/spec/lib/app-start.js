/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var AppStart = require('lib/app-start');
  var AuthErrors = require('lib/auth-errors');
  var BaseBroker = require('models/auth_brokers/base');
  var BaseRelier = require('models/reliers/base');
  var chai = require('chai');
  var Constants = require('lib/constants');
  var FirstrunBroker = require('models/auth_brokers/first-run');
  var FxDesktopV1Broker = require('models/auth_brokers/fx-desktop-v1');
  var FxDesktopV2Broker = require('models/auth_brokers/fx-desktop-v2');
  var FxFennecV1Broker = require('models/auth_brokers/fx-fennec-v1');
  var FxiOSV1Broker = require('models/auth_brokers/fx-ios-v1');
  var FxiOSV2Broker = require('models/auth_brokers/fx-ios-v2');
  var HistoryMock = require('../../mocks/history');
  var IframeBroker = require('models/auth_brokers/iframe');
  var Metrics = require('lib/metrics');
  var Notifier = require('lib/channels/notifier');
  var NullChannel = require('lib/channels/null');
  var OAuthErrors = require('lib/oauth-errors');
  var OAuthRelier = require('models/reliers/oauth');
  var p = require('lib/promise');
  var Raven = require('raven');
  var RedirectBroker = require('models/auth_brokers/redirect');
  var RefreshObserver = require('models/refresh-observer');
  var Relier = require('models/reliers/relier');
  var SameBrowserVerificationModel = require('models/verification/same-browser');
  var Session = require('lib/session');
  var sinon = require('sinon');
  var Storage = require('lib/storage');
  var StorageMetrics = require('lib/storage-metrics');
  var SyncRelier = require('models/reliers/sync');
  var TestHelpers = require('../../lib/helpers');
  var Url = require('lib/url');
  var User = require('models/user');
  var WebChannelBroker = require('models/auth_brokers/web-channel');
  var WindowMock = require('../../mocks/window');

  var assert = chai.assert;
  var FIRSTRUN_ORIGIN = 'https://firstrun.firefox.com';
  var HELLO_ORIGIN = 'https://hello.firefox.com';

  describe('lib/app-start', function () {
    var appStart;
    var brokerMock;
    var historyMock;
    var notifier;
    var routerMock;
    var userMock;
    var windowMock;

    beforeEach(function () {
      brokerMock = new BaseBroker();
      historyMock = new HistoryMock();
      notifier = new Notifier();
      routerMock = { navigate: sinon.spy() };
      userMock = new User();

      windowMock = new WindowMock();
      windowMock.parent = new WindowMock();
    });

    afterEach(function () {
      Raven.uninstall();
    });

    describe('startApp', function () {
      beforeEach(function () {
        appStart = new AppStart({
          broker: brokerMock,
          history: historyMock,
          router: routerMock,
          storage: Storage,
          user: userMock,
          window: windowMock
        });
      });

      it('starts the app', function () {
        return appStart.startApp()
          .then(function () {
            // translator is put on the global object.
            assert.isDefined(windowMock.translator);
          });
      });

      it('does not redirect', function () {
        return appStart.startApp()
          .then(function () {
            assert.isFalse(routerMock.navigate.called);
          });
      });

      it('redirects to the `INTERNAL_ERROR_PAGE` if an error occurs', function () {
        sinon.stub(appStart, 'allResourcesReady', function () {
          sinon.stub(appStart._metrics, 'flush', function () {
            return p();
          });

          return p.reject(new Error('boom!'));
        });

        appStart.ERROR_REDIRECT_TIMEOUT_MS = 10;

        return appStart.startApp()
          .then(function () {
            assert.equal(windowMock.location.href, Constants.INTERNAL_ERROR_PAGE);
            assert.equal(appStart._metrics.flush.callCount, 1);
          });
      });

      it('updates old sessions', function () {
        sinon.stub(userMock, 'upgradeFromSession', function () {
        });

        return appStart.startApp()
                    .then(function () {
                      assert.isTrue(userMock.upgradeFromSession.calledOnce);
                    });
      });

      it('uses storage metrics when an automated browser is detected', function () {
        windowMock.location.search = Url.objToSearchString({
          automatedBrowser: true
        });

        return appStart.startApp()
          .then(function () {
            assert.instanceOf(appStart._metrics, StorageMetrics);
          });
      });

      describe('with localStorage disabled', function () {
        var sandbox;

        beforeEach(function () {
          sandbox = sinon.sandbox.create();
          sandbox.stub(Storage, 'isLocalStorageEnabled', function () {
            return false;
          });
        });

        afterEach(function () {
          sandbox.restore();
        });

        it('redirects to /cookies_disabled', function () {
          return appStart.startApp()
            .then(function () {
              assert.isTrue(routerMock.navigate.calledWith('cookies_disabled'));
            });
        });

        it('does not redirect if path is already /cookies_disabled', function () {
          windowMock.location.pathname = '/cookies_disabled';
          return appStart.startApp()
            .then(function () {
              assert.isFalse(routerMock.navigate.called);
            });
        });
      });
    });

    describe('initializeAuthenticationBroker', function () {
      function testExpectedBrokerCreated(ExpectedBroker) {
        return appStart.initializeAuthenticationBroker()
          .then(function () {
            assert.instanceOf(appStart._authenticationBroker, ExpectedBroker);
          });
      }

      beforeEach(function () {
        appStart = new AppStart({
          history: historyMock,
          router: routerMock,
          user: userMock,
          window: windowMock
        });
        appStart._metrics = new Metrics();
      });

      describe('firstrun', function () {
        it('returns a Firstrun broker if `service=sync&context=iframe`', function () {
          windowMock.location.search = Url.objToSearchString({
            context: Constants.IFRAME_CONTEXT,
            service: Constants.SYNC_SERVICE
          });

          return testExpectedBrokerCreated(FirstrunBroker);
        });
      });

      describe('fx-desktop-v1', function () {
        it('returns an FxDesktopV1 broker if `context=fx_desktop_v1`', function () {
          windowMock.location.search = Url.objToSearchString({
            context: Constants.FX_DESKTOP_V1_CONTEXT
          });

          return testExpectedBrokerCreated(FxDesktopV1Broker);
        });
      });

      describe('fx-desktop-v2', function () {
        it('returns an FxDesktopV2 broker if `context=fx_desktop_v2`', function () {
          windowMock.location.search = Url.objToSearchString({
            context: Constants.FX_DESKTOP_V2_CONTEXT
          });

          return testExpectedBrokerCreated(FxDesktopV2Broker);
        });
      });

      describe('fx-fennec-v1', function () {
        it('returns an FxFennecV1 broker if `context=fx_fennec_v1`', function () {
          windowMock.location.search = Url.objToSearchString({
            context: Constants.FX_FENNEC_V1_CONTEXT
          });

          return testExpectedBrokerCreated(FxFennecV1Broker);
        });
      });

      describe('fx-ios-v1', function () {
        it('returns an FxiOSV1 broker if `context=fx_ios_v1`', function () {
          windowMock.location.search = Url.objToSearchString({
            context: Constants.FX_IOS_V1_CONTEXT
          });

          return testExpectedBrokerCreated(FxiOSV1Broker);
        });
      });

      describe('fx-ios-v2', function () {
        it('returns an FxiOSV2 broker if `context=fx_ios_v2`', function () {
          windowMock.location.search = Url.objToSearchString({
            context: Constants.FX_IOS_V2_CONTEXT
          });

          return testExpectedBrokerCreated(FxiOSV2Broker);
        });
      });

      describe('web channel', function () {
        it('returns a WebChannel broker if `webChannelId` is present', function () {
          windowMock.location.search = Url.objToSearchString({
            webChannelId: 'channel id'
          });

          return testExpectedBrokerCreated(WebChannelBroker);
        });

        it('returns a WebChannel broker if verifying in the same brower where a signup was initiated from a web channel', function () {
          Session.set('oauth', {
            client_id: 'client id', //eslint-disable-line camelcase
            webChannelId: 'channel id'
          });

          windowMock.location.search = Url.objToSearchString({
            code: 'code',
            service: 'client id',
            uid: 'users id'
          });

          return testExpectedBrokerCreated(WebChannelBroker);
        });
      });

      describe('iframe', function () {
        it('returns an Iframe broker if `context=iframe` is present and in an iframe', function () {
          windowMock.top = new WindowMock();
          windowMock.location.search = Url.objToSearchString({
            client_id: 'client id', //eslint-disable-line camelcase
            context: Constants.IFRAME_CONTEXT
          });

          return testExpectedBrokerCreated(IframeBroker);
        });

        it('returns a Redirect broker if `context=iframe` is not present and in an iframe - for Marketplace on Android', function () {
          windowMock.top = new WindowMock();
          windowMock.location.search = Url.objToSearchString({
            client_id: 'client id' //eslint-disable-line camelcase
          });

          return testExpectedBrokerCreated(RedirectBroker);
        });
      });

      describe('redirect', function () {
        it('returns a Redirect broker if `client_id` is available', function () {
          windowMock.location.search = Url.objToSearchString({
            client_id: 'client id' //eslint-disable-line camelcase
          });

          return testExpectedBrokerCreated(RedirectBroker);
        });

        it('returns a Redirect broker if both `code` and `service` are available - for verification flows', function () {
          windowMock.location.search = Url.objToSearchString({
            code: 'the code',
            service: 'the service',
            uid: 'users id'
          });

          return testExpectedBrokerCreated(RedirectBroker);
        });

        it('returns a Redirect broker if user directly browses to `/oauth/signin`', function () {
          windowMock.location.href = '/oauth/signin';

          return testExpectedBrokerCreated(RedirectBroker);
        });

        it('returns a Redirect broker if user directly browses to `/oauth/signup`', function () {
          windowMock.location.href = '/oauth/signup';

          return testExpectedBrokerCreated(RedirectBroker);
        });
      });

      describe('base', function () {
        it('returns a Base broker if the user directly browses to any other page', function () {
          windowMock.location.href = '/settings';

          return testExpectedBrokerCreated(BaseBroker);
        });

        it('returns a BaseBroker if verifying a Sync signup', function () {
          windowMock.location.search = Url.objToSearchString({
            code: 'the code',
            service: Constants.SYNC_SERVICE,
            uid: 'users id'
          });

          return testExpectedBrokerCreated(BaseBroker);
        });
      });

      describe('broker errors', function () {
        it('are logged to metrics', function () {
          sinon.spy(appStart._metrics, 'logError');
          return appStart.initializeAuthenticationBroker()
            .then(function () {
              var err = new Error('test error');
              appStart._authenticationBroker.trigger('error', err);
              assert.isTrue(appStart._metrics.logError.calledWith(err));
            });
        });
      });
    });

    describe('initializeRelier', function () {
      beforeEach(function () {
        appStart = new AppStart({
          broker: brokerMock,
          history: historyMock,
          router: routerMock,
          user: userMock,
          window: windowMock
        });
      });

      it('creates an SyncRelier if Sync', function () {
        sinon.stub(appStart, '_isServiceSync', function () {
          return true;
        });

        appStart.initializeRelier();
        assert.instanceOf(appStart._relier, SyncRelier);
      });

      it('creates an OAuthRelier if using the OAuth flow', function () {
        sinon.stub(appStart, '_isOAuth', function () {
          return true;
        });

        appStart.initializeRelier();
        assert.instanceOf(appStart._relier, OAuthRelier);
      });

      it('creates a Relier by default', function () {
        appStart.initializeRelier();
        assert.instanceOf(appStart._relier, Relier);
      });
    });

    describe('initializeCloseButton', function () {
      beforeEach(function () {
        appStart = new AppStart({
          broker: brokerMock,
          history: historyMock,
          router: routerMock,
          user: userMock,
          window: windowMock
        });
      });

      it('creates a close button if the broker reports it can cancel', function () {
        sinon.stub(brokerMock, 'canCancel', function () {
          return true;
        });

        appStart.initializeCloseButton();
        assert.isDefined(appStart._closeButton);
      });

      it('does not create a close button by default', function () {
        appStart.initializeCloseButton();
        assert.isUndefined(appStart._closeButton);
      });
    });

    describe('initializeUser', function () {
      beforeEach(function () {
        appStart = new AppStart({
          broker: brokerMock,
          history: historyMock,
          router: routerMock,
          window: windowMock
        });
        appStart.useConfig({});
      });

      it('creates a user', function () {
        appStart.initializeUser();
        assert.isDefined(appStart._user);
      });

      it('sets the user uniqueUserId', function () {
        appStart.initializeUser();
        assert.isDefined(appStart._user.get('uniqueUserId'));
      });
    });

    describe('initializeErrorMetrics', function () {
      beforeEach(function () {
        appStart = new AppStart({
          broker: brokerMock,
          history: historyMock,
          router: routerMock,
          window: windowMock
        });
        appStart.useConfig({});
      });

      it('skips error metrics on empty config', function () {
        appStart.initializeAble();
        var ableChoose = sinon.stub(appStart._able, 'choose', function () {
          return true;
        });

        appStart.initializeErrorMetrics();
        assert.isUndefined(appStart._sentryMetrics);
        ableChoose.restore();
      });

      it('skips error metrics if env is not defined', function () {
        appStart.useConfig({ });
        appStart.initializeAble();

        appStart.initializeErrorMetrics();
        assert.isUndefined(appStart._sentryMetrics);
      });

      it('creates error metrics', function () {
        var appStart = new AppStart({
          broker: brokerMock,
          history: historyMock,
          router: routerMock,
          window: windowMock
        });
        appStart.useConfig({ env: 'development' });
        appStart.initializeAble();

        var ableChoose = sinon.stub(appStart._able, 'choose', function () {
          return true;
        });

        appStart.initializeErrorMetrics();
        assert.isDefined(appStart._sentryMetrics);

        ableChoose.restore();
      });
    });

    describe('_getUniqueUserId', function () {
      beforeEach(function () {
        appStart = new AppStart({
          broker: brokerMock,
          history: historyMock,
          router: routerMock,
          window: windowMock
        });
        appStart.useConfig({});
      });

      it('creates a user id', function () {
        assert.isDefined(appStart._getUniqueUserId());
      });
    });

    describe('initializeRouter', function () {
      beforeEach(function () {
        appStart = new AppStart({
          broker: brokerMock,
          history: historyMock,
          notifier: notifier,
          window: windowMock
        });
        appStart.useConfig({});
      });

      it('creates a router', function () {
        appStart.initializeRouter();
        assert.isDefined(appStart._router);
      });
    });

    describe('_getErrorPage', function () {
      it('returns BAD_REQUEST_PAGE for a missing OAuth parameter', function () {
        var errorUrl = appStart._getErrorPage(OAuthErrors.toError('MISSING_PARAMETER'));
        assert.include(errorUrl, Constants.BAD_REQUEST_PAGE);
      });

      it('returns BAD_REQUEST_PAGE for an unknown OAuth client', function () {
        var errorUrl = appStart._getErrorPage(OAuthErrors.toError('UNKNOWN_CLIENT'));
        assert.include(errorUrl, Constants.BAD_REQUEST_PAGE);
      });

      it('returns INTERNAL_ERROR_PAGE by default', function () {
        var errorUrl = appStart._getErrorPage(OAuthErrors.toError('INVALID_ASSERTION'));
        assert.include(errorUrl, Constants.INTERNAL_ERROR_PAGE);
      });
    });

    describe('initializeIframeChannel', function () {
      beforeEach(function () {
        appStart = new AppStart({
          broker: brokerMock,
          history: historyMock,
          window: windowMock
        });
      });

      it('creates an iframe channel and checks the origin if in an iframe', function () {
        sinon.stub(appStart, '_checkParentOrigin', function () {
          return p(FIRSTRUN_ORIGIN);
        });

        windowMock.top = new WindowMock();

        return appStart.initializeIframeChannel()
          .then(function () {
            assert.isDefined(appStart._iframeChannel);
            assert.isTrue(appStart._checkParentOrigin.called);
          });
      });

      it('creates a null iframe channel if not in an iframe', function () {
        sinon.spy(appStart, '_checkParentOrigin');

        return appStart.initializeIframeChannel()
          .then(function () {
            assert.instanceOf(appStart._iframeChannel, NullChannel);
            assert.isFalse(appStart._checkParentOrigin.called);
          });
      });

      it('throws an error if not allowed to iframe', function () {
        sinon.stub(appStart, '_checkParentOrigin', function () {
          return p(null);
        });

        windowMock.top = new WindowMock();

        return appStart.initializeIframeChannel()
          .then(assert.fail, function (err) {
            assert.isTrue(AuthErrors.is(err, 'ILLEGAL_IFRAME_PARENT'));
            assert.isUndefined(appStart._iframeChannel);
          });
      });

      it('passes on any other errors', function () {
        sinon.stub(appStart, '_checkParentOrigin', function () {
          return p.reject(new Error('uh oh'));
        });

        windowMock.top = new WindowMock();

        return appStart.initializeIframeChannel()
          .then(assert.fail, function (err) {
            assert.equal(err.message, 'uh oh');
            assert.isUndefined(appStart._iframeChannel);
          });
      });
    });

    describe('_getAllowedParentOrigins', function () {
      var relierMock;
      beforeEach(function () {
        relierMock = new BaseRelier();

        appStart = new AppStart({
          broker: brokerMock,
          history: historyMock,
          relier: relierMock,
          window: windowMock
        });
      });

      it('returns an empty array if not in an iframe', function () {
        sinon.stub(appStart, '_isInAnIframe', function () {
          return false;
        });

        assert.equal(appStart._getAllowedParentOrigins().length, 0);
      });

      it('returns the firstrun origin for Fx Desktop Sync', function () {
        sinon.stub(appStart, '_isInAnIframe', function () {
          return true;
        });

        sinon.stub(appStart, '_isServiceSync', function () {
          return true;
        });

        appStart.useConfig({
          allowedParentOrigins: [FIRSTRUN_ORIGIN]
        });
        var allowedOrigins = appStart._getAllowedParentOrigins();
        assert.equal(allowedOrigins.length, 1);
        assert.equal(allowedOrigins[0], FIRSTRUN_ORIGIN);
      });

      it('returns the relier\'s origin if an oauth flow', function () {
        sinon.stub(appStart, '_isInAnIframe', function () {
          return true;
        });

        sinon.stub(appStart, '_isOAuth', function () {
          return true;
        });

        relierMock.set('origin', HELLO_ORIGIN);
        var allowedOrigins = appStart._getAllowedParentOrigins();
        assert.equal(allowedOrigins.length, 1);
        assert.equal(allowedOrigins[0], HELLO_ORIGIN);
      });

      it('returns an empty array otherwise', function () {
        sinon.stub(appStart, '_isInAnIframe', function () {
          return true;
        });

        assert.equal(appStart._getAllowedParentOrigins().length, 0);
      });
    });

    describe('_checkParentOrigin', function () {
      beforeEach(function () {
        var relierMock = new BaseRelier();

        appStart = new AppStart({
          broker: brokerMock,
          history: historyMock,
          relier: relierMock,
          window: windowMock
        });
      });

      it('should return the value returned by originCheck.getOrigin', function () {
        sinon.stub(appStart, '_getAllowedParentOrigins', function () {
          return [FIRSTRUN_ORIGIN];
        });

        var originCheck = {
          getOrigin: function () {
            return p(FIRSTRUN_ORIGIN);
          }
        };

        sinon.spy(originCheck, 'getOrigin');

        return appStart._checkParentOrigin(originCheck)
          .then(function (origin) {
            assert.equal(origin, FIRSTRUN_ORIGIN);
            assert.isTrue(originCheck.getOrigin.calledWith(windowMock.parent, [FIRSTRUN_ORIGIN]));
          });
      });
    });

    describe('initializeHeightObserver', function () {
      beforeEach(function () {
        appStart = new AppStart({
          broker: brokerMock,
          history: historyMock,
          router: routerMock,
          user: userMock,
          window: windowMock
        });
      });

      it('sets up the HeightObserver, triggers a `resize` notification on the iframe channel when the height changes', function (done) {
        sinon.stub(appStart, '_isInAnIframe', function () {
          return true;
        });

        appStart._iframeChannel = {
          send: function (message, data) {
            TestHelpers.wrapAssertion(function () {
              assert.equal(message, 'resize');
              assert.typeOf(data.height, 'number');
            }, done);
          }
        };

        appStart.initializeHeightObserver();
      });
    });

    describe('initializeRefreshObserver', function () {
      beforeEach(function () {
        appStart = new AppStart({
          notifier: notifier,
          window: windowMock
        });
      });

      it('creates a RefreshObserver instance', function () {
        appStart.initializeRefreshObserver();
        assert.instanceOf(appStart._refreshObserver, RefreshObserver);
      });
    });

    describe('allResourcesReady', function () {
      beforeEach(function () {
        appStart = new AppStart({
          broker: brokerMock,
          history: historyMock,
          router: routerMock,
          user: userMock,
          window: windowMock
        });
      });

      it('should set the window hash if in an iframe', function () {
        sinon.stub(appStart, '_isInAnIframe', function () {
          return true;
        });
        windowMock.location.pathname = 'signup';
        appStart.allResourcesReady();
        assert.equal(windowMock.location.hash, 'signup');
      });
    });

    describe('_getContext', function () {
      describe('in a verification flow', function () {
        beforeEach(function () {
          appStart = new AppStart({
            notifier: notifier,
            window: windowMock
          });

          sinon.stub(appStart, '_isVerification', function () {
            return true;
          });

          sinon.spy(appStart, '_getVerificationContext');

          appStart._getContext();
        });

        it('calls `_getVerificationContext`', function () {
          assert.isTrue(appStart._getVerificationContext.called);
        });
      });

      describe('in a non-verification flow', function () {
        describe('with a `context` in the query parameters', function () {
          beforeEach(function () {
            windowMock.location.search = '?context=fx_ios_v1';

            appStart = new AppStart({
              notifier: notifier,
              window: windowMock
            });

            sinon.stub(appStart, '_isVerification', function () {
              return false;
            });

          });

          it('returns the `context` from the query parameters', function () {
            assert.equal(appStart._getContext(), 'fx_ios_v1');
          });
        });

        describe('without a `context` in the query parameters', function () {
          beforeEach(function () {
            windowMock.location.search = '?';

            appStart = new AppStart({
              notifier: notifier,
              window: windowMock
            });

            sinon.stub(appStart, '_isVerification', function () {
              return false;
            });
          });

          it('returns the `direct` context', function () {
            assert.equal(appStart._getContext(), Constants.DIRECT_CONTEXT);
          });
        });
      });
    });

    describe('_getVerificationContext', function () {
      describe('with a stored `context`', function () {
        beforeEach(function () {
          appStart = new AppStart({
            notifier: notifier,
            window: windowMock
          });

          sinon.stub(appStart, '_getSameBrowserVerificationModel', function () {
            return {
              get: function () {
                return 'fx_ios_v2';
              }
            };
          });

          appStart._getVerificationContext();
        });

        it('calls _getSameBrowserVerificationModel', function () {
          assert.isTrue(appStart._getSameBrowserVerificationModel.called);
        });

        it('returns the stored context', function () {
          assert.equal(appStart._getVerificationContext(), 'fx_ios_v2');
        });
      });

      describe('without a stored `context`', function () {
        beforeEach(function () {
          appStart = new AppStart({
            notifier: notifier,
            window: windowMock
          });

          sinon.stub(appStart, '_getSameBrowserVerificationModel', function () {
            return {
              get: function () {
                return undefined;
              }
            };
          });
        });

        it('returns the `direct` context', function () {
          assert.equal(appStart._getVerificationContext(),
              Constants.DIRECT_CONTEXT);
        });
      });
    });

    describe('_getSameBrowserVerificationModel', function () {
      beforeEach(function () {
        appStart = new AppStart({
          notifier: notifier,
          window: windowMock
        });
      });

      it('gets a `SameBrowserVerificationModel` instance', function () {
        assert.instanceOf(
          appStart._getSameBrowserVerificationModel('context'),
          SameBrowserVerificationModel
        );
      });
    });
  });
});


