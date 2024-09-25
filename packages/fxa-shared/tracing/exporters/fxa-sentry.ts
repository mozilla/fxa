import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { TracingOpts } from '../config';
import { SentrySpanProcessor, SentryPropagator } from '@sentry/opentelemetry';
import { TracingPiiFilter } from '../pii-filters';
import { ILogger } from '../../log';

/**
 * Important must be called after calling Sentry.init()!
 * @returns object containing processor, propagator, context manager and sampler, needed to
 *          relay otel traces to sentry.
 */
export function addSentryTraceExporter(
  opts: TracingOpts,
  provider: NodeTracerProvider,
  _filter?: TracingPiiFilter,
  logger?: ILogger
) {
  if (!opts.sentry?.enabled) {
    return;
  }

  // TBD: We might need to create override classes for SentrySpanProcessor or SentryPropagator
  // in oder to filter out any potential PII in the context. Let's keep an eye on this, since
  // it's not 100% obvious if this will be needed until we see more data in sentry.

  logger?.debug('Adding Sentry Trace Exporter');

  // Note: Source for SentryPropagator can be found here:
  // https://github.com/getsentry/sentry-javascript/tree/master/packages/opentelemetry-node
  const spanProcessor = new SentrySpanProcessor();
  const propagator = new SentryPropagator();

  // Register sentry implementations
  provider.addSpanProcessor(spanProcessor);
  provider.register({
    propagator: propagator,
  });

  // Sentry doesn't have a 'true exporter' rather it piggy backs on the propagator, which
  // is close enough to an exporter...
  return propagator;
}
