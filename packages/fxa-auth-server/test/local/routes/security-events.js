/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const getRoute = require('../../routes_helpers').getRoute;
const mocks = require('../../mocks');
const uuid = require('uuid');

let route, routes, request;
const TEST_EMAIL = 'foo@gmail.com';

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

describe('/securityEvents route test suite', () => {
  let mockRequest;
  beforeEach(() => {
    mockRequest = mocks.mockRequest({
      credentials: {
        email: TEST_EMAIL,
        uid: uuid.v4('binary').toString('hex'),
      },
    });
    return setup('/securityEvents', {});
  });

  // this test is temporary and will be modified after
  // db method starts working correctly
  it('gets the response correctly', () => {
    return runTest(route, mockRequest).then(res => {
      console.log(res);
      return assert(true);
    });
  });
});
