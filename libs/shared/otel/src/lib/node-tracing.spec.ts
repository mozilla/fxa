/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  initTracing,
  reset,
  NodeTracingInitializer,
  isInitialized,
  shutdownTracing,
  TRACER_NAME,
} from './node-tracing';
import * as otelApi from '@opentelemetry/api';
import { logType, TracingOpts } from './config';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { checkServiceName, checkSampleRate } from './config';

jest.mock('./config', () => ({
  checkServiceName: jest.fn(),
  checkSampleRate: jest.fn(),
}));
jest.mock('./exporters/fxa-console', () => ({
  getConsoleTraceExporter: jest.fn(),
}));
jest.mock('./exporters/fxa-gcp', () => ({
  getGcpTraceExporter: jest.fn(),
}));
jest.mock('./exporters/fxa-otlp', () => ({
  getOtlpTraceExporter: jest.fn(),
}));
jest.mock('./pii-filters', () => ({
  createPiiFilter: jest.fn(() => jest.fn()),
}));

const defaultEnabledTracingOpts: TracingOpts = {
  otel: {
    enabled: true,
    concurrencyLimit: 1,
    url: 'http://localhost:0000',
  },
  gcp: {
    enabled: true,
  },
  batchProcessor: false,
  clientName: 'test',
  corsUrls: '',
  filterPii: false,
  sampleRate: 0,
  serviceName: 'test',
  console: {
    enabled: true,
  },
};

const defaultDisabledTracingOpts: TracingOpts = {
  ...defaultEnabledTracingOpts,
  otel: {
    enabled: false,
    concurrencyLimit: 1,
    url: 'http://localhost:0000',
  },
  gcp: {
    enabled: false,
  },
  console: {
    enabled: false,
  },
};

const mockLogger = {
  warn: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
};

describe('NodeTracingInitializer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should initialize with valid options', () => {
    const initializer = new NodeTracingInitializer(
      defaultEnabledTracingOpts,
      mockLogger
    );
    expect(initializer).toBeDefined();
  });

  it('should generate a valid trace parent ID', () => {
    const initializer = new NodeTracingInitializer(
      defaultEnabledTracingOpts,
      mockLogger
    );
    const parentId = initializer.getTraceParentId();

    expect(parentId).toMatch(/^00-[a-f0-9]{32}-[a-f0-9]{16}-(00|01)$/);
  });

  it('should call checkServiceName and checkSampleRate during initialization', () => {
    new NodeTracingInitializer(defaultEnabledTracingOpts, mockLogger);
    expect(checkServiceName).toHaveBeenCalledWith(defaultEnabledTracingOpts);
    expect(checkSampleRate).toHaveBeenCalledWith(defaultEnabledTracingOpts);
  });

  it('should register instrumentations', () => {
    const providerRegisterSpy = jest.spyOn(
      NodeTracerProvider.prototype,
      'register'
    );
    new NodeTracingInitializer(defaultEnabledTracingOpts, mockLogger);
    expect(providerRegisterSpy).toHaveBeenCalled();
  });

  it('should start a span with the given name', () => {
    const initializer = new NodeTracingInitializer(
      defaultEnabledTracingOpts,
      mockLogger
    );
    const tracerSpy = jest.spyOn(initializer['provider'], 'getTracer');
    const actionMock = jest.fn();

    initializer.startSpan('test-span', actionMock);

    expect(tracerSpy).toHaveBeenCalledWith(TRACER_NAME);
    expect(actionMock).toHaveBeenCalled();
  });

  it('should return the current traceId', () => {
    const mockSpan = {
      spanContext: jest.fn(() => ({ traceId: 'test-trace-id' })),
    };
    jest.spyOn(otelApi.trace, 'getSpan').mockReturnValue(mockSpan as any);
    jest.spyOn(otelApi.context, 'active').mockReturnValue({} as any);

    const initializer = new NodeTracingInitializer(
      defaultEnabledTracingOpts,
      mockLogger
    );
    const traceId = initializer.getTraceId();

    expect(traceId).toBe('test-trace-id');
  });

  it('should return undefined if no active span exists', () => {
    jest.spyOn(otelApi.trace, 'getSpan').mockReturnValue(undefined);

    const initializer = new NodeTracingInitializer(
      defaultEnabledTracingOpts,
      mockLogger
    );
    const traceId = initializer.getTraceId();

    expect(traceId).toBeNull();
  });
});

describe('initTracing', () => {
  // create a reference to the initTracing function for testing since module is mocked

  beforeEach(() => {
    jest.clearAllMocks();
    // use provided func to reset singleton instance
    reset();
  });

  afterEach(async () => {
    await shutdownTracing();
  });
  // positive cases
  it('initializes successfully with valid options', () => {
    const result = initTracing(defaultEnabledTracingOpts, mockLogger);

    expect(result).not.toBeUndefined();
  });
  it('returns the tracing instance', () => {
    const result = initTracing(defaultEnabledTracingOpts, mockLogger);

    expect(result).toBeInstanceOf(NodeTracingInitializer);
  });

  // negative cases
  it('returns undefined if tracing is already initialized', () => {
    expect(isInitialized()).toBe(false);

    initTracing(defaultEnabledTracingOpts, mockLogger);

    expect(isInitialized()).toBe(true);

    const secondInit = initTracing(defaultEnabledTracingOpts, mockLogger);

    expect(secondInit).toBeUndefined();
  });

  it('warns if tracing is already initialized', () => {
    initTracing(defaultEnabledTracingOpts, mockLogger);
    initTracing(defaultEnabledTracingOpts, mockLogger);
    expect(mockLogger.warn).toHaveBeenCalledWith(logType, {
      msg: 'Tracing already initialized!',
    });
  });

  it('returns undefined if no exports are enabled', () => {
    const result = initTracing(defaultDisabledTracingOpts, mockLogger);

    expect(result).toBeUndefined();
    expect(mockLogger.debug).toHaveBeenCalledWith(logType, {
      msg: 'Trace initialization skipped. No exporters configured. Enable gcp, otel or console to activate tracing.',
    });
  });

  const exporterKeys = ['gcp', 'otel', 'console'];
  it.each(exporterKeys)(
    'it initializes tracing with %s enabled',
    (enabledKey) => {
      const enableOverwrittenTracingOpts: TracingOpts = {
        ...defaultDisabledTracingOpts,
        [enabledKey]: {
          enabled: true,
          concurrencyLimit: 1,
          url: 'http://localhost:0000',
        },
      };

      const result = initTracing(enableOverwrittenTracingOpts, mockLogger);

      expect(result).not.toBeUndefined();
    }
  );

  it('logs an error if initialization fails', () => {
    // because this is mocked above for other tests we need to override it
    // and force the error, which then bubbles up.
    (checkServiceName as jest.Mock).mockImplementation(() => {
      throw new Error('Missing config. serviceName must be defined!');
    });
    const opts: TracingOpts = { ...defaultEnabledTracingOpts, serviceName: '' };

    initTracing(opts, mockLogger);

    expect(mockLogger.error).toHaveBeenCalledWith(logType, {
      msg: expect.stringContaining(
        'Trace initialization failed: Missing config. serviceName must be defined!'
      ),
    });
  });
});
