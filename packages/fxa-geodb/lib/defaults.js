/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
var path = require('path');

var DEFAULTS = {
  CRON_TIMING: '30 30 1 * * 3',
  GEODB_TEST_IP: '63.245.221.32',
  SOURCE_FILE_NAME: 'sources.json',
  TARGET_DIR_NAME: 'db',
  TARGET_FILE_NAME: 'cities-db.mmdb',
  TIMEZONE: 'America/Los_Angeles',
  USER_LOCALE: 'en',
};

DEFAULTS.TARGET_DIR_PATH = path.join(__dirname, '..', DEFAULTS.TARGET_DIR_NAME);
DEFAULTS.DB_PATH = path.join(
  DEFAULTS.TARGET_DIR_PATH,
  DEFAULTS.TARGET_FILE_NAME
);
DEFAULTS.SOURCE_FILE_PATH = path.join(
  __dirname,
  '..',
  DEFAULTS.SOURCE_FILE_NAME
);

module.exports = DEFAULTS;
