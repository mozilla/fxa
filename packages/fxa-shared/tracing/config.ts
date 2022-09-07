/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Options for configuring tracing.
 */
export type TracingOpts = {
  serviceName: string;
  console?: {
    enabled: boolean;
  };
  gcp?: {
    enabled: boolean;
  };
  jaeger?: {
    enabled: boolean;
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
  },
  gcp: {
    enabled: {
      default: false,
      doc: 'Traces report to google cloud tracing. This should be turned on in the wild, but is discouraged for local development.',
      env: 'TRACING_GCP_EXPORTER_ENABLED',
    },
  },
};
