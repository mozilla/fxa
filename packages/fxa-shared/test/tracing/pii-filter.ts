/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  Attributes,
  HrTime,
  Link,
  SpanContext,
  SpanKind,
  SpanStatus,
} from '@opentelemetry/api';
import { InstrumentationScope } from '@opentelemetry/core';
import { Resource, resourceFromAttributes } from '@opentelemetry/resources';
import { ReadableSpan, TimedEvent } from '@opentelemetry/sdk-trace-base';
import { expect } from 'chai';
import sinon from 'sinon';
import { FxaGcpTraceExporter } from '../../tracing/exporters/fxa-gcp';
import { TracingPiiFilter } from '../../tracing/pii-filters';

describe('scrubs pii', () => {
  const sandbox = sinon.createSandbox();

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
    public readonly resource: Resource = resourceFromAttributes({});
    public readonly instrumentationLibrary: InstrumentationScope = {
      name: '',
    };

    constructor(attributes: Attributes) {
      this.attributes = attributes;
      this.resource = resourceFromAttributes(attributes);
    }
    parentSpanContext?: SpanContext | undefined;
    instrumentationScope: InstrumentationScope = {
      name: '',
      version: undefined,
    };
    public readonly droppedAttributesCount: number = 0;
    public readonly droppedEventsCount: number = 0;
    public readonly droppedLinksCount: number = 0;
  }

  afterEach(() => {
    sandbox.reset();
  });

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

    it('skips string payload', () => {
      const filter = new TracingPiiFilter();
      const spy = sandbox.spy(filter, 'applyFilters');
      filter.filter('foo');

      sinon.assert.notCalled(spy);
    });

    it('skips payload without attributes', () => {
      const filter = new TracingPiiFilter();
      const spy = sandbox.spy(filter, 'applyFilters');
      filter.filter({ foo: 'bar' });

      sinon.assert.notCalled(spy);
    });

    it('skips payload without relevant fields', () => {
      const filter = new TracingPiiFilter();
      const spy = sandbox.spy(filter, 'applyFilters');
      filter.filter({ attributes: { foo: 'bar' } });

      sinon.assert.notCalled(spy);
    });

    it('process payload with relevant fields', () => {
      const filter = new TracingPiiFilter();
      const spy = sandbox.spy(filter, 'applyFilters');
      filter.filter({ attributes: { 'db.foo': 'bar' } });

      sinon.assert.calledOnce(spy);
    });
  });
});
