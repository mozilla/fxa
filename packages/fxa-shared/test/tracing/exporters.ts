/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
  NodeTracerProvider,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-node';
import { expect } from 'chai';
import { getConsoleTraceExporter } from '../../tracing/exporters/fxa-console';
import { getGcpTraceExporter } from '../../tracing/exporters/fxa-gcp';
import { getOtlpTraceExporter } from '../../tracing/exporters/fxa-otlp';
import sinon from 'sinon';
import { TracingOpts } from '../../tracing/config';
import { checkDuration } from '../../tracing/exporters/util';

describe('tracing exports', () => {
  const sandbox = sinon.createSandbox();
  const provider = new NodeTracerProvider();

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

    it('gets console exporter', () => {
      expect(getConsoleTraceExporter(opts)).to.exist;
    });

    it('gets gcp exporter', () => {
      expect(getGcpTraceExporter(opts)).to.exist;
    });

    it('gets otlp exporter', () => {
      expect(getOtlpTraceExporter(opts)).to.exist;
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

    it('does not get console exporter', () => {
      expect(getConsoleTraceExporter(opts)).to.not.exist;
    });

    it('does not get gcp exporter', () => {
      expect(getGcpTraceExporter(opts)).to.not.exist;
    });

    it('does not get otlp exporter', () => {
      expect(getOtlpTraceExporter(opts)).to.not.exist;
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
