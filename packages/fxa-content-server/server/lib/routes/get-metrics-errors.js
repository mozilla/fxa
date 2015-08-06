/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var logger = require('mozlog')('server.metrics-errors');
var request = require('request');
var querystring = require('querystring');

var config = require('../configuration');
var sentryConfig = config.get('sentry');

var API_KEY = sentryConfig.api_key;
var CONTENT_SERVER_VERSION = require('../../../package.json').version;

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
    sentryData.release = CONTENT_SERVER_VERSION;

    return JSON.stringify(sentryData);
  } else {
    return data;
  }

}

/**
 * Reports errors to Sentry
 * @param {String} query
 *          Query from the error request.
 */
function reportError(query) {
  if (! query) {
    return;
  }

  if (sentryConfig && sentryConfig.endpoint && API_KEY) {
    // set API_KEY using the server
    query['sentry_key'] = API_KEY;
    query['sentry_data'] = setExtraSentryData(query['sentry_data']);

    var newQuery = querystring.stringify(query);
    var sentryRequest = sentryConfig.endpoint + '?' + newQuery;

    request(sentryRequest, function (err, resp, body) {
      if (err || resp.statusCode !== 200) {
        logger.error(err, body);
      }
    });
  }
}

/**
 * This module serves as an endpoint for front-end errors.
 * The errors are sent to Sentry service for triage.
 *
 * The content server sends a GET request via forked version of raven-js, i.e GET /metrics-errors?sentry_version=4&...
 * The query parameters are forwarded to the appropriate Sentry metrics dashboard.
 *
 * @returns {{method: string, path: string, process: Function}}
 */
module.exports = function () {

  return {
    method: 'get',
    path: '/metrics-errors',
    process: function (req, res) {
      // respond right away
      res.json({ success: true });

      reportError(req.query);
    }
  };
};
