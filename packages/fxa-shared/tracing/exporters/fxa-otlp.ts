/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ExportResult } from '@opentelemetry/core';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPExporterConfigBase } from '@opentelemetry/otlp-exporter-base';
import {
  BasicTracerProvider,
  ReadableSpan,
} from '@opentelemetry/sdk-trace-base';
import { TracingOpts } from '../config';
import { TracingPiiFilter } from '../pii-filters';
import { addExporter } from './exporters';
import { checkDuration } from './util';

export type FxaOtlpTracingHeaders = {
  flowid?: string;
  traceparent?: string;
  tracestate?: string;
};

/** OTLP exporter customized for FxA */
export class FxaOtlpWebExporter extends OTLPTraceExporter {
  constructor(
    protected readonly filter?: TracingPiiFilter,
    config?: OTLPExporterConfigBase
  ) {
    super(config);
  }

  override export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ) {
    spans.forEach((x) => {
      checkDuration(x);
      this.filter?.filter(x);
    });
    super.export(spans, (result) => {
      resultCallback(result);
    });
  }
}

export function addOtlpTraceExporter(
  opts: TracingOpts,
  provider: BasicTracerProvider,
  headers?: FxaOtlpTracingHeaders,
  filter?: TracingPiiFilter
) {
  if (!opts.otel?.enabled) {
    return;
  }
  const config = {
    url: opts.otel?.url,
    headers,
    concurrencyLimit: opts.otel?.concurrencyLimit,
  };
  const exporter = new FxaOtlpWebExporter(filter, config);
  addExporter(opts, provider, exporter);
  return exporter;
}
