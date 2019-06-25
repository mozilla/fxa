/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';
const _ = require('lodash');
const logger = require('../logging/log')('server.metrics-errors');
const got = require('got');
const joi = require('joi');
const querystring = require('querystring');
const validation = require('../validation');

const config = require('../configuration');
const sentryConfig = config.get('sentry');

const API_KEY = sentryConfig.api_key;
const API_SECRET = sentryConfig.api_secret;
const STACK_TRACE_LENGTH = 20;

const CLIENT_ID_PATTERN = validation.PATTERNS.CLIENT_ID;
const CONTEXT_PATTERN = validation.PATTERNS.CONTEXT;
const ENTRYPOINT_PATTERN = validation.PATTERNS.ENTRYPOINT;
const ERROR_CONTEXT_PATTERN = validation.PATTERNS.EVENT_TYPE;
const MIGRATION_PATTERN = validation.PATTERNS.MIGRATION;
const SERVICE_PATTERN = validation.PATTERNS.SERVICE;

const BOOLEAN_TYPE = validation.TYPES.BOOLEAN;
const INTEGER_TYPE = validation.TYPES.INTEGER;
const STRING_TYPE = validation.TYPES.STRING;
const URL_TYPE = validation.TYPES.URL;

const BODY_SCHEMA = {
  culprit: STRING_TYPE.optional(),
  event_id: STRING_TYPE.optional(),
  exception: joi
    .object()
    .keys({
      values: joi.array().items(
        joi.object().keys({
          stacktrace: joi
            .object()
            .keys({
              frames: joi.array().items(
                joi.object().keys({
                  abs_path: STRING_TYPE.optional(),
                  colno: INTEGER_TYPE.allow(null).optional(),
                  filename: STRING_TYPE.required(),
                  function: STRING_TYPE.optional(),
                  in_app: BOOLEAN_TYPE.required(),
                  lineno: INTEGER_TYPE.allow(null).optional(),
                })
              ),
            })
            .required(),
          type: STRING_TYPE.required(),
          value: STRING_TYPE.allow('').required(),
        })
      ),
    })
    .optional(),
  extra: joi.object().optional(),
  fingerprint: joi
    .array()
    .items(STRING_TYPE)
    .optional(),
  level: STRING_TYPE.optional(),
  logger: STRING_TYPE.optional(),
  message: STRING_TYPE.optional(),
  platform: STRING_TYPE.optional(),
  project: STRING_TYPE.required(),
  release: STRING_TYPE.optional(),
  request: joi
    .object()
    .keys({
      headers: joi.object().required(),
      url: URL_TYPE.required(),
    })
    .required(),
  tags: joi
    .object()
    .keys({
      code: INTEGER_TYPE.min(0).optional(),
      context: STRING_TYPE.regex(ERROR_CONTEXT_PATTERN).optional(),
      errno: joi.optional(), // errno can be an int or a string (errnoQuotaExceededError, Error, etc)
      namespace: STRING_TYPE.optional(),
      status: INTEGER_TYPE.min(0).optional(),
    })
    .optional(),
};

const QUERY_SCHEMA = {
  automatedBrowser: STRING_TYPE.optional(),
  client_id: STRING_TYPE.regex(CLIENT_ID_PATTERN).optional(),
  context: STRING_TYPE.regex(CONTEXT_PATTERN).optional(),
  customizeSync: STRING_TYPE.optional(),
  entrypoint: STRING_TYPE.regex(ENTRYPOINT_PATTERN).optional(),
  keys: STRING_TYPE.optional(),
  migration: STRING_TYPE.regex(MIGRATION_PATTERN).optional(),
  redirect_uri: URL_TYPE.optional(),
  scope: STRING_TYPE.optional(),
  sentry_client: STRING_TYPE.optional(),
  sentry_key: STRING_TYPE.optional(),
  sentry_version: STRING_TYPE.optional(),
  service: STRING_TYPE.regex(SERVICE_PATTERN).optional(),
  setting: STRING_TYPE.optional(),
  style: STRING_TYPE.optional(),
};

/**
 * Attaches extra tags to sentry data
 *
 * @param {Object} sentryData - Sentry data object
 * @returns {Object} sentryData - Sentry data object with extra tags
 */
function setExtraSentryData(sentryData) {
  if (sentryData && sentryData.stacktrace && sentryData.stacktrace.frames) {
    // the limit for the sentryRequest is controlled by nginx,
    // by default the request url should not be greater than ~8000 characters.
    // nginx will throw a '414 Request-URI Too Large' if the sentryRequest is too long.
    // Cut the stacktrace frames to 20 calls maximum, otherwise the sentryRequest will be too long.
    // Details at github.com/mozilla/fxa-content-server/issues/3167

    sentryData.stacktrace.frames = sentryData.stacktrace.frames.slice(
      0,
      STACK_TRACE_LENGTH
    );
  }

  return sentryData;
}

/**
 * Reports errors to Sentry
 * @param {Object} query
 *          Query from the error request.
 * @param {String} body
 *          Body of the error request.
 */
function reportError(query, body) {
  if (!query || !body || !_.isObject(query) || !_.isObject(body)) {
    logger.error('reportError bad query or body', {
      body: body,
      query: query,
    });
    return;
  }

  if (sentryConfig && sentryConfig.endpoint && API_KEY && API_SECRET) {
    // set API_KEY and API_SECRET using the server
    query['sentry_key'] = API_KEY;
    query['sentry_secret'] = API_SECRET;
    body = setExtraSentryData(body);
    const newQuery = querystring.stringify(query);

    got
      .post(sentryConfig.endpoint + '?' + newQuery, {
        body: JSON.stringify(body),
      })
      .catch(function(err) {
        logger.error(err, body);
      });
  }
}

/**
 * This module serves as an endpoint for front-end errors.
 * The errors are sent to Sentry service for triage.
 *
 * The content server sends a POST request via forked version of raven-js, i.e POST /metrics-errors?sentry_version=4&...
 * The query parameters and the payload are forwarded to the appropriate Sentry metrics dashboard.
 *
 * @returns {{method: string, path: string, process: Function}}
 */
module.exports = function() {
  return {
    method: 'post',
    path: '/metrics-errors',
    validate: {
      body: BODY_SCHEMA,
      query: QUERY_SCHEMA,
    },
    process: function(req, res) {
      // respond right away
      res.json({ success: true });

      reportError(req.query, req.body);
    },
  };
};
