/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  TraceExporter as GcpTraceExporter,
  TraceExporterOptions as GcpTraceExporterOptions,
} from '@google-cloud/opentelemetry-cloud-trace-exporter';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { ExportResult } from '@opentelemetry/core';
import {
  ExporterConfig as JaegerExporterConfig,
  JaegerExporter,
} from '@opentelemetry/exporter-jaeger';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { Resource } from '@opentelemetry/resources';

import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
  ParentBasedSampler,
  ReadableSpan,
  SimpleSpanProcessor,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import api from '@opentelemetry/api';

import { ILogger } from '../log';
import { TracingOpts } from './config';
import { TracingPiiFilter } from './pii-filters';

const log_type = 'node-tracing';

/**
 * Overloaded GcpTraceExporter that removes PII from traces.
 */
export class FxaGcpTraceExporter extends GcpTraceExporter {
  constructor(
    protected readonly filter?: TracingPiiFilter,
    config?: GcpTraceExporterOptions
  ) {
    super(config);
  }

  override export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ) {
    if (this.filter) {
      spans.forEach((x) => this.filter?.filter(x));
    }
    return super.export(spans, resultCallback);
  }
}

/**
 * Overloaded JaegerExporter that removes PII from traces.
 */
export class FxaJaegerTraceExporter extends JaegerExporter {
  constructor(
    protected readonly filter?: TracingPiiFilter,
    config?: JaegerExporterConfig
  ) {
    super(config);
  }

  override export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ) {
    if (this.filter) {
      spans.forEach((x) => this.filter?.filter(x));
    }
    return super.export(spans, resultCallback);
  }
}

/**
 * Responsible for initializing node tracing from a config object. This uses the auto instrumentation feature
 * which tries to add as much instrumentation as possible. See the 'supported instrumentations section at
 * https://www.npmjs.com/package/@opentelemetry/auto-instrumentations-node for more info.
 */
export class NodeTracingInitializer {
  protected provider: NodeTracerProvider;
  protected piiFilter: TracingPiiFilter;

  constructor(
    protected readonly opts: TracingOpts,
    protected readonly logger?: ILogger
  ) {
    this.piiFilter = new TracingPiiFilter(this.logger);
    this.provider = this.initProvider();
    this.init();
  }

  /**
   * The main initialization routine.
   */
  public init() {
    this.initInstrumentations();
    this.initConsole();
    this.initJaeger();
    this.initGcp();
  }

  protected initProvider() {
    if (!this.opts.serviceName) {
      throw new Error('Missing config. serviceName must be defined!');
    }

    if (
      this.opts.sampleRate == null ||
      this.opts.sampleRate < 0 ||
      this.opts.sampleRate > 1
    ) {
      throw new Error(
        `Invalid config. sampleRate must be a number between 0 and 1, but was ${this.opts.sampleRate}.`
      );
    }

    const provider = new NodeTracerProvider({
      sampler: new ParentBasedSampler({
        root: new TraceIdRatioBasedSampler(this.opts.sampleRate),
      }),
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: this.opts.serviceName,
      }),
    });
    provider.register();
    return provider;
  }

  protected initInstrumentations() {
    registerInstrumentations({
      instrumentations: [
        getNodeAutoInstrumentations({
          // These instrumentations added a lot of unnecessary noise
          '@opentelemetry/instrumentation-dns': {
            enabled: false,
          },
          '@opentelemetry/instrumentation-net': {
            enabled: false,
          },
        }),
      ],
    });
  }

  protected initConsole() {
    if (!this.opts.console?.enabled) {
      this.logger?.info(log_type, { msg: 'console not enabled' });
      return;
    }
    const exporter = new ConsoleSpanExporter();
    this.provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
    this.provider.register();
    this.logger?.info(log_type, { msg: 'console enabled' });
  }

  protected initJaeger() {
    const opts = this.opts.jaeger;

    if (!opts?.enabled) {
      this.logger?.info(log_type, { msg: 'jaeger not enabled' });
      return;
    }
    this.logger?.info(log_type, {
      msg: 'Initializing trace exports to jaeger.',
      ...opts,
    });

    const options = {
      endpoint: 'http://localhost:14268/api/traces',
    };
    const exporter = opts.filterPii
      ? new FxaJaegerTraceExporter(this.piiFilter)
      : new FxaJaegerTraceExporter();

    const processor = new SimpleSpanProcessor(exporter);
    this.provider.addSpanProcessor(processor);
    this.provider.register();
    this.logger?.info(log_type, { msg: 'jaeger enabled' });
  }

  protected initGcp() {
    const opts = this.opts?.gcp;

    if (!opts?.enabled) {
      this.logger?.info(log_type, { msg: 'gcp not enabled' });
      return;
    }
    this.logger?.info(log_type, {
      msg: 'Initializing trace exports to gcp.',
      ...opts,
    });

    const exporter = opts.filterPii
      ? new FxaGcpTraceExporter(this.piiFilter)
      : new FxaGcpTraceExporter();

    const processor = new BatchSpanProcessor(exporter);
    this.provider.addSpanProcessor(processor);
    this.provider.register();
    this.logger?.info(log_type, { msg: 'gcp enabled' });
  }

  protected getTraceId() {
    const currentSpan = api.trace.getSpan(api.context.active());
    if (currentSpan) {
      return currentSpan.spanContext().traceId;
    }
    return null;
  }
}

export let nodeTracing: NodeTracingInitializer;
export function init(opts: TracingOpts, logger?: ILogger) {
  logger?.info(log_type, { msg: 'Initializing node tracing.' });

  if (nodeTracing != null) {
    logger?.warn(log_type, {
      msg: 'Trace initialization skipped. Tracing already initialized.',
    });
    return;
  }

  if (
    opts.console?.enabled !== true &&
    opts.gcp?.enabled !== true &&
    opts.jaeger?.enabled !== true
  ) {
    logger?.debug(log_type, {
      msg: 'Trace initialization skipped. No exporters configured. Enable, gcp, jeager, or console to activate tracing.',
    });
    return;
  }

  try {
    nodeTracing = new NodeTracingInitializer(opts, logger);
    logger?.info(log_type, { msg: 'Trace initialized succeeded!' });
  } catch (err) {
    logger?.error(log_type, {
      msg: `Trace initialization failed: ${err.message}`,
    });
  }
}
