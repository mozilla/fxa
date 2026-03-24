/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/node';
import { config } from '../config';

const refreshInterval =
  config.get('registeredClients.refreshInterval') ?? 60_000;
let registeredClientIds: Set<string> | null = null;
let lastFetch = Date.now();

/**
 * Minimal interface for the OAuth database required by this module.
 * Only the `getAllClientIds` method is needed to populate the registered-client cache.
 */
export type OAuthDb = {
  mysql: {
    getAllClientIds: () => Promise<Array<{ id: Buffer }>>;
  };
};

/**
 * Returns the set of registered OAuth client IDs, refreshing from the database
 * at most once per `refreshInterval` milliseconds.
 *
 * Results are cached in module-level state to avoid a DB round-trip on every
 * request. If the database call fails, the previous successful set is returned
 * (or an empty set on the very first call) and the error is forwarded to Sentry.
 *
 * @param oauthDb - Database handle exposing `mysql.getAllClientIds`.
 * @returns A Set of lowercase hex-encoded client ID strings.
 */
export async function getRegisteredClientIds(oauthDb: OAuthDb) {
  // Refresh the cache on the initial call or after the configured interval
  // to avoid a DB round-trip on every request.
  if (Date.now() - lastFetch > refreshInterval || registeredClientIds == null) {
    // Record the fetch time before awaiting so concurrent callers don't
    // all trigger simultaneous refreshes.
    lastFetch = Date.now();

    // Validate clientId/service against registered OAuth clients to prevent
    // unbounded cardinality and normalize onto request.app for StatsD/Sentry tags.
    // Client IDs are loaded from the fxa_oauth.clients table on each request;
    // the table is small and MySQL serves it from cache.
    try {
      const clients = await oauthDb.mysql.getAllClientIds();
      registeredClientIds = new Set(clients.map((c) => c.id.toString('hex')));
    } catch (err) {
      Sentry.captureException(err);
    }
  }

  // Return the last successful set, or an empty set to guard against an initial failure.
  return registeredClientIds ?? new Set();
}

/**
 * Resets the in-memory cache so the next call to `getRegisteredClientIds`
 * triggers a fresh database fetch. Intended for use in tests.
 */
export async function reset() {
  registeredClientIds = null;
  lastFetch = Date.now();
}
