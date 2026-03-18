/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ErrorEvent } from '@sentry/core';

export type SentryConfigOpts = {
  /** The release name/version string passed to Sentry (e.g. a semver tag or git SHA). */
  release?: string;

  /** Fallback release identifier used when `release` is not provided. */
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

    /** When true, `buildSentryConfig` will throw a `SentryConfigurationBuildError` if any required fields are missing, rather than emitting a warning. */
    strict?: boolean;

    /** The tracing sample rate (0–1). Setting this above 0 also enables performance metrics capture. */
    tracesSampleRate?: number;

    /** Flag indicating that otel should not be setup. */
    skipOpenTelemetrySetup?: boolean;

    /** A function that determines the sample rate for a given event. Setting this will override tracesSampleRate. */
    tracesSampler?: (context: { name?: string }) => number;

    /** A list of errors to ignore. Can be strings, regexes, or functions that take an error and return a boolean. */
    ignoreErrors?: Array<string | RegExp>;
  };
};

/** Additional runtime options that extend the base Sentry configuration. */
export type ExtraOpts = {
  /**
   * A predicate called with each captured error. Return `true` to suppress the
   * error (prevent it from being sent to Sentry), or `undefined`/`false` to
   * allow it through.
   */
  ignoreErrors?: (error: any) => boolean | undefined;

  /** Additional Sentry integrations to register beyond the defaults. */
  integrations?: any[];

  /**
   * An ordered list of event-filter functions applied in `beforeSend`. Each
   * filter receives the current event and the Sentry hint, and must return the
   * (possibly mutated) event.
   */
  eventFilters?: Array<(event: ErrorEvent, hint: any) => ErrorEvent>;
};

/** Combined options accepted by `initSentry` functions across all platforms. */
export type InitSentryOpts = SentryConfigOpts & ExtraOpts;
