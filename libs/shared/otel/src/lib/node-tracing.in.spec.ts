/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { initTracing, reset, getCurrent } from './node-tracing';
import { TRACER_NAME } from './node-tracing';
import { TracingOpts } from './config';
import http from 'http';

describe('#integration - OTLP exporter integration test', () => {
  let receivedSpans: any[] = [];

  let server: http.Server;
  let port: number;

  beforeAll((done) => {
    server = http.createServer((req, res) => {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        try {
          // parse incoming payload and add it to receivedSpans
          // mock server just accepts any payload
          const parsed = JSON.parse(body);
          receivedSpans.push(parsed);
          res.writeHead(200);
          res.end();
        } catch (err) {
          res.writeHead(500);
          res.end();
        }
      });
    });

    server.listen(0, () => {
      port = (server.address() as any).port;
      done();
    });
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    receivedSpans = [];
    reset(); // reset global state
  });

  it('sends a span to the OTLP collector', async () => {
    const logger = console; // or mock logger
    const opts: TracingOpts = {
      otel: {
        enabled: true,
        url: `http://0.0.0.0:${port}/v1/traces`,
        concurrencyLimit: 1,
      },
      gcp: { enabled: false },
      console: { enabled: false },
      batchProcessor: false, // use SimpleSpanProcessor to flush immediately
      clientName: 'test',
      corsUrls: '',
      filterPii: false,
      sampleRate: 1,
      serviceName: 'test-service',
    };

    initTracing(opts, logger);
    const tracer = getCurrent()?.getProvider().getTracer(TRACER_NAME);

    tracer?.startActiveSpan('test-span', (span) => {
      span.setAttribute('test-attribute', 'test-value');
      span.addEvent('test-event', { key: 'value' });
      span.end();
    });

    // Poll for receivedSpans to have a length > 0, up to 1 second
    const start = Date.now();
    while (receivedSpans.length === 0 && Date.now() - start < 1000) {
      await new Promise((r) => setTimeout(r, 50));
    }

    expect(receivedSpans.length).toBeGreaterThan(0);
    const request = receivedSpans[0];

    expect(JSON.stringify(request)).toContain('test-span');
    expect(JSON.stringify(request)).toContain('test-service');
  });
});
