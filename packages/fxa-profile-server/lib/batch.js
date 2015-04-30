/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const logger = require('./logging')('batch');
const P = require('./promise');

function inject(server, options) {
  return new P(function(resolve) {
    server.inject(options, resolve);
  });
}

// called in a route as `batch(req, map)`, where map is an Object
// mapping property names to routes.
//
// Ex: batch(req, { email: '/v1/email', avatar: '/v1/avatar' }).done(reply)
//
// The above will fetch both routes as GET requests, into `emailRes` and
// `avatarRes`. The end result of the returned promise would then be:
//
// { email: emailRes['email'], avatar: avatarRes['avatar'] }
function batch(request, map) {
  var result = {};
  Object.keys(map).forEach(function(prop) {
    var url = map[prop];
    result[prop] = inject(request.server, {
      method: 'get',
      url: url,
      headers: request.headers,
      credentials: request.auth.credentials
    }).then(function(res) {
      switch (res.statusCode) {
        case 200:
          return res.result[prop];
        case 403:
        case 404:
          logger.debug('batch.' + res.statusCode, {
            scope: request.auth.credentials.scope,
            response: res.result
          });
          return undefined;
        default:
          throw res.result;
      }
    });
  });
  return P.props(result).then(function(result) {
    Object.keys(result).forEach(function(key) {
      if (result[key] === undefined) {
        delete result[key];
      }
    });
    return result;
  });
}

module.exports = batch;
