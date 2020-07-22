/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// update maxSockets setting for node 0.10
// see https://github.com/request/request/issues/158 for details
var http = require('http');
http.globalAgent.maxSockets = Infinity;

var https = require('https');
https.globalAgent.maxSockets = Infinity;

// in case we want rip `request` out, it can happen in here
module.exports = require('request').defaults({
  forever: true
});
