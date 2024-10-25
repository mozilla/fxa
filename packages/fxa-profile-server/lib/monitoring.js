/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Sentry = require('@sentry/node');
const { initSentry } = require('@fxa/shared/sentry-node');
const { initTracing } = require('@fxa/shared/otel');

const configuration = require('./config');
const { version } = require('../package.json');
const log = require('./logging')('configure-sentry');

const config = JSON.parse(configuration.toString());

initTracing(config.tracing, log);
initSentry(
  {
    ...configuration,
    release: version,
    integrations: [
      Sentry.extraErrorDataIntegration({ depth: 5 }),
      Sentry.linkedErrorsIntegration({ key: 'jse_cause' }),
    ],
  },
  {
    warn: (type, data) => log.warn(type.replace(/ /g, '-'), data),
    debug: (type, data) => log.debug(type.replace(/ /g, '-'), data),
    info: (type, data) => log.info(type.replace(/ /g, '-'), data),
    error: (type, data) => log.error(type.replace(/ /g, '-'), data),
  }
);
