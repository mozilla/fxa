/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var db = require('../../lib/db');

var client = require('../../config/client.json');

db.registerClient(client).done(function(c) {
  console.log('client_id: %s', c.id.toString('hex'));
}, function(err) {
  console.error(err);
  process.exit(1);
});
