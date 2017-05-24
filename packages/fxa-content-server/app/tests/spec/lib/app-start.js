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
  const RedirectBroker = require('models/auth_brokers/oauth-redirect');
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

  describe('lib/app-start', () => {
    let appStart;
    let backboneHistoryMock;
    let brokerMock;
    let notifier;
    let routerMock;
    let userMock;
    let windowMock;

    beforeEach(() => {
      brokerMock = new BaseBroker();
      backboneHistoryMock = new HistoryMock();
      notifier = new Notifier();
      routerMock = { navigate: sinon.spy() };
      userMock = new User();

      windowMock = new WindowMock();
      windowMock.parent = new WindowMock();
    });

    afterEach(() => {
      Raven.uninstall();
    });

    describe('fatalError', () => {
      var err;
      var sandbox;


      beforeEach(() => {
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
        sandbox.stub(ErrorUtils, 'fatalError', () => {});

        err = new Error('boom');
        return appStart.fatalError(err);
      });

      afterEach(() => {
        sandbox.restore();
      });

      it('enables sentry if not already enabled', () => {
        assert.isTrue(appStart.enableSentryMetrics.called);
      });

      it('delegates to ErrorUtils', () => {
        assert.isTrue(ErrorUtils.fatalError.calledWith(err));
      });
    });

    describe('startApp', () => {
      beforeEach(() => {
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

      it('starts the app', () => {
        return appStart.startApp()
          .then(() => {
            // translator is put on the global object.
            assert.isDefined(windowMock.translator);
          });
      });

      it('does not redirect', () => {
        return appStart.startApp()
          .then(() => {
            assert.isFalse(routerMock.navigate.called);
          });
      });

      it('logs an error `fatalError` if config is missing', () => {
        appStart.useConfig(null);

        sinon.stub(appStart, 'fatalError', () => {});

        return appStart.startApp()
          .then(() => {
            assert.isTrue(appStart.fatalError.calledOnce);
            const err = appStart.fatalError.args[0][0];
            assert.isTrue(ConfigLoaderErrors.is(err, 'MISSING_CONFIG'));
          });
      });

      it('logs an error `fatalError` if config is invalid', () => {
        appStart.useConfig(null);

        sinon.stub(appStart, 'fatalError', () => {});

        $('head').append('<meta name="fxa-content-server/config" content="asdf" />');
        return appStart.startApp()
          .then(() => {
            assert.isTrue(appStart.fatalError.calledOnce);
            const err = appStart.fatalError.args[0][0];
            assert.isTrue(ConfigLoaderErrors.is(err, 'INVALID_CONFIG'));

            $('meta[name="fxa-content-server/config"]').remove();
          });
      });

      it('delegates to `fatalError` if an error occurs', () => {
        var err = new Error('boom');
        sinon.stub(appStart, 'allResourcesReady', () => {
          return p.reject(err);
        });

        sinon.stub(appStart, 'fatalError', () => {});

        return appStart.startApp()
          .then(() => {
            assert.isTrue(appStart.fatalError.calledWith(err));
          });
      });

      it('updates old storage formats', () => {
        sinon.stub(appStart, 'upgradeStorageFormats', () => {
          return p();
        });

        return appStart.startApp()
          .then(() => {
            assert.isTrue(appStart.upgradeStorageFormats.calledOnce);
          });
      });

      it('uses storage metrics when an automated browser is detected', () => {
        windowMock.location.search = Url.objToSearchString({
          automatedBrowser: true
        });

        return appStart.startApp()
          .then(() => {
            assert.instanceOf(appStart._metrics, StorageMetrics);
          });
      });

      describe('with localStorage disabled', () => {
        var sandbox;

        beforeEach(() => {
          sandbox = sinon.sandbox.create();
          sandbox.stub(Storage, 'isLocalStorageEnabled', () => {
            return false;
          });
        });

        afterEach(() => {
          sandbox.restore();
        });

        it('redirects to /cookies_disabled', () => {
          return appStart.startApp()
            .then(() => {
              assert.isTrue(routerMock.navigate.calledWith('cookies_disabled'));
            });
        });

        it('does not redirect if path is already /cookies_disabled', () => {
          windowMock.location.pathname = '/cookies_disabled';
          return appStart.startApp()
            .then(() => {
              assert.isFalse(routerMock.navigate.called);
            });
        });

        it('does not redirect if Mobile Safari and /complete_signin', () => {
          windowMock.navigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_1_1 like Mac OS X) ' +
            'AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0 Mobile/14B100 Safari/602.1';
          windowMock.location.pathname = '/complete_signin';

          return appStart.startApp()
            .then(() => {
              assert.isFalse(routerMock.navigate.called);
            });
        });

        it('does not redirect if Mobile Safari and /verify_email', () => {
          windowMock.navigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_1_1 like Mac OS X) ' +
            'AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0 Mobile/14B100 Safari/602.1';
          windowMock.location.pathname = '/verify_email';

          return appStart.startApp()
            .then(() => {
              assert.isFalse(routerMock.navigate.called);
            });
        });

        it('redirects if Mobile Safari and root path', () => {
          windowMock.navigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_1_1 like Mac OS X) ' +
            'AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0 Mobile/14B100 Safari/602.1';
          windowMock.location.pathname = '/';

          return appStart.startApp()
            .then(() => {
              assert.isTrue(routerMock.navigate.called);
            });
        });

      });
    });

    describe('initializeAuthenticationBroker', () => {
      function testExpectedBrokerCreated(ExpectedBroker) {
        return appStart.initializeAuthenticationBroker()
          .then(() => {
            assert.instanceOf(appStart._authenticationBroker, ExpectedBroker);
          });
      }

      beforeEach(() => {
        appStart = new AppStart({
          history: backboneHistoryMock,
          notifier,
          router: routerMock,
          user: userMock,
          window: windowMock
        });
        appStart._metrics = new Metrics({ notifier });
      });

      describe('fx-firstrun-v1', () => {
        it('returns a FxFirstrunV1 broker if `service=sync&context=iframe`', () => {
          windowMock.location.search = Url.objToSearchString({
            context: Constants.IFRAME_CONTEXT,
            service: Constants.SYNC_SERVICE
          });

          return testExpectedBrokerCreated(FxFirstrunV1Broker);
        });
      });

      describe('fx-firstrun-v2', () => {
        it('returns a FxFirstrunV2 broker if `service=sync&context=fx_firstrun_v2`', () => {
          windowMock.location.search = Url.objToSearchString({
            context: Constants.FX_FIRSTRUN_V2_CONTEXT,
            service: Constants.SYNC_SERVICE
          });

          return testExpectedBrokerCreated(FxFirstrunV2Broker);
        });
      });

      describe('fx-desktop-v1', () => {
        it('returns an FxDesktopV1 broker if `context=fx_desktop_v1`', () => {
          windowMock.location.search = Url.objToSearchString({
            context: Constants.FX_DESKTOP_V1_CONTEXT
          });

          return testExpectedBrokerCreated(FxDesktopV1Broker);
        });
      });

      describe('fx-desktop-v2', () => {
        it('returns an FxDesktopV2 broker if `context=fx_desktop_v2`', () => {
          windowMock.location.search = Url.objToSearchString({
            context: Constants.FX_DESKTOP_V2_CONTEXT
          });

          return testExpectedBrokerCreated(FxDesktopV2Broker);
        });
      });

      describe('fx-fennec-v1', () => {
        it('returns an FxFennecV1 broker if `context=fx_fennec_v1`', () => {
          windowMock.location.search = Url.objToSearchString({
            context: Constants.FX_FENNEC_V1_CONTEXT
          });

          return testExpectedBrokerCreated(FxFennecV1Broker);
        });
      });

      describe('fx-ios-v1', () => {
        it('returns an FxiOSV1 broker if `context=fx_ios_v1`', () => {
          windowMock.location.search = Url.objToSearchString({
            context: Constants.FX_IOS_V1_CONTEXT
          });

          return testExpectedBrokerCreated(FxiOSV1Broker);
        });
      });

      describe('deprecated oauth iframe support', () => {
        it('returns an Redirect broker if `context=iframe` is present and in an iframe', () => {
          windowMock.top = new WindowMock();
          windowMock.location.search = Url.objToSearchString({
            client_id: 'client id', //eslint-disable-line camelcase
            context: Constants.IFRAME_CONTEXT
          });

          return testExpectedBrokerCreated(RedirectBroker);
        });

        it('returns a Redirect broker if `context=iframe` is not present and in an iframe - for Marketplace on Android', () => {
          windowMock.top = new WindowMock();
          windowMock.location.search = Url.objToSearchString({
            client_id: 'client id' //eslint-disable-line camelcase
          });

          return testExpectedBrokerCreated(RedirectBroker);
        });
      });

      describe('redirect', () => {
        it('returns a Redirect broker if `client_id` is available', () => {
          windowMock.location.search = Url.objToSearchString({
            client_id: 'client id' //eslint-disable-line camelcase
          });

          return testExpectedBrokerCreated(RedirectBroker);
        });

        it('returns a Redirect broker if both `code` and `service` are available - for verification flows', () => {
          windowMock.location.search = Url.objToSearchString({
            code: 'the code',
            service: 'the service',
            uid: 'users id'
          });

          return testExpectedBrokerCreated(RedirectBroker);
        });

        it('returns a Redirect broker if user directly browses to `/oauth/signin`', () => {
          windowMock.location.href = '/oauth/signin';

          return testExpectedBrokerCreated(RedirectBroker);
        });

        it('returns a Redirect broker if user directly browses to `/oauth/signup`', () => {
          windowMock.location.href = '/oauth/signup';

          return testExpectedBrokerCreated(RedirectBroker);
        });
      });

      describe('base', () => {
        it('returns a Base broker if the user directly browses to any other page', () => {
          windowMock.location.href = '/settings';

          return testExpectedBrokerCreated(BaseBroker);
        });

        it('returns a BaseBroker if verifying a Sync signup', () => {
          windowMock.location.search = Url.objToSearchString({
            code: 'the code',
            service: Constants.SYNC_SERVICE,
            uid: 'users id'
          });

          return testExpectedBrokerCreated(BaseBroker);
        });
      });

      describe('broker errors', () => {
        it('are logged to metrics', () => {
          sinon.stub(appStart, 'captureError', sinon.spy());

          return appStart.initializeAuthenticationBroker()
            .then(() => {
              var err = new Error('test error');
              appStart._authenticationBroker.trigger('error', err);
              assert.isTrue(appStart.captureError.called);
            });
        });
      });
    });

    describe('initializeRelier', () => {
      beforeEach(() => {
        appStart = new AppStart({
          broker: brokerMock,
          history: backboneHistoryMock,
          router: routerMock,
          user: userMock,
          window: windowMock
        });
      });

      it('creates an SyncRelier if Sync', () => {
        sinon.stub(appStart, '_isServiceSync', () => true);

        appStart.initializeRelier();
        assert.instanceOf(appStart._relier, SyncRelier);
      });

      it('creates an OAuthRelier if in the OAuth flow, even if service=sync is specified', () => {
        sinon.stub(appStart, '_isOAuth', () => true);
        sinon.stub(appStart, '_isServiceSync', () => true);

        appStart.initializeRelier();
        assert.instanceOf(appStart._relier, OAuthRelier);
      });

      it('creates a Relier by default', () => {
        appStart.initializeRelier();
        assert.instanceOf(appStart._relier, Relier);
      });
    });

    describe('initializeUser', () => {
      beforeEach(() => {
        appStart = new AppStart({
          broker: brokerMock,
          history: backboneHistoryMock,
          router: routerMock,
          window: windowMock
        });
        appStart.useConfig({});
      });

      it('creates a user', () => {
        appStart.initializeUser();
        assert.isDefined(appStart._user);
      });

      it('sets the user uniqueUserId', () => {
        appStart.initializeUser();
        assert.isDefined(appStart._user.get('uniqueUserId'));
      });
    });

    describe('initializeErrorMetrics', () => {
      beforeEach(() => {
        appStart = new AppStart({
          broker: brokerMock,
          history: backboneHistoryMock,
          router: routerMock,
          window: windowMock
        });
        appStart.useConfig({});
      });

      it('skips error metrics on empty config', () => {
        appStart.initializeAble();
        var ableChoose = sinon.stub(appStart._able, 'choose', () => {
          return true;
        });

        appStart.initializeErrorMetrics();
        assert.isUndefined(appStart._sentryMetrics);
        ableChoose.restore();
      });

      it('skips error metrics if env is not defined', () => {
        appStart.useConfig({ });
        appStart.initializeAble();

        appStart.initializeErrorMetrics();
        assert.isUndefined(appStart._sentryMetrics);
      });

      it('creates error metrics', () => {
        var appStart = new AppStart({
          broker: brokerMock,
          history: backboneHistoryMock,
          router: routerMock,
          window: windowMock
        });
        appStart.useConfig({ env: 'development' });
        appStart.initializeAble();

        var ableChoose = sinon.stub(appStart._able, 'choose', () => {
          return true;
        });

        appStart.initializeErrorMetrics();
        assert.isDefined(appStart._sentryMetrics);

        ableChoose.restore();
      });
    });

    describe('_getUniqueUserId', () => {
      beforeEach(() => {
        appStart = new AppStart({
          broker: brokerMock,
          history: backboneHistoryMock,
          router: routerMock,
          window: windowMock
        });
        appStart.useConfig({});
      });

      it('creates a user id', () => {
        assert.isDefined(appStart._getUniqueUserId());
      });
    });

    describe('initializeRouter', () => {
      beforeEach(() => {
        appStart = new AppStart({
          broker: brokerMock,
          history: backboneHistoryMock,
          notifier: notifier,
          window: windowMock
        });
        appStart.useConfig({});
      });

      it('creates a router', () => {
        appStart.initializeRouter();
        assert.isDefined(appStart._router);
      });
    });

    describe('initializeIframeChannel', () => {
      beforeEach(() => {
        windowMock.location.search = '?context=fx_ios_v1&service=sync&origin=' + encodeURIComponent('http://127.0.0.1:8111');
        appStart = new AppStart({
          broker: brokerMock,
          history: backboneHistoryMock,
          window: windowMock
        });
      });

      it('creates an iframe channel if in an iframe', () => {
        windowMock.top = new WindowMock();

        appStart.initializeIframeChannel();
        assert.isDefined(appStart._iframeChannel);
        assert.equal(appStart._iframeChannel.origin, 'http://127.0.0.1:8111');
      });

      it('creates a null iframe channel if not in an iframe', () => {
        appStart.initializeIframeChannel();
        assert.instanceOf(appStart._iframeChannel, NullChannel);
      });
    });

    describe('initializeHeightObserver', () => {
      beforeEach(() => {
        appStart = new AppStart({
          broker: brokerMock,
          history: backboneHistoryMock,
          router: routerMock,
          user: userMock,
          window: windowMock
        });
      });

      it('sets up the HeightObserver, triggers a `resize` notification on the iframe channel when the height changes', function (done) {
        sinon.stub(appStart, '_isInAnIframe', () => {
          return true;
        });

        appStart._iframeChannel = {
          send (message, data) {
            TestHelpers.wrapAssertion(() => {
              assert.equal(message, 'resize');
              assert.typeOf(data.height, 'number');
            }, done);
          }
        };

        appStart.initializeHeightObserver();
      });
    });

    describe('initializeRefreshObserver', () => {
      beforeEach(() => {
        appStart = new AppStart({
          notifier: notifier,
          window: windowMock
        });
      });

      it('creates a RefreshObserver instance', () => {
        appStart.initializeRefreshObserver();
        assert.instanceOf(appStart._refreshObserver, RefreshObserver);
      });
    });

    describe('testLocalStorage', () => {
      describe('with localStorage disabled', () => {
        var err;

        beforeEach(() => {
          err = new Error('NS_ERROR_FILE_ACCESS_DENIED');

          appStart = new AppStart({
            storage: {
              testLocalStorage: sinon.spy(() => {
                throw err;
              })
            }
          });

          sinon.stub(appStart, 'captureError', sinon.spy());

          return appStart.testLocalStorage();
        });

        it('logs the error', () => {
          assert.isTrue(appStart.captureError.calledWith(err));
        });
      });
    });

    describe('captureError', () => {
      var err;
      var metricsMock;
      var sentryMock;

      beforeEach(() => {
        sinon.spy(backboneHistoryMock, 'start');

        err = new Error('NS_ERROR_FILE_ACCESS_DENIED');

        metricsMock = {
          flush: sinon.spy(() => {
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
            testLocalStorage: sinon.spy(() => {
              throw err;
            })
          }
        });

        return appStart.captureError(err);
      });

      it('logs the error to sentry', () => {
        assert.isTrue(sentryMock.captureException.calledWith(err));
      });

      it('logs the error to metrics', () => {
        assert.isTrue(metricsMock.logError.calledWith(err));
        assert.isTrue(metricsMock.flush.called);
      });
    });

    describe('allResourcesReady', () => {
      let requireOnDemandMock;

      beforeEach(() => {
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

    describe('_getContext', () => {
      describe('in a verification flow', () => {
        beforeEach(() => {
          appStart = new AppStart({
            notifier: notifier,
            window: windowMock
          });

          sinon.stub(appStart, '_isVerification', () => {
            return true;
          });

          sinon.spy(appStart, '_getVerificationContext');

          appStart._getContext();
        });

        it('calls `_getVerificationContext`', () => {
          assert.isTrue(appStart._getVerificationContext.called);
        });
      });

      describe('in a non-verification flow', () => {
        describe('with a `context` in the query parameters', () => {
          beforeEach(() => {
            windowMock.location.search = '?context=fx_ios_v1';

            appStart = new AppStart({
              notifier: notifier,
              window: windowMock
            });

            sinon.stub(appStart, '_isVerification', () => {
              return false;
            });

          });

          it('returns the `context` from the query parameters', () => {
            assert.equal(appStart._getContext(), 'fx_ios_v1');
          });
        });

        describe('without a `context` in the query parameters', () => {
          beforeEach(() => {
            windowMock.location.search = '?';

            appStart = new AppStart({
              notifier: notifier,
              window: windowMock
            });

            sinon.stub(appStart, '_isVerification', () => {
              return false;
            });
          });

          it('returns `undefined`', () => {
            assert.isUndefined(appStart._getContext());
          });
        });
      });
    });

    describe('_getVerificationContext', () => {
      let sameBrowserVerificationModelContext;

      beforeEach(() => {
        sameBrowserVerificationModelContext = undefined;

        appStart = new AppStart({
          notifier: notifier,
          window: windowMock
        });

        sinon.stub(appStart, '_getSameBrowserVerificationModel', () => {
          return {
            get () {
              return sameBrowserVerificationModelContext;
            }
          };
        });
      });

      describe('with a stored `context`', () => {
        beforeEach(() => {
          sameBrowserVerificationModelContext = 'fx_ios_v1';

          appStart._getVerificationContext();
        });

        it('returns the stored context', () => {
          assert.isTrue(appStart._getSameBrowserVerificationModel.called);
          assert.equal(appStart._getVerificationContext(), 'fx_ios_v1');
        });
      });

      describe('without a stored `context`, sync verification', () => {
        it('returns sync context', () => {
          sinon.stub(appStart, '_isServiceSync', () => true);
          assert.equal(appStart._getVerificationContext(), Constants.FX_SYNC_CONTEXT);
        });
      });

      describe('without a stored `context`, oauth verification', () => {
        it('returns oauth context', () => {
          sinon.stub(appStart, '_isServiceOAuth', () => true);
          assert.equal(appStart._getVerificationContext(), Constants.OAUTH_CONTEXT);
        });
      });

      describe('without a stored `context`, web verification', () => {
        it('returns web context', () => {
          assert.equal(appStart._getVerificationContext(), Constants.CONTENT_SERVER_CONTEXT);
        });
      });
    });

    describe('_getSameBrowserVerificationModel', () => {
      beforeEach(() => {
        appStart = new AppStart({
          notifier: notifier,
          window: windowMock
        });
      });

      it('gets a `SameBrowserVerificationModel` instance', () => {
        assert.instanceOf(
          appStart._getSameBrowserVerificationModel('context'),
          SameBrowserVerificationModel
        );
      });
    });

    describe('upgradeStorageFormats', () => {
      beforeEach(() => {
        appStart = new AppStart({
          user: userMock,
          window: windowMock
        });

        sinon.spy(userMock, 'upgradeFromUnfilteredAccountData');
        sinon.spy(userMock, 'upgradeFromSession');
        sinon.spy(userMock, 'removeAccountsWithInvalidUid');

        return appStart.upgradeStorageFormats();
      });

      it('upgrades and fixes account data', () => {
        assert.isTrue(userMock.upgradeFromUnfilteredAccountData.calledOnce);
        assert.isTrue(userMock.upgradeFromSession.calledOnce);
        assert.isTrue(userMock.removeAccountsWithInvalidUid.calledOnce);
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
