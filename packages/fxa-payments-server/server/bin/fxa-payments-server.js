/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
require('module-alias/register');

// Important! Must be required first to get proper hooks in place.
require('../lib/monitoring');

const server = require('../lib/server')();

server.listen();
