/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const joi = require('joi');
const amplitude = require('../amplitude');
const logPerformanceEvent = require('../flow-performance');
const logger = require('../logging/log')('server.post-metrics');

const config = require('../../config');
const clientMetricsConfig = config.get('clientMetrics');
const MAX_EVENT_OFFSET = clientMetricsConfig.maxEventOffset;
const EVENT_TYPE_PATTERN = /^[\w\s.:-]+$/; // the space is to allow for error contexts that contain spaces, e.g., `error.unknown context.auth.108`
const OFFSET_TYPE = joi
  .number()
  .integer()
  .min(0);
const STRING_TYPE = joi.string().max(1024);
const BODY_SCHEMA = {
  data: joi.object().required(),
  events: joi
    .array()
    .items(
      joi.object().keys({
        offset: OFFSET_TYPE.max(MAX_EVENT_OFFSET).required(),
        type: STRING_TYPE.regex(EVENT_TYPE_PATTERN).required(),
      })
    )
    .required(),
  flowBeginTime: OFFSET_TYPE.optional(),
  flowId: STRING_TYPE.hex()
    .length(64)
    .optional(),
};

module.exports = {
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
  process(request, response) {
    const requestReceivedTime = Date.now();
    const { data, events } = request.body;
    events.forEach(event => {
      if (event.type === 'loaded') {
        // This is identical to content-server, where a 'loaded' event type is a
        // performance event.
        logPerformanceEvent(event, request, { ...data, requestReceivedTime });
      } else {
        event.time =
          data.perfStartTime +
          event.offset +
          requestReceivedTime -
          data.flushTime;
        amplitude(event, request, data, requestReceivedTime);
      }
    });
    response.status(200).end();
  },
};
