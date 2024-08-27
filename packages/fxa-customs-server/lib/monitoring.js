/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Sentry = require('@sentry/node');
const { initMonitoring } = require('fxa-shared/monitoring');
const config = require('./config').getProperties();
const log = require('./log')(config.log.level, 'configure-sentry');
const { version } = require('../package.json');

initMonitoring({
  log,
  config: {
    ...config,
    release: version,
    integrations: [Sentry.linkedErrorsIntegration({ key: 'jse_cause' })],
  },
});
