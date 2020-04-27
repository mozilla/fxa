/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };
const getRoute = require('../../routes_helpers').getRoute;
const mocks = require('../../mocks');

function makeRoutes(options = {}) {
  const log = options.log || mocks.mockLog();
  const db = options.db || mocks.mockDB();
  return require('../../../lib/routes/newsletters')(log, db);
}

function runTest(route, request) {
  return route.handler(request);
}

describe('/newsletters should emit newsletters update message', () => {
  const email = 'test@mail.com';
  const uid = 'uid';
  const newsletters = [
    'firefox-accounts-journey',
    'knowledge-is-power',
    'take-action-for-the-internet',
    'test-pilot',
  ];

  let request, db, log, routes, route, response;

  before(() => {
    log = mocks.mockLog();
    db = mocks.mockDB({
      email,
      uid,
    });
    routes = makeRoutes({ log, db });
    route = getRoute(routes, '/newsletters');
    request = mocks.mockRequest({
      credentials: {
        email,
        uid,
      },
      log,
      payload: {
        newsletters,
      },
    });

    return runTest(route, request).then(result => (response = result));
  });

  it('returns correct response', () => {
    assert.deepEqual(response, {});
  });

  it('called log.begin correctly', () => {
    assert.calledOnce(log.begin);
    assert.calledWithExactly(log.begin, 'newsletters', request);
  });

  it('called db.account correctly', () => {
    assert.calledOnce(db.account);
    assert.calledWithExactly(db.account, uid);
  });

  it('called log.notifyAttachedServices correctly', () => {
    assert.calledOnce(log.notifyAttachedServices);
    assert.calledWithExactly(
      log.notifyAttachedServices,
      'newsletters:update',
      request,
      {
        country: 'United States',
        countryCode: 'US',
        email,
        newsletters,
        locale: undefined,
        uid,
        userAgent: 'test user-agent',
      }
    );
  });
});
