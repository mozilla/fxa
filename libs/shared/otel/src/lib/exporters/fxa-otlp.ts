/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ExportResult } from '@opentelemetry/core';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPExporterConfigBase } from '@opentelemetry/otlp-exporter-base';
import { ReadableSpan } from '@opentelemetry/sdk-trace-node';
import { TracingOpts, logType } from '../config';
import { TracingPiiFilter } from '../pii-filters';
import { checkDuration } from './util';
import { ILogger } from '@fxa/shared/log';

export type FxaOtlpTracingHeaders = {
  flowid?: string;
  traceparent?: string;
  tracestate?: string;
};

/** OTLP exporter customized for FxA */
export class FxaOtlpTraceExporter extends OTLPTraceExporter {
  constructor(
    protected readonly filter?: TracingPiiFilter,
    config?: OTLPExporterConfigBase,
    protected readonly logger?: ILogger
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
      if (result.error) {
        this.logger?.error(logType, result.error);
      }
      resultCallback(result);
    });
  }
}

export function getOtlpTraceExporter(
  opts: TracingOpts,
  headers?: FxaOtlpTracingHeaders,
  filter?: TracingPiiFilter,
  logger?: ILogger
) {
  if (!opts.otel?.enabled) {
    return;
  }

  logger?.debug(logType, {
    msg: 'Adding Otlp Trace Exporter ',
    url: opts.otel?.url,
  });
  const config = {
    url: opts.otel?.url,
    headers,
    concurrencyLimit: opts.otel?.concurrencyLimit,
  };
  const exporter = new FxaOtlpTraceExporter(filter, config, logger);
  return exporter;
}
