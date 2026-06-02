/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const config = require('../config');

// mozlog@3 depends on intel@1.x which calls util.isError(), removed in Node 24.
// Polyfill it before mozlog/intel loads. util is a singleton so this applies globally.
const util = require('util');
if (!util.isError) util.isError = (e) => e instanceof Error;

const mozlog = require('mozlog')(config.get('logging'));

module.exports = mozlog;
