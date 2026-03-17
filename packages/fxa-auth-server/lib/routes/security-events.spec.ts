/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const uuid = require('uuid');

const mocks = require('../../test/mocks');
const { getRoute } = require('../../test/routes_helpers');

let route: any, routes: any, request: any;
const TEST_EMAIL = 'foo@gmail.com';
const UID = uuid.v4({}, Buffer.alloc(16)).toString('hex');

function makeRoutes(options: any = {}) {
  const log = options.log || mocks.mockLog();
  const config = options.config || {};
  const db = options.db || mocks.mockDB();
  return require('./security-events')(log, db, config);
}

function runTest(route: any, request: any) {
  return route.handler(request);
}

function setup(path: string, requestOptions: any) {
  routes = makeRoutes({});
  route = getRoute(routes, path, requestOptions.method);
  request = mocks.mockRequest(requestOptions);
  return runTest(route, request);
}

describe('GET /securityEvents', () => {
  it('gets the security events', async () => {
    const requestOptions = {
      credentials: {
        email: TEST_EMAIL,
        uid: UID,
      },
      method: 'GET',
    };
    const res = await setup('/securityEvents', requestOptions);
    expect(res).toHaveLength(3);
    expect(res[0].name).toBe('account.create');
    expect(res[0].verified).toBe(1);
    expect(res[0].createdAt).toBeLessThan(Date.now());

    expect(res[1].name).toBe('account.login');
    expect(res[1].verified).toBe(1);
    expect(res[1].createdAt).toBeLessThan(Date.now());

    expect(res[2].name).toBe('account.reset');
    expect(res[2].verified).toBe(1);
    expect(res[2].createdAt).toBeLessThan(Date.now());
  });
});
