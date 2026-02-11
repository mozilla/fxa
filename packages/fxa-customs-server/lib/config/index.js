/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var fs = require('fs');
var path = require('path');
var url = require('url');
var convict = require('convict');
convict.addFormats(require('convict-format-with-moment'));
convict.addFormats(require('convict-format-with-validator'));

module.exports = require('./config')(fs, path, url, convict);
