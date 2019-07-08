/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const config = require('../config').get('logging');

const mozlog = require('mozlog')(config);

var root = mozlog(config.app);
if (root.isEnabledFor('debug')) {
  root.warn(
    '\t*** CAREFUL! Louder logs (less than INFO)' + ' may include SECRETS! ***'
  );
}

module.exports = mozlog;
