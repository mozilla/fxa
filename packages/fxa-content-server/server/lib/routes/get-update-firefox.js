/* eslint-disable camelcase */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const amplitude = require('../amplitude');
const flowMetrics = require('../flow-metrics');
const { logFlowEvent } = require('../flow-event');
const Url = require('url');
const uuid = require('node-uuid');
const validation = require('../validation');

const {
  ACTION: ACTION_TYPE,
  STRING: STRING_TYPE,
  UTM: UTM_TYPE,
  UTM_CAMPAIGN: UTM_CAMPAIGN_TYPE,
} = validation.TYPES;

const {
  CONTEXT: CONTEXT_PATTERN,
  ENTRYPOINT: ENTRYPOINT_PATTERN,
  SERVICE: SERVICE_PATTERN,
} = validation.PATTERNS;

const QUERY_PARAM_SCHEMA = {
  action: ACTION_TYPE.optional(),
  context: STRING_TYPE.regex(CONTEXT_PATTERN).required(),
  entrypoint: STRING_TYPE.regex(ENTRYPOINT_PATTERN).optional(),
  entrypoint_experiment: STRING_TYPE.regex(ENTRYPOINT_PATTERN).optional(),
  entrypoint_variation: STRING_TYPE.regex(ENTRYPOINT_PATTERN).optional(),
  service: STRING_TYPE.regex(SERVICE_PATTERN).optional(),
  utm_campaign: UTM_CAMPAIGN_TYPE.optional(),
  utm_content: UTM_TYPE.optional(),
  utm_medium: UTM_TYPE.optional(),
  utm_source: UTM_TYPE.optional(),
  utm_term: UTM_TYPE.optional(),
};

module.exports = function(config) {
  const FLOW_ID_KEY = config.get('flow_id_key');
  const FLOW_EVENT_NAME = 'flow.begin';
  const UPDATE_FIREFOX_FLOW_EVENT_NAME = 'flow.update-firefox.view';

  return {
    method: 'get',
    path: '/update_firefox',
    validate: {
      // because this endpoint logs data from the query params,
      // ensure the query params are all well formed
      query: QUERY_PARAM_SCHEMA,
    },
    process: function(req, res) {
      const flowEventData = flowMetrics.create(
        FLOW_ID_KEY,
        req.headers['user-agent']
      );
      const flowBeginTime = flowEventData.flowBeginTime;
      const flowId = flowEventData.flowId;
      const metricsData = req.query || {};
      const beginEvent = {
        flowTime: flowBeginTime,
        time: flowBeginTime,
        type: FLOW_EVENT_NAME,
      };

      metricsData.flowId = flowId;
      // Amplitude-specific device id, like the client-side equivalent
      // created in app/scripts/lib/app-start.js. Transient for now,
      // but will become persistent in due course.
      metricsData.deviceId = uuid.v4().replace(/-/g, '');

      amplitude(beginEvent, req, metricsData);
      logFlowEvent(beginEvent, metricsData, req);

      amplitude(
        {
          flowTime: flowBeginTime,
          time: flowBeginTime,
          type: UPDATE_FIREFOX_FLOW_EVENT_NAME,
        },
        req,
        metricsData
      );

      logFlowEvent(
        {
          flowTime: 0,
          time: flowBeginTime,
          type: UPDATE_FIREFOX_FLOW_EVENT_NAME,
        },
        metricsData,
        req
      );

      // The download firefox URL is an FxA URL that
      // logs the click and then redirects to the
      // download link.
      const downloadFirefoxUrl = createDownloadFirefoxUrl(
        req.query,
        flowBeginTime,
        flowId,
        metricsData.deviceId
      );

      res.render('update_firefox', {
        downloadFirefoxUrl,
      });
    },
  };
};

function createDownloadFirefoxUrl(query, flowBeginTime, flowId, deviceId) {
  const downloadFirefoxUrl = {
    pathname: '/download_firefox',
    // propagate all the validated query params,
    // adding params necessary to log click events
    // on the download firefox button.
    query: Object.assign({}, query, {
      deviceId: deviceId,
      flowBeginTime: flowBeginTime,
      flowId: flowId,
    }),
  };

  return Url.format(downloadFirefoxUrl);
}
