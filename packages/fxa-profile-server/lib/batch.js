/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const AppError = require('./error');
const logger = require('./logging')('batch');
const P = require('./promise');
const config = require('./config').getProperties();

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
function batch(request, map, next) {
  var result = {};
  var email;
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
          if (prop === 'email') {
            email = res.result.email;
          }
          return res.result[prop];
        case 204:
        case 403:
        case 404:
          logger.debug(prop + '.' + res.statusCode, {
            scope: request.auth.credentials.scope,
            response: res.result
          });
          return undefined;
        default:
          logger.error(prop + '.' + res.statusCode, res.result);
          return AppError.from(res.result);
      }
    });
  });
  P.props(result).then(function(result) {
    Object.keys(result).forEach(function(key) {
      if (result[key] === undefined) {
        delete result[key];
      } else if (result[key].isBoom) {
        return next(result[key]);
      }
    });
    const shouldCache = config.serverCache.enabledEmailAddresses.test(email);
    const ttl = shouldCache ? undefined : 0;
    return next(null, result, ttl);
  });
}

module.exports = batch;
