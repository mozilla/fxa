/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const flowMetrics = require('../flow-metrics');
const logFlowEvent = require('../flow-event').logFlowEvent;
const logger = require('../logging/log')('server.get-metrics-flow');

module.exports = function (config) {
  const FLOW_ID_KEY = config.get('flow_id_key');
  const FLOW_EVENT_NAME = 'flow.begin';
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
    preflightContinue: false
  };

  const route = {};
  route.method = 'get';
  route.path = '/metrics-flow';
  route.cors = CORS_OPTIONS;

  route.process = function (req, res) {
    const flowEventData = flowMetrics.create(FLOW_ID_KEY, req.headers['user-agent']);
    const flowBeingTime = flowEventData.flowBeginTime;
    const flowId = flowEventData.flowId;
    const metricsData = req.query || {};

    metricsData.flowId = flowId;

    logFlowEvent({
      flowTime: flowBeingTime,
      time: flowBeingTime,
      type: FLOW_EVENT_NAME
    }, metricsData, req);

    // charset must be set on json responses.
    res.charset = 'utf-8';
    res.json({
      flowBeginTime: flowEventData.flowBeginTime,
      flowId: flowId
    });
  };

  return route;
};
