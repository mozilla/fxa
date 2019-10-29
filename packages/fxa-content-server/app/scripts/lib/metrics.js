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

import $ from 'jquery';
import _ from 'underscore';
import Cocktail from 'cocktail';
import Constants from './constants';
import Backbone from 'backbone';
import Duration from 'duration';
import Environment from './environment';
import FlowModel from '../models/flow';
import NotifierMixin from './channels/notifier-mixin';
import speedTrap from 'speed-trap';
import Strings from './strings';
import SubscriptionModel from 'models/subscription';
import xhr from './xhr';

// Speed trap is a singleton, convert it
// to an instantiable function.
const SpeedTrap = function() {};
SpeedTrap.prototype = speedTrap;

const ALLOWED_FIELDS = [
  'broker',
  'context',
  'deviceId',
  'duration',
  'emailDomain',
  'entrypoint',
  'entrypoint_experiment',
  'entrypoint_variation',
  'events',
  'experiments',
  'flowBeginTime',
  'flowId',
  'flushTime',
  'initialView',
  'isSampledUser',
  'lang',
  'marketing',
  'migration',
  'navigationTiming',
  'numStoredAccounts',
  'planId',
  'productId',
  'reason',
  'referrer',
  'screen',
  'service',
  'syncEngines',
  'startTime',
  'timers',
  'uid',
  'uniqueUserId',
  'userPreferences',
  'utm_campaign',
  'utm_content',
  'utm_medium',
  'utm_source',
  'utm_term',
];

var DEFAULT_INACTIVITY_TIMEOUT_MS = new Duration('2m').milliseconds();
var NOT_REPORTED_VALUE = 'none';
var UNKNOWN_CAMPAIGN_ID = 'unknown';

// convert a hash of metrics impressions into an array of objects.
function flattenHashIntoArrayOfObjects(hashTable) {
  return _.reduce(
    hashTable,
    function(memo, key) {
      return memo.concat(
        _.map(key, function(value) {
          return value;
        })
      );
    },
    []
  );
}

function marshallFlowEvent(eventName, viewName) {
  if (!viewName) {
    return `flow.${eventName}`;
  }

  // Strip out the `oauth.` prefix if present because
  // OAuthiness is already encoded in the service property.
  return `flow.${viewName.replace(/^oauth\./, '')}.${eventName}`;
}

function marshallProperty(property) {
  if (property && property !== NOT_REPORTED_VALUE) {
    return property;
  }
}

function marshallEmailDomain(email) {
  if (!email) {
    return;
  }

  const domain = email.split('@')[1];
  if (Constants.POPULAR_EMAIL_DOMAINS[domain]) {
    return domain;
  }

  return Constants.OTHER_EMAIL_DOMAIN;
}

function Metrics(options = {}) {
  this._speedTrap = new SpeedTrap();
  this._speedTrap.init();

  // `timers` and `events` are part of the public API
  this.timers = this._speedTrap.timers;
  this.events = this._speedTrap.events;

  this._window = options.window || window;

  this._activeExperiments = {};
  this._brokerType = options.brokerType || NOT_REPORTED_VALUE;
  this._clientHeight = options.clientHeight || NOT_REPORTED_VALUE;
  this._clientWidth = options.clientWidth || NOT_REPORTED_VALUE;
  // by default, send the metrics to the content server.
  this._collector = options.collector || '';
  this._context = options.context || Constants.CONTENT_SERVER_CONTEXT;
  this._devicePixelRatio = options.devicePixelRatio || NOT_REPORTED_VALUE;
  this._emailDomain = NOT_REPORTED_VALUE;
  this._entrypoint = options.entrypoint || NOT_REPORTED_VALUE;
  this._entrypointExperiment =
    options.entrypointExperiment || NOT_REPORTED_VALUE;
  this._entrypointVariation = options.entrypointVariation || NOT_REPORTED_VALUE;
  this._env = options.environment || new Environment(this._window);
  this._eventMemory = {};
  this._inactivityFlushMs =
    options.inactivityFlushMs || DEFAULT_INACTIVITY_TIMEOUT_MS;
  // All user metrics are sent to the backend. Data is only
  // reported to metrics if `isSampledUser===true`.
  this._isSampledUser = options.isSampledUser || false;
  this._lang = options.lang || 'unknown';
  this._marketingImpressions = {};
  this._migration = options.migration || NOT_REPORTED_VALUE;
  this._numStoredAccounts = options.numStoredAccounts || '';
  this._referrer = this._window.document.referrer || NOT_REPORTED_VALUE;
  this._screenHeight = options.screenHeight || NOT_REPORTED_VALUE;
  this._screenWidth = options.screenWidth || NOT_REPORTED_VALUE;
  this._sentryMetrics = options.sentryMetrics;
  this._service = options.service || NOT_REPORTED_VALUE;
  // if navigationTiming is supported, the baseTime will be from
  // navigationTiming.navigationStart, otherwise Date.now().
  this._startTime = options.startTime || this._speedTrap.baseTime;
  this._syncEngines = options.syncEngines || [];
  this._uid = options.uid || NOT_REPORTED_VALUE;
  this._uniqueUserId = options.uniqueUserId || NOT_REPORTED_VALUE;
  this._userPreferences = {};
  this._utmCampaign = options.utmCampaign || NOT_REPORTED_VALUE;
  this._utmContent = options.utmContent || NOT_REPORTED_VALUE;
  this._utmMedium = options.utmMedium || NOT_REPORTED_VALUE;
  this._utmSource = options.utmSource || NOT_REPORTED_VALUE;
  this._utmTerm = options.utmTerm || NOT_REPORTED_VALUE;
  this._xhr = options.xhr || xhr;

  this.initialize(options);
}

