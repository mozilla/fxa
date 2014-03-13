/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
    method: 'POST',
    path: '/oauth/authorization',
    config: require('./routes/authorization')
  },
  {
    method: 'POST',
    path: '/oauth/token',
    config: require('./routes/token')
  }
];
