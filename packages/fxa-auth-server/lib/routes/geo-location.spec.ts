/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mocks = require('../../test/mocks');
const { getRoute } = require('../../test/routes_helpers');

let log: any, routes: any, route: any, request: any, response: any;

/**
 * Helper that sets up mocks, constructs the request, executes the handler,
 * and returns the handler's response.
 */
function setup({
  countryCode,
  feature = 'TEST_FEATURE',
  rules = { TEST_FEATURE: ['US', 'CA'] },
  geoMissing = false,
}: {
  countryCode?: string;
  feature?: string;
  rules?: Record<string, string[]>;
  geoMissing?: boolean;
} = {}) {
  log = mocks.mockLog();

  const config = {
    geoEligibility: { rules },
  };

  const geoRoutes = require('./geo-location').default;
  routes = geoRoutes(config, log);
  route = getRoute(routes, '/geo/eligibility/{feature}', 'GET');

  request = mocks.mockRequest({
    params: { feature },
    app: {
      geo: geoMissing ? undefined : { location: { countryCode } },
    },
    credentials: { uid: 'uid123' },
    log,
  });

  return route.handler(request);
}

describe('GET /geo/eligibility/{feature}', () => {
  describe('eligible country', () => {
    beforeEach(async () => {
      response = await setup({ countryCode: 'US' });
    });

    it('returns { eligible: true }', () => {
      expect(response).toEqual({ eligible: true });
    });

    it('called log.begin correctly', () => {
      expect(log.begin).toHaveBeenCalledTimes(1);
      expect(log.begin).toHaveBeenNthCalledWith(
        1,
        'geo.eligibility.check',
        request
      );
    });

    it('logged the eligibility check', () => {
      expect(log.info).toHaveBeenCalledTimes(1);
      expect(log.info).toHaveBeenNthCalledWith(
        1,
        'geo.eligibility.checked',
        expect.objectContaining({
          feature: 'TEST_FEATURE',
          country: 'US',
          eligible: true,
        })
      );
    });
  });

  describe('ineligible country', () => {
    beforeEach(async () => {
      response = await setup({ countryCode: 'FR' });
    });

    it('returns { eligible: false }', () => {
      expect(response).toEqual({ eligible: false });
    });
  });

  describe('missing geo information', () => {
    beforeEach(async () => {
      response = await setup({ geoMissing: true });
    });

    it('returns { eligible: false } when country is unknown', () => {
      expect(response).toEqual({ eligible: false });
    });
  });

  describe('unknown feature', () => {
    beforeEach(async () => {
      response = await setup({
        feature: 'UNKNOWN',
        countryCode: 'US',
        rules: { TEST_FEATURE: ['US'] },
      });
    });

    it('logs error and returns false', () => {
      expect(log.error).toHaveBeenCalledTimes(1);
      expect(log.error).toHaveBeenNthCalledWith(
        1,
        'geo.eligibility.checkfailure',
        expect.objectContaining({ feature: 'UNKNOWN' })
      );
      expect(response).toEqual({ eligible: false });
    });
  });
});
