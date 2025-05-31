/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { SamplingContext } from '@sentry/core';

export type SentryConfigOpts = {
  /** Name of release */
  release?: string;

  /** Fall back for name of release */
  version?: string;

  /** Sentry specific settings */
  sentry?: {
    /** The datasource name. This value can be obtained from the sentry portal. */
    dsn?: string;
    /** The environment name. */
    env?: string;
    /** The rate (as percent between 0 and 1) at which errors are sampled. Can be reduced to decrease data volume. */
    sampleRate?: number;
    /** The name of the active client. */
    clientName?: string;
    /** The name of the active server. */
    serverName?: string;

    /** When set to true, building a configuration will throw an error critical fields are missing. */
    strict?: boolean;

    /** The tracing sample rate. Setting this above 0 will aso result in performance metrics being captured. */
    tracesSampleRate?: number;

    /** Call back to dynamically determine sampling rate. When defined, tracesSampleRate won't be used. */
    tracesSampler?: (context: SamplingContext) => number | boolean;
  };
};
