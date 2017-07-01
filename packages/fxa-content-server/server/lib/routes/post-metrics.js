/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';
const config = require('../configuration');
const flowEvent = require('../flow-event');
const GACollector = require('../ga-collector');
const joi = require('joi');
const logger = require('mozlog')('server.post-metrics');
const MetricsCollector = require('../metrics-collector-stderr');
const StatsDCollector = require('../statsd-collector');
const validation = require('../validation');

const DISABLE_CLIENT_METRICS_STDERR = config.get('client_metrics').stderr_collector_disabled;

const BROKER_PATTERN = validation.PATTERNS.BROKER;
const CONTEXT_PATTERN = validation.PATTERNS.CONTEXT;
const ENTRYPOINT_PATTERN = validation.PATTERNS.ENTRYPOINT;
const EVENT_TYPE_PATTERN = validation.PATTERNS.EVENT_TYPE;
const EXPERIMENT_PATTERN = validation.PATTERNS.EXPERIMENT;
const MIGRATION_PATTERN = validation.PATTERNS.MIGRATION;
const SERVICE_PATTERN = validation.PATTERNS.SERVICE;
const UNIQUE_USER_ID_PATTERN = validation.PATTERNS.UNIQUE_USER_ID;

const BOOLEAN_TYPE = validation.TYPES.BOOLEAN;
const DIMENSION_TYPE = validation.TYPES.DIMENSION;
const INTEGER_TYPE = validation.TYPES.INTEGER;
const OFFSET_TYPE = validation.TYPES.OFFSET;
const REFERRER_TYPE = validation.TYPES.REFERRER;
const STRING_TYPE = validation.TYPES.STRING;
const TIME_TYPE = validation.TYPES.TIME;
const URL_TYPE = validation.TYPES.URL;
const UTM_TYPE = validation.TYPES.UTM;

// a user can disable navigationTiming, in which case all values are `null`
// negative values are allowed until we figure out the cause of #4722
const NAVIGATION_TIMING_TYPE = INTEGER_TYPE.allow(null).required();

