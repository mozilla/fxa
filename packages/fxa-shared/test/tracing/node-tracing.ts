/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Resource } from '@opentelemetry/resources';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { assert, expect } from 'chai';
import proxyquire from 'proxyquire';
import sinon from 'sinon';
proxyquire.noCallThru();

import { TraceExporter as GcpTraceExporter } from '@google-cloud/opentelemetry-cloud-trace-exporter';
import { InstrumentationScope } from '@opentelemetry/core';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
  ParentBasedSampler,
  ReadableSpan,
  SimpleSpanProcessor,
  SpanExporter,
  TimedEvent,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-base';

import {
  Attributes,
  HrTime,
  Link,
  SpanContext,
  SpanKind,
  SpanStatus,
} from '@opentelemetry/api';
import { FxaGcpTraceExporter } from '../../tracing/node-tracing';
import { TracingPiiFilter } from '../../tracing/pii-filters';

describe('node-tracing', () => {
  const sandbox = sinon.createSandbox();

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
    newJaegerExporter: sandbox.mock().returns(new JaegerExporter()),
    newSimpleSpanProcessor: sandbox.mock().callsFake((x: SpanExporter) => {
      return new SimpleSpanProcessor(x);
    }),
    newConsoleSpanExporter: sandbox.mock().returns(new ConsoleSpanExporter()),
    newBatchSpanProcessor: sandbox
      .mock()
      .callsFake((x: SpanExporter) => new BatchSpanProcessor(x)),
    newGcpTraceExporter: sandbox.mock().returns(new GcpTraceExporter()),
    newTraceIdRatioBasedSampler: sandbox
      .mock()
      .returns(new TraceIdRatioBasedSampler()),
    newParentBasedSampler: sandbox
      .mock()
      .callsFake((x: TraceIdRatioBasedSampler) => {
        return new ParentBasedSampler({
          root: x,
        });
      }),
  };

  const tracing = proxyquire('../../tracing/node-tracing', {
    '@opentelemetry/exporter-jaeger': {
      JaegerExporter: mocks.newJaegerExporter,
    },
    '@opentelemetry/sdk-trace-base': {
      BatchSpanProcessor: mocks.newBatchSpanProcessor,
      ConsoleSpanExporter: mocks.newConsoleSpanExporter,
      SimpleSpanProcessor: mocks.newSimpleSpanProcessor,
      ParentBasedSampler: mocks.newParentBasedSampler,
      TraceIdRatioBasedSampler: mocks.newTraceIdRatioBasedSampler,
    },
    '@google-cloud/opentelemetry-cloud-trace-exporter': {
      TraceExporter: mocks.newGcpTraceExporter,
    },
  });
  const { NodeTracingInitializer } = tracing;

  afterEach(() => {
    sandbox.reset();
  });

  after(() => {
    sandbox.restore();
  });

  it('requires a service name', () => {
    expect(() => {
      new tracing.NodeTracingInitializer({
        serviceName: '',
        sampleRate: 1,
      });
    }).to.throws('Missing config. serviceName must be defined!');
    const processor = tracing.provider?.getTracer;

    assert.isUndefined(processor);
  });

  it('enables initializes with no modes', () => {
    new NodeTracingInitializer({
      serviceName: 'test',
      sampleRate: 1,
    });

    sinon.assert.calledWith(mocks.newTraceIdRatioBasedSampler, 1);
    sinon.assert.calledOnce(mocks.newParentBasedSampler);
    sinon.assert.calledOnce(spies.register);
    sinon.assert.notCalled(mocks.newJaegerExporter);
    sinon.assert.notCalled(mocks.newGcpTraceExporter);
    sinon.assert.notCalled(mocks.newConsoleSpanExporter);
  });

  describe('console', () => {
    it('enables', () => {
      new NodeTracingInitializer(
        {
          serviceName: 'test',
          sampleRate: 1,
          console: {
            enabled: true,
          },
        },
        spies.logger
      );
      sinon.assert.calledOnce(mocks.newConsoleSpanExporter);
      sinon.assert.notCalled(mocks.newJaegerExporter);
      sinon.assert.notCalled(mocks.newGcpTraceExporter);
      assert.ok(spies.register.calledTwice);
    });
  });

  describe('jaeger', () => {
    it('enables', () => {
      new NodeTracingInitializer(
        {
          serviceName: 'test',
          sampleRate: 1,
          jaeger: {
            enabled: true,
          },
        },
        spies.logger
      );

      assert.ok(spies.register.calledTwice);
      sinon.assert.notCalled(mocks.newConsoleSpanExporter);
      sinon.assert.calledOnce(mocks.newJaegerExporter);
      sinon.assert.notCalled(mocks.newGcpTraceExporter);
    });
  });

  describe('gcp', () => {
    it('enables gcp logging', () => {
      new NodeTracingInitializer(
        {
          serviceName: 'test',
          sampleRate: 1,
          gcp: {
            enabled: true,
          },
        },
        spies.logger
      );

      assert.ok(spies.register.calledTwice);
      sinon.assert.notCalled(mocks.newConsoleSpanExporter);
      sinon.assert.notCalled(mocks.newJaegerExporter);
      sinon.assert.calledOnce(mocks.newBatchSpanProcessor);
      sinon.assert.calledOnce(mocks.newGcpTraceExporter);
    });
  });

  describe('init', () => {
    it('skips initialization if all modes are disabled', () => {
      tracing.init(
        {
          serviceName: '',
          sampleRate: 1,
        },
        spies.logger
      );
      sinon.assert.calledWith(spies.logger.debug, 'node-tracing', {
        msg: 'Trace initialization skipped. No exporters configured. Enable, gcp, jeager, or console to activate tracing.',
      });
    });

    it('skips initialization if serviceName is missing', () => {
      tracing.init(
        {
          serviceName: '',
          sampleRate: 1,
          console: {
            enabled: true,
          },
        },
        spies.logger
      );
      sinon.assert.calledWith(spies.logger.error, 'node-tracing', {
        msg: 'Trace initialization failed: Missing config. serviceName must be defined!',
      });
    });

    [null, -1, 2].forEach((sampleRate) => {
      it('skips initialization if sampleRate is ' + sampleRate, () => {
        tracing.init(
          {
            serviceName: 'test',
            sampleRate: sampleRate,
            console: {
              enabled: true,
            },
          },
          spies.logger
        );
        sinon.assert.calledWith(spies.logger.error, 'node-tracing', {
          msg: `Trace initialization failed: Invalid config. sampleRate must be a number between 0 and 1, but was ${sampleRate}.`,
        });
      });
    });

    it('initializes once', () => {
      tracing.init(
        {
          serviceName: 'test',
          sampleRate: 1,
          console: {
            enabled: true,
          },
        },
        spies.logger
      );

      sinon.assert.calledWith(spies.logger.info, 'node-tracing', {
        msg: 'Trace initialized succeeded!',
      });
    });

    it('warns of second initialization', () => {
      tracing.init(
        {
          serviceName: 'test',
          sampleRate: 1,
          console: {
            enabled: true,
          },
        },
        spies.logger
      );
      sinon.assert.calledWith(spies.logger.warn, 'node-tracing', {
        msg: 'Trace initialization skipped. Tracing already initialized.',
      });
    });
  });

  describe('scrubs pii', () => {
    // Dummy ReadableSpan for testing
    class FakeSpan implements ReadableSpan {
      public readonly name: string = 'test';
      public readonly kind: SpanKind = SpanKind.INTERNAL;
      public readonly spanContext: () => SpanContext = () => ({
        traceFlags: 0,
        traceId: '123',
        spanId: '123',
      });
      public readonly parentSpanId?: string = '123';
      public readonly startTime: HrTime = [0, 0];
      public readonly endTime: HrTime = [0, 0];
      public readonly status: SpanStatus = { code: 0 };
      public readonly attributes: Attributes;
      public readonly links: Link[] = [];
      public readonly events: TimedEvent[] = [];
      public readonly duration: HrTime = [0, 0];
      public readonly ended: boolean = true;
      public readonly resource: Resource = new Resource({});
      public readonly instrumentationLibrary: InstrumentationScope = {
        name: '',
      };

      constructor(attributes: Attributes) {
        this.attributes = attributes;
        this.resource = new Resource(attributes);
      }
    }

    describe('pii filters', () => {
      function check(key: string, val: string, mutation: string) {
        const filter = new TracingPiiFilter();
        const exporter = new FxaGcpTraceExporter(filter);
        const spans: ReadableSpan[] = [new FakeSpan({ [key]: val })];
        exporter.export(spans, () => {});
        expect(spans[0].attributes[key]).equals(mutation);
      }

      it('filters pii from typical db.query', () => {
        check(
          'db.query',
          `select * from test where email = 'test@mozilla.com' or ip = '1.1.1.1' or uid = x'abcd1234abcd1234abcd1234abcd1234';`,
          `select * from test where email = '[Filtered]' or ip = '[Filtered]' or uid = x'[Filtered]';`
        );
      });

      it('filters pii from typical db.statement call', () => {
        check(
          'db.statement',
          `Call deleteSessionToken_4(X'28d678b8d828ad79d6666877ae6c2919556a1bdaa1598efc264633203abbc279');`,
          `Call deleteSessionToken_4(X'[Filtered]');`
        );
      });

      it('filters pii from typical http url call', () => {
        check(
          'http.route',
          `/v1/session/28d678b8d828ad79d6666877ae6c2919556a1bdaa1598efc264633203abbc279`,
          `/v1/session/[Filtered]`
        );
      });

      it('filters pii from typical http url call', () => {
        check(
          'http.route',
          `/v1/find?email=test@mozilla.com`,
          `/v1/find?email=[Filtered]`
        );
      });
    });
  });
});
