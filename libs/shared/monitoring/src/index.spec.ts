/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { initTracing } from '@fxa/shared/otel';
import { initSentry } from '@fxa/shared/sentry-node';
import { initMonitoring } from './index';

jest.mock('@fxa/shared/otel', () => ({ initTracing: jest.fn() }));
jest.mock('@fxa/shared/sentry-node', () => ({ initSentry: jest.fn() }));

describe('shared-monitoring', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  it('initializes tracing and sentry when config contains them', () => {
    const log = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };
    const opts = {
      log,
      config: {
        sentry: { dsn: 'https://example.com' },
        tracing: {
          enabled: true,
          serviceName: 'test',
          batchSpanProcessor: true,
          clientName: 'test-client',
          corsUrls: 'http://localhost:\\d*/',
          filterPii: true,
          sampleRate: 1,
          batchProcessor: false,
        },
      },
    };

    initMonitoring(opts);

    expect(initTracing).toHaveBeenCalledWith(opts.config.tracing, log);
    expect(initSentry).toHaveBeenCalledWith(opts.config, log);
  });

  it('does not call tracing or sentry when not configured', () => {
    const log = {
      warn: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
    };
    const opts = { log, config: {} };

    initMonitoring(opts);

    expect(initTracing).not.toHaveBeenCalled();
    expect(initSentry).not.toHaveBeenCalled();
  });

  it('warns and skips when initialized more than once', () => {
    const log = {
      warn: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
    };
    const opts = {
      log,
      config: {
        sentry: { dsn: 'https://example.com' },
        tracing: {
          enabled: true,
          serviceName: 'test',
          batchSpanProcessor: true,
          clientName: 'test-client',
          corsUrls: 'http://localhost:\\d*/',
          filterPii: true,
          sampleRate: 1,
          batchProcessor: false,
        },
      },
    };

    initMonitoring(opts);
    initMonitoring(opts);

    expect(log.warn).toHaveBeenCalledWith(
      'monitoring',
      'Monitoring can only be initialized once'
    );
  });
});
