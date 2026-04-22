/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mocks = require('../../test/mocks');
const { getRoute } = require('../../test/routes_helpers');
const ScopeSet = require('fxa-shared/oauth/scopes').scopeSetHelpers;
const { AppError: error } = require('@fxa/accounts/errors');

const { INVALID_PARAMETER, MISSING_PARAMETER } = error.ERRNO;

function makeRoutes(options: any = {}) {
  const log = options.log || mocks.mockLog();
  const db = options.db || mocks.mockDB();
  return require('./newsletters')(log, db);
}

function runTest(route: any, request: any) {
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
  let request: any, db: any, log: any, routes: any, route: any, response: any;

  describe('using session token', () => {
    beforeEach(async () => {
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

      response = await runTest(route, request);
    });

    it('returns correct response', () => {
      expect(response).toEqual({});
    });

    it('called log.begin correctly', () => {
      expect(log.begin).toHaveBeenCalledTimes(1);
      expect(log.begin).toHaveBeenCalledWith('newsletters', request);
    });

    it('called db.account correctly', () => {
      expect(db.account).toHaveBeenCalledTimes(1);
      expect(db.account).toHaveBeenCalledWith(uid);
    });

    it('called log.notifyAttachedServices correctly', () => {
      expect(log.notifyAttachedServices).toHaveBeenCalledTimes(1);
      expect(log.notifyAttachedServices).toHaveBeenCalledWith(
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
    beforeEach(async () => {
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

      jest
        .spyOn(ScopeSet, 'fromArray')
        .mockReturnValue({ contains: () => true });

      response = await runTest(route, request);
    });

    it('returns correct response', () => {
      expect(response).toEqual({});
    });

    it('called log.begin correctly', () => {
      expect(log.begin).toHaveBeenCalledTimes(1);
      expect(log.begin).toHaveBeenCalledWith('newsletters', request);
    });

    it('called db.account correctly', () => {
      expect(db.account).toHaveBeenCalledTimes(1);
      expect(db.account).toHaveBeenCalledWith(uid);
    });

    it('called log.notifyAttachedServices correctly', () => {
      expect(log.notifyAttachedServices).toHaveBeenCalledTimes(1);
      expect(log.notifyAttachedServices).toHaveBeenCalledWith(
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
    it('throws an unauthorized error', async () => {
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
      jest
        .spyOn(ScopeSet, 'fromArray')
        .mockReturnValue({ contains: () => false });
      try {
        await runTest(route, request);
        throw new Error('An error should have been thrown.');
      } catch (e: any) {
        expect(e.output.payload.code).toBe(401);
      }
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
      jest
        .spyOn(ScopeSet, 'fromArray')
        .mockReturnValue({ contains: () => true });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('throws a bad request error when "newsletters" is missing', async () => {
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
      try {
        await runTest(route, request);
      } catch (e: any) {
        expect(e.output.payload.code).toBe(400);
        expect(e.output.payload.errno).toBe(MISSING_PARAMETER);
      }
    });

    it('throws a bad request error when "newsletters" is present but invalid', async () => {
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
      try {
        await runTest(route, request);
      } catch (e: any) {
        expect(e.output.payload.code).toBe(400);
        expect(e.output.payload.errno).toBe(INVALID_PARAMETER);
      }
    });
  });
});
