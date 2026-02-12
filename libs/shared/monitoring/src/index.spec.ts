import { initTracing } from '@fxa/shared/otel';
import { initSentry } from '@fxa/sentry-node';
import { initMonitoring } from '@fxa/shared/monitoring';

jest.mock('@fxa/shared/otel', () => ({ initTracing: jest.fn() }));
jest.mock('@fxa/sentry-node', () => ({ initSentry: jest.fn() }));

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
        tracing: { enabled: true, serviceName: 'test' },
      },
    };

    initMonitoring(opts);

    expect(initTracing).toHaveBeenCalledWith(opts.config.tracing, log);
    expect(initSentry).toHaveBeenCalledWith(opts.config, log);
  });

  it('does not call tracing or sentry when not configured', () => {
    const log = { warn: jest.fn() };
    const opts = { log, config: {} };

    initMonitoring(opts);

    expect(initTracing).not.toHaveBeenCalled();
    expect(initSentry).not.toHaveBeenCalled();
  });

  it('warns and skips when initialized more than once', () => {
    const log = { warn: jest.fn() };
    const opts = {
      log,
      config: {
        sentry: { dsn: 'https://example.com' },
        tracing: { enabled: true, serviceName: 'test' },
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
