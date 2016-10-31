/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var _ = require('lodash');
var logger = require('mozlog')('server.metrics-errors');
var got = require('got');
var querystring = require('querystring');

var config = require('../configuration');
var sentryConfig = config.get('sentry');

var API_KEY = sentryConfig.api_key;
var API_SECRET = sentryConfig.api_secret;
var STACK_TRACE_LENGTH = 20;

/**
 * Attaches extra tags to sentry data
 *
 * @param {String} data - stringified Sentry data object
 * @returns {String} data - stringified Sentry data object with extra tags
 */
function setExtraSentryData(data) {
  var sentryData = null;
  try {
    sentryData = JSON.parse(data);
  } catch (e) {
    logger.error('Failed to parse Sentry data', data);
  }

  if (sentryData) {
    if (sentryData.stacktrace && sentryData.stacktrace.frames) {
      // the limit for the sentryRequest is controlled by nginx,
      // by default the request url should not be greater than ~8000 characters.
      // nginx will throw a '414 Request-URI Too Large' if the sentryRequest is too long.
      // Cut the stacktrace frames to 20 calls maximum, otherwise the sentryRequest will be too long.
      // Details at github.com/mozilla/fxa-content-server/issues/3167

      sentryData.stacktrace.frames = sentryData.stacktrace.frames.slice(0, STACK_TRACE_LENGTH);
    }
    return JSON.stringify(sentryData);
  } else {
    return data;
  }

}

/**
 * Reports errors to Sentry
 * @param {Object} query
 *          Query from the error request.
 * @param {String} body
 *          Body of the error request.
 */
function reportError(query, body) {
  if (! query || ! body || ! _.isObject(query) || ! _.isString(body)) {
    return;
  }

  if (sentryConfig && sentryConfig.endpoint && API_KEY && API_SECRET) {
    // set API_KEY and API_SECRET using the server
    query['sentry_key'] = API_KEY;
    query['sentry_secret'] = API_SECRET;
    body = setExtraSentryData(body);
    var newQuery = querystring.stringify(query);

    got.post(sentryConfig.endpoint + '?' + newQuery, {
      body: body
    }).catch(function (err) {
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
module.exports = function () {

  return {
    method: 'post',
    path: '/metrics-errors',
    process: function (req, res) {
      // respond right away
      res.json({ success: true });

      reportError(req.query, req.body);
    }
  };
};
