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

define([
  'underscore',
  'backbone',
  'lib/promise',
  'lib/router',
  'lib/translator',
  'lib/session',
  'lib/url',
  'lib/config-loader',
  'lib/screen-info',
  'lib/metrics',
  'lib/sentry',
  'lib/storage-metrics',
  'lib/fxa-client',
  'lib/assertion',
  'lib/constants',
  'lib/oauth-client',
  'lib/oauth-errors',
  'lib/auth-errors',
  'lib/profile-client',
  'lib/marketing-email-client',
  'lib/channels/inter-tab',
  'lib/channels/iframe',
  'lib/channels/null',
  'lib/channels/web',
  'lib/storage',
  'lib/able',
  'lib/environment',
  'lib/origin-check',
  'lib/height-observer',
  'models/reliers/relier',
  'models/reliers/oauth',
  'models/reliers/sync',
  'models/auth_brokers/base',
  'models/auth_brokers/fx-desktop-v1',
  'models/auth_brokers/fx-desktop-v2',
  'models/auth_brokers/fx-fennec-v1',
  'models/auth_brokers/fx-ios-v1',
  'models/auth_brokers/fx-ios-v2',
  'models/auth_brokers/first-run',
  'models/auth_brokers/web-channel',
  'models/auth_brokers/redirect',
  'models/auth_brokers/iframe',
  'models/unique-user-id',
  'models/user',
  'models/form-prefill',
  'models/notifications',
  'models/refresh-observer',
  'views/app',
  'views/close_button'
],
function (
  _,
  Backbone,
  p,
  Router,
  Translator,
  Session,
  Url,
  ConfigLoader,
  ScreenInfo,
  Metrics,
  SentryMetrics,
  StorageMetrics,
  FxaClient,
  Assertion,
  Constants,
  OAuthClient,
  OAuthErrors,
  AuthErrors,
  ProfileClient,
  MarketingEmailClient,
  InterTabChannel,
  IframeChannel,
  NullChannel,
  WebChannel,
  Storage,
  Able,
  Environment,
  OriginCheck,
  HeightObserver,
  Relier,
  OAuthRelier,
  SyncRelier,
  BaseAuthenticationBroker,
  FxDesktopV1AuthenticationBroker,
  FxDesktopV2AuthenticationBroker,
  FxFennecV1AuthenticationBroker,
  FxiOSV1AuthenticationBroker,
  FxiOSV2AuthenticationBroker,
  FirstRunAuthenticationBroker,
  WebChannelAuthenticationBroker,
  RedirectAuthenticationBroker,
  IframeAuthenticationBroker,
  UniqueUserId,
  User,
  FormPrefill,
  Notifications,
  RefreshObserver,
  AppView,
  CloseButtonView
) {
  'use strict';

  function Start(options) {
    options = options || {};

    this._authenticationBroker = options.broker;
    this._configLoader = new ConfigLoader();
    this._history = options.history || Backbone.history;
    this._notifications = options.notifications;
    this._refreshObserver = options.refreshObserver;
    this._relier = options.relier;
    this._router = options.router;
    this._storage = options.storage || Storage;
    this._user = options.user;
    this._window = options.window || window;
  }

  Start.prototype = {
    // delay before redirecting to the error page to
    // ensure metrics are reported to the backend.
    ERROR_REDIRECT_TIMEOUT_MS: 1000,
    startApp: function () {
      var self = this;

      // fetch both config and translations in parallel to speed up load.
      return p.all([
        this.initializeConfig(),
        this.initializeL10n(),
        this.initializeInterTabChannel()
      ])
      .then(_.bind(this.allResourcesReady, this))
      .fail(function (err) {
        if (console && console.error) {
          console.error('Critical error:');
          console.error(String(err));
        }

        // if there is no error metrics set that means there was probably an error with app start
        // therefore force error reporting to get error information
        if (! self._sentryMetrics) {
          self.enableSentryMetrics();
        }

        self._sentryMetrics.captureException(err);

        if (self._metrics) {
          self._metrics.logError(err);
        }

        // give a bit of time to flush the Sentry error logs,
        // otherwise Safari Mobile redirects too quickly.
        return p().delay(self.ERROR_REDIRECT_TIMEOUT_MS)
          .then(function () {
            if (self._metrics) {
              return self._metrics.flush();
            }
          })
          .then(function () {
            //Something terrible happened. Let's bail.
            var redirectTo = self._getErrorPage(err);
            self._window.location.href = redirectTo;
          });
      });
    },

    initializeInterTabChannel: function () {
      this._interTabChannel = new InterTabChannel();
    },

    initializeAble: function () {
      this._able = new Able();
    },

    initializeConfig: function () {
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
                    // assertionLibrary depends on fxaClient
                    .then(_.bind(this.initializeAssertionLibrary, this))
                    // profileClient depends on fxaClient and assertionLibrary
                    .then(_.bind(this.initializeProfileClient, this))
                    // marketingEmailClient depends on config
                    .then(_.bind(this.initializeMarketingEmailClient, this))
                    // user depends on the profileClient, oAuthClient, and assertionLibrary.
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
                    // depends on iframeChannel and interTabChannel
                    .then(_.bind(this.initializeNotifications, this))
                    // depends on notifications, metrics
                    .then(_.bind(this.initializeRefreshObserver, this))
                    // router depends on all of the above
                    .then(_.bind(this.initializeRouter, this))
                    // appView depends on the router
                    .then(_.bind(this.initializeAppView, this));
    },

    useConfig: function (config) {
      this._config = config;
      this._configLoader.useConfig(config);
    },

    initializeErrorMetrics: function () {
      if (this._config && this._config.env && this._able) {
        var abData = {
          env: this._config.env,
          uniqueUserId: this._getUniqueUserId()
        };
        var abChoose = this._able.choose('sentryEnabled', abData);

        if (abChoose) {
          this.enableSentryMetrics();
        }
      }
    },

    enableSentryMetrics: function () {
      this._sentryMetrics = new SentryMetrics(this._window.location.host);
    },

    initializeL10n: function () {
      this._translator = this._window.translator = new Translator();
      return this._translator.fetch();
    },

    initializeMetrics: function () {
      var isSampledUser = this._able.choose('isSampledUser', {
        env: this._config.env,
        uniqueUserId: this._getUniqueUserId()
      });

      var relier = this._relier;
      var screenInfo = new ScreenInfo(this._window);
      this._metrics = this._createMetrics({
        able: this._able,
        campaign: relier.get('campaign'),
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

    _getAllowedParentOrigins: function () {
      if (! this._isInAnIframe()) {
        return [];
      } else if (this._isSync()) {
        // If in an iframe for sync, the origin is checked against
        // a pre-defined set of origins sent from the server.
        return this._config.allowedParentOrigins;
      } else if (this._isOAuth()) {
        // If in oauth, the relier has the allowed parent origin.
        return [this._relier.get('origin')];
      }

      return [];
    },

    _checkParentOrigin: function (originCheck) {
      var self = this;
      originCheck = originCheck || new OriginCheck({
        window: self._window
      });
      var allowedOrigins = self._getAllowedParentOrigins();

      return originCheck.getOrigin(self._window.parent, allowedOrigins);
    },

    initializeIframeChannel: function () {
      var self = this;
      if (! self._isInAnIframe()) {
        // Create a NullChannel in case any dependencies require it, such
        // as when the FirstRunAuthenticationBroker is used in functional
        // tests. The firstrun tests don't actually use an iframe, so the
        // real IframeChannel is not created.
        self._iframeChannel = new NullChannel();
        return p();
      }

      return self._checkParentOrigin()
        .then(function (parentOrigin) {
          if (! parentOrigin) {
            // No allowed origins were found. Illegal iframe.
            throw AuthErrors.toError('ILLEGAL_IFRAME_PARENT');
          }

          var iframeChannel = new IframeChannel();
          iframeChannel.initialize({
            metrics: self._metrics,
            origin: parentOrigin,
            window: self._window
          });

          self._iframeChannel = iframeChannel;
        });
    },

    initializeFormPrefill: function () {
      this._formPrefill = new FormPrefill();
    },

    initializeOAuthClient: function () {
      this._oAuthClient = new OAuthClient({
        oAuthUrl: this._config.oAuthUrl
      });
    },

    initializeProfileClient: function () {
      this._profileClient = new ProfileClient({
        profileUrl: this._config.profileUrl
      });
    },

    initializeMarketingEmailClient: function () {
      this._marketingEmailClient = new MarketingEmailClient({
        baseUrl: this._config.marketingEmailServerUrl,
        preferencesUrl: this._config.marketingEmailPreferencesUrl
      });
    },

    initializeRelier: function () {
      if (! this._relier) {
        var relier;

        if (this._isSync()) {
          // Use the SyncRelier for sync verification so that
          // the service name is translated correctly.
          relier = new SyncRelier({
            translator: this._translator,
            window: this._window
          });
        } else if (this._isOAuth()) {
          relier = new OAuthRelier({
            oAuthClient: this._oAuthClient,
            session: Session,
            window: this._window
          });
        } else {
          relier = new Relier({
            window: this._window
          });
        }

        this._relier = relier;
        return relier.fetch();
      }
    },

    initializeAssertionLibrary: function () {
      this._assertionLibrary = new Assertion({
        audience: this._config.oAuthUrl,
        fxaClient: this._fxaClient
      });
    },

    initializeAuthenticationBroker: function () {
      if (! this._authenticationBroker) {
        if (this._isFirstRun()) {
          this._authenticationBroker = new FirstRunAuthenticationBroker({
            iframeChannel: this._iframeChannel,
            relier: this._relier,
            window: this._window
          });
        } else if (this._isFxFennecV1()) {
          this._authenticationBroker = new FxFennecV1AuthenticationBroker({
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
        } else if (this._isFxiOSV2()) {
          this._authenticationBroker = new FxiOSV2AuthenticationBroker({
            relier: this._relier,
            window: this._window
          });
        } else if (this._isWebChannel()) {
          this._authenticationBroker = new WebChannelAuthenticationBroker({
            assertionLibrary: this._assertionLibrary,
            fxaClient: this._fxaClient,
            oAuthClient: this._oAuthClient,
            relier: this._relier,
            session: Session,
            window: this._window
          });
        } else if (this._isIframe()) {
          this._authenticationBroker = new IframeAuthenticationBroker({
            assertionLibrary: this._assertionLibrary,
            channel: this._iframeChannel,
            metrics: this._metrics,
            oAuthClient: this._oAuthClient,
            relier: this._relier,
            session: Session,
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

        var metrics = this._metrics;
        var win = this._window;

        this._authenticationBroker.on('error', function (err) {
          win.console.error('broker error', String(err));
          metrics.logError(err);
        });

        metrics.setBrokerType(this._authenticationBroker.type);

        return this._authenticationBroker.fetch();
      }
    },

    initializeHeightObserver: function () {
      var self = this;
      if (self._isInAnIframe()) {
        var heightObserver = new HeightObserver({
          target: self._window.document.body,
          window: self._window
        });

        heightObserver.on('change', function (height) {
          self._iframeChannel.send('resize', { height: height });
        });

        heightObserver.start();
      }
    },

    initializeCloseButton: function () {
      if (this._authenticationBroker.canCancel()) {
        this._closeButton = new CloseButtonView({
          broker: this._authenticationBroker
        });
        this._closeButton.render();
      }
    },

    initializeFxaClient: function () {
      if (! this._fxaClient) {
        this._fxaClient = new FxaClient({
          authServerUrl: this._config.authServerUrl,
          interTabChannel: this._interTabChannel
        });
      }
    },

    initializeUser: function () {
      if (! this._user) {
        this._user = new User({
          assertion: this._assertionLibrary,
          fxaClient: this._fxaClient,
          marketingEmailClient: this._marketingEmailClient,
          oAuthClient: this._oAuthClient,
          oAuthClientId: this._config.oAuthClientId,
          profileClient: this._profileClient,
          storage: this._getStorageInstance(),
          uniqueUserId: this._getUniqueUserId()
        });
      }
    },

    initializeNotifications: function () {
      if (! this._notifications) {
        var notificationWebChannel =
              new WebChannel(Constants.ACCOUNT_UPDATES_WEBCHANNEL_ID);
        notificationWebChannel.initialize();

        this._notifications = new Notifications({
          iframeChannel: this._iframeChannel,
          tabChannel: this._interTabChannel,
          webChannel: notificationWebChannel
        });
      }
    },

    initializeRefreshObserver: function () {
      if (! this._refreshObserver) {
        this._refreshObserver = new RefreshObserver({
          metrics: this._metrics,
          notifications: this._notifications,
          window: this._window
        });
      }
    },

    _uniqueUserId: null,
    _getUniqueUserId: function () {
      if (! this._uniqueUserId) {
        /**
         * Sets a UUID value that is unrelated to any account information.
         * This value is useful to determine if the logged out user qualifies
         * for A/B testing or metrics.
         */
        this._uniqueUserId = new UniqueUserId({
          window: this._window
        }).get('uniqueUserId');
      }

      return this._uniqueUserId;
    },

    upgradeStorageFormats: function () {
      return this._user.upgradeFromSession(Session, this._fxaClient);
    },

    initializeRouter: function () {
      if (! this._router) {
        this._router = new Router({
          able: this._able,
          broker: this._authenticationBroker,
          formPrefill: this._formPrefill,
          fxaClient: this._fxaClient,
          interTabChannel: this._interTabChannel,
          language: this._config.language,
          metrics: this._metrics,
          notifications: this._notifications,
          relier: this._relier,
          sentryMetrics: this._sentryMetrics,
          session: Session,
          user: this._user
        });
      }
      this._window.router = this._router;
    },

    initializeAppView: function () {
      if (! this._appView) {
        this._appView = new AppView({
          el: 'body',
          environment: new Environment(this._window),
          notifications: this._notifications,
          router: this._router,
          window: this._window
        });
      }
    },

    allResourcesReady: function () {
      // The IFrame cannot use pushState or else a page transition
      // would cause the parent frame to redirect.
      var usePushState = ! this._isInAnIframe();

      if (! usePushState) {
        // If pushState cannot be used, Backbone falls back to using
        // the hashchange. Put the initial pathname onto the hash
        // so the correct page loads.
        this._window.location.hash = this._window.location.pathname;
      }

      // If a new start page is specified, do not attempt to render
      // the route displayed in the URL because the user is
      // immediately redirected
      var startPage = this._selectStartPage();
      var isSilent = !! startPage;
      this._history.start({ pushState: usePushState, silent: isSilent });
      if (startPage) {
        this._router.navigate(startPage);
      }
    },

    _getErrorPage: function (err) {
      if (OAuthErrors.is(err, 'MISSING_PARAMETER') ||
          OAuthErrors.is(err, 'UNKNOWN_CLIENT')) {
        var queryString = Url.objToSearchString({
          client_id: err.client_id, //eslint-disable-line camelcase
          context: err.context,
          errno: err.errno,
          message: OAuthErrors.toInterpolatedMessage(err, this._translator),
          namespace: err.namespace,
          param: err.param
        });

        return Constants.BAD_REQUEST_PAGE + queryString;
      }

      return Constants.INTERNAL_ERROR_PAGE;
    },

    _getStorageInstance: function () {
      return Storage.factory('localStorage', this._window);
    },

    _isSync: function () {
      return this._searchParam('service') === Constants.SYNC_SERVICE;
    },

    _isFxFennecV1: function () {
      return this._searchParam('context') === Constants.FX_FENNEC_V1_CONTEXT;
    },

    _isFxDesktopV1: function () {
      return this._searchParam('context') === Constants.FX_DESKTOP_V1_CONTEXT;
    },

    _isFxDesktopV2: function () {
      // A user is signing into sync from within an iframe on a trusted
      // web page. Automatically speak version 2 using WebChannels.
      //
      // A check for context=fx_desktop_v2 can be added when about:accounts
      // is converted to use WebChannels.
      return (this._isSync() && this._isIframeContext()) ||
             (this._searchParam('context') === Constants.FX_DESKTOP_V2_CONTEXT);
    },

    _isFxiOSV1: function () {
      return this._searchParam('context') === Constants.FX_IOS_V1_CONTEXT;
    },

    _isFxiOSV2: function () {
      return this._searchParam('context') === Constants.FX_IOS_V2_CONTEXT;
    },

    _isFirstRun: function () {
      return this._isFxDesktopV2() && this._isIframeContext();
    },

    _isWebChannel: function () {
      return !! (this._searchParam('webChannelId') || // signup/signin
                (this._isOAuthVerificationSameBrowser() &&
                  Session.oauth && Session.oauth.webChannelId));
    },

    _isInAnIframe: function () {
      return new Environment(this._window).isFramed();
    },

    _isIframeContext: function () {
      return this._searchParam('context') === Constants.IFRAME_CONTEXT;
    },

    _isIframe: function () {
      return this._isInAnIframe() && this._isIframeContext();
    },

    _isOAuth: function () {
      // for /force_auth
      return !! (this._searchParam('client_id') ||
                 // for verification flows
                 (this._searchParam('code') && this._searchParam('service')) ||
                 // for /oauth/signin or /oauth/signup
                 /oauth/.test(this._window.location.href));
    },

    _isOAuthVerificationSameBrowser: function () {
      var savedClientId = Session.oauth && Session.oauth.client_id;
      return !! (this._searchParam('code') &&
                (this._searchParam('service') === savedClientId));
    },

    _searchParam: function (name) {
      return Url.searchParam(name, this._window.location.search);
    },

    _selectStartPage: function () {
      if (this._window.location.pathname !== '/cookies_disabled' &&
        ! this._storage.isLocalStorageEnabled(this._window)) {
        return 'cookies_disabled';
      }
    },

    _createMetrics: function (options) {
      if (this._isAutomatedBrowser()) {
        return new StorageMetrics(options);
      }

      return new Metrics(options);
    },

    _isAutomatedBrowser: function () {
      return this._searchParam('automatedBrowser') === 'true';
    }
  };

  return Start;
});
