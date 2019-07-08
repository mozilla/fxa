/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const errors = require('../../../lib/error');
const getRoute = require('../../routes_helpers').getRoute;
const mocks = require('../../mocks');

let log, db, customs, routes, route, request, response;
const TEST_EMAIL = 'test@email.com';

describe('/session/verify/token', () => {
  describe('should verify code', () => {
    beforeEach(() => setup({ db: {} }).then(r => (response = r)));

    it('returned the correct response', () => {
      assert.deepEqual(response, {});
    });

    it('called log.begin correctly', () => {
      assert.equal(log.begin.callCount, 1);
      const args = log.begin.args[0];
      assert.equal(args.length, 2);
      assert.equal(args[0], 'session.verify.token');
      assert.equal(args[1], request);
    });

    it('called customs.check correctly', () => {
      assert.equal(customs.check.callCount, 1);
      const args = customs.check.args[0];
      assert.equal(args.length, 3);
      assert.equal(args[0], request);
      assert.equal(args[1], TEST_EMAIL);
      assert.equal(args[2], 'verifyTokenCode');
    });

    it('called db.verifyTokenCode correctly', () => {
      assert.equal(db.verifyTokenCode.callCount, 1);
      const args = db.verifyTokenCode.args[0];
      assert.equal(args.length, 2);
      assert.equal(args[0], 'ASEFJK12');
    });

    it('called log.info correctly', () => {
      assert.equal(log.info.callCount, 2);
      const args = log.info.args[1];
      assert.equal(args.length, 2);
      assert.equal(args[0], 'account.token.code.verified');
    });
  });

  describe('should not verify expired code', () => {
    beforeEach(() => {
      return setup(null, {
        db: { verifyTokenCode: errors.expiredTokenVerficationCode() },
      }).then(
        () => {
          assert.fail('should not have verified');
        },
        err => (response = err)
      );
    });

    it('returned the correct error response', () => {
      assert.equal(response.errno, 153, 'correct errno');
    });

    it('called log.begin correctly', () => {
      assert.equal(log.begin.callCount, 1);
      const args = log.begin.args[0];
      assert.equal(args.length, 2);
      assert.equal(args[0], 'session.verify.token');
      assert.equal(args[1], request);
    });

    it('called customs.check correctly', () => {
      assert.equal(customs.check.callCount, 1);
      const args = customs.check.args[0];
      assert.equal(args.length, 3);
      assert.equal(args[0], request);
      assert.equal(args[1], TEST_EMAIL);
      assert.equal(args[2], 'verifyTokenCode');
    });

    it('called db.verifyTokenCode correctly', () => {
      assert.equal(db.verifyTokenCode.callCount, 1);
      const args = db.verifyTokenCode.args[0];
      assert.equal(args.length, 2);
      assert.equal(args[0], 'ASEFJK12');
    });

    it('called log.error correctly', () => {
      assert.equal(log.error.callCount, 1);
      const args = log.error.args[0];
      assert.equal(args.length, 2);
      assert.equal(args[0], 'account.token.code.expired');
    });
  });
});

function setup(results, errors) {
  results = results || {};
  errors = errors || {};

  log = mocks.mockLog();
  db = mocks.mockDB(results.db, errors.db);
  customs = mocks.mockCustoms(errors.customs);
  routes = makeRoutes({ log, db, customs });
  route = getRoute(routes, '/session/verify/token');
  request = mocks.mockRequest({
    credentials: {
      uid: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      email: TEST_EMAIL,
    },
    log: log,
    payload: {
      code: 'ASEFJK12',
    },
  });
  return runTest(route, request);
}

function makeRoutes(options = {}) {
  const log = options.log || mocks.mockLog();
  const db = options.db || mocks.mockDB();
  const customs = options.customs || mocks.mockCustoms();
  const config = options.config || { signinConfirmation: {} };
  return require('../../../lib/routes/token-codes')(log, db, config, customs);
}

function runTest(route, request) {
  return route.handler(request);
}
