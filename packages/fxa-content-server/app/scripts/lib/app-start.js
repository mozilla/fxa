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
  const Able = require('lib/able');
  const AppView = require('views/app');
  const Assertion = require('lib/assertion');
  const Backbone = require('backbone');
  const BaseAuthenticationBroker = require('models/auth_brokers/base');
  const CloseButtonView = require('views/close_button');
  const ConfigLoader = require('lib/config-loader');
  const Constants = require('lib/constants');
  const Environment = require('lib/environment');
  const ErrorUtils = require('lib/error-utils');
  const FormPrefill = require('models/form-prefill');
  const FxaClient = require('lib/fxa-client');
  const FxDesktopV1AuthenticationBroker = require('models/auth_brokers/fx-desktop-v1');
  const FxDesktopV2AuthenticationBroker = require('models/auth_brokers/fx-desktop-v2');
  const FxDesktopV3AuthenticationBroker = require('models/auth_brokers/fx-desktop-v3');
  const FxFennecV1AuthenticationBroker = require('models/auth_brokers/fx-fennec-v1');
  const FxFirstrunV1AuthenticationBroker = require('models/auth_brokers/fx-firstrun-v1');
  const FxFirstrunV2AuthenticationBroker = require('models/auth_brokers/fx-firstrun-v2');
  const FxiOSV1AuthenticationBroker = require('models/auth_brokers/fx-ios-v1');
  const HeightObserver = require('lib/height-observer');
  const IframeChannel = require('lib/channels/iframe');
  const InterTabChannel = require('lib/channels/inter-tab');
  const MarketingEmailClient = require('lib/marketing-email-client');
  const Metrics = require('lib/metrics');
  const Notifier = require('lib/channels/notifier');
  const NullChannel = require('lib/channels/null');
  const OAuthClient = require('lib/oauth-client');
  const OAuthRelier = require('models/reliers/oauth');
  const p = require('lib/promise');
  const ProfileClient = require('lib/profile-client');
  const RedirectAuthenticationBroker = require('models/auth_brokers/redirect');
  const RefreshObserver = require('models/refresh-observer');
  const Relier = require('models/reliers/relier');
  const requireOnDemand = require('lib/require-on-demand');
  const Router = require('lib/router');
  const SameBrowserVerificationModel = require('models/verification/same-browser');
  const ScreenInfo = require('lib/screen-info');
  const SentryMetrics = require('lib/sentry');
  const Session = require('lib/session');
  const Storage = require('lib/storage');
  const StorageMetrics = require('lib/storage-metrics');
  const SyncRelier = require('models/reliers/sync');
  const Translator = require('lib/translator');
  const UniqueUserId = require('models/unique-user-id');
  const Url = require('lib/url');
  const User = require('models/user');
  const WebChannel = require('lib/channels/web');

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
      // fetch both config and translations in parallel to speed up load.
      return p.all([
        this.initializeConfig(),
        this.initializeL10n(),
        this.initializeInterTabChannel()
      ])
      .then(this.testLocalStorage.bind(this))
      .then(this.allResourcesReady.bind(this))
      .fail(this.fatalError.bind(this));
    },

    initializeInterTabChannel () {
      this._interTabChannel = new InterTabChannel();
    },

    initializeAble () {
      this._able = new Able();
    },

    initializeConfig () {
      return this._configLoader.fetch()
                    .then(_.bind(this.useConfig, this))
                    .then(_.bind(this.initializeAble, this))
                    .then(_.bind(this.initializeErrorMetrics, this))
                    .then(_.bind(this.initializeOAuthClient, this))
                    // both the metrics and router depend on the language
                    // fetched from config.
                    .then(_.bind(this.initializeRelier, this))
                    // metrics depends on the relier.
                    .then(_.bind(this.initializeMetrics, this))
                    // iframe channel depends on the relier and metrics
                    .then(_.bind(this.initializeIframeChannel, this))
                    // fxaClient depends on the relier and
                    // inter tab communication.
                    .then(_.bind(this.initializeFxaClient, this))
                    // depends on iframeChannel and interTabChannel
                    .then(_.bind(this.initializeNotifier, this))
                    // assertionLibrary depends on fxaClient
                    .then(_.bind(this.initializeAssertionLibrary, this))
                    // profileClient depends on fxaClient and assertionLibrary
                    .then(_.bind(this.initializeProfileClient, this))
                    // marketingEmailClient depends on config
                    .then(_.bind(this.initializeMarketingEmailClient, this))
                    // user depends on the profileClient, oAuthClient,
                    // assertionLibrary and notifier.
                    .then(_.bind(this.initializeUser, this))
                    // broker relies on the user, relier, fxaClient,
                    // assertionLibrary, and metrics
                    .then(_.bind(this.initializeAuthenticationBroker, this))
                    // depends on the authentication broker
                    .then(_.bind(this.initializeHeightObserver, this))
                    // the close button depends on the broker
                    .then(_.bind(this.initializeCloseButton, this))
                    // storage format upgrades depend on user
                    .then(_.bind(this.upgradeStorageFormats, this))

                    // depends on nothing
                    .then(_.bind(this.initializeFormPrefill, this))
                    // depends on notifier, metrics
                    .then(_.bind(this.initializeRefreshObserver, this))
                    // router depends on all of the above
                    .then(_.bind(this.initializeRouter, this))
                    // appView depends on the router
                    .then(_.bind(this.initializeAppView, this));
    },

    useConfig (config) {
      this._config = config;
      this._configLoader.useConfig(config);
    },

    initializeErrorMetrics () {
      if (this._config && this._config.env && this._able) {
        const abData = {
          env: this._config.env,
          uniqueUserId: this._getUniqueUserId()
        };
        const abChoose = this._able.choose('sentryEnabled', abData);

        if (abChoose) {
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
      return this._translator.fetch();
    },

    initializeMetrics () {
      const isSampledUser = this._able.choose('isSampledUser', {
        env: this._config.env,
        uniqueUserId: this._getUniqueUserId()
      });

      const relier = this._relier;
      const screenInfo = new ScreenInfo(this._window);
      this._metrics = this._createMetrics({
        able: this._able,
        clientHeight: screenInfo.clientHeight,
        clientWidth: screenInfo.clientWidth,
        context: relier.get('context'),
        devicePixelRatio: screenInfo.devicePixelRatio,
        entrypoint: relier.get('entrypoint'),
        isSampledUser: isSampledUser,
        lang: this._config.language,
        migration: relier.get('migration'),
        screenHeight: screenInfo.screenHeight,
        screenWidth: screenInfo.screenWidth,
        service: relier.get('service'),
        uniqueUserId: this._getUniqueUserId(),
        utmCampaign: relier.get('utmCampaign'),
        utmContent: relier.get('utmContent'),
        utmMedium: relier.get('utmMedium'),
        utmSource: relier.get('utmSource'),
        utmTerm: relier.get('utmTerm')
      });
      this._metrics.init();
    },

    initializeIframeChannel () {
      if (this._isInAnIframe()) {
        const parentOrigin = this._searchParam('origin');
        const iframeChannel = new IframeChannel();

        iframeChannel.initialize({
          metrics: this._metrics,
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

        if (this._isServiceSync()) {
          // Use the SyncRelier for sync verification so that
          // the service name is translated correctly.
          relier = new SyncRelier({ context }, {
            isVerification: this._isVerification(),
            sentryMetrics: this._sentryMetrics,
            translator: this._translator,
            window: this._window
          });
        } else if (this._isOAuth()) {
          relier = new OAuthRelier({ context }, {
            isVerification: this._isVerification(),
            oAuthClient: this._oAuthClient,
            sentryMetrics: this._sentryMetrics,
            session: Session,
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
        if (this._isFxFirstrunV2()) {
          this._authenticationBroker = new FxFirstrunV2AuthenticationBroker({
            iframeChannel: this._iframeChannel,
            relier: this._relier,
            window: this._window
          });
        } else if (this._isFxFirstrunV1()) {
          this._authenticationBroker = new FxFirstrunV1AuthenticationBroker({
            iframeChannel: this._iframeChannel,
            relier: this._relier,
            window: this._window
          });
        } else if (this._isFxFennecV1()) {
          this._authenticationBroker = new FxFennecV1AuthenticationBroker({
            relier: this._relier,
            window: this._window
          });
        } else if (this._isFxDesktopV3()) {
          this._authenticationBroker = new FxDesktopV3AuthenticationBroker({
            relier: this._relier,
            window: this._window
          });
        } else if (this._isFxDesktopV2()) {
          this._authenticationBroker = new FxDesktopV2AuthenticationBroker({
            relier: this._relier,
            window: this._window
          });
        } else if (this._isFxDesktopV1()) {
          this._authenticationBroker = new FxDesktopV1AuthenticationBroker({
            relier: this._relier,
            window: this._window
          });
        } else if (this._isFxiOSV1()) {
          this._authenticationBroker = new FxiOSV1AuthenticationBroker({
            relier: this._relier,
            window: this._window
          });
        } else if (this._isOAuth()) {
          this._authenticationBroker = new RedirectAuthenticationBroker({
            assertionLibrary: this._assertionLibrary,
            metrics: this._metrics,
            oAuthClient: this._oAuthClient,
            relier: this._relier,
            session: Session,
            window: this._window
          });
        } else {
          this._authenticationBroker = new BaseAuthenticationBroker({
            relier: this._relier
          });
        }

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

    initializeCloseButton () {
      if (this._authenticationBroker.canCancel()) {
        this._closeButton = new CloseButtonView({
          broker: this._authenticationBroker
        });
        this._closeButton.render();
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
        this._user = new User({
          assertion: this._assertionLibrary,
          fxaClient: this._fxaClient,
          marketingEmailClient: this._marketingEmailClient,
          metrics: this._metrics,
          notifier: this._notifier,
          oAuthClient: this._oAuthClient,
          oAuthClientId: this._config.oAuthClientId,
          profileClient: this._profileClient,
          sentryMetrics: this._sentryMetrics,
          storage: this._getStorageInstance(),
          uniqueUserId: this._getUniqueUserId()
        });
      }
    },

    initializeNotifier () {
      if (! this._notifier) {
        const notificationWebChannel =
              new WebChannel(Constants.ACCOUNT_UPDATES_WEBCHANNEL_ID);
        notificationWebChannel.initialize();

        this._notifier = new Notifier({
          iframeChannel: this._iframeChannel,
          tabChannel: this._interTabChannel,
          webChannel: notificationWebChannel
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
        .then(user.upgradeFromSession.bind(user, Session, this._fxaClient));
    },

    createView (Constructor, options = {}) {
      const viewOptions = _.extend({
        able: this._able,
        broker: this._authenticationBroker,
        createView: this.createView.bind(this),
        formPrefill: this._formPrefill,
        interTabChannel: this._interTabChannel,
        language: this._config.language,
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
          broker: this._authenticationBroker,
          createView: this.createView.bind(this),
          metrics: this._metrics,
          notifier: this._notifier,
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
      return p().then(() => {
        // only test localStorage if the user is not already at
        // the cookies_disabled screen.
        if (! this._isAtCookiesDisabled()) {
          this._storage.testLocalStorage(this._window);
        }
      }).fail(this.captureError.bind(this));
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

    _getStorageInstance () {
      return Storage.factory('localStorage', this._window);
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

    _isFxFennecV1 () {
      return this._isContext(Constants.FX_FENNEC_V1_CONTEXT);
    },

    _isFxDesktopV1 () {
      return this._isContext(Constants.FX_DESKTOP_V1_CONTEXT);
    },

    _isFxDesktopV3 () {
      return this._isContext(Constants.FX_DESKTOP_V3_CONTEXT);
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

    _isFxiOSV1 () {
      return this._isContext(Constants.FX_IOS_V1_CONTEXT);
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
      // Users that verify in the same browser use the same context that
      // was used to sign up to allow the verification tab to have
      // the same capabilities as the signup tab.
      // If verifying in a separate browser, fall back to the default context.
      const verificationInfo = this._getSameBrowserVerificationModel('context');
      return verificationInfo.get('context');
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

    _isFxFirstrunV1 () {
      return this._isFxDesktopV2() && this._isIframeContext();
    },

    _isFxFirstrunV2 () {
      return this._isContext(Constants.FX_FIRSTRUN_V2_CONTEXT);
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
        ! this._storage.isLocalStorageEnabled(this._window)) {
        return 'cookies_disabled';
      }
    },

    _createMetrics (options) {
      if (this._isAutomatedBrowser()) {
        return new StorageMetrics(options);
      }

      return new Metrics(options);
    },

    _isAutomatedBrowser () {
      return this._searchParam('automatedBrowser') === 'true';
    }
  };

  module.exports = Start;
});
