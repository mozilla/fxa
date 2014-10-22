/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const config = require('../lib/config').root();
const server = require('../lib/server');
var log = require('mozlog')('server');

log.debug('Starting with config: %:2j', config);
var app = server.listen(config.server.port, function() {
  var port = app.address().port;
  log.info('FxA OAuth Developer Console started on port:', port);
});
