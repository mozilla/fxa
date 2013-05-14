/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Hapi = require('hapi');

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
  response.message('ok', 'text/plain');
  this.reply(response);
}
