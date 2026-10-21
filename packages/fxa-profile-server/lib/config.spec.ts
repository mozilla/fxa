/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

describe('config', () => {
  const loadConfig = () => {
    let conf: { get: (key: string) => unknown } | undefined;
    jest.isolateModules(() => {
      conf = require('./config');
    });
    return conf!;
  };

  const originalLimit = process.env.TRACING_OTEL_CONCURRENCY_LIMIT;

  beforeEach(() => {
    delete process.env.TRACING_OTEL_CONCURRENCY_LIMIT;
  });

  afterEach(() => {
    if (originalLimit === undefined) {
      delete process.env.TRACING_OTEL_CONCURRENCY_LIMIT;
    } else {
      process.env.TRACING_OTEL_CONCURRENCY_LIMIT = originalLimit;
    }
  });

  it('defaults tracing.otel.concurrencyLimit to 10', () => {
    expect(loadConfig().get('tracing.otel.concurrencyLimit')).toBe(10);
  });

  it('lets TRACING_OTEL_CONCURRENCY_LIMIT override the default', () => {
    process.env.TRACING_OTEL_CONCURRENCY_LIMIT = '25';
    expect(loadConfig().get('tracing.otel.concurrencyLimit')).toBe(25);
  });
});
