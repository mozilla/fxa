/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const getRoute = require('../../routes_helpers').getRoute;
const mocks = require('../../mocks');

let log, routes, route, request, response;

/**
 * Helper that sets up mocks, constructs the request, executes the handler,
 * and returns the handler’s response.
 */
function setup({
  countryCode, // e.g. 'US' | 'FR'
  feature = 'TEST_FEATURE',
  rules = { TEST_FEATURE: ['US', 'CA'] },
  geoMissing = false,
} = {}) {
  log = mocks.mockLog();

  const config = {
    geoEligibility: { rules },
  };

  const geoRoutes = require('../../../lib/routes/geo-location').default;
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
      assert.deepEqual(response, { eligible: true });
    });

    it('called log.begin correctly', () => {
      assert.equal(log.begin.callCount, 1);
      const [name, req] = log.begin.args[0];
      assert.equal(name, 'geo.eligibility.check');
      assert.equal(req, request);
    });

    it('logged the eligibility check', () => {
      assert.equal(log.info.callCount, 1);
      const [msg, details] = log.info.args[0];
      assert.equal(msg, 'geo.eligibility.checked');
      assert.equal(details.feature, 'TEST_FEATURE');
      assert.equal(details.country, 'US');
      assert.equal(details.eligible, true);
    });
  });

  describe('ineligible country', () => {
    beforeEach(async () => {
      response = await setup({ countryCode: 'FR' });
    });

    it('returns { eligible: false }', () => {
      assert.deepEqual(response, { eligible: false });
    });
  });

  describe('missing geo information', () => {
    beforeEach(async () => {
      response = await setup({ geoMissing: true });
    });

    it('returns { eligible: false } when country is unknown', () => {
      assert.deepEqual(response, { eligible: false });
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
      assert.equal(log.error.callCount, 1);
      const [msg, details] = log.error.args[0];
      assert.equal(msg, 'geo.eligibility.checkfailure');
      assert.equal(details.feature, 'UNKNOWN');
      assert.deepEqual(response, { eligible: false });
    });
  });
});
