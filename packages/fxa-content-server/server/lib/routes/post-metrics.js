/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const _ = require('lodash');
const config = require('../configuration');
const flowMetricsRequest = require('../flow-event').metricsRequest;
const joi = require('joi');
const logger = require('../logging/log')('server.post-metrics');
const MetricsCollector = require('../metrics-collector-stderr');
const validation = require('../validation');

const clientMetricsConfig = config.get('client_metrics');
const DISABLE_CLIENT_METRICS_STDERR =
  clientMetricsConfig.stderr_collector_disabled;
const MAX_EVENT_OFFSET = clientMetricsConfig.max_event_offset;

const {
  BROKER: BROKER_PATTERN,
  CONTEXT: CONTEXT_PATTERN,
  ENTRYPOINT: ENTRYPOINT_PATTERN,
  EVENT_TYPE: EVENT_TYPE_PATTERN,
  EXPERIMENT: EXPERIMENT_PATTERN,
  MIGRATION: MIGRATION_PATTERN,
  SERVICE: SERVICE_PATTERN,
  UNIQUE_USER_ID: UNIQUE_USER_ID_PATTERN,
} = validation.PATTERNS;

const {
  BOOLEAN: BOOLEAN_TYPE,
  DIMENSION: DIMENSION_TYPE,
  DOMAIN: DOMAIN_TYPE,
  EXPERIMENT: EXPERIMENT_TYPE,
  HEX32: HEX32_TYPE,
  INTEGER: INTEGER_TYPE,
  OFFSET: OFFSET_TYPE,
  REFERRER: REFERRER_TYPE,
  STRING: STRING_TYPE,
  SYNC_ENGINES: SYNC_ENGINES_TYPE,
  TIME: TIME_TYPE,
  URL: URL_TYPE,
  UTM: UTM_TYPE,
  UTM_CAMPAIGN: UTM_CAMPAIGN_TYPE,
} = validation.TYPES;

// a user can disable navigationTiming, in which case all values are `null`
// negative values are allowed until we figure out the cause of #4722
const NAVIGATION_TIMING_TYPE = INTEGER_TYPE.allow(null).required();

