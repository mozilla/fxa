/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const _ = require('lodash');

const config = require('./configuration');
const SENTRY_SERVER_ERRORS_DSN = config.get('sentry.server_errors_dsn');
const STACKTRACE_FRAME_LENGTH = 10;
const RELEASE = require('../../package.json').version;

const Raven = require('raven');

function removeQuery(url) {
  if (!url) {
    return '';
  }

  // this removes the query params, avoids revealing PII
  // in the future we can add allowed fields if it is useful
  return url.split('?').shift();
}

const middlewareConfig = {
  dataCallback: data => {
    if (_.get(data, 'request.headers.Referer')) {
      data.request.headers.Referer = removeQuery(data.request.headers.Referer);
    }

    if (_.get(data, 'request.url')) {
      data.request.url = removeQuery(data.request.url);
    }

    if (_.get(data, 'request.query_string')) {
      data.request.query_string = null; //eslint-disable-line camelcase
    }

    if (_.get(data, 'exception[0].stacktrace.frames')) {
      // trim the stacktrace to avoid sending a lot of data
      // by default some traces may have 100+ frames
      data.exception[0].stacktrace.frames.length = STACKTRACE_FRAME_LENGTH;
    }

    return data;
  },
  release: RELEASE,
};

// if no DSN provided then error reporting is disabled
Raven.config(SENTRY_SERVER_ERRORS_DSN, middlewareConfig).install();
Raven.setContext({});

module.exports = {
  _middlewareConfig: middlewareConfig,
  ravenModule: Raven,
};
