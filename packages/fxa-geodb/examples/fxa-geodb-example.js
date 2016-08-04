/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var path = require('path');
// do `npm install fxa-geodb` and then require it using `require('fxa-geodb')`.
var geoDb = require('../lib/fxa-geodb')({
  dbPath: path.join(__dirname, '..', 'db', 'cities-db.mmdb')
});
// New York timezone IP: 128.192.8.8
// Beijing: 123.121.221.194
// Undefined tz: 64.11.221.194
// Australia: 137.147.16.179
geoDb('137.147.16.179')
  .then(function(location) {
    console.log(location);
  }, function (err) {
    console.log('Err:', err.message);
  });
