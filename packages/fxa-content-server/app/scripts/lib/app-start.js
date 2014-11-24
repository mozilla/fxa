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

'use strict';

define([
  'underscore',
  'backbone',
  'lib/promise',
  'router',
  'lib/translator',
  'lib/session',
  'lib/url',
  'lib/config-loader',
  'lib/metrics',
  'lib/null-metrics',
  'lib/fxa-client',
  'lib/assertion',
  'lib/constants',
  'lib/oauth-client',
  'lib/profile-client',
  'lib/auth-errors',
  'lib/channels/inter-tab',
  'lib/storage',
  'models/reliers/relier',
  'models/reliers/oauth',
  'models/reliers/fx-desktop',
  'models/auth_brokers/base',
  'models/auth_brokers/fx-desktop',
  'models/auth_brokers/web-channel',
  'models/auth_brokers/redirect',
  'models/user'
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
  Metrics,
  NullMetrics,
  FxaClient,
  Assertion,
  Constants,
  OAuthClient,
  ProfileClient,
  AuthErrors,
  InterTabChannel,
  Storage,
  Relier,
  OAuthRelier,
  FxDesktopRelier,
  BaseAuthenticationBroker,
  FxDesktopAuthenticationBroker,
  WebChannelAuthenticationBroker,
  RedirectAuthenticationBroker,
  User
) {

  function isMetricsCollectionEnabled(sampleRate) {
    return Math.random() <= sampleRate;
  }

  function createMetrics(sampleRate, options) {
    if (isMetricsCollectionEnabled(sampleRate)) {
      return new Metrics(options);
    }

    return new NullMetrics();
  }

  function Start(options) {
    options = options || {};

    this._window = options.window || window;
    this._router = options.router;
    this._relier = options.relier;
    this._authenticationBroker = options.broker;
    this._user = options.user;

    this._history = options.history || Backbone.history;
    this._configLoader = new ConfigLoader();
  }

  Start.prototype = {
    startApp: function () {
      var self = this;

      // fetch both config and translations in parallel to speed up load.
      return p.all([
        this.initializeConfig(),
        this.initializeL10n(),
        this.initializeInterTabChannel()
      ])
      .then(_.bind(this.allResourcesReady, this))
      .then(null, function (err) {
        if (console && console.error) {
          console.error('Critical error:', err);
        }
        if (self._metrics) {
          self._metrics.logError(err);
        }

        //Something terrible happened. Let's bail.
        self._window.location.href = Constants.INTERNAL_ERROR_PAGE;
      });
    },

    initializeInterTabChannel: function () {
      this._interTabChannel = new InterTabChannel();
    },

    initializeConfig: function () {
      return this._configLoader.fetch()
                    .then(_.bind(this.useConfig, this))
                    .then(_.bind(this.initializeOAuthClient, this))
                    // both the metrics and router depend on the language
                    // fetched from config.
                    .then(_.bind(this.initializeRelier, this))
                    // fxaClient depends on the relier and
                    // inter tab communication.
                    .then(_.bind(this.initializeFxaClient, this))
                    // assertionLibrary depends on fxaClient
                    .then(_.bind(this.initializeAssertionLibrary, this))
                    // profileClient depends on fxaClient and assertionLibrary
                    .then(_.bind(this.initializeProfileClient, this))
                    // user depends on the profileClient, oAuthClient, and assertionLibrary.
                    .then(_.bind(this.initializeUser, this))
                    // broker relies on the user, relier and assertionLibrary
                    .then(_.bind(this.initializeAuthenticationBroker, this))
                    // storage format upgrades depend on user
                    .then(_.bind(this.upgradeStorageFormats, this))

                    // metrics depends on the relier.
                    .then(_.bind(this.initializeMetrics, this))
                    // router depends on all of the above
                    .then(_.bind(this.initializeRouter, this));
    },

    useConfig: function (config) {
      this._config = config;
      this._configLoader.useConfig(config);
      Session.set('config', config);
    },

    initializeL10n: function () {
      this._translator = this._window.translator = new Translator();
      return this._translator.fetch();
    },

    initializeMetrics: function () {
      var relier = this._relier;
      this._metrics = createMetrics(this._config.metricsSampleRate, {
        lang: this._config.language,
        service: relier.get('service'),
        context: relier.get('context'),
        entrypoint: relier.get('entrypoint'),
        migration: relier.get('migration'),
        campaign: relier.get('campaign')
      });
      this._metrics.init();
    },

    initializeOAuthClient: function () {
      this._oAuthClient = new OAuthClient({
        oauthUrl: this._config.oauthUrl
      });
    },

    initializeProfileClient: function () {
      this._profileClient = new ProfileClient({
        profileUrl: this._config.profileUrl
      });
    },

    initializeRelier: function () {
      if (! this._relier) {
        var relier;

        if (this._isFxDesktop()) {
          // Use the FxDesktopRelier for sync verification so that
          // the service name is translated correctly.
          relier = new FxDesktopRelier({
            window: this._window,
            translator: this._translator
          });
        } else if (this._isOAuth()) {
          relier = new OAuthRelier({
            window: this._window,
            oAuthClient: this._oAuthClient,
            session: Session
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
        fxaClient: this._fxaClient,
        audience: this._config.oauthUrl
      });
    },

    initializeAuthenticationBroker: function () {
      if (! this._authenticationBroker) {
        if (this._isFxDesktop()) {
          this._authenticationBroker = new FxDesktopAuthenticationBroker({
            window: this._window,
            relier: this._relier,
            session: Session,
            user: this._user
          });
        } else if (this._isWebChannel()) {
          this._authenticationBroker = new WebChannelAuthenticationBroker({
            window: this._window,
            relier: this._relier,
            assertionLibrary: this._assertionLibrary,
            oAuthClient: this._oAuthClient,
            oAuthUrl: this._config.oauthUrl,
            user: this._user,
            session: Session
          });
        } else if (this._isOAuth()) {
          this._authenticationBroker = new RedirectAuthenticationBroker({
            window: this._window,
            relier: this._relier,
            assertionLibrary: this._assertionLibrary,
            oAuthClient: this._oAuthClient,
            oAuthUrl: this._config.oauthUrl,
            user: this._user,
            session: Session
          });
        } else {
          this._authenticationBroker = new BaseAuthenticationBroker();
        }

        return this._authenticationBroker.fetch();
      }
    },

    initializeFxaClient: function () {
      if (! this._fxaClient) {
        this._fxaClient = new FxaClient({
          interTabChannel: this._interTabChannel
        });
      }
    },

    initializeUser: function () {
      if (! this._user) {
        this._user = new User({
          oAuthClientId: this._config.oauthClientId,
          profileClient: this._profileClient,
          oAuthClient: this._oAuthClient,
          fxaClient: this._fxaClient,
          assertion: this._assertionLibrary,
          storage: this._getStorageInstance()
        });
      }
    },

    upgradeStorageFormats: function () {
      return this._user.upgradeFromSession(Session, this._fxaClient);
    },


    initializeRouter: function () {
      if (! this._router) {
        this._router = new Router({
          metrics: this._metrics,
          language: this._config.language,
          relier: this._relier,
          broker: this._authenticationBroker,
          fxaClient: this._fxaClient,
          user: this._user,
          interTabChannel: this._interTabChannel
        });
      }
      this._window.router = this._router;
    },

    allResourcesReady: function () {
      var self = this;
      return this._selectStartPage()
          .then(function (startPage) {
            // Get the party started.
            // If a new start page is specified, do not attempt to render
            // the route displayed in the URL because the user is
            // immediately redirected
            self._history.start({ pushState: true, silent: !! startPage });
            if (startPage) {
              self._router.navigate(startPage);
            }
          });
    },

    _getStorageInstance: function () {
      return Storage.factory('localStorage', this._window);
    },

    _isFxDesktop: function () {
      return ((this._searchParam('service') === Constants.FX_DESKTOP_SYNC) ||
              (this._searchParam('context') === Constants.FX_DESKTOP_CONTEXT));
    },

    _isWebChannel: function () {
      return !! (this._searchParam('webChannelId') || // signup/signin
                (this._isOAuthVerificationSameBrowser() &&
                  Session.oauth && Session.oauth.webChannelId));
    },

    _isOAuth: function () {
      return !! (this._searchParam('client_id') || this._searchParam('code'));
    },

    _isOAuthVerificationSameBrowser: function () {
      //jshint camelcase: false
      var savedClientId = Session.oauth && Session.oauth.client_id;
      return !! (this._searchParam('code') &&
                (this._searchParam('service') === savedClientId));
    },

    _searchParam: function (name) {
      return Url.searchParam(name, this._window.location.search);
    },

    _selectStartPage: function () {
      var self = this;
      return p().then(function () {
        if (self._window.location.pathname === '/cookies_disabled') {
          // If the user is already at the cookies_disabled page, don't even
          // attempt the cookie check or else a blank screen is rendered if
          // cookies are actually disabled.
          return;
        }

        return self._configLoader.areCookiesEnabled(false, self._window)
            .then(function (areCookiesEnabled) {
              if (! areCookiesEnabled) {
                return 'cookies_disabled';
              }

              return self._authenticationBroker.selectStartPage();
            });
      });
    }
  };

  return Start;
});
