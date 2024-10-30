/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ExportResult } from '@opentelemetry/core';
import {
  BasicTracerProvider,
  ConsoleSpanExporter,
  ReadableSpan,
} from '@opentelemetry/sdk-trace-node';
import { logType, TracingOpts } from '../config';
import { TracingPiiFilter } from '../pii-filters';
import { addExporter } from './exporters';
import { checkDuration } from './util';

/** Console Exporter exporter customized for FxA */
export class FxaConsoleSpanExporter extends ConsoleSpanExporter {
  constructor(protected readonly filter?: TracingPiiFilter) {
    super();
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

export function addConsoleExporter(
  opts: TracingOpts,
  provider: BasicTracerProvider,
  filter?: TracingPiiFilter,
  logger?: ILogger
) {
  if (!opts.console?.enabled) {
    return;
  }
  logger?.debug(logType, 'Adding Console Exporter');
  const exporter = new FxaConsoleSpanExporter(filter);
  addExporter(opts, provider, exporter);
  return exporter;
}
