/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import GleanMetrics from '.';

export const GLEAN_FLUSH_TIMEOUT_MS = 500;

/**
 * Resolves once queued Glean pings are sent, or after a short bound, so a
 * navigation that unloads the page keeps its event without hanging on it.
 */
export const flushGlean = (): Promise<void> =>
  Promise.race([
    GleanMetrics.isDone(),
    new Promise<void>((resolve) => setTimeout(resolve, GLEAN_FLUSH_TIMEOUT_MS)),
  ]).catch(() => {});
