/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var path = require('path')
var url = require('url')
var Hapi = require('hapi')

module.exports = require('./server')(path, url, Hapi)
