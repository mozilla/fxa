#!/usr/bin/env node
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var fs = require('fs');
var path = require('path');

var RELATIVE_FILE = path.join('server', 'config', 'local.json');
var CONFIG_FILE = path.resolve(__dirname, '..', RELATIVE_FILE);

if (!fs.existsSync(CONFIG_FILE) && !process.env.CONFIG_FILES) {
  console.log("%s doesn't exist. Creating...", RELATIVE_FILE);
  fs.createReadStream(CONFIG_FILE + '-dist').pipe(
    fs.createWriteStream(CONFIG_FILE)
  );
}
