/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const getRoute = require('../../routes_helpers').getRoute;
const mocks = require('../../mocks');

describe('/signinCodes/consume:', () => {
  let log, db, customs, routes, route, request, response;

  describe('success, db does not return flowId:', () => {
    beforeEach(() =>
      setup({ db: { email: 'foo@bar' } }).then((r) => (response = r))
    );

    it('returned the correct response', () => {
      assert.deepEqual(response, { email: 'foo@bar' });
    });

    it('called log.begin correctly', () => {
      assert.equal(log.begin.callCount, 1);
      const args = log.begin.args[0];
      assert.equal(args.length, 2);
      assert.equal(args[0], 'signinCodes.consume');
      assert.equal(args[1], request);
    });

    it('called request.validateMetricsContext correctly', () => {
      assert.equal(request.validateMetricsContext.callCount, 1);
      const args = request.validateMetricsContext.args[0];
      assert.equal(args.length, 0);
    });

    it('called customs.checkIpOnly correctly', () => {
      assert.equal(customs.checkIpOnly.callCount, 1);
      const args = customs.checkIpOnly.args[0];
      assert.equal(args.length, 2);
      assert.equal(args[0], request);
      assert.equal(args[1], 'consumeSigninCode');
    });

    it('called db.consumeSigninCode correctly', () => {
      assert.equal(db.consumeSigninCode.callCount, 1);
      const args = db.consumeSigninCode.args[0];
      assert.equal(args.length, 1);
      assert.equal(args[0], 'fbefff7dfd');
    });

    it('called log.flowEvent correctly', () => {
      assert.equal(log.flowEvent.callCount, 1);

      const args = log.flowEvent.args[0];
      assert.equal(args.length, 1);
      assert.equal(args[0].event, 'signinCode.consumed');
      assert.equal(args[0].flow_id, request.payload.metricsContext.flowId);
    });
  });

  describe('success, db returns flowId:', () => {
    beforeEach(() =>
      setup({ db: { email: 'foo@bar', flowId: 'baz' } }).then(
        (r) => (response = r)
      )
    );

    it('returned the correct response', () => {
      assert.deepEqual(response, { email: 'foo@bar' });
    });

    it('called log.begin once', () => {
      assert.equal(log.begin.callCount, 1);
    });

    it('called request.validateMetricsContext once', () => {
      assert.equal(request.validateMetricsContext.callCount, 1);
    });

    it('called customs.checkIpOnly once', () => {
      assert.equal(customs.checkIpOnly.callCount, 1);
    });

    it('called db.consumeSigninCode once', () => {
      assert.equal(db.consumeSigninCode.callCount, 1);
    });

    it('called log.flowEvent correctly', () => {
      assert.equal(log.flowEvent.callCount, 2);

      let args = log.flowEvent.args[0];
      assert.equal(args.length, 1);
      assert.equal(args[0].event, 'signinCode.consumed');
      assert.equal(args[0].flow_id, request.payload.metricsContext.flowId);

      args = log.flowEvent.args[1];
      assert.equal(args.length, 1);
      assert.equal(args[0].event, 'flow.continued.baz');
      assert.equal(args[0].flow_id, request.payload.metricsContext.flowId);
    });
  });

  describe('db error:', () => {
    beforeEach(() =>
      setup(null, { db: { consumeSigninCode: new Error('foo') } }).catch(
        (err) => {
          assert(err.message, 'foo');
        }
      )
    );

    it('called log.begin', () => {
      assert.equal(log.begin.callCount, 1);
    });

    it('called request.validateMetricsContext', () => {
      assert.equal(request.validateMetricsContext.callCount, 1);
    });

    it('called customs.checkIpOnly', () => {
      assert.equal(customs.checkIpOnly.callCount, 1);
    });

    it('called db.consumeSigninCode', () => {
      assert.equal(db.consumeSigninCode.callCount, 1);
    });

    it('did not call log.flowEvent', () => {
      assert.equal(log.flowEvent.callCount, 0);
    });
  });

  describe('customs error:', () => {
    beforeEach(() =>
      setup(null, { customs: { checkIpOnly: new Error('foo') } }).catch(
        (err) => {
          assert(err.message, 'foo');
        }
      )
    );

    it('called log.begin', () => {
      assert.equal(log.begin.callCount, 1);
    });

    it('called request.validateMetricsContext', () => {
      assert.equal(request.validateMetricsContext.callCount, 1);
    });

    it('called customs.checkIpOnly', () => {
      assert.equal(customs.checkIpOnly.callCount, 1);
    });

    it('did not call db.consumeSigninCode', () => {
      assert.equal(db.consumeSigninCode.callCount, 0);
    });

    it('did not call log.flowEvent', () => {
      assert.equal(log.flowEvent.callCount, 0);
    });
  });

  function setup(results, errors) {
    results = results || {};
    errors = errors || {};

    log = mocks.mockLog();
    db = mocks.mockDB(results.db, errors.db);
    customs = mocks.mockCustoms(errors.customs);
    routes = makeRoutes({ log, db, customs });
    route = getRoute(routes, '/signinCodes/consume');
    request = mocks.mockRequest({
      log: log,
      payload: {
        code: '--__ff0',
        metricsContext: {
          flowBeginTime: Date.now(),
          flowId:
            '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        },
      },
    });
    return runTest(route, request);
  }
});

function makeRoutes(options = {}) {
  const log = options.log || mocks.mockLog();
  const db = options.db || mocks.mockDB();
  const customs = options.customs || mocks.mockCustoms();
  return require('../../../lib/routes/signin-codes')(log, db, customs);
}

function runTest(route, request) {
  return route.handler(request);
}
