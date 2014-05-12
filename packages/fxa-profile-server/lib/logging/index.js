/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const intel = require('intel');

const config = require('../config');

var conf = config.get('logging');
if (conf.handlers.console.stream === 'process.stdout') {
  conf.handlers.console.stream = process.stdout;
}

intel.config(conf);

module.exports = intel;
