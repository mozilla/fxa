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
  'p-promise',
  'router',
  'lib/constants',
  'lib/translator',
  'lib/session',
  'lib/url',
  'lib/channels/web',
  'lib/channels/fx-desktop',
  'lib/config-loader',
  'lib/metrics',
  'lib/null-metrics'
],
function (
  _,
  Backbone,
  p,
  Router,
  Constants,
  Translator,
  Session,
  Url,
  WebChannel,
  FxDesktopChannel,
  ConfigLoader,
  Metrics,
  NullMetrics
) {

  function getChannel() {
    var context = Url.searchParam('context');
    var channel;

    if (context === Constants.FX_DESKTOP_CONTEXT) {
      // Firefox for desktop native=>FxA glue code.
      channel = new FxDesktopChannel();
    } else {
      // default to the web channel that doesn't do anything yet.
      channel = new WebChannel();
    }

    channel.init();
    return channel;
  }

  function setSessionValueFromUrl(name) {
    var value = Url.searchParam(name);
    if (value) {
      Session.set(name, value);
    } else {
      Session.clear(name);
    }
  }

  function initSessionFromUrl() {
    setSessionValueFromUrl('service');
    setSessionValueFromUrl('redirectTo');
    setSessionValueFromUrl('context');
  }

  function isMetricsCollectionEnabled (sampleRate) {
    return Math.random() <= sampleRate;
  }

  function createMetrics(sampleRate) {
    if (isMetricsCollectionEnabled(sampleRate)) {
      return new Metrics();
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
      initSessionFromUrl();

      // fetch both config and translations in parallel to speed up load.
      return p.all([
          this.initializeConfig(),
          this.initializeL10n()
        ])
        .then(_.bind(this.allResourcesReady, this));
    },

    initializeConfig: function () {
      return this._configLoader.fetch()
                    .then(_.bind(this.useConfig, this));
    },

    useConfig: function (config) {
      this._config = config;
      this._configLoader.useConfig(config);
      Session.set('config', config);
      Session.set('language', config.language);

      this._metrics = createMetrics(config.metricsSampleRate);
      this._metrics.init();

      if (! this._router) {
        this._router = new Router({ metrics: this._metrics });
      }
      this._window.router = this._router;
    },

    initializeL10n: function () {
      var deferred = p.defer();

      var translator = this._window.translator = new Translator();

      translator.fetch(_.bind(deferred.resolve, deferred));

      return deferred.promise;
    },

    /**
     * config can be passed in for testing
     */
    allResourcesReady: function () {
      // Get the party started
      this._history.start({ pushState: true });

      // These must be initialized after Backbone.history so that
      // Backbone does not override the page the channel sets.
      Session.set('channel', getChannel());
      var self = this;
      return this._configLoader.areCookiesEnabled()
        .then(function (areCookiesEnabled) {
          if (! areCookiesEnabled) {
            self._router.navigate('cookies_disabled');
          }
        });
    }
  };

  return Start;
});
