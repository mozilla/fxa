/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// this module starts it all.

/**
 * the flow:
 * 1) Initialize session information from URL search parameters.
 * 2) Fetch /config from the backend, the returned info includes a flag that
 *    indicates whether cookies are enabled.
 * 3) Fetch translations from the backend.
 * 4) Create the web/desktop communication channel.
 * 5) If cookies are disabled, go to the /cookies_disabled page.
 * 6) Start the app if cookies are enabled.
 */

import _ from 'underscore';
import ExperimentGroupingRules from './experiments/grouping-rules/index';
import AppView from '../views/app';
import authBrokers from '../models/auth_brokers/index';
import AuthorityRelier from '../models/reliers/pairing/authority';
import Backbone from 'backbone';
import Cocktail from './cocktail';
import Constants from './constants';
import Environment from './environment';
import ErrorUtils from './error-utils';
import FormPrefill from '../models/form-prefill';
import FxaClient from './fxa-client';
import InterTabChannel from './channels/inter-tab';
import Metrics from './metrics';
import Notifier from './channels/notifier';
import OAuthClient from './oauth-client';
import OAuthRelier from '../models/reliers/oauth';
import p from './promise';
import ProfileClient from './profile-client';
import RefreshObserver from '../models/refresh-observer';
import Relier from '../models/reliers/relier';
import Router from './router';
import SameBrowserVerificationModel from '../models/verification/same-browser';
import ScreenInfo from './screen-info';
import SentryMetrics from './sentry';
import Session from './session';
import Storage from './storage';
import StorageMetrics from './storage-metrics';
import SupplicantRelier from '../models/reliers/pairing/supplicant';
import BrowserRelier from '../models/reliers/browser';
import Translator from './translator';
import UniqueUserId from '../models/unique-user-id';
import Url from './url';
import User from '../models/user';
import UserAgentMixin from './user-agent-mixin';
import WebChannel from './channels/web';

const AUTOMATED_BROWSER_STARTUP_DELAY = 750;

const DEVICE_PAIRING_SUPPLICANT_PATHNAME_REGEXP = /^\/pair\/supp/;
// note that we should handle /pair/ and /pair in the regex below
const DEVICE_PAIRING_AUTH_ENTRYPOINT_REGEXP = /^\/pair\/?$/;

function Start(options = {}) {
  this._authenticationBroker = options.broker;
  this._config = options.config || {};
  this._history = options.history || Backbone.history;
  this._metrics = options.metrics;
  this._notifier = options.notifier;
  this._refreshObserver = options.refreshObserver;
  this._relier = options.relier;
  this._router = options.router;
  this._sentryMetrics = options.sentryMetrics;
  this._storage = options.storage || Storage;
  this._translator = options.translator;
  this._user = options.user;
  this._window = this.window = options.window || window;
}

