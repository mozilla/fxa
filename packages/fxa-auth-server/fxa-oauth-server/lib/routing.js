/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const config = require('./config');
const version = config.get('api.version');

function v(url) {
  return '/v' + version + url;
}

exports.routes = [
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
    config: require('./routes/heartbeat'),
  },
  {
    method: 'GET',
    path: '/config',
    config: require('./routes/config'),
  },

  // v1 API
  {
    method: 'GET',
    path: v('/client/{client_id}'),
    config: require('./routes/client/get'),
  },
  {
    method: 'POST',
    path: v('/key-data'),
    config: require('./routes/key_data'),
  },
  {
    method: 'GET',
    path: v('/authorization'),
    config: require('./routes/redirect'),
  },
  {
    method: 'POST',
    path: v('/authorization'),
    config: require('./routes/authorization'),
  },
  {
    method: 'POST',
    path: v('/token'),
    config: require('./routes/token'),
  },
  {
    method: 'POST',
    path: v('/introspect'),
    config: require('./routes/introspect'),
  },
  {
    method: 'POST',
    path: v('/destroy'),
    config: require('./routes/destroy'),
  },
  {
    method: 'POST',
    path: v('/verify'),
    config: require('./routes/verify'),
  },
  {
    method: 'GET',
    path: v('/jwks'),
    config: require('./routes/jwks'),
  },
  {
    method: 'POST',
    path: v('/authorized-clients'),
    config: require('./routes/authorized-clients/list'),
  },
  {
    method: 'POST',
    path: v('/authorized-clients/destroy'),
    config: require('./routes/authorized-clients/destroy'),
  },
  {
    method: 'GET',
    path: v('/client-tokens'),
    config: require('./routes/client-tokens/list'),
  },
  {
    method: 'DELETE',
    path: v('/client-tokens/{client_id}'),
    config: require('./routes/client-tokens/delete'),
  },
];

exports.clients = [
  {
    method: 'GET',
    path: v('/clients'),
    config: require('./routes/client/list'),
  },
  {
    method: 'POST',
    path: v('/client'),
    config: require('./routes/client/register'),
  },
  {
    method: 'POST',
    path: v('/client/{client_id}'),
    config: require('./routes/client/update'),
  },
  {
    method: 'DELETE',
    path: v('/client/{client_id}'),
    config: require('./routes/client/delete'),
  },
  {
    method: 'POST',
    path: v('/developer/activate'),
    config: require('./routes/developer/activate'),
  },
];
