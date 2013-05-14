/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const heartbeat = require('./heartbeat.js');
const idp = require('./idp');

var routes = [
  {
    method: 'GET',
    path: '/',
    config: {
      handler: index
    }
  }
].concat(
  heartbeat.routes,
  idp.routes
);

function index(request) {
  // Render the view with the custom greeting
  request.reply.view('index.html', { greeting: 'hello world' });
}

module.exports = routes;

