/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  BasicTracerProvider,
  BatchSpanProcessor,
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-node';
import { expect } from 'chai';
import { addConsoleExporter } from '../../tracing/exporters/fxa-console';
import { addGcpTraceExporter } from '../../tracing/exporters/fxa-gcp';
import { addOtlpTraceExporter } from '../../tracing/exporters/fxa-otlp';
import sinon from 'sinon';
import { TracingOpts } from '../../tracing/config';
import { addExporter } from '../../tracing/exporters/exporters';
import { checkDuration } from '../../tracing/exporters/util';

describe('tracing exports', () => {
  const sandbox = sinon.createSandbox();
  const provider = new BasicTracerProvider();
  const addSpanProcessorSpy = sandbox.spy(provider, 'addSpanProcessor');

  afterEach(() => {
    sandbox.reset();
  });

  describe('enables', () => {
    const opts: TracingOpts = {
      serviceName: 'test-service',
      clientName: 'test-client',
      sampleRate: 1,
      corsUrls: '.*',
      filterPii: true,
      batchProcessor: false,
      console: {
        enabled: true,
      },
      otel: {
        enabled: true,
        url: 'http://localhost:43180/v1/traces',
        concurrencyLimit: 10,
      },
      gcp: {
        enabled: true,
      },
      sentry: {
        enabled: true,
      },
    };

    it('creates console exporter', () => {
      expect(addConsoleExporter(opts, provider)).to.exist;
      sinon.assert.calledOnce(addSpanProcessorSpy);
    });

    it('creates gcp exporter', () => {
      expect(addGcpTraceExporter(opts, provider)).to.exist;
      sinon.assert.calledOnce(addSpanProcessorSpy);
    });

    it('creates otlp exporter', () => {
      expect(addOtlpTraceExporter(opts, provider)).to.exist;
      sinon.assert.calledOnce(addSpanProcessorSpy);
    });

    describe('exporter', () => {
      it('adds simple span processor', () => {
        const exporter = new ConsoleSpanExporter();
        const processor = addExporter(
          { ...opts, batchProcessor: false },
          provider,
          exporter
        );

        expect(processor instanceof SimpleSpanProcessor).to.be.true;
        sinon.assert.calledWith(addSpanProcessorSpy, processor);
      });

      it('adds batch span processor', () => {
        const exporter = new ConsoleSpanExporter();
        const processor = addExporter(
          { ...opts, batchProcessor: true },
          provider,
          exporter
        );

        expect(processor instanceof BatchSpanProcessor).to.be.true;
        sinon.assert.calledWith(addSpanProcessorSpy, processor);
      });
    });
  });

  describe('disables', () => {
    // Exporters not configured are effectively disabled
    const opts: TracingOpts = {
      serviceName: 'test-service',
      clientName: 'test-client',
      sampleRate: 1,
      corsUrls: '.*',
      batchProcessor: false,
      filterPii: false,
    };

    it('creates console exporter', () => {
      expect(addConsoleExporter(opts, provider)).to.not.exist;
      sinon.assert.notCalled(addSpanProcessorSpy);
    });

    it('creates gcp exporter', () => {
      expect(addGcpTraceExporter(opts, provider)).to.not.exist;
      sinon.assert.notCalled(addSpanProcessorSpy);
    });

    it('creates otlp exporter', () => {
      expect(addOtlpTraceExporter(opts, provider)).to.not.exist;
      sinon.assert.notCalled(addSpanProcessorSpy);
    });
  });

  describe('util', () => {
    it('prevents invalid durations', () => {
      const span = {
        startTime: [10, 0] as [number, number],
        endTime: [0, 0] as [number, number],
        duration: [-10, 0] as [number, number],
        attributes: {} as Record<string, string>,
      };
      checkDuration(span);

      expect(span.duration[0]).to.equal(0);
      expect(span.attributes['incorrect.duration']).to.equal('true');
    });
  });
});
