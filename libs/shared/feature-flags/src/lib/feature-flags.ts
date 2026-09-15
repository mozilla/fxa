/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type Flags = Record<string, boolean>;
export type FlagSource = () => Promise<Flags>;

export type FeatureFlagsInitOptions =
  | {
      /** Where flags come from. Polled; `ttlMs` comes from host config. */
      source: FlagSource;
      /** How long a fetched set is served before a background refresh. */
      ttlMs: number;
      /** Called when a refresh fails. The last good flags stay in place. */
      onError?: (err: unknown) => void;
    }
  | {
      /** Already-resolved flags, for the browser. Never refreshed. */
      flags: Record<string, boolean | undefined>;
    };

/**
 * Polls the auth server's flag endpoint.
 */
export function httpSource(
  authServerUrl: string,
  timeoutMs = 2000
): FlagSource {
  const url = `${authServerUrl.replace(/\/$/, '')}/v1/feature-flags`;
  return async () => {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) {
      throw new Error(`feature-flags: ${url} responded ${res.status}`);
    }
    return (await res.json()) as Flags;
  };
}

export function createFeatureFlags() {
  let flags: Flags = {};
  let source: FlagSource | undefined;
  let ttlMs = 0;
  let expiresAt = Infinity;
  let inflight: Promise<void> | null = null;
  let onError: (err: unknown) => void = () => {};

  async function refresh() {
    try {
      flags = await (source as FlagSource)();
    } catch (err) {
      onError(err);
    } finally {
      expiresAt = Date.now() + ttlMs;
      inflight = null;
    }
  }

  function refreshIfStale() {
    if (source && Date.now() >= expiresAt && !inflight) {
      inflight = refresh();
    }
  }

  return {
    /**
     * Primes the cache. Resolves once the first fetch settles, successfully
     * or not, so callers can boot without the auth server being reachable.
     */
    async init(opts: FeatureFlagsInitOptions): Promise<void> {
      if ('source' in opts) {
        source = opts.source;
        ttlMs = opts.ttlMs;
        onError = opts.onError ?? (() => {});
        flags = {};
        expiresAt = 0;
        refreshIfStale();
        await inflight;
        return;
      }
      source = undefined;
      flags = Object.fromEntries(
        Object.entries(opts.flags).filter(
          (entry): entry is [string, boolean] => typeof entry[1] === 'boolean'
        )
      );
      expiresAt = Infinity;
    },

    /** Whether the flag is on. Unknown flags are off. */
    get(name: string): boolean {
      refreshIfStale();
      return flags[name] === true;
    },

    /** Every known flag. Intended for injecting into a page, not for gating. */
    all(): Flags {
      refreshIfStale();
      return { ...flags };
    },
  };
}

export type FeatureFlags = ReturnType<typeof createFeatureFlags>;

export const featureFlags = createFeatureFlags();
