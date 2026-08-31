/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import GleanMetrics from '.';

/**
 * Longest a navigation waits for a just-recorded ping to flush.
 * `GleanMetrics.isDone()` polls an unbounded queue and never rejects, so on its
 * own it can hold a hand-off open indefinitely.
 */
export const PING_FLUSH_MS = 250;

/**
 * Run `navigate` once queued pings have flushed, or after `PING_FLUSH_MS`,
 * whichever comes first.
 *
 * `proceed` is re-checked at that moment rather than before the wait: the wait
 * is a window in which the world can change under the caller — an app taking
 * the foreground — and telemetry must never be the reason a navigation happens
 * that no longer should.
 */
export function flushPingsThen(
  navigate: () => void,
  proceed: () => boolean = () => true
): void {
  Promise.race([
    GleanMetrics.isDone(),
    new Promise((resolve) => setTimeout(resolve, PING_FLUSH_MS)),
  ]).then(() => {
    if (proceed()) {
      navigate();
    }
  });
}
