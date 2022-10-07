/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as api from '@opentelemetry/api';
import { Span } from '@opentelemetry/api';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { expect } from 'chai';
import proxyquire from 'proxyquire';
import sinon from 'sinon';

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
    addGcpTraceExporter: sandbox.mock().callsFake(() => {}),
    addConsoleExporter: sandbox.mock().callsFake(() => {}),
    addOtlpTraceExporter: sandbox.mock().callsFake(() => {}),
  };

  // Proxy require exporters to prevent pulling in extra modules and to isolate tests.
  const { getCurrent, getTraceParentId, init, NodeTracingInitializer, reset } =
    proxyquire('../../tracing/node-tracing', {
      './exporters/fxa-console': {
        addConsoleExporter: mocks.addConsoleExporter,
      },
      './exporters/fxa-gcp': {
        addGcpTraceExporter: mocks.addGcpTraceExporter,
      },
      './exporters/fxa-otlp': {
        addOtlpTraceExporter: mocks.addOtlpTraceExporter,
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
      new NodeTracingInitializer({
        serviceName: '',
        sampleRate: 1,
      });
    }).to.throws('Missing config. serviceName must be defined!');
  });

  it('initializes', () => {
    new NodeTracingInitializer({
      serviceName: 'test',
      sampleRate: 1,
    });

    sinon.assert.calledOnce(mocks.addConsoleExporter);
    sinon.assert.calledOnce(mocks.addGcpTraceExporter);
    sinon.assert.calledOnce(mocks.addOtlpTraceExporter);
    sinon.assert.calledOnce(spies.register);
  });

  it('starts span', async () => {
    const tracing = new NodeTracingInitializer({
      serviceName: 'test',
      sampleRate: 1,
      console: {
        enabled: true,
      },
    });

    tracing.startSpan('test', (span: Span) => {
      expect(span.spanContext().traceId).to.exist;
    });
  });

  it('gets current trace id', () => {
    const tracing = new NodeTracingInitializer({
      serviceName: 'test',
      sampleRate: 1,
    });

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
      init(
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

  describe('init', () => {
    afterEach(() => {
      reset();
    });

    function callInit() {
      init(
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
      init(
        {
          serviceName: '',
          sampleRate: 1,
        },
        spies.logger
      );
      sinon.assert.calledWithMatch(spies.logger.debug, log_type, {
        msg: 'Trace initialization skipped. No exporters configured. Enable gcp, jeager or console to activate tracing.',
      });
    });

    it('skips initialization if serviceName is missing', () => {
      init(
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
        init(
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

    it('resets after init', () => {
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
});
