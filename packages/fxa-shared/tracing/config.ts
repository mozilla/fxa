/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Options for configuring tracing.
 */
export type TracingOpts = {
  serviceName: string;
  sampleRate: number;
  console?: {
    enabled: boolean;
  };
  gcp?: {
    enabled: boolean;
    filterPii: boolean;
  };
  jaeger?: {
    enabled: boolean;
    filterPii: boolean;
  };
};

/** Default convict config for node tracing */
export const tracingConfig = {
  serviceName: {
    default: '',
    doc: 'The name service being traced.',
    env: 'TRACING_SERVICE_NAME',
    format: String,
  },
  sampleRate: {
    default: 0,
    doc: 'A number between 0 and 1 that indicates the rate at which to sample. 1 will capture all traces. .5 would capture half the traces, and 0 would capture no traces.',
    env: 'TRACING_SAMPLE_RATE',
  },
  console: {
    enabled: {
      default: false,
      doc: 'Trace report to the console',
      env: 'TRACING_CONSOLE_EXPORTER_ENABLED',
    },
  },
  jaeger: {
    enabled: {
      default: false,
      doc: 'Traces report to the jaeger. This is only applicable for local development.',
      env: 'TRACING_JAEGER_EXPORTER_ENABLED',
    },
    filterPii: {
      default: true,
      doc: 'Enables filtering PII in Jaeger traces.',
      env: 'TRACING_JAEGER_FILTER_PII',
    },
  },
  gcp: {
    enabled: {
      default: false,
      doc: 'Traces report to google cloud tracing. This should be turned on in the wild, but is discouraged for local development.',
      env: 'TRACING_GCP_EXPORTER_ENABLED',
    },
    filterPii: {
      default: true,
      doc: 'Enables filtering PII in GCP traces',
      env: 'TRACING_GCP_FILTER_PII',
    },
  },
};
