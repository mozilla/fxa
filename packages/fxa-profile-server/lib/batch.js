/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const AppError = require('./error');
const Boom = require('boom');
const logger = require('./logging')('batch');
const P = require('./promise');

// Make multiple internal requests to routes, and merge their responses
// into a single object.
//
// This should be called `batch(req, map)`, where map is an Object mapping
// route paths to the fields that should be extracted from their response.
// Mapping a route to `true` will include all of its returned fields,
// while mapping it to an array will include only the fields named
// in the array.  For example:
//
//   batch(req, {
//     // Include all fields returned by /v1/email
//     '/v1/email': true
//     // Include only two of the fields returned by /v1/avatar
//     '/v1/avatar': ['avatar', 'avatarDefault']
//   })
//
// Would return (a promise of) an object like:
//
//  {
//    email: 'test@example.com',
//    avatar: 'https://example.com/avatar/test',
//    avatarDefault: false
//  }
//
// Failing requests will be excluded from the response, which allows
// for partial reads.  If *all* requests fail with a permission error
// then this function will throw a permission error in return.
//
function batch(request, routeFieldsMap) {
  const result = {};
  let numForbidden = 0;
  const routeFieldsKeys = Object.keys(routeFieldsMap);

  return P.each(routeFieldsKeys, url => {
    return request.server
      .inject({
        allowInternals: true,
        method: 'get',
        url: url,
        headers: request.headers,
        credentials: request.auth.credentials,
      })
      .then(res => {
        let fields;
        switch (res.statusCode) {
          case 200:
            fields = routeFieldsMap[url];
            if (fields === true) {
              fields = Object.keys(res.result);
            }
            fields.forEach(field => {
              result[field] = res.result[field];
            });
            break;
          case 403:
            numForbidden++;
          // This deliberately falls through to the following case.
          case 204:
          case 404:
            logger.debug(url + ':' + res.statusCode, {
              scope: request.auth.credentials.scope,
              response: res.result,
            });
            break;
          default:
            logger.error(url + ':' + res.statusCode, res.result);
            throw AppError.from(res.result);
        }
      });
  }).then(() => {
    // If *all* of the batch requests failed, fail out.
    if (numForbidden === routeFieldsKeys.length) {
      throw Boom.forbidden();
    }
    return result;
  });
}

module.exports = batch;
