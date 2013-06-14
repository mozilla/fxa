#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var server = require('../server.js');

// Start the server
server.start(function() {
  console.log('running on ' + server.info.uri);
});
