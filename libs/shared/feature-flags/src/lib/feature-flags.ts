/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Supplies the names of the currently enabled flags. A service with database
 * access can read them directly, which keeps this package free of database
 * dependencies.
 */
export type FeatureFlagLoader = () => Promise<string[]>;

let enabledFlags: Set<string> | null = null;

/**
 * Fetches the enabled flags and holds them for the life of the process or page.
 *
 * Values are never refreshed: a flag changing mid-session would flip the UI
 * underneath whoever is using it.
 */
export async function loadFeatureFlags(
  loader: FeatureFlagLoader
): Promise<void> {
  enabledFlags = new Set(await loader());
}

/**
 * Whether a flag is on.
 *
 * Returns false for an unknown flag, and for every flag before
 * {@link loadFeatureFlags} resolves or after it fails. Flags must therefore be
 * named for the behaviour they turn on, so that false is always the safe,
 * existing behaviour.
 */
export function featureFlag(name: string): boolean {
  return enabledFlags?.has(name) ?? false;
}

/**
 * Drops the loaded flags. Intended for tests.
 */
export function resetFeatureFlags(): void {
  enabledFlags = null;
}

/**
 * Reads the enabled flags over HTTP. The response is identical for every
 * caller and carries a public cache header, so repeat page loads can be served
 * without reaching the origin.
 */
export function createAuthServerLoader(
  authServerUrl: string
): FeatureFlagLoader {
  return async () => {
    const res = await fetch(`${authServerUrl}/v1/feature-flags`);
    if (!res.ok) {
      throw new Error(`Feature flag request failed with ${res.status}`);
    }
    const flags = await res.json();
    if (!Array.isArray(flags)) {
      throw new Error('Feature flag response was not an array');
    }
    return flags;
  };
}
