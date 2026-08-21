/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/browser';

/**
 * Sentry starts disabled and is only enabled once we know the user has not
 * opted out of metrics, which happens inside `App`. `App` cannot mount until
 * AppLocalizationProvider has resolved its bundles, so every bundle failure is
 * reported before Sentry will accept anything. Reports are therefore buffered
 * and flushed by `flushL10nErrorReports` once metrics are enabled — if the user
 * has opted out, the buffer is simply never flushed.
 */
export const MAX_L10N_ERROR_REPORTS = 10;

type L10nErrorReport = {
  error: Error;
  locale: string;
};

const reportedMessages = new Set<string>();
let pendingReports: Array<L10nErrorReport> = [];
let metricsEnabled = false;

function captureReport({ error, locale }: L10nErrorReport) {
  Sentry.captureException(error, {
    tags: { area: 'l10n' },
    extra: { locale },
  });
}

/**
 * Reports a failure to load a localization bundle. Individual missing string ids
 * are deliberately left to Fluent's console reporter — the signal worth alerting
 * on is "no strings resolved at all".
 *
 * One report is possible per locale per bundle, and switching languages remounts
 * the provider and refetches, so reports are deduped by message and capped for
 * the life of the page. A widespread manifest failure still means a handful of
 * events per session; tune the volume Sentry-side rather than here, so the first
 * report of a new failure is never the one that gets dropped.
 */
export function reportL10nError(error: Error) {
  if (
    reportedMessages.has(error.message) ||
    reportedMessages.size >= MAX_L10N_ERROR_REPORTS
  ) {
    return;
  }
  reportedMessages.add(error.message);

  // The locale is read now rather than at flush time, since a language switch
  // can happen in between.
  const report = { error, locale: document.documentElement.lang };

  if (metricsEnabled) {
    captureReport(report);
  } else {
    pendingReports.push(report);
  }
}

/**
 * Called once metrics are known to be enabled. Sends anything reported during
 * app startup and lets later reports through immediately.
 */
export function flushL10nErrorReports() {
  metricsEnabled = true;
  const queued = pendingReports;
  pendingReports = [];
  queued.forEach(captureReport);
}

// Exported for tests; the cap, dedup set and buffer are page-lifetime state.
export function resetL10nErrorReporter() {
  reportedMessages.clear();
  pendingReports = [];
  metricsEnabled = false;
}
