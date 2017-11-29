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

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const ExperimentGroupingRules = require('./experiments/grouping-rules/index');
  const AppView = require('../views/app');
  const authBrokers = require('../models/auth_brokers/index');
  const Assertion = require('./assertion');
  const Backbone = require('backbone');
  const ConfigLoader = require('./config-loader');
  const Constants = require('./constants');
  const Environment = require('./environment');
  const ErrorUtils = require('./error-utils');
  const FormPrefill = require('../models/form-prefill');
  const FxaClient = require('./fxa-client');
  const HeightObserver = require('./height-observer');
  const IframeChannel = require('./channels/iframe');
  const InterTabChannel = require('./channels/inter-tab');
  const MarketingEmailClient = require('./marketing-email-client');
  const Metrics = require('./metrics');
  const Notifier = require('./channels/notifier');
  const NullChannel = require('./channels/null');
  const OAuthClient = require('./oauth-client');
  const OAuthRelier = require('../models/reliers/oauth');
  const p = require('./promise');
  const ProfileClient = require('./profile-client');
  const RefreshObserver = require('../models/refresh-observer');
  const Relier = require('../models/reliers/relier');
  const requireOnDemand = require('./require-on-demand');
  const Router = require('./router');
  const SameBrowserVerificationModel = require('../models/verification/same-browser');
  const ScreenInfo = require('./screen-info');
  const SentryMetrics = require('./sentry');
  const Session = require('./session');
  const Storage = require('./storage');
  const StorageMetrics = require('./storage-metrics');
  const SyncRelier = require('../models/reliers/sync');
  const Translator = require('./translator');
  const UniqueUserId = require('../models/unique-user-id');
  const Url = require('./url');
  const User = require('../models/user');
  const UserAgent = require('./user-agent');
  const uuid = require('uuid');
  const WebChannel = require('./channels/web');

  const AUTOMATED_BROWSER_STARTUP_DELAY = 750;

  function Start(options = {}) {
    this._authenticationBroker = options.broker;
    this._configLoader = new ConfigLoader();
    this._history = options.history || Backbone.history;
    this._metrics = options.metrics;
    this._notifier = options.notifier;
    this._refreshObserver = options.refreshObserver;
    this._relier = options.relier;
    this._requireOnDemand = options.requireOnDemand || requireOnDemand;
    this._router = options.router;
    this._sentryMetrics = options.sentryMetrics;
    this._storage = options.storage || Storage;
    this._user = options.user;
    this._window = options.window || window;
  }

  Start.prototype = {
    startApp () {
      // The delay is to give the functional tests time to hook up
      // WebChannel message response listeners.
      const START_DELAY_MS = this._isAutomatedBrowser() ? AUTOMATED_BROWSER_STARTUP_DELAY : 0;
      return p.delay(START_DELAY_MS)
        .then(() => this.initializeDeps())
        .then(() => this.testLocalStorage())
        .then(() => this.allResourcesReady())
        .catch((err) => this.fatalError(err));
    },

    initializeInterTabChannel () {
      this._interTabChannel = new InterTabChannel();
    },

    initializeExperimentGroupingRules () {
      this._experimentGroupingRules = new ExperimentGroupingRules({
        env: this._config.env
      });
    },

    initializeConfig () {
      return this._configLoader.fetch()
        .then((config) => this.useConfig(config));
    },

    initializeDeps () {
      return Promise.resolve()
        // config and l10n depend on nothing, and are depended upon
        // by lots, they are loaded first.
        .then(() => this.initializeConfig())
        .then(() => this.initializeL10n())
        .then(() => this.initializeInterTabChannel())
        .then(() => this.initializeExperimentGroupingRules())
        .then(() => this.initializeErrorMetrics())
        .then(() => this.initializeOAuthClient())
        // both the metrics and router depend on the language
        // fetched from config.
        .then(() => this.initializeRelier())
        // iframe channel depends on the relier.
        .then(() => this.initializeIframeChannel())
        // fxaClient depends on the relier and
        // inter tab communication.
        .then(() => this.initializeFxaClient())
        // depends on nothing
        .then(() => this.initializeNotificationChannel())
        // depends on iframeChannel and interTabChannel, web channel
        .then(() => this.initializeNotifier())
        // metrics depends on relier and notifier
        .then(() => this.initializeMetrics())
        // assertionLibrary depends on fxaClient
        .then(() => this.initializeAssertionLibrary())
        // profileClient depends on fxaClient and assertionLibrary
        .then(() => this.initializeProfileClient())
        // marketingEmailClient depends on config
        .then(() => this.initializeMarketingEmailClient())
        // broker relies on the relier, fxaClient,
        // assertionLibrary, and metrics
        .then(() => this.initializeAuthenticationBroker())
        // user depends on the auth broker, profileClient, oAuthClient,
        // assertionLibrary and notifier.
        .then(() => this.initializeUser())
        // depends on the authentication broker
        .then(() => this.initializeHeightObserver())
        // depends on nothing
        .then(() => this.initializeFormPrefill())
        // depends on notifier, metrics
        .then(() => this.initializeRefreshObserver())
        // router depends on all of the above
        .then(() => this.initializeRouter())
        // appView depends on the router
        .then(() => this.initializeAppView());
    },

    useConfig (config) {
      this._config = config;
      this._configLoader.useConfig(config);
    },

    initializeErrorMetrics () {
      if (this._config && this._config.env && this._experimentGroupingRules) {
        const subject = {
          env: this._config.env,
          uniqueUserId: this._getUniqueUserId()
        };
        if (this._experimentGroupingRules.choose('sentryEnabled', subject)) {
          this.enableSentryMetrics();
        }
      }
    },

    enableSentryMetrics () {
      let release;
      if (this._config && this._config.release) {
        release = this._config.release;
      }
      this._sentryMetrics = new SentryMetrics(this._window.location.host, release);
    },

    initializeL10n () {
      this._translator = this._window.translator = new Translator();
    },

    initializeMetrics () {
      const isSampledUser = this._experimentGroupingRules.choose('isSampledUser', {
        env: this._config.env,
        uniqueUserId: this._getUniqueUserId()
      });

      const relier = this._relier;
      const screenInfo = new ScreenInfo(this._window);
      this._metrics = this._createMetrics({
        clientHeight: screenInfo.clientHeight,
        clientWidth: screenInfo.clientWidth,
        context: relier.get('context'),
        deviceId: this._getMetricsDeviceId(),
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
        utmTerm: relier.get('utmTerm')
      });
    },

    initializeIframeChannel () {
      if (this._isInAnIframe()) {
        const parentOrigin = this._searchParam('origin');
        const iframeChannel = new IframeChannel();

        iframeChannel.initialize({
          origin: parentOrigin,
          window: this._window
        });

        this._iframeChannel = iframeChannel;
      } else {
        // Create a NullChannel in case any dependencies require it, such
        // as when the FxFirstrunV1AuthenticationBroker is used in functional
        // tests. The firstrun tests don't actually use an iframe, so the
        // real IframeChannel is not created.
        this._iframeChannel = new NullChannel();
      }
    },

    initializeFormPrefill () {
      this._formPrefill = new FormPrefill();
    },

    initializeOAuthClient () {
      this._oAuthClient = new OAuthClient({
        oAuthUrl: this._config.oAuthUrl
      });
    },

    initializeProfileClient () {
      this._profileClient = new ProfileClient({
        profileUrl: this._config.profileUrl
      });
    },

    initializeMarketingEmailClient () {
      this._marketingEmailClient = new MarketingEmailClient({
        baseUrl: this._config.marketingEmailServerUrl,
        preferencesUrl: this._config.marketingEmailPreferencesUrl
      });
    },

    initializeRelier () {
      if (! this._relier) {
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
        if (this._isOAuth()) {
          relier = new OAuthRelier({ context }, {
            config: this._config,
            isVerification: this._isVerification(),
            oAuthClient: this._oAuthClient,
            sentryMetrics: this._sentryMetrics,
            session: Session,
            window: this._window
          });
        } else if (this._isServiceSync()) {
          relier = new SyncRelier({ context }, {
            isVerification: this._isVerification(),
            sentryMetrics: this._sentryMetrics,
            translator: this._translator,
            window: this._window
          });
        } else {
          relier = new Relier({ context }, {
            isVerification: this._isVerification(),
            sentryMetrics: this._sentryMetrics,
            window: this._window
          });
        }

        this._relier = relier;
        return relier.fetch();
      }
    },

    initializeAssertionLibrary () {
      this._assertionLibrary = new Assertion({
        audience: this._config.oAuthUrl,
        fxaClient: this._fxaClient
      });
    },

    initializeAuthenticationBroker () {
      if (! this._authenticationBroker) {
        let context;
        if (this._isFxDesktopV2()) {
          if (this._isIframeContext()) {
            context = Constants.FX_FIRSTRUN_V1_CONTEXT;
          } else {
            context = Constants.FX_DESKTOP_V2_CONTEXT;
          }
        } else if (this._isOAuth()) {
          context = Constants.OAUTH_CONTEXT;
        } else {
          context = this._getContext();
        }

        const Constructor = authBrokers.get(context);
        this._authenticationBroker = new Constructor({
          assertionLibrary: this._assertionLibrary,
          fxaClient: this._fxaClient,
          iframeChannel: this._iframeChannel,
          isVerificationSameBrowser: this._isVerificationSameBrowser(),
          metrics: this._metrics,
          notificationChannel: this._notificationChannel,
          notifier: this._notifier,
          oAuthClient: this._oAuthClient,
          relier: this._relier,
          session: Session,
          window: this._window
        });

        this._authenticationBroker.on('error', this.captureError.bind(this));

        this._metrics.setBrokerType(this._authenticationBroker.type);

        return this._authenticationBroker.fetch();
      }
    },

    initializeHeightObserver () {
      if (this._isInAnIframe()) {
        const heightObserver = new HeightObserver({
          target: this._window.document.body,
          window: this._window
        });

        heightObserver.on('change', (height) => {
          this._iframeChannel.send('resize', { height: height });
        });

        heightObserver.start();
      }
    },

    initializeFxaClient () {
      if (! this._fxaClient) {
        this._fxaClient = new FxaClient({
          authServerUrl: this._config.authServerUrl,
          interTabChannel: this._interTabChannel
        });
      }
    },

    initializeUser () {
      if (! this._user) {
        const user = this._user = new User({
          assertion: this._assertionLibrary,
          fxaClient: this._fxaClient,
          marketingEmailClient: this._marketingEmailClient,
          metrics: this._metrics,
          notifier: this._notifier,
          oAuthClient: this._oAuthClient,
          oAuthClientId: this._config.oAuthClientId,
          profileClient: this._profileClient,
          sentryMetrics: this._sentryMetrics,
          storage: this._getUserStorageInstance(),
          uniqueUserId: this._getUniqueUserId()
        });

        // The storage formats must be upgraded before checking
        // whether to set the signed in account from the browser
        // or else an attempt can be made to populate an Account
        // with data in the old format, causing an exception to
        // be thrown.
        return this.upgradeStorageFormats()
          .then(() => {
            const signinCodeAccount = this._authenticationBroker.get('signinCodeAccount');
            if (signinCodeAccount) {
              user.setSigninCodeAccount(signinCodeAccount);
            }

            const browserAccountData  = this._authenticationBroker.get('browserSignedInAccount');
            if (user.shouldSetSignedInAccountFromBrowser(this._relier.get('service'))) {
              return user.setSignedInAccountFromBrowserAccountData(browserAccountData);
            }
          });
      }
    },

    initializeNotificationChannel () {
      if (! this._notificationChannel) {
        this._notificationChannel =
              new WebChannel(Constants.ACCOUNT_UPDATES_WEBCHANNEL_ID);
        this._notificationChannel.initialize({
          window: this._window
        });
      }
    },

    initializeNotifier () {
      if (! this._notifier) {
        this._notifier = new Notifier({
          iframeChannel: this._iframeChannel,
          tabChannel: this._interTabChannel,
          webChannel: this._notificationChannel
        });
      }
    },

    initializeRefreshObserver () {
      if (! this._refreshObserver) {
        this._refreshObserver = new RefreshObserver({
          metrics: this._metrics,
          notifier: this._notifier,
          window: this._window
        });
      }
    },

    _metricsDeviceId: null,
    _getMetricsDeviceId () {
      if (! this._metricsDeviceId) {
        // Amplitude-specific device id. Transient for now,
        // but will probably be persistent in the future.
        this._metricsDeviceId = uuid.v4().replace(/-/g, '');
      }

      return this._metricsDeviceId;
    },

    _uniqueUserId: null,
    _getUniqueUserId () {
      if (! this._uniqueUserId) {
        /**
         * Sets a UUID value that is unrelated to any account information.
         * This value is useful to determine if the logged out user qualifies
         * for A/B testing or metrics.
         */
        this._uniqueUserId = new UniqueUserId({
          sentryMetrics: this._sentryMetrics,
          window: this._window
        }).get('uniqueUserId');
      }

      return this._uniqueUserId;
    },

    upgradeStorageFormats () {
      const user = this._user;

      // upgradeFromUnfilteredAccountData comes first
      // otherwise upgradeFromSession fails because it tries
      // to read and create Accounts for unfiltered data.
      // upgradeFromSession writes the new format, so this is safe.
      return user.upgradeFromUnfilteredAccountData()
        .then(() => user.upgradeFromSession(Session, this._fxaClient))
        .then(() => user.removeAccountsWithInvalidUid());
    },

    createView (Constructor, options = {}) {
      const viewOptions = _.extend({
        broker: this._authenticationBroker,
        createView: this.createView.bind(this),
        experimentGroupingRules: this._experimentGroupingRules,
        formPrefill: this._formPrefill,
        interTabChannel: this._interTabChannel,
        lang: this._config.lang,
        metrics: this._metrics,
        notifier: this._notifier,
        relier: this._relier,
        sentryMetrics: this._sentryMetrics,
        session: Session,
        user: this._user,
        window: this._window
      }, this._router.getViewOptions(options));

      return new Constructor(viewOptions);
    },

    initializeRouter () {
      if (! this._router) {
        this._router = new Router({
          createView: this.createView.bind(this),
          metrics: this._metrics,
          notifier: this._notifier,
          relier: this._relier,
          user: this._user,
          window: this._window
        });
      }
      this._window.router = this._router;
    },

    initializeAppView () {
      if (! this._appView) {
        this._appView = new AppView({
          createView: this.createView.bind(this),
          el: 'body',
          environment: new Environment(this._window),
          notifier: this._notifier,
          router: this._router,
          window: this._window
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
    testLocalStorage () {
      return Promise.resolve().then(() => {
        // only test localStorage if the user is not already at
        // the cookies_disabled screen.
        if (! this._isAtCookiesDisabled()) {
          this._storage.testLocalStorage(this._window);
        }
      }).catch((err) => this.captureError(err));
    },

    /**
     * Handle a fatal error. Logs and reports the error, then redirects
     * to the appropriate error page.
     *
     * @param {Error} error
     * @returns {Promise}
     */
    fatalError (error) {
      if (! this._sentryMetrics) {
        this.enableSentryMetrics();
      }

      return ErrorUtils.fatalError(error,
        this._sentryMetrics, this._metrics, this._window, this._translator);
    },

    /**
     * Report an error to metrics. Send metrics report.
     *
     * @param {Object} error
     * @return {Promise} resolves when complete
     */
    captureError (error) {
      if (! this._sentryMetrics) {
        this.enableSentryMetrics();
      }

      return ErrorUtils.captureAndFlushError(
        error, this._sentryMetrics, this._metrics, this._window);
    },

    allResourcesReady () {
      // fxaClient is not loaded as part of the main bundle and is almost
      // certainly going to be needed. Start to opportunistically load
      // it now.
      this._requireOnDemand('fxaClient');

      // If a new start page is specified, do not attempt to render
      // the route displayed in the URL because the user is
      // immediately redirected
      const startPage = this._selectStartPage();
      const isSilent = !! startPage;

      // pushState must be specified or else no screen transitions occur.
      this._history.start({ pushState: this._canUseHistoryAPI(), silent: isSilent });
      if (startPage) {
        this._router.navigate(startPage);
      }
    },

    _canUseHistoryAPI () {
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

    _getUserStorageInstance () {
      // The Sync user should *always* come from the browser
      // if FXA_STATUS is supported. Don't even bother
      // with localStorage.
      const shouldUseMemoryStorage =
        this._authenticationBroker.hasCapability('fxaStatus') && this._relier.isSync();

      const storageType = shouldUseMemoryStorage ? undefined : 'localStorage';
      return Storage.factory(storageType, this._window);
    },

    _isServiceSync () {
      return this._isService(Constants.SYNC_SERVICE);
    },

    _isServiceOAuth () {
      const service = this._searchParam('service');
      // any service that is not the sync service is automatically
      // considered an OAuth service
      return service && ! this._isServiceSync();
    },

    _isService (compareToService) {
      const service = this._searchParam('service');
      return !! (service && compareToService && service === compareToService);
    },

    _isFxDesktopV2 () {
      // A user is signing into sync from within an iframe on a trusted
      // web page. Automatically speak version 2 using WebChannels.
      //
      // A check for context=fx_desktop_v2 can be added when about:accounts
      // is converted to use WebChannels.
      return (this._isServiceSync() && this._isIframeContext()) ||
             (this._isContext(Constants.FX_DESKTOP_V2_CONTEXT));
    },

    _isContext (contextName) {
      return this._getContext() === contextName;
    },

    _getContext () {
      if (this._isVerification()) {
        return this._getVerificationContext();
      }

      return this._searchParam('context');
    },

    _getVerificationContext () {
      // If the user verifies in the same browser, use the same context that
      // was used to sign up to allow the verification tab to have the same
      // capabilities as the signup tab.
      // For users that verify in a 2nd browser, choose the most appropriate
      // broker based on the service to allow the verification tab to have
      // service specific behaviors and messaging. For Sync, use the generic
      // Sync broker, for OAuth, use the OAuth broker.
      // If no service is specified and the user is verifies in a 2nd browser,
      // then fall back to the default content server context.
      const sameBrowserVerificationContext = this._getSameBrowserVerificationModel('context').get('context');
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

    _getSameBrowserVerificationModel (namespace) {
      const urlVerificationInfo = Url.searchParams(this._window.location.search);

      const verificationInfo = new SameBrowserVerificationModel({}, {
        email: urlVerificationInfo.email,
        namespace: namespace,
        uid: urlVerificationInfo.uid
      });
      verificationInfo.load();

      return verificationInfo;
    },

    _isSignUpVerification () {
      return this._searchParam('code') &&
             this._searchParam('uid');
    },

    _isPasswordResetVerification () {
      return this._searchParam('code') &&
             this._searchParam('token');
    },

    _isReportSignIn () {
      return this._window.location.pathname === '/report_signin';
    },

    _isVerification () {
      return this._isSignUpVerification() ||
             this._isPasswordResetVerification() ||
             this._isReportSignIn();
    },

    /**
     * Is the user verifying in the same browser they signed up/in to?
     *
     * @returns {Boolean}
     * @private
     */
    _isVerificationSameBrowser () {
      return this._isVerification() &&
             !! this._getSameBrowserVerificationModel('context').get('context');
    },

    _isInAnIframe () {
      return new Environment(this._window).isFramed();
    },

    _isIframeContext () {
      return this._isContext(Constants.IFRAME_CONTEXT);
    },

    _isOAuth () {
      // signin/signup/force_auth
      return !! (this._searchParam('client_id') ||
                 // verification
                 this._isOAuthVerificationSameBrowser()) ||
                 this._isOAuthVerificationDifferentBrowser() ||
                 // any URL with oauth in it
                 /oauth/.test(this._window.location.href);
    },

    _isAtCookiesDisabled () {
      return this._window.location.pathname === '/cookies_disabled';
    },

    _getSavedClientId () {
      return Session.oauth && Session.oauth.client_id;
    },

    _isOAuthVerificationSameBrowser () {
      return this._isVerification() &&
             this._isService(this._getSavedClientId());
    },

    _isOAuthVerificationDifferentBrowser () {
      return this._isVerification() && this._isServiceOAuth();
    },

    _searchParam (name) {
      return Url.searchParam(name, this._window.location.search);
    },

    _selectStartPage () {
      if (! this._isAtCookiesDisabled() &&
        ! this._storage.isLocalStorageEnabled(this._window) &&
        ! this._isVerificationInMobileSafari()
        ) {
        return 'cookies_disabled';
      }
    },

    _createMetrics (options) {
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
    _isVerificationInMobileSafari () {
      const path = this._window.location.pathname;
      const isVerificationPath = path === '/complete_signin' || path === '/verify_email';
      const uap = new UserAgent(this._window.navigator.userAgent);

      return isVerificationPath && uap.isMobileSafari();
    },

    _isAutomatedBrowser () {
      return this._searchParam('automatedBrowser') === 'true';
    }
  };

  module.exports = Start;
});
