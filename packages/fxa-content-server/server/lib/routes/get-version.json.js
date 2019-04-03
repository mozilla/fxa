/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Return version info based on package.json, the git sha, and source repo
 *
 * @see lib/version.js
 * @see lib/routes/get-ver.json.js
 */

'use strict';
const version = require('../version');

exports.path = '/__version__';
exports.method = 'get';
exports.process = function (req, res) {
  res.charset = 'utf-8';
  res.type('json').send(JSON.stringify(version, null, 2) + '\n');
};
