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
