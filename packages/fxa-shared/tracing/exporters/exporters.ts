/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TracingOpts } from '../config';
import {
  NodeTracerProvider,
  BatchSpanProcessor,
  SimpleSpanProcessor,
  SpanExporter,
} from '@opentelemetry/sdk-trace-node';

export function addExporter(
  opts: TracingOpts,
  provider: NodeTracerProvider,
  exporter: SpanExporter
) {
  const processor = opts.batchProcessor
    ? new BatchSpanProcessor(exporter)
    : new SimpleSpanProcessor(exporter);
  provider.addSpanProcessor(processor);
  return processor;
}
