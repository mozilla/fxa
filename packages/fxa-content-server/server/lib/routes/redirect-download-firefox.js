/* eslint-disable camelcase */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

/**
 * The sole purpose of this route is to log clicks on the
 * "Download latest Firefox" button on the /update_firefox page,
 * allowing that page to use no JS.
 */

const amplitude = require('../amplitude');
const { logFlowEvent } = require('../flow-event');
const validation = require('../validation');

const {
  ACTION: ACTION_TYPE,
  FLOW_ID: FLOW_ID_TYPE,
  HEX32: HEX32_TYPE,
  OFFSET: OFFSET_TYPE,
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
  deviceId: HEX32_TYPE.required(),
  entrypoint: STRING_TYPE.regex(ENTRYPOINT_PATTERN).optional(),
  entrypoint_experiment: STRING_TYPE.regex(ENTRYPOINT_PATTERN).optional(),
  entrypoint_variation: STRING_TYPE.regex(ENTRYPOINT_PATTERN).optional(),
  flowBeginTime: OFFSET_TYPE.required(),
  flowId: FLOW_ID_TYPE.required(),
  service: STRING_TYPE.regex(SERVICE_PATTERN).optional(),
  utm_campaign: UTM_CAMPAIGN_TYPE.optional(),
  utm_content: UTM_TYPE.optional(),
  utm_medium: UTM_TYPE.optional(),
  utm_source: UTM_TYPE.optional(),
  utm_term: UTM_TYPE.optional(),
};

module.exports = function (config) {
  const DOWNLOAD_FIREFOX_FLOW_EVENT_NAME = 'flow.update-firefox.engage';

  return {
    method: 'get',
    path: '/download_firefox',
    validate: {
      // because this endpoint logs data from the query params,
      // ensure the query params are all well formed
      query: QUERY_PARAM_SCHEMA,
    },
    process: function (req, res) {
      const metricsData = req.query;

      const flowBeginTime = parseInt(metricsData.flowBeginTime);
      metricsData.flowBeginTime = flowBeginTime;

      const time = Date.now();

      amplitude(
        {
          flowTime: flowBeginTime,
          time,
          type: DOWNLOAD_FIREFOX_FLOW_EVENT_NAME,
        },
        req,
        metricsData
      );

      logFlowEvent(
        {
          flowTime: time - flowBeginTime,
          time,
          type: DOWNLOAD_FIREFOX_FLOW_EVENT_NAME,
        },
        metricsData,
        req
      );

      res.redirect('https://www.mozilla.org/firefox/download/thanks/');
    },
  };
};
