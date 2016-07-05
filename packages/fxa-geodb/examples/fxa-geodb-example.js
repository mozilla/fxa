/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
var path = require('path');

(function() {
  'use strict';
  // will change to `fxa-geodb` after this becomes an npm module
  var geoDb = require(path.join('..', 'src', 'fxa-geodb'))({
    dbPath: path.join(__dirname, '..', 'db', 'cities-db.mmdb'),
    backupDbPath: path.join(__dirname, '..', 'db', 'cities-db.mmdb-backup')
  });
  // New York timezone IP: 128.192.8.8
  // Beijing: 123.121.221.194
  // Undefined tz : 64.11.221.194
  geoDb('64.11.221.194')
    .then(function(location) {
      console.log(location); //eslint-disable-line
    }, function (err) {
      console.log('Err:', err.message); //eslint-disable-line
    });
})();
