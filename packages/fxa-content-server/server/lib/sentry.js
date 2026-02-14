/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Sentry = require('@sentry/node');
const config = require('./configuration');
const RELEASE = require('../../package.json').version;
const { buildSentryConfig, tagFxaName } = require('@fxa/shared/sentry-utils');
const logger = require('./logging/log')('sentry');

if (config.get('sentry.dsn')) {
  // if no DSN provided then error reporting is disabled
  const opts = buildSentryConfig(
    {
      release: RELEASE,
      sentry: {
        dsn: config.get('sentry.dsn'),
        env: config.get('sentry.env'),
        sampleRate: config.get('sentry.sampleRate'),
        tracesSampleRate: config.get('sentry.tracesSampleRate'),
        serverName: config.get('sentry.serverName'),
      },
    },
    logger
  );

  Sentry.init({
    ...opts,
    integrations: [
      Sentry.linkedErrorsIntegration({ key: 'jse_cause' }),
      Sentry.requestDataIntegration(),
    ],
    beforeSend(event, _hint) {
      event = tagFxaName(event, opts.serverName);
      // TODO: See what validation errors look like
      return event;
    },
  });
}
