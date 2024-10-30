/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  TraceExporter as GcpTraceExporter,
  TraceExporterOptions as GcpTraceExporterOptions,
} from '@google-cloud/opentelemetry-cloud-trace-exporter';
import { ExportResult } from '@opentelemetry/core';
import {
  BasicTracerProvider,
  ReadableSpan,
} from '@opentelemetry/sdk-trace-node';
import { TracingOpts, logType } from '../config';
import { TracingPiiFilter } from '../pii-filters';
import { addExporter } from './exporters';
import { checkDuration } from './util';

/** Gcp exporter customized for FxA */

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
    spans.forEach((x) => {
      checkDuration(x);
      this.filter?.filter(x);
    });
    return super.export(spans, resultCallback);
  }
}

export function addGcpTraceExporter(
  opts: TracingOpts,
  provider: BasicTracerProvider,
  filter?: TracingPiiFilter,
  logger?: ILogger
) {
  if (!opts.gcp?.enabled) {
    return;
  }

  logger?.debug(logType, { msg: 'Adding Gcp Trace Exporter' });
  const exporter = new FxaGcpTraceExporter(filter);
  addExporter(opts, provider, exporter);
  return exporter;
}
