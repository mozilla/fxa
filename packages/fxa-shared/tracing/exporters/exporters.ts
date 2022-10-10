/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  BasicTracerProvider,
  BatchSpanProcessor,
  SimpleSpanProcessor,
  SpanExporter,
} from '@opentelemetry/sdk-trace-base';
import { TracingOpts } from '../config';

export function addExporter(
  opts: TracingOpts,
  provider: BasicTracerProvider,
  exporter: SpanExporter
) {
  const processor = opts.batchProcessor
    ? new BatchSpanProcessor(exporter)
    : new SimpleSpanProcessor(exporter);
  provider.addSpanProcessor(processor);
  return processor;
}
