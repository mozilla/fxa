/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export const EVENTS_TABLE = 'events';
export const NOTIFICATIONS_TABLE = 'notifications_sent';
export const SESSIONS_TABLE = 'sessions';
export const WATERMARKS_TABLE = 'sweep_watermarks';

export const SUBJECT_CHUNK_SIZE = 1_000;

export const MAX_TIMESTAMP_PAST_MS = 24 * 60 * 60 * 1000;
export const MAX_TIMESTAMP_FUTURE_MS = 5 * 60 * 1000;
export const MIN_DEDUPE_TTL_SECONDS =
  (MAX_TIMESTAMP_PAST_MS + MAX_TIMESTAMP_FUTURE_MS) / 1000;