const BODY_SCHEMA = {
  broker: STRING_TYPE.regex(BROKER_PATTERN).required(),
  context: STRING_TYPE.regex(CONTEXT_PATTERN).required(),
  duration: OFFSET_TYPE.required(),
  entryPoint: STRING_TYPE.regex(ENTRYPOINT_PATTERN).optional(),
  entrypoint: STRING_TYPE.regex(ENTRYPOINT_PATTERN).optional(),
  events: joi.array().items(joi.object().keys({
    offset: OFFSET_TYPE.required(),
    type: STRING_TYPE.regex(EVENT_TYPE_PATTERN).required()
  })).required(),
  experiments: joi.array().items(joi.object().keys({
    choice: STRING_TYPE.regex(EXPERIMENT_PATTERN).required(),
    group: STRING_TYPE.regex(EXPERIMENT_PATTERN).required()
  })).required(),
  flowBeginTime: OFFSET_TYPE.optional(),
  flowId: STRING_TYPE.hex().length(64).optional(),
  flushTime: TIME_TYPE.required(),
  initialView: STRING_TYPE.regex(/^[a-z._-]+$/).optional(),
  isSampledUser: BOOLEAN_TYPE.required(),
  lang: STRING_TYPE.regex(/^[a-z]+(?:-[A-Za-z]+)?$/).required(),
  marketing: joi.array().items(joi.object().keys({
    campaignId: STRING_TYPE.regex(/^[0-9a-z_-]+$/).required(),
    clicked: BOOLEAN_TYPE.required(),
    url: URL_TYPE.required()
  })).required(),
  migration: STRING_TYPE.regex(MIGRATION_PATTERN).required(),
  navigationTiming: joi.object().keys({
    connectEnd: NAVIGATION_TIMING_TYPE.required(),
    connectStart: NAVIGATION_TIMING_TYPE.required(),
    domComplete: NAVIGATION_TIMING_TYPE.required(),
    domContentLoadedEventEnd: NAVIGATION_TIMING_TYPE.required(),
    domContentLoadedEventStart: NAVIGATION_TIMING_TYPE.required(),
    domInteractive: NAVIGATION_TIMING_TYPE.required(),
    domLoading: NAVIGATION_TIMING_TYPE.required(),
    domainLookupEnd: NAVIGATION_TIMING_TYPE.required(),
    domainLookupStart: NAVIGATION_TIMING_TYPE.required(),
    fetchStart: NAVIGATION_TIMING_TYPE.required(),
    loadEventEnd: NAVIGATION_TIMING_TYPE.required(),
    loadEventStart: NAVIGATION_TIMING_TYPE.required(),
    navigationStart: NAVIGATION_TIMING_TYPE.required(),
    redirectEnd: NAVIGATION_TIMING_TYPE.required(),
    redirectStart: NAVIGATION_TIMING_TYPE.required(),
    requestStart: NAVIGATION_TIMING_TYPE.required(),
    responseEnd: NAVIGATION_TIMING_TYPE.required(),
    responseStart: NAVIGATION_TIMING_TYPE.required(),
    secureConnectionStart: NAVIGATION_TIMING_TYPE.required(),
    unloadEventEnd: NAVIGATION_TIMING_TYPE.required(),
    unloadEventStart: NAVIGATION_TIMING_TYPE.required()
  }).optional(),
  numStoredAccounts: OFFSET_TYPE.min(0).optional(),
  referrer: REFERRER_TYPE.allow('none').required(),
  screen: joi.object().keys({
    clientHeight: DIMENSION_TYPE.allow('none').required(),
    clientWidth: DIMENSION_TYPE.allow('none').required(),
    devicePixelRatio: joi.number().min(0).allow('none').required(),
    height: DIMENSION_TYPE.allow('none').required(),
    width: DIMENSION_TYPE.allow('none').required()
  }).required(),
  service: STRING_TYPE.regex(SERVICE_PATTERN).required(),
  startTime: TIME_TYPE.required(),
  timers: joi.object().optional(), // this is never consumed.
  uniqueUserId: STRING_TYPE.regex(UNIQUE_USER_ID_PATTERN).allow('none').required(),
  // the crazy long allow comes from the firstrun page.
  'utm_campaign': UTM_TYPE.allow('page+referral+-+not+part+of+a+campaign').required(),
  'utm_content': UTM_TYPE.required(),
  'utm_medium': UTM_TYPE.required(),
  'utm_source': UTM_TYPE.required(),
  'utm_term': UTM_TYPE.required()
};

module.exports = function () {
  const metricsCollector = new MetricsCollector();
  const statsd = new StatsDCollector();
  const ga = new GACollector();
  statsd.init();

  return {
    method: 'post',
    path: '/metrics',
    validate: {
      body: BODY_SCHEMA
    },
    preProcess: function (req, res, next) {
      // convert text/plain types to JSON for validation.
      if (/^text\/plain/.test(req.get('content-type'))) {
        try {
          req.body = JSON.parse(req.body);
        } catch (error) {
          logger.error(error);
          // uh oh, invalid JSON. Validation will return a 400.
          req.body = {};
        }
      }

      next();
    },
    process: function (req, res) {
      const requestReceivedTime = Date.now();

      // don't wait around to send a response.
      res.json({ success: true });

      process.nextTick(() => {
        const metrics = req.body || {};

        metrics.agent = req.get('user-agent');

        if (metrics.isSampledUser) {
          if (! DISABLE_CLIENT_METRICS_STDERR) {
            metricsCollector.write(metrics);
          }
          // send the metrics body to the StatsD collector for processing
          statsd.write(metrics);
        }
        ga.write(metrics);

        flowEvent(req, metrics, requestReceivedTime);
      });
    }
  };
};
