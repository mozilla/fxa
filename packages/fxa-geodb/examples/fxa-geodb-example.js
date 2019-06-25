/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');
const geoDb = require('../lib/fxa-geodb')({
  dbPath: path.join(__dirname, '..', 'db', 'cities-db.mmdb'),
});

try {
  // New York timezone IP: 128.192.8.8
  // Beijing: 123.121.221.194
  // Undefined tz: 64.11.221.194
  // Australia: 137.147.16.179
  const location = geoDb('137.147.16.179');
  console.log(location);
} catch (err) {
  console.log('Err:', err.message);
}
