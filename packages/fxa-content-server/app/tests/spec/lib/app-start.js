/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'sinon',
  'lib/app-start',
  'lib/session',
  'lib/constants',
  'lib/promise',
  'lib/url',
  'lib/oauth-errors',
  'lib/auth-errors',
  'models/auth_brokers/base',
  'models/auth_brokers/fx-desktop',
  'models/auth_brokers/iframe',
  'models/auth_brokers/redirect',
  'models/auth_brokers/web-channel',
  'models/reliers/base',
  'models/reliers/fx-desktop',
  'models/reliers/oauth',
  'models/reliers/relier',
  'models/user',
  'lib/metrics',
  'lib/storage-metrics',
  '../../mocks/window',
  '../../mocks/router',
  '../../mocks/history',
  '../../lib/helpers'
],
function (chai, sinon, AppStart, Session, Constants, p, Url, OAuthErrors,
      AuthErrors, BaseBroker, FxDesktopBroker, IframeBroker, RedirectBroker,
      WebChannelBroker, BaseRelier, FxDesktopRelier, OAuthRelier, Relier,
      User, Metrics, StorageMetrics, WindowMock, RouterMock, HistoryMock,
      TestHelpers) {
  /*global describe, beforeEach, it*/
  var assert = chai.assert;
  var FIRSTRUN_ORIGIN = 'https://firstrun.firefox.com';
  var HELLO_ORIGIN = 'https://hello.firefox.com';

  describe('lib/app-start', function () {
    var windowMock;
    var routerMock;
    var historyMock;
    var brokerMock;
    var userMock;
    var appStart;

    beforeEach(function () {
      windowMock = new WindowMock();
      windowMock.parent = new WindowMock();

      routerMock = new RouterMock();
      historyMock = new HistoryMock();
      userMock = new User();
      brokerMock = new BaseBroker();
    });

    describe('startApp', function () {
      beforeEach(function () {
        appStart = new AppStart({
          window: windowMock,
          router: routerMock,
          history: historyMock,
          user: userMock,
          broker: brokerMock
        });
      });

      it('starts the app', function () {
        return appStart.startApp()
          .then(function () {
            // translator is put on the global object.
            assert.isDefined(windowMock.translator);
          });
      });

      it('redirects to /cookies_disabled if localStorage is disabled', function () {
        appStart.useConfig({
          localStorageEnabled: false,
          i18n: {
            supportedLanguages: ['en'],
            defaultLang: 'en'
          }
        });

        return appStart.startApp()
            .then(function () {
              assert.equal(routerMock.page, 'cookies_disabled');
            });
      });

      it('does not redirect if at /cookies_disabled and cookies are disabled', function () {
        windowMock.location.pathname = '/cookies_disabled';
        appStart.useConfig({
          localStorageEnabled: false,
          i18n: {
            supportedLanguages: ['en'],
            defaultLang: 'en'
          }
        });

        sinon.spy(routerMock, 'navigate');

        return appStart.startApp()
          .then(function () {
            assert.isFalse(routerMock.navigate.called);
          });
      });

      it('redirects to the `INTERNAL_ERROR_PAGE` if an error occurs', function () {
        sinon.stub(appStart, '_selectStartPage', function () {
          return p.reject(new Error('boom!'));
        });

        return appStart.startApp()
          .then(function () {
            assert.equal(windowMock.location.href, Constants.INTERNAL_ERROR_PAGE);
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

      it('tracks window errors', function () {
        var message = 'Fake ReferenceError: xyz is not defined. ' +
          'Testing length of a long window.onerror error message here, that is more than the given limit';

        return appStart.startApp()
          .then(function () {
            appStart._metrics = new Metrics();
            window.onerror.call(window, message, document.location.toString(), 2);
          })
          .then(function () {
            var expectedMessage = message.substring(0, Constants.ONERROR_MESSAGE_LIMIT);
            assert.isTrue(TestHelpers.isEventLogged(appStart._metrics, 'error.onwindow.' + expectedMessage));
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
          window: windowMock,
          router: routerMock,
          history: historyMock,
          user: userMock
        });
        appStart._metrics = new Metrics();
      });

      describe('fx-desktop', function () {
        it('returns an FxDesktop broker if `context=fx_desktop_v1`', function () {
          windowMock.location.search = Url.objToSearchString({
            context: Constants.FX_DESKTOP_CONTEXT
          });

          return testExpectedBrokerCreated(FxDesktopBroker);
        });

        it('returns an FxDesktop broker if `service=sync&context=iframe`', function () {
          windowMock.location.search = Url.objToSearchString({
            service: Constants.FX_DESKTOP_SYNC,
            context: Constants.IFRAME_CONTEXT
          });

          return testExpectedBrokerCreated(FxDesktopBroker);
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
            //jshint camelcase: false
            client_id: 'client id',
            webChannelId: 'channel id'
          });

          windowMock.location.search = Url.objToSearchString({
            code: 'code',
            service: 'client id'
          });

          return testExpectedBrokerCreated(WebChannelBroker);
        });
      });

      describe('iframe', function () {
        it('returns an Iframe broker if `context=iframe` is present and in an iframe', function () {
          windowMock.top = new WindowMock();
          windowMock.location.search = Url.objToSearchString({
            context: Constants.IFRAME_CONTEXT,
            //jshint camelcase: false
            client_id: 'client id'
          });

          return testExpectedBrokerCreated(IframeBroker);
        });

        it('returns a Redirect broker if `context=iframe` is not present and in an iframe - for Marketplace on Android', function () {
          windowMock.top = new WindowMock();
          windowMock.location.search = Url.objToSearchString({
            //jshint camelcase: false
            client_id: 'client id'
          });

          return testExpectedBrokerCreated(RedirectBroker);
        });
      });

      describe('redirect', function () {
        it('returns a Redirect broker if `client_id` is available', function () {
          windowMock.location.search = Url.objToSearchString({
            //jshint camelcase: false
            client_id: 'client id'
          });

          return testExpectedBrokerCreated(RedirectBroker);
        });

        it('returns a Redirect broker if both `code` and `service` are available - for verification flows', function () {
          windowMock.location.search = Url.objToSearchString({
            code: 'the code',
            service: 'the service'
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
      });
    });

    describe('initializeRelier', function () {
      beforeEach(function () {
        appStart = new AppStart({
          window: windowMock,
          router: routerMock,
          history: historyMock,
          user: userMock,
          broker: brokerMock
        });
      });

      it('creates an FxDesktopRelier if Firefox Desktop', function () {
        sinon.stub(appStart, '_isFxDesktop', function () {
          return true;
        });

        appStart.initializeRelier();
        assert.instanceOf(appStart._relier, FxDesktopRelier);
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
          window: windowMock,
          router: routerMock,
          history: historyMock,
          user: userMock,
          broker: brokerMock
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
          window: windowMock,
          router: routerMock,
          history: historyMock,
          broker: brokerMock
        });
        appStart.useConfig({});
      });

      it('creates a user', function () {
        appStart.initializeUser();
        assert.isDefined(appStart._user);
      });
    });

    describe('initializeRouter', function () {
      beforeEach(function () {
        appStart = new AppStart({
          window: windowMock,
          history: historyMock,
          broker: brokerMock
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
          window: windowMock,
          history: historyMock,
          broker: brokerMock
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

      it('does not create an iframe channel if not in an iframe', function () {
        sinon.spy(appStart, '_checkParentOrigin');

        return appStart.initializeIframeChannel()
          .then(function () {
            assert.isUndefined(appStart._iframeChannel);
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
          window: windowMock,
          history: historyMock,
          broker: brokerMock,
          relier: relierMock
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

        sinon.stub(appStart, '_isFxDesktop', function () {
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
          window: windowMock,
          history: historyMock,
          broker: brokerMock,
          relier: relierMock
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


    describe('allResourcesReady', function () {
      beforeEach(function () {
        appStart = new AppStart({
          window: windowMock,
          router: routerMock,
          history: historyMock,
          user: userMock,
          broker: brokerMock
        });
      });

      it('should set the window hash if in an iframe', function () {
        sinon.stub(appStart, '_selectStartPage', function () {
          return p();
        });

        sinon.stub(appStart, '_isInAnIframe', function () {
          return true;
        });

        windowMock.location.pathname = 'signup';
        return appStart.allResourcesReady()
          .then(function () {
            assert.equal(windowMock.location.hash, 'signup');
          });
      });
    });
  });
});


