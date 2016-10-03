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

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var _ = require('underscore');
  var FlowEventMetadata = require('models/flow-event-metadata');
  var Backbone = require('backbone');
  var Duration = require('duration');
  var Environment = require('lib/environment');
  var p = require('lib/promise');
  var speedTrap = require('speedTrap');
  var Strings = require('lib/strings');
  var xhr = require('lib/xhr');

  // Speed trap is a singleton, convert it
  // to an instantiable function.
  var SpeedTrap = function () {};
  SpeedTrap.prototype = speedTrap;

  var ALLOWED_FIELDS = [
    'broker',
    'context',
    'duration',
    'entrypoint',
    'events',
    'experiments',
    'flowBeginTime',
    'flowId',
    'flushTime',
    'isSampledUser',
    'lang',
    'marketing',
    'migration',
    'navigationTiming',
    'referrer',
    'screen',
    'service',
    'startTime',
    'timers',
    'uniqueUserId',
    'utm_campaign',
    'utm_content',
    'utm_medium',
    'utm_source',
    'utm_term'
  ];

  var DEFAULT_INACTIVITY_TIMEOUT_MS = new Duration('2m').milliseconds();
  var NOT_REPORTED_VALUE = 'none';
  var UNKNOWN_CAMPAIGN_ID = 'unknown';

  // convert a hash of metrics impressions into an array of objects.
  function flattenHashIntoArrayOfObjects (hashTable) {
    return _.reduce(hashTable, function (memo, key) {
      return memo.concat(_.map(key, function (value) {
        return value;
      }));
    }, []);
  }

  function Metrics (options) {
    options = options || {};

    // by default, send the metrics to the content server.
    this._collector = options.collector || '';

    this._xhr = options.xhr || xhr;

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
    this._flowEventMetadata = new FlowEventMetadata(options);

    this._inactivityFlushMs = options.inactivityFlushMs || DEFAULT_INACTIVITY_TIMEOUT_MS;

    this._marketingImpressions = {};
    this._activeExperiments = {};
    this._eventMemory = {};

    this._able = options.able;
    this._env = options.environment || new Environment(this._window);

    // if navigationTiming is supported, the baseTime will be from
    // navigationTiming.navigationStart, otherwise Date.now().
    this._startTime = options.startTime || this._speedTrap.baseTime;
  }

  _.extend(Metrics.prototype, Backbone.Events, {
    ALLOWED_FIELDS: ALLOWED_FIELDS,

    init: function () {
      this._flush = _.bind(this.flush, this, true);
      $(this._window).on('unload', this._flush);
      // iOS will not send events once the window is in the background,
      // meaning the `unload` handler is ineffective. Send events on blur
      // instead, so events are not lost when a user goes to verify their
      // email.
      $(this._window).on('blur', this._flush);

      // Set the initial inactivity timeout to clear navigation timing data.
      this._resetInactivityFlushTimeout();
    },

    destroy: function () {
      $(this._window).off('unload', this._flush);
      $(this._window).off('blur', this._flush);
      this._clearInactivityFlushTimeout();
    },

    /**
     * Send the collected data to the backend.
     *
     * @param {String} isPageUnloading
     * @returns {Promise}
     */
    flush: function (isPageUnloading) {
      // Inactivity timer is restarted when the next event/timer comes in.
      // This avoids sending empty result sets if the tab is
      // just sitting there open with no activity.
      this._clearInactivityFlushTimeout();

      var self = this;
      var filteredData = this.getFilteredData();

      if (! this._isFlushRequired(filteredData)) {
        return p();
      }

      return this._send(filteredData, isPageUnloading)
        .then(function (sent) {
          if (sent) {
            self._speedTrap.events.clear();
            self._speedTrap.timers.clear();
          }

          return sent;
        });
    },

    _isFlushRequired: function (data) {
      return data.events.length !== 0 ||
        Object.keys(data.timers).length !== 0;
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
     *
     * @returns {Object}
     */
    getAllData: function () {
      var loadData = this._speedTrap.getLoad();
      var unloadData = this._speedTrap.getUnload();

      var allData = _.extend({}, loadData, unloadData, {
        broker: this._brokerType,
        context: this._context,
        entrypoint: this._entrypoint,
        experiments: flattenHashIntoArrayOfObjects(this._activeExperiments),
        flowBeginTime: this._flowBeginTime,
        flowId: this._flowId,
        flushTime: Date.now(),
        isSampledUser: this._isSampledUser,
        lang: this._lang,
        marketing: flattenHashIntoArrayOfObjects(this._marketingImpressions),
        migration: this._migration,
        referrer: this._referrer,
        screen: {
          clientHeight: this._clientHeight,
          clientWidth: this._clientWidth,
          devicePixelRatio: this._devicePixelRatio,
          height: this._screenHeight,
          width: this._screenWidth
        },
        service: this._service,
        startTime: this._startTime,
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
     *
     * @returns {Object}
     */
    getFilteredData: function () {
      var allowedData = _.pick(this.getAllData(), ALLOWED_FIELDS);

      return _.pick(allowedData, function (value, key) {
        return ! _.isUndefined(value) && value !== '';
      });
    },

    _send: function (data, isPageUnloading) {
      var self = this;
      var url = this._collector + '/metrics';
      var payload = JSON.stringify(data);

      if (this._env.hasSendBeacon()) {
        // Always use sendBeacon if it is available because:
        //   1. it works asynchronously, even on unload.
        //   2. user agents SHOULD make "multiple attempts to transmit the
        //      data in presence of transient network or server errors".
        return p().then(function () {
          return self._window.navigator.sendBeacon(url, payload);
        });
      }

      // XHR is a fallback option because synchronous XHR has been deprecated,
      // but we must call it synchronously in the unload case.
      return this._xhr.ajax({
        async: ! isPageUnloading,
        contentType: 'application/json',
        data: payload,
        type: 'POST',
        url: url
      })
      // Boolean return values imitate the behaviour of sendBeacon
      .then(function () {
        return true;
      }, function () {
        return false;
      });
    },

    /**
     * Log an event
     *
     * @param {String} eventName
     */
    logEvent: function (eventName) {
      this._resetInactivityFlushTimeout();
      this.events.capture(eventName);
    },

    /**
     * Log an event only if it never happened before during this page load.
     *
     * @param {String} eventName
     */
    logEventOnce: function (eventName) {
      if (! this._eventMemory[eventName]) {
        this.logEvent(eventName);
        this._eventMemory[eventName] = true;
      }
    },

    /**
     * Start a timer
     *
     * @param {String} timerName
     */
    startTimer: function (timerName) {
      this._resetInactivityFlushTimeout();
      this.timers.start(timerName);
    },

    /**
     * Stop a timer
     *
     * @param {String} timerName
     */
    stopTimer: function (timerName) {
      this._resetInactivityFlushTimeout();
      this.timers.stop(timerName);
    },

    /**
     * Log an error.
     *
     * @param {Error} error
     */
    logError: function (error) {
      this.logEvent(this.errorToId(error));
    },

    /**
     * Convert an error to an identifier that can be used for logging.
     *
     * @param {Error} error
     * @returns {String}
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
     * Log a view
     *
     * @param {String} viewName
     */
    logView: function (viewName) {
      this.logEvent(this.viewToId(viewName));
    },

    /**
     * Log an event with the view name as a prefix
     *
     * @param {String} viewName
     * @param {String} eventName
     */
    logViewEvent: function (viewName, eventName) {
      var event = Strings.interpolate('%(viewName)s.%(eventName)s', {
        eventName: eventName,
        viewName: viewName,
      });

      this.logEvent(event);
    },

    /**
     * Convert a viewName to an identifier used in metrics.
     *
     * @param {String} viewName
     * @return {String} identifier
     */
    viewToId: function (viewName) {
      // `screen.` is a legacy artifact from when each View was a screen.
      // The idenifier is kept to avoid updating all metrics queries.
      return 'screen.' + viewName;
    },
    /**
     * Log when an experiment is shown to the user
     *
     * @param {String} choice - type of experiment
     * @param {String} group - the experiment group (treatment or control)
     */
    logExperiment: function (choice, group) {
      if (! choice || ! group) {
        return;
      }

      var experiments = this._activeExperiments;

      if (! experiments[choice]) {
        experiments[choice] = {};
      }

      experiments[choice][group] = {
        choice: choice,
        group: group
      };
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
        clicked: false,
        url: url
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
    },

    logFlowBegin: function (flowId, flowBeginTime) {
      // Don't emit a new flow.begin event unless flowId has changed.
      if (flowId !== this._flowId) {
        this._flowId = flowId;
        this._flowBeginTime = flowBeginTime;
        this.logEvent('flow.begin');
      }
    },

    getFlowEventMetadata: function () {
      return this._flowEventMetadata.attributes;
    },

    setFlowEventMetadata: function () {
      this._flowEventMetadata.set.apply(this._flowEventMetadata, arguments);
    }
  });

  module.exports = Metrics;
});


