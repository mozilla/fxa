/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const kv = require('../lib/kv');
const async = require('async');

exports.routes = [
  {
    method: 'GET',
    path: '/__heartbeat__',
    config: {
      handler: heartbeat
    }
  }
];

function heartbeat(request) {
  async.each(
    [kv.store, kv.cache],
    function (db, done) {
      db.ping(done);
    },
    function (err) {
      var text = 'ok';
      if (err) {
        text = err.toString();
      }
      request.reply(text).type('text/plain');
    }
  );
}
