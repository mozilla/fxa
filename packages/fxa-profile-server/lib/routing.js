/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function v(url) {
  return '/v0' + url;
}
module.exports = [
  {
    method: 'GET',
    path: '/',
    config: require('./routes/root')
  },
  {
    method: 'GET',
    path: v('/users/{userId}'),
    config: require('./routes/user')
  },
  {
    method: 'POST',
    path: v('/avatar'),
    config: require('./routes/avatar')
  },
  {
    method: 'POST',
    path: v('/avatar/upload'),
    config: require('./routes/upload')
  }
];
