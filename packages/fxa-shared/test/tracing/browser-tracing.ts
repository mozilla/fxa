/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BasicTracerProvider } from '@opentelemetry/sdk-trace-base';
import { StackContextManager } from '@opentelemetry/sdk-trace-web';
import { assert, expect } from 'chai';
import proxyquire from 'proxyquire';
import sinon from 'sinon';
import jsdom from 'jsdom';

proxyquire.noCallThru();

describe('#unit - browser-tracing', () => {
  const sandbox = sinon.createSandbox();
  const provider = new BasicTracerProvider();
  const ctxMgr = new StackContextManager();

  const spies: any = {
    register: sandbox.spy(provider, 'register'),
    logger: {
      info: sandbox.spy(),
      trace: sandbox.spy(),
      warn: sandbox.spy(),
      error: sandbox.spy(),
      debug: sandbox.spy(),
    },
  };

  const mocks: any = {
    newZoneContextManager: sandbox.mock().callsFake(() => ctxMgr),
    newFetchInstrumentation: sandbox.mock().callsFake(() => {}),
    addConsoleExporter: sandbox.mock().callsFake(() => {}),
    addOtlpTraceExporter: sandbox.mock().callsFake(() => {}),
    addGcpTraceExporter: sandbox.mock().callsFake(() => {}),
  };

  const tracing = proxyquire('../../tracing/browser-tracing', {
    './providers/web-provider': {
      createWebProvider: () => {
        return provider;
      },
    },
    '@opentelemetry/context-zone': {
      ZoneContextManager: mocks.newZoneContextManager,
    },
    '@opentelemetry/instrumentation-fetch': {
      FetchInstrumentation: mocks.newFetchInstrumentation,
    },
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
  const { BrowserTracing, getCurrent, reset } = tracing;

  afterEach(() => {
    sandbox.reset();
  });

  after(() => {
    sandbox.restore();
  });

  it('requires a client name', () => {
    expect(() => {
      new BrowserTracing({
        clientName: '',
        sampleRate: 1,
      });
    }).to.throws('Missing config. clientName must be defined!');
    const processor = tracing.provider?.getTracer;

    assert.isUndefined(processor);
  });

  it('initializes', () => {
    new BrowserTracing({
      clientName: 'test',
      sampleRate: 1,
    });

    sinon.assert.calledOnce(mocks.addOtlpTraceExporter);
    sinon.assert.calledOnce(mocks.addConsoleExporter);
    sinon.assert.notCalled(mocks.addGcpTraceExporter);
    sinon.assert.calledOnce(spies.register);
  });

  it('adds flow id', () => {
    const tracing = new BrowserTracing(
      {
        clientName: 'test',
        sampleRate: 1,
        console: {
          enabled: true,
          filterPii: false,
        },
      },
      {
        flowid: '123',
      }
    );
    const span = tracing.startSpan('test');
    const spy = sandbox.spy(span, 'setAttribute');
    tracing.addFlowId(span);
    sinon.assert.calledWith(spy, 'flow.id', '123');
  });

  describe('init', () => {
    const log_type = 'browser-tracing';

    afterEach(() => {
      reset();
    });

    function init() {
      tracing.init(
        {
          clientName: 'test',
          sampleRate: 1,
          console: {
            enabled: true,
          },
        },
        '123',
        spies.logger
      );
    }

    it('skips initialization if all modes are disabled', () => {
      tracing.init(
        {
          clientName: '',
          sampleRate: 1,
        },
        '123',
        spies.logger
      );
      sinon.assert.calledWithMatch(spies.logger.debug, log_type, {
        msg: 'Trace initialization skipped. No exporters configured. Enable otel or console to activate tracing.',
      });
    });

    it('skips initialization if clientName is missing', () => {
      tracing.init(
        {
          clientName: '',
          sampleRate: 1,
          console: {
            enabled: true,
          },
        },
        '123',
        spies.logger
      );
      sinon.assert.calledWithMatch(spies.logger.error, log_type, {
        msg: 'Trace initialization failed: Missing config. clientName must be defined!',
      });
    });

    [null, -1, 2].forEach((sampleRate) => {
      it('skips initialization if sampleRate is ' + sampleRate, () => {
        tracing.init(
          {
            clientName: 'test',
            sampleRate: sampleRate,
            console: {
              enabled: true,
            },
          },
          '123',
          spies.logger
        );
        sinon.assert.calledWithMatch(spies.logger.error, 'browser-tracing', {
          msg: `Trace initialization failed: Invalid config. sampleRate must be a number between 0 and 1, but was ${sampleRate}.`,
        });
      });
    });

    it('initializes once', () => {
      init();
      expect(getCurrent()).to.exist;
      sinon.assert.calledWithMatch(spies.logger.info, 'browser-tracing', {
        msg: 'Trace initialized succeeded!',
      });
    });

    it('warns of second initialization', () => {
      init();
      init();
      sinon.assert.calledWithMatch(spies.logger.debug, 'browser-tracing', {
        msg: 'Trace initialization skipped. Tracing already initialized, ignoring new opts.',
      });
    });

    it('resets', () => {
      init();
      reset();
      expect(getCurrent()).to.not.exist;
    });

    it('gets tracing headers', () => {
      const html = `<html>
        <head>
          <meta name="traceparent" content="00-1-1-01" />
          <meta name="tracestate" content="state=1" />
        </head>
        <body data-flow-id="123"></body>
      </html>`;
      const document = new jsdom.JSDOM(html).window.document;
      const result = tracing.getTracingHeadersFromDocument(document);

      expect(result).to.exist;
      expect(result.traceparent).to.equal('00-1-1-01');
      expect(result.tracestate).to.equal('state=1');
      expect(result.flowid).to.equal('123');
    });
  });
});
