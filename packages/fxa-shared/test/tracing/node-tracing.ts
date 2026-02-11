/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as api from '@opentelemetry/api';
import { Span } from '@opentelemetry/api';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import {
  BatchSpanProcessor,
  NodeTracerProvider,
  SimpleSpanProcessor,
  SpanExporter,
} from '@opentelemetry/sdk-trace-node';
import { expect } from 'chai';
import proxyquire from 'proxyquire';
import sinon from 'sinon';
import { TracingOpts } from '../../tracing/config';
import { ILogger } from '../../../../libs/shared/log/src';

proxyquire.noCallThru();

describe('node-tracing', () => {
  const sandbox = sinon.createSandbox();
  const log_type = 'node-tracing';
  const contextManager = new AsyncHooksContextManager();

  // Make sure there is an active context manager
  api.context.setGlobalContextManager(contextManager);

  // Configure commonly used spies and mocks
  const spies: any = {
    register: sandbox.spy(NodeTracerProvider.prototype, 'register'),
    logger: {
      info: sandbox.spy(),
      trace: sandbox.spy(),
      warn: sandbox.spy(),
      error: sandbox.spy(),
      debug: sandbox.spy(),
    },
  };
  const mocks: any = {
    getGcpTraceExporter: sandbox.mock().callsFake(() => {}),
    getConsoleExporter: sandbox.mock().callsFake(() => {}),
    getOtlpTraceExporter: sandbox.mock().callsFake(() => {}),
  };

  // Proxy require exporters to prevent pulling in extra modules and to isolate tests.
  const {
    getCurrent,
    getTraceParentId,
    initTracing,
    NodeTracingInitializer,
    reset,
  } = proxyquire('../../tracing/node-tracing', {
    './exporters/fxa-console': {
      getConsoleTraceExporter: mocks.getConsoleExporter,
    },
    './exporters/fxa-gcp': {
      getGcpTraceExporter: mocks.getGcpTraceExporter,
    },
    './exporters/fxa-otlp': {
      getOtlpTraceExporter: mocks.getOtlpTraceExporter,
    },
  });

  afterEach(() => {
    sandbox.reset();
  });

  after(() => {
    sandbox.restore();
  });

  it('requires a service name', () => {
    expect(() => {
      new NodeTracingInitializer(
        {
          serviceName: '',
          sampleRate: 1,
        },
        () => {},
        spies.logger
      );
    }).to.throws('Missing config. serviceName must be defined!');
  });

  it('initializes', () => {
    new NodeTracingInitializer(
      {
        serviceName: 'test',
        sampleRate: 1,
      },
      spies.logger
    );

    sinon.assert.calledOnce(mocks.getConsoleExporter);
    sinon.assert.calledOnce(mocks.getGcpTraceExporter);
    sinon.assert.calledOnce(mocks.getOtlpTraceExporter);
  });

  it('starts span', async () => {
    const tracing = new NodeTracingInitializer(
      {
        serviceName: 'test',
        sampleRate: 1,
        console: {
          enabled: true,
        },
      },
      spies.logger
    );

    tracing.startSpan('test', (span: Span) => {
      expect(span.spanContext().traceId).to.exist;
    });
  });

  it('gets current trace id', () => {
    const tracing = new NodeTracingInitializer(
      {
        serviceName: 'test',
        sampleRate: 1,
      },
      spies.logger
    );

    let traceId: string;
    tracing.startSpan('test', (span: Span) => {
      traceId = tracing.getTraceId();
      expect(span.spanContext().traceId).to.equal(traceId);
    });
  });

  it('gets parent trace id when not initialized', () => {
    reset();
    expect(getTraceParentId()).to.equal('00-0-0-00');
  });

  describe('parent trace id', () => {
    it('gets parent trace id when initialized', () => {
      initTracing(
        {
          serviceName: 'test',
          sampleRate: 1,
          console: {
            enabled: true,
          },
        },
        spies.logger
      );
      expect(getTraceParentId()).to.exist;
      expect(getTraceParentId()).to.not.equal('00-0-0-00');
    });

    it('gets parent trace id when initialized', () => {
      reset();
      expect(getTraceParentId()).to.exist;
      expect(getTraceParentId()).to.equal('00-0-0-00');
    });
  });

  describe('initTracing', () => {
    afterEach(() => {
      reset();
    });

    function callInit() {
      initTracing(
        {
          serviceName: 'test',
          sampleRate: 1,
          console: {
            enabled: true,
          },
        },
        spies.logger
      );
    }

    it('skips initialization if all modes are disabled', () => {
      initTracing(
        {
          serviceName: '',
          sampleRate: 1,
        },
        spies.logger
      );
      sinon.assert.calledWithMatch(spies.logger.debug, log_type, {
        msg: 'Trace initialization skipped. No exporters configured. Enable gcp, otel or console to activate tracing.',
      });
    });

    it('skips initialization if serviceName is missing', () => {
      initTracing(
        {
          serviceName: '',
          sampleRate: 1,
          console: {
            enabled: true,
          },
        },
        spies.logger
      );
      sinon.assert.calledWithMatch(spies.logger.error, log_type, {
        msg: 'Trace initialization failed: Missing config. serviceName must be defined!',
      });
    });

    [null, -1, 2].forEach((sampleRate) => {
      it('skips initialization if sampleRate is ' + sampleRate, () => {
        initTracing(
          {
            serviceName: 'test',
            sampleRate: sampleRate,
            console: {
              enabled: true,
            },
          },
          spies.logger
        );
        sinon.assert.calledWithMatch(spies.logger.error, log_type, {
          msg: `Trace initialization failed: Invalid config. sampleRate must be a number between 0 and 1, but was ${sampleRate}.`,
        });
      });
    });

    it('initializes once', () => {
      callInit();
      expect(getCurrent()).to.exist;
      sinon.assert.calledWithMatch(spies.logger.info, log_type, {
        msg: 'Trace initialized succeeded!',
      });
    });

    it('resets after initTracing', () => {
      callInit();
      reset();
      expect(getCurrent()).to.not.exist;
    });

    it('warns of second initialization', () => {
      callInit();
      callInit();
      sinon.assert.calledWithMatch(spies.logger.debug, log_type, {
        msg: 'Trace initialization skipped. Tracing already initialized, ignoring new opts.',
      });
    });
  });

  /**
   * Because `makeSpanProcessor` is private, we create a subclass
   * to access it for testing.
   */
  class TestableNodeTracingInitializer extends NodeTracingInitializer {
    constructor(opts: TracingOpts, logger: ILogger) {
      super(opts, logger);
    }
    public testMakeSpanProcessor(exporter: SpanExporter | undefined) {
      return this.makeSpanProcessor(exporter);
    }
  }

  it('creates a BatchSpanProcessor when batchProcessor is true', () => {
    const opts: TracingOpts = {
      batchProcessor: true,
      sampleRate: 1,
      serviceName: 'test-service',
      clientName: 'test-client',
      corsUrls: '.*',
      filterPii: true,
    };
    const initializer = new TestableNodeTracingInitializer(opts, spies.logger);

    const exporter = { export: () => {}, shutdown: () => Promise.resolve() };
    const processor = initializer.testMakeSpanProcessor(exporter);

    expect(processor).to.be.instanceOf(BatchSpanProcessor);
  });

  it('creates a SimpleSpanProcessor when batchProcessor is false', () => {
    const opts: TracingOpts = {
      batchProcessor: false,
      sampleRate: 1,
      serviceName: 'test-service',
      clientName: 'test-client',
      corsUrls: '.*',
      filterPii: true,
    };
    const initializer = new TestableNodeTracingInitializer(opts, spies.logger);

    const exporter = { export: () => {}, shutdown: () => Promise.resolve() };
    const processor = initializer.testMakeSpanProcessor(exporter);

    expect(processor).to.be.instanceOf(SimpleSpanProcessor);
  });
});
