/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var env = process.env.NODE_ENV;
var exec = require('child_process').exec;

if (env === 'production') {
  process.exit(0);
}

exec('cp node_modules/grunt-blanket-mocha/support/* app/bower_components/blanket/src',
  function (error) {
    if (error) throw error;
    process.exit(0);
  });
