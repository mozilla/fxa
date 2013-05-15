/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Hapi = require('hapi');

const config = require('../lib/config');
const kvstore = require('../lib/kvstore');


exports.routes = [
  {
    method: 'GET',
    path: '/__heartbeat__',
    config: {
      handler: heartbeat
    }
  }
];

// heartbeat
function heartbeat() {
  var response = new Hapi.response.Text();
  var handler = this;

  // check for database connection
  kvstore.connect(config.get('kvstore'), function(err) {
    if (err) {
      response.message(err.toString(), 'text/plain');
      return handler.reply(response);
    }

    response.message(err ? String(err) : 'ok', 'text/plain');
    handler.reply(response);
  });
}
