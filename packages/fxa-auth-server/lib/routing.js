/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const version = require('./config').get('api.version');

function v(url) {
  return '/v' + version + url;
}

module.exports = [
  {
    method: 'GET',
    path: '/',
    config: require('./routes/root')
  },
  {
    method: 'GET',
    path: '/__heartbeat__',
    config: require('./routes/heartbeat')
  },
  {
    method: 'GET',
    path: v('/client/{client_id}'),
    config: require('./routes/client')
  },
  {
    method: 'GET',
    path: v('/authorization'),
    config: require('./routes/redirect')
  },
  {
    method: 'POST',
    path: v('/authorization'),
    config: require('./routes/authorization')
  },
  {
    method: 'POST',
    path: v('/token'),
    config: require('./routes/token')
  },
  {
    method: 'POST',
    path: v('/destroy'),
    config: require('./routes/destroy')
  },
  {
    method: 'POST',
    path: v('/verify'),
    config: require('./routes/verify')
  }
];
