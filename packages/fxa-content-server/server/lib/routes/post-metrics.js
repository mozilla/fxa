/* eslint-disable camelcase */
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
const {
  overrideJoiMessages,
} = require('fxa-shared/sentry/joi-message-overrides');

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
  SERVICE: SERVICE_PATTERN,
  UNIQUE_USER_ID: UNIQUE_USER_ID_PATTERN,
} = validation.PATTERNS;

const {
  BOOLEAN: BOOLEAN_TYPE,
  DIMENSION: DIMENSION_TYPE,
  DOMAIN: DOMAIN_TYPE,
  EXPERIMENT: EXPERIMENT_TYPE,
  HEX32: HEX32_TYPE,
  NEWSLETTERS: NEWSLETTERS,
  OFFSET: OFFSET_TYPE,
  REFERRER: REFERRER_TYPE,
  STRING: STRING_TYPE,
  SYNC_ENGINES: SYNC_ENGINES_TYPE,
  TIME: TIME_TYPE,
  URL: URL_TYPE,
  USER_PREFERENCES: USER_PREFERENCES,
  UTM: UTM_TYPE,
  UTM_CAMPAIGN: UTM_CAMPAIGN_TYPE,
} = validation.TYPES;

const BODY_SCHEMA = {
  broker: STRING_TYPE.regex(BROKER_PATTERN).required(),
  context: STRING_TYPE.regex(CONTEXT_PATTERN).required(),
  deviceId: HEX32_TYPE.allow('none').optional(),
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
        offset: OFFSET_TYPE.required(),
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
  flowId: STRING_TYPE.hex().length(64).optional(),
  flushTime: TIME_TYPE.required(),
  initialView: STRING_TYPE.regex(/^[0-9a-z._-]+$/).optional(),
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
  navigationTiming: joi.object().optional(),
  newsletters: NEWSLETTERS.optional(),
  numStoredAccounts: OFFSET_TYPE.min(0).optional(),
  // TODO: Delete plan_id and product_id after the camel-cased equivalents
  //       have been in place for at least one train.
  plan_id: STRING_TYPE.optional(),
  planId: STRING_TYPE.optional(),
  product_id: STRING_TYPE.optional(),
  productId: STRING_TYPE.optional(),
  referrer: REFERRER_TYPE.allow('none').required(),
  screen: joi
    .object()
    .keys({
      clientHeight: DIMENSION_TYPE.allow('none').required(),
      clientWidth: DIMENSION_TYPE.allow('none').required(),
      devicePixelRatio: joi.number().min(0).allow('none').required(),
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
  userPreferences: USER_PREFERENCES.optional(),
  utm_campaign: UTM_CAMPAIGN_TYPE.required(),
  utm_content: UTM_TYPE.required(),
  utm_medium: UTM_TYPE.required(),
  utm_source: UTM_TYPE.required(),
  utm_term: UTM_TYPE.required(),
};

module.exports = function (statsd) {
  const metricsCollector = new MetricsCollector();

  return {
    method: 'post',
    path: '/metrics',
    validate: {
      body: overrideJoiMessages(BODY_SCHEMA),
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
      const metrics = req.body || {};

      // We don't want to use validation rules for the following cases. They
      // can occur if a page is loaded, and then submitted at a much later point
      // in time. Perhaps the users device is hibernated or a mobile browser
      // is put into a background/suspend state. Either way, large durations
      // or event offsets are bogus, and can be thrown out.

      // Check that duration is sane
      if (metrics.duration < 0 || metrics.duration > MAX_EVENT_OFFSET) {
        if (statsd) {
          statsd.increment('post_metrics.bad_duration');
        }
        return res.status(400).json({
          error: 'Bad Request',
          message: `invalid duration`,
          statusCode: 400,
          validation: {
            keys: ['offset'],
          },
        });
      }

      // Check that the delta between the start and flush time is sane
      const maxOffset = metrics.flushTime - metrics.startTime;
      if (maxOffset < 0 || maxOffset > MAX_EVENT_OFFSET) {
        if (statsd) {
          statsd.increment('post_metrics.bad_flush_time');
        }
        return res.status(400).json({
          error: 'Bad Request',
          message: `max offset exceeds maximum of ${MAX_EVENT_OFFSET}`,
          statusCode: 400,
          validation: {
            keys: ['offset'],
          },
        });
      }

      // Check that even offsets are sane
      const invalidEvent = findInvalidEventOffsets(metrics.events, maxOffset);
      if (invalidEvent) {
        if (statsd) {
          statsd.increment('post_metrics.bad_event_offset');
        }
        return res.status(400).json({
          error: 'Bad Request',
          message: `offset exceeds maximum of ${maxOffset}`,
          statusCode: 400,
          validation: {
            keys: ['offset'],
          },
        });
      }

      // don't wait around to send a response.
      res.json({ success: true });

      // We no longer report timing data from metrics. Ignore posted values.
      if (metrics.navigationTiming) {
        metrics.navigationTiming = undefined;
      }

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
  return _.find(
    events,
    (event) => event.offset > maxOffset || event.offset < 0
  );
}
