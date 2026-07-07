/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const getWaictCanary = require('./get-waict-canary');

describe('get-waict-canary route', () => {
  it('is a GET route served from the exported canary path', () => {
    const route = getWaictCanary();
    expect(route.method).toBe('get');
    expect(route.path).toBe(getWaictCanary.CANARY_PATH);
    expect(getWaictCanary.CANARY_PATH).toBe('/waict-canary.js');
  });

  it('serves an inert javascript body that is never cached', () => {
    const route = getWaictCanary();
    const res = {
      setHeader: jest.fn(),
      type: jest.fn(),
      send: jest.fn(),
    };

    route.process({}, res);

    // no-store guarantees every page load re-fetches and re-checks the canary.
    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store');
    expect(res.type).toHaveBeenCalledWith('application/javascript');
    expect(res.send).toHaveBeenCalledTimes(1);
    // The body is a harmless no-op comment; assert it is a non-empty string.
    const body = res.send.mock.calls[0][0];
    expect(typeof body).toBe('string');
    expect(body.length).toBeGreaterThan(0);
  });
});
