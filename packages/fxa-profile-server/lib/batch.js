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
// mapping routes to fields that should be extracted from their response.
// Mapping a route to `true` will include all of its returned fields,
// while mapping it to an array will include only the fields named
// in the array.  For example:
//
//   batch(req, {
//     // Include all fields returned by /v1/email
//     '/v1/email': true
//     // Include only two of the fields returned by /v1/avatar
//     '/v1/avatar': ['avatar', 'avatarDefault']
//   }).done(reply)
//
function batch(request, routeFieldsMap, next) {
  const result = {};
  let email;
  return P.all(Object.keys(routeFieldsMap).map(url => {
    return inject(request.server, {
      allowInternals: true,
      method: 'get',
      url: url,
      headers: request.headers,
      credentials: request.auth.credentials
    }).then(res => {
      let fields;
      switch (res.statusCode) {
      case 200:
        fields = routeFieldsMap[url];
        if (fields === true) {
          fields = Object.keys(res.result);
        }
        fields.forEach(field => {
          if (field === 'email') {
            email = res.result.email;
          }
          result[field] = res.result[field];
        });
        break;
      case 204:
      case 403:
      case 404:
        logger.debug(url + ':' + res.statusCode, {
          scope: request.auth.credentials.scope,
          response: res.result
        });
        break;
      default:
        logger.error(url + ':' + res.statusCode, res.result);
        throw AppError.from(res.result);
      }
    });
  }))
  .then(() => {
    const shouldCache = config.serverCache.enabledEmailAddresses.test(email);
    const ttl = shouldCache ? undefined : 0;
    return next(null, result, ttl);
  })
  .catch(next);
}

module.exports = batch;
