/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function() {
  'use strict';
  var geoDb = require('../src/fxa-geodb')({
    db: __dirname + '/../db/cities-db.mmdb',
    db_backup: __dirname + '/../db/cities-db.mmdb-backup'
  });
  // New York timezone IP: 128.192.8.8
  // Beijing: 123.121.221.194
  // Undefined tz : 64.11.221.194
  geoDb('123.121.221.194')
    .then(function(city) {
      console.log(city); //eslint-disable-line
    }, function (err) {
      console.log('Err:', err.message); //eslint-disable-line
    });
})();
