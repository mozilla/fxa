/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import api from '@opentelemetry/api';
import { suppressTracing } from '@opentelemetry/core';
import { ILogger } from '@fxa/shared/log';
import {
  TracingOpts,
  checkSampleRate,
  checkServiceName,
  logType,
} from './config';
import {
  NodeTracerProvider,
  TraceIdRatioBasedSampler,
  ParentBasedSampler,
  SpanProcessor,
  BatchSpanProcessor,
  SimpleSpanProcessor,
  SpanExporter,
} from '@opentelemetry/sdk-trace-node';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { getConsoleTraceExporter } from './exporters/fxa-console';
import { getGcpTraceExporter } from './exporters/fxa-gcp';
import { getOtlpTraceExporter } from './exporters/fxa-otlp';
import { createPiiFilter } from './pii-filters';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { registerInstrumentations } from '@opentelemetry/instrumentation';

export const TRACER_NAME = 'fxa';

/**
 * Responsible for initializing node tracing from a config object. This uses the auto instrumentation feature
 * which tries to add as much instrumentation as possible. See the 'supported instrumentations section at
 * https://www.npmjs.com/package/@opentelemetry/auto-instrumentations-node for more info.
 */
export class NodeTracingInitializer {
  protected provider: NodeTracerProvider;

  constructor(
    protected readonly opts: TracingOpts,
    protected readonly logger?: ILogger
  ) {
    // Error out if certain options are invalid
    checkServiceName(this.opts);
    checkSampleRate(this.opts);

    const filter = createPiiFilter(!!this.opts?.filterPii, this.logger);

    // create spanProcessors and filter undefined ones.
    const spanProcessors = [
      this.makeSpanProcessor(
        getOtlpTraceExporter(this.opts, undefined, filter)
      ),
      this.makeSpanProcessor(getGcpTraceExporter(this.opts, filter)),
      this.makeSpanProcessor(getConsoleTraceExporter(this.opts, filter)),
      // add more exporters here
    ].filter((x) => x !== undefined);

    // If we ever want to implement webTracing again we can update this
    // to be agnostic enough to support both web and node tracing; they
    // both take the same options.
    this.provider = new NodeTracerProvider({
      sampler: new ParentBasedSampler({
        root: new TraceIdRatioBasedSampler(this.opts.sampleRate),
      }),
      resource: resourceFromAttributes({
        [ATTR_SERVICE_NAME]: this.opts.serviceName,
      }),
      spanProcessors,
    });

    this.register();
  }

  /**
   * Creates a new span processor for the exporter.
   * @param exporter
   * @returns
   */
  private makeSpanProcessor = (
    exporter: SpanExporter | undefined
  ): SpanProcessor | undefined => {
    if (!exporter) {
      return undefined;
    }
    return this.opts.batchProcessor
      ? new BatchSpanProcessor(exporter)
      : new SimpleSpanProcessor(exporter);
  };

  protected register() {
    registerInstrumentations({
      instrumentations: [
        // ...extraInstrumentations,
        getNodeAutoInstrumentations({
          // These instrumentations added a lot of unnecessary noise
          '@opentelemetry/instrumentation-dns': {
            enabled: false,
          },
          '@opentelemetry/instrumentation-net': {
            enabled: false,
          },
          '@opentelemetry/instrumentation-fs': {
            enabled: false,
          },
          '@opentelemetry/instrumentation-aws-lambda': {
            enabled: false,
          },
        }),
      ],
    });
    this.provider.register();
  }

  public startSpan(name: string, action: () => void) {
    return this.provider.getTracer(TRACER_NAME).startActiveSpan(name, action);
  }

  /** Gets current traceId */
  public getTraceId() {
    const currentSpan = api.trace.getSpan(api.context.active());
    if (currentSpan) {
      return currentSpan.spanContext().traceId;
    }
    return null;
  }

  public getTraceParentId() {
    const tracer = this.provider.getTracer(TRACER_NAME);
    const span = tracer.startSpan('client-inject');
    const version = '00';
    const spanContext = span.spanContext();
    let sampleDecision = '00';
    if (Math.random() <= this.opts.sampleRate) {
      sampleDecision = '01';
    }
    const parentId = `${version}-${spanContext.traceId}-${spanContext.spanId}-${sampleDecision}`;
    span.end();
    return parentId;
  }

  public getProvider() {
    return this.provider;
  }
}

/** Singleton */
let nodeTracing: NodeTracingInitializer | undefined;

/** Gets active trace parent id */
export function getTraceParentId() {
  if (nodeTracing == null) {
    return '00-0-0-00';
  }
  return nodeTracing.getTraceParentId();
}

let initialized = false;

/** Initializes and manages tracing in node context */
export function initTracing(opts: TracingOpts, logger: ILogger) {
  if (initialized) {
    logger.warn(logType, { msg: 'Tracing already initialized!' });
    return;
  }
  initialized = true;

  if (nodeTracing != null) {
    logger.debug(logType, {
      msg: 'Trace initialization skipped. Tracing already initialized, ignoring new opts.',
    });
    return nodeTracing;
  }

  if (!opts.otel?.enabled && !opts.gcp?.enabled && !opts.console?.enabled) {
    logger.debug(logType, {
      msg: 'Trace initialization skipped. No exporters configured. Enable gcp, otel or console to activate tracing.',
    });
    return;
  }

  try {
    nodeTracing = new NodeTracingInitializer(opts, logger);
    logger.info(logType, { msg: 'Trace initialized succeeded!' });
  } catch (err) {
    logger.error(logType, {
      msg: `Trace initialization failed: ${err.message}`,
    });
  }
  return nodeTracing;
}

/** Get the current instance of the node tracing provider. */
export function getCurrent() {
  return nodeTracing;
}

/** Indicates that tracing has been initialized. */
export function isInitialized() {
  return !!nodeTracing;
}

/** Suppresses trace capture on the current context */
export function suppressTrace(action: () => any) {
  const currentCtx = api.context.active();
  return api.context.with(suppressTracing(currentCtx), action);
}

/** Resets the current tracing instance. Use only for testing purposes. */
export function reset() {
  nodeTracing = undefined;
  initialized = false;
}

/**
 * Shuts down the tracing provider and all span processors. Use only for testing purposes.
 */
export async function shutdownTracing() {
  if (nodeTracing) {
    await nodeTracing.getProvider().shutdown();
  }
}
