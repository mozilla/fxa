/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * A metrics module!
 *
 * An instantiated metrics object has two primary APIs:
 *
 * metrics.logEvent(<event_name>);
 * metrics.startTimer(<timer_name>)/metrics.stopTimer(<timer_name);
 *
 * Metrics are automatically sent to the server on window.unload
 * but can also be sent by calling metrics.flush();
 */

define([
  'underscore',
  'backbone',
  'jquery',
  'speedTrap',
  'lib/xhr',
  'lib/strings'
], function (_, Backbone, $, speedTrap, xhr, Strings) {
  'use strict';

  // Speed trap is a singleton, convert it
  // to an instantiable function.
  var SpeedTrap = function () {};
  SpeedTrap.prototype = speedTrap;

  var ALLOWED_FIELDS = [
    'campaign',
    'context',
    'duration',
    'entrypoint',
    'events',
    'migration',
    'lang',
    'marketing',
    'navigationTiming',
    'referrer',
    'screen',
    'service',
    'timers',
    'broker',
    'ab',
    'isSampledUser',
    'uniqueUserId',
    'utm_campaign',
    'utm_content',
    'utm_medium',
    'utm_source',
    'utm_term'
  ];

  var TEN_MINS_MS = 10 * 60 * 1000;
  var NOT_REPORTED_VALUE = 'none';
  var UNKNOWN_CAMPAIGN_ID = 'unknown';


  // convert a hash of marketing impressions into an array of objects.
  function flattenMarketingImpressions (impressions) {
    return _.reduce(impressions, function (memo, impressionsById) {
      return memo.concat(_.map(impressionsById, function (impression) {
        return impression;
      }));
    }, []);
  }

  function Metrics (options) {
    /*eslint complexity: [2, 26] */
    options = options || {};

    // by default, send the metrics to the content server.
    this._collector = options.collector || '';

    this._ajax = options.ajax || xhr.ajax;

    this._speedTrap = new SpeedTrap();
    this._speedTrap.init();

    // `timers` and `events` are part of the public API
    this.timers = this._speedTrap.timers;
    this.events = this._speedTrap.events;

    this._window = options.window || window;

    this._lang = options.lang || 'unknown';
    this._context = options.context || 'web';
    this._entrypoint = options.entrypoint || NOT_REPORTED_VALUE;
    this._migration = options.migration || NOT_REPORTED_VALUE;
    this._service = options.service || NOT_REPORTED_VALUE;
    this._campaign = options.campaign || NOT_REPORTED_VALUE;
    this._brokerType = options.brokerType || NOT_REPORTED_VALUE;

    this._clientHeight = options.clientHeight || NOT_REPORTED_VALUE;
    this._clientWidth = options.clientWidth || NOT_REPORTED_VALUE;
    this._devicePixelRatio = options.devicePixelRatio || NOT_REPORTED_VALUE;
    this._screenHeight = options.screenHeight || NOT_REPORTED_VALUE;
    this._screenWidth = options.screenWidth || NOT_REPORTED_VALUE;

    // All user metrics are sent to the backend. Data is only
    // reported to Heka and Datadog if `isSampledUser===true`.
    this._isSampledUser = options.isSampledUser || false;

    this._referrer = this._window.document.referrer || NOT_REPORTED_VALUE;
    this._uniqueUserId = options.uniqueUserId || NOT_REPORTED_VALUE;
    this._utmCampaign = options.utmCampaign || NOT_REPORTED_VALUE;
    this._utmContent = options.utmContent || NOT_REPORTED_VALUE;
    this._utmMedium = options.utmMedium || NOT_REPORTED_VALUE;
    this._utmSource = options.utmSource || NOT_REPORTED_VALUE;
    this._utmTerm = options.utmTerm || NOT_REPORTED_VALUE;

    this._inactivityFlushMs = options.inactivityFlushMs || TEN_MINS_MS;

    this._marketingImpressions = {};

    this._able = options.able;
  }

  _.extend(Metrics.prototype, Backbone.Events, {
    ALLOWED_FIELDS: ALLOWED_FIELDS,

    init: function () {
      this._flush = _.bind(this.flush, this);
      $(this._window).on('unload', this._flush);

      // Set the initial inactivity timeout to clear navigation timing data.
      this._resetInactivityFlushTimeout();
    },

    destroy: function () {
      $(this._window).off('unload', this._flush);
      this._clearInactivityFlushTimeout();
    },

    /**
     * Send the collected data to the backend.
     */
    flush: function () {
      // Inactivity timer is restarted when the next event/timer comes in.
      // This avoids sending empty result sets if the tab is
      // just sitting there open with no activity.
      this._clearInactivityFlushTimeout();

      var filteredData = this.getFilteredData();
      this._speedTrap.events.clear();
      this._speedTrap.timers.clear();

      var url = this._collector + '/metrics';

      // use a synchronous request to block the page from unloading
      // until the request is complete.
      return this._send(filteredData, url, false);
    },

    _clearInactivityFlushTimeout: function () {
      clearTimeout(this._inactivityFlushTimeout);
    },

    _resetInactivityFlushTimeout: function () {
      this._clearInactivityFlushTimeout();

      var self = this;
      this._inactivityFlushTimeout =
          setTimeout(function () {
            self.logEvent('inactivity.flush');
            self.flush();
          }, this._inactivityFlushMs);
    },


    /**
     * Get all the data, whether it's allowed to be sent or not.
     */
    getAllData: function () {
      var loadData = this._speedTrap.getLoad();
      var unloadData = this._speedTrap.getUnload();

      var allData = _.extend({}, loadData, unloadData, {
        ab: this._able ? this._able.report() : [],
        context: this._context,
        service: this._service,
        broker: this._brokerType,
        lang: this._lang,
        entrypoint: this._entrypoint,
        migration: this._migration,
        marketing: flattenMarketingImpressions(this._marketingImpressions),
        campaign: this._campaign,
        referrer: this._referrer,
        screen: {
          devicePixelRatio: this._devicePixelRatio,
          clientWidth: this._clientWidth,
          clientHeight: this._clientHeight,
          width: this._screenWidth,
          height: this._screenHeight
        },
        isSampledUser: this._isSampledUser,
        uniqueUserId: this._uniqueUserId,
        utm_campaign: this._utmCampaign, //eslint-disable-line camelcase
        utm_content: this._utmContent, //eslint-disable-line camelcase
        utm_medium: this._utmMedium, //eslint-disable-line camelcase
        utm_source: this._utmSource, //eslint-disable-line camelcase
        utm_term: this._utmTerm, //eslint-disable-line camelcase
      });

      return allData;
    },

    /**
     * Get the filtered data.
     * Filtered data is data that is allowed to be sent,
     * that is defined and not an empty string.
     */
    getFilteredData: function () {
      var allData = this.getAllData();

      var filteredData = {};
      _.forEach(ALLOWED_FIELDS, function (itemName) {
        if (typeof allData[itemName] !== 'undefined' &&
            allData[itemName] !== '') {
          filteredData[itemName] = allData[itemName];
        }
      });

      return filteredData;
    },

    _send: function (data, url, async) {
      var self = this;
      return this._ajax({
        async: async !== false,
        type: 'POST',
        url: url,
        contentType: 'application/json',
        data: JSON.stringify(data)
      })
      .then(function () {
        self.trigger('flush.success', data);
        return data;
      }, function (jqXHR) {
        self.trigger('flush.error');
        throw jqXHR.statusText;
      });
    },

    /**
     * Log an event
     */
    logEvent: function (eventName) {
      this._resetInactivityFlushTimeout();
      this.events.capture(eventName);
    },

    /**
     * Start a timer
     */
    startTimer: function (timerName) {
      this._resetInactivityFlushTimeout();
      this.timers.start(timerName);
    },

    /**
     * Stop a timer
     */
    stopTimer: function (timerName) {
      this._resetInactivityFlushTimeout();
      this.timers.stop(timerName);
    },

    /**
     * Log an error.
     */
    logError: function (error) {
      this.logEvent(this.errorToId(error));
    },

    /**
     * Convert an error to an identifier that can be used for logging.
     */
    errorToId: function (error) {
      var id = Strings.interpolate('error.%s.%s.%s', [
        error.context || 'unknown context',
        error.namespace || 'unknown namespace',
        error.errno || String(error)
      ]);
      return id;
    },

    /**
     * Log a screen
     */
    logScreen: function (screenName) {
      this.logEvent(this.screenToId(screenName));
    },

    /**
     * Convert a screenName an identifier
     */
    screenToId: function (screenName) {
      return 'screen.' + screenName;
    },

    /**
     * Log when a marketing snippet is shown to the user
     *
     * @param {String} campaignId - marketing campaign id
     * @param {String} url - url of marketing link
     */
    logMarketingImpression: function (campaignId, url) {
      campaignId = campaignId || UNKNOWN_CAMPAIGN_ID;

      var impressions = this._marketingImpressions;
      if (! impressions[campaignId]) {
        impressions[campaignId] = {};
      }

      impressions[campaignId][url] = {
        campaignId: campaignId,
        url: url,
        clicked: false
      };
    },

    /**
     * Log whether the user clicked on a marketing link
     *
     * @param {String} campaignId - marketing campaign id
     * @param {String} url - URL clicked.
     */
    logMarketingClick: function (campaignId, url) {
      campaignId = campaignId || UNKNOWN_CAMPAIGN_ID;

      var impression = this.getMarketingImpression(campaignId, url);

      if (impression) {
        impression.clicked = true;
      }
    },

    getMarketingImpression: function (campaignId, url) {
      var impressions = this._marketingImpressions;
      return impressions[campaignId] && impressions[campaignId][url];
    },

    setBrokerType: function (brokerType) {
      this._brokerType = brokerType;
    },

    isCollectionEnabled: function () {
      return this._isSampledUser;
    }
  });

  return Metrics;
});


