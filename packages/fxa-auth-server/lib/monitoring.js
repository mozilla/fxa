/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Sentry = require('@sentry/node');
const { initTracing } = require('@fxa/shared/otel');
const { initSentry } = require('@fxa/shared/sentry-node');
const { config: Config } = require('../config');
const { version } = require('../package.json');
const { ignoreErrors } = require('./error');

const config = Config.getProperties();
const logger = require('./log')(config.log.level, 'configure-sentry');

initTracing(config.tracing, logger);
initSentry(
  {
    ...config,
    ignoreErrors,
    release: version,
    integrations: [
      Sentry.extraErrorDataIntegration({ depth: 5 }),
      Sentry.linkedErrorsIntegration({ key: 'jse_cause' }),
    ],
  },
  {
    warn: (type, data) => logger.warn(type.replace(/ /g, '-'), data),
    debug: (type, data) => logger.debug(type.replace(/ /g, '-'), data),
    info: (type, data) => logger.info(type.replace(/ /g, '-'), data),
    error: (type, data) => logger.error(type.replace(/ /g, '-'), data),
  }
);
