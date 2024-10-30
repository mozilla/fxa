/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export const logType = 'fxa-otel';
/**
 * Options for configuring tracing.
 */
export type TracingOpts = {
  batchProcessor: boolean;
  clientName: string;
  corsUrls: string;
  filterPii: boolean;
  sampleRate: number;
  serviceName: string;

  console?: {
    enabled: boolean;
  };
  gcp?: {
    enabled: boolean;
  };
  otel?: {
    enabled: boolean;
    url: string;
    concurrencyLimit: number;
  };
};

/** Default convict config for node tracing */
export const tracingConfig = {
  clientName: {
    default: '',
    doc: 'The name of client being traced.',
    env: 'TRACING_CLIENT_NAME',
    format: String,
  },
  batchProcessor: {
    default: true,
    doc: 'Indicates if batch processing should be used. Batch processing is better for production environments.',
    env: 'TRACING_BATCH_PROCESSING',
    format: Boolean,
  },
  corsUrls: {
    default: 'http://localhost:\\d*/',
    doc: 'A regex to allow tracing of cors requests',
    env: 'TRACING_CORS_URLS',
    format: String,
  },
  filterPii: {
    default: true,
    doc: 'Enables filtering PII in Console traces.',
    env: 'TRACING_FILTER_PII',
    format: Boolean,
  },
  sampleRate: {
    default: 0,
    doc: 'A number between 0 and 1 that indicates the rate at which to sample. 1 will capture all traces. .5 would capture half the traces, and 0 would capture no traces.',
    env: 'TRACING_SAMPLE_RATE',
    format: Number,
  },
  serviceName: {
    default: '',
    doc: 'The name of service being traced.',
    env: 'TRACING_SERVICE_NAME',
    format: String,
  },
  console: {
    enabled: {
      default: false,
      doc: 'Trace report to the console',
      env: 'TRACING_CONSOLE_EXPORTER_ENABLED',
      format: Boolean,
    },
  },
  gcp: {
    enabled: {
      default: false,
      doc: 'Traces report to google cloud tracing. This should be turned on in the wild, but is discouraged for local development.',
      env: 'TRACING_GCP_EXPORTER_ENABLED',
      format: Boolean,
    },
  },
  otel: {
    enabled: {
      default: false,
      doc: 'Traces report to the otel. This is only applicable for local development.',
      env: 'TRACING_OTEL_EXPORTER_ENABLED',
      format: Boolean,
    },
    url: {
      default: 'http://localhost:4318/v1/traces',
      doc: 'Open telemetry collector url',
      env: 'TRACING_OTEL_URL',
      format: String,
    },
    concurrencyLimit: {
      default: 100,
      doc: 'Max amount of concurrency',
      env: 'TRACING_OTEL_CONCURRENCY_LIMIT',
      format: Number,
    },
  },
};

export function checkServiceName(opts: Pick<TracingOpts, 'serviceName'>) {
  if (!opts.serviceName) {
    throw new Error('Missing config. serviceName must be defined!');
  }
}

export function checkSampleRate(opts: Pick<TracingOpts, 'sampleRate'>) {
  if (
    opts.sampleRate == null ||
    Number.isNaN(opts.sampleRate) ||
    opts.sampleRate < 0 ||
    opts.sampleRate > 1
  ) {
    throw new Error(
      `Invalid config. sampleRate must be a number between 0 and 1, but was ${opts.sampleRate}.`
    );
  }
}

export function checkClientName(opts: Pick<TracingOpts, 'clientName'>) {
  if (!opts.clientName) {
    throw new Error('Missing config. clientName must be defined!');
  }
}

export function someModesEnabled(
  opts: Pick<TracingOpts, 'otel' | 'gcp' | 'console'>
) {
  return opts.otel?.enabled || opts.gcp?.enabled || opts.console?.enabled;
}
