/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };
const getRoute = require('../../routes_helpers').getRoute;
const mocks = require('../../mocks');
const ScopeSet = require('fxa-shared/oauth/scopes').scopeSetHelpers;
const error = require('../../../lib/error');

const { INVALID_PARAMETER, MISSING_PARAMETER } = error.ERRNO;

function makeRoutes(options = {}) {
  const log = options.log || mocks.mockLog();
  const db = options.db || mocks.mockDB();
  return require('../../../lib/routes/newsletters')(log, db);
}

function runTest(route, request) {
  return route.handler(request);
}

const email = 'test@mail.com';
const uid = 'uid';
const newsletters = [
  'firefox-accounts-journey',
  'knowledge-is-power',
  'mozilla-foundation',
  'test-pilot',
];

describe('/newsletters should emit newsletters update message', () => {
  let request, db, log, routes, route, response;

  describe('using session token', () => {
    before(() => {
      log = mocks.mockLog();
      db = mocks.mockDB({
        email,
        uid,
      });
      routes = makeRoutes({ log, db });
      route = getRoute(routes, '/newsletters');
      request = mocks.mockRequest({
        auth: {
          strategy: 'sessionToken',
        },
        credentials: {
          email,
          uid,
        },
        log,
        payload: {
          newsletters,
        },
      });

      return runTest(route, request).then((result) => (response = result));
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

  describe('using access token', () => {
    before(() => {
      log = mocks.mockLog();
      db = mocks.mockDB({
        email,
        uid,
      });
      routes = makeRoutes({ log, db });
      route = getRoute(routes, '/newsletters');
      request = mocks.mockRequest({
        auth: {
          strategy: 'oauthToken',
        },
        credentials: {
          email,
          user: uid,
        },
        log,
        payload: {
          newsletters,
        },
      });

      sinon.stub(ScopeSet, 'fromArray').returns({ contains: () => true });

      return runTest(route, request)
        .then((result) => (response = result))
        .finally(() => ScopeSet.fromArray.restore());
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

  describe('using access token without the required scope', () => {
    it('throws an unauthorized error', () => {
      log = mocks.mockLog();
      db = mocks.mockDB({
        email,
        uid,
      });
      routes = makeRoutes({ log, db });
      route = getRoute(routes, '/newsletters');
      request = mocks.mockRequest({
        auth: {
          strategy: 'oauthToken',
        },
        credentials: {
          email,
          user: uid,
        },
        log,
        payload: {
          newsletters,
        },
      });
      sinon.stub(ScopeSet, 'fromArray').returns({ contains: () => false });
      return runTest(route, request)
        .then(() => assert.fail('An error should have been thrown.'))
        .catch((e) => assert.equal(e.output.payload.code, 401))
        .finally(() => ScopeSet.fromArray.restore());
    });
  });

  describe('request errors', () => {
    beforeEach(() => {
      log = mocks.mockLog();
      db = mocks.mockDB({
        email,
        uid,
      });
      routes = makeRoutes({ log, db });
      route = getRoute(routes, '/newsletters');
      sinon.stub(ScopeSet, 'fromArray').returns({ contains: () => true });
    });
    it('throws a bad request error when "newsletters" is missing', () => {
      request = mocks.mockRequest({
        auth: {
          strategy: 'oauthToken',
        },
        credentials: {
          email,
          user: uid,
        },
        log,
        payload: {
          nope: 'not-correct',
        },
      });
      return runTest(route, request)
        .catch((e) => {
          assert.equal(e.output.payload.code, 400);
          assert.equal(e.output.payload.errno, MISSING_PARAMETER);
        })
        .finally(() => ScopeSet.fromArray.restore());
    });
    it('throws a bad request error when "newsletters" is present but invalid', () => {
      request = mocks.mockRequest({
        auth: {
          strategy: 'oauthToken',
        },
        credentials: {
          email,
          user: uid,
        },
        log,
        payload: {
          newsletters: 'not-correct',
        },
      });
      return runTest(route, request)
        .catch((e) => {
          assert.equal(e.output.payload.code, 400);
          assert.equal(e.output.payload.errno, INVALID_PARAMETER);
        })
        .finally(() => ScopeSet.fromArray.restore());
    });
  });
});
