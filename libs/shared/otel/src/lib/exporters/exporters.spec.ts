/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TraceExporter as GcpTraceExporter } from '@google-cloud/opentelemetry-cloud-trace-exporter';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import {
  ConsoleSpanExporter,
  ReadableSpan,
} from '@opentelemetry/sdk-trace-node';
import { TracingOpts } from '../config';
import { TracingPiiFilter } from '../pii-filters';
import { FxaConsoleSpanExporter, getConsoleTraceExporter } from './fxa-console';
import { FxaGcpTraceExporter, getGcpTraceExporter } from './fxa-gcp';
import { FxaOtlpTraceExporter, getOtlpTraceExporter } from './fxa-otlp';
import { checkDuration } from './util';

describe('tracing exporters', () => {
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
      expect(getConsoleTraceExporter(opts)).toBeDefined();
    });

    it('gets gcp exporter', () => {
      expect(getGcpTraceExporter(opts)).toBeDefined();
    });

    it('gets otlp exporter', () => {
      expect(getOtlpTraceExporter(opts)).toBeDefined();
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
      expect(getConsoleTraceExporter(opts)).toBeUndefined();
    });

    it('does not get gcp exporter', () => {
      expect(getGcpTraceExporter(opts)).toBeUndefined();
    });

    it('does not get otlp exporter', () => {
      expect(getOtlpTraceExporter(opts)).toBeUndefined();
    });
  });

  describe.each([
    ['FxaGcpTraceExporter', FxaGcpTraceExporter, GcpTraceExporter],
    ['FxaOtlpTraceExporter', FxaOtlpTraceExporter, OTLPTraceExporter],
    ['FxaConsoleSpanExporter', FxaConsoleSpanExporter, ConsoleSpanExporter],
  ])('%s export scrubs pii', (_name, FxaExporter, ParentExporter) => {
    let parentExport: jest.SpyInstance;

    beforeEach(() => {
      // The parent export sends spans over the network or to stdout.
      parentExport = jest
        .spyOn(ParentExporter.prototype, 'export')
        .mockImplementation(() => undefined);
    });

    afterEach(() => {
      parentExport.mockRestore();
    });

    it.each([
      {
        key: 'db.query',
        value: `select * from test where email = 'test@example.com' or ip = '1.1.1.1' or uid = x'abcd1234abcd1234abcd1234abcd1234';`,
        expected: `select * from test where email = '[Filtered]' or ip = '[Filtered]' or uid = x'[Filtered]';`,
      },
      {
        key: 'db.statement',
        value: `Call deleteSessionToken_4(X'28d678b8d828ad79d6666877ae6c2919556a1bdaa1598efc264633203abbc279');`,
        expected: `Call deleteSessionToken_4(X'[Filtered]');`,
      },
      {
        key: 'http.route',
        value: `/v1/session/28d678b8d828ad79d6666877ae6c2919556a1bdaa1598efc264633203abbc279`,
        expected: `/v1/session/[Filtered]`,
      },
      {
        key: 'http.route',
        value: `/v1/find?email=test@example.com`,
        expected: `/v1/find?email=[Filtered]`,
      },
    ])('filters $key to $expected', ({ key, value, expected }) => {
      const span = {
        startTime: [0, 0],
        endTime: [0, 0],
        duration: [0, 0],
        attributes: { [key]: value },
      } as unknown as ReadableSpan;

      new FxaExporter(new TracingPiiFilter()).export([span], () => undefined);

      expect(parentExport).toHaveBeenCalledWith([span], expect.any(Function));
      expect(span.attributes[key]).toBe(expected);
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

      expect(span.duration[0]).toBe(0);
      expect(span.attributes['incorrect.duration']).toBe('true');
    });
  });
});
