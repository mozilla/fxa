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
  'lib/channels',
  'lib/config-loader',
  'lib/metrics',
  'lib/null-metrics',
  'lib/fxa-client',
  'models/reliers/relier'
],
function (
  _,
  Backbone,
  p,
  Router,
  Translator,
  Session,
  Url,
  Channels,
  ConfigLoader,
  Metrics,
  NullMetrics,
  FxaClient,
  Relier
) {

  function isMetricsCollectionEnabled (sampleRate) {
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

    this._history = options.history || Backbone.history;
    this._configLoader = new ConfigLoader();
  }

  Start.prototype = {
    startApp: function () {
      this.initSessionFromUrl();

      // fetch both config and translations in parallel to speed up load.
      return p.all([
        this.initializeConfig(),
        this.initializeL10n()
      ])
      .then(_.bind(this.allResourcesReady, this));
    },

    initializeConfig: function () {
      return this._configLoader.fetch()
                    .then(_.bind(this.useConfig, this))
                    // both the metrics and router depend on the language
                    // fetched from config.
                    .then(_.bind(this.initializeMetrics, this))
                    .then(_.bind(this.initializeRelier, this))
                    .then(_.bind(this.initializeFxaClient, this))
                    // router depends on all of the above
                    .then(_.bind(this.initializeRouter, this));
    },

    useConfig: function (config) {
      this._config = config;
      this._configLoader.useConfig(config);
      Session.set('config', config);
    },

    initializeL10n: function () {
      var translator = this._window.translator = new Translator();
      return translator.fetch();
    },

    initializeMetrics: function () {
      this._metrics = createMetrics(this._config.metricsSampleRate, {
        lang: this._config.language
      });
      this._metrics.init();
    },

    initializeRelier: function () {
      this._relier = new Relier();
      return this._relier.fetch();
    },

    initializeFxaClient: function () {
      if (! this._fxaClient) {
        this._fxaClient = new FxaClient({
          relier: this._relier
        });
      }
    },

    initializeRouter: function () {
      if (! this._router) {
        this._router = new Router({
          metrics: this._metrics,
          language: this._config.language,
          relier: this._relier,
          fxaClient: this._fxaClient
        });
      }
      this._window.router = this._router;
    },

    allResourcesReady: function () {
      // These must be initialized after Backbone.history so that
      // Backbone does not override the page the channel sets.
      var self = this;
      return this._configLoader.areCookiesEnabled()
        .then(function (areCookiesEnabled) {
          // Get the party started.
          // If cookies are disabled, do not attempt to render the
          // route displayed in the URL because the user is immediately
          // redirected to cookies_disabled
          var shouldRenderFirstView = ! areCookiesEnabled;
          self._history.start({ pushState: true, silent: shouldRenderFirstView });

          if (! areCookiesEnabled) {
            self._router.navigate('cookies_disabled');
          } else if (Session.isDesktopContext()) {
            return self._selectFxDesktopStartPage();
          }
        });
    },

    _searchParam: function (name) {
      return Url.searchParam(name, this._window.location.search);
    },

    // XXX - does this belong here?
    _selectFxDesktopStartPage: function () {
      // Firefox for desktop native=>FxA glue code.
      var self = this;
      return Channels.sendExpectResponse('session_status', {}, { window: this._window })
          .then(function (response) {
            // Don't perform any redirection if a pathname is present
            var canRedirect = self._window.location.pathname === '/';
            if (response && response.data) {
              Session.set('email', response.data.email);
              if (! Session.forceAuth && canRedirect) {
                self._router.navigate('settings', { trigger: true });
              }
            } else {
              Session.clear();
              if (canRedirect) {
                self._router.navigate('signup', { trigger: true });
              }
            }
          });
    },

    setSessionValueFromUrl: function (paramName, sessionName) {
      var value = this._searchParam(paramName);
      var name = sessionName || paramName;
      if (value) {
        Session.set(name, value);
      } else {
        Session.clear(name);
      }
    },

    initSessionFromUrl: function () {
      this.setSessionValueFromUrl('service');
      this.setSessionValueFromUrl('redirectTo');
      this.setSessionValueFromUrl('context');
      this.initOAuthService();
    },

    // If Session.service hasn't been set,
    // look for the service in the `client_id` parameter.
    initOAuthService: function () {
      if (! Session.service) {
        this.setSessionValueFromUrl('client_id', 'service');
      }
    }
  };

  return Start;
});
