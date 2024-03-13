/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { InvalidMetricError } from './metric-errors';
import * as Sentry from '@sentry/browser';

export const UTM_REGEX = /^[\w\/.%-]{1,128}$/;
export const DEVICE_ID_REGEX = /^[0-9a-f]{32}$|^none$/;
export const INVALID_UTM = 'invalid';
export const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;
export const NOT_REPORTED_VALUE = 'none';

/**
 * These are a subset of all known metrics. Validation on the post-metrics endpoint for the full set.
 * A the moment these are the metrics that are commonly incorrect.
 */
export type CheckMetricsNavigationTiming = {
  connectStart: number | string | undefined | null;
  connectEnd: number | string | undefined | null;
  domainLookupEnd: number | string | undefined | null;
  redirectStart: number | string | undefined | null;
};
export type CheckMetricsEvent = { type: string; offset: number };
export type CheckedMetrics = {
  deviceId: string | undefined | null;
  duration: number | string | undefined | null;
  navigationTiming: CheckMetricsNavigationTiming;
  events: Array<CheckMetricsEvent>;
  utm_campaign: string;
  utm_content: string;
  utm_medium: string;
  utm_source: string;
  utm_term: string;
};

/** A subtype of UtmMetrics */
export type CheckedUtmMetrics = Pick<
  CheckedMetrics,
  'utm_campaign' | 'utm_content' | 'utm_medium' | 'utm_source' | 'utm_term'
>;

/**
 * Handles tracking and report errors on raw metric data.
 */
export class MetricErrorReporter {
  private _critical = 0;
  private _captured = 0;

  /**
   * Returns a running total of errors counted and errors captured.
   * Note, that not all errors need to be captured, and that not all
   * errors need to be counted.
   */
  public get counts() {
    return {
      critical: this._critical,
      captured: this._captured,
    };
  }

  constructor(
    protected readonly sentry: Pick<Sentry.BrowserClient, 'captureException'>
  ) {}

  /**
   * Reports an error to sentry.
   * @param error - Error to report
   * @param capture - Flag indicating whether or not to count the error.
   *
   * Note: The error.critical and capture flags operate independently. There might be situations where
   * you want to report the error, but it is not critical... or vice versa.
   */
  public report(error: InvalidMetricError, capture: boolean = true) {
    if (error.critical) {
      this._critical++;
    }

    if (capture) {
      this._captured++;

      if (this.sentry) {
        Sentry.withScope((scope) => {
          scope.setContext('violation', {
            critical: error.critical,
            val: error.val,
            limitOrDefault: error.limitOrDefault,
          });
          scope.setTag('type', 'metrics');
          this.sentry.captureException(error);
        });
      }
    }
  }
}

/** Optional configuration for Metric Validator */
export type MetricValidatorOpts = {
  /** Maximum allowed time for an event offset in milliseconds. Generally defaults to 2 days. */
  maxEventOffset: number;
  /** Validates a utm_* query param */
  isUtmValid?: (val: string) => boolean;
  /** Validates a device id. */
  isDeviceIdValid?: (val: string) => boolean;
};

/** Checks and cleans metrics data. */
export class MetricValidator {
  protected readonly maxEventOffset = Number.MAX_SAFE_INTEGER;
  protected readonly isUtmValid = (x: string) => UTM_REGEX.test(x);
  protected readonly isDeviceIdValid = (x: string) => DEVICE_ID_REGEX.test(x);

  /**
   * Creates a new instance
   * @param errorReporter reports issues to sentry and tracks error counts
   * @param opts optional configuration
   */
  constructor(
    public readonly errorReporter: MetricErrorReporter,
    opts: MetricValidatorOpts
  ) {
    if (opts.maxEventOffset != null) {
      this.maxEventOffset = opts.maxEventOffset;
    }
    if (opts.isDeviceIdValid != null) {
      this.isUtmValid = opts.isDeviceIdValid;
    }
    if (opts.isUtmValid != null) {
      this.isUtmValid = opts.isUtmValid;
    }
  }

  /**
   * Ensures the device adheres to a hex string of length 32 or 'none'.
   *
   * Coercion of data will be reported but NOT counted as a critical error.
   */
  public sanitizeDeviceId(data: Pick<CheckedMetrics, 'deviceId'>) {
    if (this.isDeviceIdValid(data.deviceId || '')) {
      return;
    }

    data.deviceId = NOT_REPORTED_VALUE;

    // The device is not valid, let's try to figure out where this is coming from, by
    // capturing a sentry error which could uncover the call stack that resulted in
    // this state. We won't count this as critical, however, because the NOT_REPORTED_VALUE
    // won't be rejected by the API.
    this.errorReporter.report(
      new InvalidMetricError(
        'deviceId',
        'invalid value',
        false,
        data.deviceId,
        NOT_REPORTED_VALUE
      )
    );
  }

  /**
   * There are appear to be some issues with event data. This routine ensures
   * the event offset is a sane number [0, maxEventOffset], and that the event
   * types are valid string values.
   *
   * Coercion of data will be reported and counted as a critical error.
   */
  public sanitizeEvents(data: Pick<CheckedMetrics, 'events'>) {
    if (!Array.isArray(data.events)) {
      data.events = [];
    }

    for (const event of data.events) {
      // Truncate as soon as an invalid character is hit. There is a limited set of valid characters for event type;
      // however, the invoking code is sometimes a bit fast and loose with what gets provided here. e.g. Sometimes a
      // noisy error messages is provided. Looking at existing data, this approach should allow most scenarios to
      // result in a distinct event.type value, which is the desired end result.
      if (typeof event.type === 'string') {
        event.type = event.type.replace(/([\w\s.:-]*)(.*)/, '$1');
      }
    }
  }

  /**
   * Since RPs and client do not have full control over the UTM
   * params that could be passed to them, we need to sanitize those values
   * the best we can. This replaces and reports any invalid utm params which
   * allows us to still submit the metrics.
   *
   * Coercion of data will be reported but NOT counted as a critical error.
   */
  public sanitizeUtmParams(data: CheckedUtmMetrics) {
    const sanitize = (utmKey: keyof CheckedUtmMetrics) => {
      const val = data[utmKey];
      if (!this.isUtmValid(val)) {
        // Report the error so we can see the issue, but do not consider it critical.
        this.errorReporter.report(
          new InvalidMetricError(
            utmKey,
            'invalid utm value',
            false,
            val,
            INVALID_UTM
          )
        );

        // Override original UTM param with `invalid` value. This will allow us
        // to submit the metrics
        data[utmKey] = INVALID_UTM;
      }
    };

    sanitize('utm_campaign');
    sanitize('utm_content');
    sanitize('utm_medium');
    sanitize('utm_term');
    sanitize('utm_source');
  }
}
