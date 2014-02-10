/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const config = require('../config');

module.exports = (function db() {
  if (config.get('db.driver') === 'mysql') {
    return require('./mysql')();
  } else {
    return require('./memory')();
  }
})();