const BODY_SCHEMA = {
  broker: STRING_TYPE.regex(BROKER_PATTERN).required(),
  context: STRING_TYPE.regex(CONTEXT_PATTERN).required(),
  deviceId: HEX32_TYPE.allow('none').required(),
  duration: OFFSET_TYPE.required(),
  emailDomain: DOMAIN_TYPE.optional(),
  entryPoint: STRING_TYPE.regex(ENTRYPOINT_PATTERN).optional(),
  entrypoint: STRING_TYPE.regex(ENTRYPOINT_PATTERN).optional(),
  entrypoint_experiment: STRING_TYPE.regex(ENTRYPOINT_PATTERN).optional(),
  entrypoint_variation: STRING_TYPE.regex(ENTRYPOINT_PATTERN).optional(),
  events: joi
    .array()
    .items(
      joi.object().keys({
        offset: OFFSET_TYPE.max(MAX_EVENT_OFFSET).required(),
        type: STRING_TYPE.regex(EVENT_TYPE_PATTERN).required(),
      })
    )
    .required(),
  experiments: joi
    .array()
    .items(
      joi.object().keys({
        choice: EXPERIMENT_TYPE.required(),
        group: STRING_TYPE.regex(EXPERIMENT_PATTERN).required(),
      })
    )
    .required(),
  flowBeginTime: OFFSET_TYPE.optional(),
  flowId: STRING_TYPE.hex()
    .length(64)
    .optional(),
  flushTime: TIME_TYPE.required(),
  initialView: STRING_TYPE.regex(/^[a-z._-]+$/).optional(),
  isSampledUser: BOOLEAN_TYPE.required(),
  lang: STRING_TYPE.regex(/^[a-z]+(?:-[A-Za-z]+)?$/).required(),
  marketing: joi
    .array()
    .items(
      joi.object().keys({
        campaignId: STRING_TYPE.regex(/^[0-9a-z_-]+$/).required(),
        clicked: BOOLEAN_TYPE.required(),
        url: URL_TYPE.required(),
      })
    )
    .required(),
  migration: STRING_TYPE.regex(MIGRATION_PATTERN).required(),
  navigationTiming: joi
    .object()
    .keys({
      connectEnd: NAVIGATION_TIMING_TYPE.required(),
      connectStart: NAVIGATION_TIMING_TYPE.required(),
      domainLookupEnd: NAVIGATION_TIMING_TYPE.required(),
      domainLookupStart: NAVIGATION_TIMING_TYPE.required(),
      domComplete: NAVIGATION_TIMING_TYPE.required(),
      domContentLoadedEventEnd: NAVIGATION_TIMING_TYPE.required(),
      domContentLoadedEventStart: NAVIGATION_TIMING_TYPE.required(),
      domInteractive: NAVIGATION_TIMING_TYPE.required(),
      domLoading: NAVIGATION_TIMING_TYPE.required(),
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
      unloadEventStart: NAVIGATION_TIMING_TYPE.required(),
    })
    .optional(),
  numStoredAccounts: OFFSET_TYPE.min(0).optional(),
  referrer: REFERRER_TYPE.allow('none').required(),
  screen: joi
    .object()
    .keys({
      clientHeight: DIMENSION_TYPE.allow('none').required(),
      clientWidth: DIMENSION_TYPE.allow('none').required(),
      devicePixelRatio: joi
        .number()
        .min(0)
        .allow('none')
        .required(),
      height: DIMENSION_TYPE.allow('none').required(),
      width: DIMENSION_TYPE.allow('none').required(),
    })
    .required(),
  service: STRING_TYPE.regex(SERVICE_PATTERN).required(),
  startTime: TIME_TYPE.required(),
  syncEngines: SYNC_ENGINES_TYPE.optional(),
  timers: joi.object().optional(), // this is never consumed.
  uid: HEX32_TYPE.allow('none').required(),
  uniqueUserId: STRING_TYPE.regex(UNIQUE_USER_ID_PATTERN)
    .allow('none')
    .required(),
  utm_campaign: UTM_CAMPAIGN_TYPE.required(),
  utm_content: UTM_TYPE.required(),
  utm_medium: UTM_TYPE.required(),
  utm_source: UTM_TYPE.required(),
  utm_term: UTM_TYPE.required(),
};

module.exports = function() {
  const metricsCollector = new MetricsCollector();

  return {
    method: 'post',
    path: '/metrics',
    validate: {
      body: BODY_SCHEMA,
    },
    preProcess: function(req, res, next) {
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
    process: function(req, res) {
      const requestReceivedTime = Date.now();
      const metrics = req.body || {};

      const maxOffset = metrics.flushTime - metrics.startTime;
      const invalidEvent = findInvalidEventOffsets(metrics.events, maxOffset);
      if (invalidEvent) {
        const error = new MaxOffsetError(invalidEvent.offset, maxOffset);
        return res.status(400).json(error);
      }

      // don't wait around to send a response.
      res.json({ success: true });

      process.nextTick(() => {
        metrics.agent = req.get('user-agent');

        if (metrics.isSampledUser) {
          if (!DISABLE_CLIENT_METRICS_STDERR) {
            metricsCollector.write(metrics);
          }
        }

        flowMetricsRequest(req, metrics, requestReceivedTime);
      });
    },
  };
};

function findInvalidEventOffsets(events, maxOffset) {
  return _.find(events, event => event.offset > maxOffset);
}

function MaxOffsetError(offset, maxOffset) {
  return {
    error: 'Bad Request',
    message: `offset ${offset} > maxiumum possible of ${maxOffset}`,
    statusCode: 400,
    validation: {
      keys: ['offset'],
    },
  };
}
