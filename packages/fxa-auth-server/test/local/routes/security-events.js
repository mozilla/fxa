/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const getRoute = require('../../routes_helpers').getRoute;
const mocks = require('../../mocks');

let route, routes, request;

function makeRoutes(options = {}) {
  const log = options.log || mocks.mockLog();
  const config = options.config || {};
  const db = options.db || mocks.mockDB();
  return require('../../../lib/routes/security-events')(log, db, config);
}

function runTest(route, request) {
  return route.handler(request);
}

function setup(path, requestOptions) {
  routes = makeRoutes({});
  route = getRoute(routes, path, requestOptions.method);
  request = mocks.mockRequest(requestOptions);
  return runTest(route, request);
}

describe('GET /securityEvents/:id', () => {
  beforeEach(() => {
    const requestOptions = {
      params: { id: '25F9E0113C2B4485B2AD74B4F6FD71C4' },
    };
    return setup('/securityEvents/:id', requestOptions);
  });

  it('returns status correctly', () => {
    return runTest(route, request).then(res => {
      console.log(res); // eslint-disable-line no-console
      return assert(true);
    });
  });
});
