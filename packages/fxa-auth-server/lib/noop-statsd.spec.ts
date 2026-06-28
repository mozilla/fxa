/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { createNoopStatsd } = require('../lib/noop-statsd');

describe('createNoopStatsd', () => {
  it('implements methods used by auth-server metrics callers', () => {
    const statsd = createNoopStatsd();

    expect(() => {
      statsd.increment('test.increment');
      statsd.timing('test.timing', 1);
      statsd.histogram('test.histogram', 42);
      statsd.close();
    }).not.toThrow();
  });
});
