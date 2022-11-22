/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import api from '@opentelemetry/api';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { suppressTracing } from '@opentelemetry/core';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';

import { ILogger } from '../log';
import { checkSampleRate, checkServiceName, TracingOpts } from './config';
import { addConsoleExporter } from './exporters/fxa-console';
import { addGcpTraceExporter } from './exporters/fxa-gcp';
import { addOtlpTraceExporter } from './exporters/fxa-otlp';
import { createPiiFilter } from './pii-filters';
import { createNodeProvider } from './providers/node-provider';

const log_type = 'node-tracing';
const tracer_name = 'fxa-tracer';

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

    const provider = createNodeProvider(this.opts);
    this.provider = provider;

    const filter = createPiiFilter(!!this.opts?.filterPii, this.logger);
    addGcpTraceExporter(opts, provider, filter);
    addOtlpTraceExporter(opts, provider, undefined, filter);
    addConsoleExporter(opts, provider, filter);

    this.register();
  }

  protected register() {
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
          '@opentelemetry/instrumentation-express': {
            enabled: false,
            ignoreLayers: [
              // These two routes always produce bad timings... Maybe it's something to look into.
              //  'request handler - undefined',
              // 'request handler - /'
            ],
          },
        }),
      ],
    });
    this.provider.register();
  }

  public startSpan(name: string, action: () => void) {
    return this.provider.getTracer(tracer_name).startActiveSpan(name, action);
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
    const tracer = this.provider.getTracer('fxa');
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

/** Initializes tracing in node context */
export function init(opts: TracingOpts, logger: ILogger) {
  if (nodeTracing != null) {
    logger?.debug(log_type, {
      msg: 'Trace initialization skipped. Tracing already initialized, ignoring new opts.',
    });
    return nodeTracing;
  }

  if (!opts.otel?.enabled && !opts.gcp?.enabled && !opts.console?.enabled) {
    logger.debug(log_type, {
      msg: 'Trace initialization skipped. No exporters configured. Enable gcp, otel or console to activate tracing.',
    });
    return;
  }

  try {
    nodeTracing = new NodeTracingInitializer(opts, logger);
    logger.info(log_type, { msg: 'Trace initialized succeeded!' });
  } catch (err) {
    logger.error(log_type, {
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
}
