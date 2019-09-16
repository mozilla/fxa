/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const config = require('./config').getProperties();
const version = config.api.version;

function v(url) {
  return '/v' + version + url;
}
module.exports = [
  {
    method: 'GET',
    path: '/',
    config: require('./routes/root'),
  },
  {
    method: 'GET',
    path: '/__version__',
    config: require('./routes/root'),
  },
  {
    method: 'GET',
    path: '/__heartbeat__',
    config: require('./routes/heartbeat'),
  },
  {
    method: 'GET',
    path: '/__lbheartbeat__',
    config: require('./routes/lbheartbeat'),
  },
  {
    method: 'GET',
    path: v('/_core_profile'),
    config: require('./routes/_core_profile'),
  },
  {
    method: 'GET',
    path: v('/profile'),
    config: require('./routes/profile'),
  },
  {
    method: 'GET',
    path: v('/email'),
    config: require('./routes/email'),
  },
  {
    method: 'GET',
    path: v('/subscriptions'),
    config: require('./routes/subscriptions'),
  },
  {
    method: 'GET',
    path: v('/uid'),
    config: require('./routes/uid'),
  },
  {
    method: 'GET',
    path: v('/avatar'),
    config: require('./routes/avatar/get'),
  },
  {
    method: 'POST',
    path: v('/avatar/upload'),
    config: require('./routes/avatar/upload'),
  },
  {
    method: 'DELETE',
    path: v('/avatar/{id?}'),
    config: require('./routes/avatar/delete'),
  },
  {
    method: 'GET',
    path: v('/display_name'),
    config: require('./routes/display_name/get'),
  },
  {
    method: 'POST',
    path: v('/display_name'),
    config: require('./routes/display_name/post'),
  },
  {
    method: 'DELETE',
    path: v('/cache/{uid}'),
    config: require('./routes/cache/delete'),
  },
];
