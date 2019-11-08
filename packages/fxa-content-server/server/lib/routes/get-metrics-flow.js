/* eslint-disable camelcase */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const config = require('../configuration');
const amplitude = require('../amplitude');
const flowMetrics = require('../flow-metrics');
const logFlowEvent = require('../flow-event').logFlowEvent;
const logger = require('../logging/log')('server.get-metrics-flow');
const geodbConfig = config.get('geodb');
const geodb = require('../../../../fxa-geodb')(geodbConfig);
const remoteAddress = require('../../../../fxa-shared/express/remote-address')(
  config.get('clientAddressDepth')
);
const geolocate = require('../../../../fxa-shared/express/geo-locate')(geodb)(
  remoteAddress
)(logger);
const uuid = require('node-uuid');
const validation = require('../validation');

const {
  CONTEXT: CONTEXT_PATTERN,
  ENTRYPOINT: ENTRYPOINT_PATTERN,
  EVENT_TYPE: EVENT_TYPE_PATTERN,
  FORM_TYPE: FORM_TYPE_PATTERN,
  PRODUCT_ID: PRODUCT_ID_PATTERN,
  SERVICE: SERVICE_PATTERN,
  UNIQUE_USER_ID: UID_PATTERN,
} = validation.PATTERNS;

const {
  STRING: STRING_TYPE,
  UTM: UTM_TYPE,
  UTM_CAMPAIGN: UTM_CAMPAIGN_TYPE,
} = validation.TYPES;

module.exports = function(config) {
  const FLOW_ID_KEY = config.get('flow_id_key');
  const FLOW_EVENT_NAME = 'flow.begin';
  const SERVICES = config.get('oauth_client_id_map');
  const ALLOWED_CORS_ORIGINS = config.get('allowed_metrics_flow_cors_origins');
  const CORS_OPTIONS = {
    methods: 'GET',
    origin: function corsOrigin(origin, callback) {
      if (ALLOWED_CORS_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        logger.info('request.metrics-flow.bad-origin', origin);
        callback(new Error('CORS Error'));
      }
    },
    preflightContinue: false,
  };

  const QUERY_SCHEMA = {
    // Passed by about:newinstall unnecessarily, allow it.
    context: STRING_TYPE.regex(CONTEXT_PATTERN).optional(),
    // Not passed by the Firefox Concert Series.
    // See https://github.com/mozilla/bedrock/issues/6839
    entrypoint: STRING_TYPE.regex(ENTRYPOINT_PATTERN).optional(),
    entrypoint_experiment: STRING_TYPE.regex(ENTRYPOINT_PATTERN).optional(),
    entrypoint_variation: STRING_TYPE.regex(ENTRYPOINT_PATTERN).optional(),
    // Not passed by the Firefox Concert Series.
    // See https://github.com/mozilla/bedrock/issues/6839
    form_type: STRING_TYPE.regex(FORM_TYPE_PATTERN).optional(),
    product_id: STRING_TYPE.regex(PRODUCT_ID_PATTERN).optional(),
    service: STRING_TYPE.regex(SERVICE_PATTERN).optional(),
    utm_campaign: UTM_CAMPAIGN_TYPE.optional(),
    utm_content: UTM_TYPE.optional(),
    utm_medium: UTM_TYPE.optional(),
    utm_source: UTM_TYPE.optional(),
    utm_term: UTM_TYPE.optional(),
    // event_type and uid are only passed by the RP engagement ping (#2743).
    event_type: STRING_TYPE.regex(EVENT_TYPE_PATTERN).optional(),
    uid: STRING_TYPE.regex(UID_PATTERN).optional(),
  };

  const FORM_TYPES = {
    email: {
      amplitude: 'screen.enter-email',
      logFlow: 'flow.enter-email.view',
    },
    button: {
      amplitude: 'screen.rp-button',
      logFlow: 'flow.rp-button.view',
    },
    subscribe: {
      amplitude: 'screen.subscribe',
      logFlow: 'flow.subscribe.view',
    },
  };

  const route = {};
  route.method = 'get';
  route.path = '/metrics-flow';
  route.cors = CORS_OPTIONS;
  route.validate = {
    query: QUERY_SCHEMA,
  };

  route.process = function(req, res) {
    const flowEventData = flowMetrics.create(
      FLOW_ID_KEY,
      req.headers['user-agent']
    );
    const { flowBeginTime, flowId } = flowEventData;
    const metricsData = req.query || {};
    const beginEvent = {
      flowTime: flowBeginTime,
      time: flowBeginTime,
      type: FLOW_EVENT_NAME,
    };

    metricsData.flowId = flowId;
    metricsData.location = geodbConfig.enabled ? geolocate(req) : {};
    // Amplitude-specific device id, like the client-side equivalent
    // created in app/scripts/lib/app-start.js. Transient for now,
    // but will become persistent in due course.
    const deviceId = (metricsData.deviceId = uuid.v4().replace(/-/g, ''));

    if (metricsData.event_type === 'engage') {
      if (metricsData.service in SERVICES) {
        amplitude(
          {
            flowTime: flowBeginTime,
            time: flowBeginTime,
            type: 'flow.rp.engage',
          },
          req,
          metricsData
        );
      }
    } else {
      amplitude(beginEvent, req, metricsData);
      logFlowEvent(beginEvent, metricsData, req);

      const metricTypes = FORM_TYPES[metricsData.form_type];
      if (metricTypes) {
        amplitude(
          {
            flowTime: flowBeginTime,
            time: flowBeginTime,
            type: metricTypes.amplitude,
          },
          req,
          metricsData
        );
        logFlowEvent(
          {
            flowTime: flowBeginTime,
            time: flowBeginTime,
            type: metricTypes.logFlow,
          },
          metricsData,
          req
        );
      }
    }

    // charset must be set on json responses.
    res.charset = 'utf-8';
    res.json({
      deviceId,
      flowBeginTime,
      flowId,
    });
  };

  return route;
};
