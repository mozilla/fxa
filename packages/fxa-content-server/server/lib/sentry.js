/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const _ = require('lodash');

const config = require('./configuration');
const SENTRY_SERVER_ERRORS_DSN = config.get('sentry.server_errors_dsn');
const STACKTRACE_FRAME_LENGTH = 10;
const RELEASE = require('../../package.json').version;

const Sentry = require('@sentry/node');

function removeQuery(url) {
  if (!url) {
    return '';
  }

  // this removes the query params, avoids revealing PII
  // in the future we can add allowed fields if it is useful
  return url.split('?').shift();
}

const eventFilter = event => {
  if (_.get(event, 'request.headers.Referer')) {
    event.request.headers.Referer = removeQuery(event.request.headers.Referer);
  }

  if (_.get(event, 'request.url')) {
    event.request.url = removeQuery(event.request.url);
  }

  if (_.get(event, 'request.query_string')) {
    event.request.query_string = null; //eslint-disable-line camelcase
  }

  if (_.get(event, 'exception[0].stacktrace.frames')) {
    // trim the stacktrace to avoid sending a lot of event
    // by default some traces may have 100+ frames
    event.exception[0].stacktrace.frames.length = STACKTRACE_FRAME_LENGTH;
  }

  return event;
};

// if no DSN provided then error reporting is disabled
Sentry.init({
  dsn: SENTRY_SERVER_ERRORS_DSN,
  release: RELEASE,
  beforeSend: eventFilter,
  integrations: [new Sentry.Integrations.LinkedErrors({ key: 'jse_cause' })],
});

module.exports = {
  _eventFilter: eventFilter, // exported for testing purposes
  sentryModule: Sentry,
};