_.extend(Metrics.prototype, Backbone.Events, {
  ALLOWED_FIELDS: ALLOWED_FIELDS,

  initialize() {
    this._flush = _.bind(this.flush, this, true);
    $(this._window).on('unload', this._flush);
    // iOS will not send events once the window is in the background,
    // meaning the `unload` handler is ineffective. Send events on blur
    // instead, so events are not lost when a user goes to verify their
    // email.
    $(this._window).on('blur', this._flush);

    // Set the initial inactivity timeout to clear navigation timing data.
    this._resetInactivityFlushTimeout();

    this._initializeSubscriptionModel();
  },

  destroy() {
    $(this._window).off('unload', this._flush);
    $(this._window).off('blur', this._flush);
    this._clearInactivityFlushTimeout();
  },

  notifications: {
    /* eslint-disable sorting/sort-object-props */
    'flow.initialize': '_initializeFlowModel',
    'flow.event': '_logFlowEvent',
    'set-email-domain': '_setEmailDomain',
    'set-sync-engines': '_setSyncEngines',
    'set-uid': '_setUid',
    'subscription.initialize': '_initializeSubscriptionModel',
    'clear-uid': '_clearUid',
    'once!view-shown': '_setInitialView',
    /* eslint-enable sorting/sort-object-props */
  },

  /**
   * @private
   * Initialize the flow model. If it's already been initalized, do nothing.
   * Initialization may fail if the required flow properties can't be found,
   * either in the DOM or the resume token.
   */
  _initializeFlowModel() {
    if (this._flowModel) {
      return;
    }

    const flowModel = new FlowModel({
      metrics: this,
      sentryMetrics: this._sentryMetrics,
      window: this._window,
    });

    if (flowModel.has('flowId')) {
      this._flowModel = flowModel;
    }
  },

  /**
   * @private
   * Initialise the subscription model.
   *
   * @param {Object} [model] model to initialise with.
   *                       If unset, a fresh model is created.
   */
  _initializeSubscriptionModel(model) {
    if (model && model.has('productId')) {
      this._subscriptionModel = model;
    } else {
      this._subscriptionModel = new SubscriptionModel(
        {},
        {
          window: this._window,
        }
      );
    }
  },

  /**
   * @private
   * Log a flow event. If there is no flow model, do nothing.
   *
   * @param {Object} data
   *   @param {String} data.event The name of the event.
   *   @param {String} [data.viewName] The name of the view, to be
   *     interpolated in the event name. If unset, the event is
   *     logged without a view name.
   *   @param {Boolean} [data.once] If set, emit this event via
   *     the `logEventOnce` method. Defaults to `false`.
   */
  _logFlowEvent(data) {
    if (!this._flowModel) {
      // If there is no flow model, we're not in a recognised flow and
      // we should not emit the event. This would be the case if a user
      // lands on `/settings`, for instance. Only views that mixin the
      // `flow-events-mixin` will initialise the flow model.
      return;
    }

    const viewName = data.viewName && this.addViewNamePrefix(data.viewName);
    const eventName = marshallFlowEvent(data.event, viewName);

    if (data.once) {
      this.logEventOnce(eventName);
    } else {
      this.logEvent(eventName);
    }
  },

  /**
   * Set the initial view name and emit the loaded event.
   *
   * @param {View} view
   */
  _setInitialView(view) {
    this._initialViewName = view.viewName;
    this.logEventOnce('loaded');
  },

  /**
   * Send the collected data to the backend.
   *
   * @param {String} isPageUnloading
   * @returns {Promise}
   */
  flush(isPageUnloading) {
    // Inactivity timer is restarted when the next event/timer comes in.
    // This avoids sending empty result sets if the tab is
    // just sitting there open with no activity.
    this._clearInactivityFlushTimeout();

    var filteredData = this.getFilteredData();

    if (!this._isFlushRequired(filteredData, this._lastFlushedData)) {
      return Promise.resolve();
    }

    this._lastFlushedData = filteredData;

    this._speedTrap.events.clear();
    this._speedTrap.timers.clear();

    // numStoredAccounts should only be counted once by the backend
    // for this user. After a flush, unset the value so it is not
    // reported again.
    this._numStoredAccounts = '';

    const send = () => this._send(filteredData, isPageUnloading);
    return (
      send()
        // Retry once in case of failure, then give up
        .then(sent => sent || send())
    );
  },

  /**
   * Check if a flush is required for the given `data`. A flush is
   * required if any data has changed since the last flush.
   *
   * @param {Object} data - potential data to flush
   * @param {Object} lastFlushedData - last data that was flushed.
   * @returns {Boolean}
   * @private
   */
  _isFlushRequired(data, lastFlushedData) {
    if (!lastFlushedData) {
      return true;
    }
    // Only check fields that are in the new payload. `data` could be
    // a subset of `_lastFlushedData`, in which case no flush should occur.
    return _.any(data, (value, key) => {
      // these keys are distinct every flush attempt, ignore.
      if (key === 'duration' || key === 'flushTime') {
        return false;
        // events should only cause a flush if there are events to send.
      } else if (key === 'events' && !value.length) {
        return false;
        // timers should only cause a flush if there are timers to send.
      } else if (key === 'timers' && !value.length) {
        return false;
      }

      // _.isEqual does a deep comparision of objects and arrays.
      return !_.isEqual(lastFlushedData[key], value);
    });
  },

  _clearInactivityFlushTimeout() {
    clearTimeout(this._inactivityFlushTimeout);
  },

  _resetInactivityFlushTimeout() {
    this._clearInactivityFlushTimeout();

    this._inactivityFlushTimeout = setTimeout(() => {
      this.logEvent('inactivity.flush');
      this.flush();
    }, this._inactivityFlushMs);
  },

  /**
   * Get all the data, whether it's allowed to be sent or not.
   *
   * @returns {Object}
   */
  getAllData() {
    const loadData = this._speedTrap.getLoad();
    const unloadData = this._speedTrap.getUnload();
    const flowData = this.getFlowEventMetadata();

    const allData = _.extend({}, loadData, unloadData, {
      broker: this._brokerType,
      context: this._context,
      deviceId: flowData.deviceId || NOT_REPORTED_VALUE,
      emailDomain: this._emailDomain,
      entrypoint: this._entrypoint,
      entrypoint_experiment: this._entrypointExperiment, //eslint-disable-line camelcase
      entrypoint_variation: this._entrypointVariation, //eslint-disable-line camelcase
      experiments: flattenHashIntoArrayOfObjects(this._activeExperiments),
      flowBeginTime: flowData.flowBeginTime,
      flowId: flowData.flowId,
      flushTime: Date.now(),
      initialView: this._initialViewName,
      isSampledUser: this._isSampledUser,
      lang: this._lang,
      marketing: flattenHashIntoArrayOfObjects(this._marketingImpressions),
      migration: this._migration,
      numStoredAccounts: this._numStoredAccounts,
      // planId and productId are optional so we can physically remove
      // them from the payload instead of sending NOT_REPORTED_VALUE
      planId: this._subscriptionModel.get('planId') || undefined,
      productId: this._subscriptionModel.get('productId') || undefined,
      referrer: this._referrer,
      screen: {
        clientHeight: this._clientHeight,
        clientWidth: this._clientWidth,
        devicePixelRatio: this._devicePixelRatio,
        height: this._screenHeight,
        width: this._screenWidth,
      },
      service: this._service,
      startTime: this._startTime,
      syncEngines: this._syncEngines,
      uid: this._uid,
      uniqueUserId: this._uniqueUserId,
      userPreferences: this._userPreferences,
      utm_campaign: this._utmCampaign, //eslint-disable-line camelcase
      utm_content: this._utmContent, //eslint-disable-line camelcase
      utm_medium: this._utmMedium, //eslint-disable-line camelcase
      utm_source: this._utmSource, //eslint-disable-line camelcase
      utm_term: this._utmTerm, //eslint-disable-line camelcase
    });

    // Create a deep copy of the data so that any modifications to contained
    // objects or arrays do not affect the returned copy of the data.
    return JSON.parse(JSON.stringify(allData));
  },

  /**
   * Get the filtered data.
   * Filtered data is data that is allowed to be sent,
   * that is defined and not an empty string.
   *
   * @returns {Object}
   */
  getFilteredData() {
    var allowedData = _.pick(this.getAllData(), ALLOWED_FIELDS);

    return _.pick(allowedData, (value, key) => {
      // navigationTiming is sent in the first flush, no need to re-send it.
      if (this._lastFlushedData && key === 'navigationTiming') {
        return false;
      }
      return !_.isUndefined(value) && value !== '';
    });
  },

  _send(data, isPageUnloading) {
    var url = this._collector + '/metrics';
    var payload = JSON.stringify(data);

    if (this._env.hasSendBeacon()) {
      // Always use sendBeacon if it is available because:
      //   1. it works asynchronously, even on unload.
      //   2. user agents SHOULD make "multiple attempts to transmit the
      //      data in presence of transient network or server errors".
      return Promise.resolve().then(() => {
        return this._window.navigator.sendBeacon(url, payload);
      });
    }

    // XHR is a fallback option because synchronous XHR has been deprecated,
    // but we must call it synchronously in the unload case.
    return this._xhr
      .ajax({
        async: !isPageUnloading,
        contentType: 'application/json',
        data: payload,
        type: 'POST',
        url: url,
      })
      .then(
        function() {
          // Boolean return values imitate the behaviour of sendBeacon
          return true;
        },
        function() {
          return false;
        }
      );
  },

  /**
   * Log an event
   *
   * @param {String} eventName
   */
  logEvent(eventName) {
    this._resetInactivityFlushTimeout();
    this.events.capture(eventName);
  },

  /**
   * Log an event only if it never happened before during this page load.
   *
   * @param {String} eventName
   */
  logEventOnce(eventName) {
    if (!this._eventMemory[eventName]) {
      this.logEvent(eventName);
      this._eventMemory[eventName] = true;
    }
  },

  /**
   * Marks some event already logged in metrics memory.
   *
   * Used in conjunction with `logEventOnce` when we know that some event was already logged elsewhere.
   * Helps avoid event duplication.
   *
   * @param {String} eventName
   */
  markEventLogged: function(eventName) {
    this._eventMemory[eventName] = true;
  },

  /**
   * Start a timer
   *
   * @param {String} timerName
   */
  startTimer(timerName) {
    this._resetInactivityFlushTimeout();
    this.timers.start(timerName);
  },

  /**
   * Stop a timer
   *
   * @param {String} timerName
   */
  stopTimer(timerName) {
    this._resetInactivityFlushTimeout();
    this.timers.stop(timerName);
  },

  /**
   * Log an error.
   *
   * @param {Error} error
   */
  logError(error) {
    this.logEvent(this.errorToId(error));
  },

  /**
   * Convert an error to an identifier that can be used for logging.
   *
   * @param {Error} error
   * @returns {String}
   */
  errorToId(error) {
    // Prefer context to viewName for the context identifier.
    let context = error.context;
    if (!context) {
      if (error.viewName) {
        context = this.addViewNamePrefix(error.viewName);
      } else {
        context = 'unknown context';
      }
    }

    var id = Strings.interpolate('error.%s.%s.%s', [
      context,
      error.namespace || 'unknown namespace',
      error.errno || String(error),
    ]);
    return id;
  },

  /**
   * Set the view name prefix for metrics that contain a viewName.
   * This is used to differentiate between flows when the same
   * URL can appear in more than one place in the flow, e.g., the
   * /sms screen. The /sms screen can be displayed in either the
   * signup or verification tab, and we want to be able to
   * differentiate between the two.
   *
   * This prefix is prepended to the view name anywhere a view
   * name is used.
   *
   * @param {String} [viewNamePrefix='']
   */
  setViewNamePrefix(viewNamePrefix = '') {
    this._viewNamePrefix = viewNamePrefix;
  },

  /**
   * Add the view name prefix to `viewName`.
   *
   * @param {String} viewName
   * @returns {String}
   */
  addViewNamePrefix(viewName) {
    if (this._viewNamePrefix) {
      return `${this._viewNamePrefix}.${viewName}`;
    }
    return viewName;
  },

  /**
   * Log a view
   *
   * @param {String} viewName
   */
  logView(viewName) {
    // `screen.` is a legacy artifact from when each View was a screen.
    // The identifier is kept to avoid updating all metrics queries.
    this.logEvent(`screen.${this.addViewNamePrefix(viewName)}`);
  },

  /**
   * Log an event with the view name as a prefix
   *
   * @param {String} viewName
   * @param {String} eventName
   */
  logViewEvent(viewName, eventName) {
    this.logEvent(`${this.addViewNamePrefix(viewName)}.${eventName}`);
  },

  /**
   * Log when an experiment is shown to the user
   *
   * @param {String} choice - type of experiment
   * @param {String} group - the experiment group (treatment or control)
   */
  logExperiment(choice, group) {
    this._logFlowEvent({
      event: `experiment.${choice}.${group}`,
      once: true,
    });

    if (!choice || !group) {
      return;
    }

    var experiments = this._activeExperiments;

    if (!experiments[choice]) {
      experiments[choice] = {};
    }

    experiments[choice][group] = {
      choice: choice,
      group: group,
    };
  },

  /**
   * Log when a user preference is updated. Example, two step authentication,
   * adding recovery email or recovery key.
   *
   * @param {String} prefName - name of preference, typically view name
   * @param {Boolean} value - value of preference
   */
  logUserPreferences(prefName, value) {
    this._userPreferences[prefName] = !!value;
  },

  /**
   * Log when a marketing snippet is shown to the user
   *
   * @param {String} campaignId - marketing campaign id
   * @param {String} url - url of marketing link
   */
  logMarketingImpression(campaignId, url) {
    campaignId = campaignId || UNKNOWN_CAMPAIGN_ID;

    var impressions = this._marketingImpressions;
    if (!impressions[campaignId]) {
      impressions[campaignId] = {};
    }

    impressions[campaignId][url] = {
      campaignId: campaignId,
      clicked: false,
      url: url,
    };
  },

  /**
   * Log whether the user clicked on a marketing link
   *
   * @param {String} campaignId - marketing campaign id
   * @param {String} url - URL clicked.
   */
  logMarketingClick(campaignId, url) {
    campaignId = campaignId || UNKNOWN_CAMPAIGN_ID;

    var impression = this.getMarketingImpression(campaignId, url);

    if (impression) {
      impression.clicked = true;
    }
  },

  getMarketingImpression(campaignId, url) {
    var impressions = this._marketingImpressions;
    return impressions[campaignId] && impressions[campaignId][url];
  },

  setBrokerType(brokerType) {
    this._brokerType = brokerType;
  },

  isCollectionEnabled() {
    return this._isSampledUser;
  },

  getFlowEventMetadata() {
    const metadata = (this._flowModel && this._flowModel.attributes) || {};
    return {
      deviceId: metadata.deviceId,
      entrypoint: marshallProperty(this._entrypoint),
      entrypointExperiment: marshallProperty(this._entrypointExperiment),
      entrypointVariation: marshallProperty(this._entrypointVariation),
      flowBeginTime: metadata.flowBegin,
      flowId: metadata.flowId,
      utmCampaign: marshallProperty(this._utmCampaign),
      utmContent: marshallProperty(this._utmContent),
      utmMedium: marshallProperty(this._utmMedium),
      utmSource: marshallProperty(this._utmSource),
      utmTerm: marshallProperty(this._utmTerm),
    };
  },

  getFlowModel() {
    return this._flowModel;
  },

  getSubscriptionModel() {
    return this._subscriptionModel;
  },

  /**
   * Log the number of stored accounts
   *
   * @param {Number} numStoredAccounts
   */
  logNumStoredAccounts(numStoredAccounts) {
    this._numStoredAccounts = numStoredAccounts;
  },

  _setEmailDomain(email) {
    const domain = marshallEmailDomain(email);
    if (domain) {
      this._emailDomain = domain;
    }
  },

  _setSyncEngines(engines) {
    if (engines) {
      this._syncEngines = engines;
    }
  },

  _setUid(uid) {
    if (uid) {
      this._uid = uid;
    }
  },

  _setPlanProductId({ planId, productId }) {
    if (planId) {
      this._planId = planId;
    }
    if (productId) {
      this._productId = productId;
    }
  },

  _clearUid() {
    this._uid = NOT_REPORTED_VALUE;
  },
});

Cocktail.mixin(Metrics, NotifierMixin);

export default Metrics;
