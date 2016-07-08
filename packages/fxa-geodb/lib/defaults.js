/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
var path = require('path');

var DEFAULTS = {
  DEFAULT_CRON_TIMING : '30 30 1 * * 3',
  DEFAULT_SOURCE_FILE_NAME : 'sources.json',
  DEFAULT_TARGET_DIR_NAME : 'db',
  DEFAULT_TARGET_FILE_NAME : 'cities-db.mmdb',
  DEFAULT_TIMEZONE : 'America/Los_Angeles'
};

DEFAULTS.DEFAULT_TARGET_DIR_PATH = path.join(__dirname, '..', DEFAULTS.DEFAULT_TARGET_DIR_NAME);
DEFAULTS.DEFAULT_DB_PATH = path.join(DEFAULTS.DEFAULT_TARGET_DIR_PATH, DEFAULTS.DEFAULT_TARGET_FILE_NAME);
DEFAULTS.DEFAULT_SOURCE_FILE_PATH = path.join(__dirname, '..', DEFAULTS.DEFAULT_SOURCE_FILE_NAME);

module.exports = DEFAULTS;
