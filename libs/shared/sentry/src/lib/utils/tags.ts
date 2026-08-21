/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { tagFxaName } from './tagFxaName';

/**
 * The tags FxA applies to every Sentry event. Add a tag here before you set it
 * anywhere, so the team can filter on a known set instead of guessing at keys.
 */
export const SentryTags = {
  /** The FxA app or service that sent the event, e.g. 'fxa-settings'. Set by tagFxaName. */
  NAME: 'fxa.name',
  /** The side that sent the event: 'browser' or 'server'. */
  RUNTIME: 'fxa.runtime',
  /** True when the event carries an FxA errno, so an FxA API returned a handled error. */
  KNOWN_ERROR: 'fxa.known_error',
} as const;

export type SentryRuntime = 'browser' | 'server';

/** Applies the tags in SentryTags to an event. */
export function applyCommonTags(
  event: any,
  opts: { name?: string; runtime: SentryRuntime }
) {
  event = tagFxaName(event, opts.name);
  event.tags[SentryTags.RUNTIME] = opts.runtime;
  event.tags[SentryTags.KNOWN_ERROR] = Boolean(event.tags.errno);
  return event;
}
