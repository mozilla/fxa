/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ROOT_CONTEXT, Span } from '@opentelemetry/api';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { BasicTracerProvider } from '@opentelemetry/sdk-trace-base';

import { ILogger } from '../log';
import { checkClientName, checkSampleRate, TracingOpts } from './config';
import { addConsoleExporter } from './exporters/fxa-console';
import {
  addOtlpTraceExporter,
  FxaOtlpTracingHeaders,
} from './exporters/fxa-otlp';
import { createPiiFilter } from './pii-filters';
import { createWebProvider } from './providers/web-provider';

export const log_type = 'browser-tracing';

/**
 * Responsible for initializing browser tracing from a config object.
 */
export class BrowserTracing {
  /** The wrapped provider */
  public provider: BasicTracerProvider;

  /** The wrapped provider */
  public get name() {
    return this.opts.clientName;
  }

  constructor(
    public readonly opts: TracingOpts,
    protected readonly headers?: FxaOtlpTracingHeaders,
    protected readonly logger?: ILogger
  ) {
    // Make sure config has valid options
    checkClientName(opts);
    checkSampleRate(opts);

    const provider = createWebProvider(opts);
    this.provider = provider;

    const filter = createPiiFilter(opts.filterPii, this.logger);
    addConsoleExporter(opts, provider, filter);
    addOtlpTraceExporter(opts, provider, headers, filter);
    this.register();
  }

  public addFlowId(span: Span) {
    if (this.headers?.flowid) {
      span.setAttribute('flow.id', this.headers?.flowid);
    }
  }

  protected register() {
    // Instruct on which cors request to capture.
    const propagateTraceHeaderCorsUrls = new RegExp(
      this.opts?.corsUrls || '.*'
    );

    registerInstrumentations({
      instrumentations: [
        // new DocumentLoadInstrumentation(),
        new XMLHttpRequestInstrumentation({
          propagateTraceHeaderCorsUrls,
          clearTimingResources: true,
          applyCustomAttributesOnSpan: (span: Span, xhr: XMLHttpRequest) => {
            this.addFlowId(span);
          },
        }),
        new FetchInstrumentation({
          propagateTraceHeaderCorsUrls,
          clearTimingResources: true,
          ignoreNetworkEvents: true,
          applyCustomAttributesOnSpan: (span: Span) => {
            this.addFlowId(span);
          },
        }),
      ],
    });

    // Changing default contextManager to use ZoneContextManager - supports asynchronous operations - optional
    const contextManager = new ZoneContextManager();

    // Should parse parenttrace and trace state headers
    const propagator = new W3CTraceContextPropagator();

    this.provider.register({
      contextManager,
      propagator,
    });
  }

  public startSpan(name: string, action?: () => void) {
    if (action) {
      this.provider.getTracer(this.name).startActiveSpan(name, action);
      return;
    } else {
      return this.provider
        .getTracer(this.name)
        .startSpan(name, undefined, ROOT_CONTEXT);
    }
  }
}

/** Main tracing instance. Acts like a singleton. */
let browserTracing: BrowserTracing | undefined;

/** Initializes web tracing. This can only be invoked once. */
export function init(
  opts: TracingOpts,
  headers: FxaOtlpTracingHeaders,
  logger: ILogger
) {
  if (browserTracing != null) {
    logger.debug(log_type, {
      msg: 'Trace initialization skipped. Tracing already initialized, ignoring new opts.',
    });
    return browserTracing;
  }

  if (opts.gcp?.enabled) {
    logger.debug(log_type, {
      msg: 'Gcp tracing enabled, but is not supported for a browser context.',
    });
  }

  if (!opts.otel?.enabled && !opts.console?.enabled) {
    logger.debug(log_type, {
      msg: 'Trace initialization skipped. No exporters configured. Enable otel or console to activate tracing.',
    });
    return;
  }

  try {
    browserTracing = new BrowserTracing(opts, headers, logger);
    logger.info(log_type, { msg: 'Trace initialized succeeded!' });
  } catch (err) {
    logger.error(log_type, {
      msg: `Trace initialization failed: ${err.message}`,
    });
  }

  return browserTracing;
}

/** Gets the current tracing instance. */
export function getCurrent() {
  return browserTracing;
}

/** Resets the current tracing instance. Use only for testing purposes. */
export function reset() {
  browserTracing = undefined;
}

export function getTracingHeadersFromDocument(document: Document) {
  const getAttr = (selector: string, attrName: string) => {
    const el = document && document.querySelector(selector);
    return el && el.getAttribute(attrName);
  };

  return {
    flowid: getAttr('body', 'data-flow-id') || '',
    traceparent: getAttr('meta[name="traceparent"]', 'content') || '00-0-0-00',
    tracestate: getAttr('meta[name="tracestate"]', 'content') || '',
  };
}