Start.prototype = {
  startApp() {
    // The delay is to give the functional tests time to hook up
    // WebChannel message response listeners.
    const START_DELAY_MS = this._isAutomatedBrowser()
      ? AUTOMATED_BROWSER_STARTUP_DELAY
      : 0;
    return p
      .delay(START_DELAY_MS)
      .then(() => this.initializeDeps())
      .then(() => this.testLocalStorage())
      .then(() => this.allResourcesReady())
      .catch(err => this.fatalError(err));
  },

  initializeInterTabChannel() {
    this._interTabChannel = new InterTabChannel();
  },

  initializeExperimentGroupingRules() {
    this._experimentGroupingRules = new ExperimentGroupingRules({
      env: this._config.env,
      featureFlags: this._config.featureFlags,
    });
  },

  initializeDeps() {
    return (
      Promise.resolve()
        // l10n depends on nothing, and depended upon
        // by lots, it is loaded first.
        .then(() => this.initializeL10n())
        .then(() => this.initializeInterTabChannel())
        .then(() => this.initializeExperimentGroupingRules())
        .then(() => this.initializeErrorMetrics())
        .then(() => this.initializeOAuthClient())
        // both the metrics and router depend on the language
        // fetched from config.
        .then(() => this.initializeRelier())
        // fxaClient depends on the relier and
        // inter tab communication.
        .then(() => this.initializeFxaClient())
        // depends on nothing
        .then(() => this.initializeNotificationChannel())
        // depends on interTabChannel, web channel
        .then(() => this.initializeNotifier())
        // metrics depends on relier and notifier
        .then(() => this.initializeMetrics())
        // profileClient depends on fxaClient
        .then(() => this.initializeProfileClient())
        // broker relies on the relier, fxaClient,
        // assertionLibrary, and metrics
        .then(() => this.initializeAuthenticationBroker())
        // user depends on the auth broker, profileClient, oAuthClient,
        // and notifier.
        .then(() => this.initializeUser())
        // depends on nothing
        .then(() => this.initializeFormPrefill())
        // depends on notifier, metrics
        .then(() => this.initializeRefreshObserver())
        // router depends on all of the above
        .then(() => this.initializeRouter())
        // appView depends on the router
        .then(() => this.initializeAppView())
    );
  },

  initializeErrorMetrics() {
    if (this._config && this._config.env && this._experimentGroupingRules) {
      const subject = {
        env: this._config.env,
        uniqueUserId: this._getUniqueUserId(),
      };
      if (this._experimentGroupingRules.choose('sentryEnabled', subject)) {
        this.enableSentryMetrics();
      }
    }
  },

  enableSentryMetrics() {
    let release;
    if (this._config && this._config.release) {
      release = this._config.release;
    }

    this._sentryMetrics = new SentryMetrics(this._config.sentryDsn, release);
  },

  initializeL10n() {
    if (!this._translator) {
      this._translator = new Translator();
    }
    return this._translator.fetch();
  },

  initializeMetrics() {
    const isSampledUser = this._experimentGroupingRules.choose(
      'isSampledUser',
      {
        env: this._config.env,
        uniqueUserId: this._getUniqueUserId(),
      }
    );

    const relier = this._relier;
    const screenInfo = new ScreenInfo(this._window);
    this._metrics = this._createMetrics({
      clientHeight: screenInfo.clientHeight,
      clientWidth: screenInfo.clientWidth,
      context: relier.get('context'),
      devicePixelRatio: screenInfo.devicePixelRatio,
      entrypoint: relier.get('entrypoint'),
      isSampledUser: isSampledUser,
      lang: this._config.lang,
      migration: relier.get('migration'),
      notifier: this._notifier,
      screenHeight: screenInfo.screenHeight,
      screenWidth: screenInfo.screenWidth,
      sentryMetrics: this._sentryMetrics,
      service: relier.get('service'),
      uniqueUserId: this._getUniqueUserId(),
      utmCampaign: relier.get('utmCampaign'),
      utmContent: relier.get('utmContent'),
      utmMedium: relier.get('utmMedium'),
      utmSource: relier.get('utmSource'),
      utmTerm: relier.get('utmTerm'),
    });
  },

  initializeFormPrefill() {
    this._formPrefill = new FormPrefill();
  },

  initializeOAuthClient() {
    this._oAuthClient = new OAuthClient({
      oAuthUrl: this._config.oAuthUrl,
    });
  },

  initializeProfileClient() {
    this._profileClient = new ProfileClient({
      profileUrl: this._config.profileUrl,
    });
  },

  initializeRelier() {
    if (!this._relier) {
      let relier;
      const context = this._getContext();

      // The order of the checks is important. The OAuth check
      // is more strict than the Sync check, and if the Sync
      // check is done first, a bad acting OAuth relier could
      // specify both a client_id and service=sync which would
      // cause us to present the Sync UI to the user.
      // Unfortunately, the Sync check cannot be made as strict
      // as the OAuth check - when users sign up for Sync
      // and verify in a 2nd browser, all we have to know the user
      // is completing a Sync flow is `service=sync`.

      if (this.isDevicePairingAsAuthority()) {
        relier = new AuthorityRelier(
          {},
          {
            config: this._config,
            oAuthClient: this._oAuthClient,
            oAuthClientId: this._config.oAuthClientId,
            oAuthUrl: this._config.oAuthUrl,
          }
        );
      } else if (this.isDevicePairingAsSupplicant()) {
        relier = new SupplicantRelier(
          {},
          {
            config: this._config,
            isSupplicant: true,
            oAuthClient: this._oAuthClient,
            oAuthClientId: this._config.oAuthClientId,
            oAuthUrl: this._config.oAuthUrl,
          }
        );
      } else if (this._isOAuth()) {
        relier = new OAuthRelier(
          { context },
          {
            config: this._config,
            isVerification: this._isVerification(),
            oAuthClient: this._oAuthClient,
            sentryMetrics: this._sentryMetrics,
            session: Session,
            window: this._window,
          }
        );
      } else if (
        this._isServiceSync() ||
        // context v3 is able to sign in to Firefox without enabling Sync
        this._searchParam('context') === Constants.FX_DESKTOP_V3_CONTEXT
      ) {
        relier = new BrowserRelier(
          { context },
          {
            isVerification: this._isVerification(),
            sentryMetrics: this._sentryMetrics,
            translator: this._translator,
            window: this._window,
          }
        );
      } else {
        relier = new Relier(
          { context },
          {
            isVerification: this._isVerification(),
            sentryMetrics: this._sentryMetrics,
            window: this._window,
          }
        );
      }

      this._relier = relier;
      return relier.fetch();
    }
  },

  initializeAuthenticationBroker() {
    if (!this._authenticationBroker) {
      let context;
      if (this._isOAuth()) {
        context = this._chooseOAuthBrokerContext();
      } else {
        context = this._getContext();
      }

      const Constructor = authBrokers.get(context);
      this._authenticationBroker = new Constructor({
        config: this._config,
        fxaClient: this._fxaClient,
        isVerificationSameBrowser: this._isVerificationSameBrowser(),
        metrics: this._metrics,
        notificationChannel: this._notificationChannel,
        notifier: this._notifier,
        oAuthClient: this._oAuthClient,
        relier: this._relier,
        session: Session,
        window: this._window,
      });

      this._authenticationBroker.on('error', this.captureError.bind(this));

      this._metrics.setBrokerType(this._authenticationBroker.type);

      return this._authenticationBroker.fetch();
    }
  },

  /**
   * Chooses the right OAuth broker context
   * @returns {string}
   * @private
   */
  _chooseOAuthBrokerContext() {
    if (this.isDevicePairingAsAuthority()) {
      return Constants.DEVICE_PAIRING_AUTHORITY_CONTEXT;
    } else if (this.isOAuthWebChannel() && this.isDevicePairingAsSupplicant()) {
      return Constants.DEVICE_PAIRING_WEBCHANNEL_SUPPLICANT_CONTEXT;
    } else if (this.isDevicePairingAsSupplicant()) {
      return Constants.DEVICE_PAIRING_SUPPLICANT_CONTEXT;
    } else if (this.isOAuthWebChannel()) {
      return Constants.OAUTH_WEBCHANNEL_CONTEXT;
    } else if (this.getUserAgent().isChromeAndroid()) {
      return Constants.OAUTH_CHROME_ANDROID_CONTEXT;
    } else {
      return Constants.OAUTH_CONTEXT;
    }
  },

  initializeFxaClient() {
    if (!this._fxaClient) {
      this._fxaClient = new FxaClient({
        authServerUrl: this._config.authServerUrl,
        interTabChannel: this._interTabChannel,
      });
    }
  },

  initializeUser() {
    if (!this._user) {
      this._user = new User({
        fxaClient: this._fxaClient,
        metrics: this._metrics,
        notifier: this._notifier,
        oAuthClient: this._oAuthClient,
        oAuthClientId: this._config.oAuthClientId,
        profileClient: this._profileClient,
        sentryMetrics: this._sentryMetrics,
        subscriptionsConfig: this._config.subscriptions,
        storage: this._getUserStorageInstance(),
        uniqueUserId: this._getUniqueUserId(),
      });

      // The storage formats must be upgraded before checking
      // whether to set the signed in account from the browser
      // or else an attempt can be made to populate an Account
      // with data in the old format, causing an exception to
      // be thrown.
      return this._user
        .removeAccountsWithInvalidUid()
        .then(() => this._updateUserFromSigninCodeAccount())
        .then(() => this._updateUserFromBrowserAccount());
    }
  },

  _updateUserFromSigninCodeAccount() {
    return Promise.resolve().then(() => {
      const signinCodeAccount = this._authenticationBroker.get(
        'signinCodeAccount'
      );
      if (signinCodeAccount) {
        return this._user.setSigninCodeAccount(signinCodeAccount);
      }
    });
  },

  _updateUserFromBrowserAccount() {
    const user = this._user;

    return Promise.resolve()
      .then(() => {
        const browserAccountData = this._authenticationBroker.get(
          'browserSignedInAccount'
        );
        if (browserAccountData) {
          return user.mergeBrowserAccount(browserAccountData);
        }
      })
      .then(browserAccount => {
        const isPairing =
          this.isDevicePairingAsAuthority() || this.isStartingPairing();

        const shouldSetAsSignedInAccount = user.shouldSetSignedInAccountFromBrowser(
          this._relier.get('service'),
          isPairing,
          browserAccount
        );

        if (shouldSetAsSignedInAccount) {
          return user.updateSignedInAccount(browserAccount);
        }
      });
  },

  initializeNotificationChannel() {
    if (!this._notificationChannel) {
      this._notificationChannel = new WebChannel(
        Constants.ACCOUNT_UPDATES_WEBCHANNEL_ID
      );
      this._notificationChannel.initialize({
        window: this._window,
      });
    }
  },

  initializeNotifier() {
    if (!this._notifier) {
      this._notifier = new Notifier({
        tabChannel: this._interTabChannel,
        webChannel: this._notificationChannel,
      });
    }
  },

  initializeRefreshObserver() {
    if (!this._refreshObserver) {
      this._refreshObserver = new RefreshObserver({
        metrics: this._metrics,
        notifier: this._notifier,
        window: this._window,
      });
    }
  },

  _uniqueUserId: null,
  _getUniqueUserId() {
    if (!this._uniqueUserId) {
      /**
       * Sets a UUID value that is unrelated to any account information.
       * This value is useful to determine if the logged out user qualifies
       * for A/B testing or metrics.
       */
      this._uniqueUserId = new UniqueUserId({
        sentryMetrics: this._sentryMetrics,
        window: this._window,
      }).get('uniqueUserId');
    }

    return this._uniqueUserId;
  },

  createView(Constructor, options = {}) {
    const viewOptions = _.extend(
      {
        broker: this._authenticationBroker,
        config: this._config,
        createView: this.createView.bind(this),
        experimentGroupingRules: this._experimentGroupingRules,
        formPrefill: this._formPrefill,
        interTabChannel: this._interTabChannel,
        isCoppaEnabled: this._config.isCoppaEnabled,
        lang: this._config.lang,
        metrics: this._metrics,
        notifier: this._notifier,
        relier: this._relier,
        sentryMetrics: this._sentryMetrics,
        session: Session,
        subscriptionsManagementEnabled: this._config.subscriptions.enabled,
        translator: this._translator,
        user: this._user,
        window: this._window,
      },
      this._router.getViewOptions(options)
    );

    return new Constructor(viewOptions);
  },

  initializeRouter() {
    if (!this._router) {
      this._router = new Router({
        broker: this._authenticationBroker,
        createView: this.createView.bind(this),
        metrics: this._metrics,
        notifier: this._notifier,
        relier: this._relier,
        user: this._user,
        window: this._window,
      });
    }
    this._window.router = this._router;
  },

  initializeAppView() {
    if (!this._appView) {
      this._appView = new AppView({
        createView: this.createView.bind(this),
        el: 'body',
        environment: new Environment(this._window),
        notifier: this._notifier,
        router: this._router,
        translator: this._translator,
        window: this._window,
      });
    }
  },

  /**
   * Check whether there are any problems accessing localStorage.
   * Errors are logged to Sentry and internal metrics.
   *
   * If there is a problem accessing localStorage, the user
   * will be redirected to `/cookies_disabled` from _selectStartPage
   *
   * @returns {Promise}
   */
  testLocalStorage() {
    return Promise.resolve()
      .then(() => {
        // only test localStorage if the user is not already at
        // the cookies_disabled screen.
        if (!this._isAtCookiesDisabled()) {
          this._storage.testLocalStorage(this._window);
        }
      })
      .catch(err => this.captureError(err));
  },

  /**
   * Handle a fatal error. Logs and reports the error, then redirects
   * to the appropriate error page.
   *
   * @param {Error} error
   * @returns {Promise}
   */
  fatalError(error) {
    if (!this._sentryMetrics) {
      this.enableSentryMetrics();
    }

    return ErrorUtils.fatalError(
      error,
      this._sentryMetrics,
      this._metrics,
      this._window,
      this._translator
    );
  },

  /**
   * Report an error to metrics. Send metrics report.
   *
   * @param {Object} error
   * @return {Promise} resolves when complete
   */
  captureError(error) {
    if (!this._sentryMetrics) {
      this.enableSentryMetrics();
    }

    return ErrorUtils.captureAndFlushError(
      error,
      this._sentryMetrics,
      this._metrics,
      this._window
    );
  },

  allResourcesReady() {
    // fxaClient is not loaded as part of the main bundle and is almost
    // certainly going to be needed. Start to opportunistically load
    // it now.
    import(/* webpackChunkName: "fxaClient" */ 'fxaClient');

    // If a new start page is specified, do not attempt to render
    // the route displayed in the URL because the user is
    // immediately redirected
    const startPage = this._selectStartPage();
    const isSilent = !!startPage;

    // pushState must be specified or else no screen transitions occur.
    this._history.start({
      pushState: this._canUseHistoryAPI(),
      silent: isSilent,
    });
    if (startPage) {
      this._router.navigate(
        startPage,
        {},
        {
          // do not add a history item for the page that was there BEFORE the selected start page.
          replace: true,
          trigger: true,
        }
      );
    }
  },

  _canUseHistoryAPI() {
    // Check whether the history API can be used by calling replaceState
    // with the current window information. This fixes problems in some
    // environments like the Firefox OS 1.x trusted UI where the history
    // API is available, but can't be used.
    const win = this._window;
    try {
      win.history.replaceState({}, win.document.title, win.location.href);
    } catch (e) {
      return false;
    }
    return true;
  },

  _getUserStorageInstance() {
    return Storage.factory('localStorage', this._window);
  },

  _isServiceSync() {
    return this._isService(Constants.SYNC_SERVICE);
  },

  /**
   * Is the user initiating a device pairing flow as
   * the auth device?
   *
   * @returns {Boolean}
   */
  isDevicePairingAsAuthority() {
    return (
      this._searchParam('redirect_uri') ===
      Constants.DEVICE_PAIRING_AUTHORITY_REDIRECT_URI
    );
  },
  /**
   * Is the user initiating an OAuth flow using WebChannels?
   *
   * @returns {Boolean}
   */
  isOAuthWebChannel() {
    return this._searchParam('context') === Constants.OAUTH_WEBCHANNEL_CONTEXT;
  },

  /**
   * Is the user navigating to `/pair` or `/pair/` to start the pairing flow?
   * @returns {boolean}
   */
  isStartingPairing() {
    return DEVICE_PAIRING_AUTH_ENTRYPOINT_REGEXP.test(
      this._window.location.pathname
    );
  },

  /**
   * Is the user initiating a device pairing flow as
   * the supplicant device?
   *
   * @returns {Boolean}
   */
  isDevicePairingAsSupplicant() {
    return DEVICE_PAIRING_SUPPLICANT_PATHNAME_REGEXP.test(
      this._window.location.pathname
    );
  },

  _isServiceOAuth() {
    const service = this._searchParam('service');
    // any service that is not the sync service is automatically
    // considered an OAuth service
    return service && !this._isServiceSync();
  },

  _isService(compareToService) {
    const service = this._searchParam('service');
    return !!(service && compareToService && service === compareToService);
  },

  _isContext(contextName) {
    return this._getContext() === contextName;
  },

  _getContext() {
    if (this._isVerification()) {
      return this._getVerificationContext();
    }

    return this._searchParam('context');
  },

  _getVerificationContext() {
    // If the user verifies in the same browser, use the same context that
    // was used to sign up to allow the verification tab to have the same
    // capabilities as the signup tab.
    // For users that verify in a 2nd browser, choose the most appropriate
    // broker based on the service to allow the verification tab to have
    // service specific behaviors and messaging. For Sync, use the generic
    // Sync broker, for OAuth, use the OAuth broker.
    // If no service is specified and the user is verifies in a 2nd browser,
    // then fall back to the default content server context.
    const sameBrowserVerificationContext = this._getSameBrowserVerificationModel(
      'context'
    ).get('context');
    if (sameBrowserVerificationContext) {
      // user is verifying in the same browser, use the same context they signed up with.
      return sameBrowserVerificationContext;
    } else if (this._isServiceSync()) {
      // user is verifying in a different browser.
      return Constants.FX_SYNC_CONTEXT;
    } else if (this._isServiceOAuth()) {
      // oauth, user is verifying in a different browser.
      return Constants.OAUTH_CONTEXT;
    }

    return Constants.CONTENT_SERVER_CONTEXT;
  },

  _getSameBrowserVerificationModel(namespace) {
    const urlVerificationInfo = Url.searchParams(this._window.location.search);

    const verificationInfo = new SameBrowserVerificationModel(
      {},
      {
        email: urlVerificationInfo.email,
        namespace: namespace,
        uid: urlVerificationInfo.uid,
      }
    );
    verificationInfo.load();

    return verificationInfo;
  },

  _isSignUpVerification() {
    return this._searchParam('code') && this._searchParam('uid');
  },

  _isPasswordResetVerification() {
    return this._searchParam('code') && this._searchParam('token');
  },

  _isReportSignIn() {
    return this._window.location.pathname === '/report_signin';
  },

  _isVerification() {
    return (
      this._isSignUpVerification() ||
      this._isPasswordResetVerification() ||
      this._isReportSignIn()
    );
  },

  /**
   * Is the user verifying in the same browser they signed up/in to?
   *
   * @returns {Boolean}
   * @private
   */
  _isVerificationSameBrowser() {
    return (
      this._isVerification() &&
      !!this._getSameBrowserVerificationModel('context').get('context')
    );
  },

  _isOAuth() {
    // signin/signup/force_auth
    return (
      !!(
        this._searchParam('client_id') ||
        // verification
        this._isOAuthVerificationSameBrowser()
      ) ||
      this._isOAuthVerificationDifferentBrowser() ||
      // any URL with 'oauth' in the path.
      /oauth/.test(this._window.location.pathname)
    );
  },

  _isAtCookiesDisabled() {
    return this._window.location.pathname === '/cookies_disabled';
  },

  _getSavedClientId() {
    return Session.oauth && Session.oauth.client_id;
  },

  _isOAuthVerificationSameBrowser() {
    return this._isVerification() && this._isService(this._getSavedClientId());
  },

  _isOAuthVerificationDifferentBrowser() {
    return this._isVerification() && this._isServiceOAuth();
  },

  _searchParam(name) {
    return Url.searchParam(name, this._window.location.search);
  },

  _selectStartPage() {
    if (
      !this._isAtCookiesDisabled() &&
      !this._storage.isLocalStorageEnabled(this._window) &&
      !this._isVerificationInMobileSafari()
    ) {
      return 'cookies_disabled';
    } else if (this.isDevicePairingAsAuthority()) {
      return 'pair/auth/allow';
    }
  },

  _createMetrics(options) {
    if (this._isAutomatedBrowser()) {
      return new StorageMetrics(options);
    }

    return new Metrics(options);
  },

  /**
   * This function addresses the special scenario for Safari iOS
   * where users using Private Browsing cannot verify their email
   * (during sign up or sign-in confirmation) due to the
   * 'window.localStorage' block.
   *
   * Returns `true` if the current browser is Safari iOS and the
   * route is a verification email route.
   *
   * @returns {boolean}
   * @private
   */
  _isVerificationInMobileSafari() {
    const path = this._window.location.pathname;
    const isVerificationPath =
      path === '/complete_signin' || path === '/verify_email';
    const uap = this.getUserAgent();

    return isVerificationPath && uap.isMobileSafari();
  },

  _isAutomatedBrowser() {
    return this._searchParam('automatedBrowser') === 'true';
  },
};

Cocktail.mixin(Start, UserAgentMixin);

export default Start;
