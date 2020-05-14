/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AppStart from 'lib/app-start';
import { assert } from 'chai';
import BaseBroker from 'models/auth_brokers/base';
import Constants from 'lib/constants';
import ErrorUtils from 'lib/error-utils';
import ExperimentGroupingRules from 'lib/experiments/grouping-rules';
import FxFennecV1Broker from 'models/auth_brokers/fx-fennec-v1';
import FxiOSV1Broker from 'models/auth_brokers/fx-ios-v1';
import HistoryMock from '../../mocks/history';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import OAuthRelier from 'models/reliers/oauth';
import RedirectBroker from 'models/auth_brokers/oauth-redirect';
import RefreshObserver from 'models/refresh-observer';
import Relier from 'models/reliers/relier';
import SameBrowserVerificationModel from 'models/verification/same-browser';
import sinon from 'sinon';
import Storage from 'lib/storage';
import StorageMetrics from 'lib/storage-metrics';
import BrowserRelier from 'models/reliers/browser';
import Url from 'lib/url';
import User from 'models/user';
import WindowMock from '../../mocks/window';

describe('lib/app-start', () => {
  let appStart;
  let backboneHistoryMock;
  let brokerMock;
  let config;
  let notifier;
  let routerMock;
  let translator;
  let userMock;
  let windowMock;

  beforeEach(() => {
    brokerMock = new BaseBroker();
    backboneHistoryMock = new HistoryMock();
    config = {
      env: 'production',
      featureFlags: {
        foo: 'bar',
      },
      surveys: [
        {
          id: 'portugese-speaking-mobile-users-in-southern-hemisphere',
          conditions: {},
          view: 'settings',
          rate: 0.1,
          url: 'https://www.surveygizmo.com/s3/5541940/pizza',
        }
      ]
    };
    notifier = new Notifier();
    routerMock = { navigate: sinon.spy() };
    translator = {
      fetch: sinon.spy(() => Promise.resolve()),
    };

    userMock = new User();

    windowMock = new WindowMock();
    windowMock.parent = new WindowMock();

    appStart = new AppStart({
      broker: brokerMock,
      config,
      history: backboneHistoryMock,
      notifier,
      router: routerMock,
      storage: Storage,
      translator,
      user: userMock,
      window: windowMock,
    });
  });

  it('startApp starts the app, does not redirect', () => {
    return appStart.startApp().then(() => {
      assert.isFalse(routerMock.navigate.called);
    });
  });

  it('startApp delegates to `fatalError` if an error occurs', () => {
    const err = new Error('boom');
    sinon.stub(appStart, 'allResourcesReady').callsFake(() => {
      return Promise.reject(err);
    });

    sinon.stub(appStart, 'fatalError').callsFake(() => {});

    return appStart.startApp().then(() => {
      assert.isTrue(appStart.fatalError.calledWith(err));
    });
  });

  it('startApp uses storage metrics when an automated browser is detected', () => {
    windowMock.location.search = Url.objToSearchString({
      automatedBrowser: true,
    });

    return appStart.startApp().then(() => {
      assert.instanceOf(appStart._metrics, StorageMetrics);
    });
  });

  it('initializeL10n fetches translations', () => {
    return appStart.initializeL10n().then(() => {
      assert.ok(appStart._translator.fetch.calledOnce);
    });
  });

  it('initializeExperimentGroupingRules propagates env and featureFlags', () => {
    assert.isUndefined(appStart._experimentGroupingRules);

    appStart.initializeExperimentGroupingRules();

    assert.instanceOf(
      appStart._experimentGroupingRules,
      ExperimentGroupingRules
    );
    assert.equal(appStart._experimentGroupingRules._env, 'production');
    assert.deepEqual(appStart._experimentGroupingRules._featureFlags, {
      foo: 'bar',
    });
  });

  it('initializeErrorMetrics creates error metrics', () => {
    appStart.initializeExperimentGroupingRules();

    const ableChoose = sinon
      .stub(appStart._experimentGroupingRules, 'choose')
      .callsFake(() => {
        return true;
      });

    appStart.initializeErrorMetrics();
    assert.isDefined(appStart._sentryMetrics);

    ableChoose.restore();
  });

  it('_getUniqueUserId creates a user id', () => {
    assert.isDefined(appStart._getUniqueUserId());
  });

  it('initializeSurveyTargeter creates targeter', () => {
    appStart.initializeSurveyTargeter();
    assert.isDefined(appStart._surveyTargeter);
  });

  it('initializeRouter creates a router', () => {
    appStart.initializeRouter();
    assert.isDefined(appStart._router);
  });

  it('initializeRefreshObserver creates a RefreshObserver instance', () => {
    appStart.initializeRefreshObserver();
    assert.instanceOf(appStart._refreshObserver, RefreshObserver);
  });

  describe('without config', () => {
    beforeEach(() => {
      appStart = new AppStart({
        broker: brokerMock,
        history: backboneHistoryMock,
        router: routerMock,
        window: windowMock,
      });
    });

    it('initializeErrorMetrics skips error metrics on empty config', () => {
      appStart.initializeExperimentGroupingRules();
      const ableChoose = sinon
        .stub(appStart._experimentGroupingRules, 'choose')
        .callsFake(() => {
          return true;
        });

      appStart.initializeErrorMetrics();
      assert.isUndefined(appStart._sentryMetrics);
      ableChoose.restore();
    });

    it('initializeErrorMetrics skips error metrics if env is not defined', () => {
      appStart.initializeExperimentGroupingRules();

      appStart.initializeErrorMetrics();
      assert.isUndefined(appStart._sentryMetrics);
    });

    it('initializeSurveyTargeter _surveyTargeter should be undefined', () => {
      appStart.initializeSurveyTargeter();
      assert.isUndefined(appStart._surveyTargeter);
    });
  });

  describe('fatalError', () => {
    var err;
    var sandbox;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();

      sandbox.spy(appStart, 'enableSentryMetrics');
      sandbox.stub(ErrorUtils, 'fatalError').callsFake(() => {});

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

  describe('with localStorage disabled', () => {
    var sandbox;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.stub(Storage, 'isLocalStorageEnabled').callsFake(() => {
        return false;
      });
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('redirects to /cookies_disabled without history replace or trigger', () => {
      return appStart.startApp().then(() => {
        assert.isTrue(
          routerMock.navigate.calledWith(
            'cookies_disabled',
            {},
            { replace: true, trigger: true }
          )
        );
      });
    });

    it('does not redirect if path is already /cookies_disabled', () => {
      windowMock.location.pathname = '/cookies_disabled';
      return appStart.startApp().then(() => {
        assert.isFalse(routerMock.navigate.called);
      });
    });

    it('does not redirect if Mobile Safari and /complete_signin', () => {
      windowMock.navigator.userAgent =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 10_1_1 like Mac OS X) ' +
        'AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0 Mobile/14B100 Safari/602.1';
      windowMock.location.pathname = '/complete_signin';

      return appStart.startApp().then(() => {
        assert.isFalse(routerMock.navigate.called);
      });
    });

    it('does not redirect if Mobile Safari and /verify_email', () => {
      windowMock.navigator.userAgent =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 10_1_1 like Mac OS X) ' +
        'AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0 Mobile/14B100 Safari/602.1';
      windowMock.location.pathname = '/verify_email';

      return appStart.startApp().then(() => {
        assert.isFalse(routerMock.navigate.called);
      });
    });

    it('redirects if Mobile Safari and root path', () => {
      windowMock.navigator.userAgent =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 10_1_1 like Mac OS X) ' +
        'AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0 Mobile/14B100 Safari/602.1';
      windowMock.location.pathname = '/';

      return appStart.startApp().then(() => {
        assert.isTrue(routerMock.navigate.called);
      });
    });
  });

  describe('initializeAuthenticationBroker', () => {
    function testExpectedBrokerCreated(ExpectedBroker) {
      sinon.stub(appStart, '_isVerificationSameBrowser').callsFake(() => true);
      return appStart.initializeAuthenticationBroker().then(() => {
        assert.instanceOf(appStart._authenticationBroker, ExpectedBroker);
        assert.isTrue(
          appStart._authenticationBroker.get('isVerificationSameBrowser')
        );
      });
    }

    beforeEach(() => {
      appStart = new AppStart({
        history: backboneHistoryMock,
        notifier,
        router: routerMock,
        user: userMock,
        window: windowMock,
      });
      appStart._metrics = new Metrics({ notifier });
    });

    afterEach(() => {
      appStart._metrics.destroy();
      appStart._metrics = null;
    });

    describe('fx-fennec-v1', () => {
      it('returns an FxFennecV1 broker if `context=fx_fennec_v1`', () => {
        windowMock.location.search = Url.objToSearchString({
          context: Constants.FX_FENNEC_V1_CONTEXT,
        });

        return testExpectedBrokerCreated(FxFennecV1Broker);
      });
    });

    describe('fx-ios-v1', () => {
      it('returns an FxiOSV1 broker if `context=fx_ios_v1`', () => {
        windowMock.location.search = Url.objToSearchString({
          context: Constants.FX_IOS_V1_CONTEXT,
        });

        return testExpectedBrokerCreated(FxiOSV1Broker);
      });
    });

    describe('redirect', () => {
      it('returns a Redirect broker if `client_id` is available', () => {
        windowMock.location.search = Url.objToSearchString({
          client_id: 'client id', //eslint-disable-line camelcase
        });

        return testExpectedBrokerCreated(RedirectBroker);
      });

      it('returns a Redirect broker if both `code` and `service` are available - for verification flows', () => {
        windowMock.location.search = Url.objToSearchString({
          code: 'the code',
          service: 'the service',
          uid: 'users id',
        });

        return testExpectedBrokerCreated(RedirectBroker);
      });

      it('returns a Redirect broker if user directly browses to `/oauth/signin`', () => {
        windowMock.location.pathname = '/oauth/signin';

        return testExpectedBrokerCreated(RedirectBroker);
      });

      it('returns a Redirect broker if user directly browses to `/oauth/signup`', () => {
        windowMock.location.pathname = '/oauth/signup';

        return testExpectedBrokerCreated(RedirectBroker);
      });
    });

    describe('base', () => {
      it('returns a Base broker if the user directly browses to any other page', () => {
        windowMock.location.pathname = '/settings';

        return testExpectedBrokerCreated(BaseBroker);
      });

      it('returns a BaseBroker if verifying a Sync signup', () => {
        windowMock.location.search = Url.objToSearchString({
          code: 'the code',
          service: Constants.SYNC_SERVICE,
          uid: 'users id',
        });

        return testExpectedBrokerCreated(BaseBroker);
      });
    });

    describe('broker errors', () => {
      it('are logged to metrics', () => {
        sinon.spy(appStart, 'captureError');

        return appStart.initializeAuthenticationBroker().then(() => {
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
        window: windowMock,
      });
    });

    it('creates an BrowserRelier if Sync', () => {
      sinon.stub(appStart, '_isServiceSync').callsFake(() => true);

      appStart.initializeRelier();
      assert.instanceOf(appStart._relier, BrowserRelier);
    });

    it('creates an OAuthRelier if in the OAuth flow, even if service=sync is specified', () => {
      sinon.stub(appStart, '_isOAuth').callsFake(() => true);
      sinon.stub(appStart, '_isServiceSync').callsFake(() => true);

      appStart.initializeRelier();
      assert.instanceOf(appStart._relier, OAuthRelier);
    });

    it('creates a SupplicantRelier', () => {
      appStart._window.location.pathname = '/pair/supp';

      appStart.initializeRelier();
      assert.equal(appStart._relier.constructor.name, 'SupplicantRelier');
    });

    it('creates a AuthorityRelier', () => {
      appStart._window.location.search = `?redirect_uri=${Constants.DEVICE_PAIRING_AUTHORITY_REDIRECT_URI}`;

      appStart.initializeRelier();
      assert.equal(appStart._relier.constructor.name, 'AuthorityRelier');
    });

    it('creates a Relier by default', () => {
      appStart.initializeRelier();
      assert.instanceOf(appStart._relier, Relier);
    });
  });

  describe('initializeUser', () => {
    let sandbox;

    beforeEach(() => {
      // sandbox is used because stubs are added to User.prototype.
      sandbox = sinon.sandbox.create();

      appStart = new AppStart({});

      sandbox
        .stub(User.prototype, 'removeAccountsWithInvalidUid')
        .callsFake(() => Promise.resolve());

      sandbox.stub(appStart, '_updateUserFromSigninCodeAccount');
      sandbox.stub(appStart, '_updateUserFromBrowserAccount');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('creates a user, sets the uniqueUserId, populates from the browser', () => {
      return appStart.initializeUser().then(result => {
        assert.isDefined(appStart._user);
        assert.isDefined(appStart._user.get('uniqueUserId'));
        assert.isTrue(appStart._updateUserFromSigninCodeAccount.calledOnce);
        assert.isTrue(appStart._updateUserFromBrowserAccount.calledOnce);
      });
    });
  });

  describe('_updateUserFromSigninCodeAccount', () => {
    let signinCodeAccountData;
    let user;

    beforeEach(() => {
      signinCodeAccountData = { email: 'testuser@testuser.com', uid: 'uid' };

      user = new User();

      sinon
        .stub(user, 'setSigninCodeAccount')
        .callsFake(() => Promise.resolve());

      brokerMock.set('signinCodeAccount', signinCodeAccountData);

      appStart = new AppStart({
        broker: brokerMock,
      });

      appStart._user = user;
    });

    it('delegates to user.setSigninCodeAccount', () => {
      return appStart._updateUserFromSigninCodeAccount().then(() => {
        assert.isTrue(user.setSigninCodeAccount.calledOnce);
        assert.isTrue(
          user.setSigninCodeAccount.calledWith(signinCodeAccountData)
        );
      });
    });
  });

  describe('_updateUserFromBrowserAccount', () => {
    let account;
    let browserAccountData;
    let user;

    beforeEach(() => {
      browserAccountData = { email: 'testuser@testuser.com', uid: 'uid' };

      user = new User();

      sinon
        .stub(user, 'shouldSetSignedInAccountFromBrowser')
        .callsFake(() => true);
      sinon.stub(user, 'mergeBrowserAccount').callsFake(accountData => {
        account = user.initAccount(accountData);
        return Promise.resolve(account);
      });
      sinon
        .stub(user, 'setSigninCodeAccount')
        .callsFake(() => Promise.resolve());
      sinon.stub(user, 'updateSignedInAccount');

      brokerMock.set('browserSignedInAccount', browserAccountData);

      appStart = new AppStart({
        broker: brokerMock,
        relier: new Relier({ service: 'sync' }),
      });

      appStart._user = user;
      sinon.stub(appStart, 'isDevicePairingAsAuthority').callsFake(() => true);
    });

    it('populates from the browser, updates the signed in account', () => {
      return appStart._updateUserFromBrowserAccount().then(result => {
        assert.isTrue(
          user.mergeBrowserAccount.calledOnceWith(browserAccountData)
        );

        assert.isTrue(user.shouldSetSignedInAccountFromBrowser.calledOnce);
        assert.isTrue(
          user.shouldSetSignedInAccountFromBrowser.calledWith(
            'sync',
            true,
            account
          )
        );

        assert.isTrue(user.updateSignedInAccount.calledOnceWith(account));
      });
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
            }),
          },
        });
        sinon.spy(appStart, 'captureError');

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
          return Promise.resolve();
        }),
        logError: sinon.spy(),
      };

      sentryMock = {
        captureException: sinon.spy(),
      };

      appStart = new AppStart({
        metrics: metricsMock,
        sentryMetrics: sentryMock,
        storage: {
          testLocalStorage: sinon.spy(() => {
            throw err;
          }),
        },
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
    beforeEach(() => {
      sinon.spy(backboneHistoryMock, 'start');

      appStart = new AppStart({
        broker: brokerMock,
        history: backboneHistoryMock,
        router: routerMock,
        user: userMock,
        window: windowMock,
      });
    });

    it('should start history with `pushState: true` if supported', () => {
      appStart.allResourcesReady();
      assert.isTrue(
        backboneHistoryMock.start.calledWith({
          pushState: true,
          silent: false,
        })
      );
    });

    it('should start history with `pushState: false` if supported', () => {
      sinon.stub(windowMock.history, 'replaceState').callsFake(() => {
        throw new Error(
          'You fool! This is the FxOS Trusted UI, history is available, but cannot be used.'
        );
      });

      appStart.allResourcesReady();
      assert.isTrue(
        backboneHistoryMock.start.calledWith({
          pushState: false,
          silent: false,
        })
      );
    });

    describe('_selectStartPage', () => {
      it('can select a pair path', () => {
        appStart._window.location.search = `?redirect_uri=${Constants.DEVICE_PAIRING_AUTHORITY_REDIRECT_URI}`;
        assert.equal(appStart._selectStartPage(), 'pair/auth/allow');
      });
    });
  });

  describe('_getContext', () => {
    describe('in a verification flow', () => {
      beforeEach(() => {
        sinon.stub(appStart, '_isVerification').callsFake(() => {
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
            window: windowMock,
          });

          sinon.stub(appStart, '_isVerification').callsFake(() => {
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
            window: windowMock,
          });

          sinon.stub(appStart, '_isVerification').callsFake(() => {
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
        window: windowMock,
      });

      sinon.stub(appStart, '_getSameBrowserVerificationModel').callsFake(() => {
        return {
          get() {
            return sameBrowserVerificationModelContext;
          },
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
        sinon.stub(appStart, '_isServiceSync').callsFake(() => true);
        assert.equal(
          appStart._getVerificationContext(),
          Constants.FX_SYNC_CONTEXT
        );
      });
    });

    describe('without a stored `context`, oauth verification', () => {
      it('returns oauth context', () => {
        sinon.stub(appStart, '_isServiceOAuth').callsFake(() => true);
        assert.equal(
          appStart._getVerificationContext(),
          Constants.OAUTH_CONTEXT
        );
      });
    });

    describe('without a stored `context`, web verification', () => {
      it('returns web context', () => {
        assert.equal(
          appStart._getVerificationContext(),
          Constants.CONTENT_SERVER_CONTEXT
        );
      });
    });
  });

  describe('_getSameBrowserVerificationModel', () => {
    it('gets a `SameBrowserVerificationModel` instance', () => {
      assert.instanceOf(
        appStart._getSameBrowserVerificationModel('context'),
        SameBrowserVerificationModel
      );
    });
  });

  describe('isReportSignIn', () => {
    it('returns true for pathname = `/report_signin`', () => {
      windowMock.location.pathname = '/report_signin';
      assert.isTrue(appStart._isReportSignIn());
    });

    const notReportSignIn = ['/', '/signup', '/signin', '/force_auth'];
    notReportSignIn.forEach(pathname => {
      it(`returns false for ${pathname}`, () => {
        windowMock.location.pathname = pathname;
        assert.isFalse(appStart._isReportSignIn());
      });
    });
  });

  describe('_getUserStorageInstance', () => {
    it('returns a localStorage store', () => {
      appStart = new AppStart({});
      const storage = appStart._getUserStorageInstance();
      assert.strictEqual(storage._backend, localStorage);
    });
  });

  describe('_isVerification', () => {
    let appStart;
    let sandbox;

    before(() => {
      sandbox = sinon.sandbox.create();
      appStart = new AppStart({
        broker: {},
        relier: {},
        router: {
          getViewOptions: () => {},
        },
      });
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('returns `true` for signup/in verification', () => {
      sandbox.stub(appStart, '_isSignUpVerification').callsFake(() => true);
      assert.isTrue(appStart._isVerification());
    });

    it('returns `true` for password reset verification', () => {
      sandbox
        .stub(appStart, '_isPasswordResetVerification')
        .callsFake(() => true);
      assert.isTrue(appStart._isVerification());
    });

    it('returns `true` when reporting a signin', () => {
      sandbox.stub(appStart, '_isReportSignIn').callsFake(() => true);
      assert.isTrue(appStart._isVerification());
    });

    it('returns `false` otherwise', () => {
      assert.isFalse(appStart._isVerification());
    });
  });

  describe('_isVerificationSameBrowser', () => {
    let appStart;
    let sandbox;

    before(() => {
      sandbox = sinon.sandbox.create();
      appStart = new AppStart({
        broker: {},
        relier: {},
        router: {
          getViewOptions: () => {},
        },
      });
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('returns `true` if verifying in the same browser', () => {
      sandbox.stub(appStart, '_isVerification').callsFake(() => true);
      sandbox
        .stub(appStart, '_getSameBrowserVerificationModel')
        .callsFake(
          () => new SameBrowserVerificationModel({ context: 'context ' }, {})
        );
      assert.isTrue(appStart._isVerificationSameBrowser());
    });

    it('returns `false` if not verifying', () => {
      sandbox.stub(appStart, '_isVerification').callsFake(() => false);
      sandbox
        .stub(appStart, '_getSameBrowserVerificationModel')
        .callsFake(
          () => new SameBrowserVerificationModel({ context: 'context ' }, {})
        );
      assert.isFalse(appStart._isVerificationSameBrowser());
    });

    it('returns `false` if cannot fetch the verification context', () => {
      sandbox.stub(appStart, '_isVerification').callsFake(() => true);
      sandbox
        .stub(appStart, '_getSameBrowserVerificationModel')
        .callsFake(() => new SameBrowserVerificationModel({}, {}));
      assert.isFalse(appStart._isVerificationSameBrowser());
    });
  });
});
