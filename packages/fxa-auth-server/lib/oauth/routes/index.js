/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const config = require('../../../config');
const version = config.get('oauthServer.api.version');

function v(url) {
  return '/v' + version + url;
}

const routes = [
  {
    method: 'GET',
    path: '/config',
    config: require('./config'),
  },

  // v1 API
  {
    method: 'GET',
    path: v('/client/{client_id}'),
    config: require('./client/get'),
  },
  {
    method: 'POST',
    path: v('/key-data'),
    config: require('./key_data'),
  },
  {
    method: 'GET',
    path: v('/authorization'),
    config: require('./redirect'),
  },
  {
    method: 'POST',
    path: v('/authorization'),
    config: require('./authorization'),
  },
  {
    method: 'POST',
    path: v('/token'),
    config: require('./token'),
  },
  {
    method: 'POST',
    path: v('/introspect'),
    config: require('./introspect'),
  },
  {
    method: 'POST',
    path: v('/destroy'),
    config: require('./destroy'),
  },
  {
    method: 'POST',
    path: v('/verify'),
    config: require('./verify'),
  },
  {
    method: 'GET',
    path: v('/jwks'),
    config: require('./jwks'),
  },
  {
    method: 'POST',
    path: v('/authorized-clients'),
    config: require('./authorized-clients/list'),
  },
  {
    method: 'POST',
    path: v('/authorized-clients/destroy'),
    config: require('./authorized-clients/destroy'),
  },
];

exports.clients = [
  {
    method: 'GET',
    path: v('/clients'),
    config: require('./client/list'),
  },
  {
    method: 'POST',
    path: v('/client'),
    config: require('./client/register'),
  },
  {
    method: 'POST',
    path: v('/client/{client_id}'),
    config: require('./client/update'),
  },
  {
    method: 'DELETE',
    path: v('/client/{client_id}'),
    config: require('./client/delete'),
  },
  {
    method: 'POST',
    path: v('/developer/activate'),
    config: require('./developer/activate'),
  },
];

routes.forEach(function(route) {
  route.config.cors = { origin: 'ignore' };
  var method = route.method.toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') {
    if (!route.config.payload) {
      route.config.payload = {
        allow: ['application/json', 'application/x-www-form-urlencoded'],
      };
    }
  }
});

exports.routes = routes;
