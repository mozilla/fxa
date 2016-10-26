/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const AppStart = require('lib/app-start');
  const { assert } = require('chai');
  const BaseBroker = require('models/auth_brokers/base');
  const ConfigLoaderErrors = require('lib/config-loader').Errors;
  const Constants = require('lib/constants');
  const ErrorUtils = require('lib/error-utils');
  const FxDesktopV1Broker = require('models/auth_brokers/fx-desktop-v1');
  const FxDesktopV2Broker = require('models/auth_brokers/fx-desktop-v2');
  const FxFennecV1Broker = require('models/auth_brokers/fx-fennec-v1');
  const FxFirstrunV1Broker = require('models/auth_brokers/fx-firstrun-v1');
  const FxFirstrunV2Broker = require('models/auth_brokers/fx-firstrun-v2');
  const FxiOSV1Broker = require('models/auth_brokers/fx-ios-v1');
  const HistoryMock = require('../../mocks/history');
  const Metrics = require('lib/metrics');
  const Notifier = require('lib/channels/notifier');
  const NullChannel = require('lib/channels/null');
  const OAuthRelier = require('models/reliers/oauth');
  const p = require('lib/promise');
  const Raven = require('raven');
  const RedirectBroker = require('models/auth_brokers/redirect');
  const RefreshObserver = require('models/refresh-observer');
  const Relier = require('models/reliers/relier');
  const SameBrowserVerificationModel = require('models/verification/same-browser');
  const sinon = require('sinon');
  const Storage = require('lib/storage');
  const StorageMetrics = require('lib/storage-metrics');
  const SyncRelier = require('models/reliers/sync');
  const TestHelpers = require('../../lib/helpers');
  const Url = require('lib/url');
  const User = require('models/user');
  const WindowMock = require('../../mocks/window');

  describe('lib/app-start', function () {
    let appStart;
    let backboneHistoryMock;
    let brokerMock;
    let notifier;
    let routerMock;
    let userMock;
    let windowMock;

    beforeEach(function () {
      brokerMock = new BaseBroker();
      backboneHistoryMock = new HistoryMock();
      notifier = new Notifier();
      routerMock = { navigate: sinon.spy() };
      userMock = new User();

      windowMock = new WindowMock();
      windowMock.parent = new WindowMock();
    });

    afterEach(function () {
      Raven.uninstall();
    });

    describe('fatalError', function () {
      var err;
      var sandbox;


      beforeEach(function () {
        sandbox = sinon.sandbox.create();

        appStart = new AppStart({
          broker: brokerMock,
          history: backboneHistoryMock,
          router: routerMock,
          storage: Storage,
          user: userMock,
          window: windowMock
        });

        sandbox.spy(appStart, 'enableSentryMetrics');
        sandbox.stub(ErrorUtils, 'fatalError', function () {});

        err = new Error('boom');
        return appStart.fatalError(err);
      });

      afterEach(function () {
        sandbox.restore();
      });

      it('enables sentry if not already enabled', function () {
        assert.isTrue(appStart.enableSentryMetrics.called);
      });

      it('delegates to ErrorUtils', function () {
        assert.isTrue(ErrorUtils.fatalError.calledWith(err));
      });
    });

    describe('startApp', function () {
      beforeEach(function () {
        appStart = new AppStart({
          broker: brokerMock,
          history: backboneHistoryMock,
          router: routerMock,
          storage: Storage,
          user: userMock,
          window: windowMock
        });

        appStart.useConfig({});
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

      it('logs an error `fatalError` if config is missing', () => {
        appStart.useConfig(null);

        sinon.stub(appStart, 'fatalError', function () {});

        return appStart.startApp()
          .then(() => {
            assert.isTrue(appStart.fatalError.calledOnce);
            const err = appStart.fatalError.args[0][0];
            assert.isTrue(ConfigLoaderErrors.is(err, 'MISSING_CONFIG'));
          });
      });

      it('logs an error `fatalError` if config is invalid', () => {
        appStart.useConfig(null);

        sinon.stub(appStart, 'fatalError', function () {});

        $('head').append('<meta name="fxa-content-server/config" content="asdf" />');
        return appStart.startApp()
          .then(() => {
            assert.isTrue(appStart.fatalError.calledOnce);
            const err = appStart.fatalError.args[0][0];
            assert.isTrue(ConfigLoaderErrors.is(err, 'INVALID_CONFIG'));

            $('meta[name="fxa-content-server/config"]').remove();
          });
      });

      it('delegates to `fatalError` if an error occurs', function () {
        var err = new Error('boom');
        sinon.stub(appStart, 'allResourcesReady', function () {
          return p.reject(err);
        });

        sinon.stub(appStart, 'fatalError', function () {});

        return appStart.startApp()
          .then(function () {
            assert.isTrue(appStart.fatalError.calledWith(err));
          });
      });

      it('updates old storage formats', function () {
        sinon.stub(appStart, 'upgradeStorageFormats', function () {
          return p();
        });

        return appStart.startApp()
          .then(function () {
            assert.isTrue(appStart.upgradeStorageFormats.calledOnce);
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
          history: backboneHistoryMock,
          router: routerMock,
          user: userMock,
          window: windowMock
        });
        appStart._metrics = new Metrics();
      });

      describe('fx-firstrun-v1', function () {
        it('returns a FxFirstrunV1 broker if `service=sync&context=iframe`', function () {
          windowMock.location.search = Url.objToSearchString({
            context: Constants.IFRAME_CONTEXT,
            service: Constants.SYNC_SERVICE
          });

          return testExpectedBrokerCreated(FxFirstrunV1Broker);
        });
      });

      describe('fx-firstrun-v2', function () {
        it('returns a FxFirstrunV2 broker if `service=sync&context=fx_firstrun_v2`', function () {
          windowMock.location.search = Url.objToSearchString({
            context: Constants.FX_FIRSTRUN_V2_CONTEXT,
            service: Constants.SYNC_SERVICE
          });

          return testExpectedBrokerCreated(FxFirstrunV2Broker);
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

      describe('deprecated oauth iframe support', function () {
        it('returns an Redirect broker if `context=iframe` is present and in an iframe', function () {
          windowMock.top = new WindowMock();
          windowMock.location.search = Url.objToSearchString({
            client_id: 'client id', //eslint-disable-line camelcase
            context: Constants.IFRAME_CONTEXT
          });

          return testExpectedBrokerCreated(RedirectBroker);
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
          sinon.stub(appStart, 'captureError', sinon.spy());

          return appStart.initializeAuthenticationBroker()
            .then(function () {
              var err = new Error('test error');
              appStart._authenticationBroker.trigger('error', err);
              assert.isTrue(appStart.captureError.called);
            });
        });
      });
    });

    describe('initializeRelier', function () {
      beforeEach(function () {
        appStart = new AppStart({
          broker: brokerMock,
          history: backboneHistoryMock,
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
          history: backboneHistoryMock,
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
          history: backboneHistoryMock,
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
          history: backboneHistoryMock,
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
          history: backboneHistoryMock,
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
          history: backboneHistoryMock,
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
          history: backboneHistoryMock,
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

    describe('initializeIframeChannel', function () {
      beforeEach(function () {
        windowMock.location.search = '?context=fx_ios_v1&service=sync&origin=' + encodeURIComponent('http://127.0.0.1:8111');
        appStart = new AppStart({
          broker: brokerMock,
          history: backboneHistoryMock,
          window: windowMock
        });
      });

      it('creates an iframe channel if in an iframe', function () {
        windowMock.top = new WindowMock();

        appStart.initializeIframeChannel();
        assert.isDefined(appStart._iframeChannel);
        assert.equal(appStart._iframeChannel.origin, 'http://127.0.0.1:8111');
      });

      it('creates a null iframe channel if not in an iframe', function () {
        appStart.initializeIframeChannel();
        assert.instanceOf(appStart._iframeChannel, NullChannel);
      });
    });

    describe('initializeHeightObserver', function () {
      beforeEach(function () {
        appStart = new AppStart({
          broker: brokerMock,
          history: backboneHistoryMock,
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
          send (message, data) {
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

    describe('testLocalStorage', function () {
      describe('with localStorage disabled', function () {
        var err;

        beforeEach(function () {
          err = new Error('NS_ERROR_FILE_ACCESS_DENIED');

          appStart = new AppStart({
            storage: {
              testLocalStorage: sinon.spy(function () {
                throw err;
              })
            }
          });

          sinon.stub(appStart, 'captureError', sinon.spy());

          return appStart.testLocalStorage();
        });

        it('logs the error', function () {
          assert.isTrue(appStart.captureError.calledWith(err));
        });
      });
    });

    describe('captureError', function () {
      var err;
      var metricsMock;
      var sentryMock;

      beforeEach(function () {
        sinon.spy(backboneHistoryMock, 'start');

        err = new Error('NS_ERROR_FILE_ACCESS_DENIED');

        metricsMock = {
          flush: sinon.spy(function () {
            return p();
          }),
          logError: sinon.spy()
        };

        sentryMock = {
          captureException: sinon.spy()
        };


        appStart = new AppStart({
          metrics: metricsMock,
          sentryMetrics: sentryMock,
          storage: {
            testLocalStorage: sinon.spy(function () {
              throw err;
            })
          }
        });

        return appStart.captureError(err);
      });

      it('logs the error to sentry', function () {
        assert.isTrue(sentryMock.captureException.calledWith(err));
      });

      it('logs the error to metrics', function () {
        assert.isTrue(metricsMock.logError.calledWith(err));
        assert.isTrue(metricsMock.flush.called);
      });
    });

    describe('allResourcesReady', function () {
      let requireOnDemandMock;

      beforeEach(function () {
        sinon.spy(backboneHistoryMock, 'start');
        requireOnDemandMock = sinon.spy();

        appStart = new AppStart({
          broker: brokerMock,
          history: backboneHistoryMock,
          requireOnDemand: requireOnDemandMock,
          router: routerMock,
          user: userMock,
          window: windowMock
        });

      });

      it('should load fxaClient', () => {
        appStart.allResourcesReady();
        assert.isTrue(requireOnDemandMock.calledWith('fxaClient'));
      });

      it('should start history with `pushState: true` if supported', () => {
        appStart.allResourcesReady();
        assert.isTrue(backboneHistoryMock.start.calledWith({
          pushState: true,
          silent: false
        }));
      });

      it('should start history with `pushState: false` if supported', () => {
        sinon.stub(windowMock.history, 'replaceState', () => {
          throw new Error('You fool! This is the FxOS Trusted UI, history is available, but cannot be used.');
        });

        appStart.allResourcesReady();
        assert.isTrue(backboneHistoryMock.start.calledWith({
          pushState: false,
          silent: false
        }));
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

          it('returns `undefined`', function () {
            assert.isUndefined(appStart._getContext());
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
              get () {
                return 'fx_ios_v1';
              }
            };
          });

          appStart._getVerificationContext();
        });

        it('calls _getSameBrowserVerificationModel', function () {
          assert.isTrue(appStart._getSameBrowserVerificationModel.called);
        });

        it('returns the stored context', function () {
          assert.equal(appStart._getVerificationContext(), 'fx_ios_v1');
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
              get () {
                return undefined;
              }
            };
          });
        });

        it('returns `undefined`', function () {
          assert.isUndefined(appStart._getVerificationContext());
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

    describe('upgradeStorageFormats', function () {
      beforeEach(function () {
        appStart = new AppStart({
          user: userMock,
          window: windowMock
        });

        sinon.spy(userMock, 'upgradeFromUnfilteredAccountData');
        sinon.spy(userMock, 'upgradeFromSession');

        return appStart.upgradeStorageFormats();
      });

      it('upgrades unfiltered account data', function () {
        assert.isTrue(userMock.upgradeFromUnfilteredAccountData.called);
      });

      it('upgrades from Session data', function () {
        assert.isTrue(userMock.upgradeFromSession.called);
      });
    });

    describe('isReportSignIn', () => {
      beforeEach(() => {
        appStart = new AppStart({
          user: userMock,
          window: windowMock
        });
      });

      it('returns true for pathname = `/report_signin`', () => {
        windowMock.location.pathname = '/report_signin';
        assert.isTrue(appStart._isReportSignIn());
      });

      const notReportSignIn = ['/', '/signup', '/signin', '/force_auth'];
      notReportSignIn.forEach((pathname) => {
        it(`returns false for ${pathname}`, () => {
          windowMock.location.pathname = pathname;
          assert.isFalse(appStart._isReportSignIn());
        });
      });
    });
  });
});


