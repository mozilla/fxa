/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/* global require */

const config = require('../lib/config');
const log = require('mozlog')('server');
const updateIndex = require('./updateIndexFromEnv');

/* Update config that's passed into ember app by updating the config built at run-time
 * with config values passed in through environment variables.
 * This enables re-running the server with newer environment vars
 * without having to rebuild ember app.
 */
updateIndex(config)
  .then(() => {
    const server = require('../lib/server');
    const configProps = config.getProperties();
    log.debug('Starting with config: %:2j', configProps);
    const app = server.listen(configProps.server.port, function() {
      const port = app.address().port;
      log.info('FxA OAuth Developer Console started on port:', port);
    });
  })
  .catch(err => {
    log.info(err);
  });
