/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const config = require('./config').root();
const version = config.api.version;

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
  },
  {
    method: 'GET',
    path: config.uploads.route + '/{hash}',
    handler: {
      directory: {
        index: false,
        listing: false,
        path: config.uploads.dir
      }
    }
  }
];
