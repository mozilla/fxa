/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const routes = require('./index');
const mockNavTiming = jest.fn();
jest.mock('./post-metrics', () => ({}));
jest.mock('./navigation-timing', () => mockNavTiming);

const geolocate = {};
const UAParser = {};
const statsd = {};

describe('Route dependencies', () => {
  test('navigation-timing should receive the correct dependencies', () => {
    routes(geolocate, UAParser, statsd);
    expect(mockNavTiming).toHaveBeenCalledTimes(1);
    expect(mockNavTiming).toHaveBeenCalledWith(geolocate, UAParser, statsd);
  });
});
